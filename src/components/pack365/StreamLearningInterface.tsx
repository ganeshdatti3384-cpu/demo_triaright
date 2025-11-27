// StreamLearningInterface.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  Clock,
  ArrowLeft,
  CheckCircle,
  Circle,
  BookOpen,
  Award,
  Lock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
  _id: string;
  stream: string;
  topics: Topic[];
  documentLink?: string;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
  lastWatchedAt?: string;
}

interface StreamEnrollment {
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  coursesCount: number;
  totalTopics: number;
  courses: Course[];
  topicProgress: TopicProgress[];
  totalWatchedPercentage: number;
  isExamCompleted?: boolean;
  examScore?: number;
}

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-gray-200 rounded-xl h-96"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 rounded-lg h-12"></div>
            <div className="bg-gray-200 rounded-lg h-12"></div>
            <div className="bg-gray-200 rounded-lg h-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);

  // --- STATES ADDED FROM OLD FILE FOR PROGRESS LOGIC (required by copied functions) ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [progressIntervalId, setProgressIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [examEligible, setExamEligible] = useState(false);
  // -----------------------------------------------------------------------------------

  // Get current topic
  const currentTopic = currentCourse?.topics?.[currentTopicIndex];

  useEffect(() => {
    const initializeLearning = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Get state from navigation
        const stateCourse = location.state?.selectedCourse as Course;
        const stateEnrollment = location.state?.enrollment as StreamEnrollment;

        console.log('Location state:', location.state);
        console.log('State course:', stateCourse);
        console.log('State enrollment:', stateEnrollment);

        if (stateCourse && stateEnrollment) {
          setCurrentCourse(stateCourse);
          setSelectedCourse(stateCourse); // keep selectedCourse in sync for old logic
          setEnrollment(stateEnrollment);
          setTopicProgress(stateEnrollment.topicProgress || []);
          calculateCourseProgress(stateCourse, stateEnrollment.topicProgress || []);
        } else {
          // Fetch fresh data if not passed via state
          await fetchEnrollmentData(token);
        }
      } catch (error: any) {
        console.error('Error initializing learning:', error);
        toast({ title: 'Error', description: 'Failed to load course content.', variant: 'destructive' });
        navigate('/pack365-dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeLearning();
    // clear any old interval on unmount
    return () => {
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, location.state]);

  const fetchEnrollmentData = async (token: string) => {
    try {
      const response = await pack365Api.getMyEnrollments(token);
      if (response.success && response.enrollments) {
        const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
        const currentEnrollment = streamEnrollments.find(
          (e) => e.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (currentEnrollment && currentEnrollment.courses?.length > 0) {
          setEnrollment(currentEnrollment);
          // Set first available course
          const firstCourse = currentEnrollment.courses[0];
          setCurrentCourse(firstCourse);
          setSelectedCourse(firstCourse); // keep selectedCourse in sync for old logic
          setTopicProgress(currentEnrollment.topicProgress || []);
          calculateCourseProgress(firstCourse, currentEnrollment.topicProgress || []);
        } else {
          toast({ title: 'Error', description: 'No courses found in this stream.', variant: 'destructive' });
          navigate('/pack365-dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      throw error;
    }
  };

  const calculateCourseProgress = (course: Course, topicProgressState: TopicProgress[]) => {
    if (!course.topics || course.topics.length === 0) {
      setCourseProgress(0);
      return;
    }

    const courseTopicsProgress = topicProgressState.filter(
      progress => progress.courseId === course.courseId || progress.courseId === course._id
    );

    const completedTopics = courseTopicsProgress.filter(progress => progress.watched).length;
    const progressPercentage = (completedTopics / course.topics.length) * 100;
    setCourseProgress(Math.round(progressPercentage));
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // --- REMOVED/DISABLED NEW FILE'S PROGRESS-TRACKING LOGIC ---
  // The following functions and logic from the new file were intentionally removed or disabled:
  // - updateTopicProgress (new version)
  // - startProgressTracking (new version)
  // - calculateTotalWatchedPercentage
  // - New interval-based progress logic that relied on isPlaying
  // We will instead use the old file's working progress-tracking functions copied below.
  // -------------------------------------------------------------------------------------

  // --- COPIED EXACTLY FROM OLD FILE: progress tracking and marking completion ---
  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setIsTrackingProgress(false);

    if (progressIntervalId) {
      clearInterval(progressIntervalId);
    }

    const intervalId = startProgressTracking(topic);
    setProgressIntervalId(intervalId);
  };

  const startProgressTracking = (topic: Topic): NodeJS.Timeout => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        markTopicAsCompleted(topic);
        return;
      }
      
      progress += (100 / (topic.duration * 60)) * 5;
      if (progress > 100) progress = 100;
      
      setVideoProgress(progress);
      
      if (progress >= 80 && isTrackingProgress) {
        markTopicAsCompleted(topic);
        clearInterval(interval);
      }
    }, 5000);

    setIsTrackingProgress(true);
    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic) => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentTopicProgress = getTopicProgress(selectedCourse._id, topic.name);
      if (currentTopicProgress?.watched) {
        setIsTrackingProgress(false);
        return;
      }

      // Calculate total course duration for progress calculation
      const totalCourseDuration = selectedCourse.topics.reduce((sum, t) => sum + t.duration, 0);
      const newWatchedPercentage = calculateNewProgress();

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse.courseId,
        topicName: topic.name,
        watchedDuration: topic.duration * 60, // Convert to seconds
        totalCourseDuration: totalCourseDuration * 60, // Convert to seconds
        totalWatchedPercentage: newWatchedPercentage
      });

      if (response.success) {
        setTopicProgress(prev => {
          const existingIndex = prev.findIndex(
            tp => tp.topicName === topic.name && tp.courseId === selectedCourse._id
          );
          
          if (existingIndex >= 0) {
            return prev.map((tp, index) => 
              index === existingIndex 
                ? { 
                    ...tp, 
                    watched: true, 
                    watchedDuration: topic.duration * 60,
                    lastWatchedAt: new Date().toISOString()
                  }
                : tp
            );
          } else {
            return [
              ...prev,
              {
                courseId: selectedCourse._id,
                topicName: topic.name,
                watched: true,
                watchedDuration: topic.duration * 60,
                lastWatchedAt: new Date().toISOString()
              }
            ];
          }
        });

        // Update enrollment progress
        if (enrollment) {
          setEnrollment({
            ...enrollment,
            totalWatchedPercentage: newWatchedPercentage
          });
        }

        setIsTrackingProgress(false);
        
        // Note: old file called checkExamEligibility() here. We don't copy that because
        // new file computes exam availability based on courseProgress. However we keep examEligible state in case other logic uses it.
        
        toast({
          title: 'Progress Updated',
          description: `"${topic.name}" marked as completed!`,
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update progress', 
        variant: 'destructive' 
      });
    }
  };

  const calculateNewProgress = (): number => {
    if (!selectedCourse) return 0;
    
    const courseTopics = selectedCourse.topics || [];
    const currentWatched = topicProgress.filter(tp => 
      tp.courseId === selectedCourse._id && tp.watched
    ).length;
    
    const newWatchedCount = currentWatched + 1;
    return Math.round((newWatchedCount / courseTopics.length) * 100);
  };

  const handleManualComplete = async (topic: Topic) => {
    await markTopicAsCompleted(topic);
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
    setIsTrackingProgress(false);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };
  // --- END COPIED OLD FUNCTIONS ---

  // Update: keep selectedCourse in sync with currentCourse for old logic to operate
  useEffect(() => {
    if (currentCourse) {
      setSelectedCourse(currentCourse);
    }
  }, [currentCourse]);

  // Keep topicProgress state in sync when enrollment loads/changes
  useEffect(() => {
    if (enrollment && enrollment.topicProgress) {
      setTopicProgress(enrollment.topicProgress);
    }
  }, [enrollment]);

  // Handle topic completion: use old markTopicAsCompleted behavior
  const handleTopicComplete = () => {
    if (!currentTopic) return;

    // Use the old markTopicAsCompleted function path:
    // Ensure selectedCourse is set
    if (!selectedCourse && currentCourse) {
      setSelectedCourse(currentCourse);
    }

    // mark using the currentTopic (passed to old function)
    markTopicAsCompleted(currentTopic);
    setVideoProgress(100);
    setIsPlaying(false);
  };

  // Navigate to next topic - ensure we start tracking using old handleTopicClick
  const goToNextTopic = () => {
    if (!currentCourse?.topics) return;

    if (currentTopicIndex < currentCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      setCurrentTopicIndex(nextIndex);
      setVideoProgress(0);
      setIsPlaying(false);

      // Start old tracking for next topic
      const nextTopic = currentCourse.topics[nextIndex];
      // Ensure selectedCourse set
      if (!selectedCourse) setSelectedCourse(currentCourse);
      handleTopicClick(nextTopic);
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      setCurrentTopicIndex(prevIndex);
      setVideoProgress(0);
      setIsPlaying(false);

      const prevTopic = currentCourse!.topics[prevIndex];
      if (!selectedCourse) setSelectedCourse(currentCourse);
      handleTopicClick(prevTopic);
    }
  };

  // Check if topic is watched using enrollment/topicProgress (old behavior)
  const isTopicWatched = (topicName: string): boolean => {
    if (!enrollment?.topicProgress || !currentCourse) return false;

    return enrollment.topicProgress.some(
      progress => 
        (progress.courseId === currentCourse.courseId || progress.courseId === currentCourse._id) &&
        progress.topicName === topicName &&
        progress.watched
    );
  };

  // Check if exam is available (80% course completion)
  const isExamAvailable = (): boolean => {
    return courseProgress >= 80;
  };

  // Handle exam start
  const handleStartExam = () => {
    if (!currentCourse) return;

    navigate(`/exam/${stream}/course/${currentCourse.courseId}`, {
      state: {
        course: currentCourse,
        enrollment: enrollment
      }
    });
  };

  // Get next course in stream
  const getNextCourse = (): Course | null => {
    if (!enrollment?.courses || !currentCourse) return null;

    const currentIndex = enrollment.courses.findIndex(
      course => course.courseId === currentCourse.courseId
    );

    if (currentIndex < enrollment.courses.length - 1) {
      return enrollment.courses[currentIndex + 1];
    }

    return null;
  };

  // Check if current course exam is completed
  const isCourseExamCompleted = (): boolean => {
    return enrollment?.isExamCompleted || false;
  };

  // Handle next course
  const handleNextCourse = () => {
    const nextCourse = getNextCourse();
    if (nextCourse) {
      setCurrentCourse(nextCourse);
      setSelectedCourse(nextCourse); // keep in sync for old logic
      setCurrentTopicIndex(0);
      setVideoProgress(0);
      setIsPlaying(false);
      calculateCourseProgress(nextCourse, enrollment?.topicProgress || []);
    }
  };

  // Handle certificate generation (for last course completion)
  const handleGenerateCertificate = () => {
    if (!enrollment) return;

    navigate(`/certificate/${stream}`, {
      state: {
        enrollment: enrollment,
        stream: stream
      }
    });
  };

  // Check if this is the last course and all exams are completed
  const isStreamCompleted = (): boolean => {
    if (!enrollment?.courses || !currentCourse) return false;

    const isLastCourse = enrollment.courses[enrollment.courses.length - 1].courseId === currentCourse.courseId;
    return isLastCourse && isCourseExamCompleted();
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!currentCourse || !enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find the course details.</p>
          <Button onClick={() => navigate('/pack365-dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const videoId = currentTopic ? getYouTubeVideoId(currentTopic.link) : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate(`/pack365-learning/${stream}`)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stream
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentCourse.courseName}</h1>
                <p className="text-gray-600 mt-2">{currentCourse.description}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Badge variant={courseProgress >= 80 ? "default" : "secondary"} className="text-sm">
                  {courseProgress}% Complete
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Course Progress</span>
                <span>{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentTopic?.name || 'No Topic Selected'}</span>
                    {currentTopic && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {currentTopic.duration} min
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {videoId ? (
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                      <iframe
                        ref={playerRef}
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={currentTopic.name}
                        className="w-full h-96 lg:h-[500px]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => { /* iframe doesn't reliably emit play/pause events; tracking is managed by old logic started on topic click */ }}
                        onEnded={handleTopicComplete}
                      />
                    </div>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No video available for this topic</p>
                      </div>
                    </div>
                  )}

                  {/* Video Controls */}
                  {currentTopic && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(videoProgress)}%</span>
                      </div>
                      <Progress value={videoProgress} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={goToPreviousTopic}
                          disabled={currentTopicIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          {isTopicWatched(currentTopic.name) && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          {updatingProgress && (
                            <Badge variant="secondary" className="text-xs">
                              Saving...
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          onClick={goToNextTopic}
                          disabled={currentTopicIndex === (currentCourse.topics?.length || 0) - 1}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {isExamAvailable() && !isCourseExamCompleted() && (
                  <Button onClick={handleStartExam} className="flex-1">
                    <Award className="h-4 w-4 mr-2" />
                    Take Course Exam
                  </Button>
                )}

                {isCourseExamCompleted() && getNextCourse() && (
                  <Button onClick={handleNextCourse} className="flex-1" variant="default">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Continue to Next Course
                  </Button>
                )}

                {isStreamCompleted() && (
                  <Button onClick={handleGenerateCertificate} className="flex-1" variant="default">
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </Button>
                )}

                {!isExamAvailable() && (
                  <div className="flex-1 text-center py-2 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Complete {80 - courseProgress}% more to unlock exam
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Topics Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Course Topics</CardTitle>
                  <CardDescription>
                    {currentCourse.topics?.length || 0} topics • {currentCourse.totalDuration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentCourse.topics?.map((topic, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          index === currentTopicIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          isTopicWatched(topic.name) ? 'bg-green-50 border-green-200' : ''
                        }`}
                        onClick={() => {
                          // Use old logic to start tracking when user clicks a topic
                          setCurrentTopicIndex(index);
                          setVideoProgress(0);
                          setIsPlaying(false);
                          // Ensure selectedCourse in sync
                          if (!selectedCourse && currentCourse) setSelectedCourse(currentCourse);
                          handleTopicClick(topic);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isTopicWatched(topic.name) ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate">{topic.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {topic.duration}m
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {(!currentCourse.topics || currentCourse.topics.length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        No topics available for this course
                      </div>
                    )}
                  </div>

                  {/* Course Progress Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Progress Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Topics Completed:</span>
                        <span>
                          {currentCourse.topics?.filter(topic => isTopicWatched(topic.name)).length || 0}/
                          {currentCourse.topics?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Progress:</span>
                        <span>{courseProgress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Available:</span>
                        <span>
                          {isExamAvailable() ? (
                            <Badge variant="default" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamLearningInterface;
