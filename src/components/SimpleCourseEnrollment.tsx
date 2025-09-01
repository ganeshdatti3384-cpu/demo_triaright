import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Play, Clock, BookOpen, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EnhancedCourse } from '@/types/api';
import { courseApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const SimpleCourseEnrollment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<EnhancedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await courseApi.getAllCourses(token);
      if (response.success) {
        const foundCourse = response.courses.find((c: EnhancedCourse) => c.courseId === courseId);
        setCourse(foundCourse || null);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!course || !user) return;

    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');

      if (course.courseType === 'paid') {
        navigate(`/course-payment/${courseId}`);
      } else {
        const response = await courseApi.enrollInCourse(courseId!, token);
        if (response.success) {
          toast({
            title: "Enrollment Successful!",
            description: "You have been enrolled in this free course."
          });
          navigate('/student-dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Enrollment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h2 className="text-2xl font-bold mb-4">Course not found</h2>
            <Button onClick={() => navigate('/student-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={course.courseImageLink}
                  alt={course.courseName}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
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
                      <span className="font-medium">{course.totalDuration} minutes</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stream:</span>
                    <Badge variant="outline" className="capitalize">{course.stream}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Certification:</span>
                    <Badge variant={course.certificationProvided === 'yes' ? 'default' : 'secondary'}>
                      {course.certificationProvided === 'yes' ? 'Provided' : 'Not Provided'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Course Curriculum:</span>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{course.curriculum.length} Topics</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {course.curriculum.slice(0, 5).map((topic, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span>{topic.topicName}</span>
                          <span className="text-gray-500">{topic.subtopics.length} lessons</span>
                        </div>
                      ))}
                      {course.curriculum.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{course.curriculum.length - 5} more topics...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Play className="h-6 w-6 mr-2" />
                  {course.courseType === 'paid' ? 'Enroll Now' : 'Start Learning'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {course.courseType === 'paid' ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">Course Price</span>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Premium
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">Free Course</span>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        FREE
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Start learning immediately at no cost
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Play className="h-4 w-4" />
                    <span>Lifetime access to course content</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Clock className="h-4 w-4" />
                    <span>Learn at your own pace</span>
                  </div>
                  {course.certificationProvided === 'yes' && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Award className="h-4 w-4" />
                      <span>Certificate upon completion</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3">
                        {course.courseType === 'paid' ? `Enroll Now - ₹${course.price}` : 'Join Free Course'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to enroll in "{course.courseName}"?
                          {course.courseType === 'paid' 
                            ? ' You will be redirected to the payment gateway.' 
                            : ' You will get instant access to all course materials.'
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleEnrollment}
                          disabled={enrolling}
                        >
                          {enrolling ? 'Processing...' : 'Confirm'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {course.courseType === 'paid' && (
                  <div className="text-xs text-gray-500 text-center">
                    Secure payment • 30-day money-back guarantee
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SimpleCourseEnrollment;