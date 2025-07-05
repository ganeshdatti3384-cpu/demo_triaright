
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, BookOpen, Clock, Users } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  skills: string[];
  image: string;
  isPaid: boolean;
}

const FreeCourseEnrollment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  const loadCourse = (id: string) => {
    // Check both regular courses and Pack365 courses
    const savedCourses = localStorage.getItem('adminCourses');
    const savedPack365 = localStorage.getItem('pack365Courses');
    
    let foundCourse = null;
    
    if (savedCourses) {
      const courses = JSON.parse(savedCourses);
      foundCourse = courses.find((c: Course) => c.id === id && !c.isPaid);
    }
    
    if (!foundCourse && savedPack365) {
      const pack365Courses = JSON.parse(savedPack365);
      foundCourse = pack365Courses.find((c: Course) => c.id === id && !c.isPaid);
    }
    
    setCourse(foundCourse);
  };

  const handleEnrollment = () => {
    if (!course) return;

    // Save enrollment data
    const enrollmentData = {
      studentName: 'Student User', // In a real app, this would come from auth
      studentEmail: 'student@example.com',
      courseId: course.id,
      courseName: course.title,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'enrolled',
      type: 'free'
    };

    // Save to localStorage (in a real app, this would go to a backend)
    const existingEnrollments = localStorage.getItem('studentEnrollments');
    const enrollments = existingEnrollments ? JSON.parse(existingEnrollments) : [];
    enrollments.push(enrollmentData);
    localStorage.setItem('studentEnrollments', JSON.stringify(enrollments));

    setIsEnrolled(true);
    
    toast({
      title: 'Enrollment Successful!',
      description: `You have been enrolled in ${course.title}`,
    });
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Button onClick={() => navigate('/student')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Enrollment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You have been successfully enrolled in:
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">{course.title}</h3>
              <p className="text-sm text-green-600 mt-1">Free Course</p>
            </div>

            <div className="text-sm text-gray-500">
              You can now access the course materials and start learning!
            </div>

            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => navigate('/student')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Course Details</CardTitle>
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

          {/* Enrollment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Free Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">Free Course</span>
                  <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                    FREE
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Full access included</span>
                  <span className="text-2xl font-bold text-green-600">$0</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Instant access to all materials</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Users className="h-4 w-4" />
                  <span>Join the learning community</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>Learn at your own pace</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total Cost</span>
                  <span className="text-2xl font-bold text-green-600">FREE</span>
                </div>
                
                <Button 
                  onClick={handleEnrollment}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-3"
                >
                  Enroll Now - Start Learning!
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By enrolling, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeCourseEnrollment;
