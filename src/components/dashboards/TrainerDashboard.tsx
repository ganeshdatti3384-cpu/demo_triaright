/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import TrainerNavbar from "@/components/trainer/TrainerNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Home,
  BookOpen,
  CalendarDays,
  PlayCircle,
  ClipboardList,
  FileText,
  ChevronRight,
  Users,
  Clock,
  Award,
  TrendingUp,
  Zap,
  MessageSquare,
  BarChart3,
  Target,
  CheckCircle,
  Star,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Calendar,
  BookMarked,
  GraduationCap,
  Video,
  FileCode,
  Send,
  Sparkles,
  Rocket,
  Brain,
  Lightbulb,
  Users2,
  TrendingUp as TrendingUpIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  FileText as FileTextIcon,
  Shield,
  CreditCard,
  Settings,
  LogOut,
  Upload,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";

// Assignment Components
import AssignmentList from "@/components/trainer/AssignmentsList";

// Sessions Components
import CreateSession from "@/components/trainer/CreateSession";
import SessionsList from "@/components/trainer/SessionList";

// Courses Components
import CoursesList from "@/components/trainer/CourseList";

// Import Batch Components
import BatchList from "@/components/trainer/BatchList";
import CreateBatchModal from "@/components/trainer/CreateBatchModal";
import ViewStudentsModal from "@/components/trainer/ViewStudentsModal";

// --------------------------------------
// Section Type
// --------------------------------------
type Section =
  | "overview"
  | "courses"
  | "batches"
  | "sessions"
  | "assignments"
  | "submissions"
  | "profile";

interface TrainerDashboardProps {
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
    trainerId?: string;
  };
}

// --------------------------------------
// Navbar Items
// --------------------------------------
const navItems: { key: Section; label: string; icon: any; description: string }[] = [
  { key: "overview", label: "Overview", icon: Home, description: "Dashboard insights" },
  { key: "courses", label: "Courses", icon: BookOpen, description: "Manage courses" },
  { key: "batches", label: "Batches", icon: Users2, description: "Student batches" },
  { key: "sessions", label: "Sessions", icon: Video, description: "Live classes" },
  { key: "assignments", label: "Assignments", icon: FileCode, description: "Tasks & projects" },
  { key: "submissions", label: "Submissions", icon: Send, description: "Student work" },
  { key: "profile", label: "Profile", icon: User, description: "Your profile" },
];

// Default profile data
const defaultProfile = {
  fullName: "Alex Johnson",
  email: "alex.johnson@yakken.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Senior Trainer specializing in React, Node.js, and modern web development. Passionate about creating engaging learning experiences.",
  expertise: ["React", "Node.js", "TypeScript", "UI/UX Design"],
  website: "https://alexjohnson.dev",
  linkedin: "https://linkedin.com/in/alexjohnson",
  twitter: "https://twitter.com/alexjohnson",
  yearsExperience: 8,
  studentsTaught: 1200,
  rating: 4.8,
  avatar: "",
};

