/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { pack365Api } from '@/services/api';
import { Pack365Course } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';

const Pack365BundleDetail = () => {
  const { streamName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [bundleData, setBundleData] = useState<{ courses: Pack365Course[] }>({ courses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundleDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please login to view bundle details',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }

        const response = await pack365Api.getAllCourses();
        if (response.success && response.data) {
          const filteredCourses = response.data.filter(course => course.stream === streamName);
          setBundleData({ courses: filteredCourses });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load bundle details',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching bundle details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bundle details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBundleDetails();
  }, [streamName, navigate, toast]);

  const handleEnrollNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in this bundle',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    navigate('/razorpay-payment', {
      state: {
        streamName,
        fromStream: true,
        coursesCount: bundleData.courses.length
      }
    });
  };
const streamImages: { [key: string]: string } = {
  IT: '/lovable-uploads/IT Pack365.png',
  Pharma: '/lovable-uploads/IT Pack365.png',
  HR: '/lovable-uploads/HR Pack365.png',
  Finance: '/lovable-uploads/Finance Pack365.png',
  Marketing: '/lovable-uploads/Marketing Pack365.png',
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading bundle details...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!bundleData || bundleData.courses.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bundle not found</h2>
            <p className="text-gray-600 mb-6">The requested bundle could not be found.</p>
            <Button onClick={() => navigate(`/${user?.role || 'student'}`)}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate(`/${user?.role || 'student'}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                {streamName} Bundle - {bundleData.courses.length} Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {bundleData.courses.map((course) => (
                  <div key={course._id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                    <img
                        src={course.documentLink || streamImages[course.stream] || '/placeholder.svg'}
                        alt={course.courseName}
                        className="w-full h-32 object-cover rounded-md mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = streamImages[course.stream] || '/placeholder.svg';
                        }}
                      />  
                    <h3 className="text-lg font-semibold mb-2 text-center">{course.courseName}</h3>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/course-learning/${course.courseId}`)}
                    >
                      Start Learning
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pack365BundleDetail;
