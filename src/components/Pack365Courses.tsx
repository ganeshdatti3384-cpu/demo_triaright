
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Lock, AlertCircle } from 'lucide-react';
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const streamConfig: { [key: string]: { displayName: string; image: string } } = {
    'it': { displayName: 'IT Bundle', image: '/lovable-uploads/IT Pack365.png' },
    'nonit': { displayName: 'Non-IT Bundle', image: '/lovable-uploads/Non It Pack 365.png' },
    'pharma': { displayName: 'Pharma Bundle', image: '/lovable-uploads/Pharma Pack 365.png' },
    'marketing': { displayName: 'Marketing Bundle', image: '/lovable-uploads/Marketing Pack 365.png' },
    'hr': { displayName: 'HR Bundle', image: '/lovable-uploads/HR Pack 365.png' },
    'finance': { displayName: 'Finance Bundle', image: '/lovable-uploads/Finance Pack 365.png' }
  };

  useEffect(() => {
    loadCoursesAndEnrollments();
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
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (showLoginRequired || !token) {
      if (onLoginRequired) onLoginRequired();
      else {
        toast({ title: 'Login Required', description: 'Please login to access courses.', variant: 'destructive' });
        navigate('/login');
      }
      return;
    }
    navigate(`/${userRole === 'student' || userRole === 'job-seeker' ? userRole : 'student'}?tab=pack365`);
  };

  const handleStreamClick = (streamName: string) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (showLoginRequired || !token) {
      if (onLoginRequired) onLoginRequired();
      else {
        toast({ title: 'Login Required', description: 'Please login to access courses.', variant: 'destructive' });
        navigate('/login');
      }
      return;
    }
    navigate(`/${userRole === 'student' || userRole === 'job-seeker' ? userRole : 'student'}?tab=pack365`);
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
            color: #bfdbfe; /* Tailwind blue-200 */
            opacity: 1;
          }

          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: #3b82f6; /* Tailwind blue-500 for hover */
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
                            {stream.courses.map((course, index) => (
                              <li key={index}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCourseClick(course.courseName);
                                  }}
                                  className="course-item text-left w-full text-sm text-white/90 hover:text-white 
                                    flex items-center justify-between group/course bg-white/5 rounded px-2 py-1"
                                >
                                  <span className="truncate pr-2">{course.courseName}</span>
                                  <ArrowRight className="h-3 w-3 opacity-0 group-hover/course:opacity-100 transition-all duration-300 flex-shrink-0" />
                                </button>
                              </li>
                            ))}
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
                          Explore Stream - $365
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
