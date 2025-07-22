
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  Star,
  Trophy,
  Calendar,
  Clock,
  Award,
  Target,
  PlayCircle
} from 'lucide-react';
import { pack365Api } from '@/services/api';

interface StreamEnrollment {
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
  courses: Array<{
    courseId: string;
    courseName: string;
    description: string;
    totalDuration: number;
    topicsCount: number;
  }>;
}

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pack365Enrollments, setPack365Enrollments] = useState<StreamEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPack365Enrollments();
  }, []);

  const fetchPack365Enrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await pack365Api.getMyEnrollments(token);
      
      if (response.success && response.enrollments) {
        // The API returns the correct structure, so we can use it directly
        setPack365Enrollments(response.enrollments as any);
      }
    } catch (error) {
      console.error('Error fetching Pack365 enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamLearning = (stream: string) => {
    navigate(`/pack365-learning/${stream.toLowerCase()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate Pack365 stats
  const pack365Stats = {
    totalStreams: pack365Enrollments.length,
    totalCourses: pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.coursesCount, 0),
    averageProgress: pack365Enrollments.length > 0 
      ? Math.round(pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.totalWatchedPercentage, 0) / pack365Enrollments.length)
      : 0,
    completedExams: pack365Enrollments.filter(enrollment => enrollment.isExamCompleted).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Continue your learning journey with us</p>
        </div>

        <Tabs defaultValue="pack365" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pack365" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Pack365
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">3,500+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                      <p className="text-2xl font-bold text-gray-900">120+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Hours Spent Learning</p>
                      <p className="text-2xl font-bold text-gray-900">450+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-gray-900 font-medium">Completed "React Basics" Course</p>
                        <p className="text-gray-500 text-sm">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-gray-900 font-medium">Rated "JavaScript Advanced" Course 5 stars</p>
                        <p className="text-gray-500 text-sm">1 week ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pack365">
            <div className="space-y-6">
              {/* Pack365 Dashboard Button */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-6 w-6 mr-2 text-purple-600" />
                    Pack365 Learning Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Access your comprehensive Pack365 learning dashboard with detailed progress tracking.
                  </p>
                  <Button 
                    onClick={() => navigate('/pack365-dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Go to Learning Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Pack365 Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Streams</p>
                        <p className="text-2xl font-bold text-gray-900">{pack365Stats.totalStreams}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{pack365Stats.totalCourses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Average Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{pack365Stats.averageProgress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed Exams</p>
                        <p className="text-2xl font-bold text-gray-900">{pack365Stats.completedExams}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pack365 Enrollments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-6 w-6 mr-2" />
                    My Pack365 Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading your enrollments...</p>
                    </div>
                  ) : pack365Enrollments.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pack365 Enrollments</h3>
                      <p className="text-gray-500 mb-6">You haven't enrolled in any Pack365 streams yet.</p>
                      <Button onClick={() => navigate('/pack365')}>
                        Browse Pack365 Streams
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pack365Enrollments.map((enrollment, index) => (
                        <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg capitalize">{enrollment.stream} Stream</CardTitle>
                              <Badge 
                                variant={enrollment.paymentStatus === 'completed' ? 'default' : 'secondary'}
                                className={enrollment.paymentStatus === 'completed' ? 'bg-green-500' : ''}
                              >
                                {enrollment.paymentStatus}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  <span>Courses</span>
                                </div>
                                <p className="font-semibold">{enrollment.coursesCount}</p>
                              </div>
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <Target className="h-3 w-3 mr-1" />
                                  <span>Topics</span>
                                </div>
                                <p className="font-semibold">{enrollment.totalTopics}</p>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-gray-600">{Math.round(enrollment.totalWatchedPercentage)}%</span>
                              </div>
                              <Progress value={enrollment.totalWatchedPercentage} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                              </div>
                            </div>

                            <Button 
                              onClick={() => handleStreamLearning(enrollment.stream)}
                              className="w-full"
                              size="sm"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Continue Learning
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Web Development</p>
                      <p className="text-2xl font-bold text-gray-900">React</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Mobile Development</p>
                      <p className="text-2xl font-bold text-gray-900">React Native</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Backend Development</p>
                      <p className="text-2xl font-bold text-gray-900">Node JS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Achieved Badges</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Points</p>
                      <p className="text-2xl font-bold text-gray-900">1,500</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
