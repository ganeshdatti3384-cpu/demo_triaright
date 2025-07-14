
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Pack365CoursesProps {
  showLoginRequired?: boolean;
  onLoginRequired?: () => void;
}

const Pack365Courses = ({ showLoginRequired = false, onLoginRequired }: Pack365CoursesProps) => {
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

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
          // Don't set error here as this is optional
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

  const isUserEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  };

  const handleEnrollClick = (course: Pack365Course) => {
    const token = localStorage.getItem('token');
    
    // If on landing page and not logged in, show login dialog
    if (showLoginRequired || !token) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast({
          title: "Login Required",
          description: "Please login to enroll in courses.",
          variant: "destructive",
        });
        navigate('/login');
      }
      return;
    }

    // If already enrolled, navigate to course learning
    if (isUserEnrolled(course.courseId)) {
      navigate(`/course-learning/${course.courseId}`);
      return;
    }

    // Otherwise, navigate to payment
    navigate(`/pack365/payment/${course.courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadCoursesAndEnrollments}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={showLoginRequired ? "" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
            <p className="text-gray-600">Check back later for new course packages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const enrolled = isUserEnrolled(course.courseId);
              const isLoggedIn = localStorage.getItem('token');
              
              return (
                <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <div className="absolute top-4 right-4">
                      {enrolled ? (
                        <Badge className="bg-green-600 text-white">
                          Enrolled
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          $365
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {course.stream.toUpperCase()}
                      </Badge>
                    </div>
                    {showLoginRequired && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2 mt-6">
                      <Badge variant="outline">Professional</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{course.courseName}</CardTitle>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.topics?.length || 0} Topics</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>365 days access</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>Premium Content</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {course.topics?.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic.name}
                          </Badge>
                        ))}
                        {course.topics && course.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleEnrollClick(course)}
                        className={`w-full ${
                          enrolled 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : showLoginRequired || !isLoggedIn
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        {enrolled ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Continue Learning
                          </>
                        ) : showLoginRequired || !isLoggedIn ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Login to Enroll
                          </>
                        ) : (
                          'Enroll Now - $365'
                        )}
                      </Button>
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

export default Pack365Courses;
