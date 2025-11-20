/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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

// --- Interfaces for Type Safety ---
// NOTE: explicitly include durations in seconds (backend uses seconds)
interface Topic {
  name: string;
  link: string;
  duration: number; // duration as provided by backend (seconds preferred). UI will normalize.
}

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number; // can be seconds or minutes from older data; normalize helpers will handle it
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
  watchedDuration: number; // in seconds
  lastWatchedAt?: string;
}

interface StreamEnrollment {
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  totalWatchedPercentage: number; // backend authoritative value (0-100)
  totalCourseDuration?: number; // seconds - total for stream
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Course[];
  topicProgress: TopicProgress[];
  paymentStatus?: string;
}

// YouTube Player types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// --- Helper Utilities ---

/**
 * Normalize course total duration to seconds.
 * Backend typically supplies seconds. Older frontend used minutes.
 * Heuristic: if value > 1000 => treat as seconds, else treat as minutes.
 */
const normalizeToSeconds = (value?: number): number => {
  if (!value) return 0;
  if (value > 1000) return Math.floor(value); // assume seconds
  return Math.floor(value * 60); // assume minutes
};

const secondsToMinutesLabel = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.ceil(seconds / 60);
  return `${mins} min`;
};

// localStorage queue key for offline/unsynced progress
const PROGRESS_QUEUE_KEY = 'pack365_progress_queue_v2';

// enqueue progress update for later retry/persistence
const enqueueProgress = (item: any) => {
  try {
    const raw = localStorage.getItem(PROGRESS_QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(arr));
  } catch (e) {
    // ignore storage errors
    console.error('enqueueProgress failed', e);
  }
};

