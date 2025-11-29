/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Lock, AlertCircle, ArrowLeft, Star, Users, Zap, Award, CheckCircle } from 'lucide-react';
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
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  courses: Pack365Course[];
  id: string;
}

const Pack365Courses = ({ showLoginRequired = false, onLoginRequired }: Pack365CoursesProps) => {
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredStream, setHoveredStream] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCoursesAndEnrollments();
    
    // Check URL params for post-coupon flow
    const urlParams = new URLSearchParams(window.location.search);
    const streamParam = urlParams.get('stream');
    const enrolledParam = urlParams.get('enrolled');
    
    if (streamParam && enrolledParam === 'true') {
      const streamObj = streams.find(s => s.name.toLowerCase() === streamParam.toLowerCase());
      if (streamObj) {
        setSelectedStream(streamObj);
        setShowCourses(true);
        setShowEnrollment(false);
      }
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadCoursesAndEnrollments = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      const streamsResponse = await pack365Api.getAllStreams();
      if (streamsResponse.success && streamsResponse.streams) {
        setStreams(streamsResponse.streams);
      } else {
        // Set empty array as fallback and show a graceful message
        setStreams([]);
        if (showLoginRequired) {
          // For homepage, don't show error, just hide the section
          return;
        } else {
          setError('Unable to load course bundles at the moment');
        }
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
      console.error('Error loading streams:', err);
      setStreams([]); // Set empty array as fallback
      
      if (showLoginRequired) {
        // For homepage, don't show error toast or error state, just fail silently
        setError('');
        return;
      } else {
        setError('Unable to load course bundles at the moment');
        toast({ title: 'Error', description: 'Failed to load streams. Please try again.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStreamClick = (stream: StreamData) => {
    navigate(`/pack365/bundle/${stream.name.toLowerCase()}`);
  };

  const handleCourseClick = (courseName: string) => {
    navigate('/coupon-code', { state: { courseName, fromCourse: true } });
  };

  const handleEnrollNow = () => {
    navigate('/razorpay-payment', { 
      state: { 
        streamName: selectedStream?.name, 
        fromStream: true, 
        streamPrice: selectedStream?.price,
        coursesCount: selectedStream?.courses?.length || 3
      } 
    });
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

  if (loading) {
    return (
      <div className={showLoginRequired ? 'py-8' : 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Zap className="h-6 w-6 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-blue-100 text-lg font-medium">Loading Premium Learning Bundles...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={showLoginRequired ? 'py-8' : 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20 shadow-2xl">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Streams</h2>
            <p className="text-blue-100 mb-6">{error}</p>
            <Button 
              onClick={loadCoursesAndEnrollments}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show enrollment view after clicking explore more
  if (showEnrollment && selectedStream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackToBundles}
            variant="outline"
            className="mb-8 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bundles
          </Button>
          
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="relative h-80">
              <img 
                src={selectedStream.imageUrl} 
                alt={`${selectedStream.name} Bundle`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mb-4 text-sm px-3 py-1">
                  Premium Bundle
                </Badge>
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {selectedStream.name} Master Bundle
                </h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-400 mr-1" />
                    <span>2.5K+ Students</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10">
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-white mb-6">What's Included in This Bundle</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-500/20 p-3 rounded-xl">
                          <BookOpen className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Complete Course Access</h4>
                          <p className="text-blue-100 text-sm">All {selectedStream.name} courses with lifetime updates</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-500/20 p-3 rounded-xl">
                          <Clock className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">365 Days Access</h4>
                          <p className="text-blue-100 text-sm">Full year of unlimited learning access</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-500/20 p-3 rounded-xl">
                          <Award className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Certification</h4>
                          <p className="text-blue-100 text-sm">Industry-recognized completion certificates</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-orange-400/30 transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="bg-orange-500/20 p-3 rounded-xl">
                          <Zap className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Premium Support</h4>
                          <p className="text-blue-100 text-sm">24/7 dedicated learning support</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-400/30 backdrop-blur-lg">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">Special Launch Price</h3>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-gray-300 line-through text-lg">₹{selectedStream.price * 2}</span>
                        <Badge className="bg-green-500 text-white border-0">50% OFF</Badge>
                      </div>
                      <div className="text-5xl font-bold text-white mb-2">₹{selectedStream.price}</div>
                      <p className="text-blue-100 text-sm">One-time payment • Lifetime updates</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-green-300 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Full access to {selectedStream.courses.length} courses</span>
                      </div>
                      <div className="flex items-center text-green-300 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>365 days unlimited access</span>
                      </div>
                      <div className="flex items-center text-green-300 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleEnrollNow}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Enroll Now & Save 50%
                    </Button>
                    
                    <p className="text-center text-blue-100 text-xs mt-4">
                      🎉 Limited time offer • 30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show courses after coupon success (this would be triggered from a success callback)
  if (showCourses && selectedStream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackFromCourses}
            variant="outline"
            className="mb-8 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollment
          </Button>
          
          <div className="mb-10 text-center">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mb-4 text-sm px-4 py-1">
              Successfully Enrolled! 🎉
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-3">
              {selectedStream.name} Bundle Courses
            </h1>
            <p className="text-blue-100 text-lg">Start your learning journey with these premium courses</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedStream.courses.map((course, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer overflow-hidden group">
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                    Enrolled
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-white group-hover:text-blue-200 transition-colors duration-300">
                    {course.courseName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-blue-100">
                      <span>Stream: {course.stream}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        All Levels
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-blue-200">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>20+ hours</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleCourseClick(course.courseName)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    >
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
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

  // If no streams available and this is the homepage, don't show anything
  if (streams.length === 0 && showLoginRequired) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-12 border border-white/20 backdrop-blur-lg">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Pack365 Coming Soon</h3>
            <p className="text-blue-100 text-lg">Our premium learning bundles are being prepared with cutting-edge content!</p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no streams available and this is not homepage
  if (streams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-2xl mx-auto border border-white/20 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Premium Bundles Coming Soon</h2>
            <p className="text-blue-100 text-lg mb-8">We're crafting exceptional learning experiences with industry experts.</p>
            <Button 
              onClick={loadCoursesAndEnrollments}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
            >
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2, speed: 600 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, speed: 600 } },
      { breakpoint: 768, settings: { slidesToShow: 1, speed: 500 } },
      { breakpoint: 640, settings: { slidesToShow: 1, speed: 500 } }
    ]
  };

  return (
    <div className={showLoginRequired ? '' : 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-8'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showLoginRequired && (
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mb-4 text-sm px-4 py-2 text-base">
              🚀 Premium Learning Bundles
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Master Your Skills with Pack365
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Complete learning bundles with 365-day access, lifetime updates, and industry-recognized certifications
            </p>
          </div>
        )}
        
        <style>{`
          .slick-dots {
            bottom: -60px;
          }
          .slick-dots li button:before {
            font-size: 14px;
            color: #60a5fa;
            opacity: 0.5;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
            color: #3b82f6;
          }
          .slick-prev,
          .slick-next {
            width: 44px;
            height: 44px;
            z-index: 1;
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .slick-prev { left: -50px; }
          .slick-next { right: -50px; }
          .slick-prev:before,
          .slick-next:before {
            font-size: 20px;
            color: #bfdbfe;
            opacity: 1;
          }
          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: #60a5fa;
          }
          .slick-prev:hover,
          .slick-next:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(96, 165, 250, 0.5);
          }
          .stream-card {
            height: 480px;
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .stream-card:hover {
            transform: translateY(-12px) scale(1.03);
            box-shadow: 
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 30px rgba(59, 130, 246, 0.3);
            border-color: rgba(96, 165, 250, 0.3);
          }
          .stream-image {
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            filter: brightness(0.9);
          }
          .stream-card:hover .stream-image {
            transform: scale(1.15);
            filter: brightness(1.1);
          }
          .course-list {
            max-height: 160px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 rgba(255, 255, 255, 0.1);
          }
          .course-list::-webkit-scrollbar {
            width: 6px;
          }
          .course-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .course-list::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #6366f1);
            border-radius: 3px;
          }
          .course-list::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #4f46e5);
          }
          .course-item {
            transition: all 0.3s ease;
          }
          .course-item:hover {
            transform: translateX(8px);
            background: rgba(59, 130, 246, 0.2);
          }
          .hover-overlay {
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .price-tag {
            background: linear-gradient(135deg, #10b981, #059669);
            transform: skewX(-15deg);
          }
          .price-tag-content {
            transform: skewX(15deg);
          }
          .glow-effect {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #60a5fa, transparent);
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .stream-card:hover .glow-effect {
            opacity: 1;
          }
        `}</style>
        
        <Slider {...sliderSettings}>
          {streams.map((stream) => (
            <div key={stream._id} className="px-4 pb-12">
              <Card 
                className="stream-card overflow-hidden cursor-pointer group relative"
                onMouseEnter={() => setHoveredStream(stream.name)}
                onMouseLeave={() => setHoveredStream(null)}
                onClick={() => handleStreamClick(stream)}
              >
                <div className="glow-effect"></div>
                
                <div className="relative overflow-hidden h-56">
                  <img 
                    src={stream.imageUrl} 
                    alt={`${stream.name} Bundle`}
                    className="stream-image w-full h-full object-cover"
                  />
                  
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-2xl font-semibold">
                      <Zap className="h-3 w-3 mr-1" />
                      Pack 365
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-10">
                    <div className="price-tag px-3 py-1 shadow-2xl">
                      <div className="price-tag-content text-white font-bold text-sm">
                        ₹{stream.price}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`hover-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                    ${hoveredStream === stream.name ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-bold text-lg mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                        Available Courses
                      </h4>
                      <div className="course-list bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        {stream.courses && stream.courses.length > 0 ? (
                          <ul className="space-y-2">
                            {stream.courses.slice(0, 4).map((course, index) => (
                              <li key={index}>
                                <div className="course-item text-left w-full text-sm text-white/90 
                                  flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                  <span className="truncate pr-2 font-medium">{course.courseName}</span>
                                  <ArrowRight className="h-3 w-3 flex-shrink-0 text-blue-400" />
                                </div>
                              </li>
                            ))}
                            {stream.courses.length > 4 && (
                              <li className="text-center text-xs text-white/70 pt-2 font-medium">
                                +{stream.courses.length - 4} more premium courses
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-white/70 italic text-center py-4">
                            🚀 Courses launching soon...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {showLoginRequired && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 transform rotate-6 scale-110 group-hover:rotate-0 group-hover:scale-100 transition-all duration-500">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-center bg-gradient-to-r from-white to-blue-200 
                    bg-clip-text text-transparent font-bold">
                    {stream.name} Master Bundle
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-blue-100">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold">{stream.courses.length} Premium Courses</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-100">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="font-semibold">365 Days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 text-xs text-blue-200">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>4.9 Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 text-green-400 mr-1" />
                        <span>2K+ Students</span>
                      </div>
                    </div>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStreamClick(stream);
                      }}
                      className={`w-full font-bold text-base py-3 rounded-xl transition-all duration-500 transform hover:scale-105 shadow-2xl ${
                        showLoginRequired 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-3xl'
                      }`}
                    >
                      {showLoginRequired ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Explore
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Explore Bundle
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </Slider>
        
        {!showLoginRequired && (
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/20 backdrop-blur-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Career?</h3>
              <p className="text-blue-100 mb-6">Join thousands of students who have accelerated their learning with Pack365 bundles</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl">
                  <Users className="h-4 w-4 mr-2" />
                  View All Bundles
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pack365Courses;
