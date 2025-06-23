
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Database, Calculator, TrendingUp, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, PlayCircle } from 'lucide-react';

const LiveCourses = () => {
  const navigate = useNavigate();

 

const courses = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Master HTML, CSS, JavaScript, React and build modern web applications',
    duration: '12 weeks',
    students: '2,500+',
    rating: 4.8,
    color: 'bg-blue-500',
    icon: Code,
    price: "₹2,999",
    originalPrice: "₹4,999",
    lessons: 45,
    level: "Beginner to Advanced"
  },
  {
    id: 2,
    title: 'Data Science',
    description: 'Learn Python, Machine Learning, Statistics and Data Analysis',
    duration: '16 weeks',
    students: '1,800+',
    rating: 4.9,
    color: 'bg-orange-500',
    icon: Database,
    price: "₹2,499",
    originalPrice: "₹3,999",
    lessons: 38,
    level: "Beginner"
  },
  {
    id: 3,
    title: 'Aptitude Training',
    description: 'Quantitative aptitude, logical reasoning, and verbal ability',
    duration: '8 weeks',
    students: '3,200+',
    rating: 4.7,
    color: 'bg-green-500',
    icon: Calculator,
    price: "₹1,999",
    originalPrice: "₹2,999",
    lessons: 30,
    level: "Beginner to Intermediate"
  },
  {
    id: 4,
    title: 'Business Analytics',
    description: 'Excel, Power BI, Tableau and business intelligence tools',
    duration: '10 weeks',
    students: '1,500+',
    rating: 4.6,
    color: 'bg-purple-500',
    icon: TrendingUp,
    price: "₹3,499",
    originalPrice: "₹5,499",
    lessons: 55,
    level: "Beginner to Advanced"
  },
  {
    id: 5,
    title: 'Soft Skills',
    description: 'Communication, leadership and professional development',
    duration: '6 weeks',
    students: '4,000+',
    rating: 4.8,
    color: 'bg-pink-500',
    icon: Users,
    price: "₹2,299",
    originalPrice: "₹3,499",
    lessons: 35,
    level: "Beginner"
  },
  {
    id: 6,
    title: 'Job Readiness',
    description: 'Resume building, interview preparation and placement support',
    duration: '4 weeks',
    students: '2,800+',
    rating: 4.9,
    color: 'bg-indigo-500',
    icon: Briefcase,
    price: "₹3,299",
    originalPrice: "₹4,799",
    lessons: 42,
    level: "Intermediate"
  }
];


  const handleEnroll = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Courses</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
             Join interactive live sessions with expert instructors, ask questions in real-time, and participate in group discussions.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
  <div className="relative flex items-center justify-center h-48">
    <div className={`h-24 w-24 ${course.color} rounded-full flex items-center justify-center`}>
      <course.icon className="h-12 w-12 text-white" />
    </div>
    <div className="absolute top-4 right-4">
      <Badge variant="secondary" className="bg-white/90">
        {course.level}
      </Badge>
    </div>
  </div>

  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
        <CardDescription className="text-sm">{course.description}</CardDescription>
      </div>
    </div>

    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-4">
      <div className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        {course.duration}
      </div>
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-1" />
        {course.students}
      </div>
      <div className="flex items-center">
        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
        {course.rating}
      </div>
    </div>
  </CardHeader>

  <CardContent>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-blue-600">{course.price}</span>
        <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
      </div>
      <div className="text-sm text-gray-600">
        {course.lessons} lessons
      </div>
    </div>
  </CardContent>

  <CardFooter>
    <Button 
      onClick={handleEnroll}
      className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
    >
      Enroll Now
    </Button>
  </CardFooter>
</Card>

          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveCourses;
