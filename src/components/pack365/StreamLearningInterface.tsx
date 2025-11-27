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
  courseId: string;
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

  // Timer/session tracking
  const [sessionWatchedSeconds, setSessionWatchedSeconds] = useState(0);
  const sessionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadStreamData();
    return () => {
      clearSessionInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const clearSessionInterval = () => {
    if (sessionIntervalRef.current) {
      window.clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
  };

  const startSessionTimer = () => {
    setSessionWatchedSeconds(0);
    clearSessionInterval();
    sessionIntervalRef.current = window.setInterval(() => {
      setSessionWatchedSeconds((s) => s + 1);
    }, 1000);
    console.debug('[Progress] session timer started');
  };

  const stopSessionTimer = (): number => {
    clearSessionInterval();
    const s = sessionWatchedSeconds;
    setSessionWatchedSeconds(0);
    console.debug('[Progress] session timer stopped, seconds:', s);
    return s;
  };

  // Direct fetch wrappers — explicit to ensure correct endpoints & headers
  const apiGet = async (path: string) => {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    console.debug('[API GET]', path, 'headers:', headers);
    const res = await fetch(path, { method: 'GET', headers });
    const body = await res.json().catch(() => null);
    console.debug('[API GET] response', path, res.status, body);
    return { ok: res.ok, status: res.status, body };
  };

  const apiPut = async (path: string, payload: any) => {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    console.debug('[API PUT]', path, 'payload:', payload, 'headers:', headers);
    const res = await fetch(path, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => null);
    console.debug('[API PUT] response', path, res.status, body);
    return { ok: res.ok, status: res.status, body };
  };

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

      // 1) Get enrollments for current user
      const enrollRes = await apiGet('/api/pack365/enrollments');
      if (!enrollRes.ok) {
        console.error('Failed to fetch enrollments', enrollRes);
        setError('Failed to load enrollment data');
        toast({ title: 'Error', description: 'Failed to load enrollment data', variant: 'destructive' });
        return;
      }

      const enrollments = enrollRes.body?.enrollments || enrollRes.body || [];
      console.debug('Enrollments list', enrollments);

      const streamEnrollment = (enrollments || []).find((e: any) => e.stream?.toLowerCase() === stream?.toLowerCase());
      if (!streamEnrollment) {
        setError('You are not enrolled in this stream');
        toast({ title: 'Access Denied', description: 'You are not enrolled in this stream', variant: 'destructive' });
        navigate('/pack365');
        return;
      }
      setEnrollment(streamEnrollment);

      // 2) Get all courses
      const coursesRes = await apiGet('/api/pack365/courses');
      if (!coursesRes.ok) {
        console.error('Failed to fetch courses', coursesRes);
        setError('Failed to load courses');
        toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        return;
      }

      const allCourses = coursesRes.body?.data || coursesRes.body || [];
      const streamCourses = allCourses.filter((c: Course) => c.stream?.toLowerCase() === stream?.toLowerCase());
      if (!streamCourses.length) {
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
        const c = streamCourses.find((x) => x.courseId === selectedCourseId);
        setSelectedCourse(c || streamCourses[0]);
      } else {
        setSelectedCourse(streamCourses[0]);
      }
    } catch (err) {
      console.error('Error loading stream data', err);
      setError('Failed to load stream data');
      toast({ title: 'Error', description: 'Failed to load stream data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const findTopicProgressEntry = (courseId: string, topicName: string): TopicProgressEntry | null => {
    if (!enrollment?.topicProgress) return null;
    return enrollment.topicProgress.find((p: any) => String(p.courseId) === String(courseId) && p.topicName === topicName) || null;
  };

  const computeTotalCourseDurationSeconds = (allCourses: Course[]) => {
    const totalMinutes = allCourses.reduce((acc, c) => acc + (c.topics.reduce((a, t) => a + (t.duration || 0), 0)), 0);
    return totalMinutes * 60;
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    startSessionTimer();
  };

  const handleCloseModal = async () => {
    const sessionSeconds = stopSessionTimer();
    console.debug('[Progress] closing modal, sessionSeconds:', sessionSeconds);

    // send update only if there's some watched time
    if (sessionSeconds > 0 && selectedCourse && selectedTopic) {
      try {
        const existing = findTopicProgressEntry(selectedCourse._id, selectedTopic.name);
        const existingWatched = existing?.watchedDuration || 0;
        const newWatchedDuration = existingWatched + sessionSeconds;

        const totalCourseDurationSeconds = computeTotalCourseDurationSeconds(courses);
        const existingTotalWatched = (enrollment?.topicProgress || []).reduce((acc: number, p: any) => acc + (p.watchedDuration || 0), 0);
        const totalWatchedAfter = existingTotalWatched + sessionSeconds;
        const totalWatchedPercentage = totalCourseDurationSeconds > 0 ? Math.round((totalWatchedAfter / totalCourseDurationSeconds) * 100) : 0;

        const payload = {
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watchedDuration: newWatchedDuration,
          totalCourseDuration: totalCourseDurationSeconds,
          totalWatchedPercentage
        };

        const res = await apiPut('/api/pack365/topic/progress', payload);

        if (res.ok && res.body && res.body.success) {
          toast({ title: 'Progress updated', description: 'Your progress was recorded', variant: 'default' });
          // prefer backend returned enrollment if provided
          if (res.body.enrollment) {
            setEnrollment(res.body.enrollment);
          } else {
            // optimistic local update
            setEnrollment((prev) => {
              if (!prev) return prev;
              const copy = { ...prev } as Enrollment;
              const idx = (copy.topicProgress || []).findIndex((p: any) => String(p.courseId) === String(selectedCourse._id) && p.topicName === selectedTopic.name);
              const updatedEntry: TopicProgressEntry = {
                courseId: selectedCourse._id,
                topicName: selectedTopic.name,
                watched: newWatchedDuration >= (selectedTopic.duration * 60 * 0.8),
                watchedDuration: newWatchedDuration
              };
              if (idx >= 0 && copy.topicProgress) {
                copy.topicProgress[idx] = updatedEntry;
              } else {
                copy.topicProgress = [...(copy.topicProgress || []), updatedEntry];
              }
              copy.totalWatchedPercentage = totalWatchedPercentage;
              copy.totalCourseDuration = totalCourseDurationSeconds;
              return copy;
            });
          }
        } else {
          console.error('Progress update failed', res);
          toast({ title: 'Update failed', description: (res.body && res.body.message) || 'Could not update progress', variant: 'destructive' });
        }
      } catch (err) {
        console.error('Error sending progress', err);
        toast({ title: 'Error', description: 'Failed to send progress to server', variant: 'destructive' });
      }
    } else {
      console.debug('[Progress] no session seconds to report or missing selection', { sessionSeconds, selectedCourse, selectedTopic });
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

  const getTopicWatchedPercent = (courseId: string, topic: Topic) => {
    const entry = findTopicProgressEntry(courseId, topic.name);
    const watched = entry?.watchedDuration || 0;
    const total = topic.duration * 60;
    if (total === 0) return 0;
    return Math.min(100, Math.round((watched / total) * 100));
  };

  const getSelectedCourseProgress = () => {
    if (!selectedCourse) return 0;
    const entries = (enrollment?.topicProgress || []).filter((p: any) => String(p.courseId) === String(selectedCourse._id));
    const watched = entries.reduce((acc: number, e: any) => acc + (e.watchedDuration || 0), 0);
    const total = selectedCourse.topics.reduce((acc: number, t) => acc + (t.duration * 60), 0);
    if (total === 0) return 0;
    return Math.min(100, Math.round((watched / total) * 100));
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
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Courses in Stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => {
                    const courseProgressPercent = (() => {
                      const entries = (enrollment?.topicProgress || []).filter((p: any) => String(p.courseId) === String(course._id));
                      const watched = entries.reduce((acc: number, e: any) => acc + (e.watchedDuration || 0), 0);
                      const total = course.topics.reduce((a, t) => a + (t.duration * 60), 0);
                      return total === 0 ? 0 : Math.min(100, Math.round((watched / total) * 100));
                    })();

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
                              <div style={{ width: `${courseProgressPercent}%` }} className="h-full bg-green-500" />
                            </div>
                            <span className="text-xs text-gray-600">{courseProgressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

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

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold mb-4">Course Topics</h3>
                      {selectedCourse.topics.map((topic, index) => {
                        const percent = getTopicWatchedPercent(selectedCourse._id, topic);
                        const isWatched = percent >= 80;
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
                                        <div style={{ width: `${percent}%` }} className="h-full bg-blue-500" />
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
                                <Button variant="ghost" size="sm" onClick={() => handleOpenInNewTab(topic)}>
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  New Tab
                                </Button>
                                <Button variant="default" size="sm" onClick={() => handleTopicClick(topic)}>
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
