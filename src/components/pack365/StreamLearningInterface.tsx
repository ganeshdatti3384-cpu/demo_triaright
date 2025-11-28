import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  ArrowLeft,
  Award,
  Video,
  FileText,
  X,
  ExternalLink,
  Circle,
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
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number;
  topics: Topic[];
}

// Local storage interfaces
interface LocalTopicProgress {
  watched: boolean;
  watchedDuration: number;
  lastUpdated: string;
  completedAt?: string;
}

interface LocalProgress {
  [key: string]: LocalTopicProgress;
}

interface CourseProgress {
  completedTopics: number;
  totalTopics: number;
  overallProgress: number;
}

interface BackendTopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface BackendEnrollment {
  stream: string;
  topicProgress: BackendTopicProgress[];
  totalWatchedPercentage: number;
  watchedTopics?: number;
  totalTopics?: number;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [localProgress, setLocalProgress] = useState<LocalProgress>({});
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    completedTopics: 0,
    totalTopics: 0,
    overallProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [progressIntervalId, setProgressIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [examEligible, setExamEligible] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [realWatchedSeconds, setRealWatchedSeconds] = useState<number>(0);
  const [videoStartTime, setVideoStartTime] = useState<number | null>(null);

  // Load local progress from localStorage on component mount
  useEffect(() => {
    loadLocalProgress();
  }, []);

  useEffect(() => {
    loadStreamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  useEffect(() => {
    // Update course progress whenever localProgress or selectedCourse changes
    if (selectedCourse) {
      updateCourseProgress();
    }
  }, [localProgress, selectedCourse, enrollment]);

  useEffect(() => {
    return () => {
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
      }
    };
  }, [progressIntervalId]);

  // Load local progress from localStorage
  const loadLocalProgress = () => {
    try {
      const savedProgress = localStorage.getItem(`pack365-progress-${stream}`);
      if (savedProgress) {
        setLocalProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.warn('Failed to load local progress:', error);
    }
  };

  // Save progress to localStorage
  const saveLocalProgress = (courseId: string, topicName: string, progressData: LocalTopicProgress) => {
    const key = `${courseId}-${topicName}`;
    const updatedProgress = {
      ...localProgress,
      [key]: {
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
    };
    
    setLocalProgress(updatedProgress);
    
    // Save to localStorage
    try {
      localStorage.setItem(`pack365-progress-${stream}`, JSON.stringify(updatedProgress));
    } catch (error) {
      console.warn('Failed to save local progress:', error);
      toast({
        title: 'Storage Warning',
        description: 'Progress may not be saved locally',
        variant: 'destructive'
      });
    }
  };

  // Get local progress for a specific topic
  const getLocalProgress = (courseId: string, topicName: string): LocalTopicProgress => {
    const key = `${courseId}-${topicName}`;
    return localProgress[key] || { watched: false, watchedDuration: 0, lastUpdated: new Date().toISOString() };
  };

  // Calculate topic counts from backend data
  const calculateTopicCountsFromBackend = (): { completed: number; total: number } => {
    if (!selectedCourse || !enrollment?.topicProgress) {
      return { completed: 0, total: 0 };
    }

    const courseTopics = enrollment.topicProgress.filter((tp: BackendTopicProgress) => 
      tp.courseId === selectedCourse._id
    );

    const completed = courseTopics.filter((tp: BackendTopicProgress) => tp.watched).length;
    const total = courseTopics.length;

    return { completed, total };
  };

  // Sync local storage with backend data
  const syncLocalWithBackend = async (backendEnrollment: any, streamCourses: Course[]) => {
    try {
      const localProgressKey = `pack365-progress-${stream}`;
      let localProgress = JSON.parse(localStorage.getItem(localProgressKey) || '{}');
      let hasChanges = false;

      // For each course in the stream
      streamCourses.forEach(course => {
        // For each topic in the course
        course.topics.forEach(topic => {
          const localKey = `${course._id}-${topic.name}`;
          const backendTopic = backendEnrollment.topicProgress?.find((tp: BackendTopicProgress) => 
            tp.courseId === course._id && tp.topicName === topic.name
          );

          if (backendTopic) {
            // If backend has more progress, update local storage
            if (backendTopic.watched && (!localProgress[localKey] || !localProgress[localKey].watched)) {
              localProgress[localKey] = {
                watched: true,
                watchedDuration: Math.max(localProgress[localKey]?.watchedDuration || 0, backendTopic.watchedDuration),
                lastUpdated: new Date().toISOString()
              };
              hasChanges = true;
            } else if (backendTopic.watchedDuration > (localProgress[localKey]?.watchedDuration || 0)) {
              // If backend has more watched duration, update local
              localProgress[localKey] = {
                ...localProgress[localKey],
                watchedDuration: backendTopic.watchedDuration,
                lastUpdated: new Date().toISOString()
              };
              hasChanges = true;
            }
          }
        });
      });

      if (hasChanges) {
        localStorage.setItem(localProgressKey, JSON.stringify(localProgress));
        setLocalProgress(localProgress);
        console.log('Synced local storage with backend data');
      }

    } catch (error) {
      console.warn('Failed to sync local storage with backend:', error);
    }
  };

  // Update course progress statistics
  const updateCourseProgress = () => {
    if (!selectedCourse) return;

    let completedTopics = 0;
    let totalWatchedDuration = 0;
    let totalDuration = 0;

    // Calculate from local storage (primary source)
    selectedCourse.topics.forEach(topic => {
      const progress = getLocalProgress(selectedCourse._id, topic.name);
      if (progress.watched) {
        completedTopics++;
      }
      totalWatchedDuration += progress.watchedDuration;
      totalDuration += topic.duration * 60; // Convert minutes to seconds
    });

    // If we have backend data, merge it (as backup/verification)
    if (enrollment?.topicProgress) {
      const backendCompleted = enrollment.topicProgress.filter((tp: BackendTopicProgress) => 
        tp.courseId === selectedCourse._id && tp.watched
      ).length;
      
      // Use the higher count between local and backend
      completedTopics = Math.max(completedTopics, backendCompleted);
    }

    const overallProgress = totalDuration > 0 ? Math.min(100, (totalWatchedDuration / totalDuration) * 100) : 0;

    setCourseProgress({
      completedTopics,
      totalTopics: selectedCourse.topics.length,
      overallProgress
    });

    // Check exam eligibility based on completed topics
    const isAllTopicsCompleted = completedTopics === selectedCourse.topics.length;
    setExamEligible(isAllTopicsCompleted);
    
    console.log('Exam Eligibility Check:', {
      completedTopics,
      totalTopics: selectedCourse.topics.length,
      isAllTopicsCompleted,
      examEligible: isAllTopicsCompleted
    });
  };

  const loadStreamData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Check enrollment status
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      
      if (!enrollmentResponse.success || !enrollmentResponse.enrollments) {
        setError('Failed to load enrollment data');
        toast({ title: 'Error', description: 'Failed to load enrollment data', variant: 'destructive' });
        return;
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }

      setEnrollment(streamEnrollment);

      const coursesResponse = await pack365Api.getAllCourses();
      
      if (!coursesResponse.success || !coursesResponse.data) {
        setError('Failed to load courses');
        toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        return;
      }

      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      ) || [];

      if (streamCourses.length === 0) {
        setError('No courses found for this stream');
        toast({ title: 'No Courses', description: 'No courses available for this stream', variant: 'destructive' });
        return;
      }

      setCourses(streamCourses);

      const selectedCourseFromState = (location.state as any)?.selectedCourse;
      const selectedCourseId = (location.state as any)?.selectedCourseId;
      
      if (selectedCourseFromState) {
        setSelectedCourse(selectedCourseFromState);
      } else if (selectedCourseId) {
        const course = streamCourses.find((c: Course) => c.courseId === selectedCourseId);
        setSelectedCourse(course || streamCourses[0]);
      } else {
        setSelectedCourse(streamCourses[0]);
      }

      // Sync local storage with backend data on initial load
      await syncLocalWithBackend(streamEnrollment, streamCourses);

    } catch (error: any) {
      console.error('Error loading stream data:', error);
      setError('Failed to load stream data');
      toast({ 
        title: 'Error', 
        description: 'Failed to load stream data. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic, index: number) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setCurrentTopicIndex(index);
    setIsVideoModalOpen(true);
    
    // Load existing progress for this topic
    const existingProgress = getLocalProgress(selectedCourse._id, topic.name);
    const topicDurationSeconds = topic.duration * 60;
    const progressPercentage = Math.min(100, (existingProgress.watchedDuration / topicDurationSeconds) * 100);
    
    setVideoProgress(progressPercentage);
    setRealWatchedSeconds(existingProgress.watchedDuration);
    setVideoStartTime(Date.now());
    setIsTrackingProgress(false);

    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }

    const intervalId = startRealProgressTracking(topic);
    setProgressIntervalId(intervalId);
  };

  const startRealProgressTracking = (topic: Topic): NodeJS.Timeout => {
    const interval = setInterval(() => {
      if (videoStartTime) {
        const secondsWatched = Math.floor((Date.now() - videoStartTime) / 1000);
        const totalWatchedSeconds = realWatchedSeconds + secondsWatched;
        setRealWatchedSeconds(totalWatchedSeconds);
        
        const topicDurationSeconds = topic.duration * 60;
        const progress = Math.min(100, (totalWatchedSeconds / topicDurationSeconds) * 100);
        setVideoProgress(progress);
        
        // Auto-save progress every 15 seconds (more frequent for better UX)
        if (secondsWatched % 15 === 0) {
          saveLocalProgress(selectedCourse!._id, topic.name, {
            watched: progress >= 80,
            watchedDuration: totalWatchedSeconds,
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Auto-complete at 80% progress
        if (progress >= 80 && !getLocalProgress(selectedCourse!._id, topic.name).watched) {
          markTopicAsCompleted(topic, totalWatchedSeconds);
          clearInterval(interval);
          setProgressIntervalId(null);
        }
      }
    }, 1000);

    setIsTrackingProgress(true);
    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic, watchedSeconds?: number) => {
    if (!selectedCourse) return;

    const finalWatchedSeconds = watchedSeconds && watchedSeconds > 0
      ? watchedSeconds
      : (topic.duration * 60);

    // Update local storage immediately with completion
    saveLocalProgress(selectedCourse._id, topic.name, {
      watched: true,
      watchedDuration: finalWatchedSeconds,
      lastUpdated: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });

    // Update backend - but don't rely on its response for UI updates
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await pack365Api.updateTopicProgress(token, {
          courseId: selectedCourse._id,
          topicName: topic.name,
          watchedDuration: finalWatchedSeconds
        });
        console.log('Topic completion synced with backend');
      }
    } catch (error: any) {
      console.warn('Backend sync failed, but progress saved locally:', error);
      // Don't show error to user - progress is saved locally
    }

    // Update UI immediately from local storage
    updateCourseProgress();
    
    setIsTrackingProgress(false);
    
    toast({
      title: 'Topic Completed! 🎉',
      description: `"${topic.name}" has been marked as completed.`,
      variant: 'default'
    });
  };

  const handleManualComplete = async (topic: Topic) => {
    const finalWatchedSeconds = realWatchedSeconds > 0 ? realWatchedSeconds : (topic.duration * 60);
    await markTopicAsCompleted(topic, finalWatchedSeconds);
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
  };

  const handleCloseModal = () => {
    // Save current progress before closing (if any progress was made)
    if (selectedTopic && selectedCourse && realWatchedSeconds > 0) {
      const currentProgress = getLocalProgress(selectedCourse._id, selectedTopic.name);
      const newWatchedDuration = Math.max(currentProgress.watchedDuration, realWatchedSeconds);
      
      saveLocalProgress(selectedCourse._id, selectedTopic.name, {
        watched: currentProgress.watched || videoProgress >= 80,
        watchedDuration: newWatchedDuration,
        lastUpdated: new Date().toISOString()
      });
    }
    
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
    setIsTrackingProgress(false);
    setRealWatchedSeconds(0);
    setVideoStartTime(null);
  };

  const isTopicWatched = (topicName: string): boolean => {
    if (!selectedCourse) return false;
    const progress = getLocalProgress(selectedCourse._id, topicName);
    return progress.watched;
  };

  const getTopicProgressPercentage = (topicName: string): number => {
    if (!selectedCourse) return 0;
    const topic = selectedCourse.topics.find(t => t.name === topicName);
    if (!topic) return 0;
    
    const progress = getLocalProgress(selectedCourse._id, topicName);
    const topicDurationSeconds = topic.duration * 60;
    return Math.min(100, (progress.watchedDuration / topicDurationSeconds) * 100);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    console.log('Take exam clicked:', {
      stream,
      examEligible,
      completedTopics: courseProgress.completedTopics,
      totalTopics: courseProgress.totalTopics
    });

    if (examEligible) {
      console.log('Navigating to exam page for stream:', stream);
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: `You need to complete all topics to unlock the exam. Completed: ${courseProgress.completedTopics}/${courseProgress.totalTopics}`,
        variant: 'destructive'
      });
    }
  };

  const goToNextTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex < selectedCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      const nextTopic = selectedCourse.topics[nextIndex];
      setCurrentTopicIndex(nextIndex);
      setSelectedTopic(nextTopic);
      
      // Load progress for next topic
      const existingProgress = getLocalProgress(selectedCourse._id, nextTopic.name);
      const topicDurationSeconds = nextTopic.duration * 60;
      const progressPercentage = Math.min(100, (existingProgress.watchedDuration / topicDurationSeconds) * 100);
      
      setVideoProgress(progressPercentage);
      setRealWatchedSeconds(existingProgress.watchedDuration);
      setVideoStartTime(Date.now());
      setIsTrackingProgress(false);

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        setProgressIntervalId(null);
      }

      const intervalId = startRealProgressTracking(nextTopic);
      setProgressIntervalId(intervalId);
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      const prevTopic = selectedCourse?.topics[prevIndex];
      setCurrentTopicIndex(prevIndex);
      setSelectedTopic(prevTopic || null);
      
      if (prevTopic) {
        const existingProgress = getLocalProgress(selectedCourse!._id, prevTopic.name);
        const topicDurationSeconds = prevTopic.duration * 60;
        const progressPercentage = Math.min(100, (existingProgress.watchedDuration / topicDurationSeconds) * 100);
        
        setVideoProgress(progressPercentage);
        setRealWatchedSeconds(existingProgress.watchedDuration);
      }
      
      setVideoStartTime(Date.now());
      setIsTrackingProgress(false);

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        setProgressIntervalId(null);
      }

