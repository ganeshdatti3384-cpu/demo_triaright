import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Award,
  BookCopy,
  BarChart3,
  Users,
  FileText,
  Target,
  Video,
  X,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// Types
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
  totalDuration: number;
  topics: Topic[];
  documentLink?: string;
  stream: string;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface Enrollment {
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  totalWatchedPercentage: number;
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Course[];
  topicProgress: TopicProgress[];
}

const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  // Fetch enrollment data
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: 'Authentication Required', variant: 'destructive' });
          navigate('/login');
          return;
        }

        const response = await pack365Api.getMyEnrollments(token);
        
        if (response.success && response.enrollments) {
          const enrollments = response.enrollments as Enrollment[];
          const currentEnrollment = enrollments.find(e => 
            e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            setEnrollment(currentEnrollment);
          } else {
            toast({ 
              title: 'Access Denied', 
              description: 'You are not enrolled in this stream.', 
              variant: 'destructive' 
            });
            navigate('/pack365');
          }
        }
      } catch (error: any) {
        console.error('Error fetching enrollment:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load enrollment details.', 
          variant: 'destructive' 
        });
        navigate('/pack365');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [stream, navigate, toast]);

  // Handle topic video play
  const handleTopicPlay = async (course: Course, topic: Topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgress(0);
    setIsTracking(true);

    // Start progress tracking simulation
    const duration = topic.duration > 1000 ? topic.duration : topic.duration * 60;
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        handleTopicComplete(course, topic, duration);
      }
      setVideoProgress(progress);
    }, 1000);
  };

  // Handle topic completion
  const handleTopicComplete = async (course: Course, topic: Topic, duration: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = {
        courseId: course._id,
        topicName: topic.name,
        watchedDuration: duration,
        totalCourseDuration: enrollment?.courses.reduce((sum, c) => sum + c.totalDuration, 0) || 0
      };

      const response = await pack365Api.updateTopicProgress(token, payload);
      
      if (response.success) {
        // Update local state
        setEnrollment(prev => {
          if (!prev) return prev;
          
          const updatedProgress = [...prev.topicProgress];
          const existingIndex = updatedProgress.findIndex(
            tp => tp.courseId === course._id && tp.topicName === topic.name
          );

          const newProgress: TopicProgress = {
            courseId: course._id,
            topicName: topic.name,
            watched: true,
            watchedDuration: duration
          };

          if (existingIndex >= 0) {
            updatedProgress[existingIndex] = newProgress;
          } else {
            updatedProgress.push(newProgress);
          }

          // Recalculate watched percentage
          const totalTopics = prev.courses.reduce((sum, c) => sum + c.topics.length, 0);
          const watchedTopics = updatedProgress.filter(tp => tp.watched).length;
          const totalWatchedPercentage = totalTopics > 0 ? (watchedTopics / totalTopics) * 100 : 0;

          return {
            ...prev,
            topicProgress: updatedProgress,
            watchedTopics,
            totalWatchedPercentage
          };
        });

        toast({
          title: 'Topic Completed!',
          description: `"${topic.name}" has been marked as completed.`,
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTracking(false);
    }
  };

  // Get topic progress
  const getTopicProgress = (courseId: string, topicName: string) => {
    return enrollment?.topicProgress.find(
      tp => tp.courseId === courseId && tp.topicName === topicName
    );
  };

  // Check if course is eligible for exam (80% completion)
  const isCourseEligibleForExam = (course: Course) => {
    const courseTopics = course.topics || [];
    const completedTopics = enrollment?.topicProgress.filter(
      tp => tp.courseId === course._id && tp.watched
    ) || [];
    
    return courseTopics.length > 0 && (completedTopics.length / courseTopics.length) >= 0.8;
  };

  // Check if stream is eligible for final exam (100% completion)
  const isStreamEligibleForFinalExam = () => {
    return enrollment?.totalWatchedPercentage >= 100;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading stream data...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Enrollment Not Found</h2>
          <Button onClick={() => navigate('/pack365')}>Back to Streams</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Video Learning Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTopic?.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedTopic?.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCourse?.courseName} • {selectedTopic && formatDuration(selectedTopic.duration)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {selectedTopic && (
              <>
                {/* Video Player Container */}
                <div className="flex-1 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg mb-2">Video Player</p>
                    <p className="text-sm text-gray-300 mb-4">
                      Playing: {selectedTopic.name}
                    </p>
                    <Button
                      onClick={() => window.open(selectedTopic.link, '_blank')}
                      variant="secondary"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Learning Progress</span>
                    <span className="text-sm text-gray-600">{videoProgress}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2 mb-4" />

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {isTracking ? (
                        <span className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Tracking your progress...
                        </span>
                      ) : videoProgress >= 100 ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Completed!
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          Start watching to track progress
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        if (selectedCourse && selectedTopic) {
                          const duration = selectedTopic.duration > 1000 ? 
                            selectedTopic.duration : selectedTopic.duration * 60;
                          handleTopicComplete(selectedCourse, selectedTopic, duration);
                        }
                      }}
                      disabled={isTracking}
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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{stream} Stream</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {Math.round(enrollment.totalWatchedPercentage)}%
                      </span>
                    </div>
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-blue-600"
                        strokeDasharray={376.8}
                        strokeDashoffset={376.8 - (376.8 * enrollment.totalWatchedPercentage) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mt-4 text-center">Overall Completion</p>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Enrolled On
                    </span>
                    <span className="font-semibold">{formatDate(enrollment.enrollmentDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Total Courses
                    </span>
                    <span className="font-semibold">{enrollment.coursesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookCopy className="h-4 w-4" />
                      Topics Completed
                    </span>
                    <span className="font-semibold">
                      {enrollment.watchedTopics} / {enrollment.totalTopics}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Access Until
                    </span>
                    <span className="font-semibold">{formatDate(enrollment.expiresAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Eligibility Cards */}
              {enrollment.totalWatchedPercentage >= 80 && (
                <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Ready for Exam!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-green-100 text-sm">
                      You've completed enough of the stream to take the exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-green-600 hover:bg-green-50"
                      onClick={() => navigate(`/exam/${stream}`)}
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}

              {enrollment.totalWatchedPercentage >= 100 && (
                <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Final Exam Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-purple-100 text-sm">
                      You've completed all courses! Take the final comprehensive exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-purple-600 hover:bg-purple-50"
                      onClick={() => navigate(`/exam/${stream}/final`)}
                    >
                      Take Final Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Courses List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>
                    Select a course to start learning and track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrollment.courses.map((course) => {
                    const courseTopics = course.topics || [];
                    const completedTopics = enrollment.topicProgress.filter(
                      tp => tp.courseId === course._id && tp.watched
                    );
                    const courseProgress = courseTopics.length > 0 ? 
                      (completedTopics.length / courseTopics.length) * 100 : 0;

                    return (
                      <div
                        key={course._id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                {course.courseName}
                              </h3>
                              <div className="flex items-center gap-2">
                                {isCourseEligibleForExam(course) && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Exam Ready
                                  </Badge>
                                )}
                                <Badge variant="secondary">
                                  {courseTopics.length} topics
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">
                              {course.description}
                            </p>

                            {/* Course Progress */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Course Progress</span>
                                <span className="font-medium">{Math.round(courseProgress)}%</span>
                              </div>
                              <Progress value={courseProgress} className="h-2" />
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {formatDuration(course.totalDuration)}
                              </span>
                              {course.documentLink && (
                                <span className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4" />
                                  Study Materials
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => {
                              setSelectedCourse(course);
                              // You can navigate to course detail page or open modal
                              // For now, we'll show topics in a modal-like interface
                            }}
                            className="w-full sm:w-auto flex-shrink-0"
                            variant="default"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Learning
                          </Button>
                        </div>

                        {/* Topics List */}
                        {selectedCourse?._id === course._id && (
                          <div className="mt-6 space-y-3">
                            <h4 className="font-medium text-gray-700">Topics</h4>
                            {courseTopics.map((topic, index) => {
                              const progress = getTopicProgress(course._id, topic.name);
                              const isWatched = progress?.watched || false;

                              return (
                                <div
                                  key={index}
                                  className={`p-3 border rounded-lg transition-colors ${
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
                                        <Play className="h-5 w-5 text-gray-400" />
                                      )}
                                      <div>
                                        <h5 className="font-medium text-sm">{topic.name}</h5>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                          <span>{formatDuration(topic.duration)}</span>
                                          {isWatched && (
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                              Completed
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant={isWatched ? "outline" : "default"}
                                      size="sm"
                                      onClick={() => handleTopicPlay(course, topic)}
                                    >
                                      <Video className="h-4 w-4 mr-1" />
                                      {isWatched ? 'Review' : 'Watch'}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Stream Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Stream Completion Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Minimum completion for exam:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 80 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 80 ? 'Eligible' : '80% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current progress:</span>
                      <span className="text-sm font-medium">{Math.round(enrollment.totalWatchedPercentage)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Final exam eligibility:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 100 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 100 ? 'Eligible' : '100% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exam status:</span>
                      <Badge variant={enrollment.isExamCompleted ? "default" : "outline"}>
                        {enrollment.isExamCompleted ? `Completed (${enrollment.examScore}%)` : 'Not Taken'}
                      </Badge>
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

export default Pack365StreamLearning;
