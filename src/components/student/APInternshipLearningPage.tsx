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
  ArrowLeft
} from 'lucide-react';

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

interface APEnrollment {
  _id: string;
  internshipId: string;
  courseId: {
    _id: string;
    title: string;
    curriculum: Topic[];
    totalDuration: number;
  };
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  progress: {
    topicName: string;
    subtopics: {
      subTopicName: string;
      subTopicLink: string;
      watchedDuration: number;
      totalDuration: number;
    }[];
    topicWatchedDuration: number;
    topicTotalDuration: number;
    examAttempted: boolean;
    examScore: number;
    passed: boolean;
  }[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  lastAccessed?: string;
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

const APInternshipLearningPage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<APEnrollment | null>(null);
  const [course, setCourse] = useState<APCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [examStatus, setExamStatus] = useState<ExamStatus | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentData();
      fetchExamStatus();
    }
  }, [enrollmentId]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const fetchEnrollmentData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const currentEnrollment = data.enrollments.find((e: any) => e._id === enrollmentId);
        if (currentEnrollment) {
          setEnrollment(currentEnrollment);
          
          // Set first topic and subtopic as active if none selected
          if (currentEnrollment.courseId?.curriculum?.length > 0) {
            const firstTopic = currentEnrollment.courseId.curriculum[0];
            const firstSubtopic = firstTopic.subtopics[0];
            
            if (!activeTopic) {
              setActiveTopic(firstTopic.topicName);
            }
            if (!activeSubtopic) {
              setActiveSubtopic(firstSubtopic);
            }
          }
        } else {
          toast({
            title: 'Error',
            description: 'Enrollment not found',
            variant: 'destructive'
          });
          navigate('/student-dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStatus = async () => {
    if (!enrollmentId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/exams/status/${enrollmentId}`, {
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
    if (!enrollmentId || !activeSubtopic || !activeTopic) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/api/internships/apinternshipenrollment-progress', {
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

      // Refresh enrollment data to get updated progress
      fetchEnrollmentData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && activeSubtopic) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || activeSubtopic.duration;
      const progress = (currentTime / duration) * 100;
      
      setCurrentTime(currentTime);
      setVideoProgress(progress);

      // Update progress every 10 seconds or when significant progress is made
      if (Math.floor(currentTime) % 10 === 0) {
        updateProgress(currentTime);
      }
    }
  };

  const handleVideoEnd = () => {
    if (activeSubtopic) {
      // Mark as fully watched
      updateProgress(activeSubtopic.duration);
      setIsPlaying(false);
    }
  };

  const handleSubtopicSelect = (topicName: string, subtopic: Subtopic) => {
    setActiveTopic(topicName);
    setActiveSubtopic(subtopic);
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);

    // Find existing progress for this subtopic
    const topicProgress = enrollment?.progress.find(t => t.topicName === topicName);
    const subtopicProgress = topicProgress?.subtopics.find(s => s.subTopicName === subtopic.name);
    
    if (subtopicProgress && videoRef.current) {
      setVideoProgress((subtopicProgress.watchedDuration / subtopicProgress.totalDuration) * 100);
    }
  };

  const getTopicProgress = (topicName: string) => {
    const topic = enrollment?.progress.find(t => t.topicName === topicName);
    return topic ? (topic.topicWatchedDuration / topic.topicTotalDuration) * 100 : 0;
  };

  const getSubtopicProgress = (topicName: string, subtopicName: string) => {
    const topic = enrollment?.progress.find(t => t.topicName === topicName);
    const subtopic = topic?.subtopics.find(s => s.subTopicName === subtopicName);
    return subtopic ? (subtopic.watchedDuration / subtopic.totalDuration) * 100 : 0;
  };

  const isSubtopicCompleted = (topicName: string, subtopicName: string) => {
    const progress = getSubtopicProgress(topicName, subtopicName);
    return progress >= 95; // Consider completed if 95% or more watched
  };

  const handleTakeExam = (topicName: string) => {
    if (!enrollment) return;

    // Check if topic content is completed
    const topicProgress = getTopicProgress(topicName);
    if (topicProgress < 100) {
      toast({
        title: 'Complete Topic First',
        description: 'Please complete all videos in this topic before taking the exam',
        variant: 'destructive'
      });
      return;
    }

    // Navigate to exam page
    window.open(`/ap-internship-exam/${enrollment.courseId._id}/${topicName}?enrollmentId=${enrollmentId}`, '_blank');
  };

  const handleTakeFinalExam = () => {
    if (!enrollment || !examStatus?.courseProgress.finalExamEligible) return;

    window.open(`/ap-internship-final-exam/${enrollment.courseId._id}?enrollmentId=${enrollmentId}`, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="text-center text-gray-600">Loading your course...</div>
        </div>
      </div>
    );
  }

  if (!enrollment || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Course Not Found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                The requested course could not be found or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/student-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallProgress = enrollment.totalVideoDuration > 0 
    ? (enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100 
    : 0;

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
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {enrollment.courseId?.title}
                </h1>
                <p className="text-gray-600">
                  {enrollment.courseId?.internshipRef?.companyName} • {enrollment.courseId?.stream}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Overall Progress: {overallProgress.toFixed(1)}%
                </div>
                <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                  {enrollment.status}
                </Badge>
              </div>
              <Progress value={overallProgress} className="w-48 mt-2" />
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
                  {enrollment.courseId?.curriculum?.length || 0} topics • {Math.ceil(enrollment.totalVideoDuration / 60)} min total
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {enrollment.courseId?.curriculum?.map((topic, topicIndex) => {
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
                                    ) : (
                                      <Video className="h-4 w-4 text-gray-400 mt-0.5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${
                                      isActive ? 'text-blue-700' : 'text-gray-900'
                                    }`}>
                                      {subtopic.name}
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
                      {examStatus?.topicExams.passedCount || 0} / {enrollment.courseId?.curriculum?.length || 0}
                    </span>
                  </div>
                  <Progress 
                    value={
                      enrollment.courseId?.curriculum?.length 
                        ? ((examStatus?.topicExams.passedCount || 0) / enrollment.courseId.curriculum.length) * 100 
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
                    </CardDescription>
                  </div>
                  {activeSubtopic && (
                    <Badge variant={videoProgress >= 95 ? "default" : "secondary"}>
                      {videoProgress >= 95 ? 'Completed' : `${videoProgress.toFixed(0)}% Watched`}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Video Player */}
                {activeSubtopic ? (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-auto max-h-[480px]"
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnd}
                      src={activeSubtopic.link}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a lesson from the curriculum to start learning</p>
                    </div>
                  </div>
                )}

                {/* Video Controls */}
                {activeSubtopic && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVideoPlay}
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

                {/* Navigation between lessons */}
                {activeSubtopic && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous Lesson
                    </Button>
                    <Button variant="outline" size="sm">
                      Next Lesson
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
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
                        {enrollment.totalWatchedDuration / 60}min / {enrollment.totalVideoDuration / 60}min
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
                      {examStatus?.topicExams.passedCount || 0} of {enrollment.courseId?.curriculum?.length || 0} passed
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

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Bookmark className="h-5 w-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold">Certificate</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Download your completion certificate
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!examStatus?.courseProgress.courseCompleted}
                      onClick={() => window.open(`/ap-internship-certificate/${enrollmentId}`, '_blank')}
                    >
                      Download Certificate
                    </Button>
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
