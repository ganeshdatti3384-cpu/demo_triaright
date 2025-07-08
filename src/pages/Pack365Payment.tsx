
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Shield, Clock, IndianRupee } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { pack365Api } from '@/services/api';
import { Pack365Course, EnhancedPack365Enrollment } from '@/types/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Pack365Payment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Pack365Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrollment, setEnrollment] = useState<EnhancedPack365Enrollment | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (courseId && token) {
      fetchCourse(courseId, token);
      checkEnrollmentStatus(courseId, token);
    } else if (!token) {
      toast({ title: 'Please login to continue.', variant: 'destructive' });
      navigate('/login');
    }
  }, [courseId, navigate, toast]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCourse = async (id: string, token: string) => {
    try {
      setLoading(true);
      const response = await pack365Api.getCourseById(id, token);
      const courseData = response.data;
      if (courseData) {
        setCourse(courseData);
      } else {
        toast({
          title: 'Course not found.',
          variant: 'destructive'
        });
        navigate('/pack365');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error fetching course data.',
        variant: 'destructive'
      });
      navigate('/pack365');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (id: string, token: string) => {
    try {
      const response = await pack365Api.checkEnrollmentStatus(token, id);
      if (response.success && response.isEnrolled) {
        setEnrollment(response.enrollment);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleProceedToPayment = async () => {
    if (!courseId || !course) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Please login to continue.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Create order
      const orderResponse = await pack365Api.createOrder(token, courseId, 'payment');
      
      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'Pack365 Course',
        description: course.courseName,
        order_id: orderResponse.order.id,
        handler: async (response: any) => {
          await handlePaymentSuccess(response, token);
        },
        prefill: {
          name: 'Student',
          email: 'student@example.com',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            handlePaymentFailure(orderResponse.order.id, token);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any, token: string) => {
    try {
      setIsProcessingPayment(true);
      
      // Verify payment
      const verifyResponse = await pack365Api.verifyPayment(token, {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      });

      if (verifyResponse.success) {
        toast({
          title: 'Payment Successful!',
          description: 'You have been successfully enrolled in the course.',
        });
        
        // Update enrollment state
        setEnrollment(verifyResponse.enrollment);
        
        // Redirect to success page
        navigate(`/payment-success?courseId=${courseId}&type=pack365`);
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: 'Payment Verification Failed',
        description: error.message || 'Please contact support',
        variant: 'destructive'
      });
      navigate(`/payment-failed?courseId=${courseId}&type=pack365`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentFailure = async (orderId: string, token: string) => {
    try {
      await pack365Api.handlePaymentFailure(token, {
        razorpay_order_id: orderId
      });
      
      toast({
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again.',
        variant: 'destructive'
      });
      
      navigate(`/payment-failed?courseId=${courseId}&type=pack365`);
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  };

  const handleCouponCode = () => {
    if (!courseId || !course) return;
    
    navigate('/coupon-code', {
      state: {
        courseData: course,
        originalAmount: 365,
        courseName: course.courseName,
        courseId: courseId,
        type: 'pack365'
      }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading course details...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
            <Button onClick={() => navigate('/pack365')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pack365
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If already enrolled, show enrollment details
  if (enrollment) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Button
              variant="outline"
              onClick={() => navigate('/pack365')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pack365
            </Button>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-green-600" />
                  Already Enrolled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{course.courseName}</h3>
                  <p className="text-green-700 mb-4">You are already enrolled in this course!</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-green-600">Enrollment Date:</span>
                      <p className="font-medium">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Video Progress:</span>
                      <p className="font-medium">{enrollment.videoProgress}% Complete</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Enrollment Type:</span>
                      <Badge variant="outline" className="ml-2">
                        {enrollment.enrollmentType === 'payment' ? 'Paid' : 'Code'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">Amount Paid:</span>
                      <p className="font-medium">₹{enrollment.amountPaid}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate(`/course-learning/${courseId}`)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate('/pack365')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pack365
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={course.documentLink}
                  alt={course.courseName}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold">{course.courseName}</h3>
                <p className="text-gray-600">{course.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stream:</span>
                    <span className="font-medium capitalize">{course.stream}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{course.totalDuration} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Topics you'll learn:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.topics?.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <CreditCard className="h-6 w-6 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium">Pack365 Course</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Premium
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Full year access</span>
                    <span className="text-2xl font-bold">₹365</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment Gateway</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Clock className="h-4 w-4" />
                    <span>365 days unlimited access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Certificate upon completion</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">₹365</span>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleProceedToPayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <IndianRupee className="h-5 w-5 mr-2" />
                          Proceed with ₹365
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCouponCode}
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                      disabled={isProcessingPayment}
                    >
                      Continue with Coupon Code
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pack365Payment;
