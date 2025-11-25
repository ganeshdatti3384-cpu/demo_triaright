// components/student/APInternshipLearningPage.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, PlayCircle, CheckCircle, Award, Clock, Video, BookOpen, ArrowLeft, Pause, Play as PlayIcon, Volume2, VolumeX, Maximize, Share2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============ INTERFACES ============
interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

interface Topic {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
}

interface InternshipInfo {
  _id: string;
  title: string;
  companyName: string;
  duration: string;
  internshipType: 'Online' | 'Offline';
  mode: 'Free' | 'Paid';
  location?: string;
}

interface CourseInfo {
  _id: string;
  title: string;
  stream: string;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: 'yes' | 'no';
  hasFinalExam: boolean;
  curriculum: Topic[];
  totalDuration: number;
  createdAt: string;
}

interface SubtopicProgress {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
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

interface EnrollmentData {
  _id: string;
  internshipId: InternshipInfo;
  courseId: CourseInfo;
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  enrollmentDate: string;
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  isPaid: boolean;
  certificateIssued?: boolean;
  certificateUrl?: string;
  completionPercentage?: string;
}

interface VideoPlayerProps {
  subtopic: Subtopic;
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
}

// ============ HELPER COMPONENTS ============

const VideoPlayer: React.FC<VideoPlayerProps> = ({ subtopic, onPlay, onStop, isPlaying }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const extractYoutubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = extractYoutubeVideoId(subtopic.link);
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1`
    : subtopic.link;

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video rounded-lg'}`}>
      <iframe
        title={subtopic.name}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg border-2 border-blue-200"
      ></iframe>

      {/* Overlay Controls */}
      {isPlaying && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/50 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onStop}
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onPlay}
              >
                <PlayIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ MAIN COMPONENT ============

