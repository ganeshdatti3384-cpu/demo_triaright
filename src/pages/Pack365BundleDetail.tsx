
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Shield, Clock, IndianRupee, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { pack365Api } from '@/services/api';
import { Pack365Course } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';

const Pack365BundleDetail = () => {
  const { streamName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundleData, setBundleData] = useState<{ courses: Pack365Course[] }>({ courses: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

        const response = await pack365Api.getAllStreams();
        if (response.success && response.courses) {
          const filteredCourses = response.courses.filter(course => course.stream === streamName);
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

    // Navigate to payment with bundle details
    navigate('/razorpay-payment', {
      state: {
        streamName: streamName,
        fromStream: true,
        coursesCount: bundleData.courses.length
      }
    });
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
        <div className="max-w-4xl mx-auto px-4 py-12">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bundleData.courses.map((course) => (
                  <div key={course._id} className="border rounded-lg p-4">
                    <img
                      src={course.documentLink}
                      alt={course.courseName}
                      className="w-full h-32 object-cover rounded-md mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <h3 className="text-lg font-semibold">{course.courseName}</h3>
                    <p className="text-gray-600 text-sm">{course.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <span className="text-lg font-medium">Pack365 Bundle</span>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Premium
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Full year access</span>
                  <span className="text-2xl font-bold">₹365</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment Gateway</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>365 days unlimited access</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Shield className="h-4 w-4" />
                  <span>Certificate upon completion</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">₹365</span>
                </div>

                <Button
                  onClick={handleEnrollNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                >
                  <IndianRupee className="h-5 w-5 mr-2" />
                  Enroll Now for ₹365
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our{' '}
                <a 
                  href="/terms-conditions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Terms of Service
                </a>
                {', '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Privacy Policy
                </a>
                {', and '}
                <a 
                  href="/refund-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Refund Policy
                </a>
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
