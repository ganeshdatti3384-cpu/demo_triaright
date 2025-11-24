// components/student/APStudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckCircle, Clock, Play, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface APInternship {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Online' | 'Offline';
  duration: string;
  mode: 'Free' | 'Paid';
  stream: string;
  amount?: number;
  status: 'Open' | 'Closed' | 'On Hold';
}

interface APEnrollment {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    duration: string;
    mode: string;
    stream: string;
    internshipType: string;
  };
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  progress?: number;
}

const APStudentDashboard = () => {
  const [enrollments, setEnrollments] = useState<APEnrollment[]>([]);
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔄 Dashboard mounted, fetching data...');
    fetchEnrollments();
    fetchAPInternships();
  }, []);

  useEffect(() => {
    console.log('📊 Enrollments updated:', enrollments);
  }, [enrollments]);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      setLoadingEnrollments(false);
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('🔄 Fetching enrollments...');
      
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Enrollment response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw enrollment API response:', data);
      
      if (data.success) {
        const enrollmentData = data.enrollments || data.data || [];
        console.log('✅ Processed enrollments:', enrollmentData);
        
        // Transform the data to match our frontend interface
        const transformedEnrollments = enrollmentData.map((enrollment: any) => ({
          _id: enrollment._id,
          internshipId: enrollment.internshipId || {
            _id: enrollment.internshipId?._id || 'unknown',
            title: enrollment.internshipId?.title || 'Unknown Internship',
            companyName: enrollment.internshipId?.companyName || 'Unknown Company',
            duration: enrollment.internshipId?.duration || 'Unknown Duration',
            mode: enrollment.internshipId?.mode || 'Unknown',
            stream: enrollment.internshipId?.stream || 'Unknown',
            internshipType: enrollment.internshipId?.internshipType || 'Unknown'
          },
          userId: enrollment.userId,
          status: enrollment.status || 'active',
          enrolledAt: enrollment.enrolledAt || enrollment.enrollmentDate || new Date().toISOString(),
          progress: enrollment.progress || calculateProgress(enrollment),
        }));
        
        console.log('🔄 Transformed enrollments:', transformedEnrollments);
        setEnrollments(transformedEnrollments);
      } else {
        console.error('❌ API returned success: false', data);
        setEnrollments([]);
      }
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your enrollments',
        variant: 'destructive'
      });
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
      setLoading(false);
    }
  };

  // Helper function to calculate progress
  const calculateProgress = (enrollment: any): number => {
    if (enrollment.totalVideoDuration && enrollment.totalVideoDuration > 0) {
      return Math.round((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
    }
    return 0;
  };

  const fetchAPInternships = async () => {
    try {
      console.log('🔄 Fetching AP internships...');
      
      const response = await fetch('/api/internships/ap-internships');
      console.log('📡 Internships response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Internships API response:', data);
      
      if (data.success) {
        const openInternships = data.internships.filter((internship: APInternship) => internship.status === 'Open');
        setApInternships(openInternships);
      } else {
        console.error('❌ AP Internships API error:', data);
        setApInternships([]);
      }
    } catch (error) {
      console.error('❌ Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
      setApInternships([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStartLearning = (enrollmentId: string) => {
    // Simple navigation to learning page - will be enhanced later
    window.open(`/ap-internship-learning/${enrollmentId}`, '_blank');
  };

  // Show loading state
  if (loading && loadingEnrollments) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="text-center text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
            <div className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My AP Internships Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your progress and manage your AP exclusive internship enrollments.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-2 shadow-lg">
            <TabsTrigger 
              value="enrolled" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Enrolled Internships ({enrollments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="browse" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              <Star className="h-4 w-4 mr-2" />
              Browse AP Internships ({apInternships.length})
            </TabsTrigger>
          </TabsList>

          {/* Enrolled Internships Tab - SIMPLIFIED */}
          <TabsContent value="enrolled" className="space-y-6">
            {loadingEnrollments ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Loading your enrollments...</p>
                  </div>
                </CardContent>
              </Card>
            ) : enrollments.length === 0 ? (
              <Card className="border-0 shadow-xl text-center py-16">
                <CardContent>
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No enrollments yet</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                    You haven't enrolled in any AP internship programs yet.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('browse')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Browse AP Internships
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment._id} className="border-l-4 border-l-blue-500 border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 line-clamp-2">
                            {enrollment.internshipId.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {enrollment.internshipId.companyName}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {enrollment.internshipId.internshipType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {enrollment.internshipId.mode}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {enrollment.internshipId.duration}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      {/* Progress Bar */}
                      {enrollment.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2 bg-gray-200">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </Progress>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-gray-100">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => handleStartLearning(enrollment._id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Browse AP Internships Tab - SIMPLIFIED */}
          <TabsContent value="browse" className="space-y-6">
            {apInternships.length === 0 ? (
              <Card className="border-0 shadow-xl text-center py-16">
                <CardContent>
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No AP internships available</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Check back later for new internship opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apInternships.map((internship) => (
                  <Card key={internship._id} className="border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 line-clamp-2">
                            {internship.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {internship.companyName}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Star className="h-3 w-3 mr-1" />
                          AP Exclusive
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {internship.internshipType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {internship.mode}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {internship.duration}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {internship.description}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-gray-100">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => {
                          // Simple enroll logic - will be enhanced later
                          toast({
                            title: "Feature Coming Soon",
                            description: "Enrollment functionality will be added in the next update",
                            variant: "default"
                          });
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default APStudentDashboard;
