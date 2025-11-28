import React, { useState, useEffect } from 'react';
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
  duration: number;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number;
  topics: Topic[];
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
  lastWatchedAt?: string;
}

interface Enrollment {
  _id: string;
  stream: string;
  totalWatchedPercentage: number;
  topicProgress: TopicProgress[];
  isExamCompleted: boolean;
  examScore: number | null;
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
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const [progressIntervalId, setProgressIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [examEligible, setExamEligible] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [realWatchedSeconds, setRealWatchedSeconds] = useState<number>(0);
  const [videoStartTime, setVideoStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadStreamData();
  }, [stream]);

  useEffect(() => {
    return () => {
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
      }
    };
  }, [progressIntervalId]);

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

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }

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

      const selectedCourseFromState = location.state?.selectedCourse;
      const selectedCourseId = location.state?.selectedCourseId;
      
      if (selectedCourseFromState) {
        setSelectedCourse(selectedCourseFromState);
      } else if (selectedCourseId) {
        const course = streamCourses.find((c: Course) => c.courseId === selectedCourseId);
        setSelectedCourse(course || streamCourses[0]);
      } else {
        setSelectedCourse(streamCourses[0]);
      }

      await checkExamEligibility(streamEnrollment);

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

  const checkExamEligibility = async (currentEnrollment?: Enrollment) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const enrollmentToCheck = currentEnrollment || enrollment;
      
      // Check if user has completed enough progress
      if (enrollmentToCheck && enrollmentToCheck.totalWatchedPercentage >= 80) {
        const availableExamsResponse = await pack365Api.getAvailableExamsForUser(token);
        
        if (availableExamsResponse.success && availableExamsResponse.exams) {
          // Check if there are any available exams for current courses
          const eligibleExams = availableExamsResponse.exams.filter((exam: any) => {
            return courses.some(course => course._id === exam.courseId);
          });
          
          setExamEligible(eligibleExams.length > 0);
          
          if (eligibleExams.length > 0) {
            toast({
              title: 'Exam Available!',
              description: `You can now take the ${stream} stream exam.`,
              variant: 'default'
            });
          }
        }
      } else {
        setExamEligible(false);
      }
    } catch (error) {
      console.error('Error checking exam eligibility:', error);
      setExamEligible(false);
    }
  };

  // Calculate total stream duration in seconds across ALL courses
  const calculateTotalStreamDuration = (): number => {
    return courses.reduce((total, course) => {
      const courseDuration = course.topics?.reduce((sum, topic) => sum + (topic.duration * 60), 0) || 0;
      return total + courseDuration;
    }, 0);
  };

  // Calculate total watched duration across ALL courses
  const calculateTotalWatchedDuration = (): number => {
    return topicProgress.reduce((total, progress) => total + (progress.watchedDuration || 0), 0);
  };

  // Calculate full stream progress percentage
  const calculateFullStreamProgress = (): number => {
    const totalStreamDuration = calculateTotalStreamDuration();
    if (totalStreamDuration === 0) return 0;
    
    const totalWatchedDuration = calculateTotalWatchedDuration();
    return Math.min(100, (totalWatchedDuration / totalStreamDuration) * 100);
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic, index: number) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setCurrentTopicIndex(index);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setRealWatchedSeconds(0);
    setVideoStartTime(Date.now());
    setIsTrackingProgress(false);

    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }

    const intervalId = startRealProgressTracking(topic);
    setProgressIntervalId(intervalId);
  };

  const startRealProgressTracking = (topic: Topic): NodeJS.Timeout => {
    const interval = setInterval(() => {
      if (videoStartTime) {
        const secondsWatched = Math.floor((Date.now() - videoStartTime) / 1000);
        setRealWatchedSeconds(secondsWatched);
        
        const topicDurationSeconds = topic.duration * 60;
        const progress = Math.min(100, (secondsWatched / topicDurationSeconds) * 100);
        setVideoProgress(progress);
        
        // Auto-mark as completed if watched 80% or more
        if (progress >= 80) {
          markTopicAsCompleted(topic, secondsWatched);
          clearInterval(interval);
          setProgressIntervalId(null);
        }
      }
    }, 1000); // Update every second

    setIsTrackingProgress(true);
    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic, watchedSeconds?: number) => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentTopicProgress = getTopicProgress(selectedCourse._id, topic.name);
      
      // Use real watched seconds if available, otherwise use full duration
      const finalWatchedSeconds = watchedSeconds || (topic.duration * 60);
      
      // Calculate full stream progress for backend
      const totalStreamDuration = calculateTotalStreamDuration();
      const currentWatchedDuration = calculateTotalWatchedDuration();
      
      // Remove current topic's progress if it exists to avoid double counting
      const existingTopicProgress = topicProgress.find(
        tp => tp.courseId === selectedCourse._id && tp.topicName === topic.name
      );
      const adjustedWatchedDuration = currentWatchedDuration - (existingTopicProgress?.watchedDuration || 0);
      
      // Add the new watched duration
      const newTotalWatchedDuration = adjustedWatchedDuration + finalWatchedSeconds;
      const newWatchedPercentage = Math.min(100, (newTotalWatchedDuration / totalStreamDuration) * 100);

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: topic.name,
        watchedDuration: finalWatchedSeconds,
        totalCourseDuration: totalStreamDuration,
        totalWatchedPercentage: newWatchedPercentage
      });

      if (response.success) {
        // Update local state with backend response
        setTopicProgress(response.topicProgress || []);
        
        // Reload enrollment data to get updated progress
        const enrollmentResponse = await pack365Api.getMyEnrollments(token);
        const updatedEnrollment = enrollmentResponse.enrollments.find(
          (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );
        
        if (updatedEnrollment) {
          setEnrollment(updatedEnrollment);
          await checkExamEligibility(updatedEnrollment);
        }

        setIsTrackingProgress(false);
        
        toast({
          title: 'Progress Updated',
          description: `"${topic.name}" marked as completed!`,
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update progress', 
        variant: 'destructive' 
      });
    }
  };

  const handleManualComplete = async (topic: Topic) => {
    const finalWatchedSeconds = realWatchedSeconds > 0 ? realWatchedSeconds : (topic.duration * 60);
    await markTopicAsCompleted(topic, finalWatchedSeconds);
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      setProgressIntervalId(null);
    }
    setIsTrackingProgress(false);
    setRealWatchedSeconds(0);
    setVideoStartTime(null);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  // Check if current topic is watched
  const isCurrentTopicWatched = (): boolean => {
    if (!selectedCourse || !selectedTopic) return false;
    const progress = getTopicProgress(selectedCourse._id, selectedTopic.name);
    return progress?.watched || false;
  };

  // Use duration-based progress calculation for accuracy
  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    if (!course) return 0;

    const totalDurationSec = course.topics?.reduce((sum, t) => sum + t.duration * 60, 0) || 0;
    if (totalDurationSec === 0) return 0;

    const watchedSeconds = topicProgress
      .filter((tp) => tp.courseId === courseId)
      .reduce((sum, tp) => sum + (tp.watchedDuration || 0), 0);

    return Math.min(100, (watchedSeconds / totalDurationSec) * 100);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    if (examEligible) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream and have available exams.',
        variant: 'destructive'
      });
    }
  };

  const goToNextTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex < selectedCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      const nextTopic = selectedCourse.topics[nextIndex];
      setCurrentTopicIndex(nextIndex);
      setSelectedTopic(nextTopic);
      setVideoProgress(0);
      setRealWatchedSeconds(0);
      setVideoStartTime(Date.now());
      setIsTrackingProgress(false);

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        setProgressIntervalId(null);
      }

      const intervalId = startRealProgressTracking(nextTopic);
      setProgressIntervalId(intervalId);
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      const prevTopic = selectedCourse?.topics[prevIndex];
      setCurrentTopicIndex(prevIndex);
      setSelectedTopic(prevTopic || null);
      setVideoProgress(0);
      setRealWatchedSeconds(0);
      setVideoStartTime(Date.now());
      setIsTrackingProgress(false);

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        setProgressIntervalId(null);
      }

      if (prevTopic) {
        const intervalId = startRealProgressTracking(prevTopic);
        setProgressIntervalId(intervalId);
      }
    }
  };

  const isTopicWatched = (topicName: string): boolean => {
    if (!selectedCourse) return false;
    const progress = getTopicProgress(selectedCourse._id, topicName);
    return progress?.watched || false;
  };

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
  const overallStreamProgress = enrollment?.totalWatchedPercentage || calculateFullStreamProgress();
  const isTopicCompleted = isCurrentTopicWatched();

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
                <div className="flex-1 bg-black rounded-lg mb-4">
                  {extractYouTubeVideoId(selectedTopic.link) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedTopic.link)}?autoplay=1`}
                      title={selectedTopic.name}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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
                        {isTopicCompleted ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : isTrackingProgress ? (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Tracking your progress... ({realWatchedSeconds}s)
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Not completed yet
                          </span>
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
                  {examEligible && (
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
                      const isWatched = isTopicWatched(topic.name);
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
                          {selectedCourse?.topics.filter(topic => isTopicWatched(topic.name)).length || 0}/
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
                          {examEligible ? (
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
