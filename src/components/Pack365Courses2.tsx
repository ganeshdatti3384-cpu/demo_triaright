/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users, ArrowRight, Star, Trophy } from 'lucide-react';
import { pack365Api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface StreamData {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  // courses property is not available from backend
}

// Mock courses data for display purposes
const mockCoursesByStream: { [key: string]: number } = {
  'Full Stack Development': 8,
  'Data Science': 6,
  'Mobile Development': 5,
  'Cyber Security': 7,
  'Cloud Computing': 4,
  'Digital Marketing': 5
};

const Pack365Courses2 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllStreams();
      console.log('Streams response:', response); // Debug log
      if (response.success && response.streams) {
        setStreams(response.streams);
      } else {
        setStreams([]);
      }
    } catch (error: any) {
      console.error('Error loading streams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load streams',
        variant: 'destructive'
      });
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  // Get course count for a stream (mock data)
  const getCourseCount = (streamName: string) => {
    return mockCoursesByStream[streamName] || 5; // Default to 5 courses
  };

  // Get course description based on stream
  const getCourseDescription = (streamName: string) => {
    const descriptions: { [key: string]: string } = {
      'Full Stack Development': 'Master frontend and backend development with modern technologies and real-world projects.',
      'Data Science': 'Learn data analysis, machine learning, and visualization with Python and industry tools.',
      'Mobile Development': 'Build cross-platform mobile apps with React Native and Flutter frameworks.',
      'Cyber Security': 'Protect systems and networks with ethical hacking and security best practices.',
      'Cloud Computing': 'Deploy and manage applications on AWS, Azure, and Google Cloud platforms.',
      'Digital Marketing': 'Master SEO, social media marketing, and analytics to drive business growth.'
    };
    return descriptions[streamName] || `Master ${streamName} with our comprehensive course collection including projects and career support.`;
  };

  const handleEnrollClick = (streamName: string, streamPrice: number) => {
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

    const coursesCount = getCourseCount(streamName);
    
    navigate('/razorpay-payment', {
      state: {
        streamName,
        fromStream: true,
        coursesCount,
        streamPrice
      }
    });
  };

  const handleLearnMoreClick = (streamName: string) => {
    navigate(`/pack365/bundle/${streamName.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2">
            Pack365 Premium Bundles
          </Badge>
    
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Industry Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Expert Mentors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-500" />
              <span>365 Days Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {streams.length === 0 && !loading ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No course bundles available</h3>
            <p className="text-gray-500 mb-6">We're preparing amazing course bundles for you. Check back soon!</p>
            <Button 
              onClick={loadStreams}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streams.map((stream) => {
              const courseCount = getCourseCount(stream.name);
              const description = getCourseDescription(stream.name);
              
              return (
                <Card key={stream._id} className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={stream.imageUrl || '/api/placeholder/400/250'} 
                      alt={`${stream.name} Bundle`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        {courseCount} Courses
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{stream.name} Bundle</h3>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-800">Complete {stream.name} Package</CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">₹{stream.price}</div>
                        <div className="text-xs text-gray-500">+ GST</div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{courseCount} Courses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>365 Days</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Package Includes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• All {stream.name} courses</li>
                          <li>• Hands-on projects</li>
                          <li>• Course certificates</li>
                          <li>• 365 days access</li>
                          <li>• Learning resources</li>
                          <li>• Community support</li>
                        </ul>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button 
                          onClick={() => handleLearnMoreClick(stream.name)}
                          variant="outline" 
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Learn More
                        </Button>
                        <Button 
                          onClick={() => handleEnrollClick(stream.name, stream.price)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Enroll Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pack365Courses2;