const drainProgressQueue = async (token: string, onSuccess?: (resp: any) => void) => {
  try {
    const raw = localStorage.getItem(PROGRESS_QUEUE_KEY);
    const arr: any[] = raw ? JSON.parse(raw) : [];
    if (!arr.length) return;
    // attempt send sequentially
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      try {
        const resp = await pack365Api.updateTopicProgress(token, item);
        onSuccess && onSuccess(resp);
        // on success, remove item from queue
        const currentRaw = localStorage.getItem(PROGRESS_QUEUE_KEY);
        const currentArr = currentRaw ? JSON.parse(currentRaw) : [];
        // find first matching by unique id if available, otherwise shift
        if (currentArr.length) {
          currentArr.shift();
          localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(currentArr));
        }
      } catch (err) {
        // stop further attempts for now (respect backoff)
        console.error('drainProgressQueue item failed', err);
        break;
      }
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

// --- Video Modal with improved progress tracking, offline queueing and sync ---
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
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  // YouTube Player Refs
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any | null>(null);
  const checkApiIntervalRef = useRef<any | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const ytApiLoadedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | null>(null);
  const accumulatedWatchTimeRef = useRef<number>(0);
  const unsentRetryCountRef = useRef<number>(0);
  const pollingRef = useRef<any | null>(null);

  // compute durationSeconds for selected topic (prefer topic.duration if in seconds)
  const getTopicDurationSeconds = useCallback(() => {
    if (!selectedTopic || !selectedCourse) return 0;
    // If topic.duration appears to be minutes (small number) convert to seconds heuristically
    if (selectedTopic.duration > 1000) return Math.floor(selectedTopic.duration);
    return Math.floor(selectedTopic.duration * 60);
  }, [selectedTopic, selectedCourse]);

  // compute totalCourseDuration for this course in seconds
  const getCourseTotalSeconds = useCallback(() => {
    if (!selectedCourse) return 0;
    return normalizeToSeconds(selectedCourse.totalDuration);
  }, [selectedCourse]);

  // cleanup function for player and intervals
  const cleanupPlayer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (checkApiIntervalRef.current) {
      clearInterval(checkApiIntervalRef.current);
      checkApiIntervalRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo && playerRef.current.stopVideo();
        playerRef.current.destroy && playerRef.current.destroy();
      } catch (e) {
        // ignore
      }
      playerRef.current = null;
    }
    isPlayerReadyRef.current = false;
    currentVideoIdRef.current = null;
    accumulatedWatchTimeRef.current = 0;
    lastSavedTimeRef.current = 0;
    setIsTrackingProgress(false);
    setVideoProgress(0);
  };

  // Load YouTube API script if not loaded
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
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoadedRef.current = true;
      if (isOpen && selectedTopic) {
        initializePlayer();
      }
    };
  };

  // initialize YT Player for the given video
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
      // already initialized for same video
      return;
    }

    currentVideoIdRef.current = videoId;
    setIsPlayerInitializing(true);

    const createPlayerWhenReady = () => {
      if (window.YT && window.YT.Player) {
        // destroy old
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch (e) { /* ignore */ }
          playerRef.current = null;
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
        // keep polling until API ready up to a time limit
        if (!checkApiIntervalRef.current) {
          checkApiIntervalRef.current = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(checkApiIntervalRef.current);
              checkApiIntervalRef.current = null;
              createPlayerWhenReady();
            }
          }, 150);
          // safety timeout
          setTimeout(() => {
            if (checkApiIntervalRef.current) {
              clearInterval(checkApiIntervalRef.current);
              checkApiIntervalRef.current = null;
              setIsPlayerInitializing(false);
              toast({
                title: 'YouTube Error',
                description: 'Unable to load YouTube player. Please refresh.',
                variant: 'destructive'
              });
            }
          }, 10000);
        }
      }
    };

    createPlayerWhenReady();
  };

  const onPlayerReady = (event: any) => {
    isPlayerReadyRef.current = true;
    setIsPlayerInitializing(false);
    setIsTrackingProgress(false);
    lastSavedTimeRef.current = 0;
    accumulatedWatchTimeRef.current = 0;

    // load previous progress (if any)
    if (selectedCourse && selectedTopic) {
      const existing = topicProgress.find(tp =>
        String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
      );
      if (existing) {
        accumulatedWatchTimeRef.current = existing.watchedDuration || 0;
        // seek to last saved position if not completed
        if (!existing.watched && existing.watchedDuration > 0) {
          try {
            event.target.seekTo(Math.floor(existing.watchedDuration), true);
          } catch (e) { /* ignore */ }
        }
        setVideoProgress(existing.watchedDuration && getTopicDurationSeconds() ? Math.min(100, (existing.watchedDuration / getTopicDurationSeconds()) * 100) : 0);
      }
    }
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    // PLAYING = 1, PAUSED = 2, ENDED = 0
    if (state === window.YT.PlayerState.PLAYING) {
      setIsTrackingProgress(true);
      startTrackingInterval();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsTrackingProgress(false);
      stopTrackingInterval();
      // immediate save on pause
      updateProgressToBackend(true);
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsTrackingProgress(false);
      stopTrackingInterval();
      // mark complete immediately
      markTopicAsCompletedAutomatically();
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube Player Error', event);
    setIsPlayerInitializing(false);
    toast({
      title: 'Video Error',
      description: 'Video failed to play. Please try again later.',
      variant: 'destructive'
    });
  };

  // Start an interval that checks progress frequently but only persists when thresholds crossed
  const startTrackingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(async () => {
      await updateProgressToBackend(false);
    }, 5000); // check every 5s - send only on threshold to avoid spamming
  };

  const stopTrackingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // main function to update progress to backend
  // immediate flag forces an update even if thresholds not reached
  const updateProgressToBackend = async (immediate = false) => {
    if (!selectedCourse || !selectedTopic) return;

    try {
      if (!playerRef.current || !isPlayerReadyRef.current) {
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        // nothing to do offline: enqueue for later when user logs in
        return;
      }

      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      const durationSeconds = getTopicDurationSeconds();
      if (durationSeconds <= 0) return;

      // accumulate max watched time
      accumulatedWatchTimeRef.current = Math.max(accumulatedWatchTimeRef.current, currentTime);

      // cap at duration
      if (accumulatedWatchTimeRef.current > durationSeconds) {
        accumulatedWatchTimeRef.current = durationSeconds;
      }

      // compute progress percentage
      const progressPercent = Math.min(100, (accumulatedWatchTimeRef.current / durationSeconds) * 100);
      setVideoProgress(progressPercent);

      // check thresholds:
      // send if immediate OR difference since last saved >= 5 seconds OR percent changed by >=5%
      if (!immediate && Math.abs(accumulatedWatchTimeRef.current - lastSavedTimeRef.current) < 5 && Math.abs(progressPercent - (lastSavedTimeRef.current / Math.max(1, durationSeconds) * 100)) < 5) {
        return;
      }

      // build payload in seconds and include course totals so backend can recalc and cap
      const payload: UpdateTopicProgressData = {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: Math.floor(accumulatedWatchTimeRef.current),
        totalCourseDuration: enrollment?.totalCourseDuration ?? undefined,
        totalWatchedPercentage: enrollment?.totalWatchedPercentage ?? undefined
      };

      setSyncing(true);

      // try send with retry once; on failure enqueue to localStorage for later
      try {
        const resp = await pack365Api.updateTopicProgress(token, payload);
        // update local lastSavedTime
        lastSavedTimeRef.current = accumulatedWatchTimeRef.current;
        setSyncing(false);
        setLastSyncAt(new Date().toISOString());
        unsentRetryCountRef.current = 0;

        // update local topicProgress with backend response best data
        setTopicProgress(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(tp => String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name);
          const updated: TopicProgress = {
            courseId: String(selectedCourse._id),
            topicName: selectedTopic.name,
            watched: resp.watched ?? (progressPercent >= 95), // backend guidance preferred
            watchedDuration: Math.floor(accumulatedWatchTimeRef.current),
            lastWatchedAt: new Date().toISOString()
          };
          if (idx >= 0) copy[idx] = { ...copy[idx], ...updated };
          else copy.push(updated);
          return copy;
        });

        // if backend returned new totalWatchedPercentage, update enrollment
        if (typeof resp.totalWatchedPercentage === 'number' || typeof resp.watchedTopics === 'number') {
          setEnrollment(prev => prev ? {
            ...prev,
            totalWatchedPercentage: typeof resp.totalWatchedPercentage === 'number' ? resp.totalWatchedPercentage : prev.totalWatchedPercentage,
            watchedTopics: typeof resp.watchedTopics === 'number' ? resp.watchedTopics : prev.watchedTopics,
            totalTopics: typeof resp.totalTopics === 'number' ? resp.totalTopics : prev.totalTopics
          } : prev);
        }
      } catch (err) {
        console.error('Failed to send progress, enqueueing for retry', err);
        // enqueue for retry and persist
        enqueueProgress(payload);
        setSyncing(false);
        unsentRetryCountRef.current += 1;
        // show small non-blocking toast once per failure
        if (unsentRetryCountRef.current <= 1) {
          toast({
            title: 'Progress Save Failed',
            description: 'Progress will be saved when connection is restored.',
            variant: 'destructive'
          });
        }
      }
    } catch (err: any) {
      console.error('updateProgressToBackend error', err);
    }
  };

  const markTopicAsCompletedAutomatically = async () => {
    if (!selectedCourse || !selectedTopic) return;
    try {
      const token = localStorage.getItem('token');
      const durationSeconds = getTopicDurationSeconds();
      accumulatedWatchTimeRef.current = durationSeconds; // mark full duration

      // immediate save with watchedDuration = full duration
      await updateProgressToBackend(true);

      // optimistic UI update
      setTopicProgress(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(tp => String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name);
        const completed: TopicProgress = {
          courseId: String(selectedCourse._id),
          topicName: selectedTopic.name,
          watched: true,
          watchedDuration: durationSeconds,
          lastWatchedAt: new Date().toISOString()
        };
        if (idx >= 0) copy[idx] = { ...copy[idx], ...completed };
        else copy.push(completed);
        return copy;
      });

      toast({
        title: 'Topic Completed!',
        description: `"${selectedTopic.name}" marked as completed.`,
        variant: 'default'
      });

      // briefly show before close
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('markTopicAsCompletedAutomatically error', err);
      toast({
        title: 'Completion Error',
        description: 'Failed to mark topic as completed. Progress saved for retry.',
        variant: 'destructive'
      });
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

  // flush any queued progress when modal mounts and periodically
  useEffect(() => {
    const tryDrain = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await drainProgressQueue(token, (resp) => {
        if (resp && resp.totalWatchedPercentage !== undefined) {
          setEnrollment(prev => prev ? { ...prev, totalWatchedPercentage: resp.totalWatchedPercentage } : prev);
        }
      });
    };
    tryDrain();
    // set interval to drain every 20s
    const drainInterval = setInterval(tryDrain, 20000);
    return () => clearInterval(drainInterval);
  }, []);

  // when modal opens, load API and initialize player and start polling for enrollment updates
  useEffect(() => {
    if (isOpen && selectedTopic) {
      loadYouTubeAPI();
      // small delay to allow modal render then init
      const t = setTimeout(() => {
        initializePlayer();
      }, 300);
      // also start polling enrollment progress (to reflect backend authoritative progress) every 30s
      pollingRef.current = setInterval(async () => {
        const token = localStorage.getItem('token');
        if (!token || !enrollment) return;
        try {
          const resp = await pack365Api.getMyEnrollments(token);
          if (resp && resp.success && resp.enrollments) {
            const matched = (resp.enrollments as StreamEnrollment[]).find(e => e.stream.toLowerCase() === (enrollment.stream || '').toLowerCase());
            if (matched) {
              // normalize topicProgress ids to strings
              const normalized = (matched.topicProgress || []).map((tp: any) => ({ ...tp, courseId: String(tp.courseId) }));
              setEnrollment(prev => prev ? { ...prev, totalWatchedPercentage: matched.totalWatchedPercentage ?? prev.totalWatchedPercentage, watchedTopics: matched.watchedTopics ?? prev.watchedTopics, totalTopics: matched.totalTopics ?? prev.totalTopics } : prev);
              setTopicProgress(normalized);
            }
          }
        } catch (err) {
          // ignore polling errors silently
        }
      }, 30000);

      return () => {
        clearTimeout(t);
        cleanupPlayer();
      };
    } else {
      cleanupPlayer();
    }
  }, [isOpen, selectedTopic]);

  // cleanup when component unmounts
  useEffect(() => {
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
              {syncing && <span className="text-sm text-gray-500 mr-2">Saving...</span>}
              {lastSyncAt && <span className="text-xs text-gray-400 mr-2">Last saved: {new Date(lastSyncAt).toLocaleTimeString()}</span>}
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
                style={{ minHeight: 320 }}
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

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleManualComplete}
                      variant="default"
                      size="sm"
                      disabled={isPlayerInitializing}
                      title="Mark as completed (will save progress)"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
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
  const [syncingOverview, setSyncingOverview] = useState(false);

  // Fetch enrollments and courses
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
        // Fetch enrollments (backend authoritative)
        const response = await pack365Api.getMyEnrollments(token);

        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            // Normalize topicProgress ids to strings and durations
            const normalizedTopicProgress = (currentEnrollment.topicProgress || []).map((tp: any) => ({
              ...tp,
              courseId: String(tp.courseId),
              watchedDuration: Math.floor(tp.watchedDuration || 0)
            })) as TopicProgress[];

            // Fetch all courses to get full course data
            const coursesResponse = await pack365Api.getAllCourses();
            if (coursesResponse.success && coursesResponse.data) {
              // normalize courses durations & topics durations (ensure seconds)
              const streamCourses = coursesResponse.data
                .map((course: any) => {
                  const normalizedTopics = (course.topics || []).map((t: any) => {
                    // backend likely sends seconds; fallback if small number treat as minutes
                    const dur = t.duration ?? 0;
                    return { ...t, duration: dur > 1000 ? dur : dur * 60 };
                  });
                  return {
                    ...course,
                    topics: normalizedTopics,
                    _id: course._id || course.courseId,
                    totalDuration: normalizeToSeconds(course.totalDuration)
                  };
                })
                .filter((course: Course) => course.stream && course.stream.toLowerCase() === stream?.toLowerCase());

              setAllCourses(streamCourses);

              // Calculate total course duration for the stream (seconds)
              const totalStreamDuration = streamCourses.reduce((sum, c) => sum + normalizeToSeconds(c.totalDuration), 0);

              // Prefer backend's totalWatchedPercentage if available, else compute from topic flags
              let accurateProgress = currentEnrollment.totalWatchedPercentage ?? 0;

              if (accurateProgress === undefined || accurateProgress === null) {
                // compute based on counted watched topics vs total topics
                let totalWatchedTopics = 0;
                let totalTopicsInStream = 0;
                streamCourses.forEach(c => {
                  totalTopicsInStream += (c.topics || []).length;
                  const watchedInCourse = (normalizedTopicProgress || []).filter((tp: any) => tp.courseId === String(c._id) && tp.watched === true).length;
                  totalWatchedTopics += watchedInCourse;
                });
                accurateProgress = totalTopicsInStream > 0 ? (totalWatchedTopics / totalTopicsInStream) * 100 : 0;
              }

              // enhance enrollment with normalized values
              const enhancedEnrollment: StreamEnrollment = {
                ...currentEnrollment,
                courses: streamCourses,
                topicProgress: normalizedTopicProgress,
                totalTopics: normalizedTopicProgress.length,
                watchedTopics: normalizedTopicProgress.filter(tp => tp.watched).length,
                totalWatchedPercentage: Math.min(100, Math.round(accurateProgress)),
                coursesCount: streamCourses.length,
                totalCourseDuration: totalStreamDuration
              };

              setEnrollment(enhancedEnrollment);

              // Handle navigation state (open a specific course)
              const selectedCourseFromState = (location.state as any)?.selectedCourse;
              const selectedCourseId = (location.state as any)?.selectedCourseId;

              if (selectedCourseFromState || selectedCourseId) {
                setIsLearningView(true);
                if (selectedCourseFromState) {
                  setSelectedCourse(selectedCourseFromState);
                } else if (selectedCourseId) {
                  const course = streamCourses.find((c: Course) => c.courseId === selectedCourseId || c._id === selectedCourseId);
                  setSelectedCourse(course || streamCourses[0]);
                }
              }

              setTopicProgress(normalizedTopicProgress);
            } else {
              // if courses cannot be fetched, still set enrollment
              setEnrollment({
                ...currentEnrollment,
                topicProgress: normalizedTopicProgress,
                totalWatchedPercentage: currentEnrollment.totalWatchedPercentage ?? 0,
                totalCourseDuration: currentEnrollment.totalCourseDuration ?? undefined,
                courses: currentEnrollment.courses || [],
                coursesCount: currentEnrollment.courses ? currentEnrollment.courses.length : 0
              } as StreamEnrollment);
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
        setSyncingOverview(false);
      }
    };

    fetchStreamEnrollment();
  }, [stream, location]);

  // Attempts to flush queue periodically while the main view is mounted
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await drainProgressQueue(token, (resp) => {
        if (resp && typeof resp.totalWatchedPercentage === 'number') {
          setEnrollment(prev => prev ? { ...prev, totalWatchedPercentage: resp.totalWatchedPercentage } : prev);
        }
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

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
                      {secondsToMinutesLabel(normalizeToSeconds(selectedCourse.totalDuration))}
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
                      const normalizedTopicDuration = topic.duration > 1000 ? topic.duration : topic.duration * 60;
                      const progress = getTopicProgress(selectedCourse._id, topic.name);
                      const isWatched = !!progress?.watched;
                      const watchedDuration = progress?.watchedDuration || 0;
                      const percent = normalizedTopicDuration ? Math.min(100, (watchedDuration / normalizedTopicDuration) * 100) : 0;

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
                                    {secondsToMinutesLabel(normalizeToSeconds(normalizedTopicDuration))}
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
                      <div key={course.courseId || course._id} className="border bg-white rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
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
                                {secondsToMinutesLabel(normalizeToSeconds(course.totalDuration))}
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
