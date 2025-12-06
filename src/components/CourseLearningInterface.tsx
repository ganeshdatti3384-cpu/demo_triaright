// Triaright_EduCareer/src/components/CourseLearningInterface.tsx
import React, { useEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ChevronRight,
  Share2,
  X,
  Maximize2,
  Volume2,
  Settings,
  SkipBack,
  SkipForward,
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

// Progress types matching backend
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
};

type EnrollmentProgress = {
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
  certificateEligible: boolean;
  courseCompletedAt?: string;
  finalExamPassedAt?: string;
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
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetchingEnrollment, setFetchingEnrollment] = useState(false);

  // playing location (indexes)
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);

  // YouTube player refs & state
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
        // Enrollment will be fetched separately after course is loaded
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

  // Fetch enrollment progress using existing endpoint
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
        setEnrollment(response.data.data);
        setIsEnrolled(true);
      }
    } catch (err: any) {
      console.error("Failed to fetch enrollment progress:", err);
      // Handle specific error cases
      if (err.response?.status === 401) {
        // Token expired or invalid
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
      } else if (err.response?.status === 404) {
        // Not enrolled - this is expected for non-enrolled users
        setIsEnrolled(false);
      } else {
        // Other errors - show toast but don't redirect
        console.log("Enrollment fetch error (non-critical):", err.response?.data?.message);
      }
      setIsEnrolled(false);
    } finally {
      setFetchingEnrollment(false);
    }
  };

  // Unified progress update function using the new endpoint
  const updateProgress = async (
    topicName: string, 
    subTopicName: string | null, 
    isCompleted: boolean,
    updateType: "subtopic" | "topic"
  ) => {
    if (!courseId || !enrollment || !token) return;
    
    setProgressLoading(true);
    try {
      const requestData: any = {
        courseId,
        topicName,
        isCompleted,
        updateType
      };

      // Add subtopic name only for subtopic updates
      if (updateType === "subtopic" && subTopicName) {
        requestData.subTopicName = subTopicName;
      }

      console.log("Sending update progress request:", requestData); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Update progress response:", response.data); // Debug log

      if (response.data.success) {
        // Update local enrollment state with backend response
        const updatedEnrollment = { ...enrollment };
        
        if (updateType === "subtopic" && subTopicName) {
          // Update subtopic completion
          const topicIndex = updatedEnrollment.progress.findIndex(t => t.topicName === topicName);
          if (topicIndex !== -1) {
            const subtopicIndex = updatedEnrollment.progress[topicIndex].subtopics.findIndex(
              st => st.subTopicName === subTopicName
            );
            if (subtopicIndex !== -1) {
              updatedEnrollment.progress[topicIndex].subtopics[subtopicIndex].isCompleted = isCompleted;
              
              // Check if all subtopics in this topic are completed
              const allCompleted = updatedEnrollment.progress[topicIndex].subtopics.every(st => st.isCompleted);
              updatedEnrollment.progress[topicIndex].isCompleted = allCompleted;
            }
          }
        } else if (updateType === "topic") {
          // Update entire topic
          const topicIndex = updatedEnrollment.progress.findIndex(t => t.topicName === topicName);
          if (topicIndex !== -1) {
            updatedEnrollment.progress[topicIndex].isCompleted = isCompleted;
            
            // Update all subtopics in this topic
            updatedEnrollment.progress[topicIndex].subtopics.forEach(subtopic => {
              subtopic.isCompleted = isCompleted;
            });
          }
        }

        // Update completion stats from backend response
        if (response.data.completionStats) {
          updatedEnrollment.completedSubtopics = response.data.completionStats.completedSubtopics;
          updatedEnrollment.completedTopics = response.data.completionStats.completedTopics;
          updatedEnrollment.courseCompletionPercentage = response.data.completionStats.courseCompletionPercentage;
          updatedEnrollment.isCourseCompleted = response.data.completionStats.isCourseCompleted;
          
          // Update final exam eligibility when all topics are completed
          updatedEnrollment.finalExamEligible = 
            response.data.completionStats.completedTopics === updatedEnrollment.totalTopics && 
            updatedEnrollment.totalTopics > 0;
        }

        setEnrollment(updatedEnrollment);
        
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error("Failed to update progress:", err);
      console.error("Error details:", err.response?.data); // Debug log
      
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setProgressLoading(false);
    }
  };

  // Mark subtopic as complete/incomplete
  const markSubtopicComplete = async (topicName: string, subTopicName: string, isCompleted: boolean) => {
    await updateProgress(topicName, subTopicName, isCompleted, "subtopic");
  };

  // Mark topic as complete/incomplete
  const markTopicComplete = async (topicName: string, isCompleted: boolean) => {
    await updateProgress(topicName, null, isCompleted, "topic");
  };

  // Get completion status for a subtopic
  const getSubtopicStatus = (topicName: string, subtopicName: string): boolean => {
    if (!enrollment) return false;
    
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    
    const subtopic = topic.subtopics.find(st => st.subTopicName === subtopicName);
    return subtopic?.isCompleted || false;
  };

  // Get completion status for a topic
  const getTopicStatus = (topicName: string): boolean => {
    if (!enrollment) return false;
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    return topic?.isCompleted || false;
  };

  // Get topic progress details
  const getTopicProgressDetails = (topicName: string) => {
    if (!enrollment) return null;
    return enrollment.progress.find(t => t.topicName === topicName);
  };

  // Navigate to topic exam - using existing route
  const navigateToTopicExam = (topicName: string) => {
    if (!courseId) return;
    navigate(`/courses/exams/topic/${courseId}/${encodeURIComponent(topicName)}`);
  };

  // Navigate to final exam - using existing route
  const navigateToFinalExam = () => {
    if (!courseId) return;
    navigate(`/courses/exams/final/${courseId}`);
  };

  // Navigate to certificate - using existing route
  const navigateToCertificate = () => {
    if (!courseId) return;
    navigate(`/courses/enrollments/certificate/${courseId}`);
  };

  // Enroll in course if not enrolled
  const enrollInCourse = async () => {
    if (!courseId || !course) return;
    
    try {
      setProgressLoading(true);
      if (course.courseType === 'unpaid') {
        // Enroll in free course
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
        }
      } else {
        // For paid courses, navigate to enrollment page
        navigate(`/courses/${courseId}/enroll`);
      }
    } catch (err: any) {
      console.error("Failed to enroll:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setProgressLoading(false);
    }
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
      // Delay slightly to ensure all auth state is settled
      const timer = setTimeout(() => {
        fetchEnrollmentProgress(course._id);
        setInitialLoad(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [course, token, initialLoad]);

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
      height: "100%",
      width: "100%",
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
        controls: 1,
        showinfo: 0,
        fs: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          console.log("YouTube player ready");
          event.target.playVideo();
          setIsPlaying(true);
        },
        onStateChange: (event: any) => {
          // 0 = ended, 1 = playing, 2 = paused, 3 = buffering
          if (event.data === 1) {
            setIsPlaying(true);
          } else if (event.data === 2 || event.data === 0) {
            setIsPlaying(false);
            if (event.data === 0) {
              // Video ended, mark as completed if enrolled
              if (isEnrolled && playingSubtopic) {
                const topic = course?.curriculum[playingSubtopic.topicIndex];
                const subtopic = topic?.subtopics[playingSubtopic.subIndex];
                if (topic && subtopic) {
                  markSubtopicComplete(topic.topicName, subtopic.name, true);
                }
              }
            }
          }
        },
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
      setCurrentVideoId(null);
      setIsPlaying(false);
    }
  };

  // Open subtopic player
  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;

    // Check if user is enrolled
    if (!isEnrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in the course to access lessons",
        variant: "destructive",
      });
      return;
    }

    // Set playing indexes immediately
    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });

    // Get link from course curriculum
    let link = course.curriculum?.[tIndex]?.subtopics?.[sIndex]?.link;
    if (!link) {
      // no video link available
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
        toast({
          title: "Video Error",
          description: "Failed to load video player",
          variant: "destructive",
        });
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

  // UI SubtopicRow
  const SubtopicRow: React.FC<{ 
    tIndex: number; 
    sIndex: number; 
    sub: SubtopicFromCourse;
    topicName: string;
  }> = ({ tIndex, sIndex, sub, topicName }) => {
    const isThisPlaying = playingSubtopic?.topicIndex === tIndex && playingSubtopic?.subIndex === sIndex;
    const isCompleted = getSubtopicStatus(topicName, sub.name);

    return (
      <div className={`flex items-center justify-between gap-4 py-3 px-4 hover:bg-gray-50 rounded ${isThisPlaying ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${isCompleted ? 'bg-green-50' : ''}`}>
        <div className="flex-1 flex items-start gap-3">
          {isEnrolled && (
            <button
              onClick={() => markSubtopicComplete(topicName, sub.name, !isCompleted)}
              className="flex-shrink-0 mt-1"
              disabled={progressLoading}
            >
              {progressLoading ? (
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
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              <span>Duration: {sub.duration || 0} min</span>
              {isCompleted && isEnrolled && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200 ml-2">
                  Completed
                </Badge>
              )}
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

  // Show loading state if course is loading or enrollment is being fetched
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

  // Calculate progress statistics
  const totalTopics = enrollment?.totalTopics || course.curriculum?.length || 0;
  const totalSubtopics = enrollment?.totalSubtopics || course.curriculum?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0;
  const completedTopics = enrollment?.completedTopics || 0;
  const completedSubtopics = enrollment?.completedSubtopics || 0;
  const completionPercentage = enrollment?.courseCompletionPercentage || 0;
  const isCourseCompleted = enrollment?.isCourseCompleted || false;
  const finalExamEligible = enrollment?.finalExamEligible || false;
  const finalExamAttempted = enrollment?.finalExamAttempted || false;
  const certificateEligible = enrollment?.certificateEligible || false;

  // Get current playing subtopic info
  const getCurrentSubtopicInfo = () => {
    if (!playingSubtopic || !course?.curriculum) return null;
    const topic = course.curriculum[playingSubtopic.topicIndex];
    if (!topic) return null;
    const subtopic = topic.subtopics[playingSubtopic.subIndex];
    return { topic, subtopic };
  };

  const currentSubtopic = getCurrentSubtopicInfo();

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
            {isEnrolled && enrollment && (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-semibold">
                    {completedTopics}/{totalTopics} topics • {completedSubtopics}/{totalSubtopics} lessons
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
          {/* Left: Video Player + curriculum */}
          <div className="lg:col-span-2 space-y-6">
            {!isEnrolled && (
              <Card className="bg-yellow-50 border-yellow-200">
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
                        disabled={progressLoading}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {progressLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : course.courseType === 'unpaid' ? "Enroll for Free" : "Purchase Course"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Player Section */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                {currentVideoId ? (
                  <div 
                    ref={ytContainerRef}
                    id="yt-player" 
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="text-4xl mb-4">📺</div>
                      <h3 className="text-xl font-semibold mb-2">No Video Selected</h3>
                      <p className="text-gray-300">Select a lesson from the course topics to start watching</p>
                      <Button 
                        onClick={() => {
                          if (course.curriculum && course.curriculum.length > 0) {
                            openSubtopic(0, 0);
                          }
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        disabled={!isEnrolled}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start First Lesson
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Player Controls (Custom) */}
              {currentVideoId && (
                <div className="bg-gray-900 text-white px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium truncate">
                        {currentSubtopic?.subtopic?.name || "Playing..."}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {currentSubtopic?.topic?.topicName || ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-800 rounded-full">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-800 rounded-full">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-gray-800 rounded">
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-800 rounded-full"
                      onClick={() => {
                        if (ytPlayerRef.current) {
                          if (isPlaying) {
                            ytPlayerRef.current.pauseVideo();
                          } else {
                            ytPlayerRef.current.playVideo();
                          }
                        }
                      }}
                    >
                      {isPlaying ? (
                        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                          <div className="w-1 h-4 bg-black mx-0.5"></div>
                          <div className="w-1 h-4 bg-black mx-0.5"></div>
                        </div>
                      ) : (
                        <Play className="h-6 w-6 ml-0.5 fill-current" />
                      )}
                    </button>
                    <button className="p-1 hover:bg-gray-800 rounded">
                      <SkipForward className="h-5 w-5" />
                    </button>
                    
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-gray-400">0:00</span>
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${videoProgress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">10:00</span>
                    </div>
                    
                    <button className="p-2 hover:bg-gray-800 rounded-full">
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info Section */}
            {currentSubtopic && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-2">{currentSubtopic.subtopic.name}</h2>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentSubtopic.subtopic.duration || 0} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Lesson {playingSubtopic!.subIndex + 1} of {currentSubtopic.topic.subtopics.length}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="default" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (ytPlayerRef.current) {
                        ytPlayerRef.current.playVideo();
                      }
                    }}
                  >
                    <Play className="h-4 w-4" />
                    {isPlaying ? "Playing" : "Play"}
                  </Button>
                  {isEnrolled && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const isCompleted = getSubtopicStatus(
                          currentSubtopic.topic.topicName, 
                          currentSubtopic.subtopic.name
                        );
                        markSubtopicComplete(
                          currentSubtopic.topic.topicName, 
                          currentSubtopic.subtopic.name, 
                          !isCompleted
                        );
                      }}
                      disabled={progressLoading}
                    >
                      {progressLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : getSubtopicStatus(currentSubtopic.topic.topicName, currentSubtopic.subtopic.name) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Course Topics Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Course Topics</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {completedTopics} of {totalTopics} completed
                    </Badge>
                    <span className="text-sm text-gray-500">• 1 min</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div>
                    {course.curriculum.map((topic, tIndex) => {
                      const isTopicCompleted = getTopicStatus(topic.topicName);
                      const topicProgress = getTopicProgressDetails(topic.topicName);
                      const completedSubtopicsInTopic = isEnrolled 
                        ? topic.subtopics.filter(sub => getSubtopicStatus(topic.topicName, sub.name)).length
                        : 0;

                      return (
                        <div key={topic.topicName} className="border-t first:border-t-0">
                          <div className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {isEnrolled ? (
                                  <button
                                    onClick={() => markTopicComplete(topic.topicName, !isTopicCompleted)}
                                    disabled={progressLoading}
                                    className="flex-shrink-0"
                                  >
                                    {progressLoading ? (
                                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                    ) : isTopicCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                                    )}
                                  </button>
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                                <div>
                                  <div className="font-medium">{topic.topicName}</div>
                                  <div className="text-sm text-gray-500">
                                    {isEnrolled 
                                      ? `${completedSubtopicsInTopic} of ${topic.subtopics.length} lessons completed`
                                      : `${topic.subtopics.length} lessons`}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                            
                            {/* Subtopic list */}
                            <div className="ml-8 space-y-1">
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

                            {/* Topic Exam button */}
                            {isEnrolled && isTopicCompleted && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Topic Completed
                                    </Badge>
                                    {topicProgress?.examAttempted && (
                                      <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                                        Exam Score: {topicProgress.examScore}/10
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => navigateToTopicExam(topic.topicName)}
                                    variant={topicProgress?.examAttempted ? "secondary" : "default"}
                                    size="sm"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    {topicProgress?.examAttempted ? 'Retake Topic Exam' : 'Take Topic Exam'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No curriculum available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Course Summary */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Topics:</span>
                    <span className="font-medium">{totalTopics}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Topics:</span>
                    <span className="font-medium">{completedTopics}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {completionPercentage}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exam Available:</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Available
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exam Passed:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Passed
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Certificate:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Available
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {isEnrolled && (
                    <>
                      {isCourseCompleted && finalExamEligible && !finalExamAttempted && (
                        <Button
                          onClick={navigateToFinalExam}
                          className="w-full"
                          variant="default"
                          size="lg"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Take Course Exam
                        </Button>
                      )}
                      
                      {certificateEligible && (
                        <Button
                          onClick={navigateToCertificate}
                          className="w-full"
                          variant="outline"
                          size="lg"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                      )}

                      {!isCourseCompleted && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 mb-2">
                            Complete all topics to unlock the final exam
                          </p>
                          <div className="flex justify-between text-xs text-blue-600">
                            <span>Progress: {completedTopics}/{totalTopics}</span>
                            <span>{completionPercentage}%</span>
                          </div>
                          <div className="h-2 bg-blue-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!isEnrolled && (
                    <Button
                      onClick={enrollInCourse}
                      className="w-full"
                      variant="default"
                      size="lg"
                    >
                      {course.courseType === 'unpaid' ? "Enroll for Free" : "Purchase Course"}
                    </Button>
                  )}
                </div>

                {isEnrolled && certificateEligible && (
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">Congratulations! You passed the exam.</p>
                      <p className="text-xs text-gray-600 mt-1">Download your certificate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Info Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{course.courseName}</h3>
                    <p className="text-sm text-gray-600">{course.instructorName || "No instructor"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <div className="font-medium">
                      {course.courseType === 'paid' ? 'Paid' : 'Free'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="font-medium">{course.totalDuration || 0} min</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Lessons</div>
                    <div className="font-medium">{totalSubtopics}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Topics</div>
                    <div className="font-medium">{totalTopics}</div>
                  </div>
                </div>
                
                {course.courseDescription && (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-1">Description</div>
                    <p className="text-sm">{course.courseDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Navigation */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!playingSubtopic) return;
                  const currentTopicIndex = playingSubtopic.topicIndex;
                  const currentSubIndex = playingSubtopic.subIndex;
                  
                  if (currentSubIndex > 0) {
                    openSubtopic(currentTopicIndex, currentSubIndex - 1);
                  } else if (currentTopicIndex > 0) {
                    const prevTopic = course.curriculum[currentTopicIndex - 1];
                    openSubtopic(currentTopicIndex - 1, prevTopic.subtopics.length - 1);
                  }
                }}
                disabled={!playingSubtopic || (!playingSubtopic.subIndex && !playingSubtopic.topicIndex)}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!playingSubtopic || !course.curriculum) return;
                  const currentTopicIndex = playingSubtopic.topicIndex;
                  const currentSubIndex = playingSubtopic.subIndex;
                  const currentTopic = course.curriculum[currentTopicIndex];
                  
                  if (currentSubIndex < currentTopic.subtopics.length - 1) {
                    openSubtopic(currentTopicIndex, currentSubIndex + 1);
                  } else if (currentTopicIndex < course.curriculum.length - 1) {
                    openSubtopic(currentTopicIndex + 1, 0);
                  }
                }}
                disabled={!playingSubtopic || !course.curriculum || 
                  (playingSubtopic.subIndex >= course.curriculum[playingSubtopic.topicIndex].subtopics.length - 1 && 
                   playingSubtopic.topicIndex >= course.curriculum.length - 1)}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
