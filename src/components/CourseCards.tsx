import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: string;
  originalPrice: string;
  isPaid: boolean;
  image: string;
  skills: string[];
  rating: number;
  studentsEnrolled: number;
}

interface CourseCardsProps {
  courses: Course[];
  type: 'recorded' | 'live';
}

const CourseCards = ({ courses, type }: CourseCardsProps) => {
  const navigate = useNavigate();

  const handleEnrollClick = (courseId: string) => {
    navigate(`/course-enrollment/${courseId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative">
            <img 
              src={course.image} 
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-4 right-4">
              {course.isPaid ? (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {course.price}
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
              <Badge variant="outline">{course.level}</Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{course.rating}</span>
              </div>
            </div>
            <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{course.studentsEnrolled.toLocaleString()} students enrolled</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {course.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => handleEnrollClick(course.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {course.isPaid ? `Enroll Now - ${course.price}` : 'Enroll Free'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseCards;
