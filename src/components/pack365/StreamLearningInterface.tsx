import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Clock, 
  BookOpen, 
  ArrowLeft,
  Award,
  Video,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Topic {
  name: string;
  link: string;
  duration: number; // minutes
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number; // minutes
  topics: Topic[];
}

interface TopicProgressEntry {
  courseId: string; // referenced course _id
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
}

interface Enrollment {
  _id: string;
  stream: string;
  topicProgress?: TopicProgressEntry[];
  totalWatchedPercentage?: number;
  totalCourseDuration?: number; // seconds
  // other fields omitted for brevity
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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Progress tracking session state
  const [sessionWatchedSeconds, setSessionWatchedSeconds] = useState(0);
  const sessionIntervalRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    loadStreamData();
    // cleanup on unmount
    return () => {
      clearSessionInterval();
    };
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

      // fetch enrollments
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);

      if (!enrollmentResponse.success || !enrollmentResponse.enrollments) {
        setError('Failed to load enrollment data');
        toast({ title: 'Error', description: 'Failed to load enrollment data', variant: 'destructive' });
        return;
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }

      setEnrollment(streamEnrollment);

      // fetch courses
      const coursesResponse = await pack365Api.getAllCourses();

      if (!coursesResponse.success || !coursesResponse.data) {
        setError('Failed to load courses');
        toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        return;
      }

      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      ) || [];

      if (streamCourses.length === 0) {
        setError('No courses found for this stream');
        toast({ title: 'No Courses', description: 'No courses available for this stream', variant: 'destructive' });
        return;
      }

      setCourses(streamCourses);

      const selectedCourseFromState = (location.state as any)?.selectedCourse;
      const selectedCourseId = (location.state as any)?.selectedCourseId;

      if (selectedCourseFromState) {
        setSelectedCourse(selectedCourseFromState);
      } else if (selectedCourseId) {
        const course = streamCourses.find((c: Course) => c.courseId === selectedCourseId);
        setSelectedCourse(course || streamCourses[0]);
      } else {
        setSelectedCourse(streamCourses[0]);
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

  // Helpers to compute durations / progress
  const computeTotalCourseDurationSeconds = (allCourses: Course[]) => {
    // Sum durations of all topics across all courses in stream and convert to seconds
    const totalMinutes = allCourses.reduce((acc, course) => {
      const courseMinutes = course.topics.reduce((a, t) => a + (t.duration || 0), 0);
      return acc + courseMinutes;
    }, 0);
    return totalMinutes * 60;
  };

  const findTopicProgressEntry = (courseId: string, topicName: string): TopicProgressEntry | null => {
    if (!enrollment?.topicProgress) return null;
    const entry = enrollment.topicProgress.find(
      (p: any) => String(p.courseId) === String(courseId) && p.topicName === topicName
    );
    return entry || null;
  };

  const clearSessionInterval = () => {
    if (sessionIntervalRef.current) {
      window.clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
    sessionStartRef.current = null;
  };

  // Start tracking time in modal
  const startSessionTimer = () => {
    setSessionWatchedSeconds(0);
    sessionStartRef.current = Date.now();
    // increment every second
    sessionIntervalRef.current = window.setInterval(() => {
      setSessionWatchedSeconds((s) => s + 1);
    }, 1000);
  };

  // Stop tracking and return elapsed seconds
  const stopSessionTimer = (): number => {
    clearSessionInterval();
    // sessionWatchedSeconds is state which has been updated each second
    const seconds = sessionWatchedSeconds;
    setSessionWatchedSeconds(0);
    return seconds;
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic) => {
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    // start session timer
    startSessionTimer();
  };

  const handleCloseModal = async () => {
    // stop timer and compute session watched seconds
    const sessionSeconds = stopSessionTimer();

    // Update backend with sessionSeconds
    if (selectedCourse && selectedTopic) {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Auth', description: 'Authentication required to update progress', variant: 'destructive' });
      } else {
        try {
          // find existing progress for this topic
          const existingEntry = findTopicProgressEntry(selectedCourse._id, selectedTopic.name);
          const existingWatched = existingEntry?.watchedDuration || 0;
          const newWatchedDuration = existingWatched + sessionSeconds;

          // compute total course duration seconds across stream
          const totalCourseDurationSeconds = computeTotalCourseDurationSeconds(courses);

          // compute total watched across all topics: start from enrollment.topicProgress sum then add this session delta
          const existingTotalWatched = (enrollment?.topicProgress || []).reduce((acc: number, p: any) => acc + (p.watchedDuration || 0), 0);
          // if the existingEntry exists, we added sessionSeconds to it, so total increases by sessionSeconds
          const totalWatchedAfter = existingTotalWatched + sessionSeconds;

          const totalWatchedPercentage = totalCourseDurationSeconds > 0
            ? Math.round((totalWatchedAfter / totalCourseDurationSeconds) * 100)
            : 0;

          const payload = {
            courseId: selectedCourse._id,
            topicName: selectedTopic.name,
            watchedDuration: newWatchedDuration, // backend expects watchedDuration in seconds
            totalCourseDuration: totalCourseDurationSeconds,
            totalWatchedPercentage: totalWatchedPercentage
          };

          const res = await pack365Api.updateTopicProgress(token, payload);

          if (res && res.success) {
            // If backend returns updated enrollment, use it; else we'll optimistically update local state
            if (res.enrollment) {
              setEnrollment(res.enrollment);
            } else {
              // Optimistic update: update enrollment.topicProgress array & percentage
              setEnrollment((prev) => {
                if (!prev) return prev;
                const copy = { ...prev } as Enrollment;
                const existingIndex = copy.topicProgress?.findIndex((p: any) => String(p.courseId) === String(selectedCourse._id) && p.topicName === selectedTopic.name) ?? -1;
                if (existingIndex >= 0 && copy.topicProgress) {
                  copy.topicProgress[existingIndex] = {
                    ...copy.topicProgress[existingIndex],
                    watchedDuration: newWatchedDuration,
                    watched: newWatchedDuration >= (selectedTopic.duration * 60 * 0.8) // mark watched if >= 80% of topic
                  };
                } else {
                  const newEntry: TopicProgressEntry = {
                    courseId: selectedCourse._id,
                    topicName: selectedTopic.name,
                    watched: newWatchedDuration >= (selectedTopic.duration * 60 * 0.8),
                    watchedDuration: newWatchedDuration
                  };
                  copy.topicProgress = [...(copy.topicProgress || []), newEntry];
                }
                copy.totalWatchedPercentage = totalWatchedPercentage;
                copy.totalCourseDuration = totalCourseDurationSeconds;
                return copy;
              });
            }
          } else {
            toast({ title: 'Progress Update Failed', description: (res && res.message) || 'Failed to update progress', variant: 'destructive' });
          }
        } catch (err) {
          console.error('Failed to update topic progress', err);
          toast({ title: 'Error', description: 'Failed to update topic progress', variant: 'destructive' });
        }
      }
    }

    setIsVideoModalOpen(false);
    setSelectedTopic(null);
  };

  const handleOpenInNewTab = (topic: Topic) => {
    window.open(topic.link, '_blank');
  };

  const handleTakeExam = () => {
    navigate(`/exam/${stream}`);
  };

  // compute topic percent from enrollment
  const getTopicWatchedPercent = (courseId: string, topic: Topic) => {
    const entry = findTopicProgressEntry(courseId, topic.name);
    const watchedSeconds = entry?.watchedDuration || 0;
    const topicTotalSeconds = topic.duration * 60;
    if (topicTotalSeconds === 0) return 0;
    return Math.min(100, Math.round((watchedSeconds / topicTotalSeconds) * 100));
  };

  // compute selected course progress percentage from enrollment.topicProgress (by durations)
  const getSelectedCourseProgress = () => {
    if (!selectedCourse) return 0;
    const entries = enrollment?.topicProgress?.filter((p: any) => String(p.courseId) === String(selectedCourse._id)) || [];
    const watchedSeconds = entries.reduce((acc: number, e: any) => acc + (e.watchedDuration || 0), 0);
    const courseTotalSeconds = selectedCourse.topics.reduce((acc: number, t) => acc + (t.duration * 60), 0);
    if (courseTotalSeconds === 0) return 0;
    return Math.min(100, Math.round((watchedSeconds / courseTotalSeconds) * 100));
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
                  <Button onClick={() => navigate('/pack365-dashboard')} variant="outline">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading course content...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTopic?.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedTopic && handleOpenInNewTab(selectedTopic)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {selectedTopic && (
              <>
                {/* YouTube Video Embed */}
                <div className="flex-1 bg-black rounded-lg mb-4">
                  {extractYouTubeVideoId(selectedTopic.link) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedTopic.link)}?autoplay=1`}
                      title={selectedTopic.name}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
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

                {/* Topic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration: {selectedTopic.duration} minutes
                      </span>
                      <div className="text-sm text-gray-500 mt-2">
                        Session watched: {Math.floor(sessionWatchedSeconds / 60)}m {sessionWatchedSeconds % 60}s
                      </div>
                    </div>

                    <Button
                      onClick={handleCloseModal}
                      variant="default"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate(`/pack365-learning/${stream}`)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stream
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {stream} Stream - Learning Portal
            </h1>
            <p className="text-gray-600 mt-2">
              Explore all courses and topics in this stream
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Courses Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Courses in Stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => {
                    // course-level progress (if enrollment exists)
                    const courseProgressPercent = enrollment ? (() => {
                      const entries = (enrollment.topicProgress || []).filter((p: any) => String(p.courseId) === String(course._id));
                      const watchedSeconds = entries.reduce((acc: number, e: any) => acc + (e.watchedDuration || 0), 0);
                      const courseTotalSeconds = course.topics.reduce((acc: number, t) => acc + (t.duration * 60), 0);
                      return courseTotalSeconds === 0 ? 0 : Math.min(100, Math.round((watchedSeconds / courseTotalSeconds) * 100));
                    })() : 0;

                    return (
                      <div
                        key={course._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCourse?._id === course._id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm">{course.courseName}</h3>
                          <Badge variant="secondary">
                            {course.topics.length} topics
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{course.totalDuration} min total</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                              <div
                                style={{ width: `${courseProgressPercent}%` }}
                                className="h-full bg-green-500"
                              />
                            </div>
                            <span className="text-xs text-gray-600">{courseProgressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Exam Card */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Stream Exam</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Take the stream exam to test your knowledge.
                  </p>
                  <Button
                    onClick={handleTakeExam}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Take Stream Exam
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Course Content */}
            <div className="lg:col-span-3">
              {selectedCourse && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedCourse.courseName}</CardTitle>
                        <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedCourse.totalDuration} min
                        </Badge>
                        <Badge variant="secondary">
                          Course Progress: {getSelectedCourseProgress()}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Course Document */}
                    {selectedCourse.documentLink && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <div>
                              <h4 className="font-medium">Course Materials</h4>
                              <p className="text-sm text-gray-600">Download study materials</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(selectedCourse.documentLink, '_blank')}
                            variant="outline"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Topics List */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                      {selectedCourse.topics.map((topic, index) => {
                        const percent = getTopicWatchedPercent(selectedCourse._id, topic);
                        const isWatched = percent >= 80;
                        const topicTotalSeconds = topic.duration * 60;
                        const entry = findTopicProgressEntry(selectedCourse._id, topic.name);
                        const watchedSeconds = entry?.watchedDuration || 0;

                        return (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Play className="h-5 w-5 text-blue-600" />
                                <div>
                                  <h4 className="font-medium">{topic.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {topic.duration} min
                                    </span>

                                    <div className="flex items-center space-x-2">
                                      <div className="w-40 h-2 bg-gray-200 rounded overflow-hidden">
                                        <div
                                          style={{ width: `${percent}%` }}
                                          className="h-full bg-blue-500"
                                        />
                                      </div>
                                      <span className="text-xs text-gray-600">{percent}%</span>
                                    </div>

                                    <span className="text-xs text-gray-500">
                                      {Math.floor(watchedSeconds / 60)}m {watchedSeconds % 60}s watched
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isWatched && <Badge variant="secondary">Watched</Badge>}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenInNewTab(topic)}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  New Tab
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleTopicClick(topic)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Watch
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamLearningInterface;
