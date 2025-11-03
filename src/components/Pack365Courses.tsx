// Pack365Courses.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Lock, AlertCircle, ArrowLeft, Star, Users, Zap, Award, CheckCircle, Sparkles } from 'lucide-react';
import { pack365Api } from '@/services/api';
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
  id: string;
}

// Mock courses data for each stream since backend doesn't provide courses
const mockCoursesByStream: { [key: string]: any[] } = {
  'Full Stack Development': [
    { courseName: 'HTML, CSS & JavaScript Fundamentals', stream: 'Full Stack Development' },
    { courseName: 'React.js & Next.js Mastery', stream: 'Full Stack Development' },
    { courseName: 'Node.js & Express Backend', stream: 'Full Stack Development' },
    { courseName: 'MongoDB Database Design', stream: ' FullStack Development' },
    { courseName: 'DevOps & Deployment', stream: 'Full Stack Development' }
  ],
  'Data Science': [
    { courseName: 'Python for Data Science', stream: 'Data Science' },
    { courseName: 'Machine Learning Fundamentals', stream: 'Data Science' },
    { courseName: 'Data Visualization & Analysis', stream: 'Data Science' },
    { courseName: 'Advanced Statistical Modeling', stream: 'Data Science' }
  ],
  'Mobile Development': [
    { courseName: 'React Native Cross-Platform', stream: 'Mobile Development' },
    { courseName: 'Flutter & Dart Programming', stream: 'Mobile Development' },
    { courseName: 'Mobile App Design Principles', stream: 'Mobile Development' },
    { courseName: 'App Store Deployment', stream: 'Mobile Development' }
  ],
  'Cyber Security': [
    { courseName: 'Network Security Fundamentals', stream: 'Cyber Security' },
    { courseName: 'Ethical Hacking & Penetration Testing', stream: 'Cyber Security' },
    { courseName: 'Cryptography & Secure Communications', stream: 'Cyber Security' },
    { courseName: 'Security Audit & Compliance', stream: 'Cyber Security' }
  ]
};

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
      
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadCoursesAndEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const streamsResponse = await pack365Api.getAllStreams();
      console.log('Streams API Response:', streamsResponse); // Debug log
      
      if (streamsResponse.success && streamsResponse.streams) {
        // Ensure we have valid streams data
        const validStreams = streamsResponse.streams.filter((stream: any) => 
          stream && stream.name && stream.price !== undefined
        );
        setStreams(validStreams);
      } else {
        setStreams([]);
        if (showLoginRequired) {
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
      setStreams([]);
      
      if (showLoginRequired) {
        setError('');
        return;
      } else {
        setError('Unable to load course bundles at the moment');
        toast({ 
          title: 'Error', 
          description: 'Failed to load streams. Please try again.', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getCoursesForStream = (streamName: string) => {
    return mockCoursesByStream[streamName] || [
      { courseName: `${streamName} Fundamentals`, stream: streamName },
      { courseName: `Advanced ${streamName}`, stream: streamName },
      { courseName: `${streamName} Projects`, stream: streamName }
    ];
  };

  const handleStreamClick = (stream: StreamData) => {
    if (showLoginRequired) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        navigate('/login');
      }
      return;
    }
    
    // Set selected stream and show enrollment view
    setSelectedStream(stream);
    setShowEnrollment(true);
    setShowCourses(false);
  };

  const handleCourseClick = (courseName: string) => {
    navigate('/coupon-code', { state: { courseName, fromCourse: true } });
  };

  const handleEnrollNow = () => {
    if (!selectedStream) return;
    
    navigate('/razorpay-payment', { 
      state: { 
        streamName: selectedStream.name, 
        fromStream: true, 
        streamPrice: selectedStream.price,
        coursesCount: getCoursesForStream(selectedStream.name).length
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

  // Enhanced slider settings
  const sliderSettings = {
    dots: true,
    infinite: streams.length > 1,
    speed: 800,
    slidesToShow: Math.min(3, streams.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    responsive: [
      { 
        breakpoint: 1280, 
        settings: { 
          slidesToShow: Math.min(3, streams.length),
          dots: true
        } 
      },
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: Math.min(2, streams.length), 
          speed: 600 
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 1, 
          speed: 500,
          dots: true
        } 
      }
    ]
  };

  if (loading) {
    return (
      <div className={showLoginRequired ? 'py-12' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center space-x-3 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading amazing course bundles...</p>
        </div>
      </div>
    );
  }

  if (error && !showLoginRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-8 max-w-md mx-auto shadow-lg">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={loadCoursesAndEnrollments}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
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
    const streamCourses = getCoursesForStream(selectedStream.name);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackToBundles}
            variant="outline"
            className="mb-8 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bundles
          </Button>
          
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-80">
              <img 
                src={selectedStream.imageUrl || '/api/placeholder/800/400'} 
                alt={`${selectedStream.name} Bundle`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mb-4 px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Pack365 Exclusive
                </Badge>
                <h1 className="text-4xl font-bold mb-2">{selectedStream.name} Master Bundle</h1>
                <p className="text-xl text-blue-200">Complete learning path with {streamCourses.length}+ courses</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="h-6 w-6 text-blue-500 mr-3" />
                    What You'll Get
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: BookOpen, text: `All ${selectedStream.name} courses`, color: 'text-blue-500' },
                      { icon: Clock, text: '365 days full access', color: 'text-purple-500' },
                      { icon: Zap, text: 'Lifetime course updates', color: 'text-yellow-500' },
                      { icon: Users, text: 'Community access', color: 'text-green-500' },
                      { icon: Star, text: 'Certificate of completion', color: 'text-orange-500' },
                      { icon: CheckCircle, text: 'Priority support', color: 'text-red-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${item.color}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Special Launch Offer</h3>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-blue-200 line-through text-lg">₹{selectedStream.price * 2}</span>
                      <Badge variant="secondary" className="bg-yellow-400 text-gray-900">50% OFF</Badge>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2">₹{selectedStream.price}</div>
                    <p className="text-blue-200">One-time payment • No hidden fees</p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={handleEnrollNow}
                      className="w-full bg-white text-blue-600 hover:bg-gray-100 text-lg py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Enroll Now & Save 50%
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    
                    <div className="text-center text-blue-200 text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Join 1,000+ successful students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show courses after coupon success
  if (showCourses && selectedStream) {
    const streamCourses = getCoursesForStream(selectedStream.name);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            onClick={handleBackFromCourses}
            variant="outline"
            className="mb-8 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollment
          </Button>
          
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mb-4 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Enrollment Successful!
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to {selectedStream.name} Bundle
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your learning journey with {streamCourses.length} carefully curated courses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {streamCourses.map((course, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={selectedStream.imageUrl || '/api/placeholder/400/200'} 
                    alt={course.courseName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800">
                      Course {index + 1}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-900 line-clamp-2">{course.courseName}</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="font-medium">{course.stream}</span>
                      <Badge variant="outline" className="border-green-200 text-green-600">
                        Available
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={() => handleCourseClick(course.courseName)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg py-3 font-semibold transition-all duration-300 group-hover:shadow-lg"
                    >
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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

  if (streams.length === 0 && showLoginRequired) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 shadow-lg">
            <Sparkles className="h-16 w-16 text-blue-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Pack365 Coming Soon</h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              We're crafting amazing learning bundles that will transform your career. Get ready for something extraordinary!
            </p>
            <div className="bg-white rounded-2xl p-6 inline-block shadow-md">
              <p className="text-sm text-gray-500 font-medium">Be the first to know when we launch</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (streams.length === 0 && !showLoginRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-12 shadow-lg">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Amazing Bundles Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're preparing something special for you. Our course bundles are being crafted with care to provide the best learning experience.
            </p>
            <Button 
              onClick={loadCoursesAndEnrollments}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Notify Me
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={showLoginRequired ? 'py-8' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        {!showLoginRequired && (
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mb-6 px-6 py-3 text-sm font-semibold">
              <Sparkles className="h-4 w-4 mr-2" />
              Most Popular
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pack365 Learning Bundles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Master complete tech stacks with our curated bundles. Get <span className="font-semibold text-blue-600">365 days access</span> to all courses, 
              lifetime updates, and exclusive community support.
            </p>
          </div>
        )}

        <style>{`
          .slick-dots {
            bottom: -60px;
          }
          .slick-dots li button:before {
            font-size: 12px;
            color: #3b82f6;
            opacity: 0.3;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
            color: #1d4ed8;
          }
          .slick-prev, .slick-next {
            width: 48px;
            height: 48px;
            z-index: 1;
            background: white;
            border-radius: 50%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .slick-prev { left: -60px; }
          .slick-next { right: -60px; }
          .slick-prev:hover, .slick-next:hover {
            background: #f8fafc;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          }
          .slick-prev:before, .slick-next:before {
            font-size: 20px;
            color: #3b82f6;
            opacity: 0.8;
          }
          .stream-card {
            height: 480px;
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          }
          .stream-card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25);
          }
          .stream-image {
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .stream-card:hover .stream-image {
            transform: scale(1.15);
          }
          .course-list {
            max-height: 160px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #f1f5f9;
          }
          .course-list::-webkit-scrollbar {
            width: 6px;
          }
          .course-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .course-list::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
            border-radius: 10px;
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite alternate;
          }
          @keyframes pulse-glow {
            from { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
            to { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); }
          }
        `}</style>
        
        <Slider {...sliderSettings}>
          {streams.map((stream) => {
            const streamCourses = getCoursesForStream(stream.name);
            
            return (
              <div key={stream._id} className="px-4">
                <Card 
                  className="stream-card overflow-hidden cursor-pointer group border-0 shadow-xl relative"
                  onMouseEnter={() => setHoveredStream(stream.name)}
                  onMouseLeave={() => setHoveredStream(null)}
                  onClick={() => handleStreamClick(stream)}
                >
                  {/* Premium Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Premium
                    </Badge>
                  </div>

                  {/* Pack365 Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg font-semibold">
                      Pack365
                    </Badge>
                  </div>

                  {/* Image Container */}
                  <div className="relative overflow-hidden h-56">
                    <img 
                      src={stream.imageUrl || '/api/placeholder/400/250'} 
                      alt={`${stream.name} Bundle`}
                      className="stream-image w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-blue-900/80 via-purple-900/40 to-transparent 
                      ${hoveredStream === stream.name ? 'opacity-100' : 'opacity-0'} transition-all duration-500`}>
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h4 className="font-bold text-lg mb-3 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Included Courses
                        </h4>
                        <div className="course-list bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          {streamCourses.length > 0 ? (
                            <ul className="space-y-2">
                              {streamCourses.slice(0, 4).map((course, index) => (
                                <li key={index}>
                                  <div className="course-item text-left w-full text-sm text-white/90 
                                    flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 
                                    hover:bg-white/10 transition-all duration-300">
                                    <span className="truncate pr-2 font-medium">{course.courseName}</span>
                                    <ArrowRight className="h-3 w-3 flex-shrink-0 opacity-70" />
                                  </div>
                                </li>
                              ))}
                              {streamCourses.length > 4 && (
                                <li className="text-center text-xs text-white/70 pt-2 font-medium">
                                  +{streamCourses.length - 4} more courses
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-white/70 italic text-center py-4">
                              Courses are being uploaded...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Login Required Overlay */}
                    {showLoginRequired && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center 
                        opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm rounded-t-xl">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center">
                          <Lock className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-700 font-semibold">Sign in to explore</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 
                      bg-clip-text text-transparent font-bold">
                      {stream.name} Pro
                    </CardTitle>
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{streamCourses.length} Courses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>365 Days</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-5">
                      {/* Price */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-gray-500 line-through text-sm">₹{stream.price * 2}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                            Save 50%
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">₹{stream.price}</div>
                        <p className="text-sm text-gray-500 mt-1">One-time payment</p>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStreamClick(stream);
                        }}
                        className={`w-full font-bold text-lg py-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          showLoginRequired 
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl pulse-glow'
                        }`}
                      >
                        {showLoginRequired ? (
                          <>
                            <Lock className="h-5 w-5 mr-2" />
                            Sign In to View
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Explore Bundle
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Certificate</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Lifetime Updates</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Community</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Support</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </Slider>

        {/* Bottom CTA */}
        {!showLoginRequired && (
          <div className="text-center mt-20">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Career?</h3>
              <p className="text-gray-600 mb-6">Join thousands of students who've accelerated their learning with Pack365</p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/pack365')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                View All Bundles
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pack365Courses;
