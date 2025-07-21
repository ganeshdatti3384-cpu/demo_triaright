/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';
import { pack365Api } from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Pack365Payment = () => {
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      if (!courseId || !token) {
        toast({
          title: 'Missing Information',
          description: 'Course ID or authentication token is missing.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      try {
        const courseResponse = await pack365Api.getCourseById(courseId, token);
        if (courseResponse.success && courseResponse.data) {
          setCourse(courseResponse.data);
        } else {
          toast({
            title: 'Error Fetching Course',
            description: courseResponse.message || 'Failed to fetch course details.',
            variant: 'destructive',
          });
        }

        const enrollmentStatus = await pack365Api.checkEnrollmentStatus(token, courseId);
        if (enrollmentStatus.success) {
          setEnrollment(enrollmentStatus.enrollment);
        } else {
          toast({
            title: 'Error Checking Enrollment',
            description: enrollmentStatus.message || 'Failed to check enrollment status.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Unexpected Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndEnrollment();
  }, [courseId, token, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading payment information...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Course details not found.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div>
                <h1 className="text-2xl font-semibold text-center">Payment Information</h1>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 space-y-4 text-gray-700">
                  {enrollment && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium text-green-800">Enrollment Confirmed</h3>
                          <p className="text-sm text-green-600">
                            You are successfully enrolled in {course.courseName}
                          </p>
                          <p className="text-xs text-green-500">
                            Enrolled on: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">{course.courseName}</p>
                        <p className="text-gray-600">{course.description}</p>
                        <div className="flex justify-between">
                          <Label>Price:</Label>
                          <span>₹{course.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {!enrollment && (
                    <div className="space-y-4">
                      <Button className="w-full" onClick={() => navigate(`/coupon-code?courseId=${courseId}`)}>
                        Apply Coupon Code
                      </Button>
                      <Button className="w-full" onClick={() => navigate(`/checkout?courseId=${courseId}`)}>
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pack365Payment;
