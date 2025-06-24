
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Download, 
  Play, 
  CheckCircle,
  Eye,
  Users,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enrolled');

  // Mock enrolled courses data
  const enrolledCourses = [
    {
      id: 'web-development',
      title: 'Complete Web Development Bootcamp',
      progress: 65,
      totalLessons: 45,
      completedLessons: 29,
      lastWatched: 'CSS Grid System',
      instructor: 'John Doe',
      thumbnail: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      enrolledDate: '2024-01-15',
      certificate: false
    },
    {
      id: 'data-science',
      title: 'Data Science with Python',
      progress: 100,
      totalLessons: 38,
      completedLessons: 38,
      lastWatched: 'Final Project',
      instructor: 'Jane Smith',
      thumbnail: '/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png',
      enrolledDate: '2024-01-10',
      certificate: true
    },
    {
      id: 'business-analytics',
      title: 'Business Analytics Masterclass',
      progress: 30,
      totalLessons: 55,
      completedLessons: 16,
      lastWatched: 'Excel Fundamentals',
      instructor: 'Mike Johnson',
      thumbnail: '/lovable-uploads/cdf8ab47-8b3d-4445-820a-e1e1baca31e0.png',
      enrolledDate: '2024-02-01',
      certificate: false
    }
  ];

  // Mock browse courses data
  const browseCourses = [
    {
      id: 'aptitude-training',
      title: 'Aptitude Training',
      description: 'Quantitative aptitude, logical reasoning, and verbal ability',
      price: '₹1,999',
      originalPrice: '₹2,999',
      rating: 4.7,
      students: '3,200+',
      duration: '8 weeks',
      level: 'Beginner'
    },
    {
      id: 'soft-skills',
      title: 'Soft Skills Development',
      description: 'Communication, leadership and professional development',
      price: '₹2,299',
      originalPrice: '₹3,499',
      rating: 4.8,
      students: '4,000+',
      duration: '6 weeks',
      level: 'Beginner'
    },
    {
      id: 'job-readiness',
      title: 'Job Readiness Program',
      description: 'Resume building, interview preparation and placement support',
      price: '₹3,299',
      originalPrice: '₹4,799',
      rating: 4.9,
      students: '2,800+',
      duration: '4 weeks',
      level: 'Intermediate'
    }
  ];

  const handleContinueLearning = (courseId: string) => {
    navigate(`/courses/continue/${courseId}`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/recorded/${courseId}`);
  };

  const handleDownloadCertificate = (courseId: string) => {
    // Mock certificate download
    console.log(`Downloading certificate for course: ${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                <p className="text-gray-600">Continue your learning journey</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                  <p className="text-gray-600">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.filter(c => c.certificate).length}
                  </p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.filter(c => c.certificate).length}
                  </p>
                  <p className="text-gray-600">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">120h</p>
                  <p className="text-gray-600">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <Button
            variant={activeTab === 'enrolled' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('enrolled')}
            className="px-6"
          >
            My Courses
          </Button>
          <Button
            variant={activeTab === 'browse' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('browse')}
            className="px-6"
          >
            Browse Courses
          </Button>
        </div>

        {/* Enrolled Courses Tab */}
        {activeTab === 'enrolled' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-16 w-16 text-white opacity-80" />
                    </div>
                    <div className="absolute top-4 right-4">
                      {course.certificate && (
                        <Badge className="bg-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>Instructor: {course.instructor}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </p>
                      </div>

                      {/* Last Watched */}
                      <div className="text-sm">
                        <span className="text-gray-600">Last watched: </span>
                        <span className="font-medium">{course.lastWatched}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {course.certificate ? (
                          <Button 
                            onClick={() => handleDownloadCertificate(course.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Certificate
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleContinueLearning(course.id)}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewCourse(course.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Browse Courses Tab */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Available Courses</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {browseCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white opacity-80" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Course Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {course.rating}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                          <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={() => handleViewCourse(course.id)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
