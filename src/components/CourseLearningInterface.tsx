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
  Award,
  FileText,
  GraduationCap,
  ArrowLeft,
  Home,
  Check,
  Eye,
  Youtube,
} from "lucide-react";

type Subtopic = {
  name: string;
  link?: string;
  duration?: number; // minutes
};

type Topic = {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
};

type CourseModel = {
  _id: string;
  courseId?: string;
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
};

type EnrollmentModel = {
  _id?: string;
  courseId: string;
  progress: Array<{
    topicName: string;
    subtopics: Array<{
      subTopicName: string;
      subTopicLink: string;
      watchedDuration: number;
      totalDuration: number;
    }>;
    topicWatchedDuration: number;
    topicTotalDuration: number;
    examAttempted: boolean;
    examScore: number;
    passed: boolean;
  }>;
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";
const HEARTBEAT_INTERVAL_MS = 10000; // 10 seconds

const extractYouTubeId = (url?: string) => {
  if (!url) return null;
  const reg =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{10,})/;
  const m = url.match(reg);
  return m ? m[1] : null;
};

const CourseLearningInterface: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentModel | null>(null);
  const [loading, setLoading] = useState(true);

  // playing location
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);

  // YouTube player refs & state
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  // exams
  const [showTopicExamModal, setShowTopicExamModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExam, setFinalExam] = useState<any | null>(null);

  // fetch course and enrollment
  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      if (!courseId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/student");
        return;
      }

      // Fetch course details
      const courseResp = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      if (courseResp.data && courseResp.data.course) {
        setCourse(courseResp.data.course);
      } else {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/student");
        return;
      }

      // Fetch enrollment if user is logged in
      if (token) {
        try {
          const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (enrollResp.data && enrollResp.data.data) {
            const d = enrollResp.data.data;
            setEnrollment({
              _id: d._id || "",
              courseId: d.courseId || courseId,
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
              courseName: d.courseName || courseResp.data.course?.courseName,
              courseImageLink: d.courseImageLink || courseResp.data.course?.courseImageLink,
              isPaid: d.isPaid,
              amountPaid: d.amountPaid
            });
          } else {
            setEnrollment(null);
          }
        } catch (err: any) {
          // if not enrolled or error, set null
          setEnrollment(null);
        }
      } else {
        setEnrollment(null);
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      toast({ title: "Error", description: "Failed to load course details", variant: "destructive" });
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndEnrollment();
    return () => {
      stopHeartbeat();
      destroyYTPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  // Calculate video progress percentage
  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
    if (typeof enrollment.videoProgressPercent === "number") return Math.round(enrollment.videoProgressPercent);
    if (!enrollment.totalVideoDuration || enrollment.totalVideoDuration === 0) return 0;
    return Math.floor((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
  }, [enrollment]);

  // Check if all videos are completed
  const allVideosCompleted = useMemo(() => {
    if (!enrollment || !enrollment.progress || enrollment.progress.length === 0) return false;
    
    return enrollment.progress.every(topic => 
      topic.subtopics.every(subtopic => 
        subtopic.watchedDuration >= subtopic.totalDuration
      )
    );
  }, [enrollment]);

  // Check if all topic exams are passed
  const allTopicExamsPassed = useMemo(() => {
    if (!enrollment || !enrollment.progress || enrollment.progress.length === 0) return false;
    
    return enrollment.progress.every(topic => topic.passed === true);
  }, [enrollment]);

  // YT player lifecycle
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
      // ignore
    } finally {
      ytPlayerRef.current = null;
      stopHeartbeat();
      setCurrentVideoId(null);
    }
  };

  // Heartbeat: send progress to backend every 10 seconds
  const startHeartbeat = (topicName: string, subName: string, subDurationMinutes?: number) => {
    stopHeartbeat();
    // immediate send once
    sendProgressToBackend(topicName, subName, getCurrentWatchedMinutes(subDurationMinutes));
    heartbeatRef.current = window.setInterval(() => {
      sendProgressToBackend(topicName, subName, getCurrentWatchedMinutes(subDurationMinutes));
    }, HEARTBEAT_INTERVAL_MS) as unknown as number;
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const getCurrentWatchedMinutes = (subDurationMinutes?: number) => {
    try {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const secs = Math.floor(ytPlayerRef.current.getCurrentTime());
        let minutes = Math.ceil(secs / 60);
        if (subDurationMinutes !== undefined && subDurationMinutes !== null) {
          minutes = Math.min(minutes, Math.ceil(subDurationMinutes));
        }
        return Math.max(0, minutes);
      }
    } catch (e) {
      // fallback
    }
    return 0;
  };

  // Send progress to backend
  const sendProgressToBackend = async (topicName: string, subTopicName: string, watchedMinutes: number) => {
    if (!token || !courseId) return;
    
    const payload = {
      courseId,
      topicName,
      subTopicName,
      watchedDuration: watchedMinutes,
    };

    try {
      await axios.post(`${API_BASE_URL}/courses/enrollments/updateTopicProgress`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh enrollment state
      await refreshEnrollment();
    } catch (err: any) {
      console.error("Progress heartbeat failed:", err?.response?.data || err.message || err);
    }
  };

  const refreshEnrollment = async () => {
    if (!token || !courseId) return;
    try {
      const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (enrollResp.data && enrollResp.data.data) {
        const d = enrollResp.data.data;
        setEnrollment((prev) => ({
          _id: d._id || prev?._id || "",
          courseId: d.courseId || courseId,
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
          courseName: d.courseName || course?.courseName,
          courseImageLink: d.courseImageLink || course?.courseImageLink,
          isPaid: d.isPaid,
          amountPaid: d.amountPaid
        }));
      }
    } catch (err) {
      // ignore refresh errors
    }
  };

  // When YT state changes
  const onYTStateChange = async (event: any) => {
    const YT = (window as any).YT;
    if (!YT) return;
    if (!playingSubtopic || !course) return;

    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];

    if (!topic || !sub) return;

    if (event.data === YT.PlayerState.PLAYING) {
      // start heartbeat
      startHeartbeat(topic.topicName, sub.name, sub.duration);
    } else if (event.data === YT.PlayerState.PAUSED) {
      // stop heartbeat and send one immediate update
      stopHeartbeat();
      const minutes = getCurrentWatchedMinutes(sub.duration);
      if (minutes > 0) await sendProgressToBackend(topic.topicName, sub.name, minutes);
    } else if (event.data === YT.PlayerState.ENDED) {
      // send final - mark as fully watched
      stopHeartbeat();
      const finalMinutes = sub.duration || Math.max(1, getCurrentWatchedMinutes(sub.duration));
      await sendProgressToBackend(topic.topicName, sub.name, finalMinutes);
    } else {
      // other states: do nothing
    }
  };

  // Open subtopic
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
      });
    } else {
      // no YT - destroy any existing YT player
      destroyYTPlayer();
    }
  };

  // Mark subtopic as watched
  const markSubtopicWatched = async (tIndex: number, sIndex: number) => {
    if (!token || !course || !enrollment) {
      toast({ title: "Error", description: "You must be enrolled to update progress", variant: "destructive" });
      return;
    }
    const topic = course.curriculum[tIndex];
    const sub = topic?.subtopics[sIndex];
    if (!topic || !sub) {
      toast({ title: "Error", description: "Subtopic not found", variant: "destructive" });
      return;
    }
    
    const payload = {
      courseId,
      topicName: topic.topicName,
      subTopicName: sub.name,
      watchedDuration: sub.duration || 1,
    };
    
    try {
      const resp = await axios.post(`${API_BASE_URL}/courses/enrollments/updateTopicProgress`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data && resp.data.success) {
        await refreshEnrollment();
        toast({ title: "Progress updated", description: "Subtopic marked as watched", variant: "default" });
      } else {
        toast({ title: "Error", description: resp.data?.message || "Failed to update progress", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Failed to update progress", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update progress", variant: "destructive" });
    }
  };

  // Get watched duration for a subtopic
  const getSubtopicWatchedDuration = (topicName: string, subTopicName: string): number => {
    if (!enrollment || !enrollment.progress) return 0;
    
    const topic = enrollment.progress.find(p => p.topicName === topicName);
    if (!topic || !topic.subtopics) return 0;
    
    const subtopic = topic.subtopics.find(s => s.subTopicName === subTopicName);
    return subtopic?.watchedDuration || 0;
  };

  // Check if subtopic is completed (watchedDuration >= totalDuration)
  const isSubtopicCompleted = (topicName: string, subTopicName: string): boolean => {
    if (!enrollment || !enrollment.progress) return false;
    
    const topic = enrollment.progress.find(p => p.topicName === topicName);
    if (!topic || !topic.subtopics) return false;
    
    const subtopic = topic.subtopics.find(s => s.subTopicName === subTopicName);
    if (!subtopic) return false;
    
    return subtopic.watchedDuration >= subtopic.totalDuration;
  };

  // Handle topic exam
  const handleOpenTopicExam = async (topicName: string) => {
    if (!token || !courseId) {
      toast({ title: "Login required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    
    // Check if all videos in this topic are completed
    const topic = enrollment?.progress.find(p => p.topicName === topicName);
    if (topic) {
      const allSubtopicsCompleted = topic.subtopics.every(sub => 
        sub.watchedDuration >= sub.totalDuration
      );
      
      if (!allSubtopicsCompleted) {
        toast({ 
          title: "Complete topic first", 
          description: "Please watch all videos in this topic before attempting the exam", 
          variant: "destructive" 
        });
        return;
      }
    }

    setShowTopicExamModal(true);
    setCurrentExam(null);
    setAnswers({});
    setExamResult(null);
    
    try {
      const encodedTopic = encodeURIComponent(topicName);
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/topic/${courseId}/${encodedTopic}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (resp.data && resp.data.exam) {
        setCurrentExam(resp.data.exam);
      } else if (resp.data) {
        setCurrentExam(resp.data);
      } else {
        toast({ title: "No exam", description: "No exam found for this topic", variant: "default" });
        setShowTopicExamModal(false);
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data?.result) {
        setExamResult(err.response.data.result);
        setShowTopicExamModal(true);
        toast({ title: "Exam already attempted", description: "Showing result", variant: "default" });
      } else {
        console.error("Failed to fetch topic exam", err);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch topic exam", variant: "destructive" });
        setShowTopicExamModal(false);
      }
    }
  };

  const handleTopicAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async () => {
    if (!currentExam || !token || !courseId) return;
    setSubmittingExam(true);
    try {
      const payload = {
        courseId,
        topicName: currentExam.topicName,
        answers,
      };
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/topic/validate`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        await refreshEnrollment();
        toast({ title: "Exam submitted", description: "Topic exam submitted successfully", variant: "default" });
      }
    } catch (err: any) {
      console.error("Topic exam submit failed", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    } finally {
      setSubmittingExam(false);
    }
  };

  // Handle final exam
  const handleOpenFinalExam = async () => {
    if (!token || !courseId) {
      toast({ title: "Login required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    
    // Check eligibility
    if (!enrollment?.finalExamEligible) {
      toast({ 
        title: "Not eligible", 
        description: "Complete all topic exams first", 
        variant: "destructive" 
      });
      return;
    }

    setShowFinalExamModal(true);
    setFinalExam(null);
    setAnswers({});
    setExamResult(null);
    
    try {
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/final/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data && resp.data.exam) {
        setFinalExam(resp.data.exam);
      } else if (resp.data) {
        setFinalExam(resp.data);
      } else {
        toast({ title: "No exam", description: "No final exam found for this course", variant: "default" });
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch final exam", variant: "destructive" });
      setShowFinalExamModal(false);
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam || !token || !courseId) return;
    setSubmittingExam(true);
    try {
      const payload = { courseId, answers };
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/validate/final`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        await refreshEnrollment();
        toast({ title: "Final exam submitted", description: "Final exam submitted successfully", variant: "default" });
      }
    } catch (err: any) {
      console.error("Final exam submit failed", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to submit final exam", variant: "destructive" });
    } finally {
      setSubmittingExam(false);
    }
  };

  // UI Subtopic row
  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const topic = course?.curriculum?.[tIndex];
    const watchedDuration = topic ? getSubtopicWatchedDuration(topic.topicName, sub.name) : 0;
    const totalDuration = sub.duration || 0;
    const isCompleted = topic ? isSubtopicCompleted(topic.topicName, sub.name) : false;
    const isThisPlaying = playingSubtopic && playingSubtopic.topicIndex === tIndex && playingSubtopic.subIndex === sIndex;

    return (
      <div className={`flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded ${isCompleted ? 'bg-green-50' : ''}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <BookOpen className="h-4 w-4 text-gray-400" />
            )}
            <div className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>{sub.name}</div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>Duration: {totalDuration} min • Watched: {Math.min(watchedDuration, totalDuration)} min</span>
            {isCompleted && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                Completed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isThisPlaying ? "secondary" : "outline"}
            onClick={() => openSubtopic(tIndex, sIndex)}
            className="flex items-center gap-1"
          >
            {sub.link && extractYouTubeId(sub.link) ? (
              <>
                <Youtube className="h-3 w-3" />
                {isThisPlaying ? "Playing" : "Play"}
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                View
              </>
            )}
          </Button>
          {!isCompleted && (
            <Button
              size="sm"
              onClick={() => markSubtopicWatched(tIndex, sIndex)}
              variant="ghost"
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Mark Watched
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
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
                <Button variant="outline" onClick={() => navigate("/student")}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-sm text-gray-600">Course Learning Interface</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Video Progress</div>
              <div className="text-xl font-bold text-blue-600">{videoProgressPercent}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player + curriculum */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                    <CardDescription className="mt-2">{course.courseDescription}</CardDescription>
                  </div>
                  <Badge variant={course.courseType === "paid" ? "default" : "secondary"}>
                    {course.courseType === "paid" ? "Paid Course" : "Free Course"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    {currentVideoId ? (
                      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                        <div ref={ytContainerRef} id="yt-player" className="w-full h-full" />
                      </div>
                    ) : playingSubtopic ? (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No playable video for this lesson</p>
                          <p className="text-sm mt-2">This lesson may be a document or external link</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Select a lesson to start learning</p>
                          <p className="text-sm mt-2">Click on any lesson below to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Video Progress</div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <Progress value={videoProgressPercent} />
                              </div>
                              <div className="text-sm font-medium">{videoProgressPercent}%</div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Total Duration</div>
                            <div className="text-lg font-medium">{course.totalDuration || 0} minutes</div>
                          </div>

                          <div>
                            {!enrollment ? (
                              <Button
                                onClick={() => {
                                  if (!token) {
                                    toast({ title: "Login required", description: "Please login to enroll", variant: "destructive" });
                                    navigate("/login");
                                    return;
                                  }
                                  navigate(`/course-enrollment/${courseId}`);
                                }}
                                className="w-full"
                                size="lg"
                              >
                                Enroll Now
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  if (!course.curriculum || course.curriculum.length === 0) return;
                                  // Find first unwatched subtopic or start from beginning
                                  let found = false;
                                  for (let tIndex = 0; tIndex < course.curriculum.length; tIndex++) {
                                    const topic = course.curriculum[tIndex];
                                    for (let sIndex = 0; sIndex < topic.subtopics.length; sIndex++) {
                                      const subtopic = topic.subtopics[sIndex];
                                      const watched = getSubtopicWatchedDuration(topic.topicName, subtopic.name);
                                      const total = subtopic.duration || 0;
                                      if (watched < total) {
                                        openSubtopic(tIndex, sIndex);
                                        found = true;
                                        break;
                                      }
                                    }
                                    if (found) break;
                                  }
                                  if (!found && course.curriculum.length > 0 && course.curriculum[0].subtopics.length > 0) {
                                    openSubtopic(0, 0);
                                  }
                                }}
                                className="w-full"
                                size="lg"
                              >
                                Continue Learning
                              </Button>
                            )}
                          </div>

                          {/* Final Exam Button - Only show when eligible */}
                          {enrollment?.finalExamEligible && !enrollment?.courseCompleted && (
                            <Button onClick={handleOpenFinalExam} variant="secondary" className="w-full">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Attempt Final Exam
                            </Button>
                          )}

                          {enrollment?.courseCompleted && (
                            <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-green-600" />
                                <div className="text-sm font-medium text-green-700">Course completed</div>
                              </div>
                              <div className="text-xs text-gray-600">
                                Completed on {new Date(enrollment.completedAt || "").toLocaleDateString()}
                              </div>
                              <Button
                                onClick={() => {
                                  const certLink = (enrollment as any).certificateLink;
                                  if (certLink) {
                                    window.open(certLink, "_blank");
                                    return;
                                  }
                                  toast({ title: "Certificate", description: "Certificate is generated by admin. Contact support if not available.", variant: "default" });
                                }}
                                variant="outline"
                                className="w-full border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Certificate
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>Complete all videos to unlock exams</CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((topic, tIndex) => {
                      const topicProgress = enrollment?.progress?.find((p: any) => p.topicName === topic.topicName);
                      const topicWatched = topicProgress?.topicWatchedDuration || 0;
                      const topicTotal =
                        topicProgress?.topicTotalDuration ||
                        topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);

                      // Check if all subtopics in this topic are completed
                      const allSubtopicsCompleted = topic.subtopics.every(sub => 
                        isSubtopicCompleted(topic.topicName, sub.name)
                      );

                      // Check if topic exam is already passed
                      const topicExamPassed = topicProgress?.passed || false;
                      
                      const topicProgressPercent = topicTotal > 0 ? Math.round((topicWatched / topicTotal) * 100) : 0;

                      return (
                        <div key={topic.topicName} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold text-lg">{topic.topicName}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {topic.subtopics.length} lessons • {topicTotal} minutes
                                {topicExamPassed && (
                                  <Badge className="ml-2 bg-green-100 text-green-800">Exam Passed</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{topicProgressPercent}%</div>
                              <div className="w-32">
                                <Progress value={topicProgressPercent} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {topic.subtopics.map((sub, sIndex) => (
                              <SubtopicRow key={`${sub.name}-${sIndex}`} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                            ))}
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              onClick={() => {
                                if (!enrollment) {
                                  navigate(`/course-enrollment/${courseId}`);
                                  return;
                                }
                                if (topic.subtopics && topic.subtopics.length > 0) {
                                  openSubtopic(tIndex, 0);
                                }
                              }}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Topic
                            </Button>

                            <Button
                              disabled={!allSubtopicsCompleted || topicExamPassed}
                              variant={allSubtopicsCompleted ? "secondary" : "outline"}
                              onClick={() => handleOpenTopicExam(topic.topicName)}
                              className="flex-1"
                            >
                              {topicExamPassed ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Exam Passed
                                </>
                              ) : allSubtopicsCompleted ? (
                                "Attempt Topic Exam"
                              ) : (
                                "Complete Videos First"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No curriculum available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar / Enrollment summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!enrollment ? (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      You are not enrolled in this course. Enroll now to start learning.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (!token) {
                            toast({ title: "Login required", description: "Please login to enroll", variant: "destructive" });
                            navigate("/login");
                            return;
                          }
                          navigate(`/course-enrollment/${courseId}`);
                        }}
                        className="flex-1"
                      >
                        Enroll Now
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/student")}>
                        Back to Dashboard
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Enrolled On</div>
                        <div className="font-medium">
                          {new Date(enrollment.enrollmentDate || Date.now()).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Video Progress</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={videoProgressPercent} />
                          </div>
                          <div className="text-sm font-medium">{videoProgressPercent}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Topics Passed</div>
                          <div className="text-lg font-medium">
                            {enrollment.progress.filter((p: any) => p.passed).length} / {enrollment.progress.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Final Exam</div>
                          <div className="text-lg font-medium">
                            {enrollment.finalExamEligible ? "Eligible" : "Not Eligible"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">Status Summary</div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>All Videos Completed:</span>
                            <span className={allVideosCompleted ? "text-green-600 font-medium" : ""}>
                              {allVideosCompleted ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>All Topic Exams Passed:</span>
                            <span className={allTopicExamsPassed ? "text-green-600 font-medium" : ""}>
                              {allTopicExamsPassed ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Final Exam Attempted:</span>
                            <span className={enrollment.finalExamAttempted ? "text-green-600 font-medium" : ""}>
                              {enrollment.finalExamAttempted ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Course Completed:</span>
                            <span className={enrollment.courseCompleted ? "text-green-600 font-medium" : ""}>
                              {enrollment.courseCompleted ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Access Expires:</span>
                            <span>
                              {enrollment.accessExpiresAt ? new Date(enrollment.accessExpiresAt).toLocaleDateString() : "Never"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Final Exam Button in Sidebar */}
                      {enrollment.finalExamEligible && !enrollment.courseCompleted && (
                        <Button onClick={handleOpenFinalExam} className="w-full bg-green-600 hover:bg-green-700">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Take Final Exam
                        </Button>
                      )}

                      {enrollment.courseCompleted && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <div className="font-medium text-green-700">Course Completed!</div>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            You have successfully completed this course.
                          </div>
                          <Button
                            variant="outline"
                            className="w-full border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => {
                              const certLink = (enrollment as any).certificateLink;
                              if (certLink) {
                                window.open(certLink, "_blank");
                              } else {
                                toast({ 
                                  title: "Certificate", 
                                  description: "Certificate will be issued by admin. Contact support for details.", 
                                  variant: "default" 
                                });
                              }
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Certificate
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            await fetchCourseAndEnrollment();
                            toast({ title: "Refreshed", description: "Course data refreshed", variant: "default" });
                          }}
                          className="flex-1"
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.stream && (
                  <div>
                    <div className="text-xs text-gray-500">Stream</div>
                    <div className="font-medium capitalize">{course.stream}</div>
                  </div>
                )}
                {course.courseType && (
                  <div>
                    <div className="text-xs text-gray-500">Type</div>
                    <div className="font-medium">{course.courseType === "paid" ? "Paid" : "Free"}</div>
                  </div>
                )}
                {course.price !== undefined && course.courseType === "paid" && (
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="font-medium">₹{course.price}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500">Total Lessons</div>
                  <div className="font-medium">{course.curriculum?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Topics</div>
                  <div className="font-medium">{course.curriculum?.length || 0}</div>
                </div>
                {course.hasFinalExam && (
                  <div>
                    <div className="text-xs text-gray-500">Final Exam</div>
                    <div className="font-medium text-green-600">Available</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Topic Exam Modal */}
      <Dialog open={showTopicExamModal} onOpenChange={setShowTopicExamModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Topic Exam</DialogTitle>
            <div className="text-sm text-gray-500">{currentExam?.topicName || currentExam?.examId}</div>
          </DialogHeader>

          <div className="space-y-4">
            {!currentExam && !examResult ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="font-semibold text-lg mb-2">Exam Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passed:</span>
                    <span className={`font-semibold ${examResult.passed ? "text-green-600" : "text-red-600"}`}>
                      {examResult.passed ? "Yes" : "No"}
                    </span>
                  </div>
                  {examResult.correctAnswers !== undefined && (
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-600">You can close this modal now. The results have been saved.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Time limit: {currentExam?.timeLimit} minutes • Passing score: {currentExam?.passingScore}%</div>

                <div className="space-y-6">
                  {currentExam.questions?.map((q: any, idx: number) => (
                    <div key={q._id || idx} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = q._id?.toString() || `q${idx}`;
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input type="radio" name={qid} checked={checked} onChange={() => handleTopicAnswerChange(qid, opt)} className="form-radio h-4 w-4 text-blue-600" />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowTopicExamModal(false)}>Cancel</Button>
                  <Button onClick={submitTopicExam} disabled={submittingExam || Object.keys(answers).length === 0}>
                    {submittingExam ? "Submitting..." : "Submit Exam"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Exam Modal */}
      <Dialog open={showFinalExamModal} onOpenChange={setShowFinalExamModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Final Exam</DialogTitle>
            <div className="text-sm text-gray-500">Final assessment for this course</div>
          </DialogHeader>

          <div className="space-y-4">
            {!finalExam && !examResult ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading final exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="font-semibold text-lg mb-2">Final Exam Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passed:</span>
                    <span className={`font-semibold ${examResult.passed ? "text-green-600" : "text-red-600"}`}>
                      {examResult.passed ? "Yes" : "No"}
                    </span>
                  </div>
                  {examResult.correctAnswers !== undefined && (
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                    </div>
                  )}
                  {examResult.attemptNumber && (
                    <div className="flex justify-between">
                      <span>Attempt Number:</span>
                      <span>{examResult.attemptNumber}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {examResult.passed ? "Congratulations! You passed the final exam." : "You did not pass this attempt."}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Time limit: {finalExam?.timeLimit} minutes • Passing score: {finalExam?.passingScore}%
                  {finalExam?.currentAttempt && <span> • Attempt: {finalExam.currentAttempt} of {finalExam.maxAttempts}</span>}
                </div>

                <div className="space-y-6">
                  {finalExam.questions?.map((q: any, idx: number) => (
                    <div key={q._id || idx} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = q._id?.toString() || `q${idx}`;
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input type="radio" name={qid} checked={checked} onChange={() => setAnswers(prev => ({ ...prev, [qid]: opt }))} className="form-radio h-4 w-4 text-blue-600" />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowFinalExamModal(false)}>Cancel</Button>
                  <Button onClick={submitFinalExam} disabled={submittingExam || Object.keys(answers).length === 0}>
                    {submittingExam ? "Submitting..." : "Submit Final Exam"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearningInterface;
