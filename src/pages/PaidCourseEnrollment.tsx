
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  skills: string[];
  image: string;
  isPaid: boolean;
}

const PaidCourseEnrollment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      foundCourse = courses.find((c: Course) => c.id === id && c.isPaid);
    }
    
    if (!foundCourse && savedPack365) {
      const pack365Courses = JSON.parse(savedPack365);
      foundCourse = pack365Courses.find((c: Course) => c.id === id && c.isPaid);
    }
    
    setCourse(foundCourse);
  };

  const handlePayment = () => {
    if (!course) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo
      
      if (isSuccess) {
        // Save payment record
        const paymentData = {
          id: Date.now().toString(),
          studentName: 'Student User', // In a real app, this would come from auth
          studentEmail: 'student@example.com',
          courseName: course.title,
          courseType: course.duration === '365 days' ? 'pack365' : 'regular',
          amount: course.price,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'completed'
        };

        // Save to localStorage (in a real app, this would go to a backend)
        const existingPayments = localStorage.getItem('studentPayments');
        const payments = existingPayments ? JSON.parse(existingPayments) : [];
        payments.push(paymentData);
        localStorage.setItem('studentPayments', JSON.stringify(payments));

        navigate(`/payment-success?courseId=${courseId}&type=course`);
      } else {
        navigate(`/payment-failed?courseId=${courseId}&type=course`);
      }
      setIsProcessing(false);
    }, 3000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                  <span className="text-lg font-medium">Premium Course</span>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Premium
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Full access included</span>
                  <span className="text-2xl font-bold">${course.price}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment with Razorpay</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Lifetime access to materials</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>Certificate upon completion</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Priority support</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                </div>
                
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                >
                  {isProcessing ? 'Processing Payment...' : 'Pay with Razorpay'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaidCourseEnrollment;
