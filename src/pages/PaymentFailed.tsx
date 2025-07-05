
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, RefreshCw } from 'lucide-react';
<<<<<<< HEAD
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
=======
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae

const PaymentFailed = () => {
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

  const handleRetryPayment = () => {
    if (type === 'pack365' && courseId) {
      navigate(`/pack365/payment/${courseId}`);
    } else {
      navigate('/courses');
    }
  };

  return (
<<<<<<< HEAD
    <><Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
      throw new Error('Function not implemented.');
    } } /><div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircle className="h-12 w-12 text-red-600" />
=======
    <>
    <Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
        throw new Error('Function not implemented.');
      } } />
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We couldn't process your payment. This might be due to:
          </p>

          <div className="bg-red-50 p-4 rounded-lg text-left">
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Network connection issues</li>
              <li>• Incorrect payment details</li>
              <li>• Bank server temporarily unavailable</li>
            </ul>
          </div>

          {courseName && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800">{courseName}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your course selection is still available
              </p>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We couldn't process your payment. This might be due to:
            </p>

<<<<<<< HEAD
            <div className="bg-red-50 p-4 rounded-lg text-left">
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Network connection issues</li>
                <li>• Incorrect payment details</li>
                <li>• Bank server temporarily unavailable</li>
              </ul>
            </div>

            {courseName && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">{courseName}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your course selection is still available
                </p>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Button
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
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

            <div className="text-xs text-gray-500">
              If the problem persists, please contact our support team.
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
      </>
=======
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
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

          <div className="text-xs text-gray-500">
            If the problem persists, please contact our support team.
          </div>
        </CardContent>
      </Card>
    </div><Footer /></>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
  );
};

export default PaymentFailed;
