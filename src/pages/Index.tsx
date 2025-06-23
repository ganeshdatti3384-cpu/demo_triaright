import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { 
  Play, 
  Users, 
  Award, 
  BookOpen, 
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import LoginDialog from '@/components/LoginDialog';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import InstructorDashboard from '@/components/dashboards/InstructorDashboard';
import { useUser } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import RegisterDialog from '@/components/RegisterDialog';

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, login, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data exists in localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      login(JSON.parse(storedUser));
    }
  }, [login]);

  const handleLogin = (userData: any) => {
    login(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
    // Redirect based on user role
    switch (userData.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'instructor':
        navigate('/instructor');
        break;
      default:
        navigate('/student');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    navigate('/');
  };

  const sliderImages = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop"
  ];

  const featuredCourses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      description: "Master modern web development with React, Node.js and more",
      duration: "12 weeks",
      students: 2500,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Data Science & Analytics",
      description: "Learn Python, ML algorithms and data visualization",
      duration: "16 weeks",
      students: 1800,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Digital Marketing",
      description: "Complete guide to online marketing and growth strategies",
      duration: "8 weeks",
      students: 3200,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=300&h=200&fit=crop"
    },
    {
      id: 4,
      title: "UI/UX Design",
      description: "Design beautiful and user-friendly interfaces",
      duration: "10 weeks",
      students: 1500,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop"
    }
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      role: "Software Engineer at Google",
      course: "Full Stack Development",
      salary: "₹18 LPA",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Rahul Kumar",
      role: "Data Scientist at Microsoft",
      course: "Data Science & ML",
      salary: "₹22 LPA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Anita Patel",
      role: "Product Manager at Amazon",
      course: "Digital Marketing",
      salary: "₹15 LPA",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    }
  ];

  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'instructor':
        return <InstructorDashboard user={user} onLogout={handleLogout} />;
      default:
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ee3e5233-9e80-4395-879e-09a00e589c85.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent">
                Career Hub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowLogin(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Login
              </Button>
              <Button 
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Slider */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {sliderImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Slider ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-orange-600/70 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                          Transform Your Career
                        </h2>
                        <p className="text-xl mb-6">Join thousands of successful professionals</p>
                        <Button 
                          size="lg"
                          onClick={() => setShowLogin(true)}
                          className="bg-white text-blue-900 hover:bg-gray-100"
                        >
                          Get Started Today
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our most popular courses designed to get you job-ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200"
                onClick={() => setShowLogin(true)}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-blue-600 to-orange-500">
                      ⭐ {course.rating}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students}+ students
                    </span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowLogin(true)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              View All Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Everything You Need to Succeed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive learning experience with industry-leading resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowLogin(true)}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Expert-Led Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Learn from industry professionals with real-world experience</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowLogin(true)}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl">Industry Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get recognized certificates that employers value</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowLogin(true)}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Career Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get job placement assistance and career guidance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how our students transformed their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {successStories.map((story, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <img 
                      src={story.image} 
                      alt={story.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-blue-200"
                    />
                  </div>
                  <CardTitle className="text-xl">{story.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-blue-600">
                    {story.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline" className="border-orange-200 text-orange-600">
                      {story.course}
                    </Badge>
                    <p className="text-2xl font-bold text-green-600">{story.salary}</p>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              View Success Stories
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join Career Hub today and unlock your full potential
            </p>
            <Button 
              size="lg"
              onClick={() => setShowRegister(true)}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              Get Started Now
              <CheckCircle className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      
      <LoginDialog 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLogin}
      />

      <RegisterDialog 
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </div>
  );
};

export default Index;
