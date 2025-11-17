/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Play,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  User,
  GraduationCap,
  BarChart3,
  Target
} from 'lucide-react';
import { pack365Api } from '@/services/api';

interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
  _id: string;
  stream: string;
  topics: Topic[];
}

interface StreamEnrollment {
  _id: string;
  stream: string;
  amountPaid: number;
  enrollmentDate: string;
  expiresAt: string;
  paymentStatus: string;
  enrollmentType: string;
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

const Pack365Dashboard = () => {
  const [enrollments, setEnrollments] = useState<StreamEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStreams: 0,
    totalCourses: 0,
    completedStreams: 0,
    totalHours: 0,
    averageProgress: 0,
    examsCompleted: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to view your enrollments.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching Pack365 enrollments...');
      const response = await pack365Api.getMyEnrollments(token);
      
      console.log('Enrollment response received:', response);
      
      if (response.success && response.enrollments) {
        const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
        
        // Calculate accurate progress based on topic progress
        const enhancedEnrollments = streamEnrollments.map(enrollment => {
          const totalTopics = enrollment.topicProgress?.length || 0;
          const watchedTopics = enrollment.topicProgress?.filter(tp => tp.watched).length || 0;
          const accurateProgress = totalTopics > 0 ? (watchedTopics / totalTopics) * 100 : 0;

          return {
            ...enrollment,
            totalTopics,
            watchedTopics,
            totalWatchedPercentage: enrollment.totalWatchedPercentage || accurateProgress,
            coursesCount: enrollment.courses?.length || 0
          };
        });

        console.log('Enhanced enrollments:', enhancedEnrollments);
        setEnrollments(enhancedEnrollments);
        
        // Calculate comprehensive stats
        const totalStreams = enhancedEnrollments.length;
        const totalCourses = enhancedEnrollments.reduce((sum: number, enrollment: StreamEnrollment) => 
          sum + (enrollment.coursesCount || 0), 0
        );
        const completedStreams = enhancedEnrollments.filter(
          (enrollment: StreamEnrollment) => (enrollment.totalWatchedPercentage || 0) >= 100
        ).length;
        
        const totalHours = enhancedEnrollments.reduce((sum: number, enrollment: StreamEnrollment) => {
          return sum + (enrollment.courses || []).reduce((courseSum, course) => courseSum + (course.totalDuration || 0), 0);
        }, 0);
        
        const averageProgress = enhancedEnrollments.length > 0 
          ? enhancedEnrollments.reduce((sum: number, enrollment: StreamEnrollment) => sum + (enrollment.totalWatchedPercentage || 0), 0) / enhancedEnrollments.length
          : 0;
          
        const examsCompleted = enhancedEnrollments.filter(
          (enrollment: StreamEnrollment) => enrollment.isExamCompleted
        ).length;
        
        setStats({
          totalStreams,
          totalCourses,
          completedStreams,
          totalHours: Math.round(totalHours / 60),
          averageProgress: Math.round(averageProgress),
          examsCompleted
        });
        
        if (enhancedEnrollments.length === 0) {
          toast({
            title: 'No Enrollments Found',
            description: 'You haven\'t enrolled in any Pack365 streams yet. Browse available streams to get started!',
            variant: 'default'
          });
        }
      } else {
        console.log('No enrollments found or response not successful');
        setEnrollments([]);
        toast({
          title: 'No Enrollments',
          description: 'No Pack365 enrollments found. If you recently enrolled, please wait a few minutes and refresh.',
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      toast({
        title: 'Error Loading Enrollments',
        description: 'Failed to load your enrollments. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStreamLearning = (stream: string) => {
    navigate(`/pack365-learning/${stream.toLowerCase()}`);
  };

  const handleTakeExam = async (stream: string, enrollment: StreamEnrollment) => {
    const progress = enrollment.totalWatchedPercentage || 0;
    if (progress >= 80) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Check if exams are available for this stream
        const availableExamsResponse = await pack365Api.getAvailableExams(token);
        
        if (availableExamsResponse.success && availableExamsResponse.exams) {
          // Check if there are exams for courses in this stream
          const streamCourses = enrollment.courses || [];
          const streamExam = availableExamsResponse.exams.find((exam: any) => {
            return streamCourses.some(course => course._id === exam.courseId);
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
        description: `You need to complete at least 80% of the ${stream} stream to take the exam. Current progress: ${Math.round(progress)}%`,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCourseProgress = (enrollment: StreamEnrollment, courseId: string) => {
    if (!enrollment.topicProgress) return 0;
    
    const courseTopics = enrollment.topicProgress.filter(tp => tp.courseId === courseId);
    if (courseTopics.length === 0) return 0;
    
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    return (watchedTopics / courseTopics.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pack365 Dashboard</h1>
              <p className="text-gray-600">Track your learning progress and achievements</p>
            </div>
            <Button 
              onClick={fetchEnrollments}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Streams</p>
                  <p className="text-3xl font-bold">{stats.totalStreams}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="h-12 w-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Average Progress</p>
                  <p className="text-3xl font-bold">{stats.averageProgress}%</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Exams Completed</p>
                  <p className="text-3xl font-bold">{stats.examsCompleted}</p>
                </div>
                <Award className="h-12 w-12 text-yellow-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Streams */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-6 w-6 mr-2" />
              My Enrolled Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Enrollments Yet</h3>
                <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a stream.</p>
                <Button onClick={() => navigate('/pack365')}>
                  Browse Streams
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrollments.map((enrollment, index) => (
                  <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 capitalize">{enrollment.stream} Stream</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(enrollment.enrollmentDate)}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {enrollment.coursesCount} Courses
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={enrollment.totalWatchedPercentage >= 100 ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {enrollment.totalWatchedPercentage >= 100 ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Stream Progress</span>
                            <span className="text-sm text-gray-600">{Math.round(enrollment.totalWatchedPercentage)}%</span>
                          </div>
                          <Progress value={enrollment.totalWatchedPercentage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>Exam: 80%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {/* Topics Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Topics Completed</span>
                            <span className="text-sm text-gray-600">
                              {enrollment.watchedTopics} / {enrollment.totalTopics}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(enrollment.watchedTopics / enrollment.totalTopics) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Exam Status */}
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Target className="h-5 w-5 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Stream Exam</p>
                              <p className="text-xs text-gray-600">
                                {enrollment.isExamCompleted 
                                  ? `Score: ${enrollment.examScore}%` 
                                  : enrollment.totalWatchedPercentage >= 80 
                                    ? 'Ready to take exam'
                                    : `${80 - Math.round(enrollment.totalWatchedPercentage)}% more to unlock`
                                }
                              </p>
                            </div>
                          </div>
                          {!enrollment.isExamCompleted && enrollment.totalWatchedPercentage >= 80 && (
                            <Button 
                              size="sm" 
                              onClick={() => handleTakeExam(enrollment.stream, enrollment)}
                            >
                              Take Exam
                            </Button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            onClick={() => handleStreamLearning(enrollment.stream)}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {enrollment.totalWatchedPercentage === 0 ? 'Start Learning' : 'Continue Learning'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Progress Summary */}
        {enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Learning Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStreams}</div>
                  <div className="text-sm text-gray-600">Active Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.averageProgress}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
                  <div className="text-sm text-gray-600">Total Content</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/pack365')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <User className="h-4 w-4 mr-2" />
            Update Profile
          </Button>

          {enrollments.length > 0 && (
            <Button variant="outline" onClick={fetchEnrollments}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Refresh Progress
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pack365Dashboard;
