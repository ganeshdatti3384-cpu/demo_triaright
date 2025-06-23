
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Database, Calculator, Briefcase, Users, TrendingUp } from 'lucide-react';

interface CourseCardsProps {
  onCourseClick: () => void;
}

const CourseCards = ({ onCourseClick }: CourseCardsProps) => {
  const courses = [
    {
      id: 1,
      title: 'Web Development',
      description: 'Master HTML, CSS, JavaScript, React and build modern web applications',
      icon: Code,
      duration: '12 weeks',
      students: '2,500+',
      rating: 4.8,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Data Science',
      description: 'Learn Python, Machine Learning, Statistics and Data Analysis',
      icon: Database,
      duration: '16 weeks',
      students: '1,800+',
      rating: 4.9,
      color: 'bg-orange-500'
    },
    {
      id: 3,
      title: 'Aptitude Training',
      description: 'Quantitative aptitude, logical reasoning, and verbal ability',
      icon: Calculator,
      duration: '8 weeks',
      students: '3,200+',
      rating: 4.7,
      color: 'bg-green-500'
    },
    {
      id: 4,
      title: 'Business Analytics',
      description: 'Excel, Power BI, Tableau and business intelligence tools',
      icon: TrendingUp,
      duration: '10 weeks',
      students: '1,500+',
      rating: 4.6,
      color: 'bg-purple-500'
    },
    {
      id: 5,
      title: 'Soft Skills',
      description: 'Communication, leadership and professional development',
      icon: Users,
      duration: '6 weeks',
      students: '4,000+',
      rating: 4.8,
      color: 'bg-pink-500'
    },
    {
      id: 6,
      title: 'Job Readiness',
      description: 'Resume building, interview preparation and placement support',
      icon: Briefcase,
      duration: '4 weeks',
      students: '2,800+',
      rating: 4.9,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const IconComponent = course.icon;
        return (
          <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className={`${course.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <Badge variant="secondary">{course.duration}</Badge>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="text-gray-600">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <span>{course.students} students</span>
                <span>⭐ {course.rating}</span>
              </div>
              <Button 
                onClick={onCourseClick}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
              >
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CourseCards;
