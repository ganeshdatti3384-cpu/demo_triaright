/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ⭐ FINAL FIX: Correct backend URL 
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'https://triaright.com';

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
  topics: Topic[];
  documentLink?: string;
  _id: string; // Mongo ID used for topicProgress
  stream: string;
}

interface TopicProgress {
  courseId: string; // backend MongoId
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface StreamEnrollment {
  _id: string;
  stream: string;
  topicProgress: TopicProgress[];
  totalWatchedPercentage: number;
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
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  const selectedCourse = location.state?.selectedCourse as Course | undefined;

  const getYouTubeVideoId = (url: string): string | null => {
    const pattern =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(pattern);
    return match && match[7]?.length === 11 ? match[7] : null;
  };

  const getBackendCourseId = (c: Course | null): string | null =>
    c ? c._id : null;

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  // -----------------------
  // YOUTUBE PLAYER
  // -----------------------

  const createYouTubePlayer = (videoId: string) => {
    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: () => setError('Failed to load video'),
      },
    });
  };

  const initializeYouTubePlayer = (videoId: string) => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => createYouTubePlayer(videoId);
    } else createYouTubePlayer(videoId);
  };

  const onPlayerReady = (event: any) => {
    if (watchedDuration > 0) event.target.seekTo(watchedDuration);
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;

    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressTracking();
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopProgressTracking();
      markTopicComplete();
    }
  };

  const startProgressTracking = () => {
    stopProgressTracking();

    progressIntervalRef.current = setInterval(() => {
      if (!youtubePlayerRef.current) return;

      const current = youtubePlayerRef.current.getCurrentTime();
      const duration = youtubePlayerRef.current.getDuration();

      setWatchedDuration(current);
      setVideoProgress(duration > 0 ? (current / duration) * 100 : 0);
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // -----------------------
  // LOAD COURSE + ENROLLMENT
  // -----------------------

  useEffect(() => {
    const loadContent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        if (!selectedCourse) return navigate(`/pack365-learning/${stream}`);

        const courseRes = await axios.get(
          `${API_BASE_URL}/pack365/courses/${selectedCourse.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCourse(courseRes.data.data);

        const enrollRes = await axios.get(
          `${API_BASE_URL}/pack365/enrollments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userEnroll = enrollRes.data.enrollments.find(
          (e: StreamEnrollment) =>
            e.stream.toLowerCase() === stream?.toLowerCase()
        );

        setEnrollment(userEnroll || null);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // -----------------------
  // LOAD VIDEO ON TOPIC CHANGE
  // -----------------------

  useEffect(() => {
    if (!course) return;

    const topic = course.topics[currentTopicIndex];
    const videoId = getYouTubeVideoId(topic.link);

    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    if (videoId) initializeYouTubePlayer(videoId);
  }, [currentTopicIndex, course]);

  // -----------------------
  // AUTO SAVE PROGRESS
  // -----------------------

  useEffect(() => {
    if (!course || !enrollment) return;

    saveIntervalRef.current = setInterval(() => {
      if (watchedDuration > 0) saveProgress();
    }, 8000);

    return () => saveIntervalRef.current && clearInterval(saveIntervalRef.current);
  }, [course, enrollment, watchedDuration]);

  const saveProgress = async () => {
    if (!course || !enrollment) return;

    const backendCourseId = getBackendCourseId(course);
    const currentTopic = course.topics[currentTopicIndex];

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId,
          topicName: currentTopic.name,
          watchedDuration: Math.floor(watchedDuration),
          totalCourseDuration: course.totalDuration * 60,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Progress save failed:', err);
    }
  };

  // -----------------------
  // MARK TOPIC COMPLETE
  // -----------------------

  const markTopicComplete = async () => {
    if (!course || !enrollment) return;

    const backendCourseId = getBackendCourseId(course);
    const currentTopic = course.topics[currentTopicIndex];

    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId,
          topicName: currentTopic.name,
          watchedDuration: currentTopic.duration * 60,
          totalCourseDuration: course.totalDuration * 60,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Move to next topic automatically
      if (currentTopicIndex < course.topics.length - 1) {
        setCurrentTopicIndex(currentTopicIndex + 1);
        setWatchedDuration(0);
        setVideoProgress(0);
      }
    } catch (err) {
      console.error('Error marking topic complete:', err);
    }
  };

  // -----------------------
  // UI
  // -----------------------

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">Loading content…</div>
    );

  if (!course)
    return (
      <div className="p-10 text-center text-red-600">
        Failed to load course.
      </div>
    );

  const currentTopic = course.topics[currentTopicIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-white border-b flex justify-between">
        <div>
          <h2 className="text-xl font-bold">{course.courseName}</h2>
          <p className="text-gray-500">{course.description}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            Progress: {enrollment?.totalWatchedPercentage ?? 0}%
          </p>
          <ProgressBar value={enrollment?.totalWatchedPercentage ?? 0} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-4 gap-4 p-4">
        {/* Sidebar */}
        <div className="col-span-1 bg-white border rounded p-3 h-[80vh] overflow-y-auto">
          <h3 className="font-bold mb-3">Course Topics</h3>

          {course.topics.map((t, i) => (
            <div
              key={i}
              className={`p-2 mb-1 rounded cursor-pointer ${
                i === currentTopicIndex
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setCurrentTopicIndex(i);
                setWatchedDuration(0);
                setVideoProgress(0);
              }}
            >
              {t.name}
            </div>
          ))}
        </div>

        {/* Video + Controls */}
        <div className="col-span-3 bg-white border rounded p-4">
          <h3 className="text-lg font-bold mb-2">{currentTopic.name}</h3>

          <div className="aspect-video bg-black mb-4">
            <div id="youtube-player" className="w-full h-full"></div>
          </div>

          <button
            onClick={() =>
              isPlaying
                ? youtubePlayerRef.current.pauseVideo()
                : youtubePlayerRef.current.playVideo()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={markTopicComplete}
            className="ml-3 px-4 py-2 bg-green-600 text-white rounded"
          >
            Mark Complete
          </button>

          <div className="mt-3">
            <ProgressBar value={videoProgress} />
            <p className="text-xs text-gray-500 mt-1">
              Video progress: {videoProgress.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamLearningInterface;
