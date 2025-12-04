// Triaright_EduCareer/src/components/CourseLearningInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Home, 
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// YouTube API Types
interface YouTubeVideoData {
  videoId: string;
  duration?: number;
  title?: string;
}

interface Topic {
  topicName: string;
  subtopics: Array<{
    name: string;
    link: string;
    duration: number;
    watchedDuration?: number;
    completed?: boolean;
  }>;
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
  completed?: boolean;
}

interface CourseData {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  curriculum: any[];
  totalDuration: number;
  courseImageLink?: string;
  instructorName: string;
  hasFinalExam: boolean;
}

interface EnrollmentData {
  _id: string;
  userId: string;
  courseId: string;
  progress: Topic[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  completedAt?: string;
  enrollmentDate: string;
}

interface ExamQuestion {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
  description?: string;
}

interface ExamData {
  examId: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  currentAttempt?: number;
  remainingAttempts?: number;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const CourseLearningInterface: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('content');
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examTimer, setExamTimer] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showExamResults, setShowExamResults] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [examType, setExamType] = useState<'topic' | 'final' | null>(null);
  const [currentExamTopic, setCurrentExamTopic] = useState<string>('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch course and enrollment data
  useEffect(() => {
    if (courseId && token) {
      loadCourseAndEnrollment();
    }
  }, [courseId, token]);
  
  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, []);
  
  const loadCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (courseResponse.data?.course) {
        setCourse(courseResponse.data.course);
      }
      
      // Fetch enrollment progress
      const enrollmentResponse = await axios.get(
        `${API_BASE_URL}/courses/enrollment/my-course-progress/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (enrollmentResponse.data?.data) {
        const enrollmentData = enrollmentResponse.data.data;
        setEnrollment({
          ...enrollmentData,
          courseId: enrollmentData.courseId || courseId
        });
        
        // Find first incomplete topic/subtopic
        if (enrollmentData.progress && enrollmentData.progress.length > 0) {
          let found = false;
          for (let i = 0; i < enrollmentData.progress.length; i++) {
            const topic = enrollmentData.progress[i];
            for (let j = 0; j < topic.subtopics.length; j++) {
              const subtopic = topic.subtopics[j];
              if (!subtopic.completed && subtopic.watchedDuration < subtopic.totalDuration) {
                setCurrentTopicIndex(i);
                setCurrentSubtopicIndex(j);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load course content",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };
  
  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): YouTubeVideoData => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return {
      videoId: videoIdMatch ? videoIdMatch[1] : '',
      title: ''
    };
  };
  
  // Get current video data
  const getCurrentVideo = (): YouTubeVideoData | null => {
    if (!enrollment?.progress || enrollment.progress.length === 0) return null;
    
    const currentTopic = enrollment.progress[currentTopicIndex];
    if (!currentTopic?.subtopics || currentTopic.subtopics.length === 0) return null;
    
    const currentSubtopic = currentTopic.subtopics[currentSubtopicIndex];
    if (!currentSubtopic?.link) return null;
    
    return extractYouTubeVideoId(currentSubtopic.link);
  };
  
  // YouTube player options
  const youtubeOpts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      fs: 1,
    },
  };
  
  // YouTube event handlers
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setVideoReady(true);
    
    // Get video duration
    event.target.getDuration().then((duration: number) => {
      setVideoDuration(duration);
    });
  };
  
  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    const playerState = event.data;
    
    // Playing
    if (playerState === 1) {
      setIsVideoPlaying(true);
      startProgressTracking();
    }
    // Paused or ended
    else if (playerState === 2 || playerState === 0) {
      setIsVideoPlaying(false);
      stopProgressTracking();
      
      // If video ended, mark as completed
      if (playerState === 0) {
        markCurrentSubtopicAsComplete();
      }
    }
  };
  
  // Start tracking video progress
  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    progressIntervalRef.current = setInterval(async () => {
      if (player && isVideoPlaying) {
        try {
          const currentTime = await player.getCurrentTime();
          const duration = await player.getDuration();
          const progressPercent = (currentTime / duration) * 100;
          setVideoProgress(progressPercent);
          
          // Update progress in backend every 30 seconds
          if (Math.round(currentTime) % 30 === 0) {
            updateProgressInBackend(currentTime);
          }
        } catch (error) {
          console.error('Error getting video progress:', error);
        }
      }
    }, 1000);
  };
  
  // Stop tracking progress
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // Update progress in backend
  const updateProgressInBackend = async (currentTime: number) => {
    if (!enrollment || !token || !courseId) return;
    
    try {
      const currentTopic = enrollment.progress[currentTopicIndex];
      const currentSubtopic = currentTopic.subtopics[currentSubtopicIndex];
      
      await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: currentTopic.topicName,
          subTopicName: currentSubtopic.name,
          watchedDuration: Math.round(currentTime)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const updatedProgress = [...enrollment.progress];
      updatedProgress[currentTopicIndex].subtopics[currentSubtopicIndex].watchedDuration = Math.round(currentTime);
      updatedProgress[currentTopicIndex].topicWatchedDuration = updatedProgress[currentTopicIndex].subtopics
        .reduce((sum, st) => sum + (st.watchedDuration || 0), 0);
      
      setEnrollment({
        ...enrollment,
        progress: updatedProgress,
        totalWatchedDuration: updatedProgress.reduce((sum, topic) => sum + topic.topicWatchedDuration, 0)
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  // Mark current subtopic as complete
  const markCurrentSubtopicAsComplete = async () => {
    if (!enrollment || !token || !courseId || !player) return;
    
    try {
      const duration = await player.getDuration();
      const currentTopic = enrollment.progress[currentTopicIndex];
      const currentSubtopic = currentTopic.subtopics[currentSubtopicIndex];
      
      await axios.post(
        `${API_BASE_URL}/courses/enrollment/update-progress`,
        {
          courseId,
          topicName: currentTopic.topicName,
          subTopicName: currentSubtopic.name,
          watchedDuration: Math.round(duration)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const updatedProgress = [...enrollment.progress];
      updatedProgress[currentTopicIndex].subtopics[currentSubtopicIndex].watchedDuration = Math.round(duration);
      updatedProgress[currentTopicIndex].subtopics[currentSubtopicIndex].completed = true;
      updatedProgress[currentTopicIndex].topicWatchedDuration = updatedProgress[currentTopicIndex].subtopics
        .reduce((sum, st) => sum + (st.watchedDuration || 0), 0);
      
      // Check if topic is completed
      const allSubtopicsCompleted = updatedProgress[currentTopicIndex].subtopics.every(st => 
        (st.watchedDuration || 0) >= st.totalDuration
      );
      
      if (allSubtopicsCompleted) {
        updatedProgress[currentTopicIndex].completed = true;
      }
      
      setEnrollment({
        ...enrollment,
        progress: updatedProgress,
        totalWatchedDuration: updatedProgress.reduce((sum, topic) => sum + topic.topicWatchedDuration, 0)
      });
      
      toast({
        title: "Progress Updated",
        description: "Video marked as completed",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking video as complete:', error);
    }
  };
  
  // Navigate to next subtopic
  const goToNextSubtopic = () => {
    if (!enrollment?.progress) return;
    
    const currentTopic = enrollment.progress[currentTopicIndex];
    
    // Check if there are more subtopics in current topic
    if (currentSubtopicIndex < currentTopic.subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
    }
    // Move to next topic
    else if (currentTopicIndex < enrollment.progress.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
      setCurrentSubtopicIndex(0);
    }
    // Course completed
    else {
      toast({
        title: "Congratulations!",
        description: "You've completed all course content",
        variant: "default",
      });
      setActiveTab('exams');
    }
    
    // Reset video state
    setVideoProgress(0);
    setVideoDuration(0);
    setVideoReady(false);
    if (player) player.stopVideo();
  };
  
  // Navigate to previous subtopic
  const goToPreviousSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
    } else if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
      const prevTopic = enrollment?.progress[currentTopicIndex - 1];
      setCurrentSubtopicIndex(prevTopic?.subtopics.length ? prevTopic.subtopics.length - 1 : 0);
    }
    
    // Reset video state
    setVideoProgress(0);
    setVideoDuration(0);
    setVideoReady(false);
    if (player) player.stopVideo();
  };
  
  // Start topic exam
  const startTopicExam = async (topicName: string) => {
    if (!token || !courseId) return;
    
    try {
      setLoadingExam(true);
      setExamType('topic');
      setCurrentExamTopic(topicName);
      
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/topic/${courseId}/${topicName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        setExam(response.data.exam);
        setExamTimer(response.data.exam.timeLimit * 60); // Convert minutes to seconds
        setExamStarted(true);
        setActiveTab('exam');
        startExamTimer();
        
        toast({
          title: "Exam Started",
          description: `You have ${response.data.exam.timeLimit} minutes to complete`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error starting exam:', error);
      toast({
        title: "Exam Error",
        description: error.response?.data?.message || "Failed to start exam",
        variant: "destructive",
      });
    } finally {
      setLoadingExam(false);
    }
  };
  
  // Start final exam
  const startFinalExam = async () => {
    if (!token || !courseId || !enrollment?.finalExamEligible) return;
    
    try {
      setLoadingExam(true);
      setExamType('final');
      
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/final/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        setExam(response.data.exam);
        setExamTimer(response.data.exam.timeLimit * 60);
        setExamStarted(true);
        setActiveTab('exam');
        startExamTimer();
        
        toast({
          title: "Final Exam Started",
          description: `You have ${response.data.exam.timeLimit} minutes to complete`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error starting final exam:', error);
      toast({
        title: "Exam Error",
        description: error.response?.data?.message || "Failed to start final exam",
        variant: "destructive",
      });
    } finally {
      setLoadingExam(false);
    }
  };
  
  // Start exam timer
  const startExamTimer = () => {
    if (examTimerRef.current) clearInterval(examTimerRef.current);
    
    examTimerRef.current = setInterval(() => {
      setExamTimer(prev => {
        if (prev <= 1) {
          if (examTimerRef.current) clearInterval(examTimerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle exam answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  // Submit exam
  const submitExam = async () => {
    if (!token || !courseId || !exam || submittingExam) return;
    
    try {
      setSubmittingExam(true);
      
      if (examTimerRef.current) {
        clearInterval(examTimerRef.current);
        examTimerRef.current = null;
      }
      
      const endpoint = examType === 'topic' 
        ? `${API_BASE_URL}/courses/exams/topic/validate`
        : `${API_BASE_URL}/courses/exams/validate/final`;
      
      const payload = examType === 'topic'
        ? {
            courseId,
            topicName: currentExamTopic,
            answers: examAnswers
          }
        : {
            courseId,
            answers: examAnswers
          };
      
      const response = await axios.post(
        endpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        setExamResult(response.data.result);
        setShowExamResults(true);
        
        // Refresh enrollment data
        await loadCourseAndEnrollment();
        
        toast({
          title: examResult?.passed ? "Exam Passed!" : "Exam Completed",
          description: `Score: ${response.data.result.score}%`,
          variant: examResult?.passed ? "default" : "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Submission Error",
        description: error.response?.data?.message || "Failed to submit exam",
        variant: "destructive",
      });
    } finally {
      setSubmittingExam(false);
    }
  };
  
  // Generate certificate
  const generateCertificate = async () => {
    if (!token || !courseId || !enrollment?.courseCompleted) return;
    
    try {
      // In a real implementation, you would call a certificate generation API
      const certificate = {
        studentName: user?.name || "Student",
        courseName: course?.courseName || "Course",
        instructorName: course?.instructorName || "Instructor",
        completionDate: enrollment.completedAt || new Date().toISOString(),
        certificateId: `CERT-${course?.courseId || 'COURSE'}-${Date.now()}`,
        score: "100%", // You might want to calculate this from exam results
      };
      
      setCertificateData(certificate);
      setShowCertificateModal(true);
      
      toast({
        title: "Certificate Generated",
        description: "Your course completion certificate is ready",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Certificate Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    }
  };
  
  // Download certificate
  const downloadCertificate = () => {
    if (!certificateData) return;
    
    // In a real implementation, this would generate a PDF or image
    // For now, we'll create a simple HTML certificate that can be printed
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .certificate { border: 20px solid gold; padding: 50px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          .student-name { font-size: 36px; color: #3498db; margin: 20px 0; }
          .course-name { font-size: 24px; color: #2c3e50; margin: 20px 0; }
          .completion-date { margin-top: 30px; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-around; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>CERTIFICATE OF COMPLETION</h1>
          <p>This certifies that</p>
          <div class="student-name">${certificateData.studentName}</div>
          <p>has successfully completed the course</p>
          <div class="course-name">${certificateData.courseName}</div>
          <p>on</p>
          <div class="completion-date">
            ${new Date(certificateData.completionDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div class="signatures">
            <div>
              <p>______________________</p>
              <p>${certificateData.instructorName}</p>
              <p>Instructor</p>
            </div>
            <div>
              <p>______________________</p>
              <p>Triaright Education</p>
              <p>Provider</p>
            </div>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Certificate ID: ${certificateData.certificateId}
          </p>
        </div>
      </body>
      </html>
    `;
    
    const win = window.open();
    win?.document.write(certificateHTML);
    win?.document.close();
    win?.print();
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!enrollment) return 0;
    return enrollment.totalVideoDuration > 0 
      ? Math.round((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100)
      : 0;
  };
  
  // Check if course is completed
  const isCourseCompleted = enrollment?.courseCompleted || false;
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (!course || !enrollment) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription>
            Unable to load course content. Please try again or contact support.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/courses')} className="mt-4">
          <Home className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }
  
  // Current topic and subtopic
  const currentTopic = enrollment.progress[currentTopicIndex];
  const currentSubtopic = currentTopic?.subtopics[currentSubtopicIndex];
  const currentVideo = getCurrentVideo();
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Course Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.courseName}</h1>
            <p className="text-gray-600 mt-2">{course.courseDescription}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="h-3 w-3 mr-1" />
                Instructor: {course.instructorName}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {course.totalDuration} min
              </Badge>
              {isCourseCompleted && (
                <Badge className="bg-green-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
          <Button 
            onClick={() => navigate('/courses')}
            variant="outline"
            className="mt-4 md:mt-0"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Course Progress</span>
            <span>{calculateOverallProgress()}%</span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
          <p className="text-sm text-gray-500">
            {enrollment.totalWatchedDuration} of {enrollment.totalVideoDuration} minutes watched
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Course Content
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificate
          </TabsTrigger>
        </TabsList>
        
        {/* Course Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentTopic?.topicName} - {currentSubtopic?.name}
                  </CardTitle>
                  <CardDescription>
                    Video {currentSubtopicIndex + 1} of {currentTopic?.subtopics.length} in this topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {currentVideo?.videoId ? (
                      <YouTube
                        videoId={currentVideo.videoId}
                        opts={youtubeOpts}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white">
                        <AlertCircle className="h-12 w-12" />
                        <p className="ml-2">Video URL not available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Controls */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={goToPreviousSubtopic}
                        disabled={currentTopicIndex === 0 && currentSubtopicIndex === 0}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={markCurrentSubtopicAsComplete}
                        variant="secondary"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                    <Button
                      onClick={goToNextSubtopic}
                      disabled={
                        currentTopicIndex === enrollment.progress.length - 1 &&
                        currentSubtopicIndex === currentTopic.subtopics.length - 1
                      }
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Course Navigation */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>
                    {enrollment.progress.length} topics, {enrollment.totalVideoDuration} min total
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  <Accordion type="single" collapsible className="w-full">
                    {enrollment.progress.map((topic, topicIdx) => (
                      <AccordionItem key={topic.topicName} value={`topic-${topicIdx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center">
                              {topic.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                              )}
                              <span>{topic.topicName}</span>
                            </div>
                            <Badge variant="outline">
                              {Math.round((topic.topicWatchedDuration / topic.topicTotalDuration) * 100)}%
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-6">
                            {topic.subtopics.map((subtopic, subtopicIdx) => (
                              <Button
                                key={subtopic.name}
                                variant="ghost"
                                className={`w-full justify-start text-left h-auto py-2 ${
                                  topicIdx === currentTopicIndex && subtopicIdx === currentSubtopicIndex
                                    ? 'bg-blue-50 text-blue-600'
                                    : ''
                                }`}
                                onClick={() => {
                                  setCurrentTopicIndex(topicIdx);
                                  setCurrentSubtopicIndex(subtopicIdx);
                                  setActiveTab('content');
                                }}
                              >
                                <div className="flex items-center w-full">
                                  <div className="flex items-center flex-1">
                                    {subtopic.completed || (subtopic.watchedDuration || 0) >= subtopic.totalDuration ? (
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    ) : (
                                      <PlayCircle className="h-4 w-4 text-gray-400 mr-2" />
                                    )}
                                    <span className="truncate">{subtopic.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {subtopic.duration} min
                                  </span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                Detailed breakdown of all topics and subtopics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {enrollment.progress.map((topic, topicIdx) => (
                  <div key={topic.topicName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        {topic.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-2" />
                        )}
                        Topic {topicIdx + 1}: {topic.topicName}
                      </h3>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {topic.topicWatchedDuration} / {topic.topicTotalDuration} min
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentTopicIndex(topicIdx);
                            setCurrentSubtopicIndex(0);
                            setActiveTab('content');
                          }}
                        >
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-7">
                      {topic.subtopics.map((subtopic, subtopicIdx) => (
                        <div
                          key={subtopic.name}
                          className={`flex items-center justify-between p-3 rounded ${
                            subtopic.completed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            {subtopic.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                            ) : (
                              <PlayCircle className="h-4 w-4 text-gray-400 mr-3" />
                            )}
                            <div>
                              <p className="font-medium">{subtopic.name}</p>
                              <p className="text-sm text-gray-500">
                                YouTube Video • {subtopic.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              Watched: {subtopic.watchedDuration || 0}/{subtopic.duration} min
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setCurrentTopicIndex(topicIdx);
                                setCurrentSubtopicIndex(subtopicIdx);
                                setActiveTab('content');
                              }}
                            >
                              {subtopicIdx === currentSubtopicIndex && topicIdx === currentTopicIndex
                                ? 'Currently Playing'
                                : 'Watch'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Exam Status for Topic */}
                    <div className="mt-4 ml-7">
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Topic Exam</h4>
                          <p className="text-sm text-gray-500">
                            {topic.examAttempted
                              ? `Score: ${topic.examScore}% - ${topic.passed ? 'Passed' : 'Failed'}`
                              : 'Available after completing all videos'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startTopicExam(topic.topicName)}
                          disabled={!topic.completed || topic.examAttempted}
                        >
                          {topic.examAttempted ? 'Already Attempted' : 'Take Exam'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Exams Tab */}
        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Course Exams</CardTitle>
              <CardDescription>
                Complete exams to earn your certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Topic Exams */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Topic Exams</h3>
                {enrollment.progress.map((topic) => (
                  <Card key={topic.topicName}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {topic.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : topic.examAttempted ? (
                            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3" />
                          )}
                          <div>
                            <h4 className="font-medium">{topic.topicName}</h4>
                            <p className="text-sm text-gray-500">
                              {topic.examAttempted
                                ? `Score: ${topic.examScore}% - ${topic.passed ? 'Passed' : 'Failed'}`
                                : topic.completed
                                ? 'Ready to attempt'
                                : 'Complete videos first'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => startTopicExam(topic.topicName)}
                          disabled={!topic.completed || (topic.examAttempted && topic.passed)}
                          variant={topic.passed ? "outline" : "default"}
                        >
                          {topic.passed ? 'Passed' : topic.examAttempted ? 'Retake' : 'Start Exam'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Final Exam */}
                <Separator className="my-8" />
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        Final Exam
                      </h3>
                      <p className="text-gray-600 mt-2">
                        Complete all topic exams to unlock the final exam. You have 3 attempts.
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant={enrollment.finalExamEligible ? "default" : "outline"}>
                          {enrollment.finalExamEligible ? 'Eligible' : 'Not Eligible'}
                        </Badge>
                        <Badge variant={enrollment.finalExamAttempted ? "default" : "outline"}>
                          {enrollment.finalExamAttempted ? 'Attempted' : 'Not Attempted'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={startFinalExam}
                      disabled={!enrollment.finalExamEligible || loadingExam}
                      size="lg"
                      className="mt-4 md:mt-0"
                    >
                      {loadingExam ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Award className="h-4 w-4 mr-2" />
                      )}
                      Start Final Exam
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Certificate Tab */}
        <TabsContent value="certificate">
          <Card>
            <CardHeader>
              <CardTitle>Course Certificate</CardTitle>
              <CardDescription>
                Download your certificate upon successful course completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCourseCompleted ? (
                <div className="text-center py-8">
                  <Award className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You have successfully completed "{course.courseName}". You can now download your certificate of completion.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={generateCertificate}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Generate Certificate
                    </Button>
                    <Button
                      onClick={() => navigate('/courses')}
                      variant="outline"
                      size="lg"
                    >
                      Browse More Courses
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Certificate Not Available</h3>
                  <p className="text-gray-600 mb-4">
                    Complete all course content and exams to unlock your certificate.
                  </p>
                  <div className="space-y-2 max-w-md mx-auto">
                    <div className="flex items-center justify-between">
                      <span>Course Content</span>
                      <Badge variant={calculateOverallProgress() === 100 ? "default" : "outline"}>
                        {calculateOverallProgress()}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Topic Exams</span>
                      <Badge variant={enrollment.progress.every(t => t.passed) ? "default" : "outline"}>
                        {enrollment.progress.filter(t => t.passed).length}/{enrollment.progress.length} Passed
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Final Exam</span>
                      <Badge variant={enrollment.finalExamAttempted && enrollment.courseCompleted ? "default" : "outline"}>
                        {enrollment.courseCompleted ? 'Passed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('content')}
                    className="mt-6"
                  >
                    Continue Learning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Exam Modal */}
      {examStarted && exam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {examType === 'topic' ? 'Topic Exam' : 'Final Exam'}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg">
                    Time: {formatTime(examTimer)}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={submitExam}
                    disabled={submittingExam}
                  >
                    {submittingExam ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Submit Exam'
                    )}
                  </Button>
                </div>
              </div>
              <CardDescription className="text-white/80">
                {exam.totalQuestions} questions • Passing: {exam.passingScore}% • Time Limit: {exam.timeLimit} minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto p-6">
              {!showExamResults ? (
                <div className="space-y-8">
                  {exam.questions.map((question, index) => (
                    <div key={question._id} className="border-b pb-6 last:border-0">
                      <h4 className="font-semibold mb-4 flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3">
                          {index + 1}
                        </span>
                        {question.questionText}
                      </h4>
                      {question.description && (
                        <p className="text-gray-600 text-sm mb-4 ml-9">{question.description}</p>
                      )}
                      <RadioGroup
                        value={examAnswers[question._id] || ''}
                        onValueChange={(value) => handleAnswerSelect(question._id, value)}
                        className="space-y-3 ml-9"
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-3">
                            <RadioGroupItem value={option} id={`${question._id}-${optIndex}`} />
                            <Label
                              htmlFor={`${question._id}-${optIndex}`}
                              className="cursor-pointer flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`inline-flex h-20 w-20 rounded-full items-center justify-center ${
                    examResult?.passed ? 'bg-green-100' : 'bg-red-100'
                  } mb-6`}>
                    {examResult?.passed ? (
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    ) : (
                      <AlertCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {examResult?.passed ? 'Exam Passed!' : 'Exam Not Passed'}
                  </h3>
                  <p className="text-4xl font-bold mb-2">{examResult?.score}%</p>
                  <p className="text-gray-600 mb-6">
                    {examResult?.correctAnswers} out of {examResult?.totalQuestions} questions correct
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => {
                      setExamStarted(false);
                      setShowExamResults(false);
                      setActiveTab('exams');
                    }}>
                      Return to Exams
                    </Button>
                    {!examResult?.passed && examResult?.remainingAttempts > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowExamResults(false);
                          setExamAnswers({});
                          setExamTimer(exam.timeLimit * 60);
                          startExamTimer();
                        }}
                      >
                        Try Again ({examResult.remainingAttempts} attempts left)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Certificate Modal */}
      {showCertificateModal && certificateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Certificate of Completion</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCertificateModal(false)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-8 border-yellow-500 p-8 text-center rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  CERTIFICATE OF COMPLETION
                </h1>
                <p className="text-gray-600 mb-8">This certifies that</p>
                <h2 className="text-4xl font-bold text-blue-600 mb-8">
                  {certificateData.studentName}
                </h2>
                <p className="text-gray-600 mb-8">has successfully completed the course</p>
                <h3 className="text-2xl font-semibold text-gray-800 mb-8">
                  "{certificateData.courseName}"
                </h3>
                <p className="text-gray-600 mb-2">on</p>
                <p className="text-lg font-medium mb-12">
                  {new Date(certificateData.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <div className="flex justify-around mt-12">
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="font-medium">{certificateData.instructorName}</p>
                    <p className="text-sm text-gray-500">Instructor</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="font-medium">Triaright Education</p>
                    <p className="text-sm text-gray-500">Provider</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-8">
                  Certificate ID: {certificateData.certificateId}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
                Close
              </Button>
              <Button onClick={downloadCertificate}>
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseLearningInterface;
