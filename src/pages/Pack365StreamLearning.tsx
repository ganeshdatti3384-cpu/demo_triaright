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
        <div className="h-6 bg-gray-200 rounded-lg w-1/4 mb-8"></div>

        {/* Progress Card Skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Course Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---
const Pack365StreamLearning: React.FC = () => {
  const { streamName } = useParams<{ streamName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // State
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlayerInitializing, setIsPlayerInitializing] = useState(false);

  // Refs for YouTube Player
  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef(0);
  const accumulatedWatchTimeRef = useRef(0);
  const isPlayerReadyRef = useRef(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const ytApiLoadedRef = useRef(false);
  const playerInitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get auth token
  const getToken = () => {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.token;
      } catch {
        return null;
      }
    }
    return null;
  };

  // --- YouTube Player Logic ---
  
  // ✅ FIX #12: Proper cleanup of YouTube player
  const cleanupPlayer = () => {
    // ✅ FIX #8: Clear intervals properly
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
    accumulatedWatchTimeRef.current = 0;
    isPlayerReadyRef.current = false;
    currentVideoIdRef.current = null;
    setIsPlayerInitializing(false);
  };

  // Handle modal open/close
  useEffect(() => {
    if (isOpen && selectedTopic) {
      // ✅ FIX #6: Reset accumulated watch time to stored value when opening
      const token = getToken();
      if (token && selectedCourse) {
        const existingProgress = topicProgress.find(
          tp => String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
        );
        if (existingProgress) {
          // ✅ FIX #6: Start with existing watchedDuration
          accumulatedWatchTimeRef.current = existingProgress.watchedDuration || 0;
        } else {
          accumulatedWatchTimeRef.current = 0;
        }
      }
      
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
    
    // ✅ FIX #13: Validate video URL before initializing
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
      return;
    }

    // ✅ FIX #12: Cleanup old player before creating new one
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.log('Error destroying old player:', e);
      }
      playerRef.current = null;
    }

    setIsPlayerInitializing(true);

    try {
      playerRef.current = new window.YT.Player(videoContainerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
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
    if (selectedCourse && selectedTopic) {
      const token = getToken();
      if (token) {
        // ✅ FIX #4: Use String() for ID comparison
        const existingProgress = topicProgress.find(
          tp => String(tp.courseId) === String(selectedCourse._id) && 
                tp.topicName === selectedTopic.name
        );
        if (existingProgress && existingProgress.watchedDuration) {
          // ✅ FIX #6: Set accumulated time to existing watchedDuration
          accumulatedWatchTimeRef.current = existingProgress.watchedDuration || 0;
          // Seek to last position if not completed
          if (!existingProgress.watched && existingProgress.watchedDuration > 0) {
            event.target.seekTo(existingProgress.watchedDuration);
          }
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
      case window.YT.PlayerState.BUFFERING:
        // Don't stop tracking on buffering, only on pause
        if (playerState === window.YT.PlayerState.PAUSED) {
          handleProgressUpdate();
        }
        break;
      case window.YT.PlayerState.ENDED:
        handleVideoEnd();
        break;
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    toast({
      title: 'Video Error',
      description: 'There was an error playing the video. Please try again.',
      variant: 'destructive'
    });
    cleanupPlayer();
  };

  const getPlayerStateName = (state: number): string => {
    const states: { [key: number]: string } = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'video cued'
    };
    return states[state] || 'unknown';
  };

  // ✅ FIX #8: Improved progress tracking with proper interval management
  const startProgressTracking = () => {
    // ✅ FIX #8: Clear any existing interval before starting new one
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    progressIntervalRef.current = setInterval(async () => {
      if (!playerRef.current || !isPlayerReadyRef.current) return;

      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        if (currentTime && duration && currentTime > 0) {
          // ✅ FIX #6: Accumulate time properly - take the MAX of current and accumulated
          accumulatedWatchTimeRef.current = Math.max(
            accumulatedWatchTimeRef.current,
            currentTime
          );

          // ✅ FIX #11: Video progress is calculated correctly
          const currentProgress = (currentTime / duration) * 100;
          setVideoProgress(currentProgress);

          // Save progress every 10 seconds
          if (currentTime - lastSavedProgressRef.current >= 10) {
            await handleProgressUpdate();
          }
        }
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }, 1000);
  };

  // ✅ FIX #2, #3, #9: Proper progress update with correct payload and state management
  const handleProgressUpdate = async () => {
    if (!selectedCourse || !selectedTopic || !playerRef.current) return;

    const token = getToken();
    if (!token) return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();

      if (!currentTime || !duration) return;

      // ✅ FIX #6: Use accumulated watch time (MAX of all watched time)
      const watchedDuration = Math.max(accumulatedWatchTimeRef.current, currentTime);
      const progress = (watchedDuration / duration) * 100;

      // Skip if progress hasn't changed significantly
      if (Math.abs(watchedDuration - lastSavedProgressRef.current) < 5) {
        return;
      }

      // ✅ FIX #3: Prepare data with ONLY required fields
      const progressData = {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: watchedDuration
      };

      console.log('Sending progress update:', progressData);

      // ✅ FIX #2: Call updateTopicProgress API
      const response = await pack365Api.updateTopicProgress(token, progressData);

      lastSavedProgressRef.current = currentTime;
      console.log('Progress updated successfully:', progress.toFixed(2) + '%');

      // ✅ FIX #9: Update local state with backend response
      if (response.success) {
        // ✅ FIX #5: Update or add topic progress correctly
        const updatedTopicProgress = [...topicProgress];
        const existingIndex = updatedTopicProgress.findIndex(
          tp => String(tp.courseId) === String(selectedCourse._id) && 
                tp.topicName === selectedTopic.name
        );

        const updatedProgress = {
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watched: response.watched,
          watchedDuration: watchedDuration,
          lastWatchedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
          // ✅ FIX #5: Replace existing entry
          updatedTopicProgress[existingIndex] = updatedProgress;
        } else {
          // ✅ FIX #5: Add new entry
          updatedTopicProgress.push(updatedProgress);
        }

        setTopicProgress(updatedTopicProgress);

        // ✅ FIX #9: Update enrollment stats from backend
        if (enrollment) {
          setEnrollment({
            ...enrollment,
            watchedTopics: response.watchedTopics,
            totalWatchedPercentage: response.totalWatchedPercentage
          });
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // ✅ FIX #7: Proper video end handling
  const handleVideoEnd = async () => {
    if (!selectedCourse || !selectedTopic || !playerRef.current) return;

    const token = getToken();
    if (!token) return;

    try {
      const duration = playerRef.current.getDuration();
      if (!duration) return;

      // ✅ FIX #7: Set watchedDuration to full duration when video ends
      const completionData = {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: duration
      };

      console.log('Marking topic as completed:', completionData);

      // ✅ FIX #7: Call updateTopicProgress API for completion
      const response = await pack365Api.updateTopicProgress(token, completionData);

      if (response.success) {
        setIsTrackingProgress(false);
        setVideoProgress(100);
        
        // ✅ FIX #7, #9: Update local state with backend response
        const updatedTopicProgress = [...topicProgress];
        const existingIndex = updatedTopicProgress.findIndex(
          tp => String(tp.courseId) === String(selectedCourse._id) && 
                tp.topicName === selectedTopic.name
        );

        const completedProgress = {
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watched: true,
          watchedDuration: duration,
          lastWatchedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
          updatedTopicProgress[existingIndex] = completedProgress;
        } else {
          updatedTopicProgress.push(completedProgress);
        }

        setTopicProgress(updatedTopicProgress);

        // ✅ FIX #7, #9: Update enrollment totals from backend
        if (enrollment) {
          setEnrollment({
            ...enrollment,
            watchedTopics: response.watchedTopics,
            totalWatchedPercentage: response.totalWatchedPercentage
          });
        }

        toast({
          title: 'Topic Completed! 🎉',
          description: 'Great job! You've completed this topic.',
        });

        // ✅ FIX #8: Clear interval when video ends
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error marking topic as complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to save completion status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    try {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    } catch (e) {
      return null;
    }
  };

  // Load YouTube API on component mount
  useEffect(() => {
    loadYouTubeAPI();
    
    // Cleanup on unmount
    return () => {
      cleanupPlayer();
    };
  }, []);

  // Fetch enrollment data
  useEffect(() => {
    const fetchEnrollment = async () => {
      const token = getToken();
      if (!token || !streamName) {
        navigate('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const decodedStreamName = decodeURIComponent(streamName);
        const result = await pack365Api.getEnrollmentByStream(token, decodedStreamName);

        if (result.success && result.enrollment) {
          setEnrollment(result.enrollment);
          setTopicProgress(result.enrollment.topicProgress || []);
        } else {
          toast({
            title: 'Not Enrolled',
            description: 'You are not enrolled in this stream.',
            variant: 'destructive'
          });
          navigate('/pack365');
        }
      } catch (error: any) {
        console.error('Error fetching enrollment:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load enrollment data',
          variant: 'destructive'
        });
        navigate('/pack365');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollment();
  }, [streamName, navigate]);

  // ✅ FIX #10: Refresh progress after closing modal
  const handleCloseModal = async () => {
    // Save final progress before closing
    if (isTrackingProgress && playerRef.current && isPlayerReadyRef.current) {
      await handleProgressUpdate();
    }
    
    setIsOpen(false);
    setSelectedTopic(null);
    
    // ✅ FIX #10: Refresh enrollment data from backend after closing
    const token = getToken();
    if (token && streamName) {
      try {
        const decodedStreamName = decodeURIComponent(streamName);
        const result = await pack365Api.getEnrollmentByStream(token, decodedStreamName);
        
        if (result.success && result.enrollment) {
          setEnrollment(result.enrollment);
          setTopicProgress(result.enrollment.topicProgress || []);
        }
      } catch (error) {
        console.error('Error refreshing enrollment:', error);
      }
    }
  };

  const handlePlayTopic = (course: Course, topic: Topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setIsOpen(true);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    // ✅ FIX #4: Use String() for ID comparison
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && tp.topicName === topicName
    );
  };

  const getCourseProgress = (course: Course): number => {
    // ✅ FIX #4: Use String() for ID comparison
    const courseTopics = topicProgress.filter(
      tp => String(tp.courseId) === String(course._id)
    );
    const completedTopics = courseTopics.filter(tp => tp.watched).length;
    return course.topicsCount > 0 ? (completedTopics / course.topicsCount) * 100 : 0;
  };

  const getCourseWatchedTopics = (course: Course): number => {
    // ✅ FIX #4: Use String() for ID comparison
    const courseTopics = topicProgress.filter(
      tp => String(tp.courseId) === String(course._id)
    );
    return courseTopics.filter(tp => tp.watched).length;
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Enrollment Found
          </h2>
          <Button onClick={() => navigate('/pack365')}>
            Back to Streams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/pack365')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Streams
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <GraduationCap className="w-10 h-10 text-blue-600" />
              {enrollment.stream}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Enrolled on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
            </p>
          </div>

          {/* Progress Overview Card */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-blue-600" />
                Your Learning Progress
              </CardTitle>
              <CardDescription>Track your journey through the stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center mb-8">
                {/* ✅ FIX #11: Display backend-provided totalWatchedPercentage */}
                <CircularProgress percentage={enrollment.totalWatchedPercentage} />
                <p className="mt-4 text-lg font-medium text-gray-700">
                  Overall Progress
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <BookCopy className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Courses</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollment.coursesCount}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Total Topics</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollment.totalTopics}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollment.watchedTopics}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Exam Status</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {enrollment.isExamCompleted
                      ? `Passed: ${enrollment.examScore}%`
                      : 'Not Attempted'}
                  </p>
                </div>
              </div>

              {/* Expiration Warning */}
              {new Date(enrollment.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Your enrollment expires on{' '}
                    {new Date(enrollment.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courses Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Available Courses ({enrollment.coursesCount})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrollment.courses.map((course) => {
              const courseProgress = getCourseProgress(course);
              const watchedTopics = getCourseWatchedTopics(course);

              return (
                <Card
                  key={course._id}
                  className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <Video className="w-5 h-5 text-blue-600" />
                          {course.courseName}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={courseProgress === 100 ? 'default' : 'secondary'}
                        className="ml-2 whitespace-nowrap"
                      >
                        {courseProgress === 100 ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : null}
                        {Math.round(courseProgress)}%
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Progress value={courseProgress} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {watchedTopics} of {course.topicsCount} topics completed
                      </p>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.totalDuration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.topicsCount} Topics</span>
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                      {course.topics.map((topic, index) => {
                        const progress = getTopicProgress(course._id, topic.name);
                        const isWatched = progress?.watched || false;
                        const topicWatchPercent = progress?.watchedDuration
                          ? Math.min(100, (progress.watchedDuration / topic.duration) * 100)
                          : 0;

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isWatched
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {isWatched ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {topic.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {formatDuration(topic.duration)}
                                  </p>
                                  {topicWatchPercent > 0 && topicWatchPercent < 100 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {Math.round(topicWatchPercent)}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isWatched ? 'outline' : 'default'}
                              onClick={() => handlePlayTopic(course, topic)}
                              className="ml-2 flex-shrink-0"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              {isWatched ? 'Rewatch' : 'Watch'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Course Actions */}
                    <div className="flex gap-2">
                      {course.documentLink && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(course.documentLink, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Course Materials
                        </Button>
                      )}
                      {courseProgress === 100 && !enrollment.isExamCompleted && (
                        <Button
                          className="flex-1"
                          onClick={() => navigate(`/pack365/${encodeURIComponent(enrollment.stream)}/exam`)}
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Take Exam
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Exam Section */}
          {enrollment.totalWatchedPercentage === 100 && !enrollment.isExamCompleted && (
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Award className="w-12 h-12 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Ready for Final Exam!
                      </h3>
                      <p className="text-gray-600">
                        You've completed all courses. Take the exam to get certified.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => navigate(`/pack365/${encodeURIComponent(enrollment.stream)}/exam`)}
                  >
                    <Award className="w-5 h-5 mr-2" />
                    Take Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exam Completed */}
          {enrollment.isExamCompleted && (
            <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Congratulations! Exam Passed
                    </h3>
                    <p className="text-gray-600">
                      You scored {enrollment.examScore}% on the final exam.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">
                  {selectedTopic?.name}
                </DialogTitle>
                {selectedCourse && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedCourse.courseName}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="ml-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            {/* Video Container */}
            <div className="bg-black rounded-lg overflow-hidden mb-4 relative" style={{ paddingTop: '56.25%' }}>
              {isPlayerInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading player...</p>
                  </div>
                </div>
              )}
              <div
                ref={videoContainerRef}
                className="absolute top-0 left-0 w-full h-full"
                id="youtube-player"
              />
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Watch Progress</span>
                <span className="font-medium text-gray-900">
                  {Math.round(videoProgress)}%
                </span>
              </div>
              <Progress value={videoProgress} className="h-2" />
              {isTrackingProgress && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Your progress is being saved automatically
                </p>
              )}
            </div>

            {/* Topic Info */}
            {selectedTopic && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formatDuration(selectedTopic.duration)}</p>
                  </div>
                  {selectedTopic.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedTopic.link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in YouTube
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Pack365StreamLearning;
