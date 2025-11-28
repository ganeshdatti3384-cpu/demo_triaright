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
  duration: number; // minutes
}

interface Course {
  _id: string;       // Mongo ObjectId
  courseId: string;  // human-readable ID used by backend progress endpoint
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number; // seconds (as stored in backend)
  topics: Topic[];
}

interface TopicProgress {
  courseId: string;       // we store courseId (string), not _id
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
  lastWatchedAt?: string;
}

interface Enrollment {
  _id?: string;
  stream: string;
  totalWatchedPercentage: number;
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

  // --- Helpers for total duration ---
  const calculateTotalCourseDuration = (coursesList: Course[]): number => {
    // Prefer backend totalDuration (seconds). If missing, compute from topics (minutes -> seconds).
    return coursesList.reduce((total, course) => {
      if (course.totalDuration && course.totalDuration > 0) {
        return total + course.totalDuration;
      }
      const topicsDuration = course.topics?.reduce((sum, t) => sum + t.duration * 60, 0) || 0;
      return total + topicsDuration;
    }, 0);
  };

  useEffect(() => {
    loadStreamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Align with backend response shape
      setEnrollment({
        _id: streamEnrollment._id,
        stream: streamEnrollment.stream,
        totalWatchedPercentage: streamEnrollment.totalWatchedPercentage ?? 0,
        isExamCompleted: streamEnrollment.isExamCompleted ?? false,
        examScore: streamEnrollment.examScore ?? null,
      });

      // Backend /pack365/enrollments does not send topicProgress -> start empty (frontend-only tracking)
      setTopicProgress([]);

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

      await checkExamEligibility({
        _id: streamEnrollment._id,
        stream: streamEnrollment.stream,
        totalWatchedPercentage: streamEnrollment.totalWatchedPercentage ?? 0,
        isExamCompleted: streamEnrollment.isExamCompleted ?? false,
        examScore: streamEnrollment.examScore ?? null,
      });

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

  const checkExamEligibility = async (currentEnrollment?: Enrollment | null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const enrollmentToCheck = currentEnrollment || enrollment;
      
      if (enrollmentToCheck && enrollmentToCheck.totalWatchedPercentage >= 80) {
        const availableExamsResponse = await pack365Api.getAvailableExamsForUser(token);
        
        if ((availableExamsResponse as any).success && (availableExamsResponse as any).exams) {
          const availableExams = (availableExamsResponse as any).exams;
          const eligibleExams = availableExams.filter((exam: any) => {
            // exam.courseId is Mongo ObjectId of Pack365Course
            return courses.some(course => course._id === exam.courseId);
          });

          setExamEligible(eligibleExams.length > 0);
          return;
        }
      }

      setExamEligible(false);
    } catch (error) {
      console.error('Error checking exam eligibility:', error);
      setExamEligible(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }
      const pathSegments = urlObj.pathname.split('/');
      const embedIndex = pathSegments.indexOf('embed');
      if (embedIndex !== -1 && pathSegments[embedIndex + 1]) {
        return pathSegments[embedIndex + 1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  const startRealProgressTracking = (topic: Topic) => {
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
    }

    setIsTrackingProgress(true);
    setVideoStartTime(Date.now());
    setRealWatchedSeconds(0);
    setVideoProgress(0);

    const interval = setInterval(() => {
      setRealWatchedSeconds(prevSeconds => {
        const secondsWatched = prevSeconds + 1;
        const topicDurationSeconds = topic.duration * 60;
        const progress = Math.min(100, (secondsWatched / topicDurationSeconds) * 100);
        setVideoProgress(progress);
        
        if (progress >= 80) {
          markTopicAsCompleted(topic, secondsWatched);
          clearInterval(interval);
          setProgressIntervalId(null);
        }

        return secondsWatched;
      });
    }, 1000);

    setProgressIntervalId(interval);
    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic, watchedSeconds?: number) => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // We always use courseId STRING for backend
      const courseId = selectedCourse.courseId;

      const currentTopicProgress = getTopicProgress(courseId, topic.name);
      const topicDurationSeconds = topic.duration * 60;

      const baseWatchedSeconds =
        watchedSeconds && watchedSeconds > 0
          ? watchedSeconds
          : (currentTopicProgress?.watchedDuration && currentTopicProgress.watchedDuration > 0
              ? currentTopicProgress.watchedDuration
              : topicDurationSeconds);

      const newTopicWatchedSeconds = Math.max(
        currentTopicProgress?.watchedDuration || 0,
        baseWatchedSeconds
      );

      // Compute incremental total watched percentage
      const totalCourseDuration = calculateTotalCourseDuration(courses);
      const previousTotalWatchedPercentage = enrollment?.totalWatchedPercentage ?? 0;
      const previousTotalWatchedSeconds = (previousTotalWatchedPercentage / 100) * totalCourseDuration;

      const previousTopicWatchedSeconds = currentTopicProgress?.watchedDuration || 0;
      const deltaWatchedSeconds = newTopicWatchedSeconds - previousTopicWatchedSeconds;

      const newTotalWatchedSeconds = Math.max(
        0,
        previousTotalWatchedSeconds + deltaWatchedSeconds
      );

      const newTotalWatchedPercentage =
        totalCourseDuration > 0
          ? Math.min(100, (newTotalWatchedSeconds / totalCourseDuration) * 100)
          : 0;

      const response = await pack365Api.updateTopicProgress(token, {
        courseId,
        topicName: topic.name,
        watchedDuration: newTopicWatchedSeconds,
        totalCourseDuration,
        totalWatchedPercentage: newTotalWatchedPercentage,
      });

      if (response.success) {
        // Update local topicProgress state (frontend-only representation)
        setTopicProgress(prev => {
          const existingIndex = prev.findIndex(
            tp => tp.courseId === courseId && tp.topicName === topic.name
          );

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              watched: true,
              watchedDuration: newTopicWatchedSeconds,
              lastWatchedAt: new Date().toISOString(),
            };
            return updated;
          }

          return [
            ...prev,
            {
              courseId,
              topicName: topic.name,
              watched: true,
              watchedDuration: newTopicWatchedSeconds,
              lastWatchedAt: new Date().toISOString(),
            },
          ];
        });

        // Update enrollment totalWatchedPercentage locally
        setEnrollment(prev =>
          prev
            ? { ...prev, totalWatchedPercentage: newTotalWatchedPercentage }
            : prev
        );

        // Optionally re-fetch enrollment from backend to stay in sync
        const enrollmentResponse = await pack365Api.getMyEnrollments(token);
        if (enrollmentResponse.success && enrollmentResponse.enrollments) {
          const updatedStreamEnrollment = enrollmentResponse.enrollments.find(
            (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
          );
          if (updatedStreamEnrollment) {
            setEnrollment({
              _id: updatedStreamEnrollment._id,
              stream: updatedStreamEnrollment.stream,
              totalWatchedPercentage: updatedStreamEnrollment.totalWatchedPercentage ?? newTotalWatchedPercentage,
              isExamCompleted: updatedStreamEnrollment.isExamCompleted ?? false,
              examScore: updatedStreamEnrollment.examScore ?? null,
            });
            await checkExamEligibility({
              _id: updatedStreamEnrollment._id,
              stream: updatedStreamEnrollment.stream,
              totalWatchedPercentage: updatedStreamEnrollment.totalWatchedPercentage ?? newTotalWatchedPercentage,
              isExamCompleted: updatedStreamEnrollment.isExamCompleted ?? false,
              examScore: updatedStreamEnrollment.examScore ?? null,
            });
          }
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
    const finalWatchedSeconds =
      realWatchedSeconds > 0 ? realWatchedSeconds : (topic.duration * 60);
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

  const handleTopicClick = (topic: Topic, index: number) => {
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

  const isCurrentTopicWatched = (): boolean => {
    if (!selectedCourse || !selectedTopic) return false;
    const progress = getTopicProgress(selectedCourse.courseId, selectedTopic.name);
    return progress?.watched || false;
  };

  const isTopicWatched = (topicName: string): boolean => {
    if (!selectedCourse) return false;
    const progress = getTopicProgress(selectedCourse.courseId, topicName);
    return progress?.watched || false;
  };

  const getCourseProgress = (courseId: string) => {
    const course = courses.find((c) => c.courseId === courseId);
    if (!course) return 0;

    const totalDurationSec =
      course.topics?.reduce((sum, t) => sum + t.duration * 60, 0) || 0;
    if (totalDurationSec === 0) return 0;

    const watchedSeconds = topicProgress
      .filter((tp) => tp.courseId === courseId)
      .reduce((sum, tp) => sum + (tp.watchedDuration || 0), 0);

    return Math.min(100, (watchedSeconds / totalDurationSec) * 100);
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
            <p>Loading course content.</p>
          </div>
        </div>
      </>
    );
  }

  const currentTopic = selectedCourse?.topics?.[currentTopicIndex];
  const courseProgressValue = selectedCourse ? getCourseProgress(selectedCourse.courseId) : 0;
  const overallStreamProgress = enrollment?.totalWatchedPercentage ?? 0;
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
                            Tracking your progress...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Play className="h-4 w-4 mr-1" />
                            Click play to start tracking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => markTopicAsCompleted(selectedTopic)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button
                        variant="default"
                        onClick={goToNextTopic}
                        disabled={!selectedCourse || currentTopicIndex >= (selectedCourse.topics.length - 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
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
            {/* Content Section */}
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
                          } else {
                            toast({
                              title: 'No Topics',
                              description: 'No topics available for this course.',
                              variant: 'destructive'
                            });
                          }
                        }}
                        variant="default"
                        size="lg"
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Play className="h-4 w-4" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Topics & Progress */}
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Course Topics</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Syllabus
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedCourse?.topics.length || 0} topics • {selectedCourse?.totalDuration} sec
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

                    <Button
                      onClick={handleTakeExam}
                      className="w-full mt-4 flex items-center justify-center gap-2"
                      variant={examEligible ? 'default' : 'outline'}
                      disabled={!examEligible}
                    >
                      <Award className="h-4 w-4" />
                      {examEligible ? 'Take Stream Exam' : 'Complete 80% to Unlock Exam'}
                    </Button>
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
