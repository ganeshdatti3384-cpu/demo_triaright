
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const type = searchParams.get('type');
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    // Get course name based on type and courseId
    if (courseId && type) {
      const storageKey = type === 'pack365' ? 'pack365Courses' : 'adminCourses';
      const savedCourses = localStorage.getItem(storageKey);
      if (savedCourses) {
        const courses = JSON.parse(savedCourses);
        const course = courses.find((c: any) => c.id === courseId);
        if (course) {
          setCourseName(course.title);
        }
      }
    }
  }, [courseId, type]);

  return (
    <><Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
      throw new Error('Function not implemented.');
    } } /><div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment has been processed successfully. You now have access to:
          </p>

          {courseName && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">{courseName}</h3>
              <p className="text-sm text-green-600 mt-1">
                {type === 'pack365' ? '365 days access' : 'Lifetime access'}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </div>

          <div className="space-y-2 pt-4">
            <Button
              onClick={() => navigate('/student-dashboard')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Go to My Courses
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </>
  );
};

export default PaymentSuccess;
