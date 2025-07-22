import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ArrowLeft,
  User,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { pack365Api } from '@/services/api';

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
}

interface StreamEnrollment {
  stream: string;
  amountPaid: number;
  enrollmentDate: string;
  expiresAt: string;
  paymentStatus: string;
  enrollmentType: string;
  totalWatchedPercentage: number;
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Course[];
}

const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreamEnrollment();
  }, [stream]);

  const fetchStreamEnrollment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access your courses.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await pack365Api.getMyEnrollments(token);
      
      if (response.success && response.enrollments) {
        const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
        const streamEnrollment = streamEnrollments.find(
          (enrollment: StreamEnrollment) => enrollment.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (streamEnrollment) {
          setEnrollment(streamEnrollment);
        } else {
          toast({
            title: 'Access Denied',
            description: 'You are not enrolled in this stream.',
            variant: 'destructive'
          });
          navigate('/pack365');
        }
      }
    } catch (error: any) {
      console.error('Error fetching stream enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your enrollment details.',
        variant: 'destructive'
      });
      navigate('/pack365');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseStart = (courseId: string) => {
    navigate(`/course-learning/${courseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your courses...</h2>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Stream Not Found</h2>
          <p className="text-gray-500 mb-6">You don't have access to this stream.</p>
          <Button onClick={() => navigate('/pack365')}>
            Browse Streams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/pack365-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {enrollment.stream} Stream Learning
            </h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>
        </div>

        {/* Stream Overview */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <GraduationCap className="h-6 w-6 mr-2" />
              Stream Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Enrolled Date</span>
                </div>
                <p className="font-semibold">{formatDate(enrollment.enrollmentDate)}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Courses</span>
                </div>
                <p className="font-semibold">{enrollment.coursesCount}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Progress</span>
                </div>
                <p className="font-semibold">{Math.round(enrollment.totalWatchedPercentage)}%</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{Math.round(enrollment.totalWatchedPercentage)}%</span>
              </div>
              <Progress value={enrollment.totalWatchedPercentage} className="h-3" />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Topics Completed</span>
                <span className="text-sm text-gray-600">
                  {enrollment.watchedTopics} / {enrollment.totalTopics}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(enrollment.watchedTopics / enrollment.totalTopics) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Available Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enrollment.courses.map((course, index) => (
                <Card key={course.courseId} className="border-2 hover:border-blue-200 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course.courseName}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.totalDuration} minutes
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {course.topicsCount} topics
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        Course {index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleCourseStart(course.courseId)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pack365StreamLearning;