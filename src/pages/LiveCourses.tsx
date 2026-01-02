import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Database, Calculator, TrendingUp, Users, Briefcase, Clock, Star, Loader2, BookOpen, Award, MapPin, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = "https://triaright.com/api/livecourses";

const LiveCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveCourses();
  }, []);

  const fetchLiveCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/live-courses`);
      // Access the courses array from the response
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Error fetching live courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const iconMap: { [key: string]: any } = {
    Code,
    Database,
    Calculator,
    TrendingUp,
    Users,
    Briefcase,
    BookOpen,
    GraduationCap
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('web') || categoryLower.includes('it')) return Code;
    if (categoryLower.includes('data')) return Database;
    if (categoryLower.includes('business')) return TrendingUp;
    return BookOpen;
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('web') || categoryLower.includes('it')) return 'bg-blue-500';
    if (categoryLower.includes('data')) return 'bg-purple-500';
    if (categoryLower.includes('business')) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const getLocationType = (location: any) => {
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return 'Online';
      }
    }
    
    if (location?.type === 'online') return 'Online';
    if (location?.type === 'offline') return `Offline - ${location.city || ''}`;
    if (location?.type === 'hybrid') return `Hybrid - ${location.city || ''}`;
    return 'Online';
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/live/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button onClick={fetchLiveCourses} variant="outline">
              Try Again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No live courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => {
              const IconComponent = getCategoryIcon(course.category);
              const colorClass = getCategoryColor(course.category);
              const locationType = getLocationType(course.location);
              
              return (
                <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => handleViewDetails(course.courseId)}>
                  <div className="relative flex items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                    {course.courseImage ? (
                      <img 
                        src={course.courseImage} 
                        alt={course.courseName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`h-24 w-24 ${colorClass} rounded-full flex items-center justify-center`}>
                        <IconComponent className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-blue-400 text-blue shadow-md hover:bg-blue-700">
                        {course.category}
                      </Badge>
                    </div>
                    {course.certificateProvided && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-green-500 text-white shadow-md">
                          <Award className="h-3 w-3 mr-1" />
                          Certificate
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{course.courseName}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">{course.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 text-sm text-gray-600 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration?.value} {course.duration?.unit}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrolledCount}/{course.maxStudents}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {locationType}
                      </div>

                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {course.trainerName}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-blue-600">₹{course.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {course.language}
                      </div>
                    </div>

                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Learning Outcomes:</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{course.learningOutcomes[0]}</p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(course.courseId);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LiveCourses;