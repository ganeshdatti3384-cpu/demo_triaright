
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star, AlertCircle, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stream configuration with images
  const streamConfig: { [key: string]: { displayName: string; image: string } } = {
    'it': {
      displayName: 'IT Pack 365',
      image: '/lovable-uploads/IT Pack365.png'
    },
    'nonit': {
      displayName: 'Non-IT Pack 365',
      image: '/lovable-uploads/Non It Pack 365.png'
    },
    'pharma': {
      displayName: 'Pharma Pack 365',
      image: '/lovable-uploads/Pharma Pack 365.png'
    },
    'marketing': {
      displayName: 'Marketing Pack 365',
      image: '/lovable-uploads/Marketing Pack 365.png'
    },
    'hr': {
      displayName: 'HR Pack 365',
      image: '/lovable-uploads/HR Pack 365.png'
    },
    'finance': {
      displayName: 'Finance Pack 365',
      image: '/lovable-uploads/Finance Pack 365.png'
    }
  };

  useEffect(() => {
    loadCoursesAndEnrollments();
  }, []);

  const loadCoursesAndEnrollments = async () => {
    try {
      setLoading(true);
      
      // Load courses
      const coursesResponse = await pack365Api.getAllCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      } else {
        setError('Failed to load courses');
        return;
      }

      // Load user enrollments only if user is logged in
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
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStreamData = (): StreamData[] => {
    return Object.keys(streamConfig).map(streamKey => {
      const streamCourses = courses.filter(course => 
        course.stream.toLowerCase() === streamKey.toLowerCase()
      );
      
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
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast({
          title: "Login Required",
          description: "Please login to access courses.",
          variant: "destructive",
        });
        navigate('/login');
      }
      return;
    }

    // Redirect based on user role
    if (userRole === 'student' || userRole === 'job-seeker') {
      navigate(`/${userRole}?tab=pack365`);
    } else {
      navigate('/student?tab=pack365');
    }
  };

  if (loading) {
    return (
      <div className={showLoginRequired ? "py-8" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={showLoginRequired ? "py-8" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Streams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadCoursesAndEnrollments}>Try Again</Button>
        </div>
      </div>
    );
  }

  const streamData = getStreamData();

  return (
    <div className={showLoginRequired ? "" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {streamData.map((stream) => (
            <Card key={stream.name} className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
              <div className="relative overflow-hidden">
                <img 
                  src={stream.image} 
                  alt={stream.displayName}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Pack 365
                  </Badge>
                </div>
                {showLoginRequired && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl mb-2 text-center">{stream.displayName}</CardTitle>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{stream.courses.length} Courses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>365 days access</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <h4 className="font-semibold text-sm mb-3 text-gray-700">Available Courses:</h4>
                    {stream.courses.length > 0 ? (
                      <ul className="space-y-2">
                        {stream.courses.map((course, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleCourseClick(course.courseName)}
                              className="text-left w-full text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center justify-between group/course"
                            >
                              <span className="truncate pr-2">{course.courseName}</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover/course:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        Courses are being uploaded...
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleCourseClick('stream')}
                    className={`w-full ${
                      showLoginRequired
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pack365Courses;
