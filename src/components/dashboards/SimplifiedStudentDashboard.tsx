
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, BookOpen, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import Navbar from '../Navbar';

interface EnrolledCourse {
  courseId: string;
  title: string;
  instructor: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  currentLesson?: string;
  totalLessons?: number;
  completedLessons?: number;
}

interface SimplifiedStudentDashboardProps {
  user: {
    role: string;
    name: string;
  };
  onLogout: () => void;
}

const SimplifiedStudentDashboard = ({ user, onLogout }: SimplifiedStudentDashboardProps) => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setCurrentUser(JSON.parse(currentUser));
    }

    const courses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    const coursesWithProgress = courses.map((course: EnrolledCourse) => ({
      ...course,
      progress: course.progress || Math.floor(Math.random() * 100),
      currentLesson: course.currentLesson || 'Introduction to Basics',
      totalLessons: course.totalLessons || Math.floor(Math.random() * 20) + 10,
      completedLessons: course.completedLessons || Math.floor(Math.random() * 15),
      completed: course.completed || Math.random() > 0.7
    }));
    setEnrolledCourses(coursesWithProgress);
  }, []);

  const completedCourses = enrolledCourses.filter(course => course.completed);
  const inProgressCourses = enrolledCourses.filter(course => !course.completed);
  const totalProgress = enrolledCourses.length > 0 
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.name || currentUser?.firstName || currentUser?.name || 'Student'}!
            </h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{inProgressCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inProgressCourses.slice(0, 4).map((course) => (
                      <div key={course.courseId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">by {course.instructor}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                        <Button className="w-full mt-3" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedCourses.slice(0, 3).map((course) => (
                      <div key={course.courseId} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Completed: {course.title}</p>
                          <p className="text-sm text-gray-600">Finished on {new Date(course.enrolledAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600">by {course.instructor}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant={course.completed ? "default" : "secondary"}>
                            {course.completed ? "Completed" : "In Progress"}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {course.progress}% complete
                          </span>
                        </div>
                        
                        <Progress value={course.progress} />
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Lessons:</span>
                            <span>{course.completedLessons}/{course.totalLessons}</span>
                          </div>
                        </div>

                        <Button className="w-full" variant={course.completed ? "outline" : "default"}>
                          {course.completed ? "Review Course" : "Continue Learning"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{totalProgress}%</div>
                      <p className="text-gray-600">Overall Progress</p>
                    </div>
                    
                    <div className="space-y-4">
                      {enrolledCourses.map((course) => (
                        <div key={course.courseId} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-sm text-gray-600">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SimplifiedStudentDashboard;
