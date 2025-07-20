/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Pack365CoursesProps {
  showLoginRequired?: boolean;
  onLoginRequired?: () => void;
}

interface StreamData {
  name: string;
  displayName: string;
  image: string;
  courses: Pack365Course[];
}

const Pack365Courses = ({ showLoginRequired = false, onLoginRequired }: Pack365CoursesProps) => {
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredStream, setHoveredStream] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const streamConfig: { [key: string]: { displayName: string; image: string } } = {
    'IT': { displayName: 'IT Bundle', image: '/lovable-uploads/IT Pack365.png' },
    'PHARMA': { displayName: 'Pharma Bundle', image: '/lovable-uploads/Pharma Pack 365.png' },
    'MARKETING': { displayName: 'Marketing Bundle', image: '/lovable-uploads/Marketing Pack 365.png' },
    'HR': { displayName: 'HR Bundle', image: '/lovable-uploads/HR Pack 365.png' },
    'FINANCE': { displayName: 'Finance Bundle', image: '/lovable-uploads/Finance Pack 365.png' }
  };

  useEffect(() => {
    loadCoursesAndEnrollments();
    
    // Check URL params for post-coupon flow
    const urlParams = new URLSearchParams(window.location.search);
    const streamParam = urlParams.get('stream');
    const enrolledParam = urlParams.get('enrolled');
    
    if (streamParam && enrolledParam === 'true') {
      setSelectedStream(streamParam);
      setShowCourses(true);
      setShowEnrollment(false);
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadCoursesAndEnrollments = async () => {
    try {
      setLoading(true);
      const coursesResponse = await pack365Api.getAllCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      } else {
        setError('Failed to load courses');
        return;
      }

      const token = localStorage.getItem('token');
      if (token && !showLoginRequired) {
        try {
          const enrollmentsResponse = await pack365Api.getMyEnrollments(token);
          if (enrollmentsResponse.success && enrollmentsResponse.enrollments) {
            setEnrollments(enrollmentsResponse.enrollments);
          }
        } catch (enrollError) {
          console.log('No enrollments found or error loading enrollments:', enrollError);
        }
      }
    } catch (err: any) {
      console.error('Error loading courses:', err);
      setError(err.message || 'Failed to load courses');
      toast({ title: 'Error', description: 'Failed to load courses. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStreamData = (): StreamData[] => {
    return Object.keys(streamConfig).map(streamKey => {
      const streamCourses = courses.filter(course => course.stream.toLowerCase() === streamKey.toLowerCase());
      return {
        name: streamKey,
        displayName: streamConfig[streamKey].displayName,
        image: streamConfig[streamKey].image,
        courses: streamCourses
      };
    });
  };

  const handleCourseClick = (courseName: string) => {
    navigate('/coupon-code', { state: { courseName, fromCourse: true } });
  };

  const handleStreamClick = (streamName: string) => {
    const token = localStorage.getItem('token');
    if (showLoginRequired || !token) {
      if (onLoginRequired) onLoginRequired();
      else {
        toast({ title: 'Login Required', description: 'Please login to access courses.', variant: 'destructive' });
        navigate('/login');
      }
      return;
    }
    setSelectedStream(streamName);
    setShowEnrollment(true);
  };

  const handleEnrollNow = () => {
    navigate('/payment-selection', { state: { streamName: selectedStream, fromStream: true } });
  };

  const handleBackToBundles = () => {
    setSelectedStream(null);
    setShowEnrollment(false);
    setShowCourses(false);
  };

  const handleBackFromCourses = () => {
    setShowCourses(false);
    setShowEnrollment(true);
  };

  const getFilteredCourses = () => {
    if (!selectedStream) return [];
    return courses.filter(course => course.stream.toLowerCase() === selectedStream.toLowerCase());
  };

  if (loading) {
    return (
      <div className={showLoginRequired ? 'py-8' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={showLoginRequired ? 'py-8' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Streams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadCoursesAndEnrollments}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show enrollment view after clicking explore more
  if (showEnrollment && selectedStream) {
    const streamData = streamConfig[selectedStream];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackToBundles}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bundles
          </Button>
          
          <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm">
            <div className="relative h-64">
              <img 
                src={streamData.image} 
                alt={streamData.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{streamData.displayName}</h1>
                <Badge className="bg-blue-600 text-white">Pack 365</Badge>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                      <span>All {selectedStream} courses</span>
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-5 w-5 text-purple-500 mr-3" />
                      <span>365 days access</span>
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-5 w-5 text-green-500 mr-3" />
                      <span>Lifetime updates</span>
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-5 w-5 text-orange-500 mr-3" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Special Price</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-4">365</div>
                    <p className="text-gray-600 mb-6">One-time payment for full access</p>
                    
                    <Button 
                      onClick={handleEnrollNow}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    >
                      Enroll Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show courses after coupon success (this would be triggered from a success callback)
  if (showCourses && selectedStream) {
    const filteredCourses = getFilteredCourses();
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackFromCourses}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollment
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {streamConfig[selectedStream].displayName} Courses
            </h1>
            <p className="text-gray-600">Access all courses in this stream</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{course.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Stream: {course.stream}</span>
                      <Badge variant="secondary">All Levels</Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleCourseClick(course.courseName)}
                      className="w-full"
                      variant="outline"
                    >
                      Enroll in Course
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default bundle view
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, speed: 600 } },
      { breakpoint: 640, settings: { slidesToShow: 1, speed: 500 } }
    ]
  };

  const streamData = getStreamData();

  return (
    <div className={showLoginRequired ? '' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-2'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <style>{`
          .slick-dots {
            bottom: -60px;
          }
          .slick-dots li button:before {
            font-size: 12px;
            color: #3b82f6;
            opacity: 0.5;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
            color: #1d4ed8;
          }
          .slick-prev,
          .slick-next {
            width: 36px;
            height: 36px;
            z-index: 1;
          }

          .slick-prev:before,
          .slick-next:before {
            font-size: 24px;
            color: #bfdbfe;
            opacity: 1;
          }

          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: #3b82f6;
          }
          .stream-card {
            height: 420px;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .stream-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .stream-image {
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .stream-card:hover .stream-image {
            transform: scale(1.1);
          }
          .course-list {
            max-height: 140px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #f1f5f9;
          }
          .course-list::-webkit-scrollbar {
            width: 4px;
          }
          .course-list::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 2px;
          }
          .course-list::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 2px;
          }
          .course-list::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
          }
          .course-item {
            transition: all 0.3s ease;
          }
          .course-item:hover {
            transform: translateX(4px);
            color: #1d4ed8;
          }
          .hover-overlay {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
        
        <Slider {...sliderSettings}>
          {streamData.map((stream) => (
            <div key={stream.name} className="px-3">
              <Card 
                className="stream-card overflow-hidden cursor-pointer group bg-white/70 backdrop-blur-sm border-0 shadow-lg"
                onMouseEnter={() => setHoveredStream(stream.name)}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => handleStreamClick(stream.name)}
              >
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={stream.image} 
                    alt={stream.displayName}
                    className="stream-image w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                      Pack 365
                    </Badge>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className={`hover-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                    ${hoveredStream === stream.name ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-bold text-lg mb-2">Available Courses</h4>
                      <div className="course-list bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        {stream.courses.length > 0 ? (
                          <ul className="space-y-1">
                            {stream.courses.slice(0, 4).map((course, index) => (
                              <li key={index}>
                                <div className="course-item text-left w-full text-sm text-white/90 
                                  flex items-center justify-between bg-white/5 rounded px-2 py-1">
                                  <span className="truncate pr-2">{course.courseName}</span>
                                  <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                </div>
                              </li>
                            ))}
                            {stream.courses.length > 4 && (
                              <li className="text-center text-xs text-white/70 pt-1">
                                +{stream.courses.length - 4} more courses
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-white/70 italic text-center py-2">
                            Courses are being uploaded...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {showLoginRequired && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-all duration-400">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <Lock className="h-6 w-6 text-gray-700" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center bg-gradient-to-r from-blue-600 to-purple-600 
                    bg-clip-text text-transparent font-bold">
                    {stream.displayName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{stream.courses.length} Courses</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">365 days access</span>
                      </div>
                    </div>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStreamClick(stream.name);
                      }}
                      className={`w-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                        showLoginRequired 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {showLoginRequired ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Explore
                        </>
                      ) : (
                        <>
                          Explore More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Pack365Courses;