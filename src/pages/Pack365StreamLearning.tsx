/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// --- Interfaces for Type Safety ---
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

interface StreamEnrollment {
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  totalWatchedPercentage: number;
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Course[];
  topicProgress: Array<{
    courseId: string;
    topicName: string;
    watched: boolean;
    watchedDuration: number;
    lastWatchedAt?: string;
  }>;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
  lastWatchedAt?: string;
}

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// --- Helper Components ---
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

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
      <div className="absolute inset-0 flex items-center justify-center">
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

// --- Video Modal Component ---
const VideoLearningModal = ({ 
  isOpen, 
  onClose, 
  selectedTopic, 
  selectedCourse,
  enrollment,
  setEnrollment,
  topicProgress,
  setTopicProgress
}: { 
  isOpen: boolean;
  onClose: () => void;
  selectedTopic: Topic | null;
  selectedCourse: Course | null;
  enrollment: StreamEnrollment | null;
  setEnrollment: (e: StreamEnrollment | null) => void;
  topicProgress: TopicProgress[];
  setTopicProgress: (tp: TopicProgress[]) => void;
}) => {
  const { toast } = useToast();
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
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

  // Helper: get existing topic progress entry (if any)
  const getExistingProgress = () => {
    const found = (topicProgress || []).find(tp => 
      String(tp.courseId) === String(selectedCourse?._id) && tp.topicName === selectedTopic?.name
    );
    return found || null;
  };

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
    setVideoProgress(0);
  };

  // When modal opens, init player and preload watched seconds if available
  useEffect(() => {
    if (isOpen && selectedTopic) {
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
  }, [isOpen, selectedTopic]);

  const loadYouTubeAPI = () => {
    if (ytApiLoadedRef.current || window.YT) return;

    ytApiLoadedRef.current = true;

    if (window.YT) return;

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
      ytApiLoadedRef.current = true;
      if (isOpen && selectedTopic) initializePlayer();
    };
  };

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

    if (videoId === currentVideoIdRef.current && playerRef.current) return;
    currentVideoIdRef.current = videoId;
    
    if (window.YT && window.YT.Player) {
      createYouTubePlayer(videoId);
    } else {
      setIsPlayerInitializing(true);
      const checkApiLoaded = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkApiLoaded);
          createYouTubePlayer(videoId);
        }
      }, 100);

      // Timeout after 10s
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

  const createYouTubePlayer = (videoId: string) => {
    if (!window.YT || !videoContainerRef.current) {
      setTimeout(() => createYouTubePlayer(videoId), 100);
      return;
    }

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch(e){ console.log(e); }
    }

    setIsPlayerInitializing(true);

    try {
      playerRef.current = new window.YT.Player(videoContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId,
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
    isPlayerReadyRef.current = true;
    setIsPlayerInitializing(false);
    lastSavedProgressRef.current = 0;
    setVideoProgress(0);

    // If we have existing watchedDuration for this topic, seek to it
    const existing = getExistingProgress();
    if (existing && event.target && existing.watchedDuration > 0) {
      try {
        const seekSec = Math.floor(existing.watchedDuration);
        event.target.seekTo(seekSec, true);
        const duration = event.target.getDuration() || selectedTopic?.duration || 0;
        setVideoProgress(duration > 0 ? (seekSec / duration) * 100 : 0);
        lastSavedProgressRef.current = seekSec;
      } catch (e) {
        console.log('seek error:', e);
      }
    } else {
      // default start at 0
      try { event.target.seekTo(0); } catch(e){/* ignore */ }
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;

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
      default:
        setIsTrackingProgress(false);
        break;
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    setIsPlayerInitializing(false);
    toast({ title: 'Video Error', description: 'Failed to load video. Please try again.', variant: 'destructive' });
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      updateProgressToBackend();
    }, 10000);

    console.log('Progress tracking started');
  };

  // --- KEY: compute and send totalWatchedPercentage, then update local state with response ---
  const updateProgressToBackend = async () => {
    if (!selectedTopic || !selectedCourse || !playerRef.current || !isPlayerReadyRef.current) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();

      if (!duration || duration <= 0) return;
      const progress = (currentTime / duration) * 100;

      // update UI immediately
      setVideoProgress(progress);

      // only save if increased by at least 3 seconds
      if (Math.abs(currentTime - lastSavedProgressRef.current) < 3) return;

      // Determine whether topic should be treated as watched (>=90%)
      const shouldMarkAsWatched = progress >= 90;

      // --- compute totals for the stream so we can send totalWatchedPercentage to backend ---
      // Clone local topicProgress and compute new values
      const totalTopics = (enrollment?.totalTopics) ?? (selectedCourse?.topics?.length ?? 0);
      // Build a fresh watched count based on local state + this potential change
      let watchedTopicsLocal = (enrollment?.watchedTopics) ?? 0;
      // check if this topic is already marked watched locally
      const existing = (topicProgress || []).find(tp => String(tp.courseId) === String(selectedCourse?._id) && tp.topicName === selectedTopic?.name);
      const alreadyWatched = existing?.watched === true;

      // if it's becoming watched now and wasn't watched before, increment
      if (shouldMarkAsWatched && !alreadyWatched) {
        watchedTopicsLocal = (watchedTopicsLocal || 0) + 1;
      } else if (!shouldMarkAsWatched && alreadyWatched) {
        // do nothing; keep as watched until user unmarks (rare)
      }

      const totalWatchedPercentage = totalTopics > 0 ? Math.round((watchedTopicsLocal / totalTopics) * 100) : 0;

      // Call API and include totalWatchedPercentage so backend also stores it
      const response: any = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: Math.floor(currentTime),
        watched: shouldMarkAsWatched,
        totalCourseDuration: Math.floor(duration),
        totalWatchedPercentage
      });

      lastSavedProgressRef.current = currentTime;

      // If backend returned success and counts, update local state for instant UI reaction
      if (response && response.success) {
        // update topicProgress array locally
        setTopicProgress(prev => {
          const foundIndex = prev.findIndex(tp => String(tp.courseId) === String(selectedCourse?._id) && tp.topicName === selectedTopic?.name);
          if (foundIndex > -1) {
            const copy = [...prev];
            copy[foundIndex] = {
              ...copy[foundIndex],
              watched: shouldMarkAsWatched ? true : copy[foundIndex].watched,
              watchedDuration: Math.max(copy[foundIndex].watchedDuration || 0, Math.floor(currentTime)),
              lastWatchedAt: new Date().toISOString()
            };
            return copy;
          } else {
            // if not found, add entry
            return [...prev, {
              courseId: selectedCourse!._id,
              topicName: selectedTopic!.name,
              watched: shouldMarkAsWatched,
              watchedDuration: Math.floor(currentTime),
              lastWatchedAt: new Date().toISOString()
            }];
          }
        });

        // update enrollment summary (watchedTopics / totalTopics / percentage)
        setEnrollment(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            totalWatchedPercentage: response.totalWatchedPercentage ?? totalWatchedPercentage,
            watchedTopics: response.watchedTopics ?? watchedTopicsLocal,
            totalTopics: response.totalTopics ?? prev.totalTopics
          };
          return updated;
        });
      } else {
        console.warn('Progress update responded with no success:', response);
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
    }
  };

  // Called when video ends — mark watched=true and send full duration
  const markTopicAsCompletedAutomatically = async () => {
    if (!selectedTopic || !selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const duration = playerRef.current ? Math.floor(playerRef.current.getDuration()) : selectedTopic.duration;

      // compute totals: assume topic becomes watched
      const totalTopics = (enrollment?.totalTopics) ?? (selectedCourse?.topics?.length ?? 0);
      let watchedTopicsLocal = (enrollment?.watchedTopics) ?? 0;
      const existing = (topicProgress || []).find(tp => String(tp.courseId) === String(selectedCourse?._id) && tp.topicName === selectedTopic?.name);
      if (!existing?.watched) watchedTopicsLocal = (watchedTopicsLocal || 0) + 1;
      const totalWatchedPercentage = totalTopics > 0 ? Math.round((watchedTopicsLocal / totalTopics) * 100) : 0;

      const response: any = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: duration,
        watched: true,
        totalCourseDuration: Math.floor(duration),
        totalWatchedPercentage
      });

      if (response && response.success) {
        setIsTrackingProgress(false);
        setVideoProgress(100);

        // update local arrays using backend response (if provided)
        setTopicProgress(prev => {
          const foundIndex = prev.findIndex(tp => String(tp.courseId) === String(selectedCourse?._id) && tp.topicName === selectedTopic?.name);
          if (foundIndex > -1) {
            const copy = [...prev];
            copy[foundIndex] = {
              ...copy[foundIndex],
              watched: true,
              watchedDuration: Math.max(copy[foundIndex].watchedDuration || 0, duration),
              lastWatchedAt: new Date().toISOString()
            };
            return copy;
          } else {
            return [...prev, {
              courseId: selectedCourse!._id,
              topicName: selectedTopic!.name,
              watched: true,
              watchedDuration: duration,
              lastWatchedAt: new Date().toISOString()
            }];
          }
        });

        setEnrollment(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            totalWatchedPercentage: response.totalWatchedPercentage ?? totalWatchedPercentage,
            watchedTopics: response.watchedTopics ?? ((prev.watchedTopics || 0) + 1),
            totalTopics: response.totalTopics ?? prev.totalTopics
          };
        });

        toast({
          title: 'Topic Completed!',
          description: `"${selectedTopic.name}" has been marked as completed.`,
          variant: 'default'
        });

        // close modal after short delay
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error('API did not return success');
      }
    } catch (error: any) {
      console.error('Error marking topic as completed:', error);
      toast({ title: 'Error', description: 'Failed to update progress', variant: 'destructive' });
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleManualComplete = async () => {
    if (selectedTopic) await markTopicAsCompletedAutomatically();
  };

  const handleOpenInNewTab = () => {
    if (selectedTopic) window.open(selectedTopic.link, '_blank');
  };

  useEffect(() => { loadYouTubeAPI(); return () => cleanupPlayer(); }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTopic?.name}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="h-4 w-4 mr-1" /> Open in New Tab
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {selectedTopic && (
            <>
              <div ref={videoContainerRef} className="flex-1 bg-black rounded-lg mb-4 flex items-center justify-center">
                {isPlayerInitializing && (
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Loading video player.</p>
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
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Initializing player...</span>
                    ) : isTrackingProgress ? (
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Tracking your progress...</span>
                    ) : videoProgress >= 90 ? (
                      <span className="flex items-center text-green-600"><CheckCircle2 className="h-4 w-4 mr-1" /> Ready to complete</span>
                    ) : (
                      <span className="flex items-center"><Play className="h-4 w-4 mr-1" /> Start watching to track progress</span>
                    )}
                  </div>
                  
                  <Button onClick={handleManualComplete} variant="default" size="sm" disabled={!isPlayerReadyRef.current || isPlayerInitializing}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  
  // Learning interface states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLearningView, setIsLearningView] = useState(false);

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
        
        const response = await pack365Api.getMyEnrollments(token);
        
        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            const coursesResponse = await pack365Api.getAllCourses();
            if (coursesResponse.success && coursesResponse.data) {
              const streamCourses = coursesResponse.data.filter(
                (course: Course) => course.stream.toLowerCase() === stream?.toLowerCase()
              );
              setAllCourses(streamCourses);
              
              // Compute accurate progress using topicProgress watched flags (initial)
              let totalWatchedTopics = 0;
              let totalTopicsInStream = 0;

              streamCourses.forEach(course => {
                const courseTopics = course.topics?.length || 0;
                totalTopicsInStream += courseTopics;
                
                const watchedInCourse = (currentEnrollment.topicProgress || []).filter((tp: any) => 
                  String(tp.courseId) === String(course._id) && tp.watched === true
                ).length || 0;
                
                totalWatchedTopics += watchedInCourse;
              });

              const accurateProgress = totalTopicsInStream > 0 ? 
                (totalWatchedTopics / totalTopicsInStream) * 100 : 0;

              const enhancedEnrollment: StreamEnrollment = {
                ...currentEnrollment,
                courses: streamCourses,
                totalTopics: totalTopicsInStream,
                watchedTopics: totalWatchedTopics,
                totalWatchedPercentage: Math.round(accurateProgress),
                coursesCount: streamCourses.length
              };
              
              setEnrollment(enhancedEnrollment);

              // set initial topicProgress array from enrollment data for local tracking
              setTopicProgress((currentEnrollment.topicProgress || []).map((tp: any) => ({
                courseId: tp.courseId,
                topicName: tp.topicName,
                watched: tp.watched,
                watchedDuration: tp.watchedDuration || 0,
                lastWatchedAt: tp.lastWatchedAt || undefined
              })));
            } else {
              setAllCourses([]);
            }
          } else {
            toast({ title: 'Not enrolled', description: 'You are not enrolled in this stream', variant: 'destructive' });
          }
        } else {
          toast({ title: 'Enrollments not found', variant: 'destructive' });
        }
      } catch (err:any) {
        console.error('Fetch enrollments error:', err);
        toast({ title: 'Error', description: 'Failed to load enrollments', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchStreamEnrollment();
  }, [stream]);

  // When user clicks a topic -> open modal and pass required props
  const openTopic = (course: Course, topic: Topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    // optionally re-sync or re-fetch enrollments here if you want server canonical data
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Stream Progress</CardTitle>
                <CardDescription>Overall progress for this stream</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <CircularProgress percentage={enrollment?.totalWatchedPercentage ?? 0} />
                  <div>
                    <p className="text-sm text-gray-600">Watched {enrollment?.watchedTopics ?? 0} of {enrollment?.totalTopics ?? 0} topics</p>
                    <p className="text-2xl font-bold">{enrollment?.totalWatchedPercentage ?? 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              {allCourses.map(course => (
                <Card key={course._id}>
                  <CardHeader>
                    <CardTitle>{course.courseName}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.topics?.map((topic, idx) => {
                        const tp = topicProgress.find(t => String(t.courseId) === String(course._id) && t.topicName === topic.name);
                        return (
                          <div key={idx} className="p-4 border rounded-lg flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{topic.name}</h3>
                              <p className="text-sm text-gray-500">{Math.round((tp?.watchedDuration || 0) / (topic.duration || 1) * 100)}% watched</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" onClick={() => openTopic(course, topic)}>
                                <Video className="h-4 w-4 mr-1" /> Watch
                              </Button>
                              {tp?.watched ? <Badge>Completed</Badge> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <VideoLearningModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        selectedTopic={selectedTopic}
        selectedCourse={selectedCourse}
        enrollment={enrollment}
        setEnrollment={setEnrollment}
        topicProgress={topicProgress}
        setTopicProgress={setTopicProgress}
      />
    </div>
  );
};

export default Pack365StreamLearning;
