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
  ExternalLink,
  AlertCircle
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
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    loadStreamData();
  }, [stream]);

  const loadStreamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading stream data for:', stream);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Load enrollment data
      let enrollmentResponse;
      try {
        enrollmentResponse = await pack365Api.getMyEnrollments(token);
        console.log('Enrollment response:', enrollmentResponse);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load enrollment data');
        return;
      }
      
      if (!enrollmentResponse?.success || !enrollmentResponse.enrollments) {
        setError('No enrollment data found');
        return;
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError(`You are not enrolled in the ${stream} stream`);
        return;
      }

      setEnrollment(streamEnrollment);

      // Load courses data
      let coursesResponse;
      try {
        coursesResponse = await pack365Api.getAllCourses();
        console.log('Courses response:', coursesResponse);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        return;
      }

      if (!coursesResponse?.success || !coursesResponse.data) {
        setError('No courses data found');
        return;
      }

      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (streamCourses.length === 0) {
        setError(`No courses found for ${stream} stream`);
        return;
      }

      setCourses(streamCourses);

      // Set selected course
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
      setError('Failed to load stream data. Please try again.');
      toast({ 
        title: 'Error', 
        description: 'Failed to load stream data', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
  };

  const markTopicAsCompleted = async (topic: Topic) => {
    if (!selectedCourse || !enrollment) {
      toast({ title: 'Error', description: 'Course or enrollment data missing', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        return;
      }

      // Check if topic is already completed
      const existingProgress = getTopicProgress(selectedCourse._id, topic.name);
      if (existingProgress?.watched) {
        toast({
          title: 'Already Completed',
          description: `"${topic.name}" is already completed.`,
          variant: 'default'
        });
        return;
      }

      // Calculate total stream duration for progress calculation
      const totalStreamDuration = courses.reduce((total, course) => {
        return total + course.topics.reduce((courseTotal, t) => courseTotal + t.duration, 0);
      }, 0) * 60; // Convert to seconds

      // Calculate new overall progress
      const currentWatchedDuration = enrollment.topicProgress
        .filter(tp => tp.watched)
        .reduce((total, tp) => total + tp.watchedDuration, 0);
      
      const newWatchedDuration = currentWatchedDuration + (topic.duration * 60);
      const newProgress = Math.round((newWatchedDuration / totalStreamDuration) * 100);

      console.log('Updating topic progress:', {
        courseId: selectedCourse._id,
        topicName: topic.name,
        watchedDuration: topic.duration * 60,
        totalCourseDuration: totalStreamDuration,
        totalWatchedPercentage: newProgress
      });

      const response = await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse._id,
        topicName: topic.name,
        watchedDuration: topic.duration * 60,
        totalCourseDuration: totalStreamDuration,
        totalWatchedPercentage: newProgress
      });

      if (response.success) {
        // Reload enrollment to get updated progress
        const updatedEnrollmentResponse = await pack365Api.getMyEnrollments(token);
        const updatedStreamEnrollment = updatedEnrollmentResponse.enrollments.find(
          (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );
        
        if (updatedStreamEnrollment) {
          setEnrollment(updatedStreamEnrollment);
        }

        toast({
          title: 'Progress Updated!',
          description: `"${topic.name}" marked as completed.`,
          variant: 'default'
        });
      } else {
        throw new Error(response.message || 'Failed to update progress');
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

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return enrollment?.topicProgress?.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  const getCourseProgress = (course: Course) => {
    if (!enrollment?.topicProgress || !course.topics) return 0;
    
    const courseTopics = course.topics;
    const watchedTopics = courseTopics.filter(topic => {
      return enrollment.topicProgress.some(
        tp => tp.courseId === course._id && tp.topicName === topic.name && tp.watched
      );
    }).length;

    return courseTopics.length > 0 ? (watchedTopics / courseTopics.length) * 100 : 0;
  };

  const getOverallStreamProgress = () => {
    return enrollment?.totalWatchedPercentage || 0;
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'Complete 80% of the stream to take the exam.',
        variant: 'destructive'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course content...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Content</h2>
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

  // No courses state
  if (courses.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h2>
            <p className="text-gray-600 mb-4">No courses found for this stream.</p>
            <Button onClick={() => navigate('/pack365-dashboard')}>
              Back to Dashboard
            </Button>
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
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{selectedTopic?.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedTopic && handleOpenInNewTab(selectedTopic.link)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  New Tab
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
          
          <div className="flex-1 flex flex-col min-h-0">
            {selectedTopic && (
              <>
                {/* Video Embed */}
                <div className="flex-1 bg-black rounded-lg mb-4 min-h-0">
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
                        <p className="text-sm text-gray-400 mb-4">The video link may be invalid or unavailable</p>
                        <Button 
                          onClick={() => handleOpenInNewTab(selectedTopic.link)}
                          variant="default"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {getTopicProgress(selectedCourse?._id || '', selectedTopic.name)?.watched ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Mark when finished watching
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => markTopicAsCompleted(selectedTopic)}
                      variant="default"
                      size="sm"
                      disabled={getTopicProgress(selectedCourse?._id || '', selectedTopic.name)?.watched}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {getTopicProgress(selectedCourse?._id || '', selectedTopic.name)?.watched ? 'Completed' : 'Mark as Completed'}
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
              onClick={() => navigate('/pack365-dashboard')}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                  {stream} Stream - Learning Portal
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete topics and track your progress
                </p>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
                <div className="flex items-center gap-3">
                  <Progress value={getOverallStreamProgress()} className="w-24 sm:w-32 h-2" />
                  <span className="text-sm font-medium whitespace-nowrap">{Math.round(getOverallStreamProgress())}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Courses</CardTitle>
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
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm leading-tight flex-1 mr-2">{course.courseName}</h3>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {course.topics?.length || 0}
                        </Badge>
                      </div>
                      <Progress 
                        value={getCourseProgress(course)} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Progress</span>
                        <span>{Math.round(getCourseProgress(course))}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Exam Eligibility */}
              {enrollment && enrollment.totalWatchedPercentage >= 80 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Exam Ready!</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      You can now take the stream exam.
                    </p>
                    <Button 
                      onClick={handleTakeExam}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Take Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Course Content */}
            <div className="lg:col-span-3">
              {selectedCourse ? (
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl">{selectedCourse.courseName}</CardTitle>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedCourse.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Course Progress</div>
                          <div className="flex items-center gap-2">
                            <Progress value={getCourseProgress(selectedCourse)} className="w-20 sm:w-24 h-2" />
                            <span className="text-sm font-medium whitespace-nowrap">{Math.round(getCourseProgress(selectedCourse))}%</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedCourse.totalDuration}m
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Course Document */}
                    {selectedCourse.documentLink && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Course Materials</h4>
                              <p className="text-sm text-gray-600">Download study materials</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleOpenInNewTab(selectedCourse.documentLink!)}
                            variant="outline"
                            size="sm"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Topics List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Topics</h3>
                      {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
                        selectedCourse.topics.map((topic, index) => {
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
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center space-x-3 flex-1">
                                  {isWatched ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <Play className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{topic.name}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {topic.duration}m
                                      </span>
                                      {isWatched && (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                          Completed
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleOpenInNewTab(topic.link)}
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
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No topics available for this course.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Course Selected</h3>
                      <p className="text-gray-500">Please select a course from the sidebar.</p>
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
