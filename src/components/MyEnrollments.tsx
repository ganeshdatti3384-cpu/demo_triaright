import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { courseApi } from '@/services/api';
import { BookOpen, Clock, Play, Award, CheckCircle } from 'lucide-react';

interface EnrollmentData {
  courseId: string;
  courseName: string;
  courseDescription: string;
  instructorName: string;
  courseImageLink: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  courseType: 'paid' | 'unpaid';
  totalDuration: number;
  stream: string;
  certificationProvided: 'yes' | 'no';
}

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to view your enrollments.',
          variant: 'destructive'
        });
        return;
      }

      const response = await courseApi.getMyEnrollments(token);
      if (response.success) {
        setEnrollments(response.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enrollments.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Enrollments</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">No Enrollments Yet</h2>
        <p className="text-gray-500 mb-6">
          Start your learning journey by enrolling in courses
        </p>
        <Button 
          onClick={() => navigate('/student-dashboard')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Enrollments</h2>
        <Badge variant="outline" className="text-sm">
          {enrollments.length} {enrollments.length === 1 ? 'Course' : 'Courses'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.courseId} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={enrollment.courseImageLink}
                alt={enrollment.courseName}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge 
                  variant={enrollment.courseType === 'paid' ? 'default' : 'secondary'}
                  className={enrollment.courseType === 'paid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-500 text-white'
                  }
                >
                  {enrollment.courseType === 'paid' ? 'Premium' : 'Free'}
                </Badge>
              </div>
              {enrollment.completed && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{enrollment.courseName}</CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>by {enrollment.instructorName}</span>
                <span className="capitalize">{enrollment.stream}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {enrollment.courseDescription}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(enrollment.progress)}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.totalDuration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                </div>
              </div>

              {enrollment.certificationProvided === 'yes' && (
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <Award className="h-4 w-4" />
                  <span>Certificate Available</span>
                </div>
              )}

              <Button 
                onClick={() => handleContinueLearning(enrollment.courseId)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {enrollment.completed ? 'Review Course' : 'Continue Learning'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyEnrollments;