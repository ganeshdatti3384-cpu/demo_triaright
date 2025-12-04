// Triaright_EduCareer/src/components/CourseLearningInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  Video,
  FileText,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// Types
interface SubTopic {
  name: string;
  link: string;
  duration: number;
}

interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: SubTopic[];
  directLink?: string;
  examExcelLink?: string;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  curriculum: Topic[];
  demoVideoLink: string;
  courseType: string;
  price: number;
  totalDuration: number;
  stream: string;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: string;
  additionalInformation: string;
  courseImageLink: string;
  curriculumDocLink: string;
  hasFinalExam: boolean;
  finalExamExcelLink?: string;
}

interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  isPaid: boolean;
  amountPaid: number;
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  videoProgressPercent: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  accessExpiresAt: string;
  courseCompleted?: boolean;
}

interface TopicProgress {
  topicName: string;
  subtopics: SubtopicProgress[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
}

interface SubtopicProgress {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
}

interface TopicExamEligibility {
  eligible: boolean;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

const CourseLearningInterface: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeSubTopicIndex, setActiveSubTopicIndex] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showTopicExamButton, setShowTopicExamButton] = useState(false);
  const [topicExamEligibility, setTopicExamEligibility] = useState<TopicExamEligibility>({ eligible: false });
  const [showFinalExamButton, setShowFinalExamButton] = useState(false);

  // Refs
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  // YouTube API
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

  // Extract YouTube Video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?.*v=([^&\n?#]+))/,
      /youtu\.be\/([^?\n]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Load course and enrollment data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load course details
        const courseResponse = await axios.get(
          `${API_BASE_URL}/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const courseData = courseResponse.data?.course;
        if (!courseData) {
          throw new Error('Course not found');
        }
        setCourse(courseData);

        // Load enrollment progress
        const enrollmentResponse = await axios.get(
          `${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (enrollmentResponse.data?.data) {
          setEnrollment(enrollmentResponse.data.data);
        }

      } catch (error: any) {
        console.error('Error loading course data:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load course data',
          variant: 'destructive',
        });
        
        // Redirect if no enrollment
        if (error.response?.status === 404) {
          navigate('/student/courses');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, token, navigate, toast]);

  // Set initial video when course loads
  useEffect(() => {
    if (course && course.curriculum.length > 0) {
      const firstTopic = course.curriculum[0];
      if (firstTopic.subtopics.length > 0) {
        setCurrentVideoUrl(firstTopic.subtopics[0].link);
      }
    }
  }, [course]);

  // Check topic exam eligibility
  useEffect(() => {
    if (course && enrollment && course.curriculum[activeTopicIndex]) {
      const currentTopic = course.curriculum[activeTopicIndex];
      const topicProgress = enrollment.progress.find(
        (p) => p.topicName === currentTopic.topicName
      );

      if (topicProgress) {
        // Check if topic content is completed
        const isTopicCompleted = 
          topicProgress.topicWatchedDuration >= topicProgress.topicTotalDuration;
        
        const alreadyAttempted = topicProgress.examAttempted;

        setTopicExamEligibility({
          eligible: isTopicCompleted && !alreadyAttempted,
          message: alreadyAttempted 
            ? 'Topic exam already attempted' 
            : isTopicCompleted 
              ? 'Eligible for topic exam' 
              : 'Complete all topic content first'
        });

        setShowTopicExamButton(isTopicCompleted && !alreadyAttempted);
      }
    }
  }, [course, enrollment, activeTopicIndex]);

  // Check final exam eligibility
  useEffect(() => {
    if (enrollment) {
      const allTopicsCompleted = enrollment.progress.every(
        (topic) => topic.topicWatchedDuration >= topic.topicTotalDuration
      );
      
      const allTopicsPassed = enrollment.progress.every((topic) => topic.passed);
      const alreadyAttempted = enrollment.finalExamAttempted;

      setShowFinalExamButton(
        enrollment.finalExamEligible && 
        allTopicsCompleted && 
        allTopicsPassed && 
        !alreadyAttempted
      );
    }
  }, [enrollment]);

  // Start tracking video progress
  const startVideoProgressTracking = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
    }

    videoIntervalRef.current = setInterval(() => {
      setVideoProgress((prev) => {
        const newProgress = Math.min(prev + 1, 100);
        
        // Save progress every 5 seconds
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 5000) {
          saveVideoProgress(newProgress);
          lastSaveTimeRef.current = now;
        }
        
        return newProgress;
      });
    }, 1000);
  };

  // Stop tracking video progress
  const stopVideoProgressTracking = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
    
    // Save final progress
    saveVideoProgress(videoProgress);
  };

  // Save video progress to backend
  const saveVideoProgress = async (progressPercentage: number) => {
    if (!course || !enrollment || !token || updatingProgress) return;

    try {
      setUpdatingProgress(true);
      
      const currentTopic = course.curriculum[activeTopicIndex];
      const currentSubTopic = currentTopic.subtopics[activeSubTopicIndex];
      
      if (!currentTopic || !currentSubTopic) return;

      const totalDuration = currentSubTopic.duration || 60; // Default 60 seconds
      const watchedDuration = Math.round((progressPercentage / 100) * totalDuration);

      await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: currentTopic.topicName,
          subTopicName: currentSubTopic.name,
          watchedDuration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      if (enrollment) {
        const updatedProgress = [...enrollment.progress];
        const topicIndex = updatedProgress.findIndex(
          (t) => t.topicName === currentTopic.topicName
        );

        if (topicIndex !== -1) {
          const subtopicIndex = updatedProgress[topicIndex].subtopics.findIndex(
            (st) => st.subTopicName === currentSubTopic.name
          );

          if (subtopicIndex !== -1) {
            updatedProgress[topicIndex].subtopics[subtopicIndex].watchedDuration = 
              watchedDuration;
            
            updatedProgress[topicIndex].topicWatchedDuration = 
              updatedProgress[topicIndex].subtopics.reduce(
                (sum, st) => sum + st.watchedDuration, 0
              );
          }
        }

        setEnrollment({
          ...enrollment,
          progress: updatedProgress,
          totalWatchedDuration: updatedProgress.reduce(
            (sum, topic) => sum + topic.topicWatchedDuration, 0
          ),
        });
      }

    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Handle video play
  const handleVideoPlay = () => {
    startVideoProgressTracking();
  };

  // Handle video pause
  const handleVideoPause = () => {
    stopVideoProgressTracking();
  };

  // Handle video end
  const handleVideoEnd = () => {
    stopVideoProgressTracking();
    setVideoProgress(100);
    saveVideoProgress(100);
    
    // Auto-play next subtopic if available
    const nextSubTopicIndex = activeSubTopicIndex + 1;
    const currentTopic = course?.curriculum[activeTopicIndex];
    
    if (currentTopic && nextSubTopicIndex < currentTopic.subtopics.length) {
      setTimeout(() => {
        setActiveSubTopicIndex(nextSubTopicIndex);
        setCurrentVideoUrl(currentTopic.subtopics[nextSubTopicIndex].link);
        setVideoProgress(0);
      }, 1000);
    }
  };

  // Navigate to previous subtopic
  const goToPreviousSubTopic = () => {
    if (activeSubTopicIndex > 0) {
      const newIndex = activeSubTopicIndex - 1;
      setActiveSubTopicIndex(newIndex);
      setCurrentVideoUrl(course!.curriculum[activeTopicIndex].subtopics[newIndex].link);
      setVideoProgress(0);
    }
  };

  // Navigate to next subtopic
  const goToNextSubTopic = () => {
    const currentTopic = course!.curriculum[activeTopicIndex];
    if (activeSubTopicIndex < currentTopic.subtopics.length - 1) {
      const newIndex = activeSubTopicIndex + 1;
      setActiveSubTopicIndex(newIndex);
      setCurrentVideoUrl(currentTopic.subtopics[newIndex].link);
      setVideoProgress(0);
    }
  };

  // Navigate to topic
  const goToTopic = (topicIndex: number, subTopicIndex: number = 0) => {
    setActiveTopicIndex(topicIndex);
    setActiveSubTopicIndex(subTopicIndex);
    setCurrentVideoUrl(course!.curriculum[topicIndex].subtopics[subTopicIndex].link);
    setVideoProgress(0);
  };

  // Start topic exam
  const startTopicExam = async () => {
    if (!course || !token) return;

    const currentTopic = course.curriculum[activeTopicIndex];
    
    try {
      // Check exam eligibility via backend
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/topic/${courseId}/${currentTopic.topicName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Navigate to exam component
        navigate(`/exam/topic/${courseId}/${currentTopic.topicName}`, {
          state: { examData: response.data.exam },
        });
      }
    } catch (error: any) {
      console.error('Error starting topic exam:', error);
      
      if (error.response?.status === 400) {
        toast({
          title: 'Not Eligible',
          description: error.response.data.message || 'Complete topic content first',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start topic exam',
          variant: 'destructive',
        });
      }
    }
  };

  // Start final exam
  const startFinalExam = async () => {
    if (!courseId || !token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/final/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        navigate(`/exam/final/${courseId}`, {
          state: { examData: response.data.exam },
        });
      }
    } catch (error: any) {
      console.error('Error starting final exam:', error);
      
      if (error.response?.status === 400) {
        toast({
          title: 'Not Eligible',
          description: error.response.data.message || 'Complete all topic exams first',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start final exam',
          variant: 'destructive',
        });
      }
    }
  };

  // Mark as complete manually
  const markAsComplete = async () => {
    if (!course || !enrollment || !token) return;

    try {
      setUpdatingProgress(true);
      const currentTopic = course.curriculum[activeTopicIndex];
      const currentSubTopic = currentTopic.subtopics[activeSubTopicIndex];

      await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: currentTopic.topicName,
          subTopicName: currentSubTopic.name,
          watchedDuration: currentSubTopic.duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVideoProgress(100);
      
      toast({
        title: 'Success',
        description: 'Marked as complete',
        variant: 'default',
      });

      // Refresh enrollment data
      const enrollmentResponse = await axios.get(
        `${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (enrollmentResponse.data?.data) {
        setEnrollment(enrollmentResponse.data.data);
      }

    } catch (error: any) {
      console.error('Error marking as complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as complete',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&enablejsapi=1`;
  };

  // Calculate course progress
  const calculateCourseProgress = (): number => {
    if (!enrollment || !course) return 0;
    
    return Math.round(
      (enrollment.totalWatchedDuration / course.totalDuration) * 100
    );
  };

  // Get current topic progress
  const getCurrentTopicProgress = (): TopicProgress | undefined => {
    if (!enrollment || !course) return undefined;
    
    const currentTopic = course.curriculum[activeTopicIndex];
    return enrollment.progress.find((p) => p.topicName === currentTopic.topicName);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/student/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  // Not enrolled
  if (!enrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not Enrolled</h2>
          <p className="text-gray-600 mb-4">You need to enroll in this course first.</p>
          <Button onClick={() => navigate('/student/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentTopic = course.curriculum[activeTopicIndex];
  const currentSubTopic = currentTopic.subtopics[activeSubTopicIndex];
  const topicProgress = getCurrentTopicProgress();
  const courseProgress = calculateCourseProgress();
  const youtubeVideoId = extractYouTubeId(currentVideoUrl);
  const isLastSubTopic = activeSubTopicIndex === currentTopic.subtopics.length - 1;
  const isLastTopic = activeTopicIndex === course.curriculum.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.courseName}
              </h1>
              <p className="text-gray-600">
                Instructor: {course.instructorName} • Progress: {courseProgress}%
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={enrollment.isPaid ? "default" : "secondary"}>
                {enrollment.isPaid ? 'Paid' : 'Free'}
              </Badge>
              {enrollment.courseCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Course Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{courseProgress}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Curriculum */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Curriculum
                </CardTitle>
                <CardDescription>
                  {course.curriculum.length} topics • {course.totalDuration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {course.curriculum.map((topic, topicIndex) => {
                    const progress = enrollment.progress.find(
                      (p) => p.topicName === topic.topicName
                    );
                    const isActive = topicIndex === activeTopicIndex;
                    const isCompleted = progress?.topicWatchedDuration >= progress?.topicTotalDuration;
                    const examPassed = progress?.passed;

                    return (
                      <div key={topic.topicName} className="space-y-1">
                        <button
                          onClick={() => goToTopic(topicIndex, 0)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-gray-300" />
                              )}
                              <span className="font-medium">{topic.topicName}</span>
                            </div>
                            {examPassed && (
                              <Award className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 pl-6">
                            {topic.subtopics.length} lessons • {topic.subtopics.reduce((sum, st) => sum + st.duration, 0)} min
                          </div>
                          {progress && (
                            <div className="mt-1 pl-6">
                              <Progress
                                value={(progress.topicWatchedDuration / progress.topicTotalDuration) * 100}
                                className="h-1"
                              />
                            </div>
                          )}
                        </button>

                        {/* Subtopic list */}
                        {isActive && (
                          <div className="ml-6 space-y-1">
                            {topic.subtopics.map((subtopic, subIndex) => {
                              const subProgress = progress?.subtopics.find(
                                (st) => st.subTopicName === subtopic.name
                              );
                              const isSubActive = subIndex === activeSubTopicIndex;
                              const isSubCompleted = subProgress?.watchedDuration >= subtopic.duration;

                              return (
                                <button
                                  key={subtopic.name}
                                  onClick={() => goToTopic(topicIndex, subIndex)}
                                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                    isSubActive
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isSubCompleted ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                                    )}
                                    <span className="truncate">{subtopic.name}</span>
                                    <span className="ml-auto text-xs text-gray-500">
                                      {subtopic.duration}m
                                    </span>
                                  </div>
                                  {subProgress && (
                                    <div className="mt-1 pl-5">
                                      <Progress
                                        value={(subProgress.watchedDuration / subtopic.duration) * 100}
                                        className="h-1"
                                      />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Course Resources */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.curriculumDocLink && (
                    <a
                      href={course.curriculumDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Curriculum Document</p>
                        <p className="text-sm text-gray-500">Download course syllabus</p>
                      </div>
                    </a>
                  )}
                  {course.demoVideoLink && (
                    <a
                      href={course.demoVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Video className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Demo Video</p>
                        <p className="text-sm text-gray-500">Course introduction</p>
                      </div>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player Section */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      {currentTopic.topicName}
                    </CardTitle>
                    <CardDescription>
                      Lesson {activeSubTopicIndex + 1} of {currentTopic.subtopics.length}: {currentSubTopic.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {currentSubTopic.duration} min
                    </Badge>
                    {topicProgress && topicProgress.examAttempted && (
                      <Badge className="bg-green-500 text-white">
                        Exam: {topicProgress.examScore}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* YouTube Video Player */}
                <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                  {youtubeVideoId ? (
                    <iframe
                      src={getYouTubeEmbedUrl(currentVideoUrl)}
                      title={currentSubTopic.name}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIsVideoReady(true)}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onEnded={handleVideoEnd}
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="h-12 w-12 mx-auto mb-4" />
                        <p>Video URL not supported</p>
                        <p className="text-sm text-gray-300 mt-2">
                          Direct link: <a href={currentVideoUrl} target="_blank" rel="noopener noreferrer" className="underline">Open video</a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Video Progress</span>
                      <span>{videoProgress}%</span>
                    </div>
                    <Progress value={videoProgress} className="h-2" />
                  </div>

                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={goToPreviousSubTopic}
                        disabled={activeSubTopicIndex === 0 || updatingProgress}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={goToNextSubTopic}
                        disabled={isLastSubTopic || updatingProgress}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={markAsComplete}
                        disabled={videoProgress === 100 || updatingProgress}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  </div>

                  {updatingProgress && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                      Saving progress...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Topic and Final Exam Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic Exam Card */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Topic Exam
                  </CardTitle>
                  <CardDescription>
                    Test your knowledge on {currentTopic.topicName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {topicExamEligibility.message}
                      </p>
                      {topicProgress?.examAttempted && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Score: {topicProgress.examScore}% •{' '}
                            {topicProgress.passed ? 'Passed' : 'Not Passed'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <Button
                      onClick={startTopicExam}
                      disabled={!showTopicExamButton || !topicExamEligibility.eligible}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Start Topic Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Final Exam Card */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Final Exam
                  </CardTitle>
                  <CardDescription>
                    Complete course assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {enrollment.finalExamEligible
                          ? enrollment.finalExamAttempted
                            ? 'Final exam already attempted'
                            : 'Eligible for final exam'
                          : 'Complete all topic exams first'}
                      </p>
                      
                      {enrollment.finalExamAttempted && (
                        <Alert>
                          <Award className="h-4 w-4" />
                          <AlertDescription>
                            Final exam attempted •{' '}
                            {enrollment.courseCompleted ? 'Course Completed!' : 'Need to pass final exam'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <Button
                      onClick={startFinalExam}
                      disabled={!showFinalExamButton}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Start Final Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="info">Additional Info</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-4">
                    <p className="text-gray-700">{course.courseDescription}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Instructor</p>
                        <p className="text-gray-600">{course.instructorName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-gray-600">{course.courseLanguage}</p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">{course.totalDuration} minutes</p>
                      </div>
                      <div>
                        <p className="font-medium">Certification</p>
                        <p className="text-gray-600">
                          {course.certificationProvided === 'yes' ? 'Available' : 'Not Available'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="curriculum" className="space-y-4">
                    <div className="space-y-3">
                      {course.curriculum.map((topic, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">
                            Topic {index + 1}: {topic.topicName}
                          </h4>
                          <ul className="space-y-2 ml-4">
                            {topic.subtopics.map((subtopic, subIndex) => (
                              <li key={subIndex} className="flex items-center justify-between">
                                <span>{subtopic.name}</span>
                                <span className="text-sm text-gray-500">
                                  {subtopic.duration} min
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="info">
                    <div className="space-y-4">
                      {course.additionalInformation && (
                        <div>
                          <h4 className="font-semibold mb-2">Additional Information</h4>
                          <p className="text-gray-700">{course.additionalInformation}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2">Course Provider</h4>
                        <p className="text-gray-700">{course.providerName}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate('/student/courses')}
            >
              Back to Courses
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTopicIndex > 0) {
                    goToTopic(activeTopicIndex - 1, 0);
                  }
                }}
                disabled={activeTopicIndex === 0}
              >
                Previous Topic
              </Button>
              
              <Button
                onClick={() => {
                  if (activeTopicIndex < course.curriculum.length - 1) {
                    goToTopic(activeTopicIndex + 1, 0);
                  }
                }}
                disabled={activeTopicIndex === course.curriculum.length - 1}
              >
                Next Topic
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
