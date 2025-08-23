
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star } from 'lucide-react';
import { courseApi, Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CourseCardsProps {
  courses?: Course[];
  type?: 'recorded' | 'live' | 'free' | 'paid';
}

const CourseCards = ({ courses = [], type = 'recorded' }: CourseCardsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (courses.length > 0) {
        setDisplayCourses(courses);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let response;
        
        switch (type) {
          case 'free':
            response = await courseApi.getFreeCourses();
            break;
          case 'paid':
            response = await courseApi.getPaidCourses();
            break;
          default:
            response = await courseApi.getAllCourses();
            break;
        }

        if (response.success && response.courses) {
          setDisplayCourses(response.courses);
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to load courses',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [courses, type, toast]);

  const handleEnrollClick = (courseId: string, courseType: string) => {
    if (courseType === 'paid') {
      navigate(`/paid-course-enrollment/${courseId}`);
    } else {
      navigate(`/free-course-enrollment/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (displayCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
        <p className="text-gray-500">Check back later for new courses.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCourses.map((course) => (
        <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative">
            <img 
              src={course.courseImageLink || '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png'} 
              alt={course.courseName}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 right-4">
              {course.courseType === 'paid' ? (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  ₹{course.price}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  FREE
                </Badge>
              )}
            </div>
          </div>
          
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{course.stream}</Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.5</span>
              </div>
            </div>
            <CardTitle className="text-xl mb-2">{course.courseName}</CardTitle>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.courseDescription}</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.instructorName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(course.totalDuration / 60)}h {course.totalDuration % 60}m</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>Language: {course.courseLanguage}</span>
                </div>
                
                {course.certificationProvided && (
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Certificate Provided</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {course.curriculum.slice(0, 2).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item.title}
                    </Badge>
                  ))}
                  {course.curriculum.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.curriculum.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => handleEnrollClick(course.courseId, course.courseType)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {course.courseType === 'paid' ? `Enroll Now - ₹${course.price}` : 'Enroll Free'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseCards;
