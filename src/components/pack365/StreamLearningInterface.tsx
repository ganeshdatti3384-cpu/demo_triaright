/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  courseId: string;       // Business ID, like COURSE_123456
  courseName: string;
  description: string;
  totalDuration: number;  // In minutes (as per backend course schema)
  topicsCount: number;
  topics: Topic[];
  documentLink?: string;
  _id: string;            // Mongo ObjectId used in topicProgress.courseId
  stream: string;
}

interface TopicProgress {
  courseId: string;       // Mongo ObjectId as string
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
}

interface StreamEnrollment {
  _id: string;
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  topicProgress: TopicProgress[];
  totalWatchedPercentage: number;
  totalCourseDuration: number;
  isExamCompleted: boolean;
  examScore: number;
  bestExamScore: number;
}

const StreamLearningInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stream } = useParams<{ stream: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const youtubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  // Selected course passed from previous page
  const selectedCourse = location.state?.selectedCourse as Course | undefined;

  // Simple toast replacement
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  // Simple progress bar
  const ProgressBar = ({ value, className = '' }: { value: number; className?: string }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );

  // ---------- YouTube Player Setup ----------

  const createYouTubePlayer = (videoId: string) => {
    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId,
      playerVars: {
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
  };

  const initializeYouTubePlayer = (videoId: string) => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createYouTubePlayer(videoId);
      };
    } else {
      createYouTubePlayer(videoId);
    }
  };

  const onPlayerReady = (event: any) => {
    if (watchedDuration > 0) {
      event.target.seekTo(watchedDuration);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;

    switch (playerState) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        startProgressTracking();
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        stopProgressTracking();
        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        stopProgressTracking();
        // Auto-mark complete on end
        markTopicComplete();
        break;
      case window.YT.PlayerState.BUFFERING:
      case window.YT.PlayerState.CUED:
      default:
        break;
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
    setError('Failed to load video. Please check the video URL.');
  };

  // ---------- Progress Tracking Logic ----------

  const getBackendCourseId = (c: Course | null): string | null => {
    if (!c) return null;
    // Backend topicProgress.courseId is ObjectId (string)
    // _id is the ObjectId, courseId is the business id
    return c._id || c.courseId;
  };

  const startProgressTracking = () => {
    stopProgressTracking();

    progressIntervalRef.current = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        const duration = youtubePlayerRef.current.getDuration();

        setWatchedDuration(currentTime);
        setVideoProgress(duration > 0 ? (currentTime / duration) * 100 : 0);

        // If user has watched >= 95%, auto mark complete
        if (duration > 0 && currentTime >= duration * 0.95) {
          const currentTopic = course?.topics[currentTopicIndex];
          const backendCourseId = getBackendCourseId(course);

          if (currentTopic && enrollment && backendCourseId) {
            const topicProgress = enrollment.topicProgress?.find(
              (tp: TopicProgress) =>
                tp.courseId === backendCourseId && tp.topicName === currentTopic.name,
            );

            if (!topicProgress?.watched) {
              markTopicComplete();
            }
          }
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handlePlayPause = () => {
    if (!youtubePlayerRef.current) return;
    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo();
    } else {
      youtubePlayerRef.current.playVideo();
    }
  };

  // ---------- Initial Load (Course + Enrollment) ----------

  useEffect(() => {
    const initializeLearning = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication Required');
        navigate('/login');
        return;
      }

      if (!selectedCourse) {
        setError('No Course Selected');
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching course details for:', selectedCourse.courseId);

        // Fetch course details by courseId (business ID)
        const courseResponse = await axios.get(
          `${API_BASE_URL}/pack365/courses/${selectedCourse.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!(courseResponse.data?.success && courseResponse.data?.data)) {
          throw new Error('Failed to load course data');
        }

        const fetchedCourse: Course = courseResponse.data.data;
        setCourse(fetchedCourse);

        // Fetch user enrollments to get progress
        console.log('Fetching enrollments...');
        const enrollmentResponse = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let enrollmentsData: any[] = [];
        if (enrollmentResponse.data.enrollments) {
          enrollmentsData = enrollmentResponse.data.enrollments;
        } else if (Array.isArray(enrollmentResponse.data)) {
          enrollmentsData = enrollmentResponse.data;
        } else if (enrollmentResponse.data.success && enrollmentResponse.data.data) {
          enrollmentsData = enrollmentResponse.data.data;
        } else {
          console.warn('Unexpected enrollment response structure:', enrollmentResponse.data);
          enrollmentsData = [];
        }

        const streamEnrollment = enrollmentsData.find(
          (e: StreamEnrollment) =>
            e.stream?.toLowerCase() === (stream || '').toLowerCase(),
        ) as StreamEnrollment | undefined;

        if (streamEnrollment) {
          console.log('Found enrollment:', streamEnrollment);
          setEnrollment(streamEnrollment);

          // Filter topic progress for THIS course only using Mongo _id
          const backendCourseId = getBackendCourseId(fetchedCourse);
          const courseProgress =
            streamEnrollment.topicProgress?.filter(
              (tp: TopicProgress) => tp.courseId === backendCourseId,
            ) || [];

          console.log('Course progress:', courseProgress);

          if (courseProgress.length > 0 && fetchedCourse.topics) {
            // Find first unwatched topic, else start from first topic
            const unwatchedTopicIndex = fetchedCourse.topics.findIndex(
              (topic: Topic) =>
                !courseProgress.some(
                  (tp: TopicProgress) => tp.topicName === topic.name && tp.watched,
                ),
            );

            const startingIndex =
              unwatchedTopicIndex !== -1 ? unwatchedTopicIndex : 0;

            setCurrentTopicIndex(startingIndex);

            const currentTopicProgress = courseProgress.find(
              (tp: TopicProgress) =>
                tp.topicName === fetchedCourse.topics[startingIndex].name,
            );

            if (currentTopicProgress) {
              const topicDurationSeconds =
                fetchedCourse.topics[startingIndex].duration * 60;
              setWatchedDuration(currentTopicProgress.watchedDuration);
              setVideoProgress(
                topicDurationSeconds > 0
                  ? (currentTopicProgress.watchedDuration / topicDurationSeconds) * 100
                  : 0,
              );
            }
          }
        } else {
          console.warn('No enrollment found for stream:', stream);
          setEnrollment(null);
        }
      } catch (err: any) {
        console.error('Error initializing learning:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to load course content';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeLearning();

    // Cleanup on unmount
    return () => {
      stopProgressTracking();
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [selectedCourse, stream, navigate]);

  // ---------- React to Topic Changes (load new video) ----------

  useEffect(() => {
    if (course && course.topics[currentTopicIndex]) {
      const currentTopic = course.topics[currentTopicIndex];
      const videoId = getYouTubeVideoId(currentTopic.link);

      if (videoId) {
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        }
        setWatchedDuration(0);
        setVideoProgress(0);
        initializeYouTubePlayer(videoId);
      }
    }
  }, [currentTopicIndex, course]);

  // ---------- Auto-save progress every 10s ----------

  useEffect(() => {
    if (course && enrollment) {
      saveIntervalRef.current = setInterval(() => {
        if (watchedDuration > 0) {
          saveProgress();
        }
      }, 10000);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
    // We intentionally depend on course, enrollment, watchedDuration
  }, [course, enrollment, watchedDuration]);

  // ---------- Save Progress (partial) ----------

  const saveProgress = async () => {
    if (!course || !enrollment) return;

    const token = localStorage.getItem('token');
    const currentTopic = course.topics[currentTopicIndex];
    const backendCourseId = getBackendCourseId(course);

    if (!backendCourseId) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId, // use Mongo _id for backend consistency
          topicName: currentTopic.name,
          watchedDuration: Math.floor(watchedDuration), // seconds
          totalCourseDuration: course.totalDuration * 60, // minutes -> seconds
          // totalWatchedPercentage will be recomputed by backend; we can omit or send 0
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // If backend returns updated totalWatchedPercentage, sync into enrollment
      if (
        response.data &&
        typeof response.data.totalWatchedPercentage === 'number'
      ) {
        setEnrollment(prev =>
          prev
            ? {
                ...prev,
                totalWatchedPercentage: response.data.totalWatchedPercentage,
              }
            : prev,
        );
      }
    } catch (err: any) {
      console.error('Error saving progress:', err);
    }
  };

  // ---------- Mark Topic Complete (100%) ----------

  const markTopicComplete = async () => {
    if (!course || !enrollment) return;

    const token = localStorage.getItem('token');
    const currentTopic = course.topics[currentTopicIndex];
    const backendCourseId = getBackendCourseId(course);

    if (!backendCourseId) return;

    const topicDurationSeconds = currentTopic.duration * 60;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId,
          topicName: currentTopic.name,
          watchedDuration: topicDurationSeconds,
          totalCourseDuration: course.totalDuration * 60,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data?.success) {
        // Update local enrollment.topicProgress & totalWatchedPercentage
        setEnrollment(prev => {
          if (!prev) return prev;

          const filtered = (prev.topicProgress || []).filter(
            (tp: TopicProgress) =>
              !(
                tp.courseId === backendCourseId &&
                tp.topicName === currentTopic.name
              ),
          );

          const updatedTopicProgress: TopicProgress[] = [
            ...filtered,
            {
              courseId: backendCourseId,
              topicName: currentTopic.name,
              watched: true,
              watchedDuration: topicDurationSeconds,
            },
          ];

          return {
            ...prev,
            topicProgress: updatedTopicProgress,
            totalWatchedPercentage:
              typeof response.data.totalWatchedPercentage === 'number'
                ? response.data.totalWatchedPercentage
                : prev.totalWatchedPercentage,
          };
        });

        showToast('Topic marked as complete!');

        // Move to next topic automatically if exists
        if (currentTopicIndex < course.topics.length - 1) {
          setCurrentTopicIndex(currentTopicIndex + 1);
          setWatchedDuration(0);
          setVideoProgress(0);
        }
      }
    } catch (err: any) {
      console.error('Error marking topic complete:', err);
      showToast('Failed to mark topic as complete', 'error');
    }
  };

  // ---------- Helpers for per-topic progress & exam eligibility ----------

  const calculateTopicProgressFromState = (
    topicName: string,
  ): { completed: boolean; percentage: number } => {
    if (!course || !enrollment) {
      return { completed: false, percentage: 0 };
    }

    const backendCourseId = getBackendCourseId(course);
    if (!backendCourseId) {
      return { completed: false, percentage: 0 };
    }

    const topicProgress = enrollment.topicProgress?.find(
      (tp: TopicProgress) =>
        tp.courseId === backendCourseId && tp.topicName === topicName,
    );

    if (!topicProgress) {
      return { completed: false, percentage: 0 };
    }

    const topic = course.topics.find(t => t.name === topicName);
    if (!topic) {
      return { completed: false, percentage: 0 };
    }

    const topicDurationSeconds = topic.duration * 60;
    const pct =
      topicDurationSeconds > 0
        ? Math.min(
            (topicProgress.watchedDuration / topicDurationSeconds) * 100,
            100,
          )
        : 0;

    return { completed: !!topicProgress.watched, percentage: pct };
  };

  const handleTopicSelect = (index: number) => {
    setCurrentTopicIndex(index);
    setIsPlaying(false);
    stopProgressTracking();

    // When switching topic, try to restore last watchedDuration from enrollment if available
    if (course && enrollment) {
      const backendCourseId = getBackendCourseId(course);
      if (backendCourseId) {
        const topic = course.topics[index];
        const topicProgress = enrollment.topicProgress?.find(
          (tp: TopicProgress) =>
            tp.courseId === backendCourseId && tp.topicName === topic.name,
        );

        if (topicProgress) {
          const topicDurationSeconds = topic.duration * 60;
          setWatchedDuration(topicProgress.watchedDuration);
          setVideoProgress(
            topicDurationSeconds > 0
              ? (topicProgress.watchedDuration / topicDurationSeconds) * 100
              : 0,
          );
        } else {
          setWatchedDuration(0);
          setVideoProgress(0);
        }
      }
    } else {
      setWatchedDuration(0);
      setVideoProgress(0);
    }
  };

  const handleTakeExam = () => {
    if (!course) return;

    navigate(`/exam/${stream}`, {
      state: {
        courseId: course.courseId,
        courseName: course.courseName,
        stream,
      },
    });
  };

  // ---------- Icons (simple text icons) ----------

  const PlayIcon = () => <span>▶</span>;
  const PauseIcon = () => <span>⏸</span>;
  const CheckIcon = () => <span>✓</span>;
  const CircleIcon = () => <span>○</span>;
  const ClockIcon = () => <span>⏱</span>;
  const BookIcon = () => <span>📚</span>;
  const BackIcon = () => <span>←</span>;
  const FileIcon = () => <span>📄</span>;

  // ---------- UI States ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookIcon />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Error Loading Course
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon /> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookIcon />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-500 mb-6">Unable to load course content.</p>
          <button
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon /> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentTopic = course.topics[currentTopicIndex];
  const totalProgress = enrollment?.totalWatchedPercentage || 0;
  const isExamEligible = totalProgress >= 80;
  const youtubeVideoId = currentTopic ? getYouTubeVideoId(currentTopic.link) : null;

  // ---------- Main UI ----------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/pack365-learning/${stream}`)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-2"
              >
                <BackIcon />
                <span>Back to Courses</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.courseName}
                </h1>
                <p className="text-gray-600 text-sm">{course.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-semibold">
                    {totalProgress.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar value={totalProgress} className="w-32 h-2" />
              </div>

              <button
                onClick={handleTakeExam}
                disabled={!isExamEligible}
                className={`px-4 py-2 rounded-lg ${
                  isExamEligible
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Take Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {course.topics.map((topic, index) => {
                  const { completed, percentage } = calculateTopicProgressFromState(
                    topic.name,
                  );
                  const isCurrent = index === currentTopicIndex;

                  return (
                    <button
                      key={topic.name}
                      onClick={() => handleTopicSelect(index)}
                      className={`w-full text-left p-3 border-l-4 transition-colors rounded-r-lg ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {completed ? <CheckIcon /> : <CircleIcon />}
                          <span className="text-sm font-medium truncate">
                            {topic.name}
                          </span>
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <ClockIcon />
                          <span>{topic.duration}m</span>
                        </span>
                      </div>

                      {!completed && percentage > 0 && (
                        <div className="mt-2">
                          <ProgressBar value={percentage} className="h-1" />
                          <span className="text-xs text-gray-500">
                            {percentage.toFixed(0)}% watched
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Resources */}
            {course.documentLink && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <a
                  href={course.documentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <FileIcon />
                  <span className="ml-2">Download Course Document</span>
                </a>
              </div>
            )}
          </div>

          {/* Video + Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-video bg-black">
                <div id="youtube-player" className="w-full h-full" />
                {!youtubeVideoId && (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                    Invalid or missing video URL
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentTopic.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Duration: {currentTopic.duration} minutes
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePlayPause}
                    className="px-4 py-2 rounded-lg border border-gray-300 flex items-center space-x-2 text-sm"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    onClick={markTopicComplete}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    <CheckIcon /> Mark as Complete
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <ProgressBar value={videoProgress} />
                <p className="text-xs text-gray-500 mt-1">
                  Current video progress: {videoProgress.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-md font-semibold mb-2">About this course</h3>
              <p className="text-sm text-gray-600 mb-2">{course.description}</p>
              <p className="text-xs text-gray-500">
                Total topics: {course.topicsCount} • Approx. duration:{' '}
                {course.totalDuration} minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamLearningInterface;
