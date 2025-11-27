/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { pack365Api, UpdateTopicProgressData } from '@/services/api';
import Navbar from '@/components/Navbar';

// --- Interfaces matching backend models ---
interface Topic {
  name: string;
  link: string;
  duration: number; // in seconds
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number; // seconds
  topicsCount: number;
  stream: string;
  topics: Topic[];
  documentLink?: string;
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
  courses: Course[];
  topicProgress: TopicProgress[];
  paymentStatus: string;
  enrollmentType: string;
  amountPaid: number;
}

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// --- Helper Utilities ---
const normalizeToSeconds = (value?: number): number => {
  if (!value && value !== 0) return 0;
  return Math.floor(value); // Backend now consistently uses seconds
};

const secondsToMinutesLabel = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.ceil(seconds / 60);
  return `${mins} min`;
};

const PROGRESS_QUEUE_KEY = 'pack365_progress_queue_v3';

const enqueueProgress = (item: any) => {
  try {
    const raw = localStorage.getItem(PROGRESS_QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...item, timestamp: Date.now() });
    localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('enqueueProgress failed', e);
  }
};

const drainProgressQueue = async (token: string) => {
  try {
    const raw = localStorage.getItem(PROGRESS_QUEUE_KEY);
    const arr: any[] = raw ? JSON.parse(raw) : [];
    if (!arr.length) return;

    const successfulItems: number[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      try {
        await pack365Api.updateTopicProgress(token, item);
        successfulItems.push(i);
      } catch (err) {
        console.error('Failed to sync queued progress:', err);
        break; // Stop on first error
      }
    }

    // Remove successfully synced items
    if (successfulItems.length > 0) {
      const newArr = arr.filter((_, index) => !successfulItems.includes(index));
      localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(newArr));
    }
  } catch (err) {
    console.error('drainProgressQueue failed', err);
  }
};

// --- UI Components ---
const CircularProgress = ({ percentage, syncing }: { percentage: number; syncing?: boolean }) => {
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * Math.max(0, Math.min(100, percentage))) / 100;

  return (
    <div className="relative w-32 h-32">
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="text-gray-200"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          stroke="currentColor"
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            strokeLinecap: 'round',
          }}
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {syncing ? <Loader2 className="animate-spin h-6 w-6 text-gray-600 mb-1" /> : null}
        <span className="text-2xl font-bold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-48"></div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Learning View Guard Component
