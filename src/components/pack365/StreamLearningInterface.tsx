import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  duration: number; // minutes
}

interface Course {
  _id: string; // Mongo _id
  courseId: string; // courseId string
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number; // minutes or whatever backend uses for course total (backend sends enrollment.totalCourseDuration which we'll use)
  topics: Topic[];
}

interface TopicProgress {
  courseId: string; // stored as Mongo _id (string in API responses)
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
  lastWatchedAt?: string;
}

interface Enrollment {
  _id: string;
  stream: string;
  totalWatchedPercentage: number;
  topicProgress: TopicProgress[];
  isExamCompleted: boolean;
  examScore: number | null;
  totalCourseDuration?: number; // seconds (backend-provided aggregate). Use this when present.
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
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
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Local playback tracking
  const playerRef = useRef<any | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null); // 1s UI tick
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null); // 5s save tick
  const lastSavedWatchedRef = useRef<number>(0); // seconds, last value saved to backend
  const currentPlayTimeRef = useRef<number>(0); // seconds, latest observed currentTime
  const isPlayingRef = useRef<boolean>(false);
  const ytPlayerContainerIdRef = useRef<string>('');
  const [videoProgress, setVideoProgress] = useState<number>(0); // percent of current topic watched (0-100)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  // Load stream data (enrollments + courses)
  useEffect(() => {
    loadStreamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopAllTracking();
      destroyPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to clear intervals and flags
  const stopAllTracking = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    isPlayingRef.current = false;
  };

  const destroyPlayer = () => {
    try {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    } catch (err) {
      // ignore
    } finally {
      playerRef.current = null;
    }
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

      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      
      if (!enrollmentResponse.success || !enrollmentResponse.enrollments) {
        setError('Failed to load enrollment data');
        toast({ title: 'Error', description: 'Failed to load enrollment data', variant: 'destructive' });
        return;
      }

      // Find enrollment for current stream (response fields are structured objects)
      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }

      // Enrollment coming from backend should include topicProgress array and totalCourseDuration in seconds (as per requirements)
      setEnrollment(streamEnrollment);
      setTopicProgress(streamEnrollment.topicProgress || []);

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

      // keep exam eligibility check (uses enrollment state)
      await checkExamEligibility();

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

  const checkExamEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Check if user has completed enough progress
      if (enrollment && enrollment.totalWatchedPercentage >= 80) {
        const availableExamsResponse = await pack365Api.getAvailableExams(token);
        
        if (availableExamsResponse.success && availableExamsResponse.exams) {
          // Check if there are any available exams for current courses
          const eligibleExams = availableExamsResponse.exams.filter((exam: any) => {
            return courses.some(course => course._id === exam.courseId);
          });
          
          // show toast if eligible
          if (eligibleExams.length > 0) {
            toast({
              title: 'Exam Available!',
              description: `You can now take the ${stream} stream exam.`,
              variant: 'default'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking exam eligibility:', error);
    }
  };

  // YouTube utils
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const loadYouTubeIframeApi = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      // Attach callback and insert script once
      const existingScript = document.getElementById('yt-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.id = 'yt-iframe-api';
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
      // In case API loads before callback attached
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  };

  // Utility to get previous saved watchedDuration (seconds) from local topicProgress for current course/topic
  const getPreviousWatched = (courseId: string, topicName: string): number => {
    const tp = topicProgress.find(tp => tp.courseId === courseId && tp.topicName === topicName);
    return tp?.watchedDuration || 0;
  };

  // Compute total watched seconds across all topics using local enrollment.topicProgress array (if enrollment.totalCourseDuration is used by backend)
  const computeTotalWatchedSeconds = (overrides?: { courseId: string; topicName: string; watchedDuration: number }[]) => {
    // Start with enrollment.topicProgress if available, otherwise local topicProgress state
    const source = enrollment?.topicProgress || topicProgress || [];
    let map = new Map<string, number>();
    source.forEach(tp => {
      const key = `${tp.courseId}::${tp.topicName}`;
      map.set(key, tp.watchedDuration || 0);
    });
    if (overrides) {
      overrides.forEach(o => {
        const key = `${o.courseId}::${o.topicName}`;
        map.set(key, o.watchedDuration);
      });
    }
    let sum = 0;
    for (const val of map.values()) sum += val;
    return sum;
  };

  // Compute totalWatchedPercentage based on enrollment.totalCourseDuration (expected in seconds from backend)
  const computeTotalWatchedPercentage = (overrides?: { courseId: string; topicName: string; watchedDuration: number }[]) => {
    const totalWatchedSeconds = computeTotalWatchedSeconds(overrides);
    const totalCourseDurationSeconds = enrollment?.totalCourseDuration || 0;
    if (!totalCourseDurationSeconds || totalCourseDurationSeconds <= 0) return 0;
    return Math.round((totalWatchedSeconds / totalCourseDurationSeconds) * 100);
  };

  // Save progress to backend for a given topic with watchedSeconds (seconds). This will be invoked every 5s, onPause, onEnded.
  const saveProgressToBackend = useCallback(async (watchedSeconds: number) => {
    if (!selectedCourse || !selectedTopic || !enrollment) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Ensure we don't claim more than actual topic duration
      const maxTopicSeconds = Math.floor((selectedTopic.duration || 0) * 60);
      const cappedWatched = Math.min(Math.floor(watchedSeconds), maxTopicSeconds);

      // previous watched from local state/enrollment
      const prevWatched = getPreviousWatched(selectedCourse._id, selectedTopic.name) || 0;

      // watchedDuration must always be max(previous, currentObserved)
      const watchedDurationToSend = Math.max(prevWatched, cappedWatched);

      // Prepare new totalWatchedPercentage using override for this topic
      const totalWatchedPercentage = computeTotalWatchedPercentage([
        { courseId: selectedCourse._id, topicName: selectedTopic.name, watchedDuration: watchedDurationToSend }
      ]);

      const body = {
        courseId: selectedCourse._id, // MUST be Mongo _id per requirement
        topicName: selectedTopic.name,
        watchedDuration: watchedDurationToSend,
        totalCourseDuration: enrollment.totalCourseDuration || 0,
        totalWatchedPercentage: totalWatchedPercentage
      };

      const response = await pack365Api.updateTopicProgress(token, body);

      if (response && response.success) {
        // After update, ensure we sync topicProgress from server to maintain truth
        // Backend's getMyEnrollments returns all enrollments; fetch them and extract current stream enrollment
        const myEnrollResp = await pack365Api.getMyEnrollments(token);
        if (myEnrollResp && myEnrollResp.success && myEnrollResp.enrollments) {
          const updatedEnrollment = myEnrollResp.enrollments.find((e: any) => e.stream?.toLowerCase() === stream?.toLowerCase());
          if (updatedEnrollment) {
            setEnrollment(updatedEnrollment);
            setTopicProgress(updatedEnrollment.topicProgress || []);
            // Update lastSavedWatchedRef to the watchedDuration stored on server for this topic (if available)
            const updatedTP = (updatedEnrollment.topicProgress || []).find((tp: TopicProgress) => tp.courseId === selectedCourse._id && tp.topicName === selectedTopic.name);
            if (updatedTP) {
              lastSavedWatchedRef.current = updatedTP.watchedDuration || watchedDurationToSend;
            } else {
              lastSavedWatchedRef.current = watchedDurationToSend;
            }
          } else {
            // fallback: update local topicProgress array optimistically
            lastSavedWatchedRef.current = watchedDurationToSend;
            setTopicProgress(prev => {
              const idx = prev.findIndex(tp => tp.courseId === selectedCourse._id && tp.topicName === selectedTopic.name);
              if (idx >= 0) {
                return prev.map((tp, i) => i === idx ? { ...tp, watchedDuration: watchedDurationToSend, watched: tp.watched || (watchedDurationToSend >= Math.floor(selectedTopic.duration * 60 * 0.8)) } : tp);
              } else {
                return [...prev, { courseId: selectedCourse._id, topicName: selectedTopic.name, watched: watchedDurationToSend >= Math.floor(selectedTopic.duration * 60 * 0.8), watchedDuration: watchedDurationToSend, lastWatchedAt: new Date().toISOString() }];
              }
            });
          }
        } else {
          // If we cannot fetch updated enrollments, still update local values conservatively
          lastSavedWatchedRef.current = watchedDurationToSend;
          setTopicProgress(prev => {
            const idx = prev.findIndex(tp => tp.courseId === selectedCourse._id && tp.topicName === selectedTopic.name);
            if (idx >= 0) {
              return prev.map((tp, i) => i === idx ? { ...tp, watchedDuration: watchedDurationToSend, watched: tp.watched || (watchedDurationToSend >= Math.floor(selectedTopic.duration * 60 * 0.8)) } : tp);
            } else {
              return [...prev, { courseId: selectedCourse._id, topicName: selectedTopic.name, watched: watchedDurationToSend >= Math.floor(selectedTopic.duration * 60 * 0.8), watchedDuration: watchedDurationToSend, lastWatchedAt: new Date().toISOString() }];
            }
          });
        }

        // Update UI progress for this topic
        const percentForTopic = selectedTopic.duration > 0 ? Math.min(100, Math.round((lastSavedWatchedRef.current / (selectedTopic.duration * 60)) * 100)) : 0;
        setVideoProgress(percentForTopic);

        // Re-evaluate exam eligibility if overall percent changed
        await checkExamEligibility();

        return true;
      } else {
        console.error('Failed to update topic progress:', response);
        return false;
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedTopic, enrollment, topicProgress]);

  // Setup YT player when modal opens & a topic is selected
  useEffect(() => {
    const setup = async () => {
      if (!isVideoModalOpen || !selectedTopic || !selectedCourse) return;

      // stop any previous timers/player
      stopAllTracking();
      destroyPlayer();

      const videoId = extractYouTubeVideoId(selectedTopic.link);
      if (!videoId) {
        // no youtube id - nothing to init
        lastSavedWatchedRef.current = getPreviousWatched(selectedCourse._id, selectedTopic.name) || 0;
        setVideoProgress(selectedTopic.duration > 0 ? Math.min(100, Math.round((lastSavedWatchedRef.current / (selectedTopic.duration * 60)) * 100)) : 0);
        return;
      }

      // ensure API loaded
      await loadYouTubeIframeApi();

      // Create unique container id so multiple players won't clash
      const containerId = `yt-player-${selectedCourse._id}-${selectedTopic.name}`.replace(/[^a-zA-Z0-9-_]/g, '');
      ytPlayerContainerIdRef.current = containerId;

      // Create a placeholder div in DOM where YT will render player.
      // We'll find the iframe element by id (keeps UI structure intact visually),
      // but we MUST NOT change the visual layout. We'll create a div inside the same container.
      const container = document.getElementById(containerId);
      if (!container) {
        // create container node under the modal's video div (which has unique structure)
        const parentVideoDiv = document.querySelector('.modal-youtube-container');
        if (parentVideoDiv) {
          const newDiv = document.createElement('div');
          newDiv.id = containerId;
          newDiv.style.width = '100%';
          newDiv.style.height = '100%';
          // ensure rounding classes preserved visually by the surrounding DOM
          parentVideoDiv.appendChild(newDiv);
        } else {
          // as fallback create in body
          const newDiv = document.createElement('div');
          newDiv.id = containerId;
          document.body.appendChild(newDiv);
        }
      }

      // Determine last saved watch time from server/local
      const prevSaved = getPreviousWatched(selectedCourse._id, selectedTopic.name) || 0;
      lastSavedWatchedRef.current = prevSaved;
      setVideoProgress(selectedTopic.duration > 0 ? Math.min(100, Math.round((prevSaved / (selectedTopic.duration * 60)) * 100)) : 0);

      const player = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          controls: 1,
          disablekb: 0,
          rel: 0,
          modestbranding: 1,
          start: Math.floor(prevSaved) || 0,
        },
        events: {
          onReady: (event: any) => {
            try {
              // Seek to last saved time to resume
              if (prevSaved > 0 && typeof event.target.seekTo === 'function') {
                event.target.seekTo(prevSaved, true);
              }
              // Optionally autoplay - keep as user-initiated behavior. We'll not force play here.
            } catch (err) {
              // ignore
            }
          },
          onStateChange: (e: any) => {
            // YT Player states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 video cued
            const state = e.data;
            if (state === window.YT.PlayerState.PLAYING) {
              isPlayingRef.current = true;
              // start 1s time update
              if (timeUpdateIntervalRef.current) {
                clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
              }
              timeUpdateIntervalRef.current = setInterval(() => {
                if (!playerRef.current) return;
                const current = Math.floor(playerRef.current.getCurrentTime() || 0);
                currentPlayTimeRef.current = current;
                // Update UI percent for current topic
                const percent = selectedTopic.duration > 0 ? Math.min(100, Math.round((current / (selectedTopic.duration * 60)) * 100)) : 0;
                setVideoProgress(percent);
              }, 1000);

              // start 5s save interval
              if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
              }
              saveIntervalRef.current = setInterval(async () => {
                const current = Math.floor(playerRef.current.getCurrentTime() || 0);
                currentPlayTimeRef.current = current;
                // Only send if progressed beyond last saved
                if (current > lastSavedWatchedRef.current) {
                  await saveProgressToBackend(current);
                }
              }, 5000);
            } else if (state === window.YT.PlayerState.PAUSED) {
              // Pause -> save immediately
              isPlayingRef.current = false;
              if (timeUpdateIntervalRef.current) {
                clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
              }
              if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
              }
              const current = Math.floor(playerRef.current.getCurrentTime() || 0);
              currentPlayTimeRef.current = current;
              if (current > lastSavedWatchedRef.current) {
                saveProgressToBackend(current);
              }
            } else if (state === window.YT.PlayerState.ENDED) {
              // On ended, mark as watched full duration (cap to topic duration)
              isPlayingRef.current = false;
              if (timeUpdateIntervalRef.current) {
                clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
              }
              if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
              }
              const maxSeconds = Math.floor((selectedTopic.duration || 0) * 60);
              currentPlayTimeRef.current = maxSeconds;
              // Save final state
              saveProgressToBackend(maxSeconds);
            }
          }
        }
      });

      playerRef.current = player;
    };

    setup();

    // cleanup when selectedTopic/modal changes
    return () => {
      // remove any created container for this topic inside .modal-youtube-container
      const containerId = ytPlayerContainerIdRef.current;
      if (containerId) {
        const node = document.getElementById(containerId);
        if (node && node.parentElement && node.parentElement.classList.contains('modal-youtube-container')) {
          // keep structure tidy
          try { node.remove(); } catch (e) { /* ignore */ }
        }
      }
      // clear intervals and destroy player
      stopAllTracking();
      destroyPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideoModalOpen, selectedTopic, selectedCourse]);

  // Handler when user clicks a topic to open modal/play
  const handleTopicClick = async (topic: Topic, index: number) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setCurrentTopicIndex(index);
    setIsVideoModalOpen(true);

    // ensure we clear any previous leftover intervals/player
    stopAllTracking();
    destroyPlayer();

    // UI container for YT is the same; we mark the parent so player script can inject child
    // Set updated videoProgress based on last saved value for this topic (if present)
    const prev = getPreviousWatched(selectedCourse._id, topic.name) || 0;
    setVideoProgress(topic.duration > 0 ? Math.min(100, Math.round((prev / (topic.duration * 60)) * 100)) : 0);
  };

  // Close modal and stop tracking
  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    // Stop intervals
    stopAllTracking();

    // destroy player instance and remove injected container
    destroyPlayer();

    // cleanup any containers injected
    const containerId = ytPlayerContainerIdRef.current;
    if (containerId) {
      const node = document.getElementById(containerId);
      if (node && node.parentElement && node.parentElement.classList.contains('modal-youtube-container')) {
        try { node.remove(); } catch (e) { /* ignore */ }
      }
      ytPlayerContainerIdRef.current = '';
    }
  };

  // Manual "Mark as Completed" should NOT auto-complete (per requirement).
  // Instead, we save current progress immediately and close modal — completion is determined by watchedDuration >= 80%.
  const handleManualComplete = async (topic: Topic) => {
    // save immediate progress for currently playing video
    try {
      if (playerRef.current && selectedCourse && selectedTopic) {
        const current = Math.floor(playerRef.current.getCurrentTime() || 0);
        await saveProgressToBackend(current);
      } else if (selectedCourse && selectedTopic) {
        // ensure server at least has last saved value
        await saveProgressToBackend(lastSavedWatchedRef.current || 0);
      }
    } catch (err) {
      console.error('Error on manual complete save:', err);
    } finally {
      handleCloseModal();
    }
  };

  // Navigate next / prev topic logic: ensure we stop previous player and start new
  const goToNextTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex < selectedCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      const nextTopic = selectedCourse.topics[nextIndex];
      setCurrentTopicIndex(nextIndex);
      setSelectedTopic(nextTopic);
      // stop and recreate player via effect
      stopAllTracking();
      destroyPlayer();
      lastSavedWatchedRef.current = getPreviousWatched(selectedCourse._id, nextTopic.name) || 0;
      setVideoProgress(nextTopic.duration > 0 ? Math.min(100, Math.round((lastSavedWatchedRef.current / (nextTopic.duration * 60)) * 100)) : 0);
    }
  };

  const goToPreviousTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      const prevTopic = selectedCourse.topics[prevIndex];
      setCurrentTopicIndex(prevIndex);
      setSelectedTopic(prevTopic);
      stopAllTracking();
      destroyPlayer();
      lastSavedWatchedRef.current = getPreviousWatched(selectedCourse._id, prevTopic.name) || 0;
      setVideoProgress(prevTopic.duration > 0 ? Math.min(100, Math.round((lastSavedWatchedRef.current / (prevTopic.duration * 60)) * 100)) : 0);
    }
  };

  // Helpers used in UI
  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && tp.topicName === topicName
    );
  };

  const getCourseProgress = (courseId: string) => {
    // Use watched durations relative to total topics' duration for the course
    const course = courses.find(c => c._id === courseId);
    if (!course) return 0;
    const courseTopics = course.topics || [];
    // sum watched seconds for topics belonging to this course
    let watchedSeconds = 0;
    let totalSeconds = 0;
    courseTopics.forEach(t => {
      totalSeconds += (t.duration || 0) * 60;
      const tp = getTopicProgress(courseId, t.name);
      if (tp) watchedSeconds += tp.watchedDuration || 0;
    });
    if (!totalSeconds) return 0;
    return (watchedSeconds / totalSeconds) * 100;
  };

  const isTopicWatched = (topicName: string): boolean => {
    if (!selectedCourse) return false;
    const progress = getTopicProgress(selectedCourse._id, topicName);
    if (!progress) return false;
    // Mark as watched only if watchedDuration >= 80% of topic duration
    const threshold = Math.floor(((selectedCourse.topics.find(t => t.name === topicName)?.duration || 0) * 60) * 0.8);
    return !!(progress.watched && (progress.watchedDuration || 0) >= threshold);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream and have available exams.',
        variant: 'destructive'
      });
    }
  };

  // UI rendering states
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

  const currentTopic = selectedCourse?.topics?.[currentTopicIndex];
  const courseProgressValue = selectedCourse ? getCourseProgress(selectedCourse._id) : 0;
  const overallStreamProgress = enrollment?.totalWatchedPercentage || 0;

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
                <div className="flex-1 bg-black rounded-lg mb-4 modal-youtube-container">
                  {extractYouTubeVideoId(selectedTopic.link) ? (
                    // NOTE: We keep the visual structure intact. The YT API will inject the iframe into a div we create inside this parent container.
                    <div className="w-full h-full rounded-lg" style={{ width: '100%', height: '100%' }} />
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
                        {isPlayingRef.current ? (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Tracking your progress...
                          </span>
                        ) : (
                          // We display completed if local progress meets threshold
                          (selectedTopic && (getPreviousWatched(selectedCourse?._id || '', selectedTopic.name) >= Math.floor((selectedTopic.duration || 0) * 60 * 0.8))) ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              Not Completed
                            </span>
                          )
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
              
              {/* Overall Stream Progress Mini Bar */}
              {enrollment && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm min-w-[200px] self-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stream Progress</span>
                      <span>{Math.round(overallStreamProgress)}%</span>
                    </div>
                    <Progress value={overallStreamProgress} className="h-2" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedCourse?.courseName}</h1>
                <p className="text-gray-600 mt-2">{selectedCourse?.description}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Badge variant={courseProgressValue >= 80 ? "default" : "secondary"} className="text-sm">
                  {Math.round(courseProgressValue)}% Complete
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Course Progress</span>
                <span>{Math.round(courseProgressValue)}%</span>
              </div>
              <Progress value={courseProgressValue} className="h-2" />
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Content Section - Now just a clean white screen */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Welcome to {selectedCourse?.courseName}</span>
                    {currentTopic && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {currentTopic.duration} min
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Clean White Screen - No Video Player */}
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
                          }
                        }}
                        variant="default"
                        size="lg"
                        className="mt-4"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                  </div>

                  {/* Course Document */}
                  {selectedCourse?.documentLink && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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

                  {/* Course Actions */}
                  {enrollment && enrollment.totalWatchedPercentage >= 80 && (
                    <div className="mt-6">
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Exam Ready!</span>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Topics Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Course Topics</CardTitle>
                  <CardDescription>
                    {selectedCourse?.topics.length || 0} topics • {selectedCourse?.totalDuration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedCourse?.topics.map((topic, index) => {
                      const prog = getTopicProgress(selectedCourse._id, topic.name);
                      const isWatched = !!(prog && prog.watched && prog.watchedDuration >= Math.floor(topic.duration * 60 * 0.8));
                      const isCurrent = index === currentTopicIndex;

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
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium truncate">{topic.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {topic.duration}m
                            </Badge>
                          </div>
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
                        <span>Topics Completed:</span>
                        <span>
                          {selectedCourse?.topics.filter(topic => {
                            const tp = getTopicProgress(selectedCourse._id, topic.name);
                            return tp && tp.watchedDuration >= Math.floor(topic.duration * 60 * 0.8);
                          }).length || 0}/
                          {selectedCourse?.topics.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Progress:</span>
                        <span>{Math.round(courseProgressValue)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Available:</span>
                        <span>
                          {enrollment && enrollment.totalWatchedPercentage >= 80 ? (
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
