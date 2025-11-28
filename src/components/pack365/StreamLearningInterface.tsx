/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// ⭐ FINAL FIX: Correct backend URL (NO /api)
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://triaright.com";

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
  topics: Topic[];
  topicsCount: number;
  documentLink?: string;
  _id: string; // MongoDB ObjectId used by backend
  stream: string;
}

interface TopicProgress {
  courseId: string; // MUST be Mongo _id
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
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = location.state?.selectedCourse as Course;
  const youtubePlayerRef = useRef<any>(null);
  const progressTimer = useRef<any>();
  const autoSaveTimer = useRef<any>();

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 h-2 rounded-full">
      <div
        className="h-2 rounded-full bg-blue-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const getYouTubeId = (url: string) => {
    const reg =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const m = url.match(reg);
    return m?.[7]?.length === 11 ? m[7] : null;
  };

  const getBackendCourseId = () => course?._id || null;

  // ---------------------------------------------------------
  // Load course + enrollment
  // ---------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        if (!selectedCourse) {
          setError("Course not selected");
          return navigate(`/pack365-learning/${stream}`);
        }

        // 1. Get course
        const courseRes = await axios.get(
          `${API_BASE_URL}/pack365/courses/${selectedCourse.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCourse(courseRes.data.data);

        // 2. Get enrollment
        const enrollRes = await axios.get(
          `${API_BASE_URL}/pack365/enrollments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const record = enrollRes.data.enrollments.find(
          (e: any) => e.stream.toLowerCase() === stream?.toLowerCase()
        );

        setEnrollment(record);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------------------------------------------------------
  // Load YouTube player on topic change
  // ---------------------------------------------------------
  useEffect(() => {
    if (!course) return;

    const topic = course.topics[currentTopicIndex];
    const id = getYouTubeId(topic.link);

    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }

    if (id) {
      if (!window.YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
          youtubePlayerRef.current = new window.YT.Player("youtube-player", {
            videoId: id,
            events: {
              onReady: () => {
                youtubePlayerRef.current.seekTo(watchedDuration);
              },
              onStateChange: handlePlayerState,
            },
          });
        };
      } else {
        youtubePlayerRef.current = new window.YT.Player("youtube-player", {
          videoId: id,
          events: {
            onReady: () => {
              youtubePlayerRef.current.seekTo(watchedDuration);
            },
            onStateChange: handlePlayerState,
          },
        });
      }
    }
  }, [currentTopicIndex, course]);

  const handlePlayerState = (event: any) => {
    const state = event.data;

    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTracking();
    } else {
      setIsPlaying(false);
      stopTracking();
    }

    if (state === window.YT.PlayerState.ENDED) {
      markTopicComplete();
    }
  };

  // ---------------------------------------------------------
  // Tracking & Auto-save
  // ---------------------------------------------------------
  const startTracking = () => {
    stopTracking();

    progressTimer.current = setInterval(() => {
      if (!youtubePlayerRef.current) return;

      const current = youtubePlayerRef.current.getCurrentTime();
      const duration = youtubePlayerRef.current.getDuration();

      setWatchedDuration(current);
      setVideoProgress(duration ? (current / duration) * 100 : 0);
    }, 1000);
  };

  const stopTracking = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
  };

  useEffect(() => {
    if (!course || !enrollment) return;

    autoSaveTimer.current = setInterval(() => {
      if (watchedDuration > 0) saveProgress();
    }, 8000);

    return () => clearInterval(autoSaveTimer.current);
  }, [watchedDuration, course, enrollment]);

  // ---------------------------------------------------------
  // Save progress
  // ---------------------------------------------------------
  const saveProgress = async () => {
    if (!course || !enrollment) return;

    const backendCourseId = getBackendCourseId();
    const topic = course.topics[currentTopicIndex];

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId,
          topicName: topic.name,
          watchedDuration: Math.floor(watchedDuration),
          totalCourseDuration: course.totalDuration * 60,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Progress save failed:", err);
    }
  };

  // ---------------------------------------------------------
  // Mark topic complete
  // ---------------------------------------------------------
  const markTopicComplete = async () => {
    if (!course || !enrollment) return;

    const backendCourseId = getBackendCourseId();
    const topic = course.topics[currentTopicIndex];

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: backendCourseId,
          topicName: topic.name,
          watchedDuration: topic.duration * 60,
          totalCourseDuration: course.totalDuration * 60,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (currentTopicIndex < course.topics.length - 1) {
        setCurrentTopicIndex(currentTopicIndex + 1);
        setWatchedDuration(0);
        setVideoProgress(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading)
    return <div className="p-10 text-gray-500 text-center">Loading…</div>;

  if (error)
    return <div className="p-10 text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* HEADER */}
      <div className="bg-white p-4 border rounded mb-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold">{course?.courseName}</h1>
          <p className="text-gray-500">{course?.description}</p>
        </div>

        <div className="w-40">
          <div className="text-sm font-bold">
            {enrollment?.totalWatchedPercentage ?? 0}%
          </div>
          <ProgressBar value={enrollment?.totalWatchedPercentage ?? 0} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* LEFT: TOPICS */}
        <div className="col-span-1 bg-white p-4 border rounded h-[80vh] overflow-y-auto">
          <h2 className="font-bold mb-3">Course Topics</h2>

          {course?.topics.map((t, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentTopicIndex(i);
                setWatchedDuration(0);
                setVideoProgress(0);
              }}
              className={`p-2 rounded cursor-pointer mb-1 ${
                currentTopicIndex === i
                  ? "bg-blue-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {t.name}
            </div>
          ))}
        </div>

        {/* RIGHT: VIDEO */}
        <div className="col-span-3 bg-white p-4 border rounded">
          <h2 className="text-lg font-bold mb-2">
            {course?.topics[currentTopicIndex]?.name}
          </h2>

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
            {isPlaying ? "Pause" : "Play"}
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
