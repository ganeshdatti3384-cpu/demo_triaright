/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  BarChart2,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount?: number;
  _id: string;
  stream: string;
  topics: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  documentLink?: string;
}

interface StreamEnrollment {
  _id: string;
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
  topicProgress: Array<{
    courseId: string;
    topicName: string;
    watched: boolean;
    watchedDuration: number;
  }>;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div className="relative w-32 h-32">
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="text-gray-200"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          stroke="currentColor"
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            strokeLinecap: 'round',
          }}
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-48"></div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStreamEnrollment();
    
    // ✅ Add visibility change listener to refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStreamEnrollment();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stream]);

  const fetchStreamEnrollment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // ✅ Fetch fresh enrollment data
      const enrollmentsResponse = await pack365Api.getMyEnrollments(token);

      if (enrollmentsResponse.success && enrollmentsResponse.enrollments) {
        const currentEnrollment = enrollmentsResponse.enrollments.find(
          (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );

        if (currentEnrollment) {
          // ✅ Enhance with courses if needed
          if (currentEnrollment.courses && currentEnrollment.courses.length > 0) {
            const enhancedEnrollment: StreamEnrollment = {
              _id: currentEnrollment._id,
              stream: currentEnrollment.stream,
              enrollmentDate: currentEnrollment.enrollmentDate,
              expiresAt: currentEnrollment.expiresAt,
              totalWatchedPercentage: currentEnrollment.totalWatchedPercentage || 0,
              isExamCompleted: currentEnrollment.isExamCompleted || false,
              examScore: currentEnrollment.examScore || null,
              coursesCount: currentEnrollment.coursesCount || currentEnrollment.courses.length,
              totalTopics: currentEnrollment.totalTopics || 0,
              watchedTopics: currentEnrollment.watchedTopics || 0,
              courses: currentEnrollment.courses,
              topicProgress: currentEnrollment.topicProgress || []
            };
            setEnrollment(enhancedEnrollment);
          } else {
            setEnrollment(currentEnrollment);
          }
        } else {
          toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
          navigate('/pack365');
        }
      } else {
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
        navigate('/pack365');
      }
    } catch (error: any) {
      console.error('Error fetching stream enrollment:', error);
      toast({ title: 'Error', description: 'Failed to load enrollment details.', variant: 'destructive' });
      navigate('/pack365');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStreamEnrollment();
    toast({
      title: 'Refreshed',
      description: 'Your progress has been updated.',
      variant: 'default'
    });
  };

  const handleCourseStart = (course: Course) => {
    navigate(`/pack365-learning/${stream}/course`, { 
      state: { 
        selectedCourse: course,
        selectedCourseId: course.courseId,
        streamName: stream,
        enrollment: enrollment
      } 
    });
  };

  const handleTakeExam = async () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const availableExamsResponse = await pack365Api.getAvailableExams(token);
        
        if (availableExamsResponse.success && availableExamsResponse.exams) {
          const streamExam = availableExamsResponse.exams.find((exam: any) => {
            return enrollment.courses.some(course => course._id === exam.courseId);
          });
          
          if (streamExam) {
            navigate(`/exam/${stream}`);
          } else {
            toast({
              title: 'No Exams Available',
              description: 'No exams are available for this stream yet. Please check back later.',
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'No Exams Available',
            description: 'No exams are available for this stream yet. Please check back later.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error checking exams:', error);
        toast({
          title: 'Error',
          description: 'Failed to check exam availability. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream to take the exam.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const getCourseProgress = (courseId: string) => {
    if (!enrollment?.topicProgress) return 0;
    
    // ✅ FIXED: Compare ObjectId strings properly
    const courseTopics = enrollment.topicProgress.filter(
      tp => String(tp.courseId) === String(courseId)
    );
    
    if (courseTopics.length === 0) return 0;
    
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    return (watchedTopics / courseTopics.length) * 100;
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You are not enrolled in this stream.</p>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button 
                onClick={() => navigate('/pack365')}
                variant="outline"
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-bold text-gray-900 capitalize">{stream} Stream</h1>
              <p className="text-gray-600 mt-2">Continue your learning journey</p>
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <aside className="lg:col-span-1 space-y-6">
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6"/>
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center">
                  <CircularProgress percentage={enrollment.totalWatchedPercentage} />
                  <p className="text-center mt-4 text-sm text-gray-600">Overall Completion</p>
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <BookCopy className="h-4 w-4"/>
                        Courses
                      </span>
                      <span className="font-medium">{enrollment.coursesCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <FileText className="h-4 w-4"/>
                        Topics
                      </span>
                      <span className="font-medium">{enrollment.watchedTopics} / {enrollment.totalTopics}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Calendar className="h-5 w-5"/>
                      Enrollment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Enrolled On</p>
                      <p className="font-medium text-gray-800">{formatDate(enrollment.enrollmentDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expires On</p>
                      <p className="font-medium text-gray-800">{formatDate(enrollment.expiresAt)}</p>
                    </div>
                </CardContent>
              </Card>
              
              <Card className={`shadow-md ${
                enrollment.isExamCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : enrollment.totalWatchedPercentage >= 80 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                  <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        enrollment.isExamCompleted ? 'text-green-800' : 
                        enrollment.totalWatchedPercentage >= 80 ? 'text-white' : 'text-yellow-800'
                      }`}>
                        <Award className="h-6 w-6"/>
                        {enrollment.isExamCompleted ? 'Exam Completed' : 
                         enrollment.totalWatchedPercentage >= 80 ? 'Ready for Exam' : 'Exam Status'}
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      {enrollment.isExamCompleted ? (
                        <>
                          <p className="mb-2 text-green-700">
                            Congratulations! You passed the exam with a score of {enrollment.examScore}%.
                          </p>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Exam Completed
                          </Badge>
                        </>
                      ) : enrollment.totalWatchedPercentage >= 80 ? (
                        <>
                          <p className="mb-4 text-green-100">
                            You've completed enough of the stream to take the final exam. Good luck!
                          </p>
                          <Button 
                            variant="secondary" 
                            className="w-full bg-white text-green-600 hover:bg-green-50"
                            onClick={handleTakeExam}
                          >
                            Take Stream Exam
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="mb-2 text-yellow-700">
                            Complete {80 - Math.round(enrollment.totalWatchedPercentage)}% more to unlock the exam.
                          </p>
                          <div className="w-full bg-yellow-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.totalWatchedPercentage}%` }}
                            />
                          </div>
                        </>
                      )}
                  </CardContent>
              </Card>
            </aside>

            <main className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>Select a course below to start learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrollment.courses && enrollment.courses.length > 0 ? (
                    enrollment.courses.map((course) => {
                      const courseProgress = getCourseProgress(course._id);
                      
                      return (
                        <div key={course.courseId} className="border bg-white rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.courseName}</h3>
                              <p className="text-gray-600 mb-4">{course.description}</p>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4"/>
                                  <span>{course.topics?.length || 0} topics</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4"/>
                                  <span>{course.totalDuration} minutes</span>
                                </div>
                              </div>

                              <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                                  <span className="text-sm text-gray-600">{Math.round(courseProgress)}%</span>
                                </div>
                                <Progress value={courseProgress} className="h-2" />
                              </div>
                            </div>

                            <Button 
                              onClick={() => handleCourseStart(course)}
                              className="w-full sm:w-auto"
                            >
                              <Play className="h-4 w-4 mr-2"/>
                              {courseProgress > 0 ? 'Continue' : 'Start'} Learning
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No courses available yet</p>
                      <p className="text-sm">Please check back later</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pack365StreamLearning;
