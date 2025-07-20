
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, PlayCircle, Star, Users, CheckCircle, Lock } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Pack365BundleDetail = () => {
  const { streamName } = useParams<{ streamName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [loading, setLoading] = useState(true);

  const streamConfig: { [key: string]: { displayName: string; image: string; description: string; features: string[]; } } = {
    'IT': { 
      displayName: 'IT Bundle', 
      image: '/lovable-uploads/IT Pack365.png',
      description: 'Master the world of Information Technology with comprehensive courses covering programming, web development, databases, and more.',
      features: ['Full Stack Development', 'Database Management', 'Cloud Computing', 'DevOps & Deployment', 'Mobile App Development']
    },
    'PHARMA': { 
      displayName: 'Pharma Bundle', 
      image: '/lovable-uploads/Pharma Pack 365.png',
      description: 'Comprehensive pharmaceutical education covering drug development, regulations, quality control, and industry best practices.',
      features: ['Drug Development Process', 'Regulatory Affairs', 'Quality Control & Assurance', 'Clinical Research', 'Pharmaceutical Marketing']
    },
    'MARKETING': { 
      displayName: 'Marketing Bundle', 
      image: '/lovable-uploads/Marketing Pack 365.png',
      description: 'Complete digital marketing mastery including SEO, social media, content marketing, and analytics.',
      features: ['Digital Marketing Strategy', 'SEO & SEM', 'Social Media Marketing', 'Content Marketing', 'Analytics & Reporting']
    },
    'HR': { 
      displayName: 'HR Bundle', 
      image: '/lovable-uploads/HR Pack 365.png',
      description: 'Human Resources excellence covering recruitment, employee management, compliance, and organizational development.',
      features: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'HR Analytics', 'Compliance & Legal']
    },
    'FINANCE': { 
      displayName: 'Finance Bundle', 
      image: '/lovable-uploads/Finance Pack 365.png',
      description: 'Financial expertise development including accounting, investment analysis, risk management, and financial planning.',
      features: ['Financial Analysis', 'Investment Management', 'Risk Assessment', 'Corporate Finance', 'Financial Planning']
    }
  };

  useEffect(() => {
    loadCourses();
  }, [streamName]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllCourses();
      if (response.success && streamName) {
        const filteredCourses = response.data.filter(
          course => course.stream.toLowerCase() === streamName.toLowerCase()
        );
        setCourses(filteredCourses);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
    navigate('/payment-selection', { state: { streamName, fromStream: true } });
  };

  if (!streamName || !streamConfig[streamName.toUpperCase()]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h1>
            <Button onClick={() => navigate('/pack365')}>Back to Pack365</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const streamData = streamConfig[streamName.toUpperCase()];
  const totalVideos = courses.reduce((acc, course) => acc + (course.videoCount || 0), 0);
  const totalHours = courses.reduce((acc, course) => acc + (course.totalHours || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/pack365')}
            variant="outline"
            className="mb-6"
          >
            ← Back to All Bundles
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4">
                Pack 365
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {streamData.displayName}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {streamData.description}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <PlayCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{totalVideos}</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={streamData.image} 
                alt={streamData.displayName}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              What You'll Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              Included Courses ({courses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{course.courseName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <PlayCircle className="h-4 w-4" />
                            <span>{course.videoCount || 0} videos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.totalHours || 0} hours</span>
                          </div>
                          <Badge variant="outline">{course.stream}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">All Levels</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Courses are being uploaded for this bundle...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get Full Access
              </h2>
              <div className="text-5xl font-bold text-blue-600 mb-2">₹365</div>
              <p className="text-gray-600 mb-6">One-time payment • 365 days access</p>
              
              <div className="flex items-center justify-center space-x-6 mb-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Certificate of Completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
              
              <Button 
                onClick={handleEnrollNow}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Lock className="h-5 w-5 mr-2" />
                Login to Enroll Now
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Secure payment • 30-day money-back guarantee
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Pack365BundleDetail;
