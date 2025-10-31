/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Trophy, Users, Clock, Star, Play, Code, FolderOpen, Settings, User, Calendar, Bell, Award, CheckCircle, Briefcase, GraduationCap, PenTool, FileText, Filter, Search, Calculator, MapPin, Target, TrendingUp, AlertCircle, IndianRupee, PlayCircle, DollarSign, CreditCard, CalendarDays, Megaphone, ClipboardList } from 'lucide-react';
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
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await pack365Api.getMyEnrollments(token);
        if (response.success || response.enrollments) {
          console.log('Pack365 Enrollments fetched:', response.enrollments);
          setPack365Enrollments(response.enrollments);
          setEnrolledCourses(response.enrollments.filter((e: any) => e.paymentStatus === 'completed' || e.paymentStatus === 'enrolled'));
          setCompletedCourses(response.enrollments.filter((e: any) => e.status === 'completed'));
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      }
    };

    loadPack365Enrollments();
    loadAllCourses();
    loadMyEnrollments();
  }, []);

  const loadAllCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('🔄 Loading all courses...');
      
      const [allCoursesData, freeCoursesData, paidCoursesData] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getFreeCourses(),
        courseApi.getPaidCourses()
      ]);
      
      console.log('📊 All courses data:', allCoursesData);
      console.log('🆓 Free courses data:', freeCoursesData);
      console.log('💰 Paid courses data:', paidCoursesData);
      
      setAllCourses(allCoursesData.courses || []);
      setFreeCourses(freeCoursesData || []);
      setPaidCourses(paidCoursesData || []);
      
      console.log('✅ Courses loaded successfully');
    } catch (error: any) {
      console.error('❌ Error loading courses:', error);
      
      // Set empty arrays to avoid infinite loading
      setAllCourses([]);
      setFreeCourses([]);
      setPaidCourses([]);
      
      toast({
        title: "Error",
        description: `Failed to load courses: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
      console.log('🏁 Course loading completed');
    }
  };

  const loadMyEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Loading regular course enrollments...');
      const response = await courseApi.getMyEnrollments(token);
      console.log('Regular Course Enrollments Response:', response);
      
      if (response.success && response.enrollments) {
        console.log('Setting myEnrollments:', response.enrollments);
        setMyEnrollments(response.enrollments);
        // Don't overwrite enrolledCourses here - let Pack365 handle it
      } else {
        console.log('No regular course enrollments found');
        setMyEnrollments([]);
      }
    } catch (error: any) {
      console.error('Error loading regular course enrollments:', error);
      setMyEnrollments([]);
    }
  };
  const loadPack365Enrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to view your enrollments.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('Loading Pack365 enrollments...');
      const response = await pack365Api.getMyEnrollments(token);
      console.log('Pack365 Enrollments Response:', response);
      
      if (response.success || response.enrollments) {
        setPack365Enrollments(response.enrollments);
        console.log('Pack365 Enrollments set:', response.enrollments);
      } else {
        console.log('No enrollments found or failed response');
        toast({
          title: "Info", 
          description: "No enrollments found or failed to load enrollments",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error loading Pack365 enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load your enrollments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingEnrollments(false);
    }
  };



  const handleContinueLearning = (enrollment: EnhancedPack365Enrollment) => {
    console.log('🚀 Continue Learning clicked, enrollment:', enrollment);
    
    // Extract courseId from enrollment object (handle both string and object types)
    let courseId: string;
    
    if (typeof enrollment.courseId === 'string') {
      courseId = enrollment.courseId;
    } else if (enrollment.courseId && typeof enrollment.courseId === 'object' && 'courseId' in enrollment.courseId) {
      courseId = (enrollment.courseId as any)._id;
    } else {
      courseId = enrollment._id || '';
    }
    
    console.log('📋 Course ID extracted:', courseId);
    console.log('🎯 Navigation path:', `/learning/${courseId}`);

    if (courseId) {
      console.log('✅ Navigating to course learning page...');
      navigate(`/learning/${courseId}`);
    } else {
      console.error('❌ No valid course ID found in enrollment:', enrollment);
      toast({
        title: "Navigation Error",
        description: "Course ID not found. Please try again or contact support.",
        variant: "destructive",
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

  // Get unique streams for filter options from all courses
  const streams = ['all', ...Array.from(new Set(allCourses.map(course => course.stream)))];

  const handleEnrollInCourse = (courseId: string) => {
    // Navigate to course enrollment page
    navigate(`/course-enrollment/${courseId}`);
  };
  const pack365Stats = {
    totalStreams: pack365Enrollments.length,
    totalCourses: pack365Enrollments.length, // Each enrollment represents one course/stream
    averageProgress: pack365Enrollments.length > 0 
      ? Math.round(pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.totalWatchedPercentage, 0) / pack365Enrollments.length)
      : 0,
    completedExams: pack365Enrollments.filter(enrollment => enrollment.isExamCompleted).length
  };

  const financeStats = [
    {
      title: 'Total Payable',
      value: '₹10,000',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Paid',
      value: '₹5,000',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Others',
      value: '₹300',
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const stats = [
    {
      title: 'Enrolled Courses',
      value: myEnrollments.length.toString(),
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || user?.firstName || 'Student'}!</h1>
              <p className="text-gray-600 mt-2">Always stay updated in your student portal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">September 4, 2023</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Dashboard Navigation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <DollarSign className="h-5 w-5 mb-1" />
                      <span className="text-xs">Payment Info</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <User className="h-5 w-5 mb-1" />
                      <span className="text-xs">Registration</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <BookOpen className="h-5 w-5 mb-1" />
                      <span className="text-xs">Courses</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <ClipboardList className="h-5 w-5 mb-1" />
                      <span className="text-xs">Drop Semester</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <Award className="h-5 w-5 mb-1" />
                      <span className="text-xs">Result</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <Megaphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">Notice</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-auto py-3">
                      <CalendarDays className="h-5 w-5 mb-1" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {financeStats.map((stat) => {
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

              {/* Enrolled Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myEnrollments.slice(0, 2).map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{enrollment.courseName || 'Course Name'}</p>
                          <p className="text-sm text-gray-600">
                            Progress: {enrollment.videoProgressPercent || 0}%
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  ))}
                  {myEnrollments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No enrolled courses</p>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-white">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="pack365">Pack365</TabsTrigger>
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
                          {myEnrollments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {myEnrollments.map((enrollment, index) => (
                                 <Card key={index} className="hover:shadow-md transition-shadow border-blue-200">
                                   <CardContent className="p-6">
                                     <div className="space-y-4">
                                       <div className="flex items-center justify-between">
                                         <Badge className="bg-blue-500 text-white">
                                           {enrollment.isPaid ? 'Paid' : 'Free'}
                                         </Badge>
                                         <span className="text-sm text-gray-500">
                                           {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                         </span>
                                       </div>
                                       <h3 className="font-semibold">{enrollment.courseName}</h3>
                                       <div className="space-y-2">
                                         <div className="flex justify-between text-sm">
                                           <span>Progress</span>
                                           <span>{enrollment.videoProgressPercent || 0}%</span>
                                         </div>
                                         <Progress value={enrollment.videoProgressPercent || 0} className="h-2" />
                                       </div>
                                        <Button 
                                          className="w-full bg-blue-600 hover:bg-blue-700"
                                          onClick={() => handleContinueLearning(enrollment)}
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
                      {/* Course Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Select value={courseFilter} onValueChange={setCourseFilter}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by stream" />
                          </SelectTrigger>
                          <SelectContent>
                            {streams.map((stream) => (
                              <SelectItem key={stream} value={stream}>
                                {stream === 'all' ? 'All Streams' : stream.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Tabs defaultValue="free" className="space-y-4">
                        <TabsList className="bg-white">
                          <TabsTrigger value="free">Free Courses</TabsTrigger>
                          <TabsTrigger value="paid">Paid Courses</TabsTrigger>
                        </TabsList>

                         <TabsContent value="free" className="space-y-6">
                           {loadingCourses ? (
                             <div className="text-center py-8">
                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                               <p className="mt-2 text-gray-600">Loading courses...</p>
                               <Button 
                                 variant="outline" 
                                 onClick={loadAllCourses}
                                 className="mt-4"
                               >
                                 Retry Loading
                               </Button>
                             </div>
                           ) : filteredFreeCourses.length > 0 ? (
                             <CourseCards courses={filteredFreeCourses as any} type="recorded" />
                           ) : (
                             <div className="text-center py-8">
                               <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                               <p className="text-gray-600 mb-4">No free courses available at the moment.</p>
                               <Button onClick={loadAllCourses} variant="outline">
                                 Refresh Courses
                               </Button>
                             </div>
                           )}
                         </TabsContent>

                         <TabsContent value="paid" className="space-y-6">
                           {loadingCourses ? (
                             <div className="text-center py-8">
                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                               <p className="mt-2 text-gray-600">Loading courses...</p>
                               <Button 
                                 variant="outline" 
                                 onClick={loadAllCourses}
                                 className="mt-4"
                               >
                                 Retry Loading
                               </Button>
                             </div>
                           ) : filteredPaidCourses.length > 0 ? (
                             <CourseCards courses={filteredPaidCourses as any} type="recorded" />
                           ) : (
                             <div className="text-center py-8">
                               <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                               <p className="text-gray-600 mb-4">No paid courses available at the moment.</p>
                               <Button onClick={loadAllCourses} variant="outline">
                                 Refresh Courses
                               </Button>
                             </div>
                           )}
                         </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="pack365" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pack365 Courses</CardTitle>
                      <CardDescription>All-in-One Learning Packages for an entire year</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Tabs defaultValue="browse" className="w-full">
                        <TabsList className="mb-4">
                          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                          <TabsTrigger value="enrollments" onClick={loadPack365Enrollments}>My Enrollments</TabsTrigger>
                        </TabsList>

                        {/* ---------------- Browse Tab ---------------- */}
                        <TabsContent value="browse">
                          <Pack365CoursesStudent />
                        </TabsContent>

                        {/* ---------------- Enrollments Tab ---------------- */}
                        <TabsContent value="enrollments">
                          <div className="space-y-6">
                            {/* Pack365 Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              {/* Total Streams */}
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

                              {/* Total Courses */}
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

                              {/* Average Progress */}
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

                              {/* Completed Exams */}
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

                            {/* My Enrollments */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center">
                                  <GraduationCap className="h-6 w-6 mr-2" />
                                  My Pack365 Enrollments
                                </CardTitle>
                              </CardHeader>

                              <CardContent>
                                {loadingEnrollments ? (
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
                                                <IndianRupee className="h-3 w-3 mr-1" />
                                                <span>Amount Paid</span>
                                              </div>
                                              <p className="font-semibold">₹{enrollment.amountPaid || 0}</p>
                                            </div>
                                            <div>
                                              <div className="flex items-center text-gray-500 mb-1">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>Status</span>
                                              </div>
                                              <p className="font-semibold text-xs capitalize">{enrollment.status || 'Active'}</p>
                                            </div>
                                          </div>

                                          <div>
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="text-sm font-medium">Progress</span>
                                              <span className="text-sm text-gray-600">{Math.round(enrollment.totalWatchedPercentage || 0)}%</span>
                                            </div>
                                            <Progress value={enrollment.totalWatchedPercentage || 0} className="h-2" />
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
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                  <div className="bg-white rounded-lg">
                    <EnhancedProfile />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Course Instructors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Object Oriented Programming</p>
                        <p className="text-sm text-gray-600">Dr. Smith Johnson</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Database Systems</p>
                        <p className="text-sm text-gray-600">Prof. Sarah Wilson</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Notice */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Megaphone className="h-5 w-5 mr-2" />
                    Daily Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Prelim payment due</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Sorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">New course available</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Norem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-red-600">15</span>
                        <span className="text-xs text-red-600">SEP</span>
                      </div>
                      <div>
                        <p className="font-medium">Mid-term Exam</p>
                        <p className="text-sm text-gray-600">Object Oriented Programming</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">20</span>
                        <span className="text-xs text-blue-600">SEP</span>
                      </div>
                      <div>
                        <p className="font-medium">Project Submission</p>
                        <p className="text-sm text-gray-600">Database Systems</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Compiler */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Code Compiler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeCompiler />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
