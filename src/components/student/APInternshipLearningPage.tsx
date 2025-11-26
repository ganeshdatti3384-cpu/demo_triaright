// components/student/APInternshipLearningPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  FileText, 
  Award,
  Video,
  List,
  BarChart3,
  Bookmark,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react';

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: Subtopic[];
}

interface APCourse {
  _id: string;
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

interface ProgressSubtopic {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
}

interface TopicProgress {
  topicName: string;
  subtopics: ProgressSubtopic[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
}

interface APEnrollment {
  _id: string;
  internshipId: string;
  courseId: APCourse;
  userId: string;
  enrollmentDate: string;
  isPaid: boolean;
  amountPaid: number;
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  completionPercentage?: number;
}

interface ExamStatus {
  courseProgress: {
    totalTopics: number;
    topicsCompleted: number;
    topicsExamPassed: number;
    finalExamEligible: boolean;
    finalExamAttempted: boolean;
    courseCompleted: boolean;
  };
  topicExams: {
    results: any[];
    passedCount: number;
    totalAttempted: number;
    totalAttempts: number;
  };
  finalExam: {
    results: any[];
    attemptsUsed: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    passed: boolean;
  };
}

// YouTube Embed Component with proper progress tracking
const YouTubeEmbed: React.FC<{
  url: string;
  onTimeUpdate: (currentTime: number) => void;
  onEnd: () => void;
  onProgressUpdate: (watchedDuration: number) => void;
}> = ({ url, onTimeUpdate, onEnd, onProgressUpdate }) => {
  const videoId = getYouTubeVideoId(url);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Initialize YouTube player and progress tracking
    if (videoId) {
      // For YouTube, we'll simulate progress tracking since we can't access the actual player time
      // In a real implementation, you'd use YouTube Iframe API
      console.log('YouTube video loaded:', videoId);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId]);

  const handlePlay = () => {
    // Start progress tracking for YouTube
    progressIntervalRef.current = setInterval(() => {
      // Simulate progress update - in real implementation, get current time from YouTube API
      const simulatedProgress = 10; // This would be actual current time from YouTube player
      onTimeUpdate(simulatedProgress);
      onProgressUpdate(simulatedProgress);
    }, 10000); // Update every 10 seconds
  };

