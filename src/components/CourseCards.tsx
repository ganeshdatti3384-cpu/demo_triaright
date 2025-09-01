
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Users, Star } from 'lucide-react';

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
  certificationProvided: 'yes' | 'no';
  curriculum: Array<{
    topicName: string;
    topicCount: number;
    subtopics: Array<{
      name: string;
      link: string;
      duration: number;
    }>;
  }>;
  // Legacy compatibility fields
  id?: string;
  title?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  originalPrice?: string;
  isPaid?: boolean;
  image?: string;
  skills?: string[];
  rating?: number;
  studentsEnrolled?: number;
}

interface CourseCardsProps {
  courses?: Course[];
  type?: 'recorded' | 'live';
}

const CourseCards = ({ courses = [], type = 'recorded' }: CourseCardsProps) => {
  const navigate = useNavigate();

  // Default demo courses if none provided
  const defaultCourses: Course[] = [
    {
      _id: '1',
      courseId: 'CRS_DEMO_001',
      courseName: 'Full Stack Web Development',
      courseDescription: 'Learn modern web development with React, Node.js, and MongoDB',
      instructorName: 'John Doe',
      totalDuration: 720,
      courseType: 'paid',
      price: 9999,
      courseImageLink: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      stream: 'it',
      providerName: 'triaright',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      curriculum: [
        {
          topicName: 'React Basics',
          topicCount: 5,
          subtopics: [
            { name: 'Introduction to React', link: '', duration: 60 }
          ]
        }
      ],
      // Legacy fields for backward compatibility
      id: '1',
      title: 'Full Stack Web Development',
      description: 'Learn modern web development with React, Node.js, and MongoDB',
      instructor: 'John Doe',
      duration: '12 weeks',
      level: 'Intermediate',
      originalPrice: '₹15,999',
      isPaid: true,
      image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      rating: 4.8,
      studentsEnrolled: 1250
    },
    {
      _id: '2',
      courseId: 'CRS_DEMO_002',
      courseName: 'Data Science Fundamentals',
      courseDescription: 'Master data analysis, visualization, and machine learning basics',
      instructorName: 'Jane Smith',
      totalDuration: 480,
      courseType: 'paid',
      price: 7999,
      courseImageLink: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      stream: 'it',
      providerName: 'triaright',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      curriculum: [
        {
          topicName: 'Python Basics',
          topicCount: 3,
          subtopics: [
            { name: 'Introduction to Python', link: '', duration: 45 }
          ]
        }
      ],
      // Legacy fields for backward compatibility
      id: '2',
      title: 'Data Science Fundamentals',
      description: 'Master data analysis, visualization, and machine learning basics',
      instructor: 'Jane Smith',
      duration: '8 weeks',
      level: 'Beginner',
      originalPrice: '₹12,999',
      isPaid: true,
      image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      skills: ['Python', 'Pandas', 'Matplotlib', 'Scikit-learn'],
      rating: 4.6,
      studentsEnrolled: 890
    },
    {
      _id: '3',
      courseId: 'CRS_DEMO_003',
      courseName: 'Introduction to Programming',
      courseDescription: 'Start your coding journey with fundamental programming concepts',
      instructorName: 'Mike Johnson',
      totalDuration: 360,
      courseType: 'unpaid',
      price: 0,
      courseImageLink: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      stream: 'it',
      providerName: 'triaright',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      curriculum: [
        {
          topicName: 'Programming Basics',
          topicCount: 2,
          subtopics: [
            { name: 'Introduction to Programming', link: '', duration: 30 }
          ]
        }
      ],
      // Legacy fields for backward compatibility
      id: '3',
      title: 'Introduction to Programming',
      description: 'Start your coding journey with fundamental programming concepts',
      instructor: 'Mike Johnson',
      duration: '6 weeks',
      level: 'Beginner',
      originalPrice: '₹0',
      isPaid: false,
      image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      skills: ['Programming Basics', 'Logic', 'Problem Solving'],
      rating: 4.7,
      studentsEnrolled: 2340
    }
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

  const handleEnrollClick = (courseId: string) => {
    navigate(`/course-enrollment/${courseId}`);
  };

  // Helper function to normalize course data for display
  const normalizedCourses = displayCourses.map(course => ({
    id: course._id || course.id || '',
    courseId: course.courseId || course.id || '',
    title: course.courseName || course.title || '',
    description: course.courseDescription || course.description || '',
    instructor: course.instructorName || course.instructor || '',
    duration: course.totalDuration ? `${course.totalDuration} minutes` : course.duration || '',
    level: course.stream || course.level || 'Beginner',
    price: course.courseType === 'paid' ? `₹${course.price}` : course.price || '₹0',
    originalPrice: course.originalPrice || (course.courseType === 'paid' ? `₹${Math.round(course.price * 1.5)}` : '₹0'),
    isPaid: course.courseType === 'paid' || course.isPaid || false,
    image: course.courseImageLink || course.image || '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    skills: course.curriculum?.slice(0, 3).map(topic => topic.topicName) || course.skills || [],
    rating: course.rating || 4.5,
    studentsEnrolled: course.studentsEnrolled || Math.floor(Math.random() * 1000) + 100,
    stream: course.stream || '',
    providerName: course.providerName || '',
    courseLanguage: course.courseLanguage || 'English',
    certificationProvided: course.certificationProvided || 'yes'
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {normalizedCourses.map((course) => (
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
                onClick={() => handleEnrollClick(course.courseId)}
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