// Default courses data
const defaultCourses = [
  {
    id: 1,
    name: "React Mastery",
    instructor: "Alex Johnson",
    description: "Master React from basics to advanced concepts with hands-on projects",
    demoVideoLink: "https://youtube.com/watch?v=example1",
    stream: "IT",
    provider: "Triaright",
    language: "English",
    isPaid: true,
    hasCertification: true,
    hasFinalExam: true,
    courseImage: "",
    curriculumDoc: "",
    topics: [
      { id: 1, name: "React Fundamentals", examFileName: "fundamentals.xlsx", subTopics: [] },
      { id: 2, name: "State Management", examFileName: "state-management.xlsx", subTopics: [] },
    ],
    createdAt: "2024-01-15",
    students: 45,
    rating: 4.8,
    status: "published"
  },
  {
    id: 2,
    name: "Node.js Backend",
    instructor: "Alex Johnson",
    description: "Build scalable backend applications with Node.js and Express",
    demoVideoLink: "https://youtube.com/watch?v=example2",
    stream: "IT",
    provider: "Triaright",
    language: "English",
    isPaid: true,
    hasCertification: true,
    hasFinalExam: true,
    courseImage: "",
    curriculumDoc: "",
    topics: [
      { id: 1, name: "Node.js Basics", examFileName: "basics.xlsx", subTopics: [] },
      { id: 2, name: "Express Framework", examFileName: "express.xlsx", subTopics: [] },
    ],
    createdAt: "2024-01-20",
    students: 32,
    rating: 4.6,
    status: "published"
  },
  {
    id: 3,
    name: "UI/UX Design",
    instructor: "Alex Johnson",
    description: "Learn modern UI/UX design principles and tools",
    demoVideoLink: "https://youtube.com/watch?v=example3",
    stream: "Design",
    provider: "Triaright",
    language: "English",
    isPaid: false,
    hasCertification: false,
    hasFinalExam: false,
    courseImage: "",
    curriculumDoc: "",
    topics: [
      { id: 1, name: "Design Fundamentals", examFileName: "design-fundamentals.xlsx", subTopics: [] },
    ],
    createdAt: "2024-02-01",
    students: 28,
    rating: 4.9,
    status: "published"
  },
  {
    id: 4,
    name: "Data Structures",
    instructor: "Alex Johnson",
    description: "Master data structures and algorithms for technical interviews",
    demoVideoLink: "https://youtube.com/watch?v=example4",
    stream: "IT",
    provider: "Triaright",
    language: "English",
    isPaid: true,
    hasCertification: true,
    hasFinalExam: true,
    courseImage: "",
    curriculumDoc: "",
    topics: [
      { id: 1, name: "Arrays & Linked Lists", examFileName: "arrays.xlsx", subTopics: [] },
      { id: 2, name: "Trees & Graphs", examFileName: "trees.xlsx", subTopics: [] },
    ],
    createdAt: "2024-02-10",
    students: 51,
    rating: 4.7,
    status: "draft"
  },
];

