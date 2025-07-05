
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Play, Clock, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: string;
  originalPrice: string;
  image: string;
  skills: string[];
  rating: number;
  studentsEnrolled: number;
  isPaid: boolean;
}

const CourseEnrollment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    // Load course from localStorage based on courseId
    const savedRecordedCourses = localStorage.getItem('adminCourses');
    const savedLiveCourses = localStorage.getItem('liveCourses');
    
    if (savedRecordedCourses || savedLiveCourses) {
      const recordedCourses = savedRecordedCourses ? JSON.parse(savedRecordedCourses) : [];
      const liveCourses = savedLiveCourses ? JSON.parse(savedLiveCourses) : [];
      const allCourses = [...recordedCourses, ...liveCourses];
      
      const foundCourse = allCourses.find((c: Course) => c.id === courseId);
      setCourse(foundCourse);
    }
  }, [courseId]);

  const handleEnrollment = () => {
    if (!course) return;

    if (course.isPaid) {
      // Redirect to payment page for paid courses
      navigate(`/course-payment/${courseId}`);
    } else {
      // Direct enrollment for free courses
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const newEnrollment = {
        courseId: course.id,
        title: course.title,
        instructor: course.instructor,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false
      };
      
      enrolledCourses.push(newEnrollment);
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in this free course."
      });
      
      navigate('/student-dashboard');
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses/recorded')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar onOpenAuth={() => {}} />
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
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Instructor:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Level:</span>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Students:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{course.studentsEnrolled.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-gray-500">Skills you'll learn:</span>
                  <div className="flex flex-wrap gap-1">
                    {course.skills.map((skill, index) => (
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
                {course.isPaid ? (
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
                        <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                        <span className="text-lg text-gray-500 line-through ml-2">{course.originalPrice}</span>
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
                    <span>Join {course.studentsEnrolled.toLocaleString()}+ students</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    onClick={handleEnrollment}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  >
                    {course.isPaid ? `Enroll Now - ${course.price}` : 'Start Free Course'}
                  </Button>
                </div>

                {course.isPaid && (
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
    </>
  );
};

export default CourseEnrollment;
