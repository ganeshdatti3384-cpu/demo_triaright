// Pack365StreamLearning.tsx - New improved version
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Award,
  BookCopy,
  BarChart2,
  Users,
  FileText,
  Target,
  Video,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// Interfaces matching backend models
interface Topic {
  name: string;
  link: string;
  duration: number; // seconds
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink?: string;
  totalDuration: number; // seconds
  topics: Topic[];
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
  lastWatchedAt?: string;
}

interface StreamEnrollment {
  _id: string;
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  totalWatchedPercentage: number;
  totalCourseDuration: number;
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  topicProgress: TopicProgress[];
  paymentStatus: string;
}

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Progress tracking constants
const PROGRESS_QUEUE_KEY = 'pack365_progress_queue_v2';

const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // YouTube player refs
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoStartTimeRef = useRef<number>(0);
  const accumulatedWatchTimeRef = useRef<number>(0);

  // Load stream data and enrollment
  useEffect(() => {
    loadStreamData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [stream]);

  const loadStreamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Get user enrollments
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      if (!enrollmentResponse.success || !enrollmentResponse.enrollments) {
        throw new Error('Failed to load enrollment data');
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        toast({ 
          title: 'Access Denied', 
          description: 'You are not enrolled in this stream', 
          variant: 'destructive' 
        });
        navigate('/pack365');
        return;
      }

      setEnrollment(streamEnrollment);

      // Get courses for this stream
      const coursesResponse = await pack365Api.getAllCourses();
      if (!coursesResponse.success || !coursesResponse.data) {
        throw new Error('Failed to load courses');
      }

      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (streamCourses.length === 0) {
        toast({ 
          title: 'No Courses', 
          description: 'No courses available for this stream', 
          variant: 'destructive' 
        });
        return;
      }

      setCourses(streamCourses);
      setSelectedCourse(streamCourses[0]);

    } catch (error: any) {
      console.error('Error loading stream data:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to load stream data', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // YouTube API integration
  const loadYouTubeAPI = () => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready');
    };
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const initializePlayer = (videoContainer: HTMLDivElement, videoId: string) => {
    if (!window.YT) {
      setTimeout(() => initializePlayer(videoContainer, videoId), 100);
      return;
    }

    playerRef.current = new window.YT.Player(videoContainer, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  const onPlayerReady = (event: any) => {
    console.log('YouTube player ready');
    // Load existing progress if any
    if (selectedCourse && selectedTopic) {
      const existingProgress = getTopicProgress(selectedCourse._id, selectedTopic.name);
      if (existingProgress && existingProgress.watchedDuration > 0) {
        event.target.seekTo(existingProgress.watchedDuration, true);
        accumulatedWatchTimeRef.current = existingProgress.watchedDuration;
        updateVideoProgress();
      }
    }
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      startProgressTracking();
    } else if (state === window.YT.PlayerState.PAUSED) {
      stopProgressTracking();
      updateProgressToBackend(true);
    } else if (state === window.YT.PlayerState.ENDED) {
      stopProgressTracking();
      markTopicAsCompleted();
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event);
    toast({
      title: 'Video Error',
      description: 'Failed to load video. Please try again.',
      variant: 'destructive'
    });
  };

  const startProgressTracking = () => {
    setIsTrackingProgress(true);
    videoStartTimeRef.current = Date.now();
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      updateProgressToBackend(false);
    }, 5000); // Update every 5 seconds
  };

  const stopProgressTracking = () => {
    setIsTrackingProgress(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const updateVideoProgress = () => {
    if (!selectedTopic || !playerRef.current) return;
    
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    const duration = selectedTopic.duration;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    setVideoProgress(Math.min(100, progress));
    accumulatedWatchTimeRef.current = Math.max(accumulatedWatchTimeRef.current, currentTime);
  };

  const updateProgressToBackend = async (immediate = false) => {
    if (!selectedCourse || !selectedTopic || !playerRef.current) return;

    updateVideoProgress();

    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    const watchedDuration = Math.max(accumulatedWatchTimeRef.current, currentTime);

    // Only update backend if significant progress made or immediate flag
    if (!immediate && Math.abs(watchedDuration - accumulatedWatchTimeRef.current) < 5) {
      return;
    }

    accumulatedWatchTimeRef.current = watchedDuration;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setSyncing(true);

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: watchedDuration,
        totalCourseDuration: enrollment?.totalCourseDuration || 0
      });

      if (response.success) {
        // Refresh enrollment to get updated progress
        await loadStreamData();
      }
    } catch (error: any) {
      console.error('Failed to update progress:', error);
      // Queue for retry
      enqueueProgress({
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: watchedDuration,
        totalCourseDuration: enrollment?.totalCourseDuration || 0
      });
    } finally {
      setSyncing(false);
    }
  };

  const enqueueProgress = (data: any) => {
    try {
      const queue = JSON.parse(localStorage.getItem(PROGRESS_QUEUE_KEY) || '[]');
      queue.push(data);
      localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue progress:', error);
    }
  };

  const markTopicAsCompleted = async () => {
    if (!selectedCourse || !selectedTopic) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setSyncing(true);

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: selectedTopic.duration, // Mark as fully watched
        totalCourseDuration: enrollment?.totalCourseDuration || 0
      });

      if (response.success) {
        await loadStreamData(); // Refresh data
        toast({
          title: 'Topic Completed!',
          description: `"${selectedTopic.name}" marked as completed`,
          variant: 'default'
        });
        
        // Close modal after short delay
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error marking topic as completed:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark topic as completed',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    accumulatedWatchTimeRef.current = 0;

    // Load YouTube API and initialize player when modal opens
    setTimeout(() => {
      loadYouTubeAPI();
      const videoContainer = document.getElementById('youtube-player');
      if (videoContainer && topic.link) {
        const videoId = extractYouTubeVideoId(topic.link);
        if (videoId) {
          initializePlayer(videoContainer as HTMLDivElement, videoId);
        }
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    stopProgressTracking();
    
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo();
        playerRef.current.destroy();
      } catch (error) {
        console.error('Error cleaning up player:', error);
      }
      playerRef.current = null;
    }
  };

  const handleManualComplete = () => {
    markTopicAsCompleted();
  };

  const handleOpenInNewTab = () => {
    if (selectedTopic) {
      window.open(selectedTopic.link, '_blank');
    }
  };

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream to take the exam.',
        variant: 'destructive'
      });
    }
  };

  const handleTakeFinalExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 100) {
      navigate(`/exam/${stream}/final`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete 100% of the stream to take the final exam.',
        variant: 'destructive'
      });
    }
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return enrollment?.topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  const getCourseProgress = (course: Course) => {
    const courseTopics = enrollment?.topicProgress.filter(tp => tp.courseId === course._id) || [];
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    return course.topics.length > 0 ? (watchedTopics / course.topics.length) * 100 : 0;
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0 min';
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading course content...</p>
          </div>
        </div>
      </>
    );
  }

  if (!enrollment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enrollment Not Found</h2>
                <p className="text-gray-600 mb-4">We couldn't find your enrollment for this stream.</p>
                <Button onClick={() => navigate('/pack365')}>Browse Streams</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Video Learning Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTopic?.name}</span>
              <div className="flex items-center gap-2">
                {syncing && <span className="text-sm text-gray-500">Saving...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
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
                {/* YouTube Video Player */}
                <div 
                  id="youtube-player"
                  className="flex-1 bg-black rounded-lg mb-4"
                />
                
                {/* Progress Tracking */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Watching Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2 mb-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {isTrackingProgress ? (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tracking your progress...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          Play video to track progress
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleManualComplete}
                      variant="default"
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/pack365-dashboard')}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{stream} Stream</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {Math.round(enrollment.totalWatchedPercentage)}%
                      </span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-blue-600"
                        strokeWidth="10"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${enrollment.totalWatchedPercentage * 2.51} 251`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mt-4 text-center">Overall Completion</p>
                </CardContent>
              </Card>

              {/* Stream Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stream Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Enrolled On
                    </span>
                    <span className="font-semibold">{formatDate(enrollment.enrollmentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Courses
                    </span>
                    <span className="font-semibold">{courses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookCopy className="h-4 w-4" />
                      Topics Completed
                    </span>
                    <span className="font-semibold">
                      {enrollment.watchedTopics} / {enrollment.totalTopics}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Access Until
                    </span>
                    <span className="font-semibold">{formatDate(enrollment.expiresAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Eligibility */}
              {enrollment.totalWatchedPercentage >= 80 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Ready for Exam!</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      You've completed enough content to take the stream exam.
                    </p>
                    <Button 
                      onClick={handleTakeExam}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}

              {enrollment.totalWatchedPercentage >= 100 && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Final Exam Available</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      You've completed all courses! Take the final comprehensive exam.
                    </p>
                    <Button 
                      onClick={handleTakeFinalExam}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Take Final Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>
                    Select a course to start learning. Complete topics to unlock exams.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {courses.map((course) => (
                    <div
                      key={course._id}
                      className="border rounded-lg p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {course.courseName}
                            </h3>
                            <Badge variant="secondary">
                              {course.topics.length} topics
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {formatTime(course.totalDuration)}
                            </span>
                            {course.documentLink && (
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4" />
                                Study Materials
                              </span>
                            )}
                          </div>

                          {/* Course Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Course Progress</span>
                              <span>{Math.round(getCourseProgress(course))}%</span>
                            </div>
                            <Progress value={getCourseProgress(course)} className="h-2" />
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedCourse(course)}
                          className="flex-shrink-0"
                          variant="default"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Selected Course Details */}
              {selectedCourse && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{selectedCourse.courseName}</CardTitle>
                    <CardDescription>{selectedCourse.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Course Materials */}
                    {selectedCourse.documentLink && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <div>
                              <h4 className="font-medium">Course Materials</h4>
                              <p className="text-sm text-gray-600">Download study materials</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(selectedCourse.documentLink, '_blank')}
                            variant="outline"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Topics List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                      {selectedCourse.topics.map((topic, index) => {
                        const progress = getTopicProgress(selectedCourse._id, topic.name);
                        const isWatched = progress?.watched;
                        const watchedDuration = progress?.watchedDuration || 0;
                        const progressPercent = topic.duration > 0 ? 
                          Math.min(100, (watchedDuration / topic.duration) * 100) : 0;

                        return (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg transition-colors ${
                              isWatched
                                ? 'bg-green-50 border-green-200'
                                : watchedDuration > 0
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isWatched ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : watchedDuration > 0 ? (
                                  <Play className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Play className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                  <h4 className="font-medium">{topic.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatTime(topic.duration)}
                                    </span>
                                    {isWatched && (
                                      <Badge variant="outline" className="bg-green-100 text-green-800">
                                        Completed
                                      </Badge>
                                    )}
                                    {watchedDuration > 0 && !isWatched && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        In Progress ({Math.round(progressPercent)}%)
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(topic.link, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  New Tab
                                </Button>
                                <Button
                                  variant={isWatched ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleTopicClick(topic)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  {isWatched ? 'Watch Again' : 'Watch'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365StreamLearning;