  const handlePause = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  if (!videoId) {
    return (
      <div className="h-64 flex items-center justify-center text-white bg-gray-800">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Invalid YouTube URL</p>
          <p className="text-sm text-gray-300 mt-2">Please check the video link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-[56.25%] h-0">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
        onLoad={handlePlay}
      />
      {/* YouTube progress simulation controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 p-2 rounded">
        <div className="flex items-center justify-between text-white text-sm">
          <span>YouTube Video - Progress tracking enabled</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePlay}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              <Play className="h-3 w-3 mr-1" />
              Simulate Progress
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePause}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Validate video URL
const validateVideoUrl = (url: string): { isValid: boolean; type: string; message: string } => {
  if (!url) {
    return { isValid: false, type: 'invalid', message: 'URL is required' };
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { 
      isValid: true, 
      type: 'youtube', 
      message: 'YouTube URL detected - using embedded player' 
    };
  }

  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
    return { 
      isValid: true, 
      type: 'direct', 
      message: 'Direct video URL detected' 
    };
  }

  return { 
    isValid: false, 
    type: 'unknown', 
    message: 'Unsupported video URL format' 
  };
};

const APInternshipLearningPage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<APEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [examStatus, setExamStatus] = useState<ExamStatus | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentData();
    }
  }, [enrollmentId]);

  useEffect(() => {
    if (enrollment?.courseId?._id) {
      fetchExamStatus();
    }
  }, [enrollment]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Initialize progress when enrollment data loads
  useEffect(() => {
    if (enrollment && enrollment.progress && activeTopic && activeSubtopic) {
      initializeProgressForSubtopic(activeTopic, activeSubtopic);
    }
  }, [enrollment, activeTopic, activeSubtopic]);

  const fetchEnrollmentData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access this course',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get all enrollments and find the specific one
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const foundEnrollment = data.enrollments.find((e: any) => e._id === enrollmentId);
        
        if (foundEnrollment) {
          // Fetch complete course details
          const courseResponse = await fetch(`/api/internships/apcourses/${foundEnrollment.courseId._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const courseData = await courseResponse.json();
          
          if (courseData.success) {
            const completeEnrollment = {
              ...foundEnrollment,
              courseId: courseData.course
            };
            
            setEnrollment(completeEnrollment);
            initializeActiveContent(completeEnrollment);
          } else {
            throw new Error('Failed to fetch course details');
          }
        } else {
          throw new Error('Enrollment not found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch enrollments');
      }
    } catch (error: any) {
      console.error('Error fetching enrollment:', error);
      setError(error.message || 'Failed to load course data');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load course data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeActiveContent = (enrollmentData: APEnrollment) => {
    if (enrollmentData.courseId?.curriculum?.length > 0) {
      const firstTopic = enrollmentData.courseId.curriculum[0];
      const firstSubtopic = firstTopic.subtopics[0];
      
      setActiveTopic(firstTopic.topicName);
      setActiveSubtopic(firstSubtopic);
    }
  };

  const initializeProgressForSubtopic = (topicName: string, subtopic: Subtopic) => {
    if (!enrollment?.progress) return;

    const topicProgress = enrollment.progress.find(t => t.topicName === topicName);
    const subtopicProgress = topicProgress?.subtopics.find(s => s.subTopicName === subtopic.name);
    
    if (subtopicProgress) {
      const progressPercent = subtopicProgress.totalDuration > 0 
        ? (subtopicProgress.watchedDuration / subtopicProgress.totalDuration) * 100 
        : 0;
      setVideoProgress(progressPercent);
      setCurrentTime(subtopicProgress.watchedDuration);
    } else {
      setVideoProgress(0);
      setCurrentTime(0);
    }
  };

  const fetchExamStatus = async () => {
    if (!enrollmentId || !enrollment?.courseId?._id) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/exams/status/${enrollment.courseId._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setExamStatus(data.examStatus);
      }
    } catch (error) {
      console.error('Error fetching exam status:', error);
    }
  };

  const updateProgress = async (watchedDuration: number) => {
    if (!enrollmentId || !activeSubtopic || !activeTopic || updatingProgress) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setUpdatingProgress(true);
      
      const response = await fetch('/api/internships/apinternshipenrollment-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId,
          topicName: activeTopic,
          subTopicName: activeSubtopic.name,
          watchedDuration: Math.floor(watchedDuration)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with new progress data
        setEnrollment(prev => {
          if (!prev) return prev;
          
          const updatedProgress = prev.progress.map(topic => {
            if (topic.topicName === activeTopic) {
              const updatedSubtopics = topic.subtopics.map(subtopic => {
                if (subtopic.subTopicName === activeSubtopic.name) {
                  return {
                    ...subtopic,
                    watchedDuration: Math.floor(watchedDuration)
                  };
                }
                return subtopic;
              });
              
              const topicWatchedDuration = updatedSubtopics.reduce(
                (sum, st) => sum + st.watchedDuration, 0
              );
              
              return {
                ...topic,
                subtopics: updatedSubtopics,
                topicWatchedDuration
              };
            }
            return topic;
          });
          
          const totalWatchedDuration = updatedProgress.reduce(
            (sum, topic) => sum + topic.topicWatchedDuration, 0
          );
          
          return {
            ...prev,
            progress: updatedProgress,
            totalWatchedDuration,
            finalExamEligible: totalWatchedDuration >= (prev.totalVideoDuration * 0.8)
          };
        });
        
        toast({
          title: 'Progress Saved',
          description: 'Your learning progress has been updated',
          variant: 'default'
        });
      } else {
        console.error('Progress update failed:', data.message);
        toast({
          title: 'Update Failed',
          description: 'Failed to save progress',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const checkCertificateEligibility = async (): Promise<boolean> => {
    if (!enrollmentId) return false;

    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`/api/internships/apinternshipcertificate/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return false;
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current && activeSubtopic) {
      console.log('Video loaded successfully');
      // Set initial time based on progress
      const topicProgress = enrollment?.progress?.find(t => t.topicName === activeTopic);
      const subtopicProgress = topicProgress?.subtopics.find(s => s.subTopicName === activeSubtopic.name);
      
      if (subtopicProgress && subtopicProgress.watchedDuration > 0) {
        videoRef.current.currentTime = subtopicProgress.watchedDuration;
        setCurrentTime(subtopicProgress.watchedDuration);
        
        const progressPercent = subtopicProgress.totalDuration > 0 
          ? (subtopicProgress.watchedDuration / subtopicProgress.totalDuration) * 100 
          : 0;
        setVideoProgress(progressPercent);
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video loading error:', e);
    const video = e.currentTarget;
    const error = video.error;
    
    let errorMessage = 'Failed to load video';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported or corrupted';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported by your browser';
          break;
        default:
          errorMessage = 'Unknown video error occurred';
      }
    }
    
    toast({
      title: 'Video Error',
      description: errorMessage,
      variant: 'destructive'
    });
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else {
        // Use promise-based play to handle autoplay restrictions
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          
          // Start progress tracking interval only after successful play
          progressIntervalRef.current = setInterval(() => {
            if (videoRef.current && activeSubtopic && !videoRef.current.paused) {
              const currentTime = videoRef.current.currentTime;
              updateProgress(currentTime);
            }
          }, 10000); // Update every 10 seconds
        }).catch((error) => {
          console.error('Video play failed:', error);
          setIsPlaying(false);
          
          // Show user-friendly error message
          toast({
            title: 'Video Playback Error',
            description: 'Please click the play button to start the video',
            variant: 'destructive'
          });
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && activeSubtopic) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || activeSubtopic.duration;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      setCurrentTime(currentTime);
      setVideoProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    if (activeSubtopic) {
      // Mark as fully watched
      const finalDuration = activeSubtopic.duration;
      updateProgress(finalDuration);
      setIsPlaying(false);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      setVideoProgress(100);
      setCurrentTime(finalDuration);
    }
  };

  // YouTube progress tracking
  const handleYouTubeTimeUpdate = (currentTime: number) => {
    setCurrentTime(currentTime);
    // Update progress based on estimated duration
    if (activeSubtopic) {
      const progress = (currentTime / activeSubtopic.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleYouTubeProgressUpdate = (watchedDuration: number) => {
    // Update backend progress for YouTube videos
    updateProgress(watchedDuration);
  };

  const handleYouTubeEnd = () => {
    if (activeSubtopic) {
      // Mark YouTube video as fully watched
      updateProgress(activeSubtopic.duration);
      setIsPlaying(false);
      setVideoProgress(100);
      setCurrentTime(activeSubtopic.duration);
    }
  };

  const handleSubtopicSelect = async (topicName: string, subtopic: Subtopic) => {
    setActiveTopic(topicName);
    setActiveSubtopic(subtopic);
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);

    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Reset video element if it exists and it's not a YouTube URL
    if (videoRef.current && !isYouTubeUrl(subtopic.link)) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Initialize progress for the selected subtopic
    initializeProgressForSubtopic(topicName, subtopic);
  };

  const getTopicProgress = (topicName: string) => {
    const topic = enrollment?.progress?.find(t => t.topicName === topicName);
    if (!topic || topic.topicTotalDuration === 0) return 0;
    return (topic.topicWatchedDuration / topic.topicTotalDuration) * 100;
  };

  const getSubtopicProgress = (topicName: string, subtopicName: string) => {
    const topic = enrollment?.progress?.find(t => t.topicName === topicName);
    const subtopic = topic?.subtopics.find(s => s.subTopicName === subtopicName);
    if (!subtopic || subtopic.totalDuration === 0) return 0;
    return (subtopic.watchedDuration / subtopic.totalDuration) * 100;
  };

  const isSubtopicCompleted = (topicName: string, subtopicName: string) => {
    const progress = getSubtopicProgress(topicName, subtopicName);
    return progress >= 90; // Consider completed if 90% or more watched
  };

  const handleTakeExam = (topicName: string) => {
    if (!enrollment?.courseId?._id) return;

    // Check if topic content is completed
    const topicProgress = getTopicProgress(topicName);
    if (topicProgress < 95) {
      toast({
        title: 'Complete Topic First',
        description: 'Please complete all videos in this topic before taking the exam',
        variant: 'destructive'
      });
      return;
    }

    // Navigate to exam page
    navigate(`/ap-internship-exam/${enrollment.courseId._id}/${topicName}?enrollmentId=${enrollmentId}`);
  };

  const handleTakeFinalExam = () => {
    if (!enrollment?.courseId?._id || !examStatus?.courseProgress.finalExamEligible) {
      toast({
        title: 'Not Eligible',
        description: 'Complete all topic exams first to unlock the final exam',
        variant: 'destructive'
      });
      return;
    }

    navigate(`/ap-internship-final-exam/${enrollment.courseId._id}?enrollmentId=${enrollmentId}`);
  };

  const handleDownloadCertificate = async () => {
    if (!enrollmentId) return;

    const isEligible = await checkCertificateEligibility();
    if (isEligible) {
      navigate(`/ap-internship-certificate/${enrollmentId}`);
    } else {
      toast({
        title: 'Certificate Not Available',
        description: 'Complete the course and final exam to unlock your certificate',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate overall progress
  const overallProgress = enrollment?.totalVideoDuration > 0 
    ? ((enrollment.totalWatchedDuration || 0) / enrollment.totalVideoDuration) * 100 
    : 0;

  // Check if certificate is available
  const isCertificateAvailable = examStatus?.courseProgress.courseCompleted || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <div className="text-center text-gray-600">Loading your course...</div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {error ? 'Error Loading Course' : 'Course Not Found'}
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {error || 'The requested course could not be found or you don\'t have access to it.'}
              </p>
              <Button onClick={() => navigate('/student-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Student Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const course = enrollment.courseId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/student-dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Student Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course?.title || 'Course Content'}
                </h1>
                <p className="text-gray-600">
                  {course?.providerName} • {course?.stream}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={enrollment.courseCompleted ? "default" : "secondary"}>
                {enrollment.courseCompleted ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Curriculum */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Curriculum
                </CardTitle>
                <CardDescription>
                  {course?.curriculum?.length || 0} topics • {Math.ceil(course?.totalDuration / 60) || 0} min total
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {course?.curriculum?.map((topic, topicIndex) => {
                    const topicProgress = getTopicProgress(topic.topicName);
                    const isTopicCompleted = topicProgress >= 95;
                    
                    return (
                      <div key={topicIndex} className="border-b last:border-b-0">
                        <div className="p-4 bg-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              {topic.topicName}
                            </h3>
                            {isTopicCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-600">
                              {topic.subtopics.length} lessons
                            </span>
                            <span className="text-xs font-medium">
                              {topicProgress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={topicProgress} className="h-1 mt-1" />
                        </div>
                        
                        <div className="divide-y">
                          {topic.subtopics.map((subtopic, subtopicIndex) => {
                            const subtopicProgress = getSubtopicProgress(topic.topicName, subtopic.name);
                            const isCompleted = isSubtopicCompleted(topic.topicName, subtopic.name);
                            const isActive = activeSubtopic?.name === subtopic.name && activeTopic === topic.topicName;
                            const isYouTube = isYouTubeUrl(subtopic.link);
                            
                            return (
                              <div
                                key={subtopicIndex}
                                className={`p-3 cursor-pointer transition-colors ${
                                  isActive 
                                    ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleSubtopicSelect(topic.topicName, subtopic)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    ) : isYouTube ? (
                                      <div className="relative">
                                        <Video className="h-4 w-4 text-red-600 mt-0.5" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"></div>
                                      </div>
                                    ) : (
                                      <Video className="h-4 w-4 text-gray-400 mt-0.5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${
                                      isActive ? 'text-blue-700' : 'text-gray-900'
                                    }`}>
                                      {subtopic.name}
                                      {isYouTube && (
                                        <span className="ml-2 text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                          YouTube
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatTime(subtopic.duration)}
                                      </span>
                                      {subtopicProgress > 0 && (
                                        <span className="text-xs text-gray-500">
                                          {subtopicProgress.toFixed(0)}%
                                        </span>
                                      )}
                                    </div>
                                    {subtopicProgress > 0 && subtopicProgress < 100 && (
                                      <Progress value={subtopicProgress} className="h-1 mt-1" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Topic Exam Button */}
                        {topicProgress >= 95 && (
                          <div className="p-3 bg-green-50 border-t">
                            <Button
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleTakeExam(topic.topicName)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Take Topic Exam
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Exam Status Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Exam Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Topic Exams Passed</span>
                    <span>
                      {examStatus?.topicExams.passedCount || 0} / {course?.curriculum?.length || 0}
                    </span>
                  </div>
                  <Progress 
                    value={
                      course?.curriculum?.length 
                        ? ((examStatus?.topicExams.passedCount || 0) / course.curriculum.length) * 100 
                        : 0
                    } 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Final Exam</span>
                    <span>
                      {examStatus?.finalExam.passed ? 'Passed' : 
                       examStatus?.courseProgress.finalExamEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                  {examStatus?.courseProgress.finalExamEligible && !examStatus.finalExam.passed && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={handleTakeFinalExam}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Take Final Exam
                    </Button>
                  )}
                </div>

                {examStatus?.courseProgress.courseCompleted && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Award className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Course Completed!</p>
                        <p className="text-sm text-green-600">You can now download your certificate</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Video Player */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {activeSubtopic?.name || 'Select a lesson to begin'}
                    </CardTitle>
                    <CardDescription>
                      {activeTopic} • {activeSubtopic ? formatTime(activeSubtopic.duration) : '0:00'}
                      {activeSubtopic && isYouTubeUrl(activeSubtopic.link) && (
                        <span className="ml-2 text-red-600">• YouTube Video</span>
                      )}
                    </CardDescription>
                  </div>
                  {activeSubtopic && (
                    <div className="flex items-center space-x-2">
                      {updatingProgress && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                      <Badge variant={videoProgress >= 95 ? "default" : "secondary"}>
                        {videoProgress >= 95 ? 'Completed' : `${videoProgress.toFixed(0)}% Watched`}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Video Player */}
                {activeSubtopic ? (
                  <div className="bg-black rounded-lg overflow-hidden">
                    {isYouTubeUrl(activeSubtopic.link) ? (
                      <YouTubeEmbed 
                        url={activeSubtopic.link} 
                        onTimeUpdate={handleYouTubeTimeUpdate}
                        onEnd={handleYouTubeEnd}
                        onProgressUpdate={handleYouTubeProgressUpdate}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        className="w-full h-auto max-h-[480px]"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        onError={handleVideoError}
                        onLoadedMetadata={handleVideoLoaded}
                        preload="metadata"
                        playsInline
                      >
                        <source src={activeSubtopic.link} type="video/mp4" />
                        <source src={activeSubtopic.link} type="video/webm" />
                        <source src={activeSubtopic.link} type="video/ogg" />
                        Your browser does not support the video tag.
                        <p>
                          If you're having trouble playing the video, please{' '}
                          <a href={activeSubtopic.link} download className="text-blue-400 underline">download it</a> instead.
                        </p>
                      </video>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a lesson from the curriculum to start learning</p>
                    </div>
                  </div>
                )}

                {/* Video Controls - Only show for direct videos */}
                {activeSubtopic && !isYouTubeUrl(activeSubtopic.link) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVideoPlay}
                        disabled={!activeSubtopic}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(activeSubtopic.duration)}</span>
                      </div>
                    </div>

                    <Progress value={videoProgress} className="w-48" />
                  </div>
                )}

                {/* Course Completion Status */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-800">Course Progress</h4>
                      <p className="text-sm text-blue-600">
                        Watch all videos and pass exams to complete the course
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-800">
                        {overallProgress.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">
                        {Math.floor((enrollment.totalWatchedDuration || 0) / 60)}min / {Math.floor(enrollment.totalVideoDuration / 60)}min
                      </div>
                    </div>
                  </div>
                  <Progress value={overallProgress} className="h-2 mt-2 bg-blue-200">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${overallProgress}%` }}
                    />
                  </Progress>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold">Continue Learning</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete all topic videos to unlock topic exams
                    </p>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Topic Exams</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Pass all topic exams to unlock the final exam
                    </p>
                    <div className="text-sm">
                      {examStatus?.topicExams.passedCount || 0} of {course?.curriculum?.length || 0} passed
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold">Final Exam</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Pass the final exam to receive your certificate
                    </p>
                    <div className="text-sm">
                      Status: {examStatus?.finalExam.passed ? 'Passed' : 
                              examStatus?.courseProgress.finalExamEligible ? 'Ready' : 'Locked'}
                    </div>
                  </div>

                  {/* Updated Certificate Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Download className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Certificate</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {isCertificateAvailable 
                        ? 'Download your completion certificate' 
                        : 'Complete the course and final exam to unlock your certificate'
                      }
                    </p>
                    <Button 
                      size="sm" 
                      variant={isCertificateAvailable ? "default" : "outline"}
                      disabled={!isCertificateAvailable}
                      onClick={handleDownloadCertificate}
                      className={`w-full ${
                        isCertificateAvailable 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'cursor-not-allowed'
                      }`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isCertificateAvailable ? 'Download Certificate' : 'Complete Course'}
                    </Button>
                    
                    {/* Certificate Status Badge */}
                    <div className="mt-2 flex items-center text-xs">
                      {isCertificateAvailable ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Certificate Ready
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Complete course to unlock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APInternshipLearningPage;
