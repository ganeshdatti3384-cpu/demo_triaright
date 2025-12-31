// Triaright_EduCareer/src/components/CourseLearningInterface.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Play,
  ArrowLeft,
  Home,
  CheckCircle,
  Circle,
  FileText,
  Award,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

type SubtopicFromCourse = {
  name: string;
  link?: string;
  duration?: number;
};

type TopicFromCourse = {
  topicName: string;
  subtopics: SubtopicFromCourse[];
};

type CourseModel = {
  _id: string;
  courseId?: string;
  courseName: string;
  courseDescription?: string;
  curriculum: TopicFromCourse[];
  demoVideoLink?: string;
  totalDuration?: number;
  courseImageLink?: string;
  price?: number;
  courseType?: string;
  stream?: string;
  instructorName?: string;
};

// Progress types matching backend - UPDATED based on backend response
type SubtopicProgress = {
  subTopicName: string;
  subTopicLink: string;
  isCompleted: boolean;
};

type TopicProgress = {
  topicName: string;
  subtopics: SubtopicProgress[];
  isCompleted: boolean;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
  examDate?: string;
};

type EnrollmentProgress = {
  _id: string;
  userId: string;
  courseId: string;
  progress: TopicProgress[];
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  courseCompletionPercentage: number;
  isCourseCompleted: boolean;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  // These fields might not be in the getMyCourseProgress response
  finalExamScore?: number;
  finalExamPassed?: boolean;
  finalExamDate?: string;
  certificateEligible?: boolean;
  courseCompletedAt?: string;
  finalExamPassedAt?: string;
  enrollmentDate?: string;
  isPaid?: boolean;
  amountPaid?: number;
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

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
  const location = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetchingEnrollment, setFetchingEnrollment] = useState(false);
  const [updatingSubtopic, setUpdatingSubtopic] = useState<string | null>(null);
  const [examResults, setExamResults] = useState<any>(null);

  // Exam result modal state
  const [showExamResult, setShowExamResult] = useState<{
    type: 'topic' | 'final';
    result: any;
    topicName?: string;
  } | null>(null);

  // playing location (indexes)
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);

  // YouTube player refs & state
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Fetch course from backend
  const fetchCourse = async () => {
    setLoading(true);
    try {
      if (!courseId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/courses");
        return;
      }

      const courseResp = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      if (courseResp.data && courseResp.data.course) {
        setCourse(courseResp.data.course);
      } else {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/courses");
        return;
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load course details",
        variant: "destructive",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollment progress
  const fetchEnrollmentProgress = async (courseId: string) => {
    if (!token) {
      setIsEnrolled(false);
      return;
    }
    
    setFetchingEnrollment(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const enrollmentData = response.data.data;
        console.log("Enrollment data fetched:", enrollmentData);
        setEnrollment(enrollmentData);
        setIsEnrolled(true);
      }
    } catch (err: any) {
      console.error("Failed to fetch enrollment progress:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
      } else if (err.response?.status === 404) {
        setIsEnrolled(false);
      } else {
        console.log("Enrollment fetch error:", err.response?.data?.message);
      }
      setIsEnrolled(false);
    } finally {
      setFetchingEnrollment(false);
    }
  };

  // Fetch exam results separately - CRITICAL: Get actual exam results from exams endpoint
  const fetchExamResults = async () => {
    if (!courseId || !token) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/status/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        console.log("Exam results fetched:", response.data.examStatus);
        setExamResults(response.data.examStatus);
      }
    } catch (error) {
      console.error("Failed to fetch exam results:", error);
    }
  };

  // Mark subtopic as complete/incomplete
  const markSubtopicComplete = async (topicName: string, subTopicName: string, isCompleted: boolean) => {
    if (!courseId || !enrollment || !token) return;
    
    const updateKey = `${topicName}-${subTopicName}`;
    setUpdatingSubtopic(updateKey);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName,
          subTopicName,
          isCompleted,
          updateType: "subtopic"
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedEnrollment = { ...enrollment };
        
        const topicIndex = updatedEnrollment.progress.findIndex(t => t.topicName === topicName);
        if (topicIndex !== -1) {
          const subtopicIndex = updatedEnrollment.progress[topicIndex].subtopics.findIndex(
            st => st.subTopicName === subTopicName
          );
          if (subtopicIndex !== -1) {
            updatedEnrollment.progress[topicIndex].subtopics[subtopicIndex].isCompleted = isCompleted;
            
            const allCompleted = updatedEnrollment.progress[topicIndex].subtopics.every(st => st.isCompleted);
            updatedEnrollment.progress[topicIndex].isCompleted = allCompleted;
          }
        }

        if (response.data.completionStats) {
          updatedEnrollment.completedSubtopics = response.data.completionStats.completedSubtopics;
          updatedEnrollment.completedTopics = response.data.completionStats.completedTopics;
          updatedEnrollment.courseCompletionPercentage = response.data.completionStats.courseCompletionPercentage;
          updatedEnrollment.isCourseCompleted = response.data.completionStats.isCourseCompleted;
          updatedEnrollment.finalExamEligible = response.data.completionStats.isCourseCompleted;
        }

        setEnrollment(updatedEnrollment);
        
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error("Failed to update subtopic progress:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setUpdatingSubtopic(null);
    }
  };

  // Get completion status for a subtopic
  const getSubtopicStatus = (topicName: string, subtopicName: string): boolean => {
    if (!enrollment) return false;
    
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    
    const subtopic = topic.subtopics.find(st => st.subTopicName === subtopicName);
    return subtopic?.isCompleted || false;
  };

  // Check if all subtopics in a topic are completed
  const areAllSubtopicsCompleted = (topicName: string): boolean => {
    if (!enrollment) return false;
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    
    return topic.subtopics.every(st => st.isCompleted);
  };

  // Check if topic exam is passed
  const isTopicExamPassed = (topicName: string): boolean => {
    if (!enrollment) return false;
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    
    return topic.passed || false;
  };

  // Check if all topic exams are passed
  const areAllTopicExamsPassed = (): boolean => {
    if (!enrollment || !enrollment.progress || enrollment.progress.length === 0) return false;
    
    return enrollment.progress.every(topic => topic.passed === true);
  };

  // Get completed subtopics count in a topic
  const getCompletedSubtopicsCount = (topicName: string): number => {
    if (!enrollment) return 0;
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return 0;
    
    return topic.subtopics.filter(st => st.isCompleted).length;
  };

  // Get topic progress details
  const getTopicProgressDetails = (topicName: string) => {
    if (!enrollment) return null;
    return enrollment.progress.find(t => t.topicName === topicName);
  };

  // Navigate to topic exam
  const navigateToTopicExam = (topicName: string) => {
    if (!courseId) return;
    navigate(`/ap-internship-exam/${courseId}/${encodeURIComponent(topicName)}`);
  };

  // Navigate to final exam - FIXED PATH
  const navigateToFinalExam = () => {
    if (!courseId) return;
    navigate(`/ap-internship-final-exam/${courseId}`);
  };

  // Navigate to certificate - FIXED PATH to use the correct route
  const navigateToCertificate = () => {
    if (!courseId) return;
    
    // Debug before navigating
    debugCertificateEligibility();
    
    // Use the correct certificate route that matches your backend
    navigate(`/courses/certificate/${courseId}`);
  };

  // Get final exam status from exam results
  const getFinalExamStatus = () => {
    if (!examResults || !examResults.finalExam) {
      return {
        attempted: enrollment?.finalExamAttempted || false,
        passed: false,
        score: 0,
        attemptsUsed: 0,
        bestScore: 0
      };
    }
    
    const finalExam = examResults.finalExam;
    return {
      attempted: finalExam.results && finalExam.results.length > 0,
      passed: finalExam.passed || false,
      score: finalExam.bestScore || 0,
      attemptsUsed: finalExam.attemptsUsed || 0,
      bestScore: finalExam.bestScore || 0
    };
  };

  // Check if certificate is eligible - FIXED: Check enrollment first, then fallback to exam results
  const isCertificateEligible = (): boolean => {
    // First check if enrollment has certificateEligible field set
    if (enrollment?.certificateEligible !== undefined) {
      console.log("Certificate eligibility from enrollment:", enrollment.certificateEligible);
      return enrollment.certificateEligible;
    }
    
    // Fallback: Check exam results
    const finalExamStatus = getFinalExamStatus();
    console.log("Certificate eligibility from exam results:", finalExamStatus.passed);
    return finalExamStatus.passed || false;
  };

  // Debug function for certificate eligibility
  const debugCertificateEligibility = () => {
    console.log("=== Certificate Eligibility Debug ===");
    console.log("Enrollment data:", enrollment);
    console.log("Exam results:", examResults);
    console.log("enrollment.certificateEligible:", enrollment?.certificateEligible);
    console.log("enrollment.finalExamAttempted:", enrollment?.finalExamAttempted);
    console.log("enrollment.isCourseCompleted:", enrollment?.isCourseCompleted);
    console.log("getFinalExamStatus():", getFinalExamStatus());
    console.log("isCertificateEligible():", isCertificateEligible());
    console.log("=== End Debug ===");
  };

  // Enroll in course if not enrolled
  const enrollInCourse = async () => {
    if (!courseId || !course) return;
    
    try {
      if (course.courseType === 'unpaid') {
        const response = await axios.post(
          `${API_BASE_URL}/courses/enrollments/free`,
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Successfully enrolled in the course",
            variant: "default",
          });
          await fetchEnrollmentProgress(courseId);
          await fetchExamResults();
        }
      } else {
        navigate(`/courses/${courseId}/enroll`);
      }
    } catch (err: any) {
      console.error("Failed to enroll:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  // Close exam result modal - UPDATED: Refresh both exam results AND enrollment
  const closeExamResult = () => {
    setShowExamResult(null);
    if (courseId && showExamResult?.type === 'final' && showExamResult.result.passed) {
      // Refetch BOTH exam results and enrollment data
      toast({
        title: "Refreshing Data",
        description: "Updating your certificate eligibility...",
        variant: "default",
      });
      
      setTimeout(() => {
        fetchExamResults();
        fetchEnrollmentProgress(courseId);
      }, 1000);
    }
  };

  // Show exam result details modal
  const renderExamResultModal = () => {
    if (!showExamResult) return null;

    const { type, result, topicName } = showExamResult;
    const isPassed = result.passed;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className={`p-8 ${isPassed ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-orange-50'}`}>
            <div className="text-center">
              {isPassed ? (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {type === 'topic' ? 'Topic Exam' : 'Final Exam'} {isPassed ? 'Passed!' : 'Results'}
              </h3>
              {topicName && (
                <p className="text-gray-600 mb-4">Topic: {topicName}</p>
              )}
              
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.score}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Correct Answers</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {result.correctAnswers}/{result.totalQuestions}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.passingScore}% Required
                  </p>
                </div>
              </div>

              {type === 'final' && isPassed && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">
                      Congratulations! You're now eligible for the certificate!
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Your certificate eligibility is being updated. It may take a few moments to reflect.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {type === 'topic' && !isPassed && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      closeExamResult();
                      navigate(`/ap-internship-exam/${courseId}/${encodeURIComponent(topicName || '')}`);
                    }}
                    className="flex-1"
                  >
                    Retake Exam
                  </Button>
                )}
                <Button
                  onClick={closeExamResult}
                  className={`flex-1 ${isPassed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Effect for initial course load
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
    return () => {
      destroyYTPlayer();
    };
  }, [courseId]);

  // Effect to fetch enrollment when course and token are available
  useEffect(() => {
    if (course && token && initialLoad) {
      const timer = setTimeout(() => {
        fetchEnrollmentProgress(course._id);
        fetchExamResults();
        setInitialLoad(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [course, token, initialLoad]);

  // Effect to handle exam results from navigation - UPDATED: Refresh both data sources
  useEffect(() => {
    if (location.state?.examResult || location.state?.finalExamResult) {
      const result = location.state.examResult || location.state.finalExamResult;
      const isFinalExam = !!location.state.finalExamResult;
      
      setShowExamResult({
        type: isFinalExam ? 'final' : 'topic',
        result,
        topicName: location.state.topicName
      });
      
      // Refetch BOTH exam results AND enrollment data
      toast({
        title: "Updating Progress",
        description: "Refreshing your course data...",
        variant: "default",
      });
      
      setTimeout(() => {
        fetchExamResults();
        if (courseId) {
          fetchEnrollmentProgress(courseId);
        }
      }, 1500);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // YouTube Player Management
  const loadYouTubeIframeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
        return;
      }
      
      const existingScript = document.getElementById("youtube-iframe-api");
      if (existingScript) {
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        return;
      }
      
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      
      (window as any).onYouTubeIframeAPIReady = () => {
        console.log("YouTube API ready");
        resolve();
      };
      
      document.body.appendChild(tag);
    });
  };

  const createYTPlayer = async (videoId: string) => {
    try {
      await loadYouTubeIframeAPI();
      destroyYTPlayer();

      if (!ytContainerRef.current) {
        console.error("YouTube container ref not available");
        return;
      }

      if (ytContainerRef.current) {
        ytContainerRef.current.innerHTML = "";
      }

      ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log("YouTube Player Ready");
            event.target.playVideo();
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
          }
        }
      });
    } catch (error) {
      console.error("Failed to create YouTube player:", error);
    }
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
    }
  };

  // Open subtopic player
  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;

    if (!isEnrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in the course to access lessons",
        variant: "destructive",
      });
      return;
    }

    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });

    let link = course.curriculum?.[tIndex]?.subtopics?.[sIndex]?.link;
    if (!link) {
      destroyYTPlayer();
      setCurrentVideoId(null);
      toast({
        title: "No Video",
        description: "This lesson doesn't have a playable video",
        variant: "default",
      });
      return;
    }
    const videoId = extractYouTubeId(link);
    if (videoId) {
      setCurrentVideoId(videoId);
      createYTPlayer(videoId).catch((e) => {
        console.error("YT player create error:", e);
      });
    } else {
      destroyYTPlayer();
      setCurrentVideoId(null);
      toast({
        title: "No Video",
        description: "This lesson doesn't have a playable video",
        variant: "default",
      });
    }
  };

  // Auto-play first video when enrolled
  useEffect(() => {
    if (isEnrolled && course && course.curriculum && course.curriculum.length > 0 && !currentVideoId) {
      const firstTopic = course.curriculum[0];
      if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
        const firstSubtopic = firstTopic.subtopics[0];
        const videoId = extractYouTubeId(firstSubtopic.link);
        if (videoId) {
          setPlayingSubtopic({ topicIndex: 0, subIndex: 0 });
          setCurrentVideoId(videoId);
          
          const timer = setTimeout(() => {
            createYTPlayer(videoId).catch((e) => {
              console.error("Failed to auto-create YT player:", e);
            });
          }, 500);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isEnrolled, course, currentVideoId]);

  // UI SubtopicRow Component
  const SubtopicRow: React.FC<{ 
    tIndex: number; 
    sIndex: number; 
    sub: SubtopicFromCourse;
    topicName: string;
  }> = ({ tIndex, sIndex, sub, topicName }) => {
    const isThisPlaying = playingSubtopic?.topicIndex === tIndex && playingSubtopic?.subIndex === sIndex;
    const isCompleted = getSubtopicStatus(topicName, sub.name);
    const updateKey = `${topicName}-${sub.name}`;
    const isUpdating = updatingSubtopic === updateKey;

    return (
      <div className={`flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded ${isCompleted ? 'bg-green-50' : ''}`}>
        <div className="flex-1 flex items-start gap-3">
          {isEnrolled && (
            <button
              onClick={() => markSubtopicComplete(topicName, sub.name, !isCompleted)}
              className="flex-shrink-0 mt-1"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
              )}
            </button>
          )}
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-gray-400" />
              {sub.name}
              {isCompleted && isEnrolled && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                  Completed
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              <span>Duration: {sub.duration || 0} min</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isThisPlaying ? "secondary" : "outline"}
            onClick={() => openSubtopic(tIndex, sIndex)}
            className="flex items-center gap-1"
            disabled={!isEnrolled}
          >
            <Play className="h-3 w-3" />
            {isThisPlaying ? "Playing" : "Play"}
          </Button>
        </div>
      </div>
    );
  };

  // Render Topic Exam Status Component
  const TopicExamStatus: React.FC<{ topicName: string }> = ({ topicName }) => {
    const topicProgress = getTopicProgressDetails(topicName);
    
    if (!topicProgress || !isEnrolled) return null;

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Topic Exam Status
          </h4>
          {topicProgress.examAttempted && (
            <Badge variant={topicProgress.passed ? "default" : "destructive"} className="text-xs">
              {topicProgress.passed ? "Passed" : "Failed"}
            </Badge>
          )}
        </div>
        
        {topicProgress.examAttempted ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Score:</span>
              <span className={`font-semibold ${topicProgress.passed ? 'text-green-600' : 'text-red-600'}`}>
                {topicProgress.examScore}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">
                {topicProgress.passed ? "Passed" : "Needs Retake"}
              </span>
            </div>
            {topicProgress.examDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(topicProgress.examDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <Button
              onClick={() => navigateToTopicExam(topicName)}
              variant="outline"
              size="sm"
              className="w-full mt-2"
            >
              {topicProgress.passed ? "View Exam Details" : "Retake Exam"}
            </Button>
          </div>
        ) : areAllSubtopicsCompleted(topicName) ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600 mb-2">All lessons completed!</p>
            <Button
              onClick={() => navigateToTopicExam(topicName)}
              size="sm"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Take Topic Exam
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              Complete all lessons to unlock topic exam
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render Final Exam Status Component - UPDATED to use examResults
  const FinalExamStatus: React.FC = () => {
    if (!isEnrolled || !enrollment) return null;

    const isCourseCompleted = enrollment.isCourseCompleted;
    const allTopicsPassed = areAllTopicExamsPassed();
    const finalExamEligible = enrollment.finalExamEligible && allTopicsPassed;
    
    // Get final exam status from exam results
    const finalExamStatus = getFinalExamStatus();
    const finalExamAttempted = finalExamStatus.attempted;
    const finalExamPassed = finalExamStatus.passed;
    const finalExamScore = finalExamStatus.bestScore;
    const certificateEligible = isCertificateEligible();

    console.log("FinalExamStatus rendering:", {
      isCourseCompleted,
      allTopicsPassed,
      finalExamEligible,
      finalExamAttempted,
      finalExamPassed,
      finalExamScore,
      certificateEligible,
      enrollmentCertificateEligible: enrollment?.certificateEligible,
      examResults
    });

    // Check if should show final exam button
    const shouldShowFinalExamButton = isCourseCompleted && allTopicsPassed && !finalExamAttempted;

    return (
      <div className="mt-8 pt-6 border-t">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Final Exam Status
            </h3>
            {finalExamAttempted && (
              <Badge variant={finalExamPassed ? "default" : "destructive"}>
                {finalExamPassed ? "Passed" : "Failed"}
              </Badge>
            )}
          </div>
          
          {!isCourseCompleted ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-700 mb-2">Complete all topics to unlock the final exam</p>
              <p className="text-sm text-gray-600">
                Progress: {enrollment.completedTopics}/{enrollment.totalTopics} topics completed
              </p>
            </div>
          ) : !allTopicsPassed ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-700 mb-2">Pass all topic exams to unlock the final exam</p>
              <p className="text-sm text-gray-600">
                {enrollment.progress.filter(t => t.passed).length}/{enrollment.progress.length} topic exams passed
              </p>
            </div>
          ) : !finalExamAttempted ? (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-700 mb-3">You're eligible for the final exam!</p>
              <p className="text-sm text-gray-600 mb-4">
                Test your comprehensive knowledge to earn your certificate
              </p>
              <Button
                onClick={navigateToFinalExam}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                <ChevronRight className="h-5 w-5 mr-2" />
                Take Final Exam
              </Button>
            </div>
          ) : finalExamPassed ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">Final Exam Score:</span>
                  <span className="text-2xl font-bold text-green-600">{finalExamScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Passed
                  </Badge>
                </div>
                {examResults?.finalExam?.results?.[0]?.attemptedAt && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Date Completed:</span>
                    <span className="text-sm font-medium">
                      {new Date(examResults.finalExam.results[0].attemptedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {certificateEligible && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-bold text-green-800">Certificate Ready!</h4>
                        <p className="text-sm text-green-700">Download your course completion certificate</p>
                      </div>
                    </div>
                    <Button
                      onClick={navigateToCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">Final Exam Score:</span>
                  <span className="text-2xl font-bold text-red-600">{finalExamScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Status:</span>
                  <Badge variant="destructive">Failed - Needs Retake</Badge>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    You need to pass the final exam to get your certificate
                  </p>
                  <Button
                    onClick={navigateToFinalExam}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Retake Final Exam
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading || fetchingEnrollment) {
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

  const totalTopics = enrollment?.totalTopics || course.curriculum?.length || 0;
  const totalSubtopics = enrollment?.totalSubtopics || course.curriculum?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0;
  const completedTopics = enrollment?.completedTopics || 0;
  const completedSubtopics = enrollment?.completedSubtopics || 0;
  const completionPercentage = enrollment?.courseCompletionPercentage || 0;
  const isCourseCompleted = enrollment?.isCourseCompleted || false;
  const allTopicsPassed = areAllTopicExamsPassed();
  
  // Get final exam status from exam results
  const finalExamStatus = getFinalExamStatus();
  const finalExamAttempted = finalExamStatus.attempted;
  const finalExamPassed = finalExamStatus.passed;
  const certificateEligible = isCertificateEligible();

  return (
    <div className="min-h-screen bg-gray-50">
      {renderExamResultModal()}

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
                Back to Courses
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-sm text-gray-600">Course Learning Interface</p>
              </div>
            </div>
            {isEnrolled && enrollment && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-semibold">
                    {completedTopics}/{totalTopics} topics • {completedSubtopics}/{totalSubtopics} lessons
                  </div>
                  <div className="text-xs text-gray-500">
                    {enrollment.progress.filter(t => t.passed).length}/{enrollment.progress.length} exams passed
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1 text-center">
                    {completionPercentage}% complete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {!isEnrolled && (
              <Card className="bg-yellow-50 border-yellow-200 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 mb-1">You are not enrolled in this course</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        {course.courseType === 'unpaid' 
                          ? "This is a free course. Enroll now to start learning and track your progress."
                          : "This is a paid course. Purchase the course to access all content and track your progress."}
                      </p>
                      <Button 
                        onClick={enrollInCourse} 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {course.courseType === 'unpaid' ? "Enroll for Free" : "Purchase Course"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                    <CardDescription className="mt-2">{course.courseDescription}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={course.courseType === "paid" ? "default" : "secondary"}>
                      {course.courseType === "paid" ? "Paid Course" : "Free Course"}
                    </Badge>
                    {isEnrolled && isCourseCompleted && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Course Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
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
                          <p>{isEnrolled ? "Select a lesson to start learning" : "Enroll to start learning"}</p>
                          <p className="text-sm mt-2">Click on any lesson below to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Show Final Exam Button only when all topics completed and all topic exams passed */}
                    {isEnrolled && isCourseCompleted && allTopicsPassed && !finalExamAttempted && (
                      <Button
                        onClick={navigateToFinalExam}
                        className="flex-1 min-w-[200px]"
                        size="lg"
                        variant="default"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Take Final Exam
                      </Button>
                    )}

                    {/* Show Certificate Button only when final exam is passed */}
                    {isEnrolled && certificateEligible && (
                      <Button
                        onClick={navigateToCertificate}
                        className="flex-1 min-w-[200px]"
                        size="lg"
                        variant="default"
                        style={{ backgroundColor: '#10b981' }}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}

                    {/* Show Retake Final Exam Button if failed */}
                    {isEnrolled && isCourseCompleted && finalExamAttempted && !certificateEligible && (
                      <Button
                        onClick={navigateToFinalExam}
                        className="flex-1 min-w-[200px]"
                        size="lg"
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Retake Final Exam
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {isEnrolled 
                    ? `${completedSubtopics} of ${totalSubtopics} lessons completed • ${completionPercentage}% complete`
                    : "Enroll to track your progress"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {course.curriculum.map((topic, tIndex) => {
                      const topicTotal = topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);
                      const isTopicCompleted = areAllSubtopicsCompleted(topic.topicName);
                      const completedSubtopicsCount = getCompletedSubtopicsCount(topic.topicName);
                      const topicProgress = getTopicProgressDetails(topic.topicName);
                      const totalSubtopicsInTopic = topic.subtopics.length;
                      const isTopicExamPassed = topicProgress?.passed || false;

                      return (
                        <div 
                          key={topic.topicName} 
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isTopicCompleted && isEnrolled ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                        >
                          <div className="mb-4">
                            <div className="font-semibold text-lg flex items-center gap-2">
                              {topic.topicName}
                              {isTopicCompleted && isEnrolled && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {topicProgress?.examAttempted && (
                                <Badge 
                                  variant={isTopicExamPassed ? "default" : "destructive"} 
                                  className="text-xs ml-2"
                                >
                                  {isTopicExamPassed ? "Exam Passed" : "Exam Failed"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {isEnrolled 
                                ? `${completedSubtopicsCount} of ${totalSubtopicsInTopic} lessons completed • ${topicTotal} minutes`
                                : `${topic.subtopics.length} lessons • ${topicTotal} minutes`}
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {topic.subtopics.map((sub, sIndex) => (
                              <SubtopicRow 
                                key={`${sub.name}-${sIndex}`} 
                                tIndex={tIndex} 
                                sIndex={sIndex} 
                                sub={sub}
                                topicName={topic.topicName}
                              />
                            ))}
                          </div>

                          {/* Topic Exam Status Component */}
                          <TopicExamStatus topicName={topic.topicName} />

                          {(!isTopicCompleted || !isEnrolled) && (
                            <div className="flex gap-2 pt-3 border-t">
                              <Button
                                onClick={() => {
                                  if (topic.subtopics && topic.subtopics.length > 0) {
                                    openSubtopic(tIndex, 0);
                                  }
                                }}
                                className="flex-1"
                                variant="outline"
                                disabled={!isEnrolled}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Topic
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Final Exam Status Component - After all topics */}
                    <FinalExamStatus />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No curriculum available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isEnrolled && certificateEligible && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Award className="h-8 w-8 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 mb-1">Certificate Ready!</h3>
                      <p className="text-green-700 text-sm mb-3">
                        Congratulations! You have successfully completed the course and passed the final exam. 
                        You can now download your certificate.
                      </p>
                      <Button 
                        onClick={navigateToCertificate}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
