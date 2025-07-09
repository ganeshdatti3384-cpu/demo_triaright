/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Users, Clock, Star, Play, Code, FolderOpen, Settings, User, Calendar, Bell, Award, CheckCircle, Briefcase, GraduationCap, PenTool, FileText, Filter, Search } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';
import CodeCompiler from '../CodeCompiler';
import { useNavigate } from 'react-router-dom';
import CourseCards from '../CourseCards';
import { useAuth } from '../../hooks/useAuth';
import { pack365Api } from '@/services/api';



const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);

  useEffect(() => {
  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await pack365Api.getMyEnrollments(token);
      if (response.success && response.enrollments) {
        setEnrolledCourses(response.enrollments.filter((e: any) => e.status === 'enrolled'));
        setCompletedCourses(response.enrollments.filter((e: any) => e.status === 'completed'));
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  fetchEnrollments();
}, []);
console.log(user.id)

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
          <>
          <Navbar />
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || user?.firstName || 'Student'}!</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
          </div>
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
          <TabsList className="grid w-full grid-cols-9 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="trainings">Trainings</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="compiler">Compiler</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
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
            <Tabs defaultValue="my-courses" className="space-y-4">
              <TabsList className="bg-white">
                <TabsTrigger value="my-courses">My Courses</TabsTrigger>
                <TabsTrigger value="browse-courses">Browse Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="my-courses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Enrolled Courses</CardTitle>
                    <CardDescription>Continue your learning journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {enrolledCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map((course, index) => (
                          <Card key={index} className="hover:shadow-md transition-shadow border-blue-200">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Badge className="bg-blue-500 text-white">Enrolled</Badge>
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
                                <Button 
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                  onClick={() => navigate(`/course-learning/${course.courseId || course.id}`)}
                                >
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
                        <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                        <Button onClick={() => navigate('/courses/recorded')} className="bg-blue-600 hover:bg-blue-700">
                          Browse Courses
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {completedCourses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Courses</CardTitle>
                      <CardDescription>Your learning achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedCourses.map((course, index) => (
                          <Card key={index} className="hover:shadow-md transition-shadow border-green-200">
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
                                <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
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

              <TabsContent value="browse-courses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 mr-2 text-blue-600" />
                      Browse Courses
                    </CardTitle>
                    <CardDescription>Discover new courses to enhance your skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-blue-600" />
                        <Button variant="outline" size="sm" className="border-blue-200">Free</Button>
                        <Button variant="outline" size="sm" className="border-blue-200">Paid</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Category:</span>
                        <Button variant="outline" size="sm" className="border-blue-200">Programming</Button>
                        <Button variant="outline" size="sm" className="border-blue-200">Design</Button>
                        <Button variant="outline" size="sm" className="border-blue-200">Business</Button>
                      </div>
                    </div>
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Course catalog coming soon!</p>
                      <Button onClick={() => navigate('/courses/recorded')} className="bg-blue-600 hover:bg-blue-700">
                        View Available Courses
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <Pack365Card />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Tabs defaultValue="job-assurance" className="space-y-4">
              <TabsList className="bg-white">
                <TabsTrigger value="job-assurance">Job Assurance</TabsTrigger>
                <TabsTrigger value="job-assistance">Job Assistance</TabsTrigger>
              </TabsList>

              <TabsContent value="job-assurance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                      Job Assurance Program
                    </CardTitle>
                    <CardDescription>100% job guarantee programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Job assurance programs available soon!</p>
                      <Button onClick={() => navigate('/job-assurance')} className="bg-blue-600 hover:bg-blue-700">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="job-assistance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Job Assistance Program
                    </CardTitle>
                    <CardDescription>Career guidance and placement support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Career assistance services available!</p>
                      <Button onClick={() => navigate('/job-assistance')} className="bg-blue-600 hover:bg-blue-700">
                        Get Assistance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <Tabs defaultValue="online" className="space-y-4">
              <TabsList className="bg-white">
                <TabsTrigger value="online">Online Internships</TabsTrigger>
                <TabsTrigger value="offline">Offline Internships</TabsTrigger>
              </TabsList>

              <TabsContent value="online" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Online Internships
                    </CardTitle>
                    <CardDescription>Remote internship opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Online internship programs coming soon!</p>
                      <Button onClick={() => navigate('/online-internships')} className="bg-blue-600 hover:bg-blue-700">
                        View Opportunities
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="offline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-600" />
                      Offline Internships
                    </CardTitle>
                    <CardDescription>On-site internship opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Offline internship programs available!</p>
                      <Button onClick={() => navigate('/offline-internships')} className="bg-blue-600 hover:bg-blue-700">
                        Find Internships
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="trainings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                  Training Programs
                </CardTitle>
                <CardDescription>CRT and Technical Training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200">
                    <CardContent className="p-6 text-center">
                      <PenTool className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">CRT Training</h3>
                      <p className="text-sm text-gray-600 mb-4">Campus Recruitment Training</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">Start Training</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardContent className="p-6 text-center">
                      <Code className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Technical Training</h3>
                      <p className="text-sm text-gray-600 mb-4">Advanced technical skills</p>
                      <Button className="bg-blue-600 hover:bg-blue-700">Explore</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  My Exams
                </CardTitle>
                <CardDescription>Track your exam progress and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No exams scheduled yet.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">View Available Exams</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compiler" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Code Compiler</span>
                </CardTitle>
                <CardDescription>Practice coding with our online compiler</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeCompiler />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>My Projects</span>
                </CardTitle>
                <CardDescription>Manage your coding projects and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Create New Project</h3>
                      <p className="text-sm text-gray-500 mb-4">Start a new coding project</p>
                      <Button>Create Project</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Todo App</h3>
                        <Badge variant="outline">React</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">A simple todo application with CRUD operations</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Calculator</h3>
                        <Badge variant="outline">JavaScript</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Basic calculator with arithmetic operations</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  User Profile
                </CardTitle>
                <CardDescription>View and manage your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Access your complete profile here.</p>
                  <Button onClick={() => navigate('/profile')} className="bg-blue-600 hover:bg-blue-700">
                    View Full Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div></>
  );
};

export default StudentDashboard;