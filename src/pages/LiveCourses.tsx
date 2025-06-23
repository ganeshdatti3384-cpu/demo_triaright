
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, PlayCircle } from 'lucide-react';

const LiveCourses = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      description: "Master HTML, CSS, JavaScript, React, Node.js and MongoDB",
      duration: "40 hours",
      students: "2,500+",
      rating: 4.8,
      price: "₹2,999",
      originalPrice: "₹4,999",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
      lessons: 45,
      level: "Beginner to Advanced"
    },
    {
      id: 2,
      title: "Python Programming & Data Science",
      description: "Learn Python, NumPy, Pandas, Matplotlib and Machine Learning basics",
      duration: "35 hours",
      students: "1,800+",
      rating: 4.7,
      price: "₹2,499",
      originalPrice: "₹3,999",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
      lessons: 38,
      level: "Beginner"
    },
    {
      id: 3,
      title: "Digital Marketing Mastery",
      description: "Complete course on SEO, Social Media, Google Ads, and Analytics",
      duration: "25 hours",
      students: "3,200+",
      rating: 4.9,
      price: "₹1,999",
      originalPrice: "₹2,999",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
      lessons: 30,
      level: "Beginner to Intermediate"
    },
    {
      id: 4,
      title: "Java Programming Complete Course",
      description: "Core Java, OOP concepts, Collections, Spring Boot fundamentals",
      duration: "50 hours",
      students: "2,100+",
      rating: 4.6,
      price: "₹3,499",
      originalPrice: "₹5,499",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
      lessons: 55,
      level: "Beginner to Advanced"
    },
    {
      id: 5,
      title: "UI/UX Design Fundamentals",
      description: "Design principles, Figma, Adobe XD, User Research, and Prototyping",
      duration: "30 hours",
      students: "1,500+",
      rating: 4.8,
      price: "₹2,299",
      originalPrice: "₹3,499",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
      lessons: 35,
      level: "Beginner"
    },
    {
      id: 6,
      title: "Mobile App Development with React Native",
      description: "Build iOS and Android apps with React Native and Expo",
      duration: "45 hours",
      students: "1,200+",
      rating: 4.7,
      price: "₹3,299",
      originalPrice: "₹4,799",
      image: "/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png",
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Recorded Courses</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn at your own pace with our comprehensive recorded courses. Access lifetime content and build your skills with industry-expert instructors.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {course.level}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white" />
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
