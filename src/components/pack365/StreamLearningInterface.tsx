/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  ArrowLeft,
  FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';

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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

const StreamLearningInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stream } = useParams<{ stream: string }>();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  // Get selected course from navigation state
  const selectedCourse = location.state?.selectedCourse as Course;

  useEffect(() => {
    const initializeLearning = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      if (!selectedCourse) {
        toast({ title: 'No Course Selected', variant: 'destructive' });
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(
          `${API_BASE_URL}/pack365/courses/${selectedCourse.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
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
          }
        }
      } catch (error: any) {
        console.error('Error initializing learning:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load course content.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    initializeLearning();
  }, [selectedCourse, stream, navigate, toast]);

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

        toast({ title: 'Topic marked as complete!' });
        
        // Auto-advance to next topic if available
        if (currentTopicIndex < course.topics.length - 1) {
          setCurrentTopicIndex(currentTopicIndex + 1);
          setWatchedDuration(0);
          setVideoProgress(0);
        }
      }
    } catch (error: any) {
      console.error('Error marking topic complete:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to mark topic as complete.', 
        variant: 'destructive' 
      });
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-6">Unable to load course content.</p>
          <Button onClick={() => navigate(`/pack365-learning/${stream}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentTopic = course.topics[currentTopicIndex];
  const totalProgress = enrollment?.totalWatchedPercentage || 0;
  const isExamEligible = totalProgress >= 80;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/pack365-learning/${stream}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Button>
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
                  <Progress value={totalProgress} className="w-32 h-2" />
                </div>
                
                <Button
                  onClick={handleTakeExam}
                  disabled={!isExamEligible}
                  variant={isExamEligible ? "default" : "outline"}
                >
                  Take Exam
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Topics Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Course Topics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {course.topics.map((topic, index) => {
                      const isCompleted = isTopicCompleted(topic.name);
                      const progress = getTopicProgress(topic.name);
                      const isCurrent = index === currentTopicIndex;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleTopicSelect(index)}
                          className={`w-full text-left p-3 border-l-4 transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium truncate">
                                {topic.name}
                              </span>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0 ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {topic.duration}m
                            </Badge>
                          </div>
                          
                          {!isCompleted && progress > 0 && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-1" />
                              <span className="text-xs text-gray-500">
                                {progress.toFixed(0)}% watched
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Course Resources */}
              {course.documentLink && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(course.documentLink, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Course Materials
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Video Player & Content */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentTopic.name}</span>
                    <Badge variant="secondary">
                      {currentTopic.duration} minutes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Player */}
                  <div className="bg-black rounded-lg aspect-video">
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
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Video content not available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      
                      <div className="flex-1 max-w-md">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress: {videoProgress.toFixed(1)}%</span>
                          <span>
                            {Math.floor(watchedDuration / 60)}:
                            {Math.floor(watchedDuration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <Progress value={videoProgress} className="h-2" />
                      </div>
                    </div>

                    <Button
                      onClick={markTopicComplete}
                      disabled={isTopicCompleted(currentTopic.name)}
                      variant={isTopicCompleted(currentTopic.name) ? "outline" : "default"}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isTopicCompleted(currentTopic.name) ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
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
