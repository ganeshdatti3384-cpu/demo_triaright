
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star } from 'lucide-react';

interface Pack365Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  isPaid: boolean;
  image: string;
  skills: string[];
  rating: number;
  studentsEnrolled: number;
  category: string;
}

const Pack365Courses = () => {
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Pack365 courses from localStorage or use sample data
    const savedCourses = localStorage.getItem('pack365Courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      const sampleCourses: Pack365Course[] = [
        {
          id: '1',
          title: 'Complete Web Development Bootcamp',
          description: 'Master HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
          instructor: 'John Smith',
          duration: '365 days',
          level: 'Beginner',
          price: 365,
          isPaid: true,
          image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
          skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
          rating: 4.8,
          studentsEnrolled: 12500,
          category: 'Web Development'
        },
        {
          id: '2',
          title: 'Full Stack Data Science Pack',
          description: 'Learn Python, Machine Learning, Data Analysis, and AI in one comprehensive package.',
          instructor: 'Sarah Johnson',
          duration: '365 days',
          level: 'Intermediate',
          price: 365,
          isPaid: true,
          image: '/lovable-uploads/cdf8ab47-8b3d-4445-820a-e1e1baca31e0.png',
          skills: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
          rating: 4.9,
          studentsEnrolled: 8900,
          category: 'Data Science'
        },
        {
          id: '3',
          title: 'Free Programming Fundamentals',
          description: 'Start your coding journey with basic programming concepts and logic.',
          instructor: 'Mike Wilson',
          duration: '365 days',
          level: 'Beginner',
          price: 0,
          isPaid: false,
          image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
          skills: ['Programming Logic', 'Algorithms', 'Basic Coding'],
          rating: 4.5,
          studentsEnrolled: 25000,
          category: 'Programming'
        }
      ];
      setCourses(sampleCourses);
      localStorage.setItem('pack365Courses', JSON.stringify(sampleCourses));
    }
  }, []);

  const handleEnrollClick = (course: Pack365Course) => {
    if (course.isPaid) {
      navigate(`/pack365/payment/${course.id}`);
    } else {
      navigate(`/pack365/course/${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Pack365 - All-in-One Learning
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get access to comprehensive course packages for an entire year. Master multiple skills with our curated learning paths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      ${course.price}
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
                  
                  <Button 
                    onClick={() => handleEnrollClick(course)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {course.isPaid ? 'Enroll Now - $365' : 'Start Free Course'}
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
