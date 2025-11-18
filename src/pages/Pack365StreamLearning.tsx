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
  Target
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// --- Interfaces for Type Safety ---
interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
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

// --- Helper Components ---
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
        {/* Header Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-48"></div>
          </div>
          {/* Courses Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
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
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchStreamEnrollment = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch enrollments
        const response = await pack365Api.getMyEnrollments(token);
        
        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => e.stream.toLowerCase() === stream?.toLowerCase()
          );

          if (currentEnrollment) {
            // Fetch all courses to get complete course data
            const coursesResponse = await pack365Api.getAllCourses();
            if (coursesResponse.success && coursesResponse.data) {
              const streamCourses = coursesResponse.data.filter(
                (course: Course) => course.stream.toLowerCase() === stream?.toLowerCase()
              );
              setAllCourses(streamCourses);
              
              // Calculate accurate progress
              let totalWatchedTopics = 0;
              let totalTopicsInStream = 0;

              streamCourses.forEach(course => {
                const courseTopics = course.topics?.length || 0;
                totalTopicsInStream += courseTopics;
                
                // Count watched topics for this course
                const watchedInCourse = (currentEnrollment.topicProgress || []).filter((tp: any) => 
                  String(tp.courseId) === String(course._id) && tp.watched
                ).length || 0;
                
                totalWatchedTopics += watchedInCourse;
              });

              const accurateProgress = totalTopicsInStream > 0 ? 
                (totalWatchedTopics / totalTopicsInStream) * 100 : 0;

              // Enhance enrollment with accurate data
              const enhancedEnrollment = {
                ...currentEnrollment,
                courses: streamCourses,
                totalTopics: totalTopicsInStream,
                watchedTopics: totalWatchedTopics,
                totalWatchedPercentage: accurateProgress,
                coursesCount: streamCourses.length
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
      }
    };

    fetchStreamEnrollment();
  }, [stream]);

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

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream to take the exam.',
        variant: 'destructive'
      });
    }
  };

  const handleTakeFinalExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 100) {
      navigate(`/exam/${stream}/final`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete 100% of the stream to take the final exam.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const getCourseProgress = (courseId: string) => {
    if (!enrollment?.topicProgress) return 0;
    
    const courseTopics = (enrollment.topicProgress || []).filter(tp => 
      String(tp.courseId) === String(courseId)
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
        <div className="text-center">
          <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Enrollment Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find your enrollment details for this stream.</p>
          <Button onClick={() => navigate('/pack365')}>Browse Streams</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- Left Sidebar (Sticky) --- */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CircularProgress percentage={enrollment.totalWatchedPercentage || 0} />
                  <p className="text-gray-600 mt-4">Overall Completion</p>
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Topics Completed</span>
                      <span>{enrollment.watchedTopics || 0} / {enrollment.totalTopics || 0}</span>
                    </div>
                    <Progress value={enrollment.totalTopics ? ((enrollment.watchedTopics / enrollment.totalTopics) * 100) : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                   <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4"/>Enrolled On</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.enrollmentDate)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookOpen className="h-4 w-4"/>Total Courses</span>
                      <span className="font-semibold text-gray-800">{enrollment.coursesCount}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookCopy className="h-4 w-4"/>Topics Completed</span>
                      <span className="font-semibold text-gray-800">{enrollment.watchedTopics} / {enrollment.totalTopics}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Users className="h-4 w-4"/>Access Until</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.expiresAt)}</span>
                   </div>
                </CardContent>
              </Card>
              
              {/* Exam Eligibility Cards */}
              {enrollment.totalWatchedPercentage >= 80 && (
                <Card className="shadow-md bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6"/>
                      Ready for Exam!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-green-100">
                      You've completed enough of the stream to take the exam.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-green-600 hover:bg-green-50"
                      onClick={handleTakeExam}
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}

              {enrollment.totalWatchedPercentage >= 100 && (
                <Card className="shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6"/>
                      Final Exam Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-purple-100">
                      You've completed all courses! Take the final comprehensive exam.
                    </p>
                    <Button 
                      variant="secondary" 
                      className="w-full bg-white text-purple-600 hover:bg-purple-50"
                      onClick={handleTakeFinalExam}
                    >
                      Take Final Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>

            {/* --- Right Content (Course List) --- */}
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
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-800 text-lg">{course.courseName}</h3>
                                <Badge variant={courseProgress === 100 ? "default" : "secondary"}>
                                  {courseProgress === 100 ? 'Completed' : `${Math.round(courseProgress)}%`}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" /> 
                                  {course.totalDuration} minutes
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="h-4 w-4" /> 
                                  {course.topics?.length || 0} topics
                                </span>
                                {course.documentLink && (
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" /> 
                                    Resources
                                  </span>
                                )}
                              </div>

                              {/* Course Progress */}
                              <div className="w-full">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{Math.round(courseProgress)}%</span>
                                </div>
                                <Progress value={courseProgress} className="h-2" />
                              </div>
                            </div>
                            
                            <Button 
                              onClick={() => handleCourseStart(course)}
                              className="w-full sm:w-auto flex-shrink-0"
                              variant={courseProgress === 100 ? "outline" : "default"}
                            >
                              {courseProgress === 100 ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Completed
                                </>
                              ) : courseProgress > 0 ? (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Learning
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Available</h3>
                      <p className="text-gray-500">Courses for this stream are being prepared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stream Progress Summary */}
              <Card className="shadow-md mt-6">
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
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365StreamLearning;
