
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  CheckCircle, 
  PlayCircle, 
  FileText,
  ShoppingCart,
  Lock,
  ChevronRight,
  Globe,
  Award,
  Download,
  Smartphone,
  Infinity
} from 'lucide-react';
import { Pack365Bundle, Pack365Course } from '@/types/api';

const Pack365BundleDetail = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundle, setBundle] = useState<Pack365Bundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundleDetails();
  }, [stream]);

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from API
      const mockBundle: Pack365Bundle = {
        _id: `bundle-${stream}`,
        name: `${stream?.toUpperCase()} Pack 365`,
        stream: stream as 'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance',
        description: `Comprehensive ${stream?.toUpperCase()} bundle with industry-relevant courses and certifications`,
        price: 999,
        originalPrice: 1999,
        discount: 50,
        totalVideos: 150,
        totalHours: 120,
        features: [
          'Industry-relevant curriculum',
          'Expert instructors',
          'Hands-on projects',
          'Certificate of completion',
          'Job placement assistance',
          'Lifetime access to materials',
          '24/7 support'
        ],
        image: `/lovable-uploads/${stream?.charAt(0).toUpperCase() + stream?.slice(1)} Pack 365.png`,
        isActive: true,
        courses: [
          {
            _id: `course-${stream}-1`,
            id: `course-${stream}-1`,
            courseName: `${stream?.toUpperCase()} Fundamentals`,
            description: `Learn the basics of ${stream?.toUpperCase()} development`,
            stream: stream || 'it',
            videoCount: 25,
            totalHours: 20,
            totalDuration: 1200,
            topics: [
              { name: 'Introduction', link: '#', duration: 30 },
              { name: 'Core Concepts', link: '#', duration: 45 },
              { name: 'Practical Applications', link: '#', duration: 60 }
            ]
          },
          {
            _id: `course-${stream}-2`,
            id: `course-${stream}-2`,
            courseName: `Advanced ${stream?.toUpperCase()} Techniques`,
            description: `Master advanced concepts in ${stream?.toUpperCase()}`,
            stream: stream || 'it',
            videoCount: 35,
            totalHours: 30,
            totalDuration: 1800,
            topics: [
              { name: 'Advanced Topics', link: '#', duration: 90 },
              { name: 'Best Practices', link: '#', duration: 75 },
              { name: 'Industry Standards', link: '#', duration: 80 }
            ]
          },
          {
            _id: `course-${stream}-3`,
            id: `course-${stream}-3`,
            courseName: `${stream?.toUpperCase()} Project Management`,
            description: `Learn project management in ${stream?.toUpperCase()}`,
            stream: stream || 'it',
            videoCount: 30,
            totalHours: 25,
            totalDuration: 1500,
            topics: [
              { name: 'Project Planning', link: '#', duration: 60 },
              { name: 'Team Management', link: '#', duration: 55 },
              { name: 'Quality Assurance', link: '#', duration: 70 }
            ]
          }
        ]
      };
      setBundle(mockBundle);
    } catch (error) {
      toast({
        title: 'Error loading bundle',
        description: 'Failed to load bundle details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    // Check if user is logged in
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
    
    // Navigate to payment page
    navigate(`/pack365/payment/${stream}`, { state: { bundle } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h2>
          <p className="text-gray-600 mb-6">The requested bundle could not be found.</p>
          <Button onClick={() => navigate('/pack365')}>
            Back to Pack365
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-yellow-500 text-black">
                {bundle.discount}% OFF - Limited Time
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{bundle.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{bundle.description}</p>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  <span>{bundle.totalVideos} Videos</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{bundle.totalHours} Hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>{bundle.courses.length} Courses</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <div className="text-3xl font-bold">₹{bundle.price}</div>
                <div className="text-lg text-blue-200 line-through">₹{bundle.originalPrice}</div>
                <Badge variant="secondary">{bundle.discount}% OFF</Badge>
              </div>

              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                onClick={handleEnrollClick}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Enroll Now
              </Button>
            </div>

            <div className="flex justify-center">
              <img
                src={bundle.image}
                alt={bundle.name}
                className="w-full max-w-md rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bundle.courses.map((course: Pack365Course, index: number) => (
                    <div key={course._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{course.courseName}</h3>
                          <p className="text-gray-600 mb-3">{course.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              {course.videoCount} videos
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {course.totalHours} hours
                            </div>
                          </div>

                          {/* Topics */}
                          <div className="space-y-2">
                            {course.topics?.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center">
                                  <PlayCircle className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm">{topic.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {topic.duration} min
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Lock className="h-5 w-5 text-gray-400 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bundle.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
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
              <CardHeader>
                <CardTitle className="text-center">Bundle Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹{bundle.price}</div>
                  <div className="text-lg text-gray-500 line-through">₹{bundle.originalPrice}</div>
                  <Badge className="mt-2">Save ₹{bundle.originalPrice - bundle.price}</Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Videos</span>
                    <span className="font-semibold">{bundle.totalVideos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Duration</span>
                    <span className="font-semibold">{bundle.totalHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Courses Included</span>
                    <span className="font-semibold">{bundle.courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Certificate</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>

                <Separator />

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleEnrollClick}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Enroll Now
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bundle Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bundle Includes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Infinity className="h-4 w-4 mr-2 text-green-500" />
                  Lifetime access
                </div>
                <div className="flex items-center text-sm">
                  <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                  Mobile & desktop access
                </div>
                <div className="flex items-center text-sm">
                  <Download className="h-4 w-4 mr-2 text-green-500" />
                  Downloadable resources
                </div>
                <div className="flex items-center text-sm">
                  <Award className="h-4 w-4 mr-2 text-green-500" />
                  Certificate of completion
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Community access
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pack365BundleDetail;
