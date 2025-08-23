
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  Play,
  CheckCircle2,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pack365Api, Pack365Course, EnhancedPack365Enrollment } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import EnhancedStudentDashboard from './EnhancedStudentDashboard';
import SimplifiedStudentDashboard from './SimplifiedStudentDashboard';

interface StudentDashboardProps {
  user: {
    role: string;
    name: string;
    firstName?: string;
  };
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<'enhanced' | 'simplified'>('enhanced');
  const [enrollments, setEnrollments] = useState<EnhancedPack365Enrollment[]>([]);
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    coursesCompleted: 0,
    totalHoursWatched: 0,
    averageProgress: 0,
    certificatesEarned: 0,
    upcomingExams: 0
  });

  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user enrollments and available courses
      const [enrollmentsResponse, coursesResponse] = await Promise.all([
        pack365Api.getMyEnrollments(token!),
        pack365Api.getAllCourses(token!)
      ]);

      if (enrollmentsResponse.success) {
        setEnrollments(enrollmentsResponse.data || []);
        calculateStats(enrollmentsResponse.data || []);
      }

      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (enrollmentData: EnhancedPack365Enrollment[]) => {
    const totalEnrolled = enrollmentData.length;
    const coursesCompleted = enrollmentData.filter(e => e.totalWatchedPercentage >= 100).length;
    const totalProgress = enrollmentData.reduce((sum, e) => sum + (e.totalWatchedPercentage || 0), 0);
    const averageProgress = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;
    const certificatesEarned = enrollmentData.filter(e => e.certificateGenerated).length;
    const upcomingExams = enrollmentData.filter(e => 
      e.totalWatchedPercentage >= 80 && !e.isExamCompleted
    ).length;

    // Calculate total hours watched (approximate)
    const totalHoursWatched = enrollmentData.reduce((sum, enrollment) => {
      const watchedPercentage = enrollment.totalWatchedPercentage || 0;
      // Assuming average course duration of 20 hours
      const estimatedHours = (watchedPercentage / 100) * 20;
      return sum + estimatedHours;
    }, 0);

    setStats({
      totalEnrolled,
      coursesCompleted,
      totalHoursWatched: Math.round(totalHoursWatched),
      averageProgress,
      certificatesEarned,
      upcomingExams
    });
  };

  const getRecentActivity = () => {
    return enrollments
      .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
      .slice(0, 3);
  };

  const getInProgressCourses = () => {
    return enrollments.filter(e => 
      e.totalWatchedPercentage > 0 && e.totalWatchedPercentage < 100
    ).slice(0, 4);
  };

  const continueWatching = (courseId: string) => {
    navigate(`/course-learning/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName || user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Track your learning progress and continue your journey</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <Button
                  variant={view === 'enhanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('enhanced')}
                  className="text-xs"
                >
                  Enhanced
                </Button>
                <Button
                  variant={view === 'simplified' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('simplified')}
                  className="text-xs"
                >
                  Simple
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Render Enhanced or Simplified Dashboard */}
        {view === 'enhanced' ? (
          <EnhancedStudentDashboard user={user} onLogout={onLogout} />
        ) : (
          <SimplifiedStudentDashboard user={user} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