// Default batches data
const defaultBatches = [
  {
    id: "1",
    batchName: "MERN-Batch-Jan-2024",
    courseId: "1",
    trainerId: "trainer-1",
    schedule: {
      day: "Monday",
      startTime: "10:00",
      endTime: "12:00",
      timezone: "IST (UTC+5:30)"
    },
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    students: Array(35).fill({}).map((_, i) => ({
      id: `student-${i}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      enrollmentDate: '2024-01-01',
      phone: `+1 (555) ${100 + i}-${1000 + i}`
    })),
    maxStudents: 50,
    currentStudents: 35,
    status: 'Ongoing' as const,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    isActive: true
  },
  {
    id: "2",
    batchName: "React-Batch-Feb-2024",
    courseId: "1",
    trainerId: "trainer-1",
    schedule: {
      day: "Wednesday",
      startTime: "14:00",
      endTime: "16:00",
      timezone: "IST (UTC+5:30)"
    },
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    students: Array(20).fill({}).map((_, i) => ({
      id: `student-${i + 35}`,
      name: `Student ${i + 36}`,
      email: `student${i + 36}@example.com`,
      enrollmentDate: '2024-02-01',
      phone: `+1 (555) ${200 + i}-${2000 + i}`
    })),
    maxStudents: 40,
    currentStudents: 20,
    status: 'Ongoing' as const,
    meetingLink: "https://meet.google.com/xyz-uvw-rst",
    isActive: true
  },
  {
    id: "3",
    batchName: "NodeJS-Batch-Mar-2024",
    courseId: "2",
    trainerId: "trainer-1",
    schedule: {
      day: "Friday",
      startTime: "09:00",
      endTime: "11:00",
      timezone: "IST (UTC+5:30)"
    },
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    students: Array(15).fill({}).map((_, i) => ({
      id: `student-${i + 55}`,
      name: `Student ${i + 56}`,
      email: `student${i + 56}@example.com`,
      enrollmentDate: '2024-03-01',
      phone: `+1 (555) ${300 + i}-${3000 + i}`
    })),
    maxStudents: 30,
    currentStudents: 15,
    status: 'Scheduled' as const,
    meetingLink: "https://meet.google.com/mno-pqr-stu",
    isActive: true
  },
  {
    id: "4",
    batchName: "UI/UX-Batch-Dec-2023",
    courseId: "3",
    trainerId: "trainer-1",
    schedule: {
      day: "Tuesday",
      startTime: "11:00",
      endTime: "13:00",
      timezone: "IST (UTC+5:30)"
    },
    startDate: "2023-12-01",
    endDate: "2024-02-29",
    students: Array(28).fill({}).map((_, i) => ({
      id: `student-${i + 70}`,
      name: `Student ${i + 71}`,
      email: `student${i + 71}@example.com`,
      enrollmentDate: '2023-12-01',
      phone: `+1 (555) ${400 + i}-${4000 + i}`
    })),
    maxStudents: 30,
    currentStudents: 28,
    status: 'Completed' as const,
    meetingLink: "https://meet.google.com/vwx-yza-bcd",
    isActive: false
  },
];

// --------------------------------------
// FULL TRAINER DASHBOARD UI
// --------------------------------------
const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  user = { name: "Alex Johnson", role: "Senior Trainer", avatar: "", trainerId: "" },
}) => {
  const [active, setActive] = useState<Section>("overview");
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state - Load from localStorage
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('trainerProfile');
    return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Assignments
  const [assignments, setAssignments] = useState<any[]>([]);

  // Sessions
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // Courses - Load from localStorage
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('trainerCourses');
    return savedCourses ? JSON.parse(savedCourses) : defaultCourses;
  });

  // Batches - Load from localStorage
  const [batches, setBatches] = useState(() => {
    const savedBatches = localStorage.getItem('trainerBatches');
    return savedBatches ? JSON.parse(savedBatches) : defaultBatches;
  });

  // Batch Modals
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [batchToEdit, setBatchToEdit] = useState<any>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate statistics based on actual data
  const calculateStats = () => {
    const activeBatches = batches.filter(b => b.status === 'Ongoing' && b.isActive).length;
    const upcomingSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const today = new Date();
      return sessionDate >= today;
    }).length;
    
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    
    // Calculate total students across all active batches
    const totalStudents = batches
      .filter(b => b.isActive)
      .reduce((sum, batch) => sum + batch.currentStudents, 0);
    
    // Calculate completion rate based on batch progress
    const completionRate = batches.length > 0 
      ? Math.round((batches.filter(b => b.status === 'Completed').length / batches.length) * 100)
      : 0;

    const publishedCourses = courses.filter(c => c.status === "published").length;

    return {
      courses: publishedCourses,
      batches: batches.length,
      activeBatches,
      upcomingSessions,
      pendingAssignments,
      totalAssignments: assignments.length,
      totalStudents,
      completionRate,
    };
  };

  const [stats, setStats] = useState(calculateStats());

  // --------------------------------------
  // Load saved data from localStorage on component mount
  // --------------------------------------
  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('trainerProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setTempProfile(parsedProfile);
      } catch (error) {
        console.error('Error loading profile from localStorage:', error);
      }
    }

    // Load courses from localStorage
    const savedCourses = localStorage.getItem('trainerCourses');
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        setCourses(parsedCourses);
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
      }
    }

    // Load batches from localStorage
    const savedBatches = localStorage.getItem('trainerBatches');
    if (savedBatches) {
      try {
        const parsedBatches = JSON.parse(savedBatches);
        setBatches(parsedBatches);
      } catch (error) {
        console.error('Error loading batches from localStorage:', error);
      }
    }

    // Load assignments from localStorage
    const savedAssignments = localStorage.getItem('trainerAssignments');
    if (savedAssignments) {
      try {
        const parsedAssignments = JSON.parse(savedAssignments);
        setAssignments(parsedAssignments);
      } catch (error) {
        console.error('Error loading assignments from localStorage:', error);
      }
    }

    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('trainerSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      } catch (error) {
        console.error('Error loading sessions from localStorage:', error);
      }
    }
  }, []);

  // --------------------------------------
  // Save data to localStorage whenever they change
  // --------------------------------------
  useEffect(() => {
    localStorage.setItem('trainerProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('trainerCourses', JSON.stringify(courses));
    // Update stats when courses change
    setStats(prev => ({ ...prev, courses: courses.filter(c => c.status === "published").length }));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('trainerBatches', JSON.stringify(batches));
    // Update stats when batches change
    const newStats = calculateStats();
    setStats(newStats);
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('trainerAssignments', JSON.stringify(assignments));
    // Update stats when assignments change
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    setStats(prev => ({ 
      ...prev, 
      pendingAssignments,
      totalAssignments: assignments.length 
    }));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('trainerSessions', JSON.stringify(sessions));
    // Update stats when sessions change
    const upcomingSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const today = new Date();
      return sessionDate >= today;
    }).length;
    setStats(prev => ({ ...prev, upcomingSessions }));
  }, [sessions]);

  // --------------------------------------
  // Fake Animation Loader for Overview
  // --------------------------------------
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);

      setTimeout(() => {
        cardRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.classList.add("animate-in");
            ref.style.animationDelay = `${index * 100}ms`;
          }
        });
      }, 100);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // --------------------------------------
  // Profile Handlers
  // --------------------------------------
  const handleEditProfile = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    const updatedProfile = { ...tempProfile };
    
    if (avatarPreview) {
      updatedProfile.avatar = avatarPreview;
    }
    
    setProfile(updatedProfile);
    setIsEditing(false);
    
    localStorage.setItem('trainerProfile', JSON.stringify(updatedProfile));
    
    setAvatarPreview(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setTempProfile(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  // --------------------------------------
  // Assignment Handlers
  // --------------------------------------
  const handleCreateAssignment = (data: any) => {
    const newAssignment = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const newAssignments = [...assignments, newAssignment];
    setAssignments(newAssignments);
  };

  const handleDeleteAssignment = (id: number) => {
    const newAssignments = assignments.filter((a) => a.id !== id);
    setAssignments(newAssignments);
  };

  // --------------------------------------
  // Session Handlers
  // --------------------------------------
  const handleCreateSession = (data: any) => {
    const newSession = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const newSessions = [...sessions, newSession];
    setSessions(newSessions);
    setShowCreateSession(false);
  };

  const handleDeleteSession = (id: number) => {
    const newSessions = sessions.filter((s) => s.id !== id);
    setSessions(newSessions);
  };

  // --------------------------------------
  // Course Handlers
  // --------------------------------------
  const handleCreateCourse = (course: any) => {
    const newCourse = {
      ...course,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      students: 0,
      rating: 0,
      status: 'draft'
    };
    const newCourses = [...courses, newCourse];
    setCourses(newCourses);
  };

  const handleUpdateCourse = (updatedCourse: any) => {
    const newCourses = courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    );
    setCourses(newCourses);
  };

  const handleDeleteCourse = (id: number) => {
    const newCourses = courses.filter(course => course.id !== id);
    setCourses(newCourses);
  };

  // --------------------------------------
  // Batch Handlers
  // --------------------------------------
  const handleCreateBatch = (batchData: any) => {
    const newBatch = {
      id: Date.now().toString(),
      ...batchData,
      currentStudents: 0,
      students: [],
      isActive: true
    };
    const newBatches = [...batches, newBatch];
    setBatches(newBatches);
    setShowCreateBatchModal(false);
  };

  const handleEditBatch = (batch: any) => {
    setBatchToEdit(batch);
    setShowEditBatchModal(true);
  };

  const handleUpdateBatch = (updatedBatchData: any) => {
    const newBatches = batches.map(batch => 
      batch.id === updatedBatchData.id ? { ...batch, ...updatedBatchData } : batch
    );
    setBatches(newBatches);
    setShowEditBatchModal(false);
    setBatchToEdit(null);
  };

  const handleDeleteBatch = (batchId: string) => {
    const newBatches = batches.filter(batch => batch.id !== batchId);
    setBatches(newBatches);
  };

  const handleViewStudents = (batch: any) => {
    setSelectedBatch(batch);
    setShowViewStudentsModal(true);
  };

  // --------------------------------------
  // Render Sections
  // --------------------------------------
  const renderContent = () => {
    switch (active) {
      // ----------------------
      // OVERVIEW SECTION
      // ----------------------
      case "overview":
        return (
          <div className="w-full max-w-7xl mx-auto px-2 md:px-4">
            {/* Welcome Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{profile.fullName}</span>! 👋
                </h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your teaching today</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Trainer Pro
                </Badge>
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </div>
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {[ 
                { 
                  label: "Active Courses", 
                  value: stats.courses, 
                  icon: BookOpen,
                  change: `+${stats.courses - courses.filter(c => c.status === "draft").length}`,
                  color: "bg-gradient-to-br from-blue-500 to-blue-600",
                  description: "Published courses"
                },
                { 
                  label: "Total Batches", 
                  value: stats.batches, 
                  icon: Users,
                  change: `${stats.activeBatches} active`,
                  color: "bg-gradient-to-br from-green-500 to-emerald-600",
                  description: "Student groups"
                },
                { 
                  label: "Total Students", 
                  value: stats.totalStudents, 
                  icon: GraduationCap,
                  change: "+" + Math.floor(stats.totalStudents * 0.1),
                  color: "bg-gradient-to-br from-purple-500 to-pink-600",
                  description: "Enrolled learners"
                },
                { 
                  label: "Upcoming Sessions", 
                  value: stats.upcomingSessions, 
                  icon: Calendar,
                  change: stats.upcomingSessions > 0 ? "Scheduled" : "None",
                  color: "bg-gradient-to-br from-orange-500 to-red-600",
                  description: "Live classes"
                },
                { 
                  label: "Pending Assignments", 
                  value: stats.pendingAssignments, 
                  icon: FileCode,
                  change: `${stats.totalAssignments} total`,
                  color: "bg-gradient-to-br from-cyan-500 to-teal-600",
                  description: "To review"
                },
                { 
                  label: "Completion Rate", 
                  value: `${stats.completionRate}%`, 
                  icon: TrendingUpIcon,
                  change: stats.completionRate > 80 ? "Excellent" : "Good",
                  color: "bg-gradient-to-br from-violet-500 to-purple-600",
                  description: "Batch progress"
                },
              ].map((s, i) => (
                <div 
                  key={s.label} 
                  ref={(el) => (cardRefs.current[i] = el)}
                  className="group relative overflow-hidden"
                >
                  <Card className="shadow-lg border-0 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm bg-white/80">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${s.color} text-white shadow-lg`}>
                          <s.icon className="h-5 w-5" />
                        </div>
                        <Badge className="bg-green-50 text-green-700 hover:bg-green-100">
                          {s.change}
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-1">{s.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="font-bold text-2xl">{s.value}</p>
                        <div className="h-1 w-8 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-2">{s.description}</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Courses */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Your Courses
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => setActive("courses")}
                      >
                        View all <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {courses.slice(0, 4).map((course) => (
                        <div 
                          key={course.id}
                          className="group p-4 rounded-xl border hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer"
                          onClick={() => setActive("courses")}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-800">{course.name}</h3>
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {course.students} students
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status</span>
                              <Badge className={
                                course.status === 'published' ? 'bg-green-100 text-green-800' :
                                course.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {course.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Stream</span>
                              <span className="font-medium">{course.stream}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <span className="text-xs text-gray-500">Created {new Date(course.createdAt).toLocaleDateString()}</span>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Manage <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Actions & Upcoming */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setActive("assignments")}
                        className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700"
                      >
                        <FileCode className="h-5 w-5" />
                        <span className="text-sm">New Assignment</span>
                      </Button>
                      <Button 
                        onClick={() => setActive("sessions")}
                        className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200 text-emerald-700"
                      >
                        <Video className="h-5 w-5" />
                        <span className="text-sm">Live Session</span>
                      </Button>
                      <Button 
                        onClick={() => setShowCreateBatchModal(true)}
                        className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 text-purple-700"
                      >
                        <Users2 className="h-5 w-5" />
                        <span className="text-sm">Create Batch</span>
                      </Button>
                      <Button 
                        onClick={() => setActive("courses")}
                        className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200 text-amber-700"
                      >
                        <BookOpen className="h-5 w-5" />
                        <span className="text-sm">Create Course</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Sessions */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {sessions.length > 0 ? (
                        sessions.slice(0, 3).map((session, idx) => (
                          <div key={idx} className="p-3 rounded-lg border hover:bg-orange-50/30 transition-colors group">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{session.title || "Untitled Session"}</h4>
                                <p className="text-sm text-gray-600">
                                  {session.batch || "No Batch"} • {session.time || "No Time"}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                                Join
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-lg border bg-gray-50 text-center">
                          <p className="text-gray-500 text-sm">No upcoming sessions</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-2"
                            onClick={() => setActive("sessions")}
                          >
                            Schedule One
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Metrics */}
            <Card className="shadow-lg border-0 mb-8">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance Metrics
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% growth
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/30 border">
                    <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/30 border">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {batches.length > 0 ? Math.round(
                        (batches.filter(b => b.status === 'Completed').length / batches.length) * 100
                      ) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Batch Completion Rate</div>
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" 
                          style={{ 
                            width: `${batches.length > 0 ? Math.round(
                              (batches.filter(b => b.status === 'Completed').length / batches.length) * 100
                            ) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {batches.reduce((sum, batch) => sum + batch.currentStudents, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Active Learners</div>
                    <div className="flex justify-center mt-2">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // ----------------------
      // COURSES SECTION
      // ----------------------
      case "courses":
        return (
          <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-6">
            <CoursesList
              courses={courses}
              onCourseCreated={handleCreateCourse}
              onCourseUpdated={handleUpdateCourse}
              onCourseDeleted={handleDeleteCourse}
            />
          </div>
        );

      // ----------------------
      // ASSIGNMENTS SECTION
      // ----------------------
      case "assignments":
        return (
          <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-6">
            <AssignmentList
              assignments={assignments}
              onDelete={handleDeleteAssignment}
              onCreated={handleCreateAssignment}
            />
          </div>
        );

      // ----------------------
      // SESSIONS SECTION
      // ----------------------
      case "sessions":
        return (
          <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Live Sessions</h2>
                <p className="text-gray-600">Schedule and conduct interactive classes</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setShowCreateSession(true)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </div>
            </div>

            {showCreateSession && (
              <div className="animate-in fade-in-50">
                <CreateSession
                  onCreated={handleCreateSession}
                />
              </div>
            )}

            <SessionsList
              sessions={sessions}
              onDelete={handleDeleteSession}
            />
          </div>
        );

      // ----------------------
      // BATCHES SECTION
      // ----------------------
      case "batches":
        return (
          <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Batches Management</h2>
                <p className="text-gray-600">Organize students into groups with scheduled classes</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transition-all"
                onClick={() => setShowCreateBatchModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Batch
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search batches by name, course, or status..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Batches Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Total Batches</p>
                      <p className="text-2xl font-bold text-blue-900">{batches.length}</p>
                    </div>
                    <Users2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Active Batches</p>
                      <p className="text-2xl font-bold text-green-900">
                        {batches.filter(b => b.status === 'Ongoing').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700">Total Students</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {batches.reduce((sum, batch) => sum + batch.currentStudents, 0)}
                      </p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">Avg. Capacity</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {batches.length > 0 
                          ? Math.round(batches.reduce((sum, batch) => sum + (batch.currentStudents / batch.maxStudents * 100), 0) / batches.length)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Batch List */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                {batches.length > 0 ? (
                  <BatchList
                    batches={batches.filter(batch => 
                      batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      batch.status.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onViewStudents={handleViewStudents}
                    onEditBatch={handleEditBatch}
                    onDeleteBatch={handleDeleteBatch}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Users2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No batches created yet</h3>
                    <p className="text-gray-500 mb-6">Start organizing your students into batches for better management</p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      onClick={() => setShowCreateBatchModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Batch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      // ----------------------
      // PROFILE SECTION
      // ----------------------
      case "profile":
        return (
          <div className="max-w-6xl mx-auto p-2 md:p-4 space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <Button 
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={tempProfile.fullName}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={tempProfile.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={tempProfile.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              value={tempProfile.location}
                              onChange={handleInputChange}
                              placeholder="Enter your location"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={tempProfile.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              name="website"
                              value={tempProfile.website}
                              onChange={handleInputChange}
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              name="linkedin"
                              value={tempProfile.linkedin}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-500">
                              <User className="h-4 w-4" />
                              <span className="text-sm">Full Name</span>
                            </div>
                            <p className="font-medium text-gray-900">{profile.fullName}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Mail className="h-4 w-4" />
                              <span className="text-sm">Email Address</span>
                            </div>
                            <p className="font-medium text-gray-900">{profile.email}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">Phone Number</span>
                            </div>
                            <p className="font-medium text-gray-900">{profile.phone}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">Location</span>
                            </div>
                            <p className="font-medium text-gray-900">{profile.location}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-500">
                            <FileTextIcon className="h-4 w-4" />
                            <span className="text-sm">Bio</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Links</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {profile.website && (
                              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                Website
                              </a>
                            )}
                            {profile.linkedin && (
                              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                LinkedIn
                              </a>
                            )}
                            {profile.twitter && (
                              <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                Twitter
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expertise Section */}
                <Card className="shadow-lg border-0 overflow-hidden mt-6">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      Expertise & Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((skill, index) => (
                        <Badge key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Avatar & Stats */}
              <div className="space-y-6">
                {/* Avatar Card */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Camera className="h-5 w-5 text-purple-600" />
                      Profile Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-40 w-40 border-4 border-white shadow-xl">
                          <AvatarImage src={avatarPreview || profile.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl">
                            {profile.fullName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <Camera className="h-5 w-5 text-gray-700" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Upload a new photo</p>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Choose Image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAvatarChange}
                            />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <h3 className="font-bold text-xl text-gray-900">{profile.fullName}</h3>
                          <p className="text-gray-600">Senior Trainer</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Teaching Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Years Experience</p>
                            <p className="font-bold text-lg text-gray-900">{profile.yearsExperience} years</p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Students Taught</p>
                            <p className="font-bold text-lg text-gray-900">{profile.studentsTaught.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Star className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                            <p className="font-bold text-lg text-gray-900">{profile.rating}/5.0</p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users2 className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Active Batches</p>
                            <p className="font-bold text-lg text-gray-900">{stats.activeBatches}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Shield className="h-4 w-4" />
                        Privacy & Security
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <CreditCard className="h-4 w-4" />
                        Billing & Subscription
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Button>
                      <Separator className="my-2" />
                      <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-6xl mx-auto p-8 text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border shadow-inner">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Section Under Development</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This section is currently being enhanced with new features. Check back soon!
              </p>
            </div>
          </div>
        );
    }
  };

  // --------------------------------------
  // Return Final JSX
  // --------------------------------------
  return (
    <>
      <TrainerNavbar />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 md:p-6">
        {/* Main Container */}
        <div className="max-w-7xl mx-auto">
          {/* Top Bar with User Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Educator <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Lightbulb className="h-4 w-4" />
                Empowering learning, one session at a time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900">{profile.fullName}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow">
                <AvatarImage src={avatarPreview || profile.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {profile.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Navigation Tabs - Enhanced */}
          <div className="mb-8">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardContent className="p-2">
                <div className="flex flex-col sm:flex-row gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => setActive(item.key)}
                        className={`relative flex-1 sm:flex-none sm:flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 group ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white rounded-t-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <main>{renderContent()}</main>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2024 Yakken Learning Platform. Empowering educators worldwide.</p>
              <p className="mt-1">Built with ❤️ for better education</p>
            </div>
          </footer>
        </div>

        {/* Batch Modals */}
        <CreateBatchModal
          open={showCreateBatchModal}
          onClose={() => setShowCreateBatchModal(false)}
          onSubmit={handleCreateBatch}
          courses={courses.map(course => ({
            id: course.id.toString(),
            title: course.name
          }))}
          mode="create"
        />

        <CreateBatchModal
          open={showEditBatchModal}
          onClose={() => {
            setShowEditBatchModal(false);
            setBatchToEdit(null);
          }}
          onSubmit={handleUpdateBatch}
          courses={courses.map(course => ({
            id: course.id.toString(),
            title: course.name
          }))}
          editData={batchToEdit}
          mode="edit"
        />

        <ViewStudentsModal
          open={showViewStudentsModal}
          onClose={() => setShowViewStudentsModal(false)}
          students={selectedBatch?.students || []}
          batchInfo={{
            batchName: selectedBatch?.batchName || '',
            schedule: selectedBatch?.schedule || { day: '', startTime: '', endTime: '' },
            currentStudents: selectedBatch?.currentStudents || 0,
            maxStudents: selectedBatch?.maxStudents || 0
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-in { 
          animation: fadeIn 0.5s ease-out forwards; 
          opacity: 0; 
        }
        .hover-float:hover {
          animation: float 2s ease-in-out infinite;
        }
        .shadow-inner {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </>
  );
};

export default TrainerDashboard;