
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentGateway from '@/components/PaymentGateway';
import { courseApi } from '@/services/api';

interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  totalDuration: string;
  coursePrice: number;
  skillsYoullLearn: string[];
  courseImageLink: string;
  courseType: 'paid' | 'unpaid';
}

const CoursePayment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const response = await courseApi.getCourseById(courseId);
        setCourse(response.course || response);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      navigate(`/payment-success?courseId=${courseId}&type=course`);
    } else {
      navigate(`/payment-failed?courseId=${courseId}&type=course`);
    }
  };

  const handleProceedToPayment = () => {
    setShowPaymentGateway(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (showPaymentGateway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <PaymentGateway
            amount={course.coursePrice}
            courseName={course.courseName}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setShowPaymentGateway(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate(`/course-enrollment/${courseId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course Details
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={course.courseImageLink}
                  alt={course.courseName}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold">{course.courseName}</h3>
                <p className="text-gray-600">{course.courseDescription}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Instructor:</span>
                    <span className="font-medium">{course.instructorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{course.totalDuration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Skills you'll learn:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.skillsYoullLearn && course.skillsYoullLearn.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
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
                    <span className="text-lg font-medium">Course Fee</span>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Premium
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">One-time payment</span>
                    <span className="text-2xl font-bold">₹{course.coursePrice}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment Gateway</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Clock className="h-4 w-4" />
                    <span>Lifetime access to course</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Certificate upon completion</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">₹{course.coursePrice}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleProceedToPayment}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    >
                      Proceed to Payment Gateway
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const params = new URLSearchParams({
                          courseId: courseId || '',
                          courseName: course.courseName,
                          amount: course.coursePrice.toString(),
                          type: 'course'
                        });
                        navigate(`/coupon-code?${params.toString()}`);
                      }}
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
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

export default CoursePayment;