const APInternshipLearningPage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [activeSubIdx, setActiveSubIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionWatchedSeconds, setSessionWatchedSeconds] = useState(0);
  const [syncingProgress, setSyncingProgress] = useState(false);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============ FETCH ENROLLMENT DATA ============
  const fetchEnrollmentData = useCallback(async () => {
    if (!enrollmentId) {
      setError('No enrollment ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Enrollment ID:', enrollmentId);

      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        toast({
          title: 'Authentication Required',
          description: 'Please login to access this course',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('Fetching enrollments...');
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${response.status}: ${errorData.message || 'Failed to fetch enrollments'}`);
      }

      const data = await response.json();
      console.log('Enrollments response:', data);

      if (data.success && Array.isArray(data.enrollments)) {
        const found = data.enrollments.find((e: any) => e._id === enrollmentId);
        
        if (found) {
          console.log('Found enrollment:', found);
          setEnrollment(found);
          setError(null);
        } else {
          console.log('Enrollment not found. Available enrollments:', data.enrollments.map((e: any) => e._id));
          setError(`Enrollment ${enrollmentId} not found`);
          toast({
            title: 'Enrollment Not Found',
            description: 'The enrollment record could not be found',
            variant: 'destructive',
          });
        }
      } else {
        setError('Invalid response format');
        console.error('Invalid response:', data);
      }
    } catch (error: any) {
      console.error('Error fetching enrollment:', error);
      setError(error.message || 'Failed to load course');
      toast({
        title: 'Load Error',
        description: error.message || 'Failed to load course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, toast, navigate]);

  // ============ INITIAL LOAD ============
  useEffect(() => {
    fetchEnrollmentData();
  }, [fetchEnrollmentData]);

  // ============ WATCH TIMER ============
  useEffect(() => {
    if (!isPlaying) {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
        watchTimerRef.current = null;
      }
      return;
    }

    watchTimerRef.current = setInterval(() => {
      setSessionWatchedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
        watchTimerRef.current = null;
      }
    };
  }, [isPlaying]);

  // ============ RECORD PROGRESS ============
  const recordProgressToBackend = useCallback(async (seconds: number) => {
    if (!enrollment || seconds <= 0) return;

    const topic = enrollment.courseId.curriculum[activeTopicIdx];
    const subtopic = topic?.subtopics[activeSubIdx];

    if (!topic || !subtopic) {
      console.warn('Topic or subtopic not found');
      return;
    }

    setSyncingProgress(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token for progress update');
        return;
      }

      console.log('Recording progress:', {
        enrollmentId: enrollment._id,
        topicName: topic.topicName,
        subTopicName: subtopic.name,
        watchedDuration: seconds,
      });

      const response = await fetch('/api/internships/apinternshipenrollment-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollmentId: enrollment._id,
          topicName: topic.topicName,
          subTopicName: subtopic.name,
          watchedDuration: seconds,
        }),
      });

      const data = await response.json();
      console.log('Progress update response:', data);

      if (data.success) {
        console.log('Progress recorded successfully');
        // Optionally refresh enrollment data
        await fetchEnrollmentData();
      } else {
        console.error('Failed to record progress:', data.message);
      }
    } catch (error) {
      console.error('Error recording progress:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to save progress, but you can continue learning',
        variant: 'destructive',
      });
    } finally {
      setSyncingProgress(false);
    }
  }, [enrollment, activeTopicIdx, activeSubIdx, fetchEnrollmentData, toast]);

  // ============ STOP WATCHING ============
  const handleStopWatching = useCallback(() => {
    setIsPlaying(false);
    if (sessionWatchedSeconds > 0) {
      recordProgressToBackend(sessionWatchedSeconds);
      setSessionWatchedSeconds(0);
    }
  }, [sessionWatchedSeconds, recordProgressToBackend]);

  // ============ CLEANUP ============
  useEffect(() => {
    return () => {
      if (watchTimerRef.current) {
        clearInterval(watchTimerRef.current);
      }
      if (isPlaying) {
        handleStopWatching();
      }
    };
  }, [isPlaying, handleStopWatching]);

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="shadow-xl border-0 p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your course...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your enrollment</p>
        </Card>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="shadow-xl border-2 border-red-200 bg-white max-w-md">
          <CardContent className="pt-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Course</h2>
            <p className="text-gray-600 mb-6">{error || 'Course not found'}</p>
            
            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg mb-6">
              <p><strong>Debug Info:</strong></p>
              <p>Enrollment ID: {enrollmentId}</p>
              <p>Error: {error}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => fetchEnrollmentData()}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Retry Loading
              </Button>
              <Button
                onClick={() => navigate('/ap-dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ CALCULATE STATS ============
  const course = enrollment.courseId;
  const internship = enrollment.internshipId;
  const currentTopic = course.curriculum[activeTopicIdx];
  const currentSubtopic = currentTopic?.subtopics[activeSubIdx];
  const currentTopicProgress = enrollment.progress[activeTopicIdx];

  const completionPercentage =
    enrollment && enrollment.totalVideoDuration > 0
      ? ((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100).toFixed(2)
      : '0';

  const isEligibleForFinalExam = enrollment?.finalExamEligible ?? false;

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/ap-dashboard')}
            className="border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Overall Progress: <span className="font-bold text-blue-600">{completionPercentage}%</span>
            </p>
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="mb-6 shadow-xl border-2 border-blue-100 bg-white">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-lg mb-3">
                  {internship.companyName} • {internship.internshipType}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">{course.stream}</Badge>
                  <Badge variant="outline" className="flex items-center text-sm">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {course.instructorName}
                  </Badge>
                  <Badge variant="outline" className="flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {(course.totalDuration / 60).toFixed(1)} hrs
                  </Badge>
                  {course.certificationProvided === 'yes' && (
                    <Badge variant="default" className="flex items-center text-sm">
                      <Award className="h-3 w-3 mr-1" />
                      Certification
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm">
                    {course.courseLanguage}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {enrollment.certificateIssued && enrollment.certificateUrl ? (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(enrollment.certificateUrl, '_blank')}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                ) : isEligibleForFinalExam ? (
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => navigate(`/ap-final-exam/${enrollment._id}`)}
                  >
                    Take Final Exam
                  </Button>
                ) : null}
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  {completionPercentage}% Complete
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={parseFloat(completionPercentage)} 
                className="h-3 bg-gray-200"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-gray-600">Watched</p>
                  <p className="font-bold text-blue-600">{(enrollment.totalWatchedDuration / 60).toFixed(1)} hrs</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Total Duration</p>
                  <p className="font-bold">{(course.totalDuration / 60).toFixed(1)} hrs</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-gray-600">Enrollment Type</p>
                  <p className="font-bold capitalize text-green-700">{enrollment.isPaid ? 'Paid' : 'Free'}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-gray-600">Status</p>
                  <p className="font-bold capitalize text-indigo-700">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert for Final Exam Eligibility */}
        {isEligibleForFinalExam && !enrollment.certificateIssued && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Congratulations!</p>
                  <p className="text-green-800 text-sm">
                    You've watched 80%+ of the course. You are now eligible for the final exam.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Curriculum Tabs */}
        <Tabs value={String(activeTopicIdx)} className="space-y-4">
          <div className="bg-white rounded-xl shadow border-2 border-gray-200 p-3 overflow-x-auto">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 bg-transparent w-max md:w-full">
              {course.curriculum.map((topic, idx) => {
                const topicProg = enrollment.progress[idx];
                const topicCompletion =
                  topicProg?.topicTotalDuration > 0
                    ? (topicProg.topicWatchedDuration / topicProg.topicTotalDuration) * 100
                    : 0;

                return (
                  <TabsTrigger
                    key={topic.topicName}
                    value={String(idx)}
                    onClick={() => {
                      setActiveTopicIdx(idx);
                      setActiveSubIdx(0);
                      setIsPlaying(false);
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-all min-w-[80px] ${
                      activeTopicIdx === idx
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="truncate text-center text-xs">Topic {idx + 1}</span>
                    {topicProg?.passed && <CheckCircle className="absolute top-1 right-1 h-3 w-3 text-green-500 bg-white rounded-full" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          {course.curriculum.map((topic, idx) => (
            <TabsContent key={topic.topicName} value={String(idx)} className="space-y-4">
              {/* Topic Info */}
              <Card className="shadow-lg border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-1">{topic.topicName}</CardTitle>
                      <CardDescription className="mt-2">
                        {topic.subtopics.length} Subtopics • {(topic.subtopics.reduce((a, s) => a + s.duration, 0) / 60).toFixed(1)} minutes total
                      </CardDescription>
                    </div>
                    {currentTopicProgress?.passed && (
                      <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Subtopics List */}
                  <div className="space-y-4">
                    {topic.subtopics.map((subtopic, sidx) => {
                      const subProgress = currentTopicProgress?.subtopics[sidx];
                      const watchedDuration = subProgress?.watchedDuration ?? 0;
                      const totalDuration = subProgress?.totalDuration ?? subtopic.duration;
                      const subCompletion = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0;
                      const isCompleted = subCompletion >= 100;

                      return (
                        <div
                          key={subtopic.name}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Video className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <h4 className="font-semibold text-gray-900 truncate">{subtopic.name}</h4>
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                Duration: {(subtopic.duration / 60).toFixed(2)} minutes
                              </p>
                              <Progress value={Math.min(subCompletion, 100)} className="h-2 bg-gray-200 mb-2" />
                              <p className="text-xs text-gray-500">
                                Watched: {(watchedDuration / 60).toFixed(2)} / {(totalDuration / 60).toFixed(2)} mins ({subCompletion.toFixed(0)}%)
                              </p>
                            </div>

                            <Button
                              onClick={() => {
                                setActiveSubIdx(sidx);
                                setIsPlaying(true);
                                setSessionWatchedSeconds(0);
                              }}
                              variant={isCompleted ? 'outline' : 'default'}
                              className={`flex-shrink-0 min-w-max h-10 ${
                                isCompleted
                                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                              }`}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              {isCompleted ? 'Replay' : 'Play'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Video Player Section */}
              {isPlaying && currentSubtopic && (
                <Card className="shadow-2xl border-2 border-blue-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-black aspect-video">
                      <VideoPlayer
                        subtopic={currentSubtopic}
                        onPlay={() => setIsPlaying(true)}
                        onStop={handleStopWatching}
                        isPlaying={isPlaying}
                      />
                    </div>

                    {/* Video Controls */}
                    <div className="bg-white p-6 border-t-2 border-blue-100">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">Now Playing: {currentSubtopic.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Session watched: <span className="font-bold text-blue-600">{sessionWatchedSeconds} seconds</span>
                          </p>
                        </div>

                        <Progress
                          value={Math.min((sessionWatchedSeconds / (currentSubtopic.duration || 1)) * 100, 100)}
                          className="h-2 bg-gray-200"
                        />

                        <div className="flex gap-3">
                          <Button
                            variant="default"
                            onClick={handleStopWatching}
                            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                          >
                            Stop Watching
                          </Button>
                          {syncingProgress && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              Syncing...
                            </Badge>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-700">
                              <p className="font-semibold mb-1">💡 Progress Tracking</p>
                              <p>Watching for 10+ seconds counts towards your completion. Progress auto-saves when you stop.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer CTA */}
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">🎓 Keep Learning!</p>
              <p className="text-sm text-gray-600">
                {isEligibleForFinalExam
                  ? "You're eligible for the final exam. Complete it to get your certificate!"
                  : `Complete ${(100 - parseFloat(completionPercentage)).toFixed(1)}% more to unlock the final exam.`}
              </p>
            </div>
            {isEligibleForFinalExam && (
              <Button
                onClick={() => navigate(`/ap-final-exam/${enrollment._id}`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap"
              >
                Take Final Exam Now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APInternshipLearningPage;
