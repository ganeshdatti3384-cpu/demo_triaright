import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Play, Clock, Users, Star, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { courseApi } from '@/services/api';

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  totalDuration: number;
  courseType: 'paid' | 'unpaid';
  price: number;
  courseImageLink: string;
  stream: string;
  curriculum: Array<{
    topicName: string;
    topicCount: number;
    subtopics: Array<{
      name: string;
      link: string;
      duration: number;
    }>;
  }>;
  // Legacy compatibility
  id?: string;
  title?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  originalPrice?: string;
  isPaid?: boolean;
  image?: string;
  skills?: string[];
  rating?: number;
  studentsEnrolled?: number;
}

const CourseEnrollment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const courseData = await courseApi.getCourseById(courseId);
      setCourse(courseData.course || courseData);
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!course) return;
    
    const isPaid = course.courseType === 'paid' || course.isPaid;
    
    if (isPaid) {
      // For paid courses, redirect to payment
      navigate(`/course-payment/${courseId}`);
    } else {
      // For free courses, show confirmation dialog
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!course) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in courses.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      setShowConfirmDialog(false);
      
      const response = await courseApi.enrollInCourse(token, courseId!);
      
      if (response.success) {
        setEnrollmentSuccess(true);
        toast({
          title: "Enrollment Successful!",
          description: "You have been successfully enrolled in this free course.",
        });
      } else {
        throw new Error(response.message || 'Enrollment failed');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  // Normalize course data for display
  const normalizedCourse = course ? {
    id: course._id || course.id || '',
    courseId: course.courseId || course.id || '',
    title: course.courseName || course.title || '',
    description: course.courseDescription || course.description || '',
    instructor: course.instructorName || course.instructor || '',
    duration: course.totalDuration ? `${course.totalDuration} minutes` : course.duration || '',
    level: course.stream || course.level || 'Beginner',
    price: course.courseType === 'paid' ? `₹${course.price}` : course.price || '₹0',
    originalPrice: course.originalPrice || (course.courseType === 'paid' ? `₹${Math.round(course.price * 1.5)}` : '₹0'),
    isPaid: course.courseType === 'paid' || course.isPaid || false,
    image: course.courseImageLink || course.image || '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    skills: course.curriculum?.slice(0, 3).map(topic => topic.topicName) || course.skills || [],
    rating: course.rating || 4.5,
    studentsEnrolled: course.studentsEnrolled || Math.floor(Math.random() * 1000) + 100,
  } : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading course...</h2>
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
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (enrollmentSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Enrollment Successful!</h2>
                  <p className="text-gray-600">
                    You have been successfully enrolled in <strong>{normalizedCourse?.title}</strong>
                  </p>
                </div>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate(`/course-learning/${courseId}`)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/student')}
                    className="w-full"
                  >
                    Back to Dashboard
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
                  src={normalizedCourse.image}
                  alt={normalizedCourse.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold">{normalizedCourse.title}</h3>
                <p className="text-gray-600">{normalizedCourse.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Instructor:</span>
                    <span className="font-medium">{normalizedCourse.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{normalizedCourse.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Level:</span>
                    <Badge variant="outline">{normalizedCourse.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{normalizedCourse.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Students:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{normalizedCourse.studentsEnrolled.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Skills you'll learn:</span>
                  <div className="flex flex-wrap gap-1">
                    {normalizedCourse.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Play className="h-6 w-6 mr-2" />
                  {course.isPaid ? 'Enroll Now' : 'Start Learning'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {normalizedCourse.isPaid ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">Course Price</span>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Premium
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">One-time payment</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{normalizedCourse.price}</span>
                        <span className="text-lg text-gray-500 line-through ml-2">{normalizedCourse.originalPrice}</span>
                      </div>
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
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Users className="h-4 w-4" />
                    <span>Join {normalizedCourse.studentsEnrolled.toLocaleString()}+ students</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  >
                    {enrolling ? 'Enrolling...' : (normalizedCourse.isPaid ? `Enroll Now - ${normalizedCourse.price}` : 'Enroll Now')}
                  </Button>
                </div>

                {normalizedCourse.isPaid && (
                  <div className="text-xs text-gray-500 text-center">
                    30-day money-back guarantee
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />

      {/* Confirmation Dialog for Free Course Enrollment */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enroll in <strong>{normalizedCourse?.title}</strong>? 
              This is a free course and you'll get immediate access to all content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEnrollment}
              disabled={enrolling}
              className="bg-green-600 hover:bg-green-700"
            >
              {enrolling ? 'Enrolling...' : 'Yes, Enroll Me'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseEnrollment;
