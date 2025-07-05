
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Award, Clock, Users, TrendingUp, Star, ArrowRight, Play, CheckCircle } from 'lucide-react';
import Navbar from '../Navbar';
import CourseCards from '../CourseCards';
import Pack365Card from '../Pack365Card';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: {
    role: string;
    name: string;
  };
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);

  useEffect(() => {
    // Load enrolled courses from localStorage
    const savedEnrollments = localStorage.getItem('courseEnrollments');
    if (savedEnrollments) {
      const enrollments = JSON.parse(savedEnrollments);
      setEnrolledCourses(enrollments.filter((e: any) => e.status === 'enrolled'));
      setCompletedCourses(enrollments.filter((e: any) => e.status === 'completed'));
    }
  }, []);

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed Courses',
      value: completedCourses.length.toString(),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Study Hours',
      value: '48',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Certificates',
      value: completedCourses.length.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onOpenAuth={() => {}} userRole="student" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="all-courses">Browse Courses</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump back into your learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="flex items-center justify-center space-x-2 h-12">
                    <Play className="h-4 w-4" />
                    <span>Resume Last Course</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
                    <BookOpen className="h-4 w-4" />
                    <span>Browse New Courses</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
                    <Award className="h-4 w-4" />
                    <span>View Certificates</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pack365 Highlight */}
            <Pack365Card />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{course.courseName || 'Course Name'}</p>
                          <p className="text-sm text-gray-600">Last accessed 2 days ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                    </div>
                  ))}
                  {enrolledCourses.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recent activity. Start learning today!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {/* Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle>My Enrolled Courses</CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Enrolled</Badge>
                              <span className="text-sm text-gray-500">{course.enrollmentDate}</span>
                            </div>
                            <h3 className="font-semibold">{course.courseName}</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>45%</span>
                              </div>
                              <Progress value={45} className="h-2" />
                            </div>
                            <Button className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              Continue Learning
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                    <Button onClick={() => navigate('/courses/recorded')}>
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Courses</CardTitle>
                  <CardDescription>Your learning achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                              <Award className="h-5 w-5 text-yellow-500" />
                            </div>
                            <h3 className="font-semibold">{course.courseName}</h3>
                            <p className="text-sm text-gray-600">Completed on {course.completionDate}</p>
                            <Button variant="outline" className="w-full">
                              View Certificate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all-courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse All Courses</CardTitle>
                <CardDescription>Discover new learning opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <CourseCards onCourseClick={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pack365 - Your Complete Learning Journey</h2>
              <p className="text-lg text-gray-600">Get access to all premium content for an entire year</p>
            </div>
            
            <Pack365Card />
            
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Pack365?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">All Courses Included</h3>
                    <p className="text-sm text-gray-600">Access to every course in our catalog</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Personal Mentorship</h3>
                    <p className="text-sm text-gray-600">1-on-1 guidance from industry experts</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Job Placement</h3>
                    <p className="text-sm text-gray-600">Career support and job placement assistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
