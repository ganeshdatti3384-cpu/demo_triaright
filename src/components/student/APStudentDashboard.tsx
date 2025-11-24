// components/student/APStudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Video, Award, Clock, Play, CheckCircle, FileText, Search, MapPin, Building2, Calendar, IndianRupee, Users, Star, Eye, BarChart3, Zap, TrendingUp, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import APRazorpayPayment from '@/components/internships/APRazorpayPayment';

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
  views?: number;
  applications?: number;
  rating?: number;
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
  // Added fields from your backend model
  courseId?: {
    _id: string;
    title: string;
    totalDuration?: number;
    stream?: string;
    providerName?: string;
  };
  totalWatchedDuration?: number;
  totalVideoDuration?: number;
  finalExamEligible?: boolean;
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

interface Application {
  _id: string;
  internshipId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  enrollmentId?: string;
  orderId?: string;
  enrollmentType?: string;
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
  const [applications, setApplications] = useState<Application[]>([]);
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
    stream: 'all',
    sort: 'newest'
  });
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<APInternship | null>(null);
  const [applicationId, setApplicationId] = useState<string>('');
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔄 Dashboard mounted, fetching data...');
    fetchEnrollments();
    fetchApplications();
    fetchAPInternships();
    fetchCourses();
  }, []);

  useEffect(() => {
    console.log('📊 Enrollments updated:', enrollments);
    console.log('📊 Applications updated:', applications);
  }, [enrollments, applications]);

  useEffect(() => {
    filterInternships();
  }, [apInternships, searchTerm, filters]);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      setLoadingEnrollments(false);
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('🔄 Fetching enrollments from:', '/api/internships/apinternshipmy-enrollments');
      
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
        // Handle different possible response structures
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
          courseId: enrollment.courseId,
          totalWatchedDuration: enrollment.totalWatchedDuration || 0,
          totalVideoDuration: enrollment.totalVideoDuration || 0,
          finalExamEligible: enrollment.finalExamEligible || false,
          certificateIssued: enrollment.certificateIssued || false,
          certificateUrl: enrollment.certificateUrl
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

  const fetchApplications = async () => {
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, skipping applications fetch');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found for applications');
      return;
    }

    try {
      console.log('🔄 Fetching applications...');
      const response = await fetch('/api/internships/apinternshipmy-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Applications response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Applications API response:', data);
      
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        console.error('❌ Applications API error:', data);
        setApplications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchAPInternships = async () => {
    try {
      setLoadingInternships(true);
      console.log('🔄 Fetching AP internships...');
      
      const response = await fetch('/api/internships/ap-internships');
      console.log('📡 Internships response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Internships API response:', data);
      
      if (data.success) {
        const internshipsWithStats = data.internships.map((internship: APInternship) => ({
          ...internship,
          views: Math.floor(Math.random() * 1000) + 100,
          applications: Math.floor(Math.random() * 200) + 50,
          rating: parseFloat((Math.random() * 1 + 4).toFixed(1))
        }));
        const openInternships = internshipsWithStats.filter((internship: APInternship) => internship.status === 'Open');
        setApInternships(openInternships);
        setFilteredInternships(openInternships);
      } else {
        console.error('❌ AP Internships API error:', data);
        setApInternships([]);
        setFilteredInternships([]);
      }
    } catch (error) {
      console.error('❌ Error fetching AP internships:', error);
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
      console.log('🔄 Fetching courses...');
      const response = await fetch('/api/internships/ap-courses');
      const data = await response.json();
      console.log('📦 Courses API response:', data);
      
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
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

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'applications':
        filtered.sort((a, b) => (b.applications || 0) - (a.applications || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredInternships(filtered);
  };

  const updateProgress = async (enrollmentId: string, progress: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipenrollment-progress', {
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

  const isEnrolled = (internshipId: string) => {
    return enrollments.some(enrollment => enrollment.internshipId._id === internshipId && enrollment.status === 'active');
  };

  const hasApplied = (internshipId: string) => {
    return applications.some(application => 
      application.internshipId === internshipId
    );
  };

  const getApplication = (internshipId: string) => {
    return applications.find(application => application.internshipId === internshipId);
  };

  const getApplicationStatus = (internshipId: string) => {
    const application = getApplication(internshipId);
    if (!application) return 'not_applied';
    
    if (application.enrollmentId) return 'enrolled';
    if (application.paymentStatus === 'completed') return 'payment_completed';
    if (application.paymentStatus === 'pending') return 'payment_pending';
    
    return 'applied';
  };

  const handleApply = async (internship: APInternship) => {
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

    // Check application status
    const applicationStatus = getApplicationStatus(internship._id);
    const existingApplication = getApplication(internship._id);

    if (applicationStatus === 'enrolled') {
      toast({
        title: 'Already Enrolled',
        description: 'You are already enrolled in this internship',
        variant: 'default'
      });
      return;
    }

    if (applicationStatus === 'payment_pending' && internship.mode === 'Paid') {
      // Show payment page for pending paid applications
      setSelectedInternship(internship);
      setApplicationId(existingApplication!._id);
      setShowPaymentPage(true);
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

    setSelectedInternship(internship);

    // For free internships, enroll directly
    if (internship.mode === 'Free') {
      await enrollInFreeInternship(internship);
    } else {
      // For paid internships, create application and proceed to payment
      await createPaidApplication(internship);
    }
  };

  const enrollInFreeInternship = async (internship: APInternship) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId: internship._id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Successfully Enrolled!',
          description: `You have been enrolled in ${internship.title}`,
          variant: 'default'
        });
        
        // Refresh enrollments and applications
        await fetchEnrollments();
        await fetchApplications();
        
        // Redirect to enrolled tab
        setActiveTab('enrolled');
      } else {
        throw new Error(data.message || 'Failed to enroll in internship');
      }
    } catch (error: any) {
      console.error('Error enrolling in free internship:', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Failed to enroll in internship',
        variant: 'destructive'
      });
    }
  };

  const createPaidApplication = async (internship: APInternship) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId: internship._id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApplicationId(data.application._id);
        
        // For paid internships, proceed to payment
        setShowPaymentPage(true);
        
        // Refresh applications to get updated status
        await fetchApplications();
      } else {
        throw new Error(data.message || 'Failed to create application');
      }
    } catch (error: any) {
      console.error('Error creating paid application:', error);
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to create application',
        variant: 'destructive'
      });
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful!',
      description: `You have been successfully enrolled in ${selectedInternship?.title}`,
      variant: 'default'
    });
    
    // Refresh enrollments and applications
    fetchEnrollments();
    fetchApplications();
    
    // Switch to enrolled tab
    setActiveTab('enrolled');
    setShowPaymentPage(false);
  };

  const handlePaymentBack = () => {
    setShowPaymentPage(false);
    setSelectedInternship(null);
    setApplicationId('');
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating}</span>
      </div>
    );
  };

  const InternshipCard = ({ internship }: { internship: APInternship }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    const enrolled = isEnrolled(internship._id);
    const applicationStatus = getApplicationStatus(internship._id);
    const application = getApplication(internship._id);
    const daysLeft = Math.ceil((new Date(internship.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const getButtonText = () => {
      if (enrolled) return 'Go to Learning';
      if (applicationStatus === 'payment_pending') return 'Complete Payment';
      if (applicationStatus === 'payment_completed') return 'Processing...';
      if (applicationStatus === 'applied') return 'Processing...';
      if (internship.mode === 'Free') return 'Enroll Free';
      return 'Enroll Now';
    };

    const getButtonVariant = () => {
      if (enrolled) return 'default';
      if (applicationStatus === 'payment_pending') return 'default';
      if (deadlinePassed) return 'outline';
      return 'default';
    };

    const getButtonStyle = () => {
      if (enrolled) return 'bg-green-600 hover:bg-green-700';
      if (applicationStatus === 'payment_pending') return 'bg-orange-600 hover:bg-orange-700';
      if (deadlinePassed) return '';
      return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
    };

    return (
      <Card className="h-full flex flex-col border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden">
        {/* Popular Badge */}
        {internship.applications && internship.applications > 100 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        
        {/* Card Header with Gradient */}
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-200 rounded-full -ml-8 -mb-8 opacity-50"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {internship.title}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="line-clamp-1 font-medium">{internship.companyName}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap shadow-sm">
                <Star className="h-3 w-3 mr-1" />
                AP Exclusive
              </Badge>
              {enrolled && (
                <Badge variant="default" className="bg-green-500 text-white shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              )}
              {applicationStatus === 'payment_pending' && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 shadow-sm">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Payment Pending
                </Badge>
              )}
              {(applicationStatus === 'applied' || applicationStatus === 'payment_completed') && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3 relative z-10">
            {getModeBadge(internship.mode)}
            {getTypeBadge(internship.internshipType)}
            <Badge variant="outline" className="flex items-center bg-white">
              <MapPin className="h-3 w-3 mr-1" />
              {internship.location}
            </Badge>
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center justify-between text-sm relative z-10">
            {internship.rating && renderStars(internship.rating)}
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {internship.views}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {internship.applications}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow pt-4">
          <CardDescription className="line-clamp-3 text-sm mb-4">
            {internship.description}
          </CardDescription>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration:
              </span>
              <span className="font-medium text-gray-900">
                {internship.duration}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Start Date:
              </span>
              <span className="font-medium text-gray-900">
                {new Date(internship.startDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Apply Before:
              </span>
              <span className={`font-medium flex items-center ${deadlinePassed ? 'text-red-600' : daysLeft <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                {new Date(internship.applicationDeadline).toLocaleDateString()}
                {!deadlinePassed && daysLeft <= 7 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {daysLeft}d left
                  </Badge>
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Openings:
              </span>
              <span className="font-medium text-gray-900">
                {internship.openings} seats
              </span>
            </div>
            
            {internship.amount && internship.amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Amount:
                </span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-gray-100">
          <Button 
            className={`w-full shadow-sm ${getButtonStyle()}`}
            onClick={() => {
              if (enrolled) {
                // Find the enrollment and set it as selected, then switch to enrolled tab
                const enrollment = enrollments.find(e => e.internshipId._id === internship._id);
                if (enrollment) {
                  setSelectedEnrollment(enrollment);
                  setActiveTab('enrolled');
                }
              } else if (applicationStatus === 'payment_pending') {
                // Complete payment
                setSelectedInternship(internship);
                setApplicationId(application!._id);
                setShowPaymentPage(true);
              } else {
                handleApply(internship);
              }
            }}
            disabled={deadlinePassed || applicationStatus === 'applied' || applicationStatus === 'payment_completed'}
            variant={getButtonVariant()}
          >
            <div className="flex items-center">
              {enrolled && <BookOpen className="h-4 w-4 mr-2" />}
              {applicationStatus === 'payment_pending' && <CreditCard className="h-4 w-4 mr-2" />}
              {internship.mode === 'Free' && !enrolled && applicationStatus !== 'payment_pending' && <Zap className="h-4 w-4 mr-2" />}
              {internship.mode === 'Paid' && !enrolled && applicationStatus !== 'payment_pending' && <Star className="h-4 w-4 mr-2" />}
              {getButtonText()}
            </div>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Show payment page if applicable
  if (showPaymentPage && selectedInternship) {
    return (
      <APRazorpayPayment
        internshipId={selectedInternship._id}
        internshipTitle={selectedInternship.title}
        amount={selectedInternship.amount || 0}
        applicationId={applicationId}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={handlePaymentBack}
      />
    );
  }

  if (loading && loadingInternships && loadingEnrollments && !showPaymentPage) {
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
        {/* Enhanced Header */}
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
            Track your progress, manage enrollments, and discover new AP exclusive internship opportunities.
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800">Debug Info:</h3>
          <p className="text-xs text-yellow-700">
            Enrollments: {enrollments.length} | Applications: {applications.length} | 
            Loading: {loadingEnrollments ? 'Yes' : 'No'}
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

          {/* Enrolled Internships Tab */}
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
              <div className="space-y-6">
                {enrollments.map((enrollment) => {
                  const course = getCourseForEnrollment(enrollment);
                  console.log('Rendering enrollment:', enrollment);
                  console.log('Found course:', course);
                  
                  return (
                    <Card key={enrollment._id} className="border-l-4 border-l-blue-500 border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{enrollment.internshipId.title}</CardTitle>
                            <CardDescription className="text-base">
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
                              <Progress value={enrollment.progress} className="h-3 bg-gray-200">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </Progress>
                            </div>
                          )}

                          {/* Course Content - Show if course exists */}
                          {course ? (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg">Course Content</h4>
                              {course.curriculum.map((topic, index) => (
                                <div key={index} className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                                  <div className="flex justify-between items-center mb-3">
                                    <h5 className="font-medium text-base">{topic.topicName}</h5>
                                    <Badge variant="outline" className="text-xs bg-blue-50">
                                      {topic.subtopics.length} lessons
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {topic.subtopics.map((subtopic, subIndex) => (
                                      <div
                                        key={subIndex}
                                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
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
                                            className="bg-white hover:bg-blue-50"
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
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>Course content not available</p>
                            </div>
                          )}

                          {/* Certificate Section */}
                          {enrollment.certificateIssued && enrollment.certificateUrl && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Award className="h-6 w-6 text-green-600 mr-3" />
                                    <div>
                                      <p className="font-medium text-green-800 text-lg">Certificate Available</p>
                                      <p className="text-sm text-green-600">Download your completion certificate</p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(enrollment.certificateUrl, '_blank')}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View Certificate
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-600">
                            Last accessed: {enrollment.lastAccessed ? new Date(enrollment.lastAccessed).toLocaleDateString() : 'Never'}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/ap-internship-learning/${enrollment._id}`, '_blank')}
                              className="border-gray-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {enrollment.status === 'active' && (
                              <Button 
                                size="sm"
                                onClick={() => window.open(`/ap-internship-learning/${enrollment._id}`, '_blank')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
              {/* Enhanced Search and Filters */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search AP internships by title, company, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg shadow-sm"
                      />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger className="w-48 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                          <SelectValue placeholder="Internship Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filters.mode} onValueChange={(value) => setFilters({...filters, mode: value})}>
                        <SelectTrigger className="w-40 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filters.sort} onValueChange={(value) => setFilters({...filters, sort: value})}>
                        <SelectTrigger className="w-44 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="applications">Most Applications</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internships Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>

              {filteredInternships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No AP internships found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Video Player Dialog */}
          {showVideoPlayer && currentVideo && (
            <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
              <DialogContent className="max-w-4xl bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">{currentVideo.title}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video bg-black rounded-xl">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p>Video Player - {currentVideo.title}</p>
                      <p className="text-sm text-gray-400 mt-2">Video URL: {currentVideo.link}</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => window.open(currentVideo.link, '_blank')}
                      >
                        Open Video in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setShowVideoPlayer(false)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    );
  };

export default APStudentDashboard;
