import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, X, Loader2, Clock, Play, CheckCircle2 } from 'lucide-react';
import { pack365Api, UpdateTopicProgressData } from '@/services/api';

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
  totalWatchedPercentage: number;
  totalCourseDuration?: number;
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

// Progress queue utilities
const PROGRESS_QUEUE_KEY = 'pack365_progress_queue_v2';

const enqueueProgress = (item: any) => {
  try {
    const raw = localStorage.getItem(PROGRESS_QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((existing: any) => 
      !(existing.courseId === item.courseId && existing.topicName === item.topicName)
    );
    filtered.push(item);
    localStorage.setItem(PROGRESS_QUEUE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('enqueueProgress failed', e);
  }
};

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
  const progressMutex = useRef<Promise<void>>(Promise.resolve());

  const getTopicDurationSeconds = useCallback(() => {
    if (!selectedTopic || !selectedCourse) return 0;
    const dur = selectedTopic.duration ?? 0;
    return dur > 1000 ? Math.floor(dur) : Math.floor(dur * 60);
  }, [selectedTopic, selectedCourse]);

  const getCourseTotalSeconds = useCallback(() => {
    if (!selectedCourse) return 0;
    return selectedCourse.totalDuration > 1000 ? Math.floor(selectedCourse.totalDuration) : Math.floor(selectedCourse.totalDuration * 60);
  }, [selectedCourse]);

  const refreshEnrollmentFromServer = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !enrollment) return;
      const res = await pack365Api.getMyEnrollments(token);
      if (res && res.success && res.enrollments) {
        const matched = (res.enrollments as StreamEnrollment[]).find(e => e.stream.toLowerCase() === enrollment.stream.toLowerCase());
        if (matched) {
          const normalized = (matched.topicProgress || []).map((tp: any) => ({
            ...tp,
            courseId: String(tp.courseId),
            watchedDuration: Math.floor(tp.watchedDuration || 0)
          }));
          setEnrollment(prev => prev ? { ...prev, totalWatchedPercentage: matched.totalWatchedPercentage ?? prev.totalWatchedPercentage, watchedTopics: matched.watchedTopics ?? prev.watchedTopics, totalTopics: matched.totalTopics ?? prev.totalTopics, topicProgress: normalized } : prev);
          setTopicProgress(normalized);
        }
      }
    } catch (err) {
      console.error('refreshEnrollmentFromServer failed', err);
    }
  }, [enrollment, setEnrollment, setTopicProgress]);

  const cleanupPlayer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (checkApiIntervalRef.current) {
      clearInterval(checkApiIntervalRef.current);
      checkApiIntervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo && playerRef.current.stopVideo();
        playerRef.current.destroy && playerRef.current.destroy();
      } catch (e) {
        console.warn('YouTube player cleanup warning:', e);
      }
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
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

    const createPlayerWhenReady = () => {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          try { 
            playerRef.current.destroy(); 
          } catch (e) { 
            console.warn('Player destroy warning:', e);
          }
          playerRef.current = null;
        }

        if (videoContainerRef.current) {
          videoContainerRef.current.innerHTML = '';
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
        if (!checkApiIntervalRef.current) {
          checkApiIntervalRef.current = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(checkApiIntervalRef.current);
              checkApiIntervalRef.current = null;
              createPlayerWhenReady();
            }
          }, 150);
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

    if (selectedCourse && selectedTopic) {
      const existing = topicProgress.find(tp =>
        String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name
      );
      if (existing) {
        accumulatedWatchTimeRef.current = existing.watchedDuration || 0;
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
      description: 'Video failed to play. Please try again later.',
      variant: 'destructive'
    });
  };

  const startTrackingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const updateProgressToBackend = async (immediate = false) => {
    if (!selectedCourse || !selectedTopic) return;

    progressMutex.current = progressMutex.current.then(async () => {
      try {
        if (!playerRef.current || !isPlayerReadyRef.current) {
          return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
          const dur = Math.floor(playerRef.current.getCurrentTime());
          const payloadOffline = {
            courseId: selectedCourse._id,
            topicName: selectedTopic.name,
            watchedDuration: dur
          };
          enqueueProgress(payloadOffline);
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
        if (!immediate && Math.abs(accumulatedWatchTimeRef.current - lastSaved) < 5 && Math.abs(progressPercent - ((lastSaved / Math.max(1, durationSeconds)) * 100)) < 5) {
          return;
        }

        const payload: UpdateTopicProgressData = {
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watchedDuration: Math.floor(accumulatedWatchTimeRef.current),
          totalCourseDuration: enrollment?.totalCourseDuration ?? getCourseTotalSeconds()
        };

        setSyncing(true);

        try {
          const resp = await pack365Api.updateTopicProgress(token, payload);
          lastSavedTimeRef.current = accumulatedWatchTimeRef.current;
          setSyncing(false);
          setLastSyncAt(new Date().toISOString());
          unsentRetryCountRef.current = 0;

          setTopicProgress(prev => {
            const copy = [...prev];
            const existingIndex = copy.findIndex(tp => String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name);
            const updated: TopicProgress = {
              courseId: String(selectedCourse._id),
              topicName: selectedTopic.name,
              watched: resp.watched ?? (progressPercent >= 95),
              watchedDuration: Math.floor(accumulatedWatchTimeRef.current),
              lastWatchedAt: new Date().toISOString()
            };
            if (existingIndex >= 0) copy[existingIndex] = { ...copy[existingIndex], ...updated };
            else copy.push(updated);
            return copy;
          });

          if (typeof resp.totalWatchedPercentage === 'number' || typeof resp.watchedTopics === 'number') {
            setEnrollment(prev => prev ? {
              ...prev,
              totalWatchedPercentage: typeof resp.totalWatchedPercentage === 'number' ? resp.totalWatchedPercentage : prev.totalWatchedPercentage,
              watchedTopics: typeof resp.watchedTopics === 'number' ? resp.watchedTopics : prev.watchedTopics,
              totalTopics: typeof resp.totalTopics === 'number' ? resp.totalTopics : prev.totalTopics
            } : prev);
          } else {
            await refreshEnrollmentFromServer();
          }
        } catch (err: any) {
          console.error('Failed to send progress, enqueueing for retry', err);
          enqueueProgress(payload);
          setSyncing(false);
          unsentRetryCountRef.current += 1;
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
        setSyncing(false);
      }
    });

    return progressMutex.current;
  };

  const markTopicAsCompletedAutomatically = async () => {
    if (!selectedTopic || !selectedCourse) return;
    try {
      const token = localStorage.getItem('token');
      const duration = getTopicDurationSeconds();

      accumulatedWatchTimeRef.current = duration;

      const payload: UpdateTopicProgressData = {
        courseId: selectedCourse._id,
        topicName: selectedTopic.name,
        watchedDuration: duration,
        totalCourseDuration: enrollment?.totalCourseDuration ?? getCourseTotalSeconds()
      };

      setSyncing(true);
      try {
        const response = await pack365Api.updateTopicProgress(token || '', payload);
        setSyncing(false);

        setTopicProgress(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(tp => String(tp.courseId) === String(selectedCourse._id) && tp.topicName === selectedTopic.name);
          const completedProgress: TopicProgress = {
            courseId: String(selectedCourse._id),
            topicName: selectedTopic.name,
            watchedDuration: duration,
            watched: true,
            lastWatchedAt: new Date().toISOString()
          };
          if (idx >= 0) copy[idx] = { ...copy[idx], ...completedProgress };
          else copy.push(completedProgress);
          return copy;
        });

        await refreshEnrollmentFromServer();

        toast({
          title: 'Topic Completed!',
          description: `"${selectedTopic.name}" has been marked as completed.`,
          variant: 'default'
        });

        setTimeout(() => {
          onClose();
        }, 900);
      } catch (err: any) {
        console.error('Error marking topic as completed:', err);
        enqueueProgress(payload);
        setSyncing(false);
        toast({
          title: 'Completion Error',
          description: 'Failed to mark topic as completed. Progress saved for retry.',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('markTopicAsCompletedAutomatically outer error', err);
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
      const t = setTimeout(() => {
        initializePlayer();
      }, 300);
      const poll = setInterval(async () => {
        await refreshEnrollmentFromServer();
      }, 30000);

      return () => {
        clearTimeout(t);
        clearInterval(poll);
        cleanupPlayer();
      };
    } else {
      cleanupPlayer();
    }
  }, [isOpen, selectedTopic]);

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

export default VideoLearningModal;
