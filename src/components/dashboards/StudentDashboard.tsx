/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Calendar, Users, Clock, Star, LogOut, Bell, Play, Award, CheckCircle, FolderOpen, Code, Settings } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';
import { useNavigate } from 'react-router-dom';
import CodeCompiler from '../CodeCompiler';

interface StudentDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}


const StudentDashboard = ({ user: propUser, onLogout }: StudentDashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  useEffect(() => {
    // Use prop user if provided, otherwise get from localStorage
    if (propUser) {
      setUser(propUser);
    } else {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        setUser(JSON.parse(currentUser));
      }
    }
  }, [propUser]);
  useEffect(() => {
    // Load enrolled courses from localStorage
    const savedEnrollments = localStorage.getItem('courseEnrollments');
    if (savedEnrollments) {
      const enrollments = JSON.parse(savedEnrollments);
      setEnrolledCourses(enrollments.filter((e: any) => e.status === 'enrolled'));
      setCompletedCourses(enrollments.filter((e: any) => e.status === 'completed'));
    }
  }, []);
  console.log(propUser)

  const courses = [
    { id: 1, name: 'React Fundamentals', progress: 75, status: 'in-progress', price: '₹2,999' },
    { id: 2, name: 'JavaScript Advanced', progress: 100, status: 'completed', price: '₹1,999' },
    { id: 3, name: 'Node.js Backend', progress: 30, status: 'in-progress', price: '₹3,499' },
  ];

  const achievements = [
    { id: 1, title: 'First Course Completed', description: 'Completed your first course', date: '2024-01-15' },
    { id: 2, title: 'Quick Learner', description: 'Completed 3 lessons in one day', date: '2024-01-10' },
    { id: 3, title: 'Consistent Student', description: '7-day learning streak', date: '2024-01-08' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'React Live Session', date: '2024-01-25', time: '7:00 PM', type: 'live-class' },
    { id: 2, title: 'JavaScript Quiz', date: '2024-01-27', time: '6:00 PM', type: 'assessment' },
    { id: 3, title: 'Career Guidance Workshop', date: '2024-01-30', time: '5:00 PM', type: 'workshop' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="compiler">Compiler</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <Button onClick={() => navigate ('/courses/recorded')}>
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

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" className="w-full p-2 border rounded-md" defaultValue={user.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" className="w-full p-2 border rounded-md" defaultValue="student@example.com" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span>Course updates</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Assignment reminders</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
