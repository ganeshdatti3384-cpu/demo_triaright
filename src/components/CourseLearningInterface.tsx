import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  ArrowLeft,
  Home,
  Eye,
} from "lucide-react";

// ---------------------------
// Types
// ---------------------------

type Subtopic = {
  name: string;
  link?: string;
  duration?: number; // minutes
  watchedDuration?: number;
  totalDuration?: number;
  completed?: boolean;
};

type Topic = {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
  topicWatchedDuration?: number;
  topicTotalDuration?: number;
  examAttempted?: boolean;
  examScore?: number;
  passed?: boolean;
  completed?: boolean;
};

type CourseModel = {
  _id: string; // MongoDB id
  courseId?: string; // human readable course code CRS_001
  courseName: string;
  courseDescription?: string;
  curriculum: Topic[];
  demoVideoLink?: string;
  totalDuration?: number;
  courseImageLink?: string;
  price?: number;
  courseType?: string;
  stream?: string;
  hasFinalExam?: boolean;
  instructorName?: string;
};

type EnrollmentModel = {
  _id?: string;
  userId?: string;
  courseId: string; // MongoDB id
  progress: Topic[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  videoProgressPercent?: number;
  finalExamEligible?: boolean;
  finalExamAttempted?: boolean;
  courseCompleted?: boolean;
  completedAt?: string;
  enrollmentDate?: string;
  accessExpiresAt?: string;
  courseName?: string;
  courseImageLink?: string;
  isPaid?: boolean;
  amountPaid?: number;
};

type ExamQuestion = {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
  description?: string;
};

type ExamData = {
  examId: string;
  topicName?: string;
  timeLimit: number; // minutes
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  currentAttempt?: number;
  remainingAttempts?: number;
};

// ---------------------------
// Config
// ---------------------------

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";
const HEARTBEAT_INTERVAL_MS = 10000; // 10s

// ---------------------------
// Helpers
// ---------------------------

const extractYouTubeId = (url?: string) => {
  if (!url) return null;
  try {
    const reg = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{10,})/;
    const m = url.match(reg);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
};

// convert seconds to MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// ---------------------------
// Component
// ---------------------------

const CourseLearningInterface: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>(); // may be course._id or course.courseId depending on routing
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  // backendCourseId is the MongoDB _id returned by backend
  const [backendCourseId, setBackendCourseId] = useState<string | null>(null);

  const [enrollment, setEnrollment] = useState<EnrollmentModel | null>(null);
  const [loading, setLoading] = useState(true);

  // playback
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  // exams
  const [showTopicExamModal, setShowTopicExamModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExam, setFinalExam] = useState<ExamData | null>(null);
  const [examTimer, setExamTimer] = useState<number>(0);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);

  // certificate
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  // ---------------------------
  // Fetch course and enrollment
  // ---------------------------

  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      if (!routeId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/courses");
        return;
      }

      // First fetch course by routeId. The backend expects Mongo _id at GET /api/courses/:id
      const courseResp = await axios.get(`${API_BASE_URL}/courses/${routeId}`);

      if (!courseResp.data || !courseResp.data.course) {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/courses");
        return;
      }

      const fetchedCourse: CourseModel = courseResp.data.course;
      setCourse(fetchedCourse);

      // Save the backend (Mongo) course id to use for all subsequent requests
      setBackendCourseId(fetchedCourse._id);

      // If user logged in, fetch enrollment using backendCourseId (Mongo _id)
      if (token) {
        try {
          const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollments/my-course-progress/${fetchedCourse._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (enrollResp.data?.data) {
            const d = enrollResp.data.data;
            setEnrollment({
              courseId: d.courseId || fetchedCourse._id,
              progress: d.progress || [],
              totalWatchedDuration: d.totalWatchedDuration || 0,
              totalVideoDuration: d.totalVideoDuration || 0,
              videoProgressPercent: d.videoProgressPercent,
              finalExamEligible: d.finalExamEligible,
              finalExamAttempted: d.finalExamAttempted,
              courseCompleted: d.courseCompleted,
              completedAt: d.completedAt,
              enrollmentDate: d.enrollmentDate,
              accessExpiresAt: d.accessExpiresAt,
              courseName: fetchedCourse.courseName,
              courseImageLink: fetchedCourse.courseImageLink,
              isPaid: d.isPaid,
              amountPaid: d.amountPaid,
            });
          } else {
            setEnrollment(null);
          }
        } catch (err: any) {
          console.log("Not enrolled or error:", err.response?.data?.message || err.message);
          setEnrollment(null);
        }
      } else {
        setEnrollment(null);
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load course details", variant: "destructive" });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) fetchCourseAndEnrollment();
    return () => {
      stopHeartbeat();
      destroyYTPlayer();
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [routeId, token]);

  // ---------------------------
  // Derived values
  // ---------------------------

  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
    if (typeof enrollment.videoProgressPercent === "number") return Math.round(enrollment.videoProgressPercent);
    if (!enrollment.totalVideoDuration || enrollment.totalVideoDuration === 0) return 0;
    return Math.floor((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
  }, [enrollment]);

  // ---------------------------
  // YouTube player management
  // ---------------------------

  const loadYouTubeIframeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
        return;
      }
      const existing = document.getElementById("youtube-iframe-api");
      if (existing) {
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        return;
      }
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => resolve();
    });
  };

  const createYTPlayer = async (videoId: string) => {
    await loadYouTubeIframeAPI();
    destroyYTPlayer();

    if (!ytContainerRef.current) return;

    ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
      height: "390",
      width: "100%",
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => startHeartbeat(),
        onStateChange: (e: any) => onYTStateChange(e),
      },
    });
  };

  const destroyYTPlayer = () => {
    try {
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
    } catch (e) {
      console.error("Error destroying YT player:", e);
    } finally {
      ytPlayerRef.current = null;
      stopHeartbeat();
      setCurrentVideoId(null);
    }
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatRef.current = window.setInterval(() => {
      updateProgressInBackend();
    }, HEARTBEAT_INTERVAL_MS) as unknown as number;
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const getCurrentWatchedSeconds = () => {
    try {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        return Math.floor(ytPlayerRef.current.getCurrentTime());
      }
    } catch (e) {
      console.error("Error getting current time:", e);
    }
    return 0;
  };

  // ---------------------------
  // Progress update
  // ---------------------------

  const updateProgressInBackend = async () => {
    // ensure backendCourseId exists and user logged in and a subtopic is playing
    if (!token || !backendCourseId || !playingSubtopic || !course) return;

    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];
    if (!topic || !sub) return;

    // watched seconds -> minutes rounded up
    const watchedSeconds = getCurrentWatchedSeconds();
    const watchedMinutes = Math.ceil(watchedSeconds / 60);
    const totalMinutes = sub.duration || 1;
    const sendMinutes = Math.min(watchedMinutes, totalMinutes);

    try {
      await axios.post(
        `${API_BASE_URL}/courses/enrollments/update-topic-progress`,
        {
          courseId: backendCourseId,
          topicName: topic.topicName,
          subTopicName: sub.name,
          watchedDuration: sendMinutes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh enrollment to get latest progress
      await refreshEnrollment();
    } catch (err: any) {
      console.error("Progress update failed:", err.response?.data || err.message);
    }
  };

  const refreshEnrollment = async () => {
    if (!token || !backendCourseId) return;
    try {
      const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollments/my-course-progress/${backendCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (enrollResp.data?.data) {
        const d = enrollResp.data.data;
        setEnrollment({
          courseId: d.courseId || backendCourseId,
          progress: d.progress || [],
          totalWatchedDuration: d.totalWatchedDuration || 0,
          totalVideoDuration: d.totalVideoDuration || 0,
          videoProgressPercent: d.videoProgressPercent,
          finalExamEligible: d.finalExamEligible,
          finalExamAttempted: d.finalExamAttempted,
          courseCompleted: d.courseCompleted,
          completedAt: d.completedAt,
          enrollmentDate: d.enrollmentDate,
          accessExpiresAt: d.accessExpiresAt,
          courseName: course?.courseName,
          courseImageLink: course?.courseImageLink,
          isPaid: d.isPaid,
          amountPaid: d.amountPaid,
        });
      }
    } catch (err) {
      console.error("Error refreshing enrollment:", err);
    }
  };

  // ---------------------------
  // Player state change
  // ---------------------------

  const onYTStateChange = async (event: any) => {
    const YT = (window as any).YT;
    if (!YT || !playingSubtopic || !course) return;

    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];
    if (!topic || !sub) return;

    if (event.data === YT.PlayerState.PLAYING) {
      startHeartbeat();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      stopHeartbeat();
      // final update for this watch session
      await updateProgressInBackend();
      if (event.data === YT.PlayerState.ENDED) {
        // mark as watched (send full duration)
        await markSubtopicWatched(tIndex, sIndex);
      }
    }
  };

  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;
    const topic = course.curriculum[tIndex];
    if (!topic) return;
    const sub = topic.subtopics[sIndex];
    if (!sub) return;

    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });

    const videoId = extractYouTubeId(sub.link);
    if (videoId) {
      setCurrentVideoId(videoId);
      createYTPlayer(videoId).catch((e) => {
        console.error("YT player create error:", e);
        toast({ title: "Video Error", description: "Failed to load video player", variant: "destructive" });
      });
    } else {
      destroyYTPlayer();
      toast({ title: "No Video", description: "This lesson doesn't have a playable video", variant: "default" });
    }
  };

  const markSubtopicWatched = async (tIndex: number, sIndex: number) => {
    if (!token || !backendCourseId || !course) {
      toast({ title: "Error", description: "You must be enrolled to update progress", variant: "destructive" });
      return;
    }

    const topic = course.curriculum[tIndex];
    const sub = topic?.subtopics[sIndex];
    if (!topic || !sub) {
      toast({ title: "Error", description: "Subtopic not found", variant: "destructive" });
      return;
    }

    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/enrollments/update-topic-progress`,
        {
          courseId: backendCourseId,
          topicName: topic.topicName,
          subTopicName: sub.name,
          watchedDuration: sub.duration || 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data?.success) {
        await refreshEnrollment();
        toast({ title: "Progress Updated", description: "Subtopic marked as completed", variant: "default" });
      } else {
        // some backends return success false with message
        toast({ title: "Notice", description: resp.data?.message || "Marked as watched (response)", variant: "default" });
      }
    } catch (err: any) {
      console.error("Failed to mark subtopic as watched:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update progress", variant: "destructive" });
    }
  };

  // ---------------------------
  // Exam functions
  // ---------------------------

  const startExamTimer = (minutes: number) => {
    setExamTimer(minutes * 60);
    if (examTimerRef.current) clearInterval(examTimerRef.current);

    examTimerRef.current = setInterval(() => {
      setExamTimer((prev) => {
        if (prev <= 1) {
          if (examTimerRef.current) clearInterval(examTimerRef.current);
          // auto-submit
          if (showTopicExamModal && currentExam) submitTopicExam();
          if (showFinalExamModal && finalExam) submitFinalExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const handleOpenTopicExam = async (topicName: string) => {
    if (!token) {
      toast({ title: "Login Required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }

    // quick client-side check: is topic completed?
    const topicProgress = enrollment?.progress?.find((t) => t.topicName === topicName);
    if (topicProgress) {
      const watched = topicProgress.topicWatchedDuration || 0;
      const total = topicProgress.topicTotalDuration || 0;
      if (total > 0 && watched < total) {
        toast({ title: "Topic Incomplete", description: "Complete topic content before attempting exam", variant: "destructive" });
        return;
      }
    }

    if (!backendCourseId) {
      toast({ title: "Course Error", description: "Course id missing", variant: "destructive" });
      return;
    }

    setShowTopicExamModal(true);
    setCurrentExam(null);
    setAnswers({});
    setExamResult(null);

    try {
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/topic/${backendCourseId}/${encodeURIComponent(topicName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data?.success && resp.data.exam) {
        setCurrentExam(resp.data.exam);
        startExamTimer(resp.data.exam.timeLimit);
      } else {
        toast({ title: "No Exam", description: resp.data?.message || "This topic doesn't have an exam yet", variant: "default" });
        setShowTopicExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch topic exam:", err);
      if (err.response?.status === 400 && err.response.data?.message?.includes("already attempted")) {
        setExamResult(err.response.data);
        toast({ title: "Exam Already Attempted", description: "You've already taken this exam", variant: "default" });
      } else if (err.response?.data?.message?.includes("Complete topic content")) {
        toast({ title: "Topic Incomplete", description: "Complete topic to unlock exam", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.response?.data?.message || "Failed to load exam", variant: "destructive" });
      }
      setShowTopicExamModal(false);
    }
  };

  const handleTopicAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async () => {
    if (!currentExam || !token || !backendCourseId || submittingExam) return;
    setSubmittingExam(true);
    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/topic/validate`,
        {
          courseId: backendCourseId,
          topicName: currentExam.topicName,
          answers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data?.success) {
        setExamResult(resp.data.result);
        await refreshEnrollment();
        toast({ title: "Exam Submitted", description: `Score: ${resp.data.result.score}% - ${resp.data.result.passed ? "Passed" : "Failed"}`, variant: resp.data.result.passed ? "default" : "destructive" });
      }
    } catch (err: any) {
      console.error("Failed to submit topic exam:", err);
      toast({ title: "Submission Error", description: err.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    } finally {
      setSubmittingExam(false);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    }
  };

  const handleOpenFinalExam = async () => {
    if (!token) {
      toast({ title: "Login Required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!enrollment?.finalExamEligible) {
      toast({ title: "Not Eligible", description: "Complete and pass all topic exams to be eligible for final exam", variant: "destructive" });
      return;
    }

    setShowFinalExamModal(true);
    setFinalExam(null);
    setAnswers({});
    setExamResult(null);

    try {
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/final/${backendCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data?.success && resp.data.exam) {
        setFinalExam(resp.data.exam);
        startExamTimer(resp.data.exam.timeLimit);
      } else {
        toast({ title: "No Final Exam", description: resp.data?.message || "This course doesn't have a final exam", variant: "default" });
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch final exam:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load final exam", variant: "destructive" });
      setShowFinalExamModal(false);
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam || !token || !backendCourseId || submittingExam) return;
    setSubmittingExam(true);
    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/validate/final`,
        {
          courseId: backendCourseId,
          answers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data?.success) {
        setExamResult(resp.data.result);
        await refreshEnrollment();
        toast({ title: "Final Exam Submitted", description: `Score: ${resp.data.result.score}% - ${resp.data.result.passed ? "Passed" : "Failed"}`, variant: resp.data.result.passed ? "default" : "destructive" });
      }
    } catch (err: any) {
      console.error("Failed to submit final exam:", err);
      toast({ title: "Submission Error", description: err.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    } finally {
      setSubmittingExam(false);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    }
  };

  // ---------------------------
  // Certificate
  // ---------------------------

  const generateCertificate = async () => {
    if (!token || !backendCourseId) return;
    if (!enrollment?.courseCompleted) {
      toast({ title: "Not Completed", description: "Complete the course to generate certificate", variant: "destructive" });
      return;
    }

    // We create a client-side printable certificate, but backend state must reflect completion
    const certificate = {
      studentName: user?.name || "Student",
      courseName: course?.courseName || "Course",
      instructorName: course?.instructorName || "Instructor",
      completionDate: enrollment.completedAt || new Date().toISOString(),
      certificateId: `CERT-${course?.courseId || backendCourseId}-${Date.now()}`,
      score: examResult?.score ? `${examResult.score}%` : "N/A",
    };

    setCertificateData(certificate);
    setShowCertificateModal(true);
    toast({ title: "Certificate Generated", description: "Your course completion certificate is ready", variant: "default" });
  };

  const downloadCertificate = () => {
    if (!certificateData) return;
    const certificateHTML = `<!DOCTYPE html><html><head><title>Certificate</title><style>body{font-family:Arial;text-align:center;padding:50px} .certificate{border:12px solid gold;padding:40px;max-width:900px;margin:0 auto} h1{color:#333} .student{font-size:32px;color:#2b6cb0;margin:20px 0}</style></head><body><div class="certificate"><h1>CERTIFICATE OF COMPLETION</h1><p>This certifies that</p><div class="student">${certificateData.studentName}</div><p>has successfully completed the course</p><div class="course">${certificateData.courseName}</div><p>on</p><div>${new Date(certificateData.completionDate).toLocaleDateString()}</div><p style="margin-top:30px">Certificate ID: ${certificateData.certificateId}</p></div></body></html>`;

    const win = window.open("", "_blank");
    win?.document.write(certificateHTML);
    win?.document.close();
    win?.print();
  };

  // ---------------------------
  // UI subcomponents
  // ---------------------------

  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const topic = course?.curriculum?.[tIndex];
    const progressTopic = enrollment?.progress?.find((pt: any) => pt.topicName === topic?.topicName);
    const watched = progressTopic ? progressTopic.subtopics?.[sIndex]?.watchedDuration || 0 : 0;
    const total = progressTopic ? progressTopic.subtopics?.[sIndex]?.totalDuration || sub.duration || 0 : sub.duration || 0;
    const completed = watched >= total;
    const isThisPlaying = playingSubtopic?.topicIndex === tIndex && playingSubtopic?.subIndex === sIndex;

    return (
      <div className={`flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded ${completed ? "bg-green-50" : ""}`}>
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Play className="h-4 w-4 text-gray-400" />}
            {sub.name}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>Duration: {total} min • Watched: {Math.min(watched, total)} min</span>
            {completed && (<Badge variant="outline" className="text-xs text-green-600 border-green-200">Completed</Badge>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={isThisPlaying ? "secondary" : "outline"} onClick={() => openSubtopic(tIndex, sIndex)} className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            {isThisPlaying ? "Playing" : "Play"}
          </Button>
          {!completed && (
            <Button size="sm" onClick={() => markSubtopicWatched(tIndex, sIndex)} variant="ghost" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------
  // Render
  // ---------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Course not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This course could not be found. It may have been removed.</p>
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
                <Button variant="outline" onClick={() => navigate("/courses")}>
                  <Home className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{course.courseName}</h2>
          <p className="text-sm text-gray-600">{course.courseDescription}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-gray-600">Progress</div>
          <div style={{ width: 140 }}>
            <Progress value={videoProgressPercent} />
            <div className="text-xs text-gray-500 text-center">{videoProgressPercent}%</div>
          </div>
          <Button onClick={generateCertificate} disabled={!enrollment?.courseCompleted}>Generate Cert</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>Click a lesson to play</CardDescription>
            </CardHeader>
            <CardContent>
              {course.curriculum.map((topic, tIndex) => (
                <div key={topic.topicName} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{topic.topicName}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleOpenTopicExam(topic.topicName)}>Attempt Topic Exam</Button>
                    </div>
                  </div>

                  <div className="mt-2 border rounded">
                    {topic.subtopics.map((sub, sIndex) => (
                      <SubtopicRow key={sub.name} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Player</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={ytContainerRef} />
              {!currentVideoId && (
                <div className="text-sm text-gray-500 mt-4">Select a lesson to play</div>
              )}

              <div className="mt-4">
                <div className="text-xs text-gray-500">Enrollment</div>
                <div className="text-sm mt-1">{enrollment ? `Enrolled on ${new Date(enrollment.enrollmentDate || Date.now()).toLocaleDateString()}` : "Not enrolled"}</div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Final Exam</div>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={handleOpenFinalExam} disabled={!enrollment?.finalExamEligible}>Open Final Exam</Button>
                    <Button variant="outline" onClick={refreshEnrollment}>Refresh</Button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Certificate</div>
                  <div className="mt-2">
                    <Button onClick={() => { if (enrollment?.courseCompleted) downloadCertificate(); else toast({ title: "Not Ready", description: "No certificate to download" }); }} disabled={!enrollment?.courseCompleted}>Download</Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Instructor: {course.instructorName || "—"}</div>
              <div className="text-sm text-gray-600">Total Duration: {course.totalDuration || "—"} mins</div>
              <div className="text-sm text-gray-600">Course Type: {course.courseType || "—"}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Topic Exam Modal (simplified) */}
      {showTopicExamModal && currentExam && (
        <Dialog open={showTopicExamModal} onOpenChange={(open) => { if (!open) { setShowTopicExamModal(false); if (examTimerRef.current) clearInterval(examTimerRef.current); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentExam.topicName || "Topic Exam"}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>Time left: {formatTime(examTimer)}</div>
                <div>Questions: {currentExam.totalQuestions}</div>
              </div>

              <div className="mt-4 space-y-4">
                {currentExam.questions.map((q) => (
                  <div key={q._id} className="border rounded p-3">
                    <div className="font-medium">{q.questionText}</div>
                    <div className="mt-2 flex flex-col gap-2">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                          <input type="radio" name={q._id} value={opt} onChange={() => handleTopicAnswerChange(q._id, opt)} checked={answers[q._id] === opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={submitTopicExam} disabled={submittingExam}>Submit</Button>
                <Button variant="outline" onClick={() => { setShowTopicExamModal(false); if (examTimerRef.current) clearInterval(examTimerRef.current); }}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Final Exam Modal (simplified) */}
      {showFinalExamModal && finalExam && (
        <Dialog open={showFinalExamModal} onOpenChange={(open) => { if (!open) { setShowFinalExamModal(false); if (examTimerRef.current) clearInterval(examTimerRef.current); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Final Exam</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>Time left: {formatTime(examTimer)}</div>
                <div>Questions: {finalExam.totalQuestions}</div>
              </div>

              <div className="mt-4 space-y-4">
                {finalExam.questions.map((q) => (
                  <div key={q._id} className="border rounded p-3">
                    <div className="font-medium">{q.questionText}</div>
                    <div className="mt-2 flex flex-col gap-2">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                          <input type="radio" name={q._id} value={opt} onChange={() => handleTopicAnswerChange(q._id, opt)} checked={answers[q._id] === opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={submitFinalExam} disabled={submittingExam}>Submit Final</Button>
                <Button variant="outline" onClick={() => { setShowFinalExamModal(false); if (examTimerRef.current) clearInterval(examTimerRef.current); }}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Certificate Modal (simplified) */}
      {showCertificateModal && certificateData && (
        <Dialog open={showCertificateModal} onOpenChange={(open) => { if (!open) setShowCertificateModal(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{certificateData.courseName}</h3>
                <div className="mt-4">Student: {certificateData.studentName}</div>
                <div className="mt-2">Completed on: {new Date(certificateData.completionDate).toLocaleDateString()}</div>
                <div className="mt-4">
                  <Button onClick={downloadCertificate}>Print / Download</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default CourseLearningInterface;
