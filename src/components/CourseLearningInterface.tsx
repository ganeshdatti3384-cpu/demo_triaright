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
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetchingEnrollment, setFetchingEnrollment] = useState(false);
  const [updatingSubtopic, setUpdatingSubtopic] = useState<string | null>(null);

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

      console.log("Update subtopic response:", response.data); // Debug log

      if (response.data.success) {
        // Update local enrollment state with backend response
        const updatedEnrollment = { ...enrollment };
        
        // Find and update the subtopic
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

        // Update completion stats from backend response
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
      console.error("Error details:", err.response?.data); // Debug log
      
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
      const progressLoading = true;
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
      // progressLoading will be reset by fetchEnrollmentProgress
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

  // Auto-play first video when enrolled
  useEffect(() => {
    if (isEnrolled && course && course.curriculum && course.curriculum.length > 0) {
      const firstTopic = course.curriculum[0];
      if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
        const firstSubtopic = firstTopic.subtopics[0];
        const videoId = extractYouTubeId(firstSubtopic.link);
        if (videoId && !currentVideoId) {
          // Set playing state
          setPlayingSubtopic({ topicIndex: 0, subIndex: 0 });
          setCurrentVideoId(videoId);
          
          // Create player after a small delay to ensure DOM is ready
          setTimeout(() => {
            createYTPlayer(videoId).catch((e) => {
              console.error("Failed to auto-create YT player:", e);
            });
          }, 300);
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
          {/* Left: Video Player - Now full width of left column */}
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {isEnrolled && isCourseCompleted && finalExamEligible && !finalExamAttempted && (
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

                    {isEnrolled && isCourseCompleted && finalExamAttempted && certificateEligible && (
                      <Button
                        onClick={navigateToCertificate}
                        className="flex-1 min-w-[200px]"
                        size="lg"
                        variant="outline"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Get Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Course Curriculum - Moved to side of video */}
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

                          {/* Show topic exam button only when ALL subtopics are completed */}
                          {isEnrolled && isTopicCompleted && (
                            <div className="pt-3 border-t">
                              <div className="flex justify-between items-center">
                                <div>
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Topic Completed
                                  </Badge>
                                  {topicProgress?.examAttempted && (
                                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
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

                          {/* Start Topic button for non-completed topics */}
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
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
