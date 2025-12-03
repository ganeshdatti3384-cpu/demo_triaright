/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Trophy, Users, Clock, Star, Play, Code, FolderOpen, Settings, User, Calendar, Bell, Award, CheckCircle, Briefcase, GraduationCap, PenTool, FileText, Filter, Search, Calculator, MapPin, Target, TrendingUp, AlertCircle, IndianRupee, PlayCircle, CreditCard, FileCheck, BellRing, CalendarDays, Building, Laptop, Zap, Mail, Phone, MapPin as MapPinIcon, DollarSign, Building2 } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';
import CodeCompiler from '../CodeCompiler';
import EnhancedProfile from '../EnhancedProfile';
import ResumeBuilder from '../ResumeBuilder';
import { useNavigate } from 'react-router-dom';
import CourseCards from '../CourseCards';
import { useAuth } from '../../hooks/useAuth';
import { pack365Api, Pack365Course, EnhancedPack365Enrollment, courseApi, jobsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Pack365Courses from '../Pack365Courses';
import Pack365Dashboard from '../Pack365Dashboard';
import Pack365CoursesStudent from '../Pack365Courses2';
import { EnhancedCourse } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import APStudentDashboard from '@/components/student/APStudentDashboard';
import ApplyInternshipDialog from '@/components/internships/ApplyInternshipDialog';
import StudentCourseManagement from '@/components/student/StudentCourseManagement'; 

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  skills: string[];
  createdAt: string;
  status: 'Open' | 'Closed' | 'On Hold';
  isFeatured?: boolean;
  companyLogo?: string;
}

interface Internship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Remote' | 'On-Site' | 'Hybrid';
  category: string;
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Unpaid' | 'Paid' | 'FeeBased';
  stipendAmount?: number;
  currency: string;
  qualification: string;
  experienceRequired?: string;
  skills: string[];
  openings: number;
  perks: string[];
  certificateProvided: boolean;
  letterOfRecommendation: boolean;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
}

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

