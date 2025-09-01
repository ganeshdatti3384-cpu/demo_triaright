/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Trophy, Users, Clock, Star, Play, Code, FolderOpen, Settings, User, Calendar, Bell, Award, CheckCircle, Briefcase, GraduationCap, PenTool, FileText, Filter, Search, Calculator, MapPin, Target, TrendingUp, AlertCircle, IndianRupee, PlayCircle } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';
import CodeCompiler from '../CodeCompiler';
import EnhancedProfile from '../EnhancedProfile';
import { useNavigate } from 'react-router-dom';
import CourseCards from '../CourseCards';
import { useAuth } from '../../hooks/useAuth';
import { pack365Api, Pack365Course, EnhancedPack365Enrollment, courseApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Pack365Courses from '../Pack365Courses';
import Pack365Dashboard from '../Pack365Dashboard';
import Pack365CoursesStudent from '../Pack365Courses2';
import { EnhancedCourse } from '@/types/api';
import MyEnrollments from '../MyEnrollments';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [pack365Courses, setPack365Courses] = useState<Pack365Course[]>([]);
  const [pack365Enrollments, setPack365Enrollments] = useState<EnhancedPack365Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<EnhancedCourse[]>([]);
  const [freeCourses, setFreeCourses] = useState<EnhancedCourse[]>([]);
  const [paidCourses, setPaidCourses] = useState<EnhancedCourse[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loadingPack365, setLoadingPack365] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await Promise.all([
      fetchPack365Enrollments(token),
      fetchCourses(token),
      fetchMyEnrollments(token)
    ]);
  };

  const fetchPack365Enrollments = async (token: string) => {
    try {
      setLoadingEnrollments(true);
      const response = await pack365Api.getMyEnrollments(token);
      if (response.success) {
        setPack365Enrollments(response.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching Pack365 enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchCourses = async (token: string) => {
    try {
      setLoadingCourses(true);
      const response = await courseApi.getAllCourses(token);
      if (response.success) {
        const courses = response.courses;
        setAllCourses(courses);
        
        // Split into free and paid courses
        const free = courses.filter(course => course.courseType === 'unpaid');
        const paid = courses.filter(course => course.courseType === 'paid');
        
        setFreeCourses(free);
        setPaidCourses(paid);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchMyEnrollments = async (token: string) => {
    try {
      const response = await courseApi.getMyEnrollments(token);
      if (response.success) {
        setMyEnrollments(response.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching my enrollments:', error);
    }
  };

  // Load Pack365 enrollments and courses on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetchAllData();
  }, []);

  const loadPack365Enrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view your enrollments.",
          variant: "destructive"
        });
        return;
      }

      const response = await pack365Api.getMyEnrollments(token);
      if (response.success) {
        setPack365Enrollments(response.enrollments || []);
      } else {
        console.log('Failed to fetch enrollments:', response);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadAllCourses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingCourses(true);
      const response = await courseApi.getAllCourses(token);
      
      if (response.success) {
        const courses = response.courses;
        setAllCourses(courses);
        
        // Split into free and paid courses
        const free = courses.filter(course => course.courseType === 'unpaid');
        const paid = courses.filter(course => course.courseType === 'paid');
        
        setFreeCourses(free);
        setPaidCourses(paid);
      }
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  // Calculate Pack365 stats
  const pack365Stats = {
    totalStreams: pack365Enrollments.length,
    totalCourses: pack365Enrollments.reduce((sum, enrollment) => sum + (enrollment as any).coursesCount || 0, 0),
    averageProgress: pack365Enrollments.length > 0 
      ? Math.round(pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.totalWatchedPercentage, 0) / pack365Enrollments.length)
      : 0,
    completedExams: pack365Enrollments.reduce((sum, enrollment) => sum + ((enrollment as any).completedExams || 0), 0)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStreamLearning = (stream: string) => {
    navigate(`/pack365-stream/${stream}`);
  };

  // Filter courses based on stream and search term
  const filteredFreeCourses = freeCourses.filter(course => {
    const matchesFilter = courseFilter === 'all' || course.stream.toLowerCase() === courseFilter.toLowerCase();
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPaidCourses = paidCourses.filter(course => {
    const matchesFilter = courseFilter === 'all' || course.stream.toLowerCase() === courseFilter.toLowerCase();
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-xl text-gray-600">Continue your learning journey</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Browse Courses</TabsTrigger>
              <TabsTrigger value="my-enrollments">My Enrollments</TabsTrigger>
              <TabsTrigger value="pack365">Pack365</TabsTrigger>
              <TabsTrigger value="pack365-dashboard">Pack365 Dashboard</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{allCourses.length}</div>
                    <p className="text-xs text-muted-foreground">Available courses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Enrollments</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myEnrollments.length}</div>
                    <p className="text-xs text-muted-foreground">Enrolled courses</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pack365 Streams</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pack365Stats.totalStreams}</div>
                    <p className="text-xs text-muted-foreground">Premium streams</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pack365Stats.averageProgress}%</div>
                    <p className="text-xs text-muted-foreground">Completion rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {myEnrollments.length > 0 ? (
                    <div className="space-y-4">
                      {myEnrollments.slice(0, 3).map((enrollment, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <PlayCircle className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900">{enrollment.courseName}</h3>
                            <p className="text-sm text-gray-500">by {enrollment.instructorName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={enrollment.progress} className="w-20" />
                            <span className="text-sm text-gray-600">{Math.round(enrollment.progress)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No enrollments yet</h3>
                      <p className="text-gray-500 mb-6">Start your learning journey by browsing our courses</p>
                      <Button onClick={() => navigate('/courses')}>
                        Browse Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Browse Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              {/* Course Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-6 w-6 mr-2" />
                    Browse Courses
                  </CardTitle>
                  <CardDescription>Discover and enroll in courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Streams</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="nonit">Non-IT</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                        <SelectItem value="careerability">Career Ability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Course Tabs */}
              <Tabs defaultValue="free" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="free">Free Courses ({freeCourses.length})</TabsTrigger>
                  <TabsTrigger value="paid">Paid Courses ({paidCourses.length})</TabsTrigger>
                </TabsList>

                {/* Free Courses */}
                <TabsContent value="free">
                  {loadingCourses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading free courses...</p>
                    </div>
                  ) : filteredFreeCourses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredFreeCourses.map((course) => (
                        <Card key={course.courseId} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img
                              src={course.courseImageLink}
                              alt={course.courseName}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-green-500 text-white">FREE</Badge>
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{course.courseName}</CardTitle>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>by {course.instructorName}</span>
                              <span className="capitalize">{course.stream}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{course.courseDescription}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.totalDuration} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.curriculum.length} topics</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => navigate(`/course-enrollment/${course.courseId}`)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              Join Free
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No free courses found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  )}
                </TabsContent>

                {/* Paid Courses */}
                <TabsContent value="paid">
                  {loadingCourses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading paid courses...</p>
                    </div>
                  ) : filteredPaidCourses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredPaidCourses.map((course) => (
                        <Card key={course.courseId} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative">
                            <img
                              src={course.courseImageLink}
                              alt={course.courseName}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-blue-600 text-white">PREMIUM</Badge>
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{course.courseName}</CardTitle>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>by {course.instructorName}</span>
                              <span className="capitalize">{course.stream}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{course.courseDescription}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.totalDuration} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.curriculum.length} topics</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
                              <Button 
                                onClick={() => navigate(`/course-enrollment/${course.courseId}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Enroll Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No paid courses found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* My Enrollments Tab */}
            <TabsContent value="my-enrollments">
              <MyEnrollments />
            </TabsContent>

            {/* Pack365 Tab */}
            <TabsContent value="pack365">
              <Pack365CoursesStudent />
            </TabsContent>

            {/* Pack365 Dashboard Tab */}
            <TabsContent value="pack365-dashboard">
              <Pack365Dashboard />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="bg-white rounded-lg">
                <EnhancedProfile />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;