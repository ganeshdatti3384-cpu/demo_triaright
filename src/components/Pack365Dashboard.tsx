
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
  GraduationCap
} from 'lucide-react';
import { pack365Api } from '@/services/api';

interface EnrollmentData {
  _id: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  videoProgress: number;
  isExamCompleted: boolean;
  examScore: number | null;
  topicProgress: {
    topicName: string;
    watched: boolean;
    watchedDuration: number;
  }[];
}

const Pack365Dashboard = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificatesEarned: 0
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
      const response = await pack365Api.getMyEnrollments(token);
      
      if (response.success && response.enrollments) {
        setEnrollments(response.enrollments);
        
        // Calculate stats
        const totalCourses = response.enrollments.length;
        const completedCourses = response.enrollments.filter(
          (enrollment: EnrollmentData) => enrollment.videoProgress >= 100
        ).length;
        const certificatesEarned = response.enrollments.filter(
          (enrollment: EnrollmentData) => enrollment.isExamCompleted && enrollment.examScore && enrollment.examScore >= 70
        ).length;
        
        setStats({
          totalCourses,
          completedCourses,
          totalHours: totalCourses * 20, // Estimate
          certificatesEarned
        });
      }
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your enrollments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCourse = (courseId: string) => {
    navigate(`/course-learning/${courseId}`);
  };

  const handleTakeExam = (courseId: string) => {
    navigate(`/exam/${courseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pack365 Dashboard</h1>
          <p className="text-gray-600">Track your learning progress and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedCourses}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Learning Hours</p>
                  <p className="text-3xl font-bold">{stats.totalHours}</p>
                </div>
                <Clock className="h-12 w-12 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Certificates</p>
                  <p className="text-3xl font-bold">{stats.certificatesEarned}</p>
                </div>
                <Award className="h-12 w-12 text-yellow-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-6 w-6 mr-2" />
              My Enrolled Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Enrollments Yet</h3>
                <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course.</p>
                <Button onClick={() => navigate('/pack365')}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment._id} className="border-2 hover:border-blue-200 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{enrollment.courseName}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(enrollment.enrollmentDate)}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={enrollment.videoProgress >= 100 ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {enrollment.videoProgress >= 100 ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Course Progress</span>
                            <span className="text-sm text-gray-600">{Math.round(enrollment.videoProgress)}%</span>
                          </div>
                          <Progress value={enrollment.videoProgress} className="h-2" />
                        </div>

                        {/* Topics Progress */}
                        {enrollment.topicProgress && enrollment.topicProgress.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Topics Completed</span>
                              <span className="text-sm text-gray-600">
                                {enrollment.topicProgress.filter(t => t.watched).length} / {enrollment.topicProgress.length}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {enrollment.topicProgress.slice(0, 6).map((topic, index) => (
                                <div
                                  key={index}
                                  className={`w-3 h-3 rounded-full ${
                                    topic.watched ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                  title={topic.topicName}
                                />
                              ))}
                              {enrollment.topicProgress.length > 6 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{enrollment.topicProgress.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Exam Status */}
                        {enrollment.videoProgress >= 80 && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <Award className="h-5 w-5 text-blue-600 mr-2" />
                              <div>
                                <p className="text-sm font-medium">Final Exam</p>
                                <p className="text-xs text-gray-600">
                                  {enrollment.isExamCompleted 
                                    ? `Score: ${enrollment.examScore}%` 
                                    : 'Ready to take exam'
                                  }
                                </p>
                              </div>
                            </div>
                            {!enrollment.isExamCompleted && (
                              <Button 
                                size="sm" 
                                onClick={() => handleTakeExam(enrollment.courseId)}
                              >
                                Take Exam
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            onClick={() => handleResumeCourse(enrollment.courseId)}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {enrollment.videoProgress === 0 ? 'Start Course' : 'Resume Course'}
                          </Button>
                          
                          {enrollment.isExamCompleted && enrollment.examScore && enrollment.examScore >= 70 && (
                            <Button variant="outline" size="sm">
                              <Award className="h-4 w-4 mr-1" />
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
        </div>
      </div>
    </div>
  );
};

export default Pack365Dashboard;