// Trust badges data
const trustBadges = [
  {
    name: "Pack365",
    image: "/pack365.png"
  },
  {
    name: "AP Exclusive Internships",
    image: "/AP.png"
  },
  {
    name: "Live Courses",
    image: "/LC.png"
  },
  {
    name: "Recorded Course",
    image: "/RC.png"
  },
  {
    name: "jobs & internships",
    image: "/j&i.png"
  }
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [pack365Courses, setPack365Courses] = useState<Pack365Course[]>([]);
  const [pack365Enrollments, setPack365Enrollments] = useState<EnhancedPack365Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<EnhancedCourse[]>([]);
  const [freeCourses, setFreeCourses] = useState<EnhancedCourse[]>([]);
  const [paidCourses, setPaidCourses] = useState<EnhancedCourse[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loadingPack365, setLoadingPack365] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobFilters, setJobFilters] = useState({
    jobType: '',
    location: ''
  });
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Internships state
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [internshipSearchTerm, setInternshipSearchTerm] = useState('');
  const [internshipFilters, setInternshipFilters] = useState({
    type: 'all',
    mode: 'all'
  });
  const [internshipActiveTab, setInternshipActiveTab] = useState('all');

  // AP Internships state
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [filteredAPInternships, setFilteredAPInternships] = useState<APInternship[]>([]);
  const [loadingAPInternships, setLoadingAPInternships] = useState(true);

  // Internship Application state
  const [selectedInternship, setSelectedInternship] = useState<Internship | APInternship | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await pack365Api.getMyEnrollments(token);
        if (response.success || response.enrollments) {
          console.log('Pack365 Enrollments fetched:', response.enrollments);
          setPack365Enrollments(response.enrollments);
          setEnrolledCourses(response.enrollments.filter((e: any) => e.paymentStatus === 'completed' || e.paymentStatus === 'enrolled'));
          setCompletedCourses(response.enrollments.filter((e: any) => e.status === 'completed'));
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      }
    };

    fetchEnrollments();
    fetchJobs();
    fetchInternships();
    fetchAPInternships();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await jobsApi.getAllJobs();
      const openJobs = response.data.filter((job: Job) => job.status === 'Open');
      setJobs(openJobs);
      setFilteredJobs(openJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({ title: "Error", description: "Could not fetch jobs.", variant: "destructive" });
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchInternships = async () => {
    setLoadingInternships(true);
    try {
      const response = await fetch('/api/internships');
      const data = await response.json();
      if (Array.isArray(data)) {
        const openInternships = data.filter((internship: Internship) => internship.status === 'Open');
        setInternships(openInternships);
        setFilteredInternships(openInternships);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internships',
        variant: 'destructive'
      });
    } finally {
      setLoadingInternships(false);
    }
  };

  const fetchAPInternships = async () => {
    setLoadingAPInternships(true);
    try {
      const response = await fetch('/api/internships/ap-internships');
      const data = await response.json();
      if (data.success) {
        const openAPInternships = data.internships.filter((internship: APInternship) => internship.status === 'Open');
        setApInternships(openAPInternships);
        setFilteredAPInternships(openAPInternships);
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
    } finally {
      setLoadingAPInternships(false);
    }
  };

  const handleInternshipApplicationSubmit = async (applicationData: any) => {
    if (!selectedInternship) return;

    setApplicationLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('internshipId', selectedInternship._id);
      formData.append('applicantDetails', JSON.stringify({
        name: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        college: applicationData.education,
        qualification: applicationData.education
      }));
      formData.append('portfolioLink', '');

      // For now, we'll use a mock resume since file upload requires actual file input
      // In a real implementation, you'd need a file input in the dialog
      const mockResume = new File(['mock-resume'], 'resume.pdf', { type: 'application/pdf' });
      formData.append('resume', mockResume);

      const response = await fetch('/api/internships/applications/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply for internship');
      }

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: "Your internship application has been submitted successfully.",
      });

      setShowApplyDialog(false);
      setSelectedInternship(null);

      // Refresh internships to reflect the application
      fetchInternships();

    } catch (error: any) {
      console.error('Error applying for internship:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleInternshipApply = (internship: Internship | APInternship) => {
    if (!user) {
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

    // Set the selected internship and open the apply dialog
    setSelectedInternship(internship);
    setShowApplyDialog(true);
  };

  useEffect(() => {
    let result = jobs;

    // Apply search filter
    if (jobSearchTerm) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(jobSearchTerm.toLowerCase()))
      );
    }

    // Apply job type filter
    if (jobFilters.jobType) {
      result = result.filter(job => job.jobType === jobFilters.jobType);
    }

    // Apply location filter
    if (jobFilters.location) {
      result = result.filter(job =>
        job.location.toLowerCase().includes(jobFilters.location.toLowerCase())
      );
    }

    setFilteredJobs(result);
  }, [jobSearchTerm, jobFilters, jobs]);

  useEffect(() => {
    filterInternships();
  }, [internships, internshipSearchTerm, internshipFilters, internshipActiveTab]);

  const filterInternships = () => {
    let filtered = internships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(internshipSearchTerm.toLowerCase()) ||
                           internship.companyName.toLowerCase().includes(internshipSearchTerm.toLowerCase()) ||
                           internship.description.toLowerCase().includes(internshipSearchTerm.toLowerCase());
      
      const matchesType = internshipFilters.type === 'all' || internship.internshipType.toLowerCase() === internshipFilters.type;
      const matchesMode = internshipFilters.mode === 'all' || internship.mode.toLowerCase() === internshipFilters.mode;

      return matchesSearch && matchesType && matchesMode;
    });

    // Apply tab-specific filtering
    if (internshipActiveTab === 'free') {
      filtered = filtered.filter(internship => internship.mode === 'Unpaid');
    } else if (internshipActiveTab === 'paid') {
      filtered = filtered.filter(internship => internship.mode === 'Paid');
    } else if (internshipActiveTab === 'remote') {
      filtered = filtered.filter(internship => internship.internshipType === 'Remote');
    }

    setFilteredInternships(filtered);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'Part-Time': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Contract': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'Internship': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getInternshipModeBadge = (mode: string) => {
    const variants = {
      Paid: 'default',
      Unpaid: 'outline',
      FeeBased: 'destructive',
      Free: 'secondary'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getInternshipTypeBadge = (type: string) => {
    const variants = {
      Remote: 'secondary',
      'On-Site': 'default',
      Hybrid: 'outline',
      Online: 'secondary',
      Offline: 'default'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleApplyNow = (job: Job) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;

    if (!applicationForm.applicantName || !applicationForm.email || !applicationForm.phone || !resumeFile) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill all required fields and upload a resume.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('applicantName', applicationForm.applicantName);
      formData.append('email', applicationForm.email);
      formData.append('phone', applicationForm.phone);
      formData.append('coverLetter', applicationForm.coverLetter);
      formData.append('resume', resumeFile);

      await jobsApi.applyToJob(selectedJob._id, formData);
      
      toast({
        title: "Application Submitted",
        description: `Your application for ${selectedJob.title} has been submitted successfully.`,
      });
      
      setIsApplyDialogOpen(false);
      setApplicationForm({
        applicantName: '',
        email: '',
        phone: '',
        coverLetter: ''
      });
      setResumeFile(null);
    } catch (error) {
      console.error("Failed to apply for job:", error);
      toast({ 
        title: "Error", 
        description: "Could not submit application. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const InternshipCard = ({ internship, isAP = false }: { internship: Internship | APInternship, isAP?: boolean }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    
    return (
      <Card className={`h-full flex flex-col ${isAP ? 'border-2 border-blue-200 hover:border-blue-300 transition-colors' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-lg mb-1 line-clamp-2">{internship.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">{internship.companyName}</span>
              </div>
            </div>
            {isAP && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                <Star className="h-3 w-3 mr-1" />
                AP Exclusive
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {getInternshipModeBadge(internship.mode)}
            {getInternshipTypeBadge(internship.internshipType)}
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
            {'stream' in internship && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stream:</span>
                <span className="font-medium">{internship.stream}</span>
              </div>
            )}
            {'term' in internship && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Term:</span>
                <span className="font-medium">{internship.term}</span>
              </div>
            )}
            {'amount' in internship && internship.amount && internship.amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stipend:</span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.amount.toLocaleString()}/month
                </span>
              </div>
            )}
            {'stipendAmount' in internship && internship.stipendAmount && internship.stipendAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stipend:</span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.stipendAmount.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => handleInternshipApply(internship)}
            disabled={deadlinePassed}
            variant={deadlinePassed ? "outline" : "default"}
          >
            {deadlinePassed ? 'Application Closed' : 'Apply Now'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const handleContinueLearning = (enrollment: EnhancedPack365Enrollment) => {
    console.log('🚀 Continue Learning clicked, enrollment:', enrollment);
    
    let courseId: string;
    
    if (typeof enrollment.courseId === 'string') {
      courseId = enrollment.courseId;
    } else if (enrollment.courseId && typeof enrollment.courseId === 'object' && 'courseId' in enrollment.courseId) {
      courseId = (enrollment.courseId as any)._id;
    } else {
      courseId = enrollment._id || '';
    }
    
    console.log('📋 Course ID extracted:', courseId);
    console.log('🎯 Navigation path:', `/learning/${courseId}`);

    if (courseId) {
      console.log('✅ Navigating to course learning page...');
      navigate(`/learning/${courseId}`);
    } else {
      console.error('❌ No valid course ID found in enrollment:', enrollment);
      toast({
        title: "Navigation Error",
        description: "Course ID not found. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStreamLearning = (stream: string) => {
    navigate(`/pack365-stream/${stream}`);
  };

  // Updated menu items without Exams
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'pack365', label: 'Pack365', icon: Zap },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'internships', label: 'Internships', icon: Building },
    { id: 'trainings', label: 'AP Exclusive Internships', icon: GraduationCap },
    { id: 'compiler', label: 'Compiler', icon: Code },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Trust Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle>Triaright - All in One Platform.</CardTitle>
                <CardDescription>Your Journey to Skills, Careers & Success Starts Here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {trustBadges.map((badge, index) => (
                    <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <div className="w-20 h-20 flex items-center justify-center mb-3">
                        <img 
                          src={badge.image} 
                          alt={badge.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                                <span class="text-xs font-semibold text-gray-600 text-center px-2">${badge.name}</span>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Notice */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Bell className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Prelim payment due</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Sorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <Button variant="link" className="p-0 text-blue-600">See more</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Exam Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Norem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Nine vulputate libero et velit interdum, ac aliquet odio mattis.
                      </p>
                    </div>
                    <Button variant="link" className="p-0 text-blue-600">See more</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'courses':
        return <StudentCourseManagement />;

      case 'pack365':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pack365 Courses</CardTitle>
                <CardDescription>All-in-One Learning Packages for an entire year</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="browse" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                    <TabsTrigger value="enrollments">My Enrollments</TabsTrigger>
                  </TabsList>

                  {/* ---------------- Browse Tab ---------------- */}
                  <TabsContent value="browse">
                    <Pack365CoursesStudent />
                  </TabsContent>

                  {/* ---------------- Enrollments Tab ---------------- */}
                  <TabsContent value="enrollments">
                    <div className="space-y-6">
                      {/* Pack365 Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Total Streams */}
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <Award className="h-8 w-8 text-purple-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                                <p className="text-2xl font-bold text-gray-900">{pack365Enrollments.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Total Courses */}
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <BookOpen className="h-8 w-8 text-blue-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                                <p className="text-2xl font-bold text-gray-900">{pack365Enrollments.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Average Progress */}
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <Target className="h-8 w-8 text-green-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {pack365Enrollments.length > 0 
                                    ? Math.round(pack365Enrollments.reduce((sum, enrollment) => sum + enrollment.totalWatchedPercentage, 0) / pack365Enrollments.length)
                                    : 0}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Completed Exams */}
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center">
                              <Trophy className="h-8 w-8 text-yellow-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed Exams</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {pack365Enrollments.filter(enrollment => enrollment.isExamCompleted).length}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* My Enrollments */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <GraduationCap className="h-6 w-6 mr-2" />
                            My Pack365 Enrollments
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          {loadingEnrollments ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p>Loading your enrollments...</p>
                            </div>
                          ) : pack365Enrollments.length === 0 ? (
                            <div className="text-center py-8">
                              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pack365 Enrollments</h3>
                              <p className="text-gray-500 mb-6">You haven't enrolled in any Pack365 streams yet.</p>
                              <Button onClick={() => navigate('/pack365')}>
                                Browse Pack365 Streams
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {pack365Enrollments.map((enrollment, index) => (
                                <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-lg capitalize">{enrollment.stream} Stream</CardTitle>
                                      <Badge 
                                        variant={enrollment.paymentStatus === 'completed' ? 'default' : 'secondary'}
                                        className={enrollment.paymentStatus === 'completed' ? 'bg-green-500' : ''}
                                      >
                                        {enrollment.paymentStatus}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <div className="flex items-center text-gray-500 mb-1">
                                          <IndianRupee className="h-3 w-3 mr-1" />
                                          <span>Amount Paid</span>
                                        </div>
                                        <p className="font-semibold">₹{enrollment.amountPaid || 0}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center text-gray-500 mb-1">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          <span>Status</span>
                                        </div>
                                        <p className="font-semibold text-xs capitalize">{enrollment.status || 'Active'}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Progress</span>
                                        <span className="text-sm text-gray-600">{Math.round(enrollment.totalWatchedPercentage || 0)}%</span>
                                      </div>
                                      <Progress value={enrollment.totalWatchedPercentage || 0} className="h-2" />
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>Enrolled: {formatDate(enrollment.enrollmentDate)}</span>
                                      </div>
                                    </div>

                                    <Button 
                                      onClick={() => handleStreamLearning(enrollment.stream)}
                                      className="w-full"
                                      size="sm"
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Continue Learning
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="job-assurance" className="space-y-4">
              <TabsList className="bg-white">
                <TabsTrigger value="job-assurance">Job Assurance</TabsTrigger>
                <TabsTrigger value="job-assistance">Browse Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="job-assurance" className="space-y-6">
                <div className="bg-blue-600 text-white rounded-lg p-8 mb-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Triaright Job Assurance Program</h2>
                    <p className="text-xl mb-6 text-blue-100">
                      Personalized Training + Guaranteed Placement — Or 100% Refund!
                    </p>
                    <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3">
                      🔥 Limited Slots Available – Apply Now!
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                    <CardHeader className="bg-blue-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-blue-800">IT Track</CardTitle>
                        <Badge className="bg-blue-600">Popular</Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">1 Year Program</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">₹30,000</div>
                        <p className="text-gray-600">Includes training & placement support</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Full-stack development training</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Interview preparation</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Resume building</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Guaranteed placement or refund</span>
                        </li>
                      </ul>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
                    <CardHeader className="bg-green-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-green-800">Non-IT Track</CardTitle>
                        <Badge className="bg-green-600">New</Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">6 Months Program</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">₹20,000</div>
                        <p className="text-gray-600">Includes training & placement support</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Digital marketing training</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Business analytics</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Soft skills development</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Guaranteed placement or refund</span>
                        </li>
                      </ul>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="job-assistance" className="space-y-6">
                {/* Search and Filters */}
                <Card className="mb-8 border-0 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-end">
                      <div className="flex-1 w-full">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Search Opportunities</Label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Job title, company, or keywords..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Job Type</Label>
                          <select
                            value={jobFilters.jobType}
                            onChange={(e) => setJobFilters(prev => ({ ...prev, jobType: e.target.value }))}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-12 focus:border-blue-500 transition-colors"
                          >
                            <option value="">All Types</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Any location"
                              value={jobFilters.location}
                              onChange={(e) => setJobFilters(prev => ({ ...prev, location: e.target.value }))}
                              className="pl-10 border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setJobSearchTerm('');
                              setJobFilters({ jobType: '', location: '' });
                            }}
                            className="h-12 px-6 border-2 rounded-xl w-full sm:w-auto"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Jobs List */}
                <div className="space-y-6">
                  {loadingJobs ? (
                    <div className="grid gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse border-0 shadow-sm rounded-2xl">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="flex gap-4">
                                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredJobs.map((job) => (
                        <Card key={job._id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-6">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                      {job.companyLogo ? (
                                        <img src={job.companyLogo} alt={job.companyName} className="w-8 h-8" />
                                      ) : (
                                        <Building2 className="h-6 w-6 text-gray-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="mb-2">
                                        <div>
                                          <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {job.title}
                                          </h3>
                                          <p className="text-lg text-gray-700 font-medium">{job.companyName}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-4 w-4" />
                                          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                      </div>

                                      <Badge className={`${getJobTypeColor(job.jobType)} border`}>
                                        {job.jobType}
                                      </Badge>

                                      <p className="text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                                        {job.description}
                                      </p>

                                      <div className="flex flex-wrap gap-2 mt-4">
                                        {job.skills.slice(0, 4).map((skill, index) => (
                                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                        {job.skills.length > 4 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{job.skills.length - 4} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 lg:items-end">
                                  <Button 
                                    className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                                    onClick={() => handleApplyNow(job)}
                                  >
                                    Apply Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Building2 className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          No jobs found
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          We couldn't find any jobs matching your criteria. Try adjusting your search filters or browse all available positions.
                        </p>
                        <Button
                          onClick={() => {
                            setJobSearchTerm('');
                            setJobFilters({ jobType: '', location: '' });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"
                        >
                          View All Jobs
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Modern Application Dialog */}
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Apply for {selectedJob?.title}
                  </DialogTitle>
                  <p className="text-gray-600">at {selectedJob?.companyName}</p>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Full Name *</Label>
                      <Input
                        value={applicationForm.applicantName}
                        onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                        placeholder="Enter your full name"
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email *</Label>
                      <Input
                        type="email"
                        value={applicationForm.email}
                        onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="rounded-xl h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cover Letter</Label>
                    <Textarea
                      value={applicationForm.coverLetter}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us why you're the perfect candidate for this position..."
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Resume *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setResumeFile(file);
                          }
                        }}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Label htmlFor="resume-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Upload your resume</p>
                            <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                          </div>
                          {resumeFile && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                              ✓ {resumeFile.name}
                            </p>
                          )}
                        </div>
                      </Label>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSubmitApplication} 
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-medium"
                  >
                    Submit Application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 'internships':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regular Internships</CardTitle>
                <CardDescription>Discover internship opportunities from top companies across India</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search internships by title, company, or description..."
                          value={internshipSearchTerm}
                          onChange={(e) => setInternshipSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <Select value={internshipFilters.type} onValueChange={(value) => setInternshipFilters({...internshipFilters, type: value})}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Internship Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="on-site">On-Site</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={internshipFilters.mode} onValueChange={(value) => setInternshipFilters({...internshipFilters, mode: value})}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Modes</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="feebased">Fee Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs and Content */}
                <Tabs value={internshipActiveTab} onValueChange={setInternshipActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Internships</TabsTrigger>
                    <TabsTrigger value="free">Unpaid</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="remote">Remote</TabsTrigger>
                  </TabsList>

                  {/* All Internships */}
                  <TabsContent value="all" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInternships.map((internship) => (
                        <InternshipCard key={internship._id} internship={internship} />
                      ))}
                    </div>
                    {filteredInternships.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Other Tabs */}
                  {['free', 'paid', 'remote'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInternships.map((internship) => (
                          <InternshipCard key={internship._id} internship={internship} />
                        ))}
                      </div>
                      {filteredInternships.length === 0 && (
                        <div className="text-center py-12">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {tab} internships found</h3>
                          <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Stats Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">{internships.length}</div>
                      <p className="text-sm text-gray-600">Total Internships</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {internships.filter(i => i.mode === 'Paid').length}
                      </div>
                      <p className="text-sm text-gray-600">Paid Opportunities</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {internships.filter(i => i.internshipType === 'Remote').length}
                      </div>
                      <p className="text-sm text-gray-600">Remote Work</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Apply Dialog for Regular Internships */}
            <ApplyInternshipDialog
              internship={selectedInternship}
              open={showApplyDialog}
              onOpenChange={setShowApplyDialog}
              onSubmit={handleInternshipApplicationSubmit}
              loading={applicationLoading}
            />
          </div>
        );

      case 'trainings':
        return <APStudentDashboard />;

      case 'compiler':
        return <CodeCompiler />;

      case 'resume':
        return <ResumeBuilder />;

      case 'profile':
        return <EnhancedProfile />;

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Student Dashboard</CardTitle>
                <CardDescription>Select an option from the menu to get started</CardDescription>
              </CardHeader>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