const LearningViewGuard = ({ 
  children, 
  isLearningView, 
  selectedCourse 
}: { 
  children: React.ReactNode;
  isLearningView: boolean;
  selectedCourse: Course | null;
}) => {
  if (!isLearningView || !selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Loading Course...</h3>
          <p className="text-gray-500 mt-2">Preparing your learning environment</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// --- Video Modal Component ---
const VideoLearningModal = ({
  isOpen,
  onClose,
  selectedTopic,
  selectedCourse,
  enrollment,
  topicProgress,
  setTopicProgress,
  setEnrollment
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic: Topic | null;
  selectedCourse: Course | null;
  enrollment: StreamEnrollment | null;
  topicProgress: TopicProgress[];
  setTopicProgress: React.Dispatch<React.SetStateAction<TopicProgress[]>>;
  setEnrollment: React.Dispatch<React.SetStateAction<StreamEnrollment | null>>;
}) => {
  const { toast } = useToast();
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [isPlayerInitializing, setIsPlayerInitializing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const ytApiLoadedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const accumulatedWatchTimeRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);

  const getTopicDurationSeconds = useCallback(() => {
    if (!selectedTopic) return 0;
    return normalizeToSeconds(selectedTopic.duration);
  }, [selectedTopic]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const cleanupPlayer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo && playerRef.current.stopVideo();
        playerRef.current.destroy && playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    isPlayerReadyRef.current = false;
    currentVideoIdRef.current = null;
    accumulatedWatchTimeRef.current = 0;
    lastSavedTimeRef.current = 0;
    setIsTrackingProgress(false);
    setVideoProgress(0);
  };

  const loadYouTubeAPI = () => {
    if (ytApiLoadedRef.current || window.YT) {
      ytApiLoadedRef.current = true;
      return;
    }
    ytApiLoadedRef.current = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag?.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoadedRef.current = true;
    };
  };

  const initializePlayer = () => {
    if (!selectedTopic || !videoContainerRef.current) return;

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
      return;
    }

    currentVideoIdRef.current = videoId;
    setIsPlayerInitializing(true);

    const createPlayer = () => {
      if (window.YT?.Player) {
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch (e) {}
        }

        playerRef.current = new window.YT.Player(videoContainerRef.current, {
          height: '100%',
          width: '100%',
          videoId,
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
      } else {
        setTimeout(createPlayer, 100);
      }
    };

    createPlayer();
  };

  const onPlayerReady = (event: any) => {
    isPlayerReadyRef.current = true;
    setIsPlayerInitializing(false);

    if (selectedCourse && selectedTopic) {
      const existing = topicProgress.find(tp =>
        String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
      );
      if (existing) {
        accumulatedWatchTimeRef.current = existing.watchedDuration || 0;
        if (!existing.watched && existing.watchedDuration > 0) {
          try {
            event.target.seekTo(Math.floor(existing.watchedDuration), true);
          } catch (e) {}
        }
        setVideoProgress(existing.watchedDuration && getTopicDurationSeconds() ? 
          Math.min(100, (existing.watchedDuration / getTopicDurationSeconds()) * 100) : 0);
      }
    }
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    if (state === window.YT.PlayerState.PLAYING) {
      setIsTrackingProgress(true);
      startTrackingInterval();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsTrackingProgress(false);
      stopTrackingInterval();
      updateProgressToBackend(true);
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsTrackingProgress(false);
      stopTrackingInterval();
      markTopicAsCompletedAutomatically();
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error', event);
    setIsPlayerInitializing(false);
    toast({
      title: 'Video Error',
      description: 'Video failed to play. Please try again.',
      variant: 'destructive'
    });
  };

  const startTrackingInterval = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      await updateProgressToBackend(false);
    }, 5000);
  };

  const stopTrackingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateProgressToBackend = async (immediate = false) => {
    if (!selectedCourse || !selectedTopic || isSendingRef.current) return;

    try {
      if (!playerRef.current || !isPlayerReadyRef.current) return;

      const token = localStorage.getItem('token');
      if (!token) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        enqueueProgress({
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watchedDuration: currentTime
        });
        return;
      }

      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      const durationSeconds = getTopicDurationSeconds();
      if (durationSeconds <= 0) return;

      accumulatedWatchTimeRef.current = Math.max(accumulatedWatchTimeRef.current, currentTime);
      if (accumulatedWatchTimeRef.current > durationSeconds) {
        accumulatedWatchTimeRef.current = durationSeconds;
      }

      const progressPercent = Math.min(100, (accumulatedWatchTimeRef.current / durationSeconds) * 100);
      setVideoProgress(progressPercent);

      const lastSaved = lastSavedTimeRef.current || 0;
      if (!immediate && Math.abs(accumulatedWatchTimeRef.current - lastSaved) < 5) {
        return;
      }

      const payload: UpdateTopicProgressData = {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: Math.floor(accumulatedWatchTimeRef.current)
      };

      isSendingRef.current = true;
      setSyncing(true);

      try {
        const resp = await pack365Api.updateTopicProgress(token, payload);
        lastSavedTimeRef.current = accumulatedWatchTimeRef.current;
        setSyncing(false);
        isSendingRef.current = false;

        setTopicProgress(prev => {
          const copy = [...prev];
          const existingIndex = copy.findIndex(tp => 
            String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
          );
          
          const updated: TopicProgress = {
            courseId: String(selectedCourse._id),
            topicName: selectedTopic.name,
            watched: resp.watched ?? (progressPercent >= 95),
            watchedDuration: Math.floor(accumulatedWatchTimeRef.current),
            lastWatchedAt: new Date().toISOString()
          };

          if (existingIndex >= 0) {
            copy[existingIndex] = { ...copy[existingIndex], ...updated };
          } else {
            copy.push(updated);
          }
          return copy;
        });

        // Refresh enrollment to get updated totals
        const enrollmentResp = await pack365Api.getMyEnrollments(token);
        if (enrollmentResp.success) {
          const currentEnrollment = enrollmentResp.enrollments.find(
            (e: any) => e.stream === enrollment?.stream
          );
          if (currentEnrollment) {
            setEnrollment(currentEnrollment);
          }
        }
      } catch (err: any) {
        console.error('Failed to send progress:', err);
        enqueueProgress(payload);
        setSyncing(false);
        isSendingRef.current = false;
        
        if (!immediate) {
          toast({
            title: 'Progress Save Failed',
            description: 'Progress will be saved when connection is restored.',
            variant: 'destructive'
          });
        }
      }
    } catch (err) {
      console.error('updateProgressToBackend error:', err);
      isSendingRef.current = false;
      setSyncing(false);
    }
  };

  const markTopicAsCompletedAutomatically = async () => {
    if (!selectedTopic || !selectedCourse) return;
    
    const token = localStorage.getItem('token');
    const duration = getTopicDurationSeconds();
    accumulatedWatchTimeRef.current = duration;

    const payload: UpdateTopicProgressData = {
      courseId: selectedCourse._id,
      topicName: selectedTopic.name,
      watchedDuration: duration
    };

    setSyncing(true);
    try {
      await pack365Api.updateTopicProgress(token || '', payload);
      
      setTopicProgress(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(tp => 
          String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
        );
        
        const completedProgress: TopicProgress = {
          courseId: String(selectedCourse._id),
          topicName: selectedTopic.name,
          watchedDuration: duration,
          watched: true,
          lastWatchedAt: new Date().toISOString()
        };
        
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], ...completedProgress };
        } else {
          copy.push(completedProgress);
        }
        return copy;
      });

      toast({
        title: 'Topic Completed!',
        description: `"${selectedTopic.name}" has been marked as completed.`,
        variant: 'default'
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error marking topic as completed:', err);
      enqueueProgress(payload);
      toast({
        title: 'Completion Error',
        description: 'Failed to mark topic as completed. Progress saved for retry.',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleManualComplete = async () => {
    await markTopicAsCompletedAutomatically();
  };

  const handleOpenInNewTab = () => {
    if (selectedTopic) {
      window.open(selectedTopic.link, '_blank');
    }
  };

  useEffect(() => {
    if (isOpen && selectedTopic) {
      loadYouTubeAPI();
      const timer = setTimeout(() => {
        initializePlayer();
      }, 300);

      return () => {
        clearTimeout(timer);
        cleanupPlayer();
      };
    } else {
      cleanupPlayer();
    }
  }, [isOpen, selectedTopic]);

  useEffect(() => {
    return cleanupPlayer;
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTopic?.name}</span>
            <div className="flex items-center gap-2">
              {syncing && <span className="text-sm text-gray-500 mr-2">Saving...</span>}
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="h-4 w-4 mr-1" />
                New Tab
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {selectedTopic && (
            <>
              <div
                ref={videoContainerRef}
                className="flex-1 bg-black rounded-lg mb-4 flex items-center justify-center"
                style={{ minHeight: 320 }}
              >
                {isPlayerInitializing && (
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading video player...</p>
                  </div>
                )}
              </div>

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
                    ) : videoProgress >= 95 ? (
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
                    disabled={isPlayerInitializing || syncing}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {syncing ? 'Saving...' : 'Mark as Completed'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Component ---
const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLearningView, setIsLearningView] = useState(false);
  const [syncingOverview, setSyncingOverview] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Current State:', {
      isLearningView,
      selectedCourse: selectedCourse?.courseName,
      enrollment: enrollment?.stream,
      loading
    });
  }, [isLearningView, selectedCourse, enrollment, loading]);

  useEffect(() => {
    const fetchStreamEnrollment = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setSyncingOverview(true);

        const response = await pack365Api.getMyEnrollments(token);
        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            setEnrollment(currentEnrollment);
            setTopicProgress(currentEnrollment.topicProgress || []);

            // Handle navigation to specific course - FIXED LOGIC
            const locationState = location.state as any;
            const selectedCourseFromState = locationState?.selectedCourse;
            const selectedCourseId = locationState?.selectedCourseId;

            let courseToSet: Course | null = null;
            
            if (selectedCourseFromState || selectedCourseId) {
              if (selectedCourseFromState) {
                courseToSet = selectedCourseFromState;
              } else if (selectedCourseId) {
                courseToSet = currentEnrollment.courses.find(
                  (c: Course) => c.courseId === selectedCourseId || c._id === selectedCourseId
                ) || null;
              }

              if (courseToSet) {
                setSelectedCourse(courseToSet);
                setIsLearningView(true);
              } else {
                // If we cannot find the course, stay in overview
                setIsLearningView(false);
                setSelectedCourse(null);
              }
            } else {
              // Default to overview mode
              setIsLearningView(false);
              setSelectedCourse(null);
            }
          } else {
            toast({ 
              title: 'Access Denied', 
              description: 'You are not enrolled in this stream.', 
              variant: 'destructive' 
            });
            navigate('/pack365');
          }
        } else {
          toast({ 
            title: 'Access Denied', 
            description: 'You are not enrolled in this stream.', 
            variant: 'destructive' 
          });
          navigate('/pack365');
        }
      } catch (error: any) {
        console.error('Error fetching stream enrollment:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load enrollment details.', 
          variant: 'destructive' 
        });
        navigate('/pack365');
      } finally {
        setLoading(false);
        setSyncingOverview(false);
      }
    };

    fetchStreamEnrollment();
  }, [stream, location, navigate, toast]);

  useEffect(() => {
    const syncProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await drainProgressQueue(token);
    };

    const interval = setInterval(syncProgress, 30000);
    syncProgress(); // Initial sync

    return () => clearInterval(interval);
  }, []);

  // FIXED: Improved course start function
  const handleCourseStart = (course: Course) => {
    console.log('Starting course:', course.courseName);
    setSelectedCourse(course);
    setIsLearningView(true);
    
    // Clear any previous navigation state to avoid conflicts
    window.history.replaceState({}, document.title);
  };

  // FIXED: Improved back to stream function
  const handleBackToStream = () => {
    setIsLearningView(false);
    setSelectedCourse(null);
    
    // Clear the navigation state when going back
    window.history.replaceState({}, document.title);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
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

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && tp.topicName === topicName
    );
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Enrollment Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find your enrollment details for this stream.</p>
          <Button onClick={() => navigate('/pack365')}>Browse Streams</Button>
        </div>
      </div>
    );
  }

  // Learning View (Course Details) - FIXED with LearningViewGuard
  if (isLearningView) {
    return (
      <LearningViewGuard isLearningView={isLearningView} selectedCourse={selectedCourse}>
        <Navbar />
        <VideoLearningModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          selectedTopic={selectedTopic}
          selectedCourse={selectedCourse}
          enrollment={enrollment}
          topicProgress={topicProgress}
          setTopicProgress={setTopicProgress}
          setEnrollment={setEnrollment}
        />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <Button onClick={handleBackToStream} variant="outline" className="mb-4">
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

            <div className="w-full">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedCourse!.courseName}</CardTitle>
                      <p className="text-gray-600 mt-1">{selectedCourse!.description}</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      {secondsToMinutesLabel(selectedCourse!.totalDuration)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCourse!.documentLink && (
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
                          onClick={() => window.open(selectedCourse!.documentLink, '_blank')}
                          variant="outline"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                    {selectedCourse!.topics.map((topic, index) => {
                      const progress = getTopicProgress(selectedCourse!._id, topic.name);
                      const isWatched = !!progress?.watched;
                      const watchedDuration = progress?.watchedDuration || 0;
                      const percent = topic.duration ? Math.min(100, (watchedDuration / topic.duration) * 100) : 0;

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
                                    {secondsToMinutesLabel(topic.duration)}
                                  </span>
                                  {isWatched && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                      Completed
                                    </Badge>
                                  )}
                                  {watchedDuration > 0 && !isWatched && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                      In Progress ({Math.round(percent)}%)
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
            </div>
          </div>
        </div>
      </LearningViewGuard>
    );
  }

  // Stream Overview View
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Sidebar */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CircularProgress percentage={enrollment.totalWatchedPercentage} syncing={syncingOverview} />
                  <p className="text-gray-600 mt-4">Overall Completion</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4"/>Enrolled On
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatDate(enrollment.enrollmentDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookOpen className="h-4 w-4"/>Total Courses
                    </span>
                    <span className="font-semibold text-gray-800">{enrollment.coursesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookCopy className="h-4 w-4"/>Topics
                    </span>
                    <span className="font-semibold text-gray-800">
                      {enrollment.watchedTopics}/{enrollment.totalTopics}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="h-4 w-4"/>Access Until
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatDate(enrollment.expiresAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {enrollment.totalWatchedPercentage >= 80 && (
                <Card className="shadow-md bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6"/>
                      Ready for Exam!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-green-100">
                      You've completed enough of the stream to take the exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-green-600 hover:bg-green-50"
                      onClick={handleTakeExam}
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}

              {enrollment.totalWatchedPercentage >= 100 && (
                <Card className="shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6"/>
                      Final Exam Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-purple-100">
                      You've completed all courses! Take the final comprehensive exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-purple-600 hover:bg-purple-50"
                      onClick={handleTakeFinalExam}
                    >
                      Take Final Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>

            {/* Right Content */}
            <main className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>Select a course below to start learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrollment.courses && enrollment.courses.length > 0 ? (
                    enrollment.courses.map((course) => (
                      <div 
                        key={course.courseId || course._id} 
                        className="border bg-white rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                {course.courseName}
                              </h3>
                              <Badge variant="secondary">
                                {course.topics?.length || 0} topics
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {course.description}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {secondsToMinutesLabel(course.totalDuration)}
                              </span>
                              {course.documentLink && (
                                <span className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4" />
                                  Resources
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleCourseStart(course)}
                            className="w-full sm:w-auto flex-shrink-0"
                            variant="default"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Available</h3>
                      <p className="text-gray-500">Courses for this stream are being prepared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Stream Completion Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Minimum completion for exam:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 80 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 80 ? 'Eligible' : '80% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current progress:</span>
                      <span className="text-sm font-medium">
                        {Math.round(enrollment.totalWatchedPercentage)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Final exam eligibility:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 100 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 100 ? 'Eligible' : '100% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exam status:</span>
                      <Badge variant={enrollment.isExamCompleted ? "default" : "outline"}>
                        {enrollment.isExamCompleted ? `Completed (${enrollment.examScore}%)` : 'Not Taken'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365StreamLearning;
