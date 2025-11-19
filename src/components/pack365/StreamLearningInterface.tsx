import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink
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
  documentLink?: string;
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

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const progressIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [examEligible, setExamEligible] = useState(false);
  const videoStartTimeRef = useRef<number>(0);

  useEffect(() => {
    loadStreamData();
    return () => {
      // Cleanup interval on unmount
      if (progressIntervalIdRef.current) {
        clearInterval(progressIntervalIdRef.current);
        progressIntervalIdRef.current = null;
      }
    };
  }, [stream]);

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
      );

      setCourses(streamCourses);

      const courseFromLocation = location.state?.selectedCourse;
      if (courseFromLocation) {
        const matchedCourse = streamCourses.find(
          (c: Course) => c.courseId === courseFromLocation.courseId || c._id === courseFromLocation._id
        );
        setSelectedCourse(matchedCourse || streamCourses[0]);
      } else {
        setSelectedCourse(streamCourses[0]);
      }

      await checkExamEligibility();
    } catch (error: any) {
      console.error('Error loading stream data:', error);
      setError('Failed to load stream data');
      toast({ title: 'Error', description: 'Failed to load stream data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const checkExamEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      const streamEnrollment = enrollmentResponse.enrollments?.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (streamEnrollment) {
        setExamEligible(streamEnrollment.totalWatchedPercentage >= 80);
      }
    } catch (error) {
      console.error('Error checking exam eligibility:', error);
    }
  };

  const getTopicProgress = (courseId: string, topicName: string): TopicProgress | undefined => {
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && tp.topicName === topicName
    );
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setIsTrackingProgress(true);
    videoStartTimeRef.current = Date.now();

    // Clear any existing interval before starting new one
    if (progressIntervalIdRef.current) {
      clearInterval(progressIntervalIdRef.current);
      progressIntervalIdRef.current = null;
    }

    // Start tracking real watch time
    const intervalId = setInterval(() => {
      const timeWatched = Math.floor((Date.now() - videoStartTimeRef.current) / 1000);
      const progressPercentage = Math.min((timeWatched / (topic.duration * 60)) * 100, 100);
      
      setVideoProgress(progressPercentage);
      
      // Auto-mark as completed if watched 80% of the video
      if (progressPercentage >= 80 && isTrackingProgress) {
        setIsTrackingProgress(false);
        handleManualComplete(topic, timeWatched);
      }
    }, 5000);

    progressIntervalIdRef.current = intervalId;
  };

  const markTopicAsCompleted = async (topic: Topic, actualWatchedSeconds: number) => {
    if (!selectedCourse || !enrollment) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Check if already watched
      const currentTopicProgress = getTopicProgress(selectedCourse._id, topic.name);
      if (currentTopicProgress?.watched) {
        setIsTrackingProgress(false);
        return;
      }

      // Convert duration to seconds and cap to topic duration
      const watchedDurationInSeconds = Math.min(actualWatchedSeconds, topic.duration * 60);

      // ✅ Calculate total watched percentage
      const updatedTopicProgress = enrollment.topicProgress.map((tp: any) => {
        if (tp.topicName === topic.name && String(tp.courseId) === String(selectedCourse._id)) {
          return {
            ...tp,
            watched: true,
            watchedDuration: Math.max(tp.watchedDuration || 0, watchedDurationInSeconds)
          };
        }
        return tp;
      });

      // Calculate total watched topics
      const totalWatchedTopics = updatedTopicProgress.filter((tp: any) => tp.watched).length;
      const totalTopics = updatedTopicProgress.length;
      const calculatedPercentage = totalTopics > 0 ? (totalWatchedTopics / totalTopics) * 100 : 0;

      // ✅ CRITICAL FIX: Use courseId (string field) not _id (ObjectId)
      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse.courseId, // ✅ Use courseId not _id
        topicName: topic.name,
        watchedDuration: watchedDurationInSeconds,
        totalCourseDuration: enrollment.totalCourseDuration || 0,
        totalWatchedPercentage: calculatedPercentage
      });

      if (response.success) {
        // ✅ Refresh enrollment data to get updated progress from backend
        await refreshEnrollmentData();
        
        setIsTrackingProgress(false);
        
        await checkExamEligibility();
        
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
        description: error.message || 'Failed to update progress', 
        variant: 'destructive' 
      });
    }
  };

  const refreshEnrollmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      const streamEnrollment = enrollmentResponse.enrollments?.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (streamEnrollment) {
        setEnrollment(streamEnrollment);
        setTopicProgress(streamEnrollment.topicProgress || []);
      }
    } catch (error) {
      console.error('Error refreshing enrollment data:', error);
    }
  };

  const handleManualComplete = async (topic: Topic, watchedSeconds?: number) => {
    const actualWatchedSeconds = watchedSeconds || Math.floor((Date.now() - videoStartTimeRef.current) / 1000);
    await markTopicAsCompleted(topic, actualWatchedSeconds);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    setVideoProgress(0);
    setIsTrackingProgress(false);
    
    // ✅ Clear interval when modal closes
    if (progressIntervalIdRef.current) {
      clearInterval(progressIntervalIdRef.current);
      progressIntervalIdRef.current = null;
    }
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank', 'noopener,noreferrer');
  };

  const handleViewDocument = () => {
    if (selectedCourse?.documentLink) {
      window.open(selectedCourse.documentLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTakeExam = () => {
    if (examEligible) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'Complete at least 80% of the stream to take the exam',
        variant: 'destructive'
      });
    }
  };

  const calculateCourseProgress = (course: Course): number => {
    if (!topicProgress.length) return 0;
    
    const courseTopics = topicProgress.filter(
      tp => String(tp.courseId) === String(course._id)
    );
    
    if (courseTopics.length === 0) return 0;
    
    const watchedCount = courseTopics.filter(tp => tp.watched).length;
    return (watchedCount / courseTopics.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/pack365')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Streams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <span>{selectedTopic?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => selectedTopic && handleOpenInNewTab(selectedTopic)}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Watching Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2 mb-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {isTrackingProgress ? (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tracking your progress...
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      )}
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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              onClick={() => navigate(`/pack365-learning/${stream}`)}
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
              Select a course and start learning. Track your progress and complete topics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {courses.map((course) => {
                    const progress = calculateCourseProgress(course);
                    return (
                      <Button
                        key={course.courseId}
                        variant={selectedCourse?.courseId === course.courseId ? 'default' : 'outline'}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{course.courseName}</div>
                          <div className="text-xs opacity-75">
                            {Math.round(progress)}% complete
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                  
                  {examEligible && (
                    <Button
                      variant="default"
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      onClick={handleTakeExam}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Take Exam
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {selectedCourse && (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {selectedCourse.courseName}
                        </CardTitle>
                        <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{selectedCourse.topics.length} topics</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{selectedCourse.totalDuration} minutes</span>
                          </div>
                        </div>
                      </div>
                      {selectedCourse.documentLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewDocument}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Materials
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCourse.topics.map((topic, index) => {
                        const topicProg = getTopicProgress(selectedCourse._id, topic.name);
                        const isCompleted = topicProg?.watched || false;
                        
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 transition-all ${
                              isCompleted 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-gray-900">{topic.name}</h3>
                                  {isCompleted && (
                                    <Badge variant="default" className="bg-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{topic.duration} minutes</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleTopicClick(topic)}
                                variant={isCompleted ? 'outline' : 'default'}
                                size="sm"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamLearningInterface;
