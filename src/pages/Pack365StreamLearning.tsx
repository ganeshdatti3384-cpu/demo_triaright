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
        {/* Header Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-48"></div>
          </div>
          {/* Courses Skeleton */}
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
  
  // YouTube Player Refs
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const ytApiLoadedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const playerInitTimeoutRef = useRef<any>(null);

  // Calculate local progress
  const calculateLocalProgress = (): number => {
    if (!enrollment || !enrollment.courses) return 0;
    
    let totalWatchedTopics = 0;
    let totalTopicsInStream = 0;

    enrollment.courses.forEach(course => {
      const courseTopics = course.topics?.length || 0;
      totalTopicsInStream += courseTopics;
      
      // Count watched topics for this course
      const watchedInCourse = topicProgress.filter(tp => 
        String(tp.courseId) === String(course._id) && tp.watched === true
      ).length;
      
      totalWatchedTopics += watchedInCourse;
    });

    return totalTopicsInStream > 0 ? (totalWatchedTopics / totalTopicsInStream) * 100 : 0;
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
  };

  // Handle modal open/close
  useEffect(() => {
    if (isOpen && selectedTopic) {
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
  }, [isOpen, selectedTopic]);

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
      if (isOpen && selectedTopic) {
        initializePlayer();
      }
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
      const token = localStorage.getItem('token');
      if (token) {
        // In a real implementation, you would fetch the existing progress from the backend
        // For now, we'll just start from the beginning
        event.target.seekTo(0);
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

      // Calculate total watched percentage for the entire stream
      let totalWatchedPercentage = 0;
      
      if (enrollment) {
        const totalTopics = enrollment.totalTopics || 1; // Avoid division by zero
        const currentWatchedTopics = enrollment.watchedTopics || 0;
        
        // If marking as watched and it wasn't watched before, increment count
        const newWatchedTopics = shouldMarkAsWatched && 
          !topicProgress.find(tp => 
            String(tp.courseId) === String(selectedCourse._id) && 
            String(tp.topicName) === String(selectedTopic.name) && 
            tp.watched
          ) ? currentWatchedTopics + 1 : currentWatchedTopics;
        
        totalWatchedPercentage = (newWatchedTopics / totalTopics) * 100;
      }

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: Math.floor(currentTime),
        watched: shouldMarkAsWatched,
        totalCourseDuration: Math.floor(duration),
        totalWatchedPercentage: Math.round(totalWatchedPercentage)
      });

      lastSavedProgressRef.current = currentTime;
      console.log('Progress updated:', progress.toFixed(2) + '%');

      // Update local state with backend response
      if (response.success) {
        // Update topic progress locally
        const updatedTopicProgress = [...topicProgress];
        const existingIndex = updatedTopicProgress.findIndex(
          tp => String(tp.courseId) === String(selectedCourse._id) && 
                String(tp.topicName) === String(selectedTopic.name)
        );

        if (existingIndex >= 0) {
          updatedTopicProgress[existingIndex] = {
            ...updatedTopicProgress[existingIndex],
            watchedDuration: Math.floor(currentTime),
            watched: shouldMarkAsWatched,
            lastWatchedAt: new Date().toISOString()
          };
        } else {
          updatedTopicProgress.push({
            courseId: selectedCourse._id,
            topicName: selectedTopic.name,
            watchedDuration: Math.floor(currentTime),
            watched: shouldMarkAsWatched,
            lastWatchedAt: new Date().toISOString()
          });
        }

        setTopicProgress(updatedTopicProgress);

        // Update enrollment progress if response contains updated data
        if (response.totalWatchedPercentage !== undefined) {
          setEnrollment(prev => prev ? {
            ...prev,
            totalWatchedPercentage: response.totalWatchedPercentage,
            watchedTopics: response.watchedTopics || prev.watchedTopics
          } : null);
        }
      }

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

      // Calculate total watched percentage
      let totalWatchedPercentage = 0;
      if (enrollment) {
        const totalTopics = enrollment.totalTopics || 1;
        const currentWatchedTopics = enrollment.watchedTopics || 0;
        
        // Check if this topic was already watched
        const wasAlreadyWatched = topicProgress.find(tp => 
          String(tp.courseId) === String(selectedCourse._id) && 
          String(tp.topicName) === String(selectedTopic.name) && 
          tp.watched
        );
        
        const newWatchedTopics = wasAlreadyWatched ? currentWatchedTopics : currentWatchedTopics + 1;
        totalWatchedPercentage = (newWatchedTopics / totalTopics) * 100;
      }

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: duration,
        watched: true,
        totalCourseDuration: Math.floor(duration),
        totalWatchedPercentage: Math.round(totalWatchedPercentage)
      });

      if (response.success) {
        setIsTrackingProgress(false);
        setVideoProgress(100);
        
        // Update local state
        const updatedTopicProgress = [...topicProgress];
        const existingIndex = updatedTopicProgress.findIndex(
          tp => String(tp.courseId) === String(selectedCourse._id) && 
                String(tp.topicName) === String(selectedTopic.name)
        );

        if (existingIndex >= 0) {
          updatedTopicProgress[existingIndex] = {
            ...updatedTopicProgress[existingIndex],
            watchedDuration: duration,
            watched: true,
            lastWatchedAt: new Date().toISOString()
          };
        } else {
          updatedTopicProgress.push({
            courseId: selectedCourse._id,
            topicName: selectedTopic.name,
            watchedDuration: duration,
            watched: true,
            lastWatchedAt: new Date().toISOString()
          });
        }

        setTopicProgress(updatedTopicProgress);

        // Update enrollment with backend response
        if (response.totalWatchedPercentage !== undefined) {
          setEnrollment(prev => prev ? {
            ...prev,
            totalWatchedPercentage: response.totalWatchedPercentage,
            watchedTopics: response.watchedTopics || ((prev.watchedTopics || 0) + 1)
          } : null);
        }

        toast({
          title: 'Topic Completed!',
          description: `"${selectedTopic.name}" has been marked as completed.`,
          variant: 'default'
        });

        // Close modal after completion
        setTimeout(() => {
          onClose();
        }, 1500);
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

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleManualComplete = async () => {
    if (selectedTopic) {
      await markTopicAsCompletedAutomatically();
    }
  };

  const handleOpenInNewTab = () => {
    if (selectedTopic) {
      window.open(selectedTopic.link, '_blank');
    }
  };

  // Load YouTube API when component mounts
  useEffect(() => {
    loadYouTubeAPI();
    
    return () => {
      cleanupPlayer();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selectedTopic?.name}</span>
            <div className="flex items-center gap-2">
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
                onClick={onClose}
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

  // Calculate local progress
  const calculateLocalProgress = (): number => {
    if (!enrollment || !enrollment.courses) return 0;
    
    let totalWatchedTopics = 0;
    let totalTopicsInStream = 0;

    enrollment.courses.forEach(course => {
      const courseTopics = course.topics?.length || 0;
      totalTopicsInStream += courseTopics;
      
      // Count watched topics for this course
      const watchedInCourse = topicProgress.filter(tp => 
        String(tp.courseId) === String(course._id) && tp.watched === true
      ).length;
      
      totalWatchedTopics += watchedInCourse;
    });

    return totalTopicsInStream > 0 ? (totalWatchedTopics / totalTopicsInStream) * 100 : 0;
  };

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
        
        // Fetch enrollments
        const response = await pack365Api.getMyEnrollments(token);
        
        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            // Fetch all courses to get complete course data
            const coursesResponse = await pack365Api.getAllCourses();
            if (coursesResponse.success && coursesResponse.data) {
              const streamCourses = coursesResponse.data.filter(
                (course: Course) => course.stream.toLowerCase() === stream?.toLowerCase()
              );
              setAllCourses(streamCourses);
              
              // Calculate accurate progress using watched flags
              let totalWatchedTopics = 0;
              let totalTopicsInStream = 0;

              streamCourses.forEach(course => {
                const courseTopics = course.topics?.length || 0;
                totalTopicsInStream += courseTopics;
                
                // Count watched topics for this course using watched=true
                const watchedInCourse = (currentEnrollment.topicProgress || []).filter((tp: any) => 
                  String(tp.courseId) === String(course._id) && tp.watched === true
                ).length || 0;
                
                totalWatchedTopics += watchedInCourse;
              });

              const accurateProgress = totalTopicsInStream > 0 ? 
                (totalWatchedTopics / totalTopicsInStream) * 100 : 0;

              // Enhance enrollment with accurate data
              const enhancedEnrollment = {
                ...currentEnrollment,
                courses: streamCourses,
                totalTopics: totalTopicsInStream,
                watchedTopics: totalWatchedTopics,
                totalWatchedPercentage: accurateProgress,
                coursesCount: streamCourses.length
              };
              
              setEnrollment(enhancedEnrollment);

              // Check if we're coming from course selection to open learning view
              const selectedCourseFromState = (location.state as any)?.selectedCourse;
              const selectedCourseId = (location.state as any)?.selectedCourseId;
              
              if (selectedCourseFromState || selectedCourseId) {
                setIsLearningView(true);
                if (selectedCourseFromState) {
                  setSelectedCourse(selectedCourseFromState);
                } else if (selectedCourseId) {
                  const course = streamCourses.find((c: Course) => c.courseId === selectedCourseId);
                  setSelectedCourse(course || streamCourses[0]);
                }
              }

              // Set topic progress
              const normalizedTopicProgress = (currentEnrollment.topicProgress || []).map((tp: any) => ({
                ...tp,
                courseId: String(tp.courseId)
              }));
              setTopicProgress(normalizedTopicProgress);
            } else {
              setEnrollment(currentEnrollment);
            }
          } else {
            toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
            navigate('/pack365');
          }
        } else {
          toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
          navigate('/pack365');
        }
      } catch (error: any) {
        console.error('Error fetching stream enrollment:', error);
        toast({ title: 'Error', description: 'Failed to load enrollment details.', variant: 'destructive' });
        navigate('/pack365');
      } finally {
        setLoading(false);
      }
    };

    fetchStreamEnrollment();
  }, [stream, location]);

  const handleCourseStart = (course: Course) => {
    setSelectedCourse(course);
    setIsLearningView(true);
  };

  const handleBackToStream = () => {
    setIsLearningView(false);
    setSelectedCourse(null);
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && String(tp.topicName) === String(topicName)
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

  // Learning View (Course Details)
  if (isLearningView && selectedCourse) {
    return (
      <>
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
            {/* Header */} 
            <div className="mb-8">
              <Button 
                onClick={handleBackToStream}
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
            </div>
          </div>
        </div>
      </>
    );
  }

  // Stream Overview View
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- Left Sidebar (Sticky) --- */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CircularProgress percentage={enrollment.totalWatchedPercentage || calculateLocalProgress()} />
                  <p className="text-gray-600 mt-4">Overall Completion</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                   <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4"/>Enrolled On</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.enrollmentDate)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookOpen className="h-4 w-4"/>Total Courses</span>
                      <span className="font-semibold text-gray-800">{enrollment.coursesCount}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookCopy className="h-4 w-4"/>Topics</span>
                      <span className="font-semibold text-gray-800">{enrollment.totalTopics}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Users className="h-4 w-4"/>Access Until</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.expiresAt)}</span>
                   </div>
                </CardContent>
              </Card>
              
              {/* Exam Eligibility Cards */}
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

            {/* --- Right Content (Course List) --- */}
            <main className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>Select a course below to start learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrollment.courses && enrollment.courses.length > 0 ? (
                    enrollment.courses.map((course) => (
                      <div key={course.courseId} className="border bg-white rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-800 text-lg">{course.courseName}</h3>
                              <Badge variant="secondary">
                                {course.topics?.length || 0} topics
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" /> 
                                {course.totalDuration} minutes
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

              {/* Stream Progress Summary */}
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
                      <span className="text-sm font-medium">{Math.round(enrollment.totalWatchedPercentage)}%</span>
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
