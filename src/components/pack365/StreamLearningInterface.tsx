// components/StreamLearningInterface.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  ExternalLink
} from 'lucide-react';
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
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  isExamCompleted: boolean;
  examScore?: number;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    loadStreamData();
  }, [stream]);

  const loadStreamData = async () => {
    try {
      setLoading(true);
      
      // Load enrollment data
      const enrollmentResponse = await pack365Api.getMyEnrollments();
      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        toast({
          title: 'Access Denied',
          description: 'You are not enrolled in this stream',
          variant: 'destructive'
        });
        navigate('/pack365');
        return;
      }

      setEnrollment(streamEnrollment);

      // Load courses for this stream
      const coursesResponse = await pack365Api.getAllCourses();
      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      );

      setCourses(streamCourses);
      setSelectedCourse(streamCourses[0] || null);

    } catch (error: any) {
      console.error('Error loading stream data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stream data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
  };

  const handleProgressUpdate = async (updatedProgress: any) => {
    // Refresh enrollment data to get updated progress
    const enrollmentResponse = await pack365Api.getMyEnrollments();
    const streamEnrollment = enrollmentResponse.enrollments.find(
      (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
    );
    setEnrollment(streamEnrollment);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return enrollment?.topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  const getCourseProgress = (course: Course) => {
    if (!enrollment) return 0;
    
    const courseTopics = course.topics.length;
    const watchedTopics = enrollment.topicProgress.filter(
      tp => tp.courseId === course._id && tp.watched
    ).length;
    
    return (watchedTopics / courseTopics) * 100;
  };

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'Complete 80% of the stream to unlock the exam',
        variant: 'destructive'
      });
    }
  };

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
      
      <VideoLearningModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        topic={selectedTopic}
        course={selectedCourse}
        onProgressUpdate={handleProgressUpdate}
      />

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
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {stream} Stream Learning
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete courses to unlock exams
                </p>
              </div>
              
              {enrollment && (
                <div className="mt-4 sm:mt-0">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(enrollment.totalWatchedPercentage)}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Progress</div>
                    </div>
                    {enrollment.totalWatchedPercentage >= 80 && (
                      <Button onClick={handleTakeExam}>
                        <Award className="h-4 w-4 mr-2" />
                        Take Exam
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
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

              {/* Progress Summary */}
              {enrollment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Courses Completed:</span>
                      <span className="font-medium">
                        {courses.filter(course => getCourseProgress(course) === 100).length} / {courses.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Topics Watched:</span>
                      <span className="font-medium">
                        {enrollment.watchedTopics} / {enrollment.totalTopics}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exam Ready:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 80 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 80 ? 'Yes' : 'No'}
                      </Badge>
                    </div>
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
                        <CardTitle className="text-2xl">
                          {selectedCourse.courseName}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          {selectedCourse.description}
                        </p>
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
                              <p className="text-sm text-gray-600">
                                Download study materials
                              </p>
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
                                  onClick={() => window.open(topic.link, '_blank')}
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

