/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Trophy, Clock, Star, Play, Award, CheckCircle, GraduationCap, IndianRupee, Calendar, PlayCircle, Filter, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseCards from '../CourseCards';
import { useAuth } from '../../hooks/useAuth';
import { pack365Api, Pack365Course, EnhancedPack365Enrollment, courseApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { EnhancedCourse } from '@/types/api';

interface StudentCourseManagementProps {
  initialTab?: string;
}

const StudentCourseManagement: React.FC<StudentCourseManagementProps> = ({ initialTab = 'my-courses' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for courses and enrollments
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [pack365Courses, setPack365Courses] = useState<Pack365Course[]>([]);
  const [pack365Enrollments, setPack365Enrollments] = useState<EnhancedPack365Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<EnhancedCourse[]>([]);
  const [freeCourses, setFreeCourses] = useState<EnhancedCourse[]>([]);
  const [paidCourses, setPaidCourses] = useState<EnhancedCourse[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  
  // Loading states
  const [loadingPack365, setLoadingPack365] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Filter states
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    loadAllCourses();
    loadMyEnrollments();
    loadPack365Enrollments();
    fetchEnrollments();
  }, []);

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
    navigate(`/course-enrollment/${courseId}`);
  };
  
  const pack365Stats = {
    totalStreams: pack365Enrollments.length,
    totalCourses: pack365Enrollments.length,
    averageProgress: pack365Enrollments.length > 0 
      ? Math.round(pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.totalWatchedPercentage, 0) / pack365Enrollments.length)
      : 0,
    completedExams: pack365Enrollments.filter(enrollment => enrollment.isExamCompleted).length
  };

  // Course Management Tabs
  const courseTabs = [
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'browse-courses', label: 'Browse Courses', icon: GraduationCap },
    { id: 'pack365-courses', label: 'Pack365', icon: Star },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-courses':
        return (
          <div className="space-y-6">
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
                              onClick={() => navigate(`/learning/${enrollment.courseId}`)}
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
          </div>
        );

      case 'browse-courses':
        return (
          <div className="space-y-6">
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
          </div>
        );

      case 'pack365-courses':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pack365 Courses</CardTitle>
                <CardDescription>All-in-One Learning Packages for an entire year</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="enrollments" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="enrollments" onClick={loadPack365Enrollments}>My Enrollments</TabsTrigger>
                    <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                  </TabsList>

                  <TabsContent value="enrollments" className="space-y-6">
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
                  </TabsContent>

                  <TabsContent value="browse" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Browse Pack365 Streams</CardTitle>
                        <CardDescription>Select a learning package for an entire year</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">Browse Pack365 Courses</h3>
                          <p className="text-gray-500 mb-6">Visit the Pack365 section to explore available streams.</p>
                          <Button onClick={() => navigate('/pack365')} className="bg-yellow-500 hover:bg-yellow-600">
                            Go to Pack365
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a tab to view courses</h3>
            <p className="text-gray-500">Choose from My Courses, Browse Courses, or Pack365</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>Manage your courses, track progress, and discover new learning opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white">
              {courseTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {renderTabContent()}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{myEnrollments.length + pack365Enrollments.length}</p>
                <p className="text-sm text-gray-600">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{completedCourses.length}</p>
                <p className="text-sm text-gray-600">Completed Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-2xl font-bold">{pack365Stats.averageProgress}%</p>
                <p className="text-sm text-gray-600">Average Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentCourseManagement;
