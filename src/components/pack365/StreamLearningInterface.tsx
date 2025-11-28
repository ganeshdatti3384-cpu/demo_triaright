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
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
  topics: Topic[];
  documentLink?: string;
  _id: string;
  stream: string;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  // Get selected course from navigation state
  const selectedCourse = location.state?.selectedCourse as Course;

  // Simple toast replacement
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can replace this with your toast implementation
    alert(`${type === 'error' ? 'Error' : 'Success'}: ${message}`);
  };

  // Simple progress bar component
  const ProgressBar = ({ value, className = '' }: { value: number; className?: string }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      ></div>
    </div>
  );

  useEffect(() => {
    const initializeLearning = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication Required', 'error');
        navigate('/login');
        return;
      }

      if (!selectedCourse) {
        showToast('No Course Selected', 'error');
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch course details
        const courseResponse = await axios.get(
          `${API_BASE_URL}/pack365/courses/${selectedCourse.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
        } else {
          throw new Error('Failed to load course');
        }

        // Fetch user enrollments to get progress
        const enrollmentResponse = await axios.get(
          `${API_BASE_URL}/pack365/enrollments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (enrollmentResponse.data.success) {
          const streamEnrollment = enrollmentResponse.data.enrollments.find(
            (e: StreamEnrollment) => e.stream.toLowerCase() === stream?.toLowerCase()
          );
          
          if (streamEnrollment) {
            setEnrollment(streamEnrollment);
            
            // Find last watched topic for this course
            const courseProgress = streamEnrollment.topicProgress.filter(
              (tp: TopicProgress) => tp.courseId === selectedCourse.courseId
            );
            
            if (courseProgress.length > 0) {
              // Find first unwatched topic or last topic with progress
              const unwatchedTopicIndex = courseResponse.data.data.topics.findIndex(
                (topic: Topic) => !courseProgress.some((tp: TopicProgress) => 
                  tp.topicName === topic.name && tp.watched
                )
              );
              
              if (unwatchedTopicIndex !== -1) {
                setCurrentTopicIndex(unwatchedTopicIndex);
                const currentTopicProgress = courseProgress.find(
                  (tp: TopicProgress) => tp.topicName === courseResponse.data.data.topics[unwatchedTopicIndex].name
                );
                if (currentTopicProgress) {
                  setWatchedDuration(currentTopicProgress.watchedDuration);
                  setVideoProgress(
                    (currentTopicProgress.watchedDuration / (courseResponse.data.data.topics[unwatchedTopicIndex].duration * 60)) * 100
                  );
                }
              }
            }
          } else {
            throw new Error('Enrollment not found');
          }
        } else {
          throw new Error('Failed to load enrollment');
        }
      } catch (error: any) {
        console.error('Error initializing learning:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load course content');
        showToast('Failed to load course content', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeLearning();
  }, [selectedCourse, stream, navigate]);

  // Auto-save progress every 10 seconds
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
  }, [course, enrollment, watchedDuration]);

  const saveProgress = async () => {
    if (!course || !enrollment) return;

    const token = localStorage.getItem('token');
    const currentTopic = course.topics[currentTopicIndex];
    
    try {
      await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: course.courseId,
          topicName: currentTopic.name,
          watchedDuration: watchedDuration,
          totalCourseDuration: course.totalDuration * 60, // Convert to seconds
          totalWatchedPercentage: calculateTotalWatchedPercentage()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      console.error('Error saving progress:', error);
    }
  };

  const calculateTotalWatchedPercentage = (): number => {
    if (!course || !enrollment) return 0;

    const courseProgress = enrollment.topicProgress.filter(
      (tp: TopicProgress) => tp.courseId === course.courseId
    );

    let totalWatchedSeconds = 0;
    let totalDurationSeconds = 0;

    course.topics.forEach((topic: Topic) => {
      const topicProgress = courseProgress.find((tp: TopicProgress) => tp.topicName === topic.name);
      const topicDurationSeconds = topic.duration * 60;
      
      totalDurationSeconds += topicDurationSeconds;
      totalWatchedSeconds += topicProgress ? Math.min(topicProgress.watchedDuration, topicDurationSeconds) : 0;
    });

    return totalDurationSeconds > 0 ? (totalWatchedSeconds / totalDurationSeconds) * 100 : 0;
  };

  const markTopicComplete = async () => {
    if (!course || !enrollment) return;

    const token = localStorage.getItem('token');
    const currentTopic = course.topics[currentTopicIndex];
    const topicDurationSeconds = currentTopic.duration * 60;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/pack365/topic/progress`,
        {
          courseId: course.courseId,
          topicName: currentTopic.name,
          watchedDuration: topicDurationSeconds, // Mark as fully watched
          totalCourseDuration: course.totalDuration * 60,
          totalWatchedPercentage: calculateTotalWatchedPercentage()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setEnrollment((prev: any) => ({
          ...prev,
          topicProgress: [
            ...prev.topicProgress.filter((tp: TopicProgress) => 
              !(tp.courseId === course.courseId && tp.topicName === currentTopic.name)
            ),
            {
              courseId: course.courseId,
              topicName: currentTopic.name,
              watched: true,
              watchedDuration: topicDurationSeconds
            }
          ],
          totalWatchedPercentage: response.data.totalWatchedPercentage
        }));

        showToast('Topic marked as complete!');
        
        // Auto-advance to next topic if available
        if (currentTopicIndex < course.topics.length - 1) {
          setCurrentTopicIndex(currentTopicIndex + 1);
          setWatchedDuration(0);
          setVideoProgress(0);
        }
      }
    } catch (error: any) {
      console.error('Error marking topic complete:', error);
      showToast('Failed to mark topic as complete', 'error');
    }
  };

  const handleVideoProgress = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    setWatchedDuration(currentTime);
    setVideoProgress(duration > 0 ? (currentTime / duration) * 100 : 0);

    // Auto-mark as complete if within 95% of duration
    if (duration > 0 && currentTime >= duration * 0.95) {
      const currentTopic = course?.topics[currentTopicIndex];
      const topicProgress = enrollment?.topicProgress.find(
        (tp: TopicProgress) => 
          tp.courseId === course?.courseId && tp.topicName === currentTopic?.name
      );
      
      if (!topicProgress?.watched) {
        markTopicComplete();
      }
    }
  };

  const handleTopicSelect = (index: number) => {
    setCurrentTopicIndex(index);
    setWatchedDuration(0);
    setVideoProgress(0);
    setIsPlaying(false);
  };

  const handleTakeExam = () => {
    if (!course) return;
    
    navigate(`/exam/${stream}`, { 
      state: { 
        courseId: course.courseId,
        courseName: course.courseName,
        stream: stream
      } 
    });
  };

  const isTopicCompleted = (topicName: string): boolean => {
    if (!enrollment) return false;
    
    const topicProgress = enrollment.topicProgress.find(
      (tp: TopicProgress) => 
        tp.courseId === course?.courseId && tp.topicName === topicName
    );
    
    return topicProgress?.watched || false;
  };

  const getTopicProgress = (topicName: string): number => {
    if (!enrollment) return 0;
    
    const topicProgress = enrollment.topicProgress.find(
      (tp: TopicProgress) => 
        tp.courseId === course?.courseId && tp.topicName === topicName
    );
    
    const currentTopic = course?.topics.find(t => t.name === topicName);
    if (!currentTopic || !topicProgress) return 0;
    
    const topicDurationSeconds = currentTopic.duration * 60;
    return topicDurationSeconds > 0 ? 
      Math.min((topicProgress.watchedDuration / topicDurationSeconds) * 100, 100) : 0;
  };

  // Icons as simple components
  const PlayIcon = () => <span>▶</span>;
  const PauseIcon = () => <span>⏸</span>;
  const CheckIcon = () => <span>✓</span>;
  const CircleIcon = () => <span>○</span>;
  const ClockIcon = () => <span>⏱</span>;
  const BookIcon = () => <span>📚</span>;
  const BackIcon = () => <span>←</span>;
  const FileIcon = () => <span>📄</span>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Course</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Back to Courses
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-6">Unable to load course content.</p>
          <button 
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentTopic = course.topics[currentTopicIndex];
  const totalProgress = enrollment?.totalWatchedPercentage || 0;
  const isExamEligible = totalProgress >= 80;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/pack365-learning/${stream}`)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <BackIcon />
                Back to Courses
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-gray-600 text-sm">{course.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-semibold">{totalProgress.toFixed(1)}%</span>
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
                  const isCompleted = isTopicCompleted(topic.name);
                  const progress = getTopicProgress(topic.name);
                  const isCurrent = index === currentTopicIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleTopicSelect(index)}
                      className={`w-full text-left p-3 border-l-4 transition-colors rounded-r-lg ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {isCompleted ? (
                            <CheckIcon />
                          ) : (
                            <CircleIcon />
                          )}
                          <span className="text-sm font-medium truncate">
                            {topic.name}
                          </span>
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <ClockIcon />
                          <span>{topic.duration}m</span>
                        </span>
                      </div>
                      
                      {!isCompleted && progress > 0 && (
                        <div className="mt-2">
                          <ProgressBar value={progress} className="h-1" />
                          <span className="text-xs text-gray-500">
                            {progress.toFixed(0)}% watched
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
                <button
                  onClick={() => window.open(course.documentLink, '_blank')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 flex items-center justify-center space-x-2"
                >
                  <FileIcon />
                  <span>Download Course Materials</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Player & Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{currentTopic.name}</h2>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {currentTopic.duration} minutes
                </span>
              </div>
              
              {/* Video Player */}
              <div className="bg-black rounded-lg aspect-video mb-4">
                {currentTopic.link ? (
                  <video
                    ref={videoRef}
                    key={currentTopicIndex}
                    className="w-full h-full rounded-lg"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleVideoProgress}
                  >
                    <source src={currentTopic.link} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <PlayIcon />
                      <p>Video content not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
                    className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {videoProgress.toFixed(1)}%</span>
                      <span>
                        {Math.floor(watchedDuration / 60)}:
                        {Math.floor(watchedDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <ProgressBar value={videoProgress} className="h-2" />
                  </div>
                </div>

                <button
                  onClick={markTopicComplete}
                  disabled={isTopicCompleted(currentTopic.name)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isTopicCompleted(currentTopic.name)
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <CheckIcon />
                  <span>{isTopicCompleted(currentTopic.name) ? 'Completed' : 'Mark Complete'}</span>
                </button>
              </div>
            </div>

            {/* Course Progress Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalProgress.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">Overall Progress</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {course.topics.filter(topic => isTopicCompleted(topic.name)).length}
                  </div>
                  <div className="text-sm text-green-600">Topics Completed</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {isExamEligible ? 'Ready' : 'Not Ready'}
                  </div>
                  <div className="text-sm text-purple-600">Exam Eligibility</div>
                </div>
              </div>
              
              {!isExamEligible && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Complete {80 - Math.ceil(totalProgress)}% more of the course to unlock the exam.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamLearningInterface;
