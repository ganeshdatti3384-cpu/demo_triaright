import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Users, Star, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      _id: string;
    }>;
    _id: string;
  }>;
  demoVideoLink: string;
  hasFinalExam: boolean;
}

interface ApiResponse {
  courses: Course[];
}

const CourseDisplayApp = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://triaright.com/api/courses/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course: Course ) => {
    // Mock enrollment logic - replace with your actual navigation/enrollment logic
    if (course.courseType === 'paid') {
     navigate('/payment-selection', { state: { courseId: course._id } });
    } else {
       navigate(`/course-enrollment/${course._id}`);
    }
  };

  const getTotalTopics = (curriculum: Course['curriculum']) => {
    return curriculum.reduce((total, topic) => total + topic.subtopics.length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading courses: {error}</p>
          <Button onClick={fetchCourses} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
        <p className="text-gray-600">Check back later for new courses.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Courses</h1>
        <p className="text-gray-600">Discover and enroll in our comprehensive course catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative">
              <img 
                src={course.courseImageLink} 
                alt={course.courseName}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png';
                }}
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
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className="bg-white/90 text-gray-700">
                  {course.stream.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="capitalize">
                  {course.courseLanguage}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.5</span>
                </div>
              </div>
              <CardTitle className="text-xl mb-2 line-clamp-2">{course.courseName}</CardTitle>
              <p className="text-gray-600 text-sm line-clamp-3">{course.courseDescription}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="truncate">{course.instructorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.totalDuration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 1000) + 100} enrolled</span>
                    </div>
                    {course.certificationProvided === 'yes' && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                        Certificate
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {course.curriculum.slice(0, 3).map((topic) => (
                      <Badge key={topic._id} variant="outline" className="text-xs">
                        {topic.topicName}
                      </Badge>
                    ))}
                    {course.curriculum.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.curriculum.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {getTotalTopics(course.curriculum)} lessons • {course.curriculum.length} modules
                    {course.hasFinalExam && ' • Final Exam'}
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleEnrollClick(course)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {course.courseType === 'paid' ? `Enroll Now - ₹${course.price}` : 'Join Free'}
                </Button>

                {course.demoVideoLink && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(course.demoVideoLink, '_blank')}
                  >
                    Watch Demo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Showing {courses.length} course{courses.length !== 1 ? 's' : ''} • 
          Powered by {courses[0]?.providerName || 'TraiRight'}
        </p>
      </div>
    </div>
  );
};

export default CourseDisplayApp;