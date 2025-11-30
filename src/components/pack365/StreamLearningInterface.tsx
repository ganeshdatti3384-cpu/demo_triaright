import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  useEffect(() => {
    loadStreamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Check enrollment status
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

  const handleTopicClick = async (topic: Topic, index: number) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setCurrentTopicIndex(index);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    console.log('Take exam clicked:', {
      stream,
      completedTopics: 0,
      totalTopics: selectedCourse?.topics.length || 0
    });

    toast({
      title: 'Exam Feature',
      description: 'Exam functionality is available for this stream.',
      variant: 'default'
    });
    
    navigate(`/exam/${stream}`);
  };

  const goToNextTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex < selectedCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      const nextTopic = selectedCourse.topics[nextIndex];
      setCurrentTopicIndex(nextIndex);
      setSelectedTopic(nextTopic);
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      const prevTopic = selectedCourse?.topics[prevIndex];
      setCurrentTopicIndex(prevIndex);
      setSelectedTopic(prevTopic || null);
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
            <p>Loading course content.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
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
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedCourse?.courseName}</h1>
                <p className="text-gray-600 mt-2">{selectedCourse?.description}</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Badge variant="secondary" className="text-sm">
                  {selectedCourse?.topics.length || 0} Topics
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Content Section */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {selectedTopic ? selectedTopic.name : `Welcome to ${selectedCourse?.courseName}`}
                    </span>
                    {selectedTopic && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedTopic.duration} min
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTopic ? (
                    <div className="bg-white rounded-lg">
                      {/* YouTube Video Embed */}
                      <div className="bg-black rounded-lg mb-4 aspect-video">
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

                      {/* Video Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            onClick={goToPreviousTopic}
                            disabled={currentTopicIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          
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
                          onClick={() => handleOpenInNewTab(selectedTopic)}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Topics */}
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
                    {selectedCourse?.topics.length || 0} topics • {selectedCourse?.totalDuration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedCourse?.topics.map((topic, index) => {
                      const isCurrent = index === currentTopicIndex;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTopicClick(topic, index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
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

                  {/* Course Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Course Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Topics:</span>
                        <span>{selectedCourse?.topics.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Duration:</span>
                        <span>{selectedCourse?.totalDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Available:</span>
                        <span>
                          <Badge variant="default" className="text-xs">
                            Yes
                          </Badge>
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleTakeExam}
                      className="w-full mt-4 flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <Award className="h-4 w-4" />
                      Take Stream Exam
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
