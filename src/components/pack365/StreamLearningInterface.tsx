import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Target
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
  lastWatchedAt?: string;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [totalWatchedPercentage, setTotalWatchedPercentage] = useState<number>(0);
  const [isPlayerInitializing, setIsPlayerInitializing] = useState(false);
  
  // YouTube Player Refs
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const ytApiLoadedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const playerInitTimeoutRef = useRef<any>(null);

  useEffect(() => {
    loadStreamData();
    loadYouTubeAPI();
    
    return () => {
      cleanupPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  // Cleanup function for player
  const cleanupPlayer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (playerInitTimeoutRef.current) {
      clearTimeout(playerInitTimeoutRef.current);
    }
    
    if (playerRef.current) {
      try { 
        playerRef.current.stopVideo && playerRef.current.stopVideo();
        playerRef.current.destroy && playerRef.current.destroy(); 
      } catch (e) {
        console.log('Error during player cleanup:', e);
      }
      playerRef.current = null;
    }
    
    setIsTrackingProgress(false);
    lastSavedProgressRef.current = 0;
    isPlayerReadyRef.current = false;
    currentVideoIdRef.current = null;
    setIsPlayerInitializing(false);
  };

  // Handle modal open/close
  useEffect(() => {
    if (isVideoModalOpen && selectedTopic) {
      // Small delay to ensure modal is fully rendered
      playerInitTimeoutRef.current = setTimeout(() => {
        initializePlayer();
      }, 300);
    } else {
      cleanupPlayer();
    }

    return () => {
      if (playerInitTimeoutRef.current) {
        clearTimeout(playerInitTimeoutRef.current);
      }
    };
  }, [isVideoModalOpen, selectedTopic]);

  const initializePlayer = () => {
    if (!selectedTopic) return;

    const videoId = extractYouTubeVideoId(selectedTopic.link);
    if (!videoId) {
      toast({
        title: 'Invalid Video URL',
        description: 'The video link appears to be invalid.',
        variant: 'destructive'
      });
      return;
    }

    if (videoId === currentVideoIdRef.current && playerRef.current) {
      // Same video, no need to reinitialize
      return;
    }

    currentVideoIdRef.current = videoId;
    
    if (window.YT && window.YT.Player) {
      createYouTubePlayer(videoId);
    } else {
      // Wait for API to load
      console.log('Waiting for YouTube API to load...');
      setIsPlayerInitializing(true);
      
      const checkApiLoaded = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkApiLoaded);
          createYouTubePlayer(videoId);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkApiLoaded);
        if (!window.YT) {
          setIsPlayerInitializing(false);
          toast({
            title: 'YouTube Player Error',
            description: 'Failed to load YouTube player. Please refresh the page.',
            variant: 'destructive'
          });
        }
      }, 10000);
    }
  };

  const loadYouTubeAPI = () => {
    if (ytApiLoadedRef.current || window.YT) return;

    ytApiLoadedRef.current = true;

    // Check if already loaded
    if (window.YT) {
      console.log('YouTube API already loaded');
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready callback triggered');
      ytApiLoadedRef.current = true;
      
      // If we have a pending video, initialize the player
      if (isVideoModalOpen && selectedTopic) {
        initializePlayer();
      }
    };
  };

  const createYouTubePlayer = (videoId: string) => {
    if (!window.YT || !videoContainerRef.current) {
      console.error('YouTube API or container not ready');
      setTimeout(() => createYouTubePlayer(videoId), 100);
      return;
    }

    // Cleanup existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.log('Error destroying previous player:', e);
      }
    }

    console.log('Creating YouTube player for video:', videoId);
    setIsPlayerInitializing(true);

    try {
      playerRef.current = new window.YT.Player(videoContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'autoplay': 1,
          'controls': 1,
          'rel': 0,
          'modestbranding': 1,
          'enablejsapi': 1,
          'origin': window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setIsPlayerInitializing(false);
      toast({
        title: 'Player Error',
        description: 'Failed to create video player. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const onPlayerReady = (event: any) => {
    console.log('YouTube Player Ready');
    isPlayerReadyRef.current = true;
    setIsPlayerInitializing(false);
    
    // Reset progress tracking
    lastSavedProgressRef.current = 0;
    setVideoProgress(0);
    
    // Load existing progress for this topic
    if (selectedTopic && selectedCourse) {
      const existingProgress = getTopicProgress(selectedCourse._id, selectedTopic.name);
      if (existingProgress && existingProgress.watchedDuration > 0) {
        // Seek to last watched position
        event.target.seekTo(existingProgress.watchedDuration);
        lastSavedProgressRef.current = existingProgress.watchedDuration;
        
        const duration = event.target.getDuration();
        if (duration > 0) {
          const progress = (existingProgress.watchedDuration / duration) * 100;
          setVideoProgress(progress);
        }
      }
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    console.log('YouTube Player State:', getPlayerStateName(playerState));
    
    switch (playerState) {
      case window.YT.PlayerState.PLAYING:
        setIsTrackingProgress(true);
        startProgressTracking();
        break;
      case window.YT.PlayerState.PAUSED:
        setIsTrackingProgress(false);
        updateProgressToBackend();
        break;
      case window.YT.PlayerState.ENDED:
        setIsTrackingProgress(false);
        markTopicAsCompletedAutomatically();
        break;
      case window.YT.PlayerState.BUFFERING:
      case window.YT.PlayerState.CUED:
        break;
      default:
        setIsTrackingProgress(false);
        break;
    }
  };

  const getPlayerStateName = (state: number) => {
    switch (state) {
      case -1: return 'UNSTARTED';
      case 0: return 'ENDED';
      case 1: return 'PLAYING';
      case 2: return 'PAUSED';
      case 3: return 'BUFFERING';
      case 5: return 'CUED';
      default: return 'UNKNOWN';
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    setIsPlayerInitializing(false);
    toast({
      title: 'Video Error',
      description: 'Failed to load video. Please try again.',
      variant: 'destructive'
    });
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Update progress more frequently for better UX
    progressIntervalRef.current = setInterval(() => {
      updateProgressToBackend();
    }, 10000); // Update every 10 seconds
    
    console.log('Progress tracking started');
  };

  const updateProgressToBackend = async () => {
    if (!selectedTopic || !selectedCourse || !playerRef.current || !isPlayerReadyRef.current) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      
      if (duration <= 0) return;

      const progress = (currentTime / duration) * 100;
      
      // Update UI immediately
      setVideoProgress(progress);

      // Only save if progress has meaningfully increased (at least 3 seconds)
      if (Math.abs(currentTime - lastSavedProgressRef.current) < 3) {
        return;
      }

      const shouldMarkAsWatched = progress >= 90;

      await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: Math.floor(currentTime),
        watched: shouldMarkAsWatched,
        totalCourseDuration: Math.floor(duration)
      });

      // Update local state
      setTopicProgress(prev => {
        const existingIndex = prev.findIndex(
          tp => String(tp.topicName) === String(selectedTopic.name) && String(tp.courseId) === String(selectedCourse._id)
        );
        
        const updatedProgress = {
          courseId: String(selectedCourse._id),
          topicName: selectedTopic.name,
          watched: shouldMarkAsWatched,
          watchedDuration: Math.floor(currentTime),
          lastWatchedAt: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          return prev.map((tp, index) => 
            index === existingIndex ? updatedProgress : tp
          );
        } else {
          return [...prev, updatedProgress];
        }
      });

      lastSavedProgressRef.current = currentTime;
      console.log('Progress updated:', progress.toFixed(2) + '%');

    } catch (error: any) {
      console.error('Error updating progress:', error);
    }
  };

  const markTopicAsCompletedAutomatically = async () => {
    if (!selectedTopic || !selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const duration = playerRef.current ? 
        Math.floor(playerRef.current.getDuration()) : selectedTopic.duration;

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: duration,
        watched: true,
        totalCourseDuration: Math.floor(duration)
      });

      if (response.success) {
        setTopicProgress(prev => {
          const existingIndex = prev.findIndex(
            tp => String(tp.topicName) === String(selectedTopic.name) && String(tp.courseId) === String(selectedCourse._id)
          );
          
          const completedProgress = {
            courseId: String(selectedCourse._id),
            topicName: selectedTopic.name,
            watched: true,
            watchedDuration: duration,
            lastWatchedAt: new Date().toISOString()
          };
          
          if (existingIndex >= 0) {
            return prev.map((tp, index) => 
              index === existingIndex ? completedProgress : tp
            );
          } else {
            return [...prev, completedProgress];
          }
        });

        setIsTrackingProgress(false);
        setVideoProgress(100);
        
        toast({
          title: 'Topic Completed!',
          description: `"${selectedTopic.name}" has been marked as completed.`,
          variant: 'default'
        });

        setTimeout(() => {
          loadStreamData();
        }, 500);
      }

    } catch (error: any) {
      console.error('Error marking topic as completed:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update progress', 
        variant: 'destructive' 
      });
    }
  };

  const deduplicateTopicProgress = (progress: TopicProgress[]): TopicProgress[] => {
    const unique = new Map();
    
    progress.forEach(item => {
      const key = `${item.courseId}-${item.topicName}`;
      const existing = unique.get(key);
      
      if (!existing || item.watchedDuration > existing.watchedDuration) {
        unique.set(key, item);
      }
    });
    
    return Array.from(unique.values());
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setIsTrackingProgress(false);
    lastSavedProgressRef.current = 0;
    isPlayerReadyRef.current = false;
    currentVideoIdRef.current = null;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleManualComplete = async () => {
    if (selectedTopic) {
      await markTopicAsCompletedAutomatically();
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    cleanupPlayer();
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

      // Get enrollment data
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
      
      // Normalize and deduplicate topicProgress
      const normalizedTopicProgress = (streamEnrollment.topicProgress || []).map((tp: any) => ({
        ...tp,
        courseId: String(tp.courseId)
      }));
      const deduplicatedProgress = deduplicateTopicProgress(normalizedTopicProgress);
      setTopicProgress(deduplicatedProgress);
      
      setTotalWatchedPercentage(streamEnrollment.totalWatchedPercentage || 0);

      // Get courses for this stream
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

      // Set selected course from location state or first course
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

  const getTopicProgress = (courseId: string, topicName: string) => {
    const deduplicated = deduplicateTopicProgress(topicProgress);
    return deduplicated.find(
      tp => String(tp.courseId) === String(courseId) && String(tp.topicName) === String(topicName)
    );
  };

  const getCourseProgress = (courseId: string) => {
    const deduplicated = deduplicateTopicProgress(topicProgress);
    const courseTopics = deduplicated.filter(tp => String(tp.courseId) === String(courseId));
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    const totalTopics = courses.find(c => c._id === courseId)?.topics.length || 1;
    return totalTopics > 0 ? (watchedTopics / totalTopics) * 100 : 0;
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    if (totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: `You need to complete at least 80% of the stream to take the exam. Current progress: ${Math.round(totalWatchedPercentage)}%`,
        variant: 'destructive'
      });
    }
  };

  const handleTakeFinalExam = () => {
    if (totalWatchedPercentage >= 100) {
      navigate(`/exam/${stream}/final`);
    } else {
      toast({
        title: 'Not Eligible',
        description: `You need to complete 100% of the stream to take the final exam. Current progress: ${Math.round(totalWatchedPercentage)}%`,
        variant: 'destructive'
      });
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
            <p>Loading course content...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
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
                {/* YouTube Video Container */}
                <div 
                  ref={videoContainerRef}
                  className="flex-1 bg-black rounded-lg mb-4 flex items-center justify-center"
                >
                  {isPlayerInitializing && (
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-lg">Loading video player...</p>
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
                    <div className="text-sm text-gray-600">
                      {isPlayerInitializing ? (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Initializing player...
                        </span>
                      ) : isTrackingProgress ? (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tracking your progress...
                        </span>
                      ) : videoProgress >= 90 ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Ready to complete
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          Start watching to track progress
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleManualComplete}
                      variant="default"
                      size="sm"
                      disabled={!isPlayerReadyRef.current || isPlayerInitializing}
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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {stream} Stream - Learning Portal
            </h1>
            <p className="text-gray-600 mt-2">
              Complete all courses and topics to unlock the final exam
            </p>
          </div>

          {/* Course Content - Full width without sidebar */}
          <div className="w-full">
            {selectedCourse && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedCourse.courseName}</CardTitle>
                      <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedCourse.totalDuration} min
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Course Document */}
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
                                    {topic.duration} min
                                  </span>
                                  {isWatched && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                      Completed
                                    </Badge>
                                  )}
                                  {watchedDuration > 0 && !isWatched && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                      In Progress ({Math.round((watchedDuration / topic.duration) * 100)}%)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenInNewTab(topic)}
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
    </>
  );
};

export default StreamLearningInterface;
