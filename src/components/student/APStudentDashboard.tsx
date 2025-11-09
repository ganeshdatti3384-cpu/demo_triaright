// components/student/APStudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Video, Award, Clock, Play, CheckCircle, FileText, Search, MapPin, Building2, Calendar, IndianRupee, Users, Star, Eye, GraduationCap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface APInternship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Online' | 'Offline';
  term: 'Shortterm' | 'Longterm';
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Free' | 'Paid';
  stream: string;
  amount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
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
  lastAccessed?: string;
  certificateIssued?: boolean;
  certificateUrl?: string;
}

interface APCourse {
  _id: string;
  courseId: string;
  title: string;
  stream: string;
  totalDuration: number;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: string;
  hasFinalExam: boolean;
  internshipRef: {
    _id: string;
    title: string;
    companyName: string;
  };
  curriculum: Topic[];
  createdAt: string;
}

interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

const APStudentDashboard = () => {
  const [enrollments, setEnrollments] = useState<APEnrollment[]>([]);
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [courses, setCourses] = useState<APCourse[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<APEnrollment | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ link: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    mode: 'all',
    stream: 'all'
  });
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchEnrollments();
    fetchAPInternships();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [apInternships, searchTerm, filters]);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingEnrollments(false);
      return;
    }

    try {
      setLoadingEnrollments(true);
      const response = await fetch('/api/internships/ap-enrollments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollments || []);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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

  const fetchAPInternships = async () => {
    try {
      setLoadingInternships(true);
      const response = await fetch('/api/internships/ap-internships');
      const data = await response.json();
      if (data.success) {
        const openInternships = data.internships.filter((internship: APInternship) => internship.status === 'Open');
        setApInternships(openInternships);
        setFilteredInternships(openInternships);
      } else {
        setApInternships([]);
        setFilteredInternships([]);
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
      setApInternships([]);
      setFilteredInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/internships/ap-courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterInternships = () => {
    let filtered = apInternships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || internship.internshipType.toLowerCase() === filters.type;
      const matchesMode = filters.mode === 'all' || internship.mode.toLowerCase() === filters.mode;
      const matchesStream = filters.stream === 'all' || internship.stream.toLowerCase().includes(filters.stream);

      return matchesSearch && matchesType && matchesMode && matchesStream;
    });

    setFilteredInternships(filtered);
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/ap-enrollments/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId,
          progress
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchEnrollments(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const playVideo = (enrollment: APEnrollment, course: APCourse | undefined, topicName: string, subtopic: Subtopic) => {
    setSelectedEnrollment(enrollment);
    setCurrentVideo({
      link: subtopic.link,
      title: `${topicName} - ${subtopic.name}`
    });
    setShowVideoPlayer(true);

    // Update progress when video is played
    if (enrollment.progress !== undefined && enrollment.progress < 100) {
      const newProgress = Math.min(enrollment.progress + 10, 100);
      updateProgress(enrollment._id, newProgress);
    }
  };

  const handleApply = (internship: APInternship) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to apply for internships',
        variant: 'destructive'
      });
      return;
    }

    if (user?.role !== 'student' && user?.role !== 'jobseeker') {
      toast({
        title: 'Access Denied',
        description: 'Only students and job seekers can apply for internships',
        variant: 'destructive'
      });
      return;
    }

    // Check if already enrolled
    if (isEnrolled(internship._id)) {
      toast({
        title: 'Already Enrolled',
        description: 'You are already enrolled in this internship',
        variant: 'default'
      });
      return;
    }

    // Check if application deadline has passed
    if (isDeadlinePassed(internship.applicationDeadline)) {
      toast({
        title: 'Application Closed',
        description: 'The application deadline for this internship has passed',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: "Application Started",
      description: `Redirecting to apply for ${internship.title}`,
    });
    
    // Navigate to the AP internships page
    window.location.href = '/ap-internships';
  };

  const isEnrolled = (internshipId: string) => {
    return enrollments.some(enrollment => enrollment.internshipId._id === internshipId && enrollment.status === 'active');
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getCourseForEnrollment = (enrollment: APEnrollment) => {
    return courses.find(course => course.internshipRef._id === enrollment.internshipId._id);
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      Paid: 'default',
      Free: 'secondary'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      Online: 'secondary',
      Offline: 'default'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
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

  const InternshipCard = ({ internship }: { internship: APInternship }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    const enrolled = isEnrolled(internship._id);
    
    return (
      <Card className="h-full flex flex-col border-2 border-blue-200 hover:border-blue-300 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-lg mb-1 line-clamp-2">{internship.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{internship.companyName}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                <Star className="h-3 w-3 mr-1" />
                AP Exclusive
              </Badge>
              {enrolled && (
                <Badge variant="default" className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {getModeBadge(internship.mode)}
            {getTypeBadge(internship.internshipType)}
            <Badge variant="outline" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {internship.location}
            </Badge>
          </div>
          <CardDescription className="line-clamp-3 text-sm">
            {internship.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {internship.duration}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">
                {new Date(internship.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Apply Before:</span>
              <span className={`font-medium flex items-center ${deadlinePassed ? 'text-red-600' : 'text-green-600'}`}>
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Openings:</span>
              <span className="font-medium flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {internship.openings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Stream:</span>
              <span className="font-medium">{internship.stream}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Term:</span>
              <span className="font-medium">{internship.term}</span>
            </div>
            {internship.amount && internship.amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stipend:</span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.amount.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {enrolled ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => {
                const enrollment = enrollments.find(e => e.internshipId._id === internship._id);
                if (enrollment) {
                  setSelectedEnrollment(enrollment);
                  setActiveTab('enrolled');
                }
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => handleApply(internship)}
              disabled={deadlinePassed}
              variant={deadlinePassed ? "outline" : "default"}
            >
              {deadlinePassed ? 'Application Closed' : 
               internship.mode === 'Free' ? 'Apply & Enroll' : 'Apply Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (loading && loadingInternships && loadingEnrollments) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My AP Internships Dashboard</h1>
          <p className="text-gray-600">Track your progress in AP exclusive internship programs</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.length > 0 
                      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                      : 0
                    }%
                  </p>
                  <p className="text-sm text-gray-600">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.certificateIssued).length}
                  </p>
                  <p className="text-sm text-gray-600">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrolled" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Enrolled Internships ({enrollments.length})
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Browse AP Internships ({apInternships.length})
            </TabsTrigger>
          </TabsList>

          {/* Enrolled Internships Tab */}
          <TabsContent value="enrolled" className="space-y-6">
            {loadingEnrollments ? (
              <Card>
                <CardContent className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Loading your enrollments...</p>
                  </div>
                </CardContent>
              </Card>
            ) : enrollments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrollments yet</h3>
                  <p className="text-gray-600 mb-6">You haven't enrolled in any AP internship programs.</p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse AP Internships
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment) => {
                  const course = getCourseForEnrollment(enrollment);
                  return (
                    <Card key={enrollment._id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{enrollment.internshipId.title}</CardTitle>
                            <CardDescription>
                              {enrollment.internshipId.companyName} • {enrollment.internshipId.duration}
                              {enrollment.internshipId.mode === 'Paid' && ' • Paid Program'}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(enrollment.status)}
                            <div className="text-sm text-gray-500 mt-1">
                              Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          {enrollment.progress !== undefined && (
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Overall Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                          )}

                          {/* Course Content */}
                          {course && (
                            <div className="space-y-3">
                              <h4 className="font-semibold">Course Content</h4>
                              {course.curriculum.map((topic, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <h5 className="font-medium">{topic.topicName}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {topic.subtopics.length} lessons
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {topic.subtopics.map((subtopic, subIndex) => (
                                      <div
                                        key={subIndex}
                                        className="flex justify-between items-center p-2 rounded bg-gray-50"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <Play className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm">{subtopic.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <span className="text-xs text-gray-600">{subtopic.duration} mins</span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => playVideo(enrollment, course, topic.topicName, subtopic)}
                                          >
                                            <Video className="h-3 w-3 mr-1" />
                                            Watch
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Certificate Section */}
                          {enrollment.certificateIssued && enrollment.certificateUrl && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Award className="h-5 w-5 text-green-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-green-800">Certificate Available</p>
                                    <p className="text-sm text-green-600">Download your completion certificate</p>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(enrollment.certificateUrl, '_blank')}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Certificate
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="text-sm text-gray-600">
                          Last accessed: {enrollment.lastAccessed ? new Date(enrollment.lastAccessed).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/ap-internship-learning/${enrollment._id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {enrollment.status === 'active' && (
                            <Button 
                              size="sm"
                              onClick={() => window.open(`/ap-internship-learning/${enrollment._id}`, '_blank')}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Continue Learning
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Browse AP Internships Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search AP internships by title, company, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Internship Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.mode} onValueChange={(value) => setFilters({...filters, mode: value})}>
                      <SelectTrigger className="w-32 bg-white">
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.stream} onValueChange={(value) => setFilters({...filters, stream: value})}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Streams</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="computer science">Computer Science</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="law">Law</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internships Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No AP internships found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{apInternships.length}</div>
                  <p className="text-sm text-gray-600">AP Exclusive Internships</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {apInternships.filter(i => i.mode === 'Free').length}
                  </div>
                  <p className="text-sm text-gray-600">Free Opportunities</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {apInternships.filter(i => i.internshipType === 'Online').length}
                  </div>
                  <p className="text-sm text-gray-600">Online Programs</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {[...new Set(apInternships.map(i => i.stream))].length}
                  </div>
                  <p className="text-sm text-gray-600">Different Streams</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Video Player Dialog */}
        {showVideoPlayer && currentVideo && (
          <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{currentVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-lg">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p>Video Player - {currentVideo.title}</p>
                    <p className="text-sm text-gray-400 mt-2">Video URL: {currentVideo.link}</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => window.open(currentVideo.link, '_blank')}
                    >
                      Open Video in New Tab
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowVideoPlayer(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default APStudentDashboard;
