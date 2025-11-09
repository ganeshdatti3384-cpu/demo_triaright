// components/student/APStudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Video, Award, Clock, Play, CheckCircle, FileText, Search, MapPin, Building2, Calendar, IndianRupee, Users, Star } from 'lucide-react';
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
  courseId: {
    _id: string;
    title: string;
    stream: string;
    totalDuration: number;
    curriculum: Topic[];
    instructorName: string;
  };
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    duration: string;
    mode: string;
  };
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  enrollmentDate: string;
}

interface Topic {
  topicName: string;
  subtopics: Subtopic[];
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

interface TopicProgress {
  topicName: string;
  subtopics: SubtopicProgress[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
}

interface SubtopicProgress {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
}

const APStudentDashboard = () => {
  const [enrollments, setEnrollments] = useState<APEnrollment[]>([]);
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInternships, setLoadingInternships] = useState(true);
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
  }, []);

  useEffect(() => {
    filterInternships();
  }, [apInternships, searchTerm, filters]);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/ap-enrollments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your enrollments',
        variant: 'destructive'
      });
    } finally {
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
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
    } finally {
      setLoadingInternships(false);
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

  const updateProgress = async (enrollmentId: string, topicName: string, subTopicName: string, watchedDuration: number) => {
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
          topicName,
          subTopicName,
          watchedDuration
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

  const playVideo = (enrollment: APEnrollment, topicName: string, subtopic: Subtopic) => {
    setSelectedEnrollment(enrollment);
    setCurrentVideo({
      link: subtopic.link,
      title: `${topicName} - ${subtopic.name}`
    });
    setShowVideoPlayer(true);

    // Start tracking progress
    const interval = setInterval(() => {
      if (selectedEnrollment) {
        updateProgress(enrollment._id, topicName, subtopic.name, subtopic.duration);
      }
    }, 30000); // Update every 30 seconds

    // Clear interval when component unmounts
    return () => clearInterval(interval);
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

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getCompletionPercentage = (enrollment: APEnrollment) => {
    if (enrollment.totalVideoDuration === 0) return 0;
    return (enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100;
  };

  const getTopicProgress = (enrollment: APEnrollment, topicName: string) => {
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return 0;
    if (topic.topicTotalDuration === 0) return 0;
    return (topic.topicWatchedDuration / topic.topicTotalDuration) * 100;
  };

  const isSubtopicCompleted = (enrollment: APEnrollment, topicName: string, subtopicName: string) => {
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    const subtopic = topic.subtopics.find(s => s.subTopicName === subtopicName);
    if (!subtopic) return false;
    return subtopic.watchedDuration >= subtopic.totalDuration * 0.9; // 90% watched
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

  const InternshipCard = ({ internship }: { internship: APInternship }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    const isEnrolled = enrollments.some(enrollment => enrollment.internshipId._id === internship._id);
    
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
              {isEnrolled && (
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
          {isEnrolled ? (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setActiveTab('enrolled')}>
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

  if (loading && loadingInternships) {
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
          <h1 className="text-3xl font-bold text-gray-900">My AP Internships</h1>
          <p className="text-gray-600">Track your progress in AP exclusive internship programs</p>
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
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrollments yet</h3>
                  <p className="text-gray-600 mb-4">You haven't enrolled in any AP internship programs.</p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse AP Internships
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment._id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{enrollment.courseId.title}</CardTitle>
                          <CardDescription>
                            {enrollment.internshipId.companyName} • {enrollment.internshipId.duration}
                            {enrollment.internshipId.mode === 'Paid' && ' • Paid Program'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              enrollment.courseCompleted ? "default" : 
                              getCompletionPercentage(enrollment) >= 80 ? "secondary" : "outline"
                            }
                          >
                            {enrollment.courseCompleted ? 'Completed' : 
                             getCompletionPercentage(enrollment) >= 80 ? 'Exam Ready' : 'In Progress'}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            Instructor: {enrollment.courseId.instructorName}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Overall Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span>{getCompletionPercentage(enrollment).toFixed(1)}%</span>
                          </div>
                          <Progress value={getCompletionPercentage(enrollment)} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{enrollment.totalWatchedDuration} mins watched</span>
                            <span>{enrollment.totalVideoDuration} mins total</span>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Course Content</h4>
                          {enrollment.courseId.curriculum.map((topic) => (
                            <div key={topic.topicName} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">{topic.topicName}</h5>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getTopicProgress(enrollment, topic.topicName).toFixed(0)}%
                                  </Badge>
                                  {enrollment.progress.find(t => t.topicName === topic.topicName)?.passed && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {topic.subtopics.map((subtopic) => (
                                  <div
                                    key={subtopic.name}
                                    className={`flex justify-between items-center p-2 rounded ${
                                      isSubtopicCompleted(enrollment, topic.topicName, subtopic.name)
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {isSubtopicCompleted(enrollment, topic.topicName, subtopic.name) ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Play className="h-4 w-4 text-gray-400" />
                                      )}
                                      <span className="text-sm">{subtopic.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xs text-gray-600">{subtopic.duration} mins</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => playVideo(enrollment, topic.topicName, subtopic)}
                                      >
                                        <Video className="h-3 w-3 mr-1" />
                                        Watch
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Topic Exam */}
                              {enrollment.progress.find(t => t.topicName === topic.topicName)?.examAttempted && (
                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="text-sm font-medium">Topic Exam: </span>
                                      <span className={`text-sm ${
                                        enrollment.progress.find(t => t.topicName === topic.topicName)?.passed
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}>
                                        {enrollment.progress.find(t => t.topicName === topic.topicName)?.score}%
                                        {enrollment.progress.find(t => t.topicName === topic.topicName)?.passed ? ' (Passed)' : ' (Failed)'}
                                      </span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Retake Exam
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        {enrollment.finalExamEligible && !enrollment.finalExamAttempted && (
                          <Button>
                            <Award className="h-4 w-4 mr-2" />
                            Take Final Exam
                          </Button>
                        )}
                        {enrollment.finalExamAttempted && (
                          <Badge variant={enrollment.courseCompleted ? "default" : "secondary"}>
                            {enrollment.courseCompleted ? 'Course Completed' : 'Final Exam Attempted'}
                          </Badge>
                        )}
                      </div>
                      {enrollment.courseCompleted && (
                        <Button variant="outline">
                          <Award className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
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
                {/* You can integrate with a proper video player here */}
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p>Video Player</p>
                    <p className="text-sm text-gray-400 mt-2">{currentVideo.link}</p>
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