      if (prevTopic) {
        const intervalId = startRealProgressTracking(prevTopic);
        setProgressIntervalId(intervalId);
      }
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Content</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={loadStreamData} variant="default">
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/pack365-dashboard')} variant="outline">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading course content.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTopic?.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedTopic && handleOpenInNewTab(selectedTopic)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {selectedTopic && (
              <>
                {/* YouTube Video Embed */}
                <div className="flex-1 bg-black rounded-lg mb-4">
                  {extractYouTubeVideoId(selectedTopic.link) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedTopic.link)}?autoplay=1`}
                      title={selectedTopic.name}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg mb-2">Video not available</p>
                        <Button 
                          onClick={() => handleOpenInNewTab(selectedTopic)}
                          variant="default"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Video Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Tracking */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Watching Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2 mb-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={goToPreviousTopic}
                        disabled={currentTopicIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      
                      <div className="text-sm text-gray-600">
                        {isTopicWatched(selectedTopic.name) ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : isTrackingProgress ? (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Watching... ({realWatchedSeconds}s)
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Not completed yet
                          </span>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={goToNextTopic}
                        disabled={currentTopicIndex === (selectedCourse?.topics?.length || 0) - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => selectedTopic && handleManualComplete(selectedTopic)}
                      variant="default"
                      size="sm"
                      disabled={isTopicWatched(selectedTopic.name)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isTopicWatched(selectedTopic.name) ? 'Completed' : 'Mark as Completed'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <Button 
                onClick={() => navigate(`/pack365-learning/${stream}`)}
                variant="outline"
                className="self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stream
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedCourse?.courseName}</h1>
                <p className="text-gray-600 mt-2">{selectedCourse?.description}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Badge variant={courseProgress.overallProgress >= 100 ? "default" : "secondary"} className="text-sm">
                  {courseProgress.completedTopics}/{courseProgress.totalTopics} Topics
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Content Section - Clean white area */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Welcome to {selectedCourse?.courseName}</span>
                    {selectedTopic && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedTopic.duration} min
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[500px]">
                    <div className="text-center max-w-md mx-auto p-8">
                      <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Welcome to {selectedCourse?.courseName}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Ready to start your learning journey?
                      </p>
                      <p className="text-gray-500 text-sm mb-6">
                        Select a topic from the sidebar to begin watching the course content
                      </p>
                      <Button 
                        onClick={() => {
                          const firstTopic = selectedCourse?.topics?.[0];
                          if (firstTopic) {
                            handleTopicClick(firstTopic, 0);
                          } else {
                            toast({
                              title: 'No Topics',
                              description: 'No topics available for this course.',
                              variant: 'destructive'
                            });
                          }
                        }}
                        variant="default"
                        size="lg"
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Play className="h-4 w-4" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Topics & Progress */}
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Course Topics</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Syllabus
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedCourse?.topics.length || 0} topics • {selectedCourse?.totalDuration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedCourse?.topics.map((topic, index) => {
                      const isWatched = isTopicWatched(topic.name);
                      const isCurrent = index === currentTopicIndex;
                      const topicProgress = getTopicProgressPercentage(topic.name);

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${
                            isWatched ? 'bg-green-50 border-green-200' : ''
                          }`}
                          onClick={() => handleTopicClick(topic, index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isWatched ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="relative">
                                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  {topicProgress > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-gray-600">
                                        {Math.round(topicProgress)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <span className="text-sm font-medium truncate">{topic.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {topic.duration}m
                            </Badge>
                          </div>
                          {!isWatched && topicProgress > 0 && (
                            <div className="mt-2">
                              <Progress value={topicProgress} className="h-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {(!selectedCourse?.topics || selectedCourse.topics.length === 0) && (
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
                        <span>Completed Topics:</span>
                        <span>
                          {courseProgress.completedTopics}/{courseProgress.totalTopics}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Available:</span>
                        <span>
                          {examEligible ? (
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

                    {examEligible && (
                      <Button
                        onClick={handleTakeExam}
                        className="w-full mt-4 flex items-center justify-center gap-2"
                        variant="default"
                      >
                        <Award className="h-4 w-4" />
                        Take Stream Exam
                      </Button>
                    )}
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
