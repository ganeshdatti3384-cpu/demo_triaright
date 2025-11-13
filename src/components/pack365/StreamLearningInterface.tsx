import React, { useState, useEffect } from 'react';
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
  const [progressIntervalId, setProgressIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStreamData();
  }, [stream]);

  useEffect(() => {
    // Cleanup interval on unmount
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

      // Get enrollment data
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

      // Get courses for this stream
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

      // Set selected course from location state or first course
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

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setIsTrackingProgress(false);

    // Clear any existing interval
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
    }

    // Start progress tracking after a short delay
    const intervalId = startProgressTracking(topic);
    setProgressIntervalId(intervalId);
  };

  const startProgressTracking = (topic: Topic): NodeJS.Timeout => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        markTopicAsCompleted(topic);
        return;
      }
      
      progress += (100 / (topic.duration * 60)) * 5; // Increment every 5 seconds
      if (progress > 100) progress = 100;
      
      setVideoProgress(progress);
      
      // Mark as completed if progress reaches 80% or more
      if (progress >= 80 && isTrackingProgress) {
        markTopicAsCompleted(topic);
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds

    setIsTrackingProgress(true);
    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic) => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Check if already completed
      const currentTopicProgress = getTopicProgress(selectedCourse._id, topic.name);
      if (currentTopicProgress?.watched) {
        setIsTrackingProgress(false);
        return; // Already marked as completed
      }

      // Update progress via API
      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse.courseId,
        topicName: topic.name,
        watchedDuration: topic.duration,
        totalWatchedPercentage: calculateNewProgress(topic),
        lastWatchedAt: new Date().toISOString()
      });

      if (response.success) {
        // Update local state
        setTopicProgress(prev => {
          const existingIndex = prev.findIndex(
            tp => tp.topicName === topic.name && tp.courseId === selectedCourse._id
          );
          
          if (existingIndex >= 0) {
            // Update existing
            return prev.map((tp, index) => 
              index === existingIndex 
                ? { 
                    ...tp, 
                    watched: true, 
                    watchedDuration: topic.duration,
                    lastWatchedAt: new Date().toISOString()
                  }
                : tp
            );
          } else {
            // Add new
            return [
              ...prev,
              {
                courseId: selectedCourse._id,
                topicName: topic.name,
                watched: true,
                watchedDuration: topic.duration,
                lastWatchedAt: new Date().toISOString()
              }
            ];
          }
        });

        setIsTrackingProgress(false);
        
        toast({
          title: 'Progress Updated',
          description: `"${topic.name}" marked as completed!`,
          variant: 'default'
        });
      } else {
        throw new Error('API call failed');
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

  const calculateNewProgress = (completedTopic: Topic): number => {
    const courseTopics = selectedCourse?.topics || [];
    const currentWatched = topicProgress.filter(tp => 
      tp.courseId === selectedCourse?._id && tp.watched
    ).length;
    
    const newWatchedCount = currentWatched + 1;
    return Math.round((newWatchedCount / courseTopics.length) * 100);
  };

  const handleManualComplete = async (topic: Topic) => {
    await markTopicAsCompleted(topic);
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
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  const getCourseProgress = (courseId: string) => {
    const courseTopics = topicProgress.filter(tp => tp.courseId === courseId);
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    const totalTopics = courses.find(c => c._id === courseId)?.topics.length || 1;
    return totalTopics > 0 ? (watchedTopics / totalTopics) * 100 : 0;
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
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
          {/* Header */}
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
              Complete all courses and topics to unlock the final exam
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Courses in Stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCourse?._id === course._id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{course.courseName}</h3>
                        <Badge variant="secondary">
                          {course.topics.length} topics
                        </Badge>
                      </div>
                      <Progress 
                        value={getCourseProgress(course._id)} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Progress</span>
                        <span>{Math.round(getCourseProgress(course._id))}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Exam Eligibility */}
              {enrollment?.totalWatchedPercentage >= 80 && (
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
                      onClick={() => navigate(`/exam/${stream}`)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Course Content */}
            <div className="lg:col-span-3">
              {selectedCourse && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedCourse.courseName}</CardTitle>
                        <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedCourse.totalDuration} min
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Course Document */}
                    {selectedCourse.documentLink && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
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

                    {/* Topics List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                      {selectedCourse.topics.map((topic, index) => {
                        const progress = getTopicProgress(selectedCourse._id, topic.name);
                        const isWatched = progress?.watched;

                        return (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg transition-colors ${
                              isWatched
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isWatched ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Play className="h-5 w-5 text-blue-600" />
                                )}
                                <div>
                                  <h4 className="font-medium">{topic.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {topic.duration} min
                                    </span>
                                    {isWatched && (
                                      <Badge variant="outline" className="bg-green-100 text-green-800">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenInNewTab(topic)}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  New Tab
                                </Button>
                                <Button 
                                  variant={isWatched ? "outline" : "default"} 
                                  size="sm"
                                  onClick={() => handleTopicClick(topic)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  {isWatched ? 'Watch Again' : 'Watch'}
                                </Button>
                              </div>
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
