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
            <TabsList className="grid w-full grid-cols-10 bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="pack365">Pack365</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="trainings">Trainings</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="compiler">Compiler</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
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

              
            <TabsContent value="jobs" className="space-y-6">
              <Tabs defaultValue="job-assurance" className="space-y-4">
                <TabsList className="bg-white">
                  <TabsTrigger value="job-assurance">Job Assurance</TabsTrigger>
                  <TabsTrigger value="job-assistance">Job Assistance</TabsTrigger>
                </TabsList>

                <TabsContent value="job-assurance" className="space-y-6">
                  <div className="bg-blue-600 text-white rounded-lg p-8 mb-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-4">Triaright Job Assurance Program</h2>
                      <p className="text-xl mb-6 text-blue-100">
                        Personalized Training + Guaranteed Placement — Or 100% Refund!
                      </p>
                      <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3">
                        🔥 Limited Slots Available – Apply Now!
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                      <CardHeader className="bg-blue-50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-blue-800">IT Track</CardTitle>
                          <Badge className="bg-blue-600">Popular</Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">1 Year Program</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <div className="text-3xl font-bold text-blue-600 mb-2">₹30,000</div>
                          <p className="text-gray-600">Includes training & placement support</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Full-stack development training</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Modern frameworks & technologies</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Real-world project experience</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply for IT Track</Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors">
                      <CardHeader className="bg-orange-50">
                        <CardTitle className="text-xl text-orange-800">Non-IT Track</CardTitle>
                        <div className="flex items-center space-x-2 mt-4">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-700 font-medium">100-Day Program</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <div className="text-3xl font-bold text-orange-600 mb-2">₹10,000</div>
                          <p className="text-gray-600">Includes targeted training & job assistance</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Business skills development</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Communication & leadership training</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Industry-specific knowledge</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">Apply for Non-IT Track</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="job-assistance" className="space-y-6">
                  <div className="bg-green-600 text-white rounded-lg p-8 mb-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-4">Advance Your Career with Expert Guidance</h2>
                      <p className="text-xl mb-6 text-green-100">
                        🚀 Land Your Dream Job Faster with Triaright's Professional Job Assistance
                      </p>
                      <div className="bg-white/20 rounded-xl p-6 max-w-xl mx-auto">
                        <div className="text-4xl font-bold mb-2">₹500 Only</div>
                        <div className="text-lg mb-2">Lifetime Access</div>
                        <p className="text-green-100">One-time investment for lifetime career support!</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Bell, title: "Real-time updates on job opportunities", description: "Get instant notifications about new job openings that match your profile" },
                      { icon: Target, title: "Customized preparation guidance", description: "Personalized interview preparation and skill development recommendations" },
                      { icon: Trophy, title: "Insider tips to stand out from competition", description: "Learn industry secrets and strategies to make your application stand out" },
                      { icon: Bell, title: "Direct notifications about openings", description: "Be the first to know about exclusive job opportunities from our partner companies" }
                    ].map((benefit, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-3 rounded-lg">
                              <benefit.icon className="h-5 w-5 text-green-600" />
                            </div>
                            <CardTitle className="text-sm">{benefit.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">{benefit.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Button onClick={() => navigate('/job-assistance')} size="lg" className="bg-green-600 hover:bg-green-700 font-semibold px-8 py-3">
                      Get Started Now - ₹500 Only!
                    </Button>
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 1, role: "Frontend Developer Intern", company: "TechStart Solutions", duration: "3 months", technologies: ["React", "JavaScript", "CSS"], category: "IT", feeType: "Stipend", stipend: "₹8,000/month", description: "Work on modern web applications using React and contribute to real projects." },
                      { id: 2, role: "Digital Marketing Intern", company: "Creative Agency", duration: "2 months", technologies: ["Google Ads", "SEO", "Social Media"], category: "Marketing", feeType: "Unpaid", stipend: null, description: "Learn digital marketing strategies and campaign management." },
                      { id: 3, role: "Data Science Intern", company: "Analytics Pro", duration: "4 months", technologies: ["Python", "Machine Learning", "SQL"], category: "IT", feeType: "Stipend", stipend: "₹12,000/month", description: "Work with real datasets and build predictive models." }
                    ].map((internship) => (
                      <Card key={internship.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-sm mb-2">{internship.role}</CardTitle>
                              <p className="text-blue-600 font-medium text-sm">{internship.company}</p>
                            </div>
                            <Badge variant={internship.feeType === 'Unpaid' ? 'secondary' : 'default'} className="text-xs">
                              {internship.feeType}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-gray-600 text-xs">{internship.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {internship.duration}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Remote
                            </div>
                          </div>
                          {internship.stipend && (
                            <div className="flex items-center text-green-600 font-medium text-sm">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              {internship.stipend}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {internship.technologies.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">Apply Now</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="offline" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 1, role: "Software Development Intern", company: "Tech Innovators", duration: "6 months", technologies: ["Java", "Spring Boot", "MySQL"], category: "IT", feeType: "Stipend", stipend: "₹15,000/month", location: "Hyderabad", description: "Work on enterprise applications and learn full-stack development." },
                      { id: 2, role: "Marketing Assistant", company: "Brand Builders", duration: "3 months", technologies: ["Market Research", "Content Creation", "Analytics"], category: "Marketing", feeType: "Paid", stipend: "₹8,000/month", location: "Mumbai", description: "Support marketing campaigns and learn brand management." },
                      { id: 3, role: "Business Operations Intern", company: "StartupHub", duration: "4 months", technologies: ["Process Optimization", "Data Analysis", "CRM"], category: "Business", feeType: "Stipend", stipend: "₹12,000/month", location: "Bangalore", description: "Learn business operations in a fast-paced startup environment." }
                    ].map((internship) => (
                      <Card key={internship.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-sm mb-2">{internship.role}</CardTitle>
                              <p className="text-blue-600 font-medium text-sm">{internship.company}</p>
                            </div>
                            <Badge variant={internship.feeType === 'Unpaid' ? 'secondary' : 'default'} className="text-xs">
                              {internship.feeType}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-gray-600 text-xs">{internship.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {internship.duration}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {internship.location}
                            </div>
                          </div>
                          {internship.stipend && (
                            <div className="flex items-center text-green-600 font-medium text-sm">
                              <IndianRupee className="h-3 w-3 mr-1" />
                              {internship.stipend}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {internship.technologies.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">Apply Now</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={() => navigate('/exams')} 
                        className="bg-blue-600 hover:bg-blue-700 flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Available Exams
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // This could navigate to exam history or results
                          toast({
                            title: "Feature Coming Soon",
                            description: "Exam history will be available soon.",
                          });
                        }}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Exam Results
                      </Button>
                    </div>

                    {/* Exam Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Available Exams</p>
                              <p className="text-2xl font-bold text-blue-900">
                                {pack365Enrollments?.filter(e => e.totalWatchedPercentage >= 80).length || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-800">Exams Passed</p>
                              <p className="text-2xl font-bold text-green-900">
                                {pack365Enrollments?.filter(e => e.isExamCompleted && e.examScore >= 50).length || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-8 w-8 text-orange-600" />
                            <div>
                              <p className="text-sm font-medium text-orange-800">Pending Exams</p>
                              <p className="text-2xl font-bold text-orange-900">
                                {pack365Enrollments?.filter(e => e.totalWatchedPercentage >= 80 && !e.isExamCompleted).length || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Exam Progress */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Course Progress for Exams</h3>
                      <div className="space-y-3">
                        {pack365Enrollments && pack365Enrollments.length > 0 ? (
                          pack365Enrollments.slice(0, 3).map((enrollment) => (
                            <div key={enrollment.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{enrollment.courseName}</h4>
                                <p className="text-sm text-gray-500">Stream: {enrollment.stream}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${enrollment.totalWatchedPercentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{enrollment.totalWatchedPercentage}%</span>
                                </div>
                              </div>
                              <div className="ml-4 flex flex-col space-y-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate(`/pack365-stream/${enrollment.stream}`)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  Browse Courses
                                </Button>
                                {enrollment.totalWatchedPercentage >= 80 ? (
                                  enrollment.isExamCompleted ? (
                                    <Badge variant="default" className="bg-green-500">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => navigate('/exams')}>
                                      Take Exam
                                    </Button>
                                  )
                                ) : (
                                  <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {Math.max(0, 80 - enrollment.totalWatchedPercentage)}% to unlock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No course enrollments found.</p>
                            <p className="text-sm text-gray-400">Enroll in Pack365 courses to access exams.</p>
                          </div>
                        )}
                      </div>
                    </div>
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
                  </div>
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
      </div>
    </>
  );
};

export default StudentDashboard;