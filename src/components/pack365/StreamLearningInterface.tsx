import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  ArrowLeft,
  Award,
  Video,
  FileText,
  ExternalLink,
  Circle,
  ChevronRight,
  ChevronLeft,
  Lock,
  Loader2
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number;
  topics: Topic[];
}

interface CourseProgress {
  courseId: string;
  totalTopics: number;
  watchedTopics: number;
  isCompleted: boolean;
  completionPercentage: number;
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
}

interface EnrollmentCourse {
  courseId: string;
  courseName: string;
  description: string;
  topicsCount: number;
  progress?: {
    courseId: string;
    totalTopics: number;
    watchedTopics: number;
    isCompleted: boolean;
    completionPercentage: number;
  } | null;
}

interface Enrollment {
  _id?: string;
  userId?: string;
  stream: string;
  topicProgress?: TopicProgress[];
  courseProgress?: {
    courseId: string;
    totalTopics: number;
    watchedTopics: number;
    isCompleted: boolean;
    completionPercentage: number;
  }[];
  courses?: EnrollmentCourse[];
  totalCoursesInStream: number;
  completedCourses: number;
  streamCompletionPercentage: number;
  isStreamCompleted: boolean;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [topicProgress, setTopicProgress] = useState<Map<string, boolean>>(new Map());
  const [courseProgress, setCourseProgress] = useState<Map<string, CourseProgress>>(new Map());
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [refreshingEnrollment, setRefreshingEnrollment] = useState(false);
  const [checkingExam, setCheckingExam] = useState(false);

  useEffect(() => {
    loadStreamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const loadStreamData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // 1️⃣ Get formatted enrollments (stream-level + course-level progress)
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      
      if (!enrollmentResponse.success || !enrollmentResponse.enrollments) {
        setError('Failed to load enrollment data');
        toast({ title: 'Error', description: 'Failed to load enrollment data', variant: 'destructive' });
        return;
      }

      const streamEnrollment: Enrollment | undefined = enrollmentResponse.enrollments.find(
        (e: Enrollment) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }

      console.log('Loaded enrollment data:', streamEnrollment);
      setEnrollment(streamEnrollment);
      initializeProgressMaps(streamEnrollment);

      // 2️⃣ Load all pack365 courses and filter by stream
      const coursesResponse = await pack365Api.getAllCourses();
      
      if (!coursesResponse.success || !coursesResponse.data) {
        setError('Failed to load courses');
        toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        return;
      }

      const streamCourses: Course[] = (coursesResponse.data as Course[]).filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      ) || [];

      if (streamCourses.length === 0) {
        setError('No courses found for this stream');
        toast({ title: 'No Courses', description: 'No courses available for this stream', variant: 'destructive' });
        return;
      }

      setCourses(streamCourses);

      // 3️⃣ Decide which course to show first
      const selectedCourseFromState = (location.state as any)?.selectedCourse;
      const selectedCourseId = (location.state as any)?.selectedCourseId;
      
      let initialCourse: Course | null = null;

      if (selectedCourseFromState) {
        initialCourse =
          streamCourses.find((c: Course) => c.courseId === selectedCourseFromState.courseId) ||
          streamCourses[0];
      } else if (selectedCourseId) {
        initialCourse =
          streamCourses.find((c: Course) => c.courseId === selectedCourseId) ||
          streamCourses[0];
      } else {
        initialCourse = streamCourses[0];
      }

      setSelectedCourse(initialCourse);

      // Set first topic as default, if available
      if (initialCourse?.topics?.length) {
        setSelectedTopic(initialCourse.topics[0]);
        setCurrentTopicIndex(0);
      }

      // 4️⃣ Fetch full enrollment (with topicProgress + courseProgress) via checkEnrollmentStatus
      if (initialCourse) {
        try {
          const detailed = await pack365Api.checkEnrollmentStatus(token, initialCourse.courseId);
          if (detailed.success && detailed.enrollment) {
            console.log('Detailed enrollment from checkEnrollmentStatus:', detailed.enrollment);
            initializeProgressMaps(detailed.enrollment as Enrollment);
          }
        } catch (err) {
          console.error('Error loading detailed enrollment progress:', err);
        }
      }

    } catch (error: any) {
      console.error('Error loading stream data:', error);
      setError('Failed to load stream data');
      toast({ 
        title: 'Error', 
        description: 'Failed to load stream data. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshEnrollmentData = async () => {
    try {
      setRefreshingEnrollment(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      
      if (enrollmentResponse.success && enrollmentResponse.enrollments) {
        const streamEnrollment: Enrollment | undefined = enrollmentResponse.enrollments.find(
          (e: Enrollment) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );

        if (streamEnrollment) {
          console.log('Refreshed enrollment data:', streamEnrollment);
          setEnrollment(streamEnrollment);
          initializeProgressMaps(streamEnrollment);
        }
      }
    } catch (error) {
      console.error('Error refreshing enrollment data:', error);
    } finally {
      setRefreshingEnrollment(false);
    }
  };

  const initializeProgressMaps = (enrollmentData: Enrollment) => {
    console.log('Initializing progress maps from enrollment:', enrollmentData);
    
    // topic progress
    if (enrollmentData.topicProgress && Array.isArray(enrollmentData.topicProgress)) {
      const topicMap = new Map<string, boolean>();
      enrollmentData.topicProgress.forEach((tp: TopicProgress) => {
        const key = `${tp.courseId}-${tp.topicName}`;
        topicMap.set(key, tp.watched);
        console.log(`Topic progress: ${tp.topicName} - watched: ${tp.watched}`);
      });
      setTopicProgress(topicMap);
    }

    // course progress
    const courseMap = new Map<string, CourseProgress>();

    if (enrollmentData.courseProgress && Array.isArray(enrollmentData.courseProgress)) {
      enrollmentData.courseProgress.forEach((cp: any) => {
        const key = cp.courseId?.toString?.() ?? cp.courseId;
        if (!key) return;
        courseMap.set(key, {
          courseId: key,
          totalTopics: cp.totalTopics,
          watchedTopics: cp.watchedTopics,
          isCompleted: cp.isCompleted,
          completionPercentage: cp.completionPercentage,
        });
        console.log(`Course progress (old): ${key} - ${cp.completionPercentage}% completed`);
      });
    }

    if (enrollmentData.courses && Array.isArray(enrollmentData.courses)) {
      enrollmentData.courses.forEach((c: EnrollmentCourse) => {
        if (!c.progress) return;
        const key = c.progress.courseId?.toString?.() ?? c.courseId;
        courseMap.set(key, {
          courseId: key,
          totalTopics: c.progress.totalTopics,
          watchedTopics: c.progress.watchedTopics,
          isCompleted: c.progress.isCompleted,
          completionPercentage: c.progress.completionPercentage,
        });
        console.log(`Course progress (new): ${key} - ${c.progress.completionPercentage}% completed`);
      });
    }

    if (courseMap.size > 0) {
      setCourseProgress(courseMap);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = (topic: Topic, index: number) => {
    if (!selectedCourse) return;
    setSelectedTopic(topic);
    setCurrentTopicIndex(index);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const markTopicAsWatched = async (topic: Topic) => {
    if (!selectedCourse || updatingProgress) return;

    try {
      setUpdatingProgress(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        return;
      }

      console.log('Marking topic as watched:', {
        courseId: selectedCourse.courseId,
        topicName: topic.name
      });

      const response = (await pack365Api.updateTopicProgress(token, {
        courseId: selectedCourse.courseId,
        topicName: topic.name,
      } as any)) as any;

      console.log('Progress update response:', response);

      if (response.success) {
        const key = `${selectedCourse._id}-${topic.name}`;
        const newTopicProgress = new Map(topicProgress);
        newTopicProgress.set(key, true);
        setTopicProgress(newTopicProgress);

        if (response.courseProgress) {
          const cp = response.courseProgress;
          const courseKey = cp.courseId?.toString?.() ?? selectedCourse._id;
          const newCourseMap = new Map(courseProgress);
          newCourseMap.set(courseKey, {
            courseId: courseKey,
            totalTopics: cp.totalTopics,
            watchedTopics: cp.watchedTopics,
            isCompleted: cp.isCompleted,
            completionPercentage: cp.completionPercentage,
          });
          setCourseProgress(newCourseMap);
          console.log('Updated course progress from updateTopicProgress:', cp);
        } else {
          await refreshEnrollmentData();
        }

        toast({
          title: 'Progress Updated',
          description: `Marked "${topic.name}" as completed`,
          variant: 'default'
        });
      } else {
        throw new Error(response.message || 'Failed to update progress');
      }
    } catch (error: any) {
      console.error('Error updating topic progress:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update topic progress',
        variant: 'destructive'
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleVideoEnd = async () => {
    if (!selectedTopic) return;
    await markTopicAsWatched(selectedTopic);
  };

  const isTopicWatched = (courseId: string, topicName: string): boolean => {
    const key = `${courseId}-${topicName}`;
    const isWatched = topicProgress.get(key) || false;
    console.log(`Checking topic ${topicName} watched status:`, isWatched);
    return isWatched;
  };

  const getCourseProgress = (courseId: string): CourseProgress | undefined => {
    const progress = courseProgress.get(courseId);
    console.log(`Getting course progress for ${courseId}:`, progress);
    return progress;
  };

  const isCourseCompleted = (courseId: string): boolean => {
    const progress = getCourseProgress(courseId);
    const completed = progress ? progress.isCompleted : false;
    console.log(`Course ${courseId} completed:`, completed);
    return completed;
  };

  const canTakeExam = (courseId: string): boolean => {
    const canTake = isCourseCompleted(courseId);
    console.log(`Can take exam for course ${courseId}:`, canTake);
    return canTake;
  };

  // UPDATED: Only fetch available exams and open the exam for the current course.
  const handleTakeExam = async () => {
    if (!selectedCourse) return;

    const courseCompleted = isCourseCompleted(selectedCourse._id);
    
    if (!courseCompleted) {
      toast({
        title: 'Exam Not Available',
        description: 'Complete all topics in this course to unlock the exam',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCheckingExam(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        return;
      }

      // Fetch only exams available for the user (backend only returns exams for courses completed)
      const res = await pack365Api.getAvailableExamsForUser(token);
      const exams = (res && (res as any).exams) || [];

      // backend returns courseId as DB _id (string). Match with selectedCourse._id
      const matched = exams.find((e: any) => {
        // some responses might return courseId nested or as string
        const examCourseId = e.courseId?._id ? e.courseId._id.toString() : e.courseId?.toString?.();
        return examCourseId === selectedCourse._id || e.courseId === selectedCourse._id;
      });

      if (!matched) {
        toast({
          title: 'Exam Not Found',
          description: 'No exam found for this course. Please contact support.',
          variant: 'destructive'
        });
        return;
      }

      // Navigate to the exam page for this exam only
      navigate(`/exam/${matched.examId}`, { state: { courseId: selectedCourse._id } });

    } catch (err: any) {
      console.error('Error checking available exams:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch exam information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCheckingExam(false);
    }
  };

  const goToNextTopic = () => {
    if (!selectedCourse?.topics) return;

    if (currentTopicIndex < selectedCourse.topics.length - 1) {
      const nextIndex = currentTopicIndex + 1;
      const nextTopic = selectedCourse.topics[nextIndex];
      setCurrentTopicIndex(nextIndex);
      setSelectedTopic(nextTopic);
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      const prevIndex = currentTopicIndex - 1;
      const prevTopic = selectedCourse?.topics[prevIndex];
      setCurrentTopicIndex(prevIndex);
      setSelectedTopic(prevTopic || null);
    }
  };

  const getCompletionStats = () => {
    if (!selectedCourse) return { completed: 0, total: 0, percentage: 0 };

    const progress = getCourseProgress(selectedCourse._id);
    if (progress) {
      const stats = {
        completed: progress.watchedTopics,
        total: progress.totalTopics,
        percentage: progress.completionPercentage
      };
      console.log('Course completion stats:', stats);
      return stats;
    }

    const completedTopics = selectedCourse.topics.filter(topic => 
      isTopicWatched(selectedCourse._id, topic.name)
    ).length;
    
    const totalTopics = selectedCourse.topics.length;
    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    const fallbackStats = {
      completed: completedTopics,
      total: totalTopics,
      percentage: percentage
    };
    
    console.log('Fallback completion stats:', fallbackStats);
    return fallbackStats;
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Content</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={loadStreamData} variant="default">
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/pack365')} variant="outline">
                    Back to Streams
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading || !selectedCourse) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your learning content...</p>
          </div>
        </div>
      </>
    );
  }

  const completionStats = getCompletionStats();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <Button 
                onClick={() => navigate(`/pack365-learning/${stream}`)}
                variant="outline"
                className="self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stream
              </Button>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {completionStats.completed} / {completionStats.total} topics completed
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionStats.percentage}%` }}
                  ></div>
                </div>
                <Badge variant={completionStats.percentage === 100 ? "default" : "secondary"}>
                  {completionStats.percentage}%
                </Badge>
                {refreshingEnrollment && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedCourse?.courseName}</h1>
                <p className="text-gray-600 mt-2">{selectedCourse?.description}</p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {selectedCourse?.topics.length || 0} Topics
                </Badge>
                {completionStats.percentage === 100 && (
                  <Badge variant="default" className="text-sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Content Section */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {selectedTopic ? selectedTopic.name : `Welcome to ${selectedCourse?.courseName}`}
                      {selectedTopic && isTopicWatched(selectedCourse?._id || '', selectedTopic.name) && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 inline-block ml-2" />
                      )}
                    </span>
                    {selectedTopic && (
                      <div className="flex items-center gap-2">
                        {!isTopicWatched(selectedCourse?._id || '', selectedTopic.name) && (
                          <Button
                            onClick={() => markTopicAsWatched(selectedTopic)}
                            variant="outline"
                            size="sm"
                            disabled={updatingProgress}
                          >
                            {updatingProgress ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Mark Complete
                          </Button>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedTopic?.duration} min
                        </Badge>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTopic ? (
                    <div className="bg-white rounded-lg">
                      {/* YouTube Video Embed */}
                      <div className="bg-black rounded-lg mb-4 aspect-video">
                        {extractYouTubeVideoId(selectedTopic.link) ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedTopic.link)}?autoplay=1`}
                            title={selectedTopic.name}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onLoad={() => {
                              // placeholder
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <div className="text-center">
                              <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                              <p className="text-lg mb-2">Video not available</p>
                              <Button 
                                onClick={() => handleOpenInNewTab(selectedTopic)}
                                variant="default"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Video Link
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            onClick={goToPreviousTopic}
                            disabled={currentTopicIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={goToNextTopic}
                            disabled={currentTopicIndex === (selectedCourse?.topics?.length || 0) - 1}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isTopicWatched(selectedCourse?._id || '', selectedTopic.name) && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                          <Button
                            onClick={() => handleOpenInNewTab(selectedTopic)}
                            variant="outline"
                            size="sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in New Tab
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[500px]">
                      <div className="text-center max-w-md mx-auto p-8">
                        <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Welcome to {selectedCourse?.courseName}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Ready to start your learning journey?
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                          Select a topic from the sidebar to begin watching the course content
                        </p>
                        <Button 
                          onClick={() => {
                            const firstTopic = selectedCourse?.topics?.[0];
                            if (firstTopic) {
                              handleTopicClick(firstTopic, 0);
                            } else {
                              toast({
                                title: 'No Topics',
                                description: 'No topics available for this course.',
                                variant: 'destructive'
                              });
                            }
                          }}
                          variant="default"
                          size="lg"
                          className="flex items-center gap-2 mx-auto"
                        >
                          <Play className="h-4 w-4" />
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Topics */}
            <div className="lg:col-span-1">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Course Topics</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Syllabus
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {completionStats.completed} of {completionStats.total} completed • {selectedCourse?.totalDuration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedCourse?.topics.map((topic, index) => {
                      const isCurrent = index === currentTopicIndex;
                      const isWatched = isTopicWatched(selectedCourse._id, topic.name);

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : isWatched
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTopicClick(topic, index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isWatched ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-medium truncate ${
                                isWatched ? 'text-green-800' : 'text-gray-800'
                              }`}>
                                {topic.name}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs flex-shrink-0 ${
                                isWatched ? 'border-green-200 text-green-700' : ''
                              }`}
                            >
                              {topic.duration}m
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(!selectedCourse?.topics || selectedCourse.topics.length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        No topics available for this course
                      </div>
                    )}
                  </div>

                  {/* Course Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Course Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Topics:</span>
                        <span>{selectedCourse?.topics.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Topics:</span>
                        <span>{completionStats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion:</span>
                        <span>{completionStats.percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Available:</span>
                        <span>
                          {completionStats.percentage === 100 ? (
                            <Badge variant="default" className="text-xs">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleTakeExam}
                      className="w-full mt-4 flex items-center justify-center gap-2"
                      variant={completionStats.percentage === 100 ? "default" : "outline"}
                      disabled={completionStats.percentage !== 100 || checkingExam}
                    >
                      {checkingExam ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          {completionStats.percentage === 100 ? 'Take Course Exam' : 'Complete Course to Unlock Exam'}
                        </>
                      )}
                    </Button>

                    {completionStats.percentage === 100 && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 inline-block mr-1" />
                        <span className="text-sm text-green-700">Course completed! You can now take the exam.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamLearningInterface;
