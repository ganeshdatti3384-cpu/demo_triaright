import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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

interface Enrollment {
  _id: string;
  stream: string;
  topicProgress: TopicProgress[];
  totalWatchedPercentage: number;
  totalCourseDuration: number;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
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
  const [progressTracking, setProgressTracking] = useState<{[key: string]: TopicProgress}>({});

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

      // Initialize progress tracking from enrollment data
      if (streamEnrollment.topicProgress) {
        const progressMap: {[key: string]: TopicProgress} = {};
        streamEnrollment.topicProgress.forEach((progress: TopicProgress) => {
          const key = `${progress.courseId}-${progress.topicName}`;
          progressMap[key] = progress;
        });
        setProgressTracking(progressMap);
      }

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

  const updateTopicProgress = async (courseId: string, topicName: string, watchedDuration: number, isComplete: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const progressData = {
        courseId,
        topicName,
        watchedDuration: isComplete ? selectedTopic!.duration * 60 : watchedDuration, // Convert minutes to seconds
        totalCourseDuration: enrollment?.totalCourseDuration || 0,
        totalWatchedPercentage: enrollment?.totalWatchedPercentage || 0
      };

      const response = await pack365Api.updateTopicProgress(progressData, token);
      
      if (response.success) {
        // Update local progress tracking state
        const key = `${courseId}-${topicName}`;
        setProgressTracking(prev => ({
          ...prev,
          [key]: {
            courseId,
            topicName,
            watched: isComplete || watchedDuration > selectedTopic!.duration * 60 * 0.8, // Mark as watched if 80% completed
            watchedDuration: isComplete ? selectedTopic!.duration * 60 : watchedDuration
          }
        }));

        // Update enrollment with new progress data
        if (enrollment) {
          setEnrollment(prev => prev ? {
            ...prev,
            totalWatchedPercentage: response.totalWatchedPercentage || prev.totalWatchedPercentage
          } : null);
        }

        toast({
          title: 'Progress Updated',
          description: `Your progress for "${topicName}" has been updated.`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error updating topic progress:', error);
      toast({
        title: 'Progress Update Failed',
        description: 'Failed to update your progress. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setVideoProgress(0);
    setIsVideoModalOpen(true);

    // Mark topic as started (0% progress)
    if (selectedCourse) {
      await updateTopicProgress(selectedCourse._id, topic.name, 0);
    }
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Update progress every 10% or when completed
    if (selectedTopic && selectedCourse && (progress % 10 === 0 || progress === 100)) {
      const watchedDuration = (progress / 100) * selectedTopic.duration * 60;
      updateTopicProgress(
        selectedCourse._id, 
        selectedTopic.name, 
        watchedDuration,
        progress === 100
      );
    }
  };

  const handleCloseModal = () => {
    // Final progress update when modal closes
    if (selectedTopic && selectedCourse && videoProgress > 0) {
      const watchedDuration = (videoProgress / 100) * selectedTopic.duration * 60;
      updateTopicProgress(
        selectedCourse._id, 
        selectedTopic.name, 
        watchedDuration,
        videoProgress === 100
      );
    }
    
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    setVideoProgress(0);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    navigate(`/exam/${stream}`);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    const key = `${courseId}-${topicName}`;
    return progressTracking[key] || { watched: false, watchedDuration: 0 };
  };

  const getCourseProgress = (course: Course) => {
    if (!course.topics || course.topics.length === 0) return 0;
    
    const completedTopics = course.topics.filter(topic => {
      const progress = getTopicProgress(course._id, topic.name);
      return progress.watched;
    }).length;
    
    return (completedTopics / course.topics.length) * 100;
  };

  const getOverallProgress = () => {
    if (!enrollment) return 0;
    return enrollment.totalWatchedPercentage;
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
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress: {videoProgress}%</span>
                    <span>{Math.round((videoProgress / 100) * selectedTopic.duration)} / {selectedTopic.duration} min</span>
                  </div>
                  <Progress value={videoProgress} className="w-full" />
                </div>

                {/* YouTube Video Embed */}
                <div className="flex-1 bg-black rounded-lg mb-4">
                  {extractYouTubeVideoId(selectedTopic.link) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedTopic.link)}?autoplay=1`}
                      title={selectedTopic.name}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => handleVideoProgress(10)} // Mark as 10% when loaded
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

                {/* Progress Controls */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration: {selectedTopic.duration} minutes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoProgress(50)}
                        disabled={videoProgress >= 50}
                      >
                        Mark 50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoProgress(100)}
                        disabled={videoProgress === 100}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {videoProgress === 100 ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-blue-600">In Progress</span>
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
            
            {/* Overall Progress */}
            {enrollment && (
              <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Overall Stream Progress</h3>
                  <span className="text-sm text-gray-600">{Math.round(getOverallProgress())}% Complete</span>
                </div>
                <Progress value={getOverallProgress()} className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Continue learning to unlock exam</span>
                  <span>{getOverallProgress() >= 80 ? 'Exam Ready' : `${80 - Math.round(getOverallProgress())}% to exam`}</span>
                </div>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {stream} Stream - Learning Portal
            </h1>
            <p className="text-gray-600 mt-2">
              Explore all courses and topics in this stream
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
                  {courses.map((course) => {
                    const courseProgress = getCourseProgress(course);
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
                            {course.topics.length} topics
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          <span>{course.totalDuration} min total</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(courseProgress)}%</span>
                          </div>
                          <Progress value={courseProgress} className="h-1" />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Exam Card */}
              <Card className={`${enrollment?.totalWatchedPercentage >= 80 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
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
                      : `Complete ${80 - Math.round(enrollment?.totalWatchedPercentage || 0)}% more to unlock the exam.`
                    }
                  </p>
                  <Button 
                    onClick={handleTakeExam}
                    className="w-full"
                    disabled={!enrollment || enrollment.totalWatchedPercentage < 80}
                  >
                    {enrollment?.totalWatchedPercentage >= 80 ? 'Take Stream Exam' : 'Complete More Content'}
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
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedCourse.totalDuration} min
                        </Badge>
                        <div className="text-sm text-gray-600">
                          Progress: {Math.round(getCourseProgress(selectedCourse))}%
                        </div>
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
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Course Topics</h3>
                        <div className="text-sm text-gray-600">
                          {selectedCourse.topics.filter(topic => {
                            const progress = getTopicProgress(selectedCourse._id, topic.name);
                            return progress.watched;
                          }).length} of {selectedCourse.topics.length} completed
                        </div>
                      </div>
                      {selectedCourse.topics.map((topic, index) => {
                        const progress = getTopicProgress(selectedCourse._id, topic.name);
                        const progressPercentage = progress.watchedDuration > 0 
                          ? Math.min(100, (progress.watchedDuration / (topic.duration * 60)) * 100)
                          : 0;

                        return (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg transition-colors ${
                              progress.watched 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {progress.watched ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : progressPercentage > 0 ? (
                                  <div className="relative">
                                    <Circle className="h-5 w-5 text-blue-600" />
                                    <div 
                                      className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
                                      style={{ clipPath: `inset(0 ${100 - progressPercentage}% 0 0)` }}
                                    >
                                      ●
                                    </div>
                                  </div>
                                ) : (
                                  <Play className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                  <h4 className="font-medium">{topic.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {topic.duration} min
                                    </span>
                                    {progressPercentage > 0 && (
                                      <span className="text-blue-600">
                                        {Math.round(progressPercentage)}% watched
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
                                  variant={progress.watched ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleTopicClick(topic)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  {progress.watched ? 'Review' : 'Watch'}
                                </Button>
                              </div>
                            </div>
                            {progressPercentage > 0 && progressPercentage < 100 && (
                              <div className="mt-3">
                                <Progress value={progressPercentage} className="h-1" />
                              </div>
                            )}
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
