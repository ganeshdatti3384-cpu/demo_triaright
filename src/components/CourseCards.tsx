import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Users, Star, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  totalDuration: number;
  courseType: 'paid' | 'unpaid';
  price: number;
  courseImageLink: string;
  stream: string;
  providerName: string;
  courseLanguage: string;
  certificationProvided: string;
  curriculum?: Array<{
    topicName: string;
    topicCount: number;
    subtopics: Array<{
      name: string;
      link: string;
      duration: number;
      _id: string;
    }>;
    _id: string;
  }>;
  demoVideoLink: string;
  hasFinalExam: boolean;
}

interface CourseCardsProps {
  courses?: Course[];
  type?: string;
}

interface ApiResponse {
  courses: Course[];
}

const CourseCards = ({ courses: propCourses = [], type = "recorded" }: CourseCardsProps) => {
  const [courses, setCourses] = useState<Course[]>(propCourses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (propCourses && propCourses.length > 0) {
      setCourses(propCourses);
      setLoading(false);
    } else {
      fetchCourses();
    }
  }, [propCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://triaright.com/api/courses');
      const data: ApiResponse = await response.json();
      
      if (data && data.courses) {
        setCourses(data.courses);
      } else {
        throw new Error('No courses data received');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
      
      // Fallback data for development
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (course.courseType === 'paid') {
      navigate(`/course-payment/${course.courseId}`, { 
        state: { course } 
      });
    } else {
      navigate(`/course-enrollment/${course.courseId}`, { 
        state: { course } 
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStreamBadgeColor = (stream: string) => {
    const colors: { [key: string]: string } = {
      'it': 'bg-blue-100 text-blue-800',
      'nonit': 'bg-green-100 text-green-800',
      'finance': 'bg-purple-100 text-purple-800',
      'management': 'bg-orange-100 text-orange-800',
      'pharmaceuticals': 'bg-pink-100 text-pink-800',
      'carrerability': 'bg-indigo-100 text-indigo-800',
    };
    return colors[stream.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCourses} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h3>
        <p className="text-gray-600 mb-4">There are no courses available at the moment.</p>
        <Button onClick={fetchCourses} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card 
          key={course._id} 
          className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => handleCourseClick(course)}
        >
          <div className="aspect-video relative overflow-hidden">
            {course.courseImageLink ? (
              <img
                src={course.courseImageLink}
                alt={course.courseName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x225/f3f4f6/9ca3af?text=Course+Image';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge className={getStreamBadgeColor(course.stream)}>
                {course.stream.toUpperCase()}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant={course.courseType === 'paid' ? 'default' : 'secondary'}>
                {course.courseType === 'paid' ? `₹${course.price}` : 'FREE'}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">
                  {course.courseName}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {course.courseDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.instructorName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">{course.providerName}</span>
                  <span className="mx-2">•</span>
                  <span>{course.courseLanguage}</span>
                </div>
                {course.certificationProvided === 'yes' && (
                  <Badge variant="outline" className="text-xs">
                    Certificate
                  </Badge>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course);
                  }}
                >
                  {course.courseType === 'paid' ? 'Enroll Now' : 'Start Learning'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseCards;