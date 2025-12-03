/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Play, CheckCircle, Clock, Award, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface StudentCourseManagementProps {
  initialTab?: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const StudentCourseManagement: React.FC<StudentCourseManagementProps> = ({ initialTab = 'my-courses' }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  // State for courses and enrollments
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [freeCourses, setFreeCourses] = useState<any[]>([]);
  const [paidCourses, setPaidCourses] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  
  // Loading states
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Filter states
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Enrollment with coupon states
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<any>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponPreview, setCouponPreview] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    loadMyEnrollments();
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('🔄 Loading all courses...');
      
      // Load all courses directly
      const allCoursesResp = await axios.get(`${API_BASE_URL}/courses`);
      const freeCoursesResp = await axios.get(`${API_BASE_URL}/courses/free`);
      const paidCoursesResp = await axios.get(`${API_BASE_URL}/courses/paid`);
      
      console.log('📊 All courses data:', allCoursesResp.data);
      console.log('🆓 Free courses data:', freeCoursesResp.data);
      console.log('💰 Paid courses data:', paidCoursesResp.data);
      
      setAllCourses(allCoursesResp.data.courses || []);
      setFreeCourses(freeCoursesResp.data.courses || []);
      setPaidCourses(paidCoursesResp.data.courses || []);
      
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
    if (!token) {
      setLoadingEnrollments(false);
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('Loading regular course enrollments...');
      
      const response = await axios.get(
        `${API_BASE_URL}/courses/enrollment/allcourses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Regular Course Enrollments Response:', response.data);
      
      if (response.data && response.data.success && response.data.enrollments) {
        console.log('Setting myEnrollments:', response.data.enrollments);
        setMyEnrollments(response.data.enrollments);
        
        // Separate enrolled vs completed
        const enrolled = response.data.enrollments.filter((e: any) => !e.courseCompleted);
        const completed = response.data.enrollments.filter((e: any) => e.courseCompleted);
        
        setEnrolledCourses(enrolled);
        setCompletedCourses(completed);
      } else {
        console.log('No regular course enrollments found');
        setMyEnrollments([]);
        setEnrolledCourses([]);
        setCompletedCourses([]);
      }
    } catch (error: any) {
      console.error('Error loading regular course enrollments:', error);
      setMyEnrollments([]);
      setEnrolledCourses([]);
      setCompletedCourses([]);
      toast({
        title: "Error",
        description: "Failed to load your enrollments",
        variant: "destructive",
      });
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContinueLearning = (enrollment: any) => {
    // Get the correct course ID from enrollment
    const courseId = enrollment.courseId?._id || enrollment.courseId;
    
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID not found",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Navigating to course:', courseId);
    navigate(`/learning/${courseId}`);
  };

  // New: show coupon UI for paid enrollments
  const handleEnrollInCourse = (course: any) => {
    if (!course) return;

    // If course is paid, open the coupon/order panel inline
    if (course.courseType === 'paid' || course.price) {
      setSelectedCourseForEnroll(course);
      setCouponCode('');
      setCouponPreview(null);
      return;
    }

    // For unpaid/free, navigate to enrollment page (existing behavior)
    navigate(`/course-enrollment/${course._id}`);
  };

  const applyCoupon = async (courseId: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to apply coupons",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!couponCode || couponCode.trim().length === 0) {
      toast({
        title: "Invalid coupon",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplyingCoupon(true);
      console.log(`Applying coupon ${couponCode} for course ${courseId}...`);

      const resp = await axios.post(
        `${API_BASE_URL}/courses/coupons/validate`,
        {
          couponCode: couponCode.trim(),
          courseId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Coupon validate response:', resp.data);

      if (resp.data && resp.data.success) {
        setCouponPreview(resp.data.priceDetails || resp.data);
        toast({
          title: "Coupon applied",
          description: `Coupon valid. Final price: ₹${resp.data.priceDetails?.finalPrice ?? resp.data.finalPrice}`,
          variant: "success",
        });
      } else {
        setCouponPreview(null);
        toast({
          title: "Coupon",
          description: resp.data.message || "Could not apply coupon",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Coupon apply error:', error);
      setCouponPreview(null);
      toast({
        title: "Coupon error",
        description: error.response?.data?.message || error.message || "Failed to validate coupon",
        variant: "destructive",
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const createOrder = async (courseId: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to enroll in courses",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setCreatingOrder(true);
      console.log(`Creating order for course ${courseId} with coupon ${couponCode}...`);

      const resp = await axios.post(
        `${API_BASE_URL}/courses/enrollments/order`,
        {
          courseId,
          couponCode: couponCode?.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Create order response:', resp);

      // If backend enrols directly (100% discount) it returns 201 with enrollment
      if (resp.status === 201 || (resp.data && resp.data.enrollment)) {
        toast({
          title: "Enrolled",
          description: resp.data.message || "You have been enrolled",
          variant: "success",
        });

        // Refresh enrollments and close panel
        await loadMyEnrollments();
        setSelectedCourseForEnroll(null);
        setCouponCode('');
        setCouponPreview(null);
        return;
      }

      // If order created and payment required (status 200)
      if (resp.status === 200 && resp.data && resp.data.order) {
        const order = resp.data.order;
        toast({
          title: "Order created",
          description: `Order created for ₹${order.finalPrice}. Proceed to payment.`,
          variant: "default",
        });

        // Optionally navigate to a payment page (your app may have a checkout component)
        // Here we navigate to an assumed payment route; adjust as per your app routes.
        // If you don't have a payment route, keep user informed and refresh enrollments after payment completes on server webhook.
        navigate(`/payment/${order.id}`, { state: { order, courseId } });

        // Close the coupon panel
        setSelectedCourseForEnroll(null);
        setCouponCode('');
        setCouponPreview(null);
        return;
      }

      // Fallback
      toast({
        title: "Unexpected response",
        description: "Received unexpected response from server.",
        variant: "destructive",
      });

    } catch (error: any) {
      console.error('Create order error:', error);
      toast({
        title: "Order error",
        description: error.response?.data?.message || error.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  // Get unique streams for filter options from all courses
  const streams = ['all', ...Array.from(new Set(allCourses.map(course => course.stream)))];

  // Course Management Tabs
  const courseTabs = [
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'browse-courses', label: 'Browse Courses', icon: GraduationCap },
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
                {loadingEnrollments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading your courses...</p>
                  </div>
                ) : myEnrollments.length > 0 ? (
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
                                {formatDate(enrollment.enrollmentDate)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg">{enrollment.courseName || 'Course'}</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{enrollment.videoProgressPercent || enrollment.videoProgressPercent === 0 ? enrollment.videoProgressPercent : 0}%</span>
                              </div>
                              <Progress value={enrollment.videoProgressPercent || 0} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {enrollment.finalExamAttempted ? 'Final Exam Attempted' : 'Final Exam Pending'}
                              </span>
                              <Badge variant={enrollment.courseCompleted ? "default" : "outline"}>
                                {enrollment.courseCompleted ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleContinueLearning(enrollment)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {enrollment.courseCompleted ? 'Review Course' : 'Continue Learning'}
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
                    <Button 
                      onClick={() => setActiveTab('browse-courses')} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
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
                    {completedCourses.map((enrollment, index) => (
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
                            <h3 className="font-semibold">{enrollment.courseName || 'Course'}</h3>
                            <p className="text-sm text-gray-600">
                              Completed on {formatDate(enrollment.completedAt || enrollment.enrollmentDate)}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleContinueLearning(enrollment)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  toast({
                                    title: "Certificate",
                                    description: "Certificate download will be available soon",
                                    variant: "default",
                                  });
                                }}
                              >
                                Certificate
                              </Button>
                            </div>
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
                  placeholder="Search courses by name..."
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
                <TabsTrigger value="all">All Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="free" className="space-y-6">
                {loadingCourses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading free courses...</p>
                  </div>
                ) : freeCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freeCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-green-500 text-white">Free</Badge>
                              <Badge variant="outline">{course.stream}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{course.courseName}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.courseDescription || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {course.totalDuration || 0} min
                              </span>
                              <span className="font-medium">{course.instructorName}</span>
                            </div>
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleEnrollInCourse(course)}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Enroll Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                    <p className="mt-2 text-gray-600">Loading paid courses...</p>
                  </div>
                ) : paidCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paidCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-purple-500 text-white">₹{course.price}</Badge>
                              <Badge variant="outline">{course.stream}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{course.courseName}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.courseDescription || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {course.totalDuration || 0} min
                              </span>
                              <span className="font-medium">{course.instructorName}</span>
                            </div>
                            <div className="space-y-2">
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleEnrollInCourse(course)}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Enroll Now
                              </Button>

                              {/* Inline coupon / order panel */}
                              {selectedCourseForEnroll && selectedCourseForEnroll._id === course._id && (
                                <div className="mt-3 p-4 border rounded bg-gray-50">
                                  <h4 className="text-sm font-medium mb-2">Apply Coupon / Proceed to Payment</h4>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Enter coupon code (optional)"
                                      value={couponCode}
                                      onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => applyCoupon(course._id)}
                                      disabled={applyingCoupon}
                                    >
                                      {applyingCoupon ? 'Applying...' : 'Apply'}
                                    </Button>
                                  </div>

                                  {couponPreview && (
                                    <div className="mt-3 text-sm">
                                      <p>Original Price: ₹{couponPreview.originalPrice ?? course.price}</p>
                                      <p>Discount: ₹{couponPreview.discount}</p>
                                      <p className="font-semibold">Final Price: ₹{couponPreview.finalPrice}</p>
                                      {couponPreview.isFree && (
                                        <p className="text-green-600">This coupon makes the course free. You will be enrolled automatically.</p>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      onClick={() => createOrder(course._id)}
                                      disabled={creatingOrder}
                                    >
                                      {creatingOrder ? 'Processing...' : 'Confirm & Pay'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => {
                                        setSelectedCourseForEnroll(null);
                                        setCouponCode('');
                                        setCouponPreview(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

              <TabsContent value="all" className="space-y-6">
                {loadingCourses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading all courses...</p>
                  </div>
                ) : allCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className={course.courseType === 'paid' ? 'bg-purple-500' : 'bg-green-500'} >
                                {course.courseType === 'paid' ? `₹${course.price}` : 'Free'}
                              </Badge>
                              <Badge variant="outline">{course.stream}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{course.courseName}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.courseDescription || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {course.totalDuration || 0} min
                              </span>
                              <span className="font-medium">{course.instructorName}</span>
                            </div>
                            <div>
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleEnrollInCourse(course)}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                {course.courseType === 'paid' ? 'Buy Now' : 'Enroll Free'}
                              </Button>

                              {/* Inline coupon / order panel for 'all' tab when a paid course is selected */}
                              {selectedCourseForEnroll && selectedCourseForEnroll._id === course._id && course.courseType === 'paid' && (
                                <div className="mt-3 p-4 border rounded bg-gray-50">
                                  <h4 className="text-sm font-medium mb-2">Apply Coupon / Proceed to Payment</h4>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Enter coupon code (optional)"
                                      value={couponCode}
                                      onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <Button
                                      onClick={() => applyCoupon(course._id)}
                                      disabled={applyingCoupon}
                                    >
                                      {applyingCoupon ? 'Applying...' : 'Apply'}
                                    </Button>
                                  </div>

                                  {couponPreview && (
                                    <div className="mt-3 text-sm">
                                      <p>Original Price: ₹{couponPreview.originalPrice ?? course.price}</p>
                                      <p>Discount: ₹{couponPreview.discount}</p>
                                      <p className="font-semibold">Final Price: ₹{couponPreview.finalPrice}</p>
                                      {couponPreview.isFree && (
                                        <p className="text-green-600">This coupon makes the course free. You will be enrolled automatically.</p>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      onClick={() => createOrder(course._id)}
                                      disabled={creatingOrder}
                                    >
                                      {creatingOrder ? 'Processing...' : 'Confirm & Pay'}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => {
                                        setSelectedCourseForEnroll(null);
                                        setCouponCode('');
                                        setCouponPreview(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No courses available at the moment.</p>
                    <Button onClick={loadAllCourses} variant="outline">
                      Refresh Courses
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a tab to view courses</h3>
            <p className="text-gray-500">Choose from My Courses or Browse Courses</p>
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
                <p className="text-2xl font-bold">{myEnrollments.length}</p>
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
                <p className="text-2xl font-bold">
                  {myEnrollments.length > 0 
                    ? Math.round(myEnrollments.reduce((sum, enrollment) => sum + (enrollment.videoProgressPercent || 0), 0) / myEnrollments.length)
                    : 0}%
                </p>
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
