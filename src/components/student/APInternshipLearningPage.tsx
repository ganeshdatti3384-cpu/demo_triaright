/* Updated APInternshipLearningPage.tsx
   - Fixed curriculum/video not showing by using enrollment.progress as fallback source of curriculum
   - Normalized subtopic objects so UI always has { name, link, duration }
   - Robust checks and defensive code for missing data
   - Simplified some video play/pause handling and ensured progress update uses the normalized durations
*/
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
  AlertCircle
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
  internshipRef?: {
    _id: string;
    title: string;
    companyName: string;
  };
  curriculum?: Topic[];
  createdAt: string;
}

interface ProgressSubtopic {
  subTopicName: string;
  subTopicLink?: string;
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
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    duration: string;
    mode: string;
    stream?: string;
    internshipType?: string;
  };
  courseId: APCourse | string;
  userId: string;
  enrollmentDate: string;
  isPaid: boolean;
  amountPaid: number;
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted?: boolean;
  courseCompleted?: boolean;
  completionPercentage?: string;
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
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeSubtopic, setActiveSubtopic] = useState<Subtopic | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [examStatus, setExamStatus] = useState<ExamStatus | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [error, setError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<number | undefined>(undefined);

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId]);

  useEffect(() => {
    if (enrollment?.courseId && typeof enrollment.courseId !== 'string') {
      fetchExamStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Utility: normalize curriculum from either course.curriculum OR enrollment.progress
  const buildCurriculumFromEnrollment = (enr: APEnrollment): Topic[] => {
    try {
      // Prefer courseId.curriculum if available
      if (enr.courseId && typeof enr.courseId !== 'string' && enr.courseId.curriculum && enr.courseId.curriculum.length > 0) {
        // Ensure subtopics have expected keys name, link, duration
        return enr.courseId.curriculum.map((t: any) => ({
          topicName: t.topicName,
          topicCount: t.subtopics?.length || 0,
          subtopics: (t.subtopics || []).map((s: any) => ({
            name: s.name || s.subTopicName || 'Untitled',
            link: s.link || s.subTopicLink || '',
            duration: Number(s.duration || s.totalDuration || 0)
          }))
        }));
      }

      // Fallback: derive from enrollment.progress
      if (enr.progress && enr.progress.length > 0) {
        return enr.progress.map((t: TopicProgress) => ({
          topicName: t.topicName,
          topicCount: t.subtopics?.length || 0,
          subtopics: (t.subtopics || []).map((s: ProgressSubtopic) => ({
            name: s.subTopicName || 'Untitled',
            link: s.subTopicLink || '',
            duration: Number(s.totalDuration || 0)
          }))
        }));
      }

      return [];
    } catch (err) {
      console.error('buildCurriculumFromEnrollment error:', err);
      return [];
    }
  };

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

      // The student's enrollments endpoint returns enrollments where courseId may not include curriculum.
      // We'll fetch the enrollments list and use enrollment.progress to build curriculum if missing.
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const foundEnrollment = data.enrollments.find((e: any) => String(e._id) === String(enrollmentId));

        if (foundEnrollment) {
          // Ensure we use consistent object shape for enrollment
          // When backend returned minimal courseId, it's still fine because progress contains all needed info.
          const normalizedEnrollment: APEnrollment = {
            ...foundEnrollment,
            // ensure numeric durations
            totalWatchedDuration: Number(foundEnrollment.totalWatchedDuration || 0),
            totalVideoDuration: Number(foundEnrollment.totalVideoDuration || 0),
            progress: (foundEnrollment.progress || []).map((t: any) => ({
              topicName: t.topicName,
              subtopics: (t.subtopics || []).map((s: any) => ({
                subTopicName: s.subTopicName || s.name || '',
                subTopicLink: s.subTopicLink || s.link || '',
                watchedDuration: Number(s.watchedDuration || 0),
                totalDuration: Number(s.totalDuration || s.duration || 0)
              })),
              topicWatchedDuration: Number(t.topicWatchedDuration || 0),
              topicTotalDuration: Number(t.topicTotalDuration || 0),
              examAttempted: !!t.examAttempted,
              examScore: Number(t.examScore || 0),
              passed: !!t.passed
            }))
          };

          setEnrollment(normalizedEnrollment);

          // Build curriculum (prefer course curriculum, else progress)
          const curriculum = buildCurriculumFromEnrollment(normalizedEnrollment);

          if (curriculum.length > 0) {
            const firstTopic = curriculum[0];
            const firstSubtopic = firstTopic.subtopics && firstTopic.subtopics.length > 0 ? firstTopic.subtopics[0] : null;

            if (firstTopic) setActiveTopic(firstTopic.topicName);
            if (firstSubtopic) {
              setActiveSubtopic(firstSubtopic);
              // Initialize progress percent from enrollment progress if available
              const topicProgress = normalizedEnrollment.progress?.find(p => p.topicName === firstTopic.topicName);
              const subProg = topicProgress?.subtopics?.find(sp => sp.subTopicName === (firstSubtopic.name || firstSubtopic.name));
              const percent = (subProg && subProg.totalDuration > 0) ? (subProg.watchedDuration / subProg.totalDuration) * 100 : 0;
              setVideoProgress(percent);
            }
          } else {
            // No curriculum found
            setActiveTopic('');
            setActiveSubtopic(null);
          }
        } else {
          throw new Error('Enrollment not found in your enrollments list');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch enrollments');
      }
    } catch (err: any) {
      console.error('Error fetching enrollment:', err);
      setError(err.message || 'Failed to load course data');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load course data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStatus = async () => {
    if (!enrollment || typeof enrollment.courseId === 'string') return;
    const courseId = (enrollment.courseId as APCourse)._id;
    if (!courseId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/exams/status/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('fetchExamStatus non-ok', response.status);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setExamStatus(data.examStatus);
      }
    } catch (err) {
      console.error('Error fetching exam status:', err);
    }
  };

  const updateProgress = async (watchedDuration: number) => {
    if (!enrollmentId || !activeSubtopic || !activeTopic || updatingProgress) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setUpdatingProgress(true);

      // watchedDuration should be seconds
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

      if (!data.success) {
        console.error('Progress update failed:', data.message);
      } else {
        // Refresh local enrollment data to reflect updated progress
        await fetchEnrollmentData();
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleVideoPlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    } else {
      // play
      videoRef.current.play().catch(err => {
        console.warn('video play error', err);
      });
      setIsPlaying(true);

      // start periodic updates (every 10 seconds)
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = window.setInterval(() => {
        if (videoRef.current && activeSubtopic) {
          updateProgress(videoRef.current.currentTime);
        }
      }, 10000);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && activeSubtopic) {
      const current = videoRef.current.currentTime || 0;
      const duration = (videoRef.current.duration && isFinite(videoRef.current.duration)) ? videoRef.current.duration : activeSubtopic.duration || 0;
      const progress = duration > 0 ? (current / duration) * 100 : 0;

      setCurrentTime(current);
      setVideoProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    if (activeSubtopic) {
      // mark fully watched (use subtopic.duration if available)
      updateProgress(activeSubtopic.duration || currentTime);
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      // ensure progress shows 100%
      setVideoProgress(100);
      setCurrentTime(activeSubtopic.duration || 0);
    }
  };

  const handleSubtopicSelect = (topicName: string, subtopic: Subtopic) => {
    setActiveTopic(topicName);
    setActiveSubtopic(subtopic);
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);

    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }

    // find existing watched duration to show accurate progress
    const topicProgress = enrollment?.progress?.find(t => t.topicName === topicName);
    const subtopicProgress = topicProgress?.subtopics?.find(s => s.subTopicName === subtopic.name);
    if (subtopicProgress && subtopicProgress.totalDuration > 0) {
      const progressPercent = (subtopicProgress.watchedDuration / subtopicProgress.totalDuration) * 100;
      setVideoProgress(progressPercent);
      setCurrentTime(subtopicProgress.watchedDuration || 0);
    } else {
      setVideoProgress(0);
      setCurrentTime(0);
    }
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
    if (!enrollment) return;

    const topicProgressPercent = getTopicProgress(topicName);
    if (topicProgressPercent < 95) {
      toast({
        title: 'Complete Topic First',
        description: 'Please complete all videos in this topic before taking the exam',
        variant: 'destructive'
      });
      return;
    }

    // Navigate to exam page
    const courseId = typeof enrollment.courseId === 'string' ? enrollment.courseId : enrollment.courseId._id;
    navigate(`/ap-internship-exam/${courseId}/${encodeURIComponent(topicName)}?enrollmentId=${enrollmentId}`);
  };

  const handleTakeFinalExam = () => {
    if (!enrollment?.courseId || !examStatus?.courseProgress.finalExamEligible) {
      toast({
        title: 'Not Eligible',
        description: 'Complete all topic exams first to unlock the final exam',
        variant: 'destructive'
      });
      return;
    }

    const courseId = typeof enrollment.courseId === 'string' ? enrollment.courseId : enrollment.courseId._id;
    navigate(`/ap-internship-final-exam/${courseId}?enrollmentId=${enrollmentId}`);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Derived curriculum (ensures UI always has a consistent shape even if backend omitted course.curriculum)
  const curriculum = enrollment ? buildCurriculumFromEnrollment(enrollment) : [];

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
              <div className="space-y-3">
                <Button onClick={() => navigate('/student-dashboard')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={fetchEnrollmentData} className="w-full">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry Loading Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallProgress = enrollment.totalVideoDuration > 0
    ? (enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100
    : 0;

  // course object for header display (may be partial)
  const course = typeof enrollment.courseId === 'string' ? null : enrollment.courseId;

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
                  {course?.title || enrollment.internshipId?.title || 'Course Content'}
                </h1>
                <p className="text-gray-600">
                  {enrollment.internshipId?.companyName} • {course?.stream || enrollment.internshipId?.stream || ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Overall Progress: {overallProgress.toFixed(1)}%
                </div>
                <Badge variant={enrollment.courseCompleted ? "default" : "secondary"}>
                  {enrollment.courseCompleted ? 'Completed' : 'In Progress'}
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
                  {curriculum?.length || 0} topics • {Math.ceil((course?.totalDuration || enrollment.totalVideoDuration) / 60) || 0} min total
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {curriculum?.map((topic, topicIndex) => {
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
                            // If curriculum was built from enrollment.progress the subtopic.name matches subTopicName
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

                  {curriculum.length === 0 && (
                    <div className="p-4 text-sm text-gray-600">
                      No curriculum available for this course yet.
                    </div>
                  )}
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
                      {examStatus?.topicExams.passedCount || 0} / {curriculum?.length || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      curriculum?.length
                        ? ((examStatus?.topicExams.passedCount || 0) / curriculum.length) * 100
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
                    <video
                      ref={el => videoRef.current = el}
                      className="w-full h-auto max-h-[480px]"
                      controls
                      onPlay={() => { setIsPlaying(true); }}
                      onPause={() => { setIsPlaying(false); if (progressIntervalRef.current) { window.clearInterval(progressIntervalRef.current); } }}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnd}
                      src={activeSubtopic.link || undefined}
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
                        onClick={handleVideoPlayPause}
                        disabled={!activeSubtopic || (!activeSubtopic.link)}
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
                        {Math.floor(enrollment.totalWatchedDuration / 60)}min / {Math.floor(enrollment.totalVideoDuration / 60)}min
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
                      {examStatus?.topicExams.passedCount || 0} of {curriculum?.length || 0} passed
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
                      onClick={() => navigate(`/ap-internship-certificate/${enrollmentId}`)}
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
