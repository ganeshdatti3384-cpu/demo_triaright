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
import { BookOpen, Trophy, Users, Clock, Star, Play, Code, FolderOpen, Settings, User, Calendar, Bell, Award, CheckCircle, Briefcase, GraduationCap, PenTool, FileText, Filter, Search, Calculator, MapPin, Target, TrendingUp, AlertCircle, IndianRupee, PlayCircle, CreditCard, FileCheck, BellRing, CalendarDays } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Menu items for the sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'payment', label: 'Payment Info', icon: CreditCard },
    { id: 'registration', label: 'Registration', icon: FileCheck },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'drop-semester', label: 'Drop Semester', icon: TrendingUp },
    { id: 'result', label: 'Result', icon: Award },
    { id: 'notice', label: 'Notice', icon: BellRing },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Finance Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Finance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Payable</span>
                    <span className="font-bold">$ 10,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Paid</span>
                    <span className="font-bold">$ 5,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Others</span>
                    <span className="font-bold">$ 300</span>
                  </div>
                </CardContent>
              </Card>

              {/* Enrolled Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myEnrollments.length > 0 ? (
                    myEnrollments.slice(0, 2).map((enrollment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{enrollment.courseName}</span>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No enrolled courses</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Instructors */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Bell className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Daily Notice</span>
                      </div>
                      <p className="text-sm text-gray-600">Prelim payment due</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <Button variant="link" className="p-0 text-blue-600">See more</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Notice */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Sorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <Button variant="link" className="p-0 text-blue-600">See more</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Exam Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Norem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Nine vulputate libero et velit interdum, ac aliquet odio mattis.
                      </p>
                    </div>
                    <Button variant="link" className="p-0 text-blue-600">See more</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'courses':
        return (
          <div className="space-y-6">
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
          </div>
        );
      
      // Add cases for other menu items as needed
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">{menuItems.find(item => item.id === activeTab)?.label}</h2>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="text-sm text-gray-500">
                September 4, 2023
              </div>
            </div>
            
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || user?.firstName || 'John'}!</h2>
                    <p className="text-blue-100">Always stay updated in your student portal</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Menu */}
            <div className="lg:w-1/4">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                            activeTab === item.id 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
