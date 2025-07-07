/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Calendar, Users, Clock, Star, LogOut, Bell } from 'lucide-react';
import Navbar from '../Navbar';

interface StudentDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const StudentDashboard = ({ user: propUser, onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);

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

  const getUserDisplayName = () => {
    if (!user) return 'Student';
    return user.firstName 
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.name || 'Student';
  };

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {getUserDisplayName()}!</h2>
                <p className="text-blue-100">Continue your learning journey and achieve your goals.</p>
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>3 Active Courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>5 Achievements</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">67% completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Ready to download</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Your active courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.filter(course => course.status === 'in-progress').map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{course.name}</h3>
                        <div className="mt-2">
                          <Progress value={course.progress} className="w-48" />
                          <p className="text-sm text-gray-500 mt-1">{course.progress}% complete</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{course.price}</Badge>
                        <Button size="sm">Continue</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Button>Browse New Courses</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>
                      <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={course.progress} />
                      <div className="flex justify-between text-sm">
                        <span>{course.progress}% Complete</span>
                        <span className="font-medium">{course.price}</span>
                      </div>
                      <Button className="w-full" variant={course.status === 'completed' ? 'outline' : 'default'}>
                        {course.status === 'completed' ? 'Review' : 'Continue Learning'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your learning journey and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Overall Progress</h3>
                      <Progress value={67} className="h-3" />
                      <p className="text-sm text-gray-600">67% of all enrolled courses completed</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">This Month</h3>
                      <Progress value={85} className="h-3" />
                      <p className="text-sm text-gray-600">127 hours of study time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Celebrate your learning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Earned on {achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Learning Calendar</CardTitle>
                <CardDescription>Your upcoming classes and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{event.type}</Badge>
                        <Button variant="outline" size="sm">Join</Button>
                      </div>
                    </div>
                  ))}
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
