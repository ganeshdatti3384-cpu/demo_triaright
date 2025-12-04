// CourseLearningInterface.tsx
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
  Play,
  CheckCircle,
  Clock,
  ArrowLeft,
  Home,
  FileText,
  GraduationCap,
  Award,
} from "lucide-react";

type Subtopic = {
  name: string;
  link?: string;
  duration?: number; // minutes
};

type Topic = {
  topicName: string;
  subtopics: Subtopic[];
  topicWatchedDuration?: number;
  topicTotalDuration?: number;
  examAttempted?: boolean;
  examScore?: number;
  passed?: boolean;
  completed?: boolean;
};

type CourseModel = {
  _id: string; // Mongo id
  courseId?: string; // CRS_001
  courseName: string;
  courseDescription?: string;
  curriculum: Topic[];
  totalDuration?: number;
  instructorName?: string;
  courseImageLink?: string;
  courseType?: string;
  hasFinalExam?: boolean;
};

type EnrollmentModel = {
  courseId: string; // Mongo id
  progress: any[]; // backend structure
  totalWatchedDuration: number;
  totalVideoDuration: number;
  videoProgressPercent?: number;
  finalExamEligible?: boolean;
  finalExamAttempted?: boolean;
  courseCompleted?: boolean;
  completedAt?: string;
  enrollmentDate?: string;
  accessExpiresAt?: string;
  isPaid?: boolean;
  amountPaid?: number;
};

type ExamQuestion = {
  _id: string;
  questionText: string;
  options: string[];
};

type ExamData = {
  examId: string;
  topicName?: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";
const HEARTBEAT_INTERVAL_MS = 10000; // 10s

const extractYouTubeId = (url?: string) => {
  if (!url) return null;
  try {
    const reg = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{10,})/;
    const m = url.match(reg);
    return m ? m[1] : null;
  } catch {
    return null;
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const CourseLearningInterface: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>(); // route id can be backend _id
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [backendCourseId, setBackendCourseId] = useState<string | null>(null); // ensure we use Mongo _id
  const [enrollment, setEnrollment] = useState<EnrollmentModel | null>(null);
  const [loading, setLoading] = useState(true);

  // player & playback
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  // exams
  const [showTopicExamModal, setShowTopicExamModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExam, setFinalExam] = useState<ExamData | null>(null);
  const [examTimer, setExamTimer] = useState<number>(0);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);

  // certificate
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  // --- fetch course and enrollment
  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      if (!routeId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/courses");
        return;
      }

      // GET course by id (backend expects Mongo _id)
      const courseResp = await axios.get(`${API_BASE_URL}/courses/${routeId}`);
      if (!courseResp.data?.course) {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/courses");
        return;
      }

      const fetchedCourse: CourseModel = courseResp.data.course;
      setCourse(fetchedCourse);
      setBackendCourseId(fetchedCourse._id);

      if (token) {
        try {
          // Fetch enrollment/progress. Notice route path from backend: /courses/enrollment/my-course-progress/:courseId
          const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/my-course-progress/${fetchedCourse._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (enrollResp.data?.data) {
            const d = enrollResp.data.data;
            // backend returns courseId (ObjectId) in data
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
              isPaid: d.isPaid,
              amountPaid: d.amountPaid,
            });
          } else {
            setEnrollment(null);
          }
        } catch (err) {
          console.log("Not enrolled or fetch error:", err);
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
    fetchCourseAndEnrollment();
    return () => {
      stopHeartbeat();
      destroyYTPlayer();
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, token]);

  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
    if (typeof enrollment.videoProgressPercent === "number") return Math.round(enrollment.videoProgressPercent);
    if (!enrollment.totalVideoDuration || enrollment.totalVideoDuration === 0) return 0;
    return Math.floor((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
  }, [enrollment]);

  // --- YouTube player helpers
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
      height: "360",
      width: "100%",
      videoId,
      playerVars: { rel: 0, modestbranding: 1, origin: window.location.origin },
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

  // --- Progress update logic (FIXED to use backendCourseId)
  const updateProgressInBackend = async () => {
    // require auth and backend course id and a playing subtopic
    if (!token || !backendCourseId || !playingSubtopic || !course) return;

    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];
    if (!topic || !sub) return;

    const watchedSeconds = getCurrentWatchedSeconds();
    const watchedMinutes = Math.ceil(watchedSeconds / 60);
    const totalMinutes = sub.duration || 1;
    const sendMinutes = Math.min(watchedMinutes, totalMinutes);

    try {
      // Note: backend expects watchedDuration (minutes). Use the backendCourseId (Mongo _id).
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

      // refresh enrollment to get updated server-side computed topicWatchedDuration / total
      await refreshEnrollment();
    } catch (err: any) {
      console.error("Progress update failed:", err.response?.data || err.message);
    }
  };

  const refreshEnrollment = async () => {
    if (!token || !backendCourseId) return;
    try {
      const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/my-course-progress/${backendCourseId}`, {
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
          isPaid: d.isPaid,
          amountPaid: d.amountPaid,
        });
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      console.error("Error refreshing enrollment:", err);
    }
  };

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
      await updateProgressInBackend();

      if (event.data === YT.PlayerState.ENDED) {
        // mark subtopic watched (send full duration)
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

  // When user clicks "Mark Complete" — send full subtopic duration to backend
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
      // send watchedDuration equal to full sub.duration (mark complete)
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
        // backend may return message even on success=false
        toast({ title: "Notice", description: resp.data?.message || "Marked as watched", variant: "default" });
      }
    } catch (err: any) {
      console.error("Failed to mark subtopic as watched:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update progress", variant: "destructive" });
    }
  };

  // --- Exam helpers
  const startExamTimer = (minutes: number) => {
    setExamTimer(minutes * 60);
    if (examTimerRef.current) clearInterval(examTimerRef.current);

    examTimerRef.current = setInterval(() => {
      setExamTimer((prev) => {
        if (prev <= 1) {
          if (examTimerRef.current) clearInterval(examTimerRef.current);
          // auto-submit: handled by modal submit handlers
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOpenTopicExam = async (topicName: string) => {
    if (!token) {
      toast({ title: "Login Required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }

    // client-side quick check: is topic completed?
    const topicProgress = enrollment?.progress?.find((t: any) => t.topicName === topicName);
    if (topicProgress) {
      const watched = topicProgress.topicWatchedDuration || 0;
      const total = topicProgress.topicTotalDuration || topicProgress.subtopics?.reduce((s: number, st: any) => s + (st.totalDuration || 0), 0);
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
      if (err.response?.data?.message?.includes("already attempted")) {
        toast({ title: "Exam Attempted", description: "You've already taken this exam", variant: "default" });
      } else if (err.response?.data?.message?.includes("Complete topic content")) {
        toast({ title: "Topic Incomplete", description: "Complete topic to unlock exam", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.response?.data?.message || "Failed to load exam", variant: "destructive" });
      }
      setShowTopicExamModal(false);
    }
  };

  const handleOpenFinalExam = async () => {
    if (!token) {
      toast({ title: "Login Required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!enrollment?.finalExamEligible) {
      toast({ title: "Not Eligible", description: "Complete and pass all topic exams", variant: "destructive" });
      return;
    }
    if (!backendCourseId) return;

    setShowFinalExamModal(true);
    setFinalExam(null);
    setAnswers({});
    try {
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/final/${backendCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.success && resp.data.exam) {
        setFinalExam(resp.data.exam);
        startExamTimer(resp.data.exam.timeLimit);
      } else {
        toast({ title: "No Final Exam", description: resp.data?.message || "No final exam available", variant: "default" });
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch final exam:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to load final exam", variant: "destructive" });
      setShowFinalExamModal(false);
    }
  };

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async (exam?: ExamData) => {
    if (!exam && !currentExam) return;
    if (!token || !backendCourseId) return;
    const examToSubmit = exam || currentExam!;
    try {
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/topic/validate`, {
        courseId: backendCourseId,
        topicName: examToSubmit.topicName,
        answers,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (resp.data?.success) {
        toast({ title: "Exam Submitted", description: `Score: ${resp.data.result.score}%`, variant: resp.data.result.passed ? "default" : "destructive" });
        await refreshEnrollment();
        setShowTopicExamModal(false);
      }
    } catch (err: any) {
      console.error("Submit topic exam error:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam && !currentExam) return;
    if (!token || !backendCourseId) return;
    try {
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/validate/final`, {
        courseId: backendCourseId,
        answers,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (resp.data?.success) {
        toast({ title: "Final Exam Submitted", description: `Score: ${resp.data.result.score}%`, variant: resp.data.result.passed ? "default" : "destructive" });
        await refreshEnrollment();
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      console.error("Submit final exam error:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    }
  };

  // --- Certificate
  const generateCertificate = async () => {
    if (!token || !backendCourseId) return;
    if (!enrollment?.courseCompleted) {
      toast({ title: "Not Completed", description: "Complete the course to generate certificate", variant: "destructive" });
      return;
    }

    const certificate = {
      studentName: user?.name || "Student",
      courseName: course?.courseName || "Course",
      instructorName: course?.instructorName || "Instructor",
      completionDate: enrollment.completedAt || new Date().toISOString(),
      certificateId: `CERT-${course?.courseId || backendCourseId}-${Date.now()}`,
    };

    setCertificateData(certificate);
    setShowCertificateModal(true);
    toast({ title: "Certificate Ready", description: "You can download or print it", variant: "default" });
  };

  const downloadCertificate = () => {
    if (!certificateData) return;
    const html = `
      <!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
      <style>body{font-family:Arial;text-align:center;padding:60px} .box{border:10px solid #f1c40f;padding:40px}</style>
      </head><body><div class="box"><h1>CERTIFICATE OF COMPLETION</h1>
      <p>This certifies that</p><h2>${certificateData.studentName}</h2>
      <p>has completed</p><h3>${certificateData.courseName}</h3>
      <p>on ${new Date(certificateData.completionDate).toLocaleDateString()}</p>
      <p>Certificate ID: ${certificateData.certificateId}</p></div></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  // --- small UI components
  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const topic = course?.curriculum?.[tIndex];
    const progressTopic = enrollment?.progress?.find((pt: any) => pt.topicName === topic?.topicName);
    const watched = progressTopic ? progressTopic.subtopics?.[sIndex]?.watchedDuration || 0 : 0;
    const total = progressTopic ? progressTopic.subtopics?.[sIndex]?.totalDuration || sub.duration || 0 : sub.duration || 0;
    const completed = watched >= total;
    const isPlaying = playingSubtopic?.topicIndex === tIndex && playingSubtopic?.subIndex === sIndex;

    return (
      <div className={`flex items-center justify-between gap-4 border-b py-3 px-2 ${completed ? "bg-green-50" : ""}`}>
        <div>
          <div className="font-medium flex items-center gap-2">
            {completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Play className="h-4 w-4 text-gray-400" />}
            {sub.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Duration: {total} min • Watched: {Math.min(watched, total)} min</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => openSubtopic(tIndex, sIndex)} variant={isPlaying ? "secondary" : "outline"}>
            {isPlaying ? "Playing" : "Play"}
          </Button>
          {!completed && <Button size="sm" onClick={() => markSubtopicWatched(tIndex, sIndex)} variant="ghost">Mark Complete</Button>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Course not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This course could not be found. It may have been removed.</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
                <Button variant="outline" onClick={() => navigate("/courses")}><Home className="h-4 w-4 mr-2" />Browse Courses</Button>
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
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
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
              {course.curriculum.map((topic, tIndex) => {
                const topicProgress = enrollment?.progress?.find((p: any) => p.topicName === topic.topicName);
                const topicWatched = topicProgress?.topicWatchedDuration || 0;
                const topicTotal = topicProgress?.topicTotalDuration || topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);
                const canAttemptExam = !!topicProgress && topicWatched >= topicTotal;
                const topicProgressPercent = topicTotal > 0 ? Math.round((topicWatched / topicTotal) * 100) : 0;

                return (
                  <div key={topic.topicName} className="border rounded-lg p-4 mb-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-lg">{topic.topicName}</div>
                        <div className="text-sm text-gray-500 mt-1">Topic progress: {topicProgressPercent}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleOpenTopicExam(topic.topicName)} disabled={!canAttemptExam}>Attempt Topic Exam</Button>
                      </div>
                    </div>

                    <div className="mt-2 border rounded">
                      {topic.subtopics.map((sub, sIndex) => (
                        <SubtopicRow key={sub.name} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                      ))}
                    </div>
                  </div>
                );
              })}
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
              {!currentVideoId && <div className="text-sm text-gray-500 mt-4">Select a lesson to play</div>}

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
              <div className="text-sm text-gray-600">Total Duration: {course.totalDuration || "—"} minutes</div>
              <div className="text-sm text-gray-600">Course Type: {course.courseType || "—"}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Topic Exam Modal */}
      {showTopicExamModal && currentExam && (
        <Dialog open={showTopicExamModal} onOpenChange={(open) => { if (!open) setShowTopicExamModal(false); }}>
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
                          <input type="radio" name={q._id} value={opt} onChange={() => handleAnswerChange(q._id, opt)} checked={answers[q._id] === opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => submitTopicExam(currentExam)}>Submit</Button>
                <Button variant="outline" onClick={() => setShowTopicExamModal(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Final Exam Modal */}
      {showFinalExamModal && finalExam && (
        <Dialog open={showFinalExamModal} onOpenChange={(open) => { if (!open) setShowFinalExamModal(false); }}>
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
                          <input type="radio" name={q._id} value={opt} onChange={() => handleAnswerChange(q._id, opt)} checked={answers[q._id] === opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={submitFinalExam}>Submit Final</Button>
                <Button variant="outline" onClick={() => setShowFinalExamModal(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && certificateData && (
        <Dialog open={showCertificateModal} onOpenChange={(open) => { if (!open) setShowCertificateModal(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold">{certificateData.courseName}</h3>
              <div className="mt-4">Student: {certificateData.studentName}</div>
              <div className="mt-2">Completed on: {new Date(certificateData.completionDate).toLocaleDateString()}</div>
              <div className="mt-4">
                <Button onClick={downloadCertificate}>Print / Download</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CourseLearningInterface;
