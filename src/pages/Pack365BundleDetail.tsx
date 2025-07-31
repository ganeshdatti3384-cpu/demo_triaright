
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Play, FileText, Users, Star, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { pack365Api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Course {
  _id: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink?: string;
  totalDuration: number;
  topics: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  courseId: string;
}

interface StreamData {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  courses: Course[];
}

const Pack365BundleDetail = () => {
  const { streamName } = useParams<{ streamName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    loadStreamData();
    checkEnrollmentStatus();
  }, [streamName]);

  const loadStreamData = async () => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllStreams();
      if (response.success && response.streams) {
        const stream = response.streams.find(
          (s: StreamData) => s.name.toLowerCase() === streamName?.toLowerCase()
        );
        if (stream) {
          setStreamData(stream);
          console.log(stream)
        } else {
          toast({
            title: 'Error',
            description: 'Stream not found',
            variant: 'destructive'
          });
          navigate('/pack365');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load stream data',
        variant: 'destructive'
      });
      navigate('/pack365');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const enrollmentsResponse = await pack365Api.getMyEnrollments(token);
      if (enrollmentsResponse.success && enrollmentsResponse.enrollments) {
        const streamEnrollment = enrollmentsResponse.enrollments.find(
          (enrollment: any) => enrollment.stream?.toLowerCase() === streamName?.toLowerCase()
        );
        setEnrollment(streamEnrollment);
      }
    } catch (error) {
      console.log('Error checking enrollment:', error);
    }
  };

  const handleEnrollClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to enroll in this bundle',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    if (streamData) {
      navigate('/razorpay-payment', {
        state: {
          streamName: streamData.name,
          fromStream: true,
          coursesCount: streamData.courses.length,
          streamPrice: streamData.price
        }
      });
    }
  };

  const handleStartLearning = () => {
    if (streamData) {
      navigate(`/pack365-learning/${streamData.name.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bundle details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!streamData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h2>
            <p className="text-gray-600 mb-6">The requested bundle could not be found.</p>
            <Button onClick={() => navigate('/pack365')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pack365
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalDuration = streamData.courses.reduce((total, course) => total + course.totalDuration, 0);
  const totalTopics = streamData.courses.reduce((total, course) => total + course.topics.length, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header Section */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={streamData.imageUrl} 
            alt={`${streamData.name} Bundle`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-white">
                <Button 
                  onClick={() => navigate('/pack365')}
                  variant="ghost"
                  className="text-white hover:bg-white/20 mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pack365
                </Button>
                
                <Badge className="bg-blue-600 text-white mb-4">Pack365 Bundle</Badge>
                <h1 className="text-5xl font-bold mb-4">{streamData.name} Bundle</h1>
                <p className="text-xl text-gray-200 mb-6">
                  Master {streamData.name} with our comprehensive course collection
                </p>
                
                <div className="flex items-center space-x-6 text-gray-200">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{streamData.courses.length} Courses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{totalDuration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>{totalTopics} Topics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enrollment Status */}
              {enrollment && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">You're Enrolled!</h3>
                        <p className="text-green-600">
                          Enrolled on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bundle Features */}
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Get</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Complete Course Collection</h4>
                        <p className="text-sm text-gray-600">Access all {streamData.courses.length} courses in the {streamData.name} stream</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-medium">365 Days Access</h4>
                        <p className="text-sm text-gray-600">Full year access to all content and updates</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Downloadable Resources</h4>
                        <p className="text-sm text-gray-600">Course materials and documents included</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Certificates</h4>
                        <p className="text-sm text-gray-600">Earn certificates upon course completion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Courses List */}
              <Card>
                <CardHeader>
                  <CardTitle>Included Courses ({streamData.courses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {streamData.courses.map((course, index) => (
                      <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <h4 className="font-medium text-lg">{course.courseName}</h4>
                            </div>
                            <p className="text-gray-600 mb-3">{course.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.totalDuration} minutes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Play className="h-4 w-4" />
                                <span>{course.topics.length} topics</span>
                              </div>
                              {course.documentLink && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-4 w-4" />
                                  <span>Resources included</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ₹{streamData.price}
                    </div>
                    <p className="text-gray-600">One-time payment</p>
                    <p className="text-sm text-gray-500">Includes 18% GST</p>
                  </div>

                  {enrollment ? (
                    <Button 
                      onClick={handleStartLearning}
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEnrollClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    >
                      Enroll Now - ₹{streamData.price}
                    </Button>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span>₹{streamData.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">GST (18%):</span>
                      <span>₹{Math.round(streamData.price * 0.18)}</span>
                    </div>
                    <hr />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{Math.round(streamData.price * 1.18)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bundle Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bundle Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Total Courses</span>
                      </div>
                      <Badge>{streamData.courses.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Total Duration</span>
                      </div>
                      <Badge>{Math.round(totalDuration / 60)} hours</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Total Topics</span>
                      </div>
                      <Badge>{totalTopics}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Access Period</span>
                      </div>
                      <Badge>365 Days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pack365BundleDetail;
