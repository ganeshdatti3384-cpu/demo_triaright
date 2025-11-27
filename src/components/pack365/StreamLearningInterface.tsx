import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Clock, 
  BookOpen, 
  ArrowLeft,
  Award,
  Video,
  FileText,
  X,
  ExternalLink,
  CheckCircle,
  Circle
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
}

interface ExamAttempt {
  attemptId: string;
  examId: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
  isPassed: boolean;
}

interface Enrollment {
  _id: string;
  stream: string;
  userId: string;
  amountPaid: number;
  paymentStatus: string;
  enrollmentType: string;
  enrollmentDate: string;
  expiresAt: string;
  topicProgress: TopicProgress[];
  totalWatchedPercentage: number;
  totalCourseDuration: number;
  examAttempts: ExamAttempt[];
  totalExamAttempts: number;
  examScore: number;
  bestExamScore: number;
  isExamCompleted: boolean;
  lastExamAttempt: string | null;
  isPassed: boolean;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  useEffect(() => {
    loadStreamData();
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

  const isTopicWatched = (courseId: string, topicName: string): boolean => {
    if (!enrollment?.topicProgress) return false;
    
    const progress = enrollment.topicProgress.find(
      (tp: TopicProgress) => 
        tp.courseId === courseId && tp.topicName === topicName
    );
    
    return progress?.watched || false;
  };

  const getWatchedTopicsCount = (courseId: string): number => {
    if (!enrollment?.topicProgress) return 0;
    
    return enrollment.topicProgress.filter(
      (tp: TopicProgress) => tp.courseId === courseId && tp.watched
    ).length;
  };

  const updateTopicProgress = async (courseId: string, topicName: string, watchedDuration: number = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !enrollment) return;

      // Calculate total course duration in seconds
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const totalCourseDuration = course.totalDuration * 60; // Convert minutes to seconds
      
      // Update progress on backend
      await pack365Api.updateTopicProgress(token, {
        courseId,
        topicName,
        watchedDuration,
        totalCourseDuration,
        totalWatchedPercentage: calculateTotalWatchedPercentage()
      });

      // Update local state optimistically
      const updatedProgress: TopicProgress = {
        courseId,
        topicName,
        watched: true,
        watchedDuration
      };

      const existingProgressIndex = enrollment.topicProgress.findIndex(
        tp => tp.courseId === courseId && tp.topicName === topicName
      );

      let updatedTopicProgress;
      if (existingProgressIndex >= 0) {
        updatedTopicProgress = [...enrollment.topicProgress];
        updatedTopicProgress[existingProgressIndex] = updatedProgress;
      } else {
        updatedTopicProgress = [...enrollment.topicProgress, updatedProgress];
      }

      setEnrollment({
        ...enrollment,
        topicProgress: updatedTopicProgress,
        totalWatchedPercentage: calculateTotalWatchedPercentage()
      });

      toast({
        title: 'Progress Updated',
        description: `Marked "${topicName}" as completed`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Error updating topic progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const calculateTotalWatchedPercentage = (): number => {
    if (!enrollment || !courses.length) return 0;

    const totalTopics = courses.reduce((total, course) => total + course.topics.length, 0);
    const watchedTopics = enrollment.topicProgress.filter(tp => tp.watched).length;

    return totalTopics > 0 ? Math.round((watchedTopics / totalTopics) * 100) : 0;
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;
    
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
  };

  const handleCloseModal = () => {
    // Mark topic as completed when modal is closed if video was watched significantly
    if (selectedTopic && selectedCourse && videoProgress > 50) {
      updateTopicProgress(
        selectedCourse._id, 
        selectedTopic.name, 
        selectedTopic.duration * 60 // Convert minutes to seconds
      );
    }
    
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    setVideoProgress(0);
  };

  const handleMarkAsCompleted = () => {
    if (selectedTopic && selectedCourse) {
      updateTopicProgress(
        selectedCourse._id, 
        selectedTopic.name, 
        selectedTopic.duration * 60
      );
      setIsVideoModalOpen(false);
    }
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    if (enrollment?.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the course content to take the exam.',
        variant: 'destructive'
      });
    }
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Auto-mark as completed when video is 90% watched
    if (progress >= 90 && selectedTopic && selectedCourse && !isTopicWatched(selectedCourse._id, selectedTopic.name)) {
      updateTopicProgress(
        selectedCourse._id, 
        selectedTopic.name, 
        selectedTopic.duration * 60
      );
    }
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
                {selectedTopic && selectedCourse && !isTopicWatched(selectedCourse._id, selectedTopic.name) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMarkAsCompleted}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Completed
                  </Button>
                )}
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
                      onLoad={() => handleVideoProgress(0)}
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

                {/* Topic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration: {selectedTopic.duration} minutes
                      </span>
                      {selectedCourse && (
                        <span className="flex items-center mt-1">
                          {isTopicWatched(selectedCourse._id, selectedTopic.name) ? (
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 mr-1 text-gray-400" />
                          )}
                          Status: {isTopicWatched(selectedCourse._id, selectedTopic.name) ? 'Completed' : 'Not Started'}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleCloseModal}
                      variant="default"
                      size="sm"
                    >
                      Close
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {stream} Stream - Learning Portal
                </h1>
                <p className="text-gray-600 mt-2">
                  Explore all courses and topics in this stream
                </p>
              </div>
              
              {/* Progress Overview */}
              {enrollment && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-800 font-medium">Overall Progress</span>
                          <span className="text-blue-700">{enrollment.totalWatchedPercentage}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.totalWatchedPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Watch 80% to unlock exam
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Courses in Stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => {
                    const watchedCount = getWatchedTopicsCount(course._id);
                    const totalCount = course.topics.length;
                    const progressPercentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
                    
                    return (
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
                            {watchedCount}/{totalCount} topics
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          <span>{course.totalDuration} min total</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {progressPercentage}% complete
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Exam Card */}
              <Card className={`${enrollment?.totalWatchedPercentage >= 80 ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className={`h-5 w-5 ${enrollment?.totalWatchedPercentage >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${enrollment?.totalWatchedPercentage >= 80 ? 'text-green-800' : 'text-gray-600'}`}>
                      Stream Exam
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${enrollment?.totalWatchedPercentage >= 80 ? 'text-green-700' : 'text-gray-600'}`}>
                    {enrollment?.totalWatchedPercentage >= 80 
                      ? 'You are eligible to take the stream exam.' 
                      : `Complete ${80 - (enrollment?.totalWatchedPercentage || 0)}% more to unlock exam.`}
                  </p>
                  <Button 
                    onClick={handleTakeExam}
                    className={`w-full ${enrollment?.totalWatchedPercentage >= 80 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'}`}
                    disabled={!enrollment || enrollment.totalWatchedPercentage < 80}
                  >
                    {enrollment?.totalWatchedPercentage >= 80 ? 'Take Stream Exam' : 'Complete Content First'}
                  </Button>
                </CardContent>
              </Card>
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
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedCourse.totalDuration} min
                        </Badge>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {getWatchedTopicsCount(selectedCourse._id)}/{selectedCourse.topics.length} topics completed
                        </Badge>
                      </div>
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
                        const isWatched = isTopicWatched(selectedCourse._id, topic.name);
                        
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
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Play className="h-5 w-5 text-blue-600" />
                                )}
                                <div>
                                  <h4 className={`font-medium ${isWatched ? 'text-green-800' : 'text-gray-900'}`}>
                                    {topic.name}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {topic.duration} min
                                    </span>
                                    {isWatched && (
                                      <span className="flex items-center text-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </span>
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
                                  {isWatched ? 'Review' : 'Watch'}
                                </Button>
                                {!isWatched && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => updateTopicProgress(selectedCourse._id, topic.name, topic.duration * 60)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
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
