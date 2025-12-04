// Triaright_EduCareer/src/components/CourseLearningInterface.tsx
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
  Download,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Subtopic = {
  name: string;
  link?: string;
  duration?: number;
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
  instructorName?: string;
};

type EnrollmentModel = {
  _id?: string;
  courseId: string;
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
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  currentAttempt?: number;
  remainingAttempts?: number;
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
  const [currentExam, setCurrentExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExam, setFinalExam] = useState<ExamData | null>(null);
  
  // certificate
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [examTimer, setExamTimer] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);
  
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch course and enrollment from backend
  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      if (!courseId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/courses");
        return;
      }

      // Fetch course details
      const courseResp = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      if (courseResp.data && courseResp.data.course) {
        setCourse(courseResp.data.course);
      } else {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/courses");
        return;
      }

      // Fetch enrollment progress if user is logged in
      if (token) {
        try {
          const enrollResp = await axios.get(
            `${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (enrollResp.data?.data) {
            const d = enrollResp.data.data;
            setEnrollment({
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
              courseName: courseResp.data.course?.courseName,
              courseImageLink: courseResp.data.course?.courseImageLink,
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
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to load course details", 
        variant: "destructive" 
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndEnrollment();
    }
    return () => {
      stopHeartbeat();
      destroyYTPlayer();
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [courseId, token]);

  // Calculate progress from enrollment data
  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
    if (typeof enrollment.videoProgressPercent === "number") 
      return Math.round(enrollment.videoProgressPercent);
    if (!enrollment.totalVideoDuration || enrollment.totalVideoDuration === 0) 
      return 0;
    return Math.floor((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
  }, [enrollment]);

  // YouTube Player Management
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
        onReady: () => {
          startHeartbeat();
        },
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

  // Progress Tracking
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

  const updateProgressInBackend = async () => {
    if (!token || !courseId || !playingSubtopic || !course) return;
    
    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];
    
    if (!topic || !sub) return;

    const watchedSeconds = getCurrentWatchedSeconds();
    const watchedMinutes = Math.ceil(watchedSeconds / 60);
    const totalMinutes = sub.duration || 1;

    try {
      await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: topic.topicName,
          subTopicName: sub.name,
          watchedDuration: Math.min(watchedMinutes, totalMinutes),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Refresh enrollment data
      await refreshEnrollment();
    } catch (err: any) {
      console.error("Progress update failed:", err.response?.data || err.message);
    }
  };

  const refreshEnrollment = async () => {
    if (!token || !courseId) return;
    try {
      const enrollResp = await axios.get(
        `${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (enrollResp.data?.data) {
        const d = enrollResp.data.data;
        setEnrollment({
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

  const onYTStateChange = async (event: any) => {
    const YT = (window as any).YT;
    if (!YT || !playingSubtopic || !course) return;

    const tIndex = playingSubtopic.topicIndex;
    const sIndex = playingSubtopic.subIndex;
    const topic = course.curriculum?.[tIndex];
    const sub = topic?.subtopics?.[sIndex];

    if (!topic || !sub) return;

    if (event.data === YT.PlayerState.PLAYING) {
      // Start heartbeat for progress tracking
      startHeartbeat();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      // Send final update when paused or ended
      stopHeartbeat();
      await updateProgressInBackend();
      
      // If video ended, mark as complete
      if (event.data === YT.PlayerState.ENDED) {
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
        toast({
          title: "Video Error",
          description: "Failed to load video player",
          variant: "destructive",
        });
      });
    } else {
      destroyYTPlayer();
      toast({
        title: "No Video",
        description: "This lesson doesn't have a playable video",
        variant: "default",
      });
    }
  };

  const markSubtopicWatched = async (tIndex: number, sIndex: number) => {
    if (!token || !course || !enrollment) {
      toast({ 
        title: "Error", 
        description: "You must be enrolled to update progress", 
        variant: "destructive" 
      });
      return;
    }
    
    const topic = course.curriculum[tIndex];
    const sub = topic?.subtopics[sIndex];
    if (!topic || !sub) {
      toast({ 
        title: "Error", 
        description: "Subtopic not found", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: topic.topicName,
          subTopicName: sub.name,
          watchedDuration: sub.duration || 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resp.data?.success) {
        await refreshEnrollment();
        toast({ 
          title: "Progress Updated", 
          description: "Subtopic marked as completed", 
          variant: "default" 
        });
      }
    } catch (err: any) {
      console.error("Failed to mark subtopic as watched:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to update progress", 
        variant: "destructive" 
      });
    }
  };

  // Exam Functions
  const startExamTimer = (minutes: number) => {
    setExamTimer(minutes * 60); // Convert to seconds
    if (examTimerRef.current) clearInterval(examTimerRef.current);
    
    examTimerRef.current = setInterval(() => {
      setExamTimer(prev => {
        if (prev <= 1) {
          if (examTimerRef.current) clearInterval(examTimerRef.current);
          // Auto-submit when time runs out
          if (showTopicExamModal && currentExam) submitTopicExam();
          if (showFinalExamModal && finalExam) submitFinalExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenTopicExam = async (topicName: string) => {
    if (!token || !courseId) {
      toast({ 
        title: "Login Required", 
        description: "Please login to attempt exams", 
        variant: "destructive" 
      });
      navigate("/login");
      return;
    }
    
    setShowTopicExamModal(true);
    setCurrentExam(null);
    setAnswers({});
    setExamResult(null);
    setExamStarted(false);
    
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/courses/exams/topic/${courseId}/${encodeURIComponent(topicName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resp.data?.success && resp.data.exam) {
        setCurrentExam(resp.data.exam);
        setExamStarted(true);
        startExamTimer(resp.data.exam.timeLimit);
      } else {
        toast({ 
          title: "No Exam Available", 
          description: "This topic doesn't have an exam yet", 
          variant: "default" 
        });
        setShowTopicExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch topic exam:", err);
      
      if (err.response?.status === 400 && err.response.data?.message?.includes("already attempted")) {
        // Exam already attempted
        setExamResult(err.response.data);
        toast({ 
          title: "Exam Already Attempted", 
          description: "You've already taken this exam", 
          variant: "default" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: err.response?.data?.message || "Failed to load exam", 
          variant: "destructive" 
        });
        setShowTopicExamModal(false);
      }
    }
  };

  const handleTopicAnswerChange = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async () => {
    if (!currentExam || !token || !courseId || submittingExam) return;
    
    setSubmittingExam(true);
    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/topic/validate`,
        {
          courseId,
          topicName: currentExam.topicName,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resp.data?.success) {
        setExamResult(resp.data.result);
        await refreshEnrollment();
        toast({ 
          title: "Exam Submitted", 
          description: `Score: ${resp.data.result.score}% - ${resp.data.result.passed ? 'Passed' : 'Failed'}`, 
          variant: resp.data.result.passed ? "default" : "destructive" 
        });
      }
    } catch (err: any) {
      console.error("Failed to submit topic exam:", err);
      toast({ 
        title: "Submission Error", 
        description: err.response?.data?.message || "Failed to submit exam", 
        variant: "destructive" 
      });
    } finally {
      setSubmittingExam(false);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    }
  };

  const handleOpenFinalExam = async () => {
    if (!token || !courseId) {
      toast({ 
        title: "Login Required", 
        description: "Please login to attempt exams", 
        variant: "destructive" 
      });
      navigate("/login");
      return;
    }
    
    setShowFinalExamModal(true);
    setFinalExam(null);
    setAnswers({});
    setExamResult(null);
    setExamStarted(false);
    
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/courses/exams/final/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resp.data?.success && resp.data.exam) {
        setFinalExam(resp.data.exam);
        setExamStarted(true);
        startExamTimer(resp.data.exam.timeLimit);
      } else {
        toast({ 
          title: "No Final Exam", 
          description: "This course doesn't have a final exam", 
          variant: "default" 
        });
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch final exam:", err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to load final exam", 
        variant: "destructive" 
      });
      setShowFinalExamModal(false);
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam || !token || !courseId || submittingExam) return;
    
    setSubmittingExam(true);
    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/validate/final`,
        {
          courseId,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resp.data?.success) {
        setExamResult(resp.data.result);
        await refreshEnrollment();
        toast({ 
          title: "Final Exam Submitted", 
          description: `Score: ${resp.data.result.score}% - ${resp.data.result.passed ? 'Passed' : 'Failed'}`, 
          variant: resp.data.result.passed ? "default" : "destructive" 
        });
      }
    } catch (err: any) {
      console.error("Failed to submit final exam:", err);
      toast({ 
        title: "Submission Error", 
        description: err.response?.data?.message || "Failed to submit exam", 
        variant: "destructive" 
      });
    } finally {
      setSubmittingExam(false);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    }
  };

  // Certificate Functions
  const generateCertificate = async () => {
    if (!token || !courseId || !enrollment?.courseCompleted) return;
    
    try {
      // Generate certificate data
      const certificate = {
        studentName: user?.name || "Student",
        courseName: course?.courseName || "Course",
        instructorName: course?.instructorName || "Instructor",
        completionDate: enrollment.completedAt || new Date().toISOString(),
        certificateId: `CERT-${course?.courseId || 'COURSE'}-${Date.now()}`,
        score: "100%", // You might want to calculate this from exam results
      };
      
      setCertificateData(certificate);
      setShowCertificateModal(true);
      
      toast({
        title: "Certificate Generated",
        description: "Your course completion certificate is ready",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Certificate Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    }
  };

  const downloadCertificate = () => {
    if (!certificateData) return;
    
    // Create a printable certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .certificate { border: 20px solid gold; padding: 50px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          .student-name { font-size: 36px; color: #3498db; margin: 20px 0; }
          .course-name { font-size: 24px; color: #2c3e50; margin: 20px 0; }
          .completion-date { margin-top: 30px; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-around; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>CERTIFICATE OF COMPLETION</h1>
          <p>This certifies that</p>
          <div class="student-name">${certificateData.studentName}</div>
          <p>has successfully completed the course</p>
          <div class="course-name">${certificateData.courseName}</div>
          <p>on</p>
          <div class="completion-date">
            ${new Date(certificateData.completionDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div class="signatures">
            <div>
              <p>______________________</p>
              <p>${certificateData.instructorName}</p>
              <p>Instructor</p>
            </div>
            <div>
              <p>______________________</p>
              <p>Triaright Education</p>
              <p>Provider</p>
            </div>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Certificate ID: ${certificateData.certificateId}
          </p>
        </div>
      </body>
      </html>
    `;
    
    const win = window.open();
    win?.document.write(certificateHTML);
    win?.document.close();
    win?.print();
  };

  // UI Components
  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const topic = course?.curriculum?.[tIndex];
    const progressTopic = enrollment?.progress?.find((pt: any) => pt.topicName === topic?.topicName);
    const watched = progressTopic ? progressTopic.subtopics?.[sIndex]?.watchedDuration || 0 : 0;
    const total = progressTopic ? progressTopic.subtopics?.[sIndex]?.totalDuration || sub.duration || 0 : sub.duration || 0;
    const completed = watched >= total;

    const isThisPlaying = playingSubtopic?.topicIndex === tIndex && playingSubtopic?.subIndex === sIndex;

    return (
      <div className={`flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded ${completed ? 'bg-green-50' : ''}`}>
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {completed ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Play className="h-4 w-4 text-gray-400" />
            )}
            {sub.name}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>Duration: {total} min • Watched: {Math.min(watched, total)} min</span>
            {completed && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
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
            <Play className="h-3 w-3" />
            {isThisPlaying ? "Playing" : "Play"}
          </Button>
          {!completed && (
            <Button
              size="sm"
              onClick={() => markSubtopicWatched(tIndex, sIndex)}
              variant="ghost"
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/courses")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-sm text-gray-600">Course Learning Interface</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
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
                            <div className="text-sm font-medium text-gray-500 mb-1">Your Progress</div>
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
                                Start Learning
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  if (!course.curriculum || course.curriculum.length === 0) return;
                                  openSubtopic(0, 0);
                                }}
                                className="w-full"
                                size="lg"
                              >
                                Continue Learning
                              </Button>
                            )}
                          </div>

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
                                onClick={generateCertificate}
                                variant="outline"
                                className="w-full border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Get Certificate
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
                <CardDescription>Topics and lessons to complete</CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((topic, tIndex) => {
                      const topicProgress = enrollment?.progress?.find((p: any) => p.topicName === topic.topicName);
                      const topicWatched = topicProgress?.topicWatchedDuration || 0;
                      const topicTotal = topicProgress?.topicTotalDuration || 
                        topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);

                      const canAttemptExam = !!topicProgress && topicWatched >= topicTotal;
                      const topicProgressPercent = topicTotal > 0 ? Math.round((topicWatched / topicTotal) * 100) : 0;

                      return (
                        <div key={topic.topicName} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold text-lg">{topic.topicName}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {topic.subtopics.length} lessons • {topicTotal} minutes
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
                              disabled={!canAttemptExam || !!topicProgress?.examAttempted}
                              variant={canAttemptExam ? "secondary" : "outline"}
                              onClick={() => handleOpenTopicExam(topic.topicName)}
                              className="flex-1"
                            >
                              {topicProgress?.examAttempted ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Exam Completed
                                </>
                              ) : (
                                "Attempt Topic Exam"
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

          {/* Right: Enrollment status */}
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
                      <Button variant="outline" onClick={() => navigate("/courses")}>
                        Back to Courses
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
                        <div className="text-xs text-gray-500 mb-1">Course Progress</div>
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

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleOpenFinalExam} 
                          disabled={!enrollment.finalExamEligible || enrollment.courseCompleted} 
                          className="flex-1"
                        >
                          {enrollment.courseCompleted ? "Course Completed" : "Take Final Exam"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={refreshEnrollment}
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
                {course.instructorName && (
                  <div>
                    <div className="text-xs text-gray-500">Instructor</div>
                    <div className="font-medium">{course.instructorName}</div>
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
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Topic Exam</DialogTitle>
                <div className="text-sm text-gray-500">{currentExam?.topicName || currentExam?.examId}</div>
              </div>
              {examStarted && (
                <Badge variant="destructive" className="text-lg font-mono">
                  Time: {formatTime(examTimer)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {!currentExam && !examResult ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className={`text-center mb-4 ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResult.passed ? (
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  ) : (
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  )}
                  <h3 className="text-xl font-bold">{examResult.passed ? 'Exam Passed!' : 'Exam Not Passed'}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct Answers:</span>
                    <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span>{currentExam?.passingScore || 50}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Exam Eligibility:</span>
                    <span className={examResult.finalExamEligible ? "text-green-600 font-medium" : ""}>
                      {examResult.finalExamEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setShowTopicExamModal(false);
                      setExamResult(null);
                    }}
                  >
                    Close
                  </Button>
                  {examResult.finalExamEligible && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowTopicExamModal(false);
                        setExamResult(null);
                        handleOpenFinalExam();
                      }}
                    >
                      Take Final Exam
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Time limit: {currentExam?.timeLimit} minutes • Passing score: {currentExam?.passingScore}%
                </div>

                <div className="space-y-6">
                  {currentExam?.questions?.map((q, idx) => (
                    <div key={q._id} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      {q.description && (
                        <p className="text-sm text-gray-600 mb-3">{q.description}</p>
                      )}
                      <RadioGroup
                        value={answers[q._id] || ''}
                        onValueChange={(value) => handleTopicAnswerChange(q._id, value)}
                        className="space-y-2"
                      >
                        {q.options.map((option, oi) => (
                          <div key={oi} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q._id}-${oi}`} />
                            <Label htmlFor={`${q._id}-${oi}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowTopicExamModal(false)}>Cancel</Button>
                  <Button 
                    onClick={submitTopicExam} 
                    disabled={submittingExam || Object.keys(answers).length === 0}
                  >
                    {submittingExam ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Exam'}
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
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Final Exam</DialogTitle>
                <div className="text-sm text-gray-500">Final assessment for this course</div>
              </div>
              {examStarted && (
                <Badge variant="destructive" className="text-lg font-mono">
                  Time: {formatTime(examTimer)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {!finalExam && !examResult ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading final exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className={`text-center mb-4 ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {examResult.passed ? (
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  ) : (
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  )}
                  <h3 className="text-xl font-bold">{examResult.passed ? 'Final Exam Passed!' : 'Final Exam Not Passed'}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct Answers:</span>
                    <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span>{finalExam?.passingScore || 60}%</span>
                  </div>
                  {examResult.attemptNumber && (
                    <div className="flex justify-between">
                      <span>Attempt Number:</span>
                      <span>{examResult.attemptNumber}</span>
                    </div>
                  )}
                  {examResult.remainingAttempts !== undefined && (
                    <div className="flex justify-between">
                      <span>Remaining Attempts:</span>
                      <span>{examResult.remainingAttempts}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Course Completed:</span>
                    <span className={examResult.courseCompleted ? "text-green-600 font-medium" : ""}>
                      {examResult.courseCompleted ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setShowFinalExamModal(false);
                      setExamResult(null);
                      fetchCourseAndEnrollment();
                    }}
                  >
                    Close
                  </Button>
                  {examResult.passed && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowFinalExamModal(false);
                        setExamResult(null);
                        generateCertificate();
                      }}
                    >
                      Get Certificate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Time limit: {finalExam?.timeLimit} minutes • Passing score: {finalExam?.passingScore}%
                  {finalExam?.currentAttempt && (
                    <span> • Attempt: {finalExam.currentAttempt} of {finalExam.maxAttempts}</span>
                  )}
                </div>

                <div className="space-y-6">
                  {finalExam?.questions?.map((q, idx) => (
                    <div key={q._id} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      {q.description && (
                        <p className="text-sm text-gray-600 mb-3">{q.description}</p>
                      )}
                      <RadioGroup
                        value={answers[q._id] || ''}
                        onValueChange={(value) => setAnswers(prev => ({ ...prev, [q._id]: value }))}
                        className="space-y-2"
                      >
                        {q.options.map((option, oi) => (
                          <div key={oi} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q._id}-${oi}`} />
                            <Label htmlFor={`${q._id}-${oi}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowFinalExamModal(false)}>Cancel</Button>
                  <Button 
                    onClick={submitFinalExam} 
                    disabled={submittingExam || Object.keys(answers).length === 0}
                  >
                    {submittingExam ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Final Exam'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Modal */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate of Completion</DialogTitle>
          </DialogHeader>
          {certificateData && (
            <div className="border-8 border-yellow-500 p-8 text-center rounded-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                CERTIFICATE OF COMPLETION
              </h1>
              <p className="text-gray-600 mb-8">This certifies that</p>
              <h2 className="text-4xl font-bold text-blue-600 mb-8">
                {certificateData.studentName}
              </h2>
              <p className="text-gray-600 mb-8">has successfully completed the course</p>
              <h3 className="text-2xl font-semibold text-gray-800 mb-8">
                "{certificateData.courseName}"
              </h3>
              <p className="text-gray-600 mb-2">on</p>
              <p className="text-lg font-medium mb-12">
                {new Date(certificateData.completionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="flex justify-around mt-12">
                <div className="text-center">
                  <div className="border-t border-gray-400 w-32 mx-auto mb-2"></div>
                  <p className="font-medium">{certificateData.instructorName}</p>
                  <p className="text-sm text-gray-500">Instructor</p>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 w-32 mx-auto mb-2"></div>
                  <p className="font-medium">Triaright Education</p>
                  <p className="text-sm text-gray-500">Provider</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-8">
                Certificate ID: {certificateData.certificateId}
              </p>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Close
            </Button>
            <Button onClick={downloadCertificate}>
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearningInterface;
