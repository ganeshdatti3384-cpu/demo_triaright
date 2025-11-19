import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  X,
  ExternalLink
} from 'lucide-react';
import { pack365Api, UpdateTopicProgressData } from '@/services/api';
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

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number; // seconds
  lastWatchedAt?: string;
}

const StreamLearningInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoProgressPercent, setVideoProgressPercent] = useState<number>(0);
  const [isTrackingProgress, setIsTrackingProgress] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchedSecondsRef = useRef<number>(0); // current topic watched seconds
  const [examEligible, setExamEligible] = useState(false);

  useEffect(() => {
    loadStreamData();
    // Cleanup on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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
      // ensure watched durations are in seconds
      setTopicProgress((streamEnrollment.topicProgress || []).map((tp: any) => ({
        courseId: String(tp.courseId),
        topicName: tp.topicName,
        watched: !!tp.watched,
        watchedDuration: Number(tp.watchedDuration || 0), // assume backend stores seconds
        lastWatchedAt: tp.lastWatchedAt
      })));

      const coursesResponse = await pack365Api.getAllCourses();
      
      if (!coursesResponse.success || !coursesResponse.data) {
        setError('Failed to load courses');
        toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
        return;
      }

      const streamCourses = coursesResponse.data.filter(
        (course: Course) => course.stream?.toLowerCase() === stream?.toLowerCase()
      ) || [];

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

      await checkExamEligibility(streamEnrollment);

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

  const checkExamEligibility = async (enrollmentData?: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const e = enrollmentData || enrollment;
      if (!e) {
        setExamEligible(false);
        return;
      }

      // Backend stores totalWatchedPercentage on enrollment; use it if present
      if (typeof e.totalWatchedPercentage === 'number') {
        setExamEligible(e.totalWatchedPercentage >= 80);
        return;
      }

      // fallback compute from topicProgress & totalCourseDuration
      const totalCourseDuration = Number(e.totalCourseDuration || 0); // expected seconds
      if (!totalCourseDuration || !e.topicProgress) {
        setExamEligible(false);
        return;
      }

      const watchedSum = (e.topicProgress || []).reduce((acc: number, tp: any) => acc + Number(tp.watchedDuration || 0), 0);
      const percent = Math.round((watchedSum / totalCourseDuration) * 100);
      setExamEligible(percent >= 80);
    } catch (err) {
      console.error('Error checking exam eligibility:', err);
      setExamEligible(false);
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleTopicClick = async (topic: Topic) => {
    if (!selectedCourse) return;

    setSelectedTopic(topic);
    setIsVideoModalOpen(true);
    setVideoProgressPercent(0);
    setIsTrackingProgress(false);

    // clear previous interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    watchedSecondsRef.current = 0;

    // Start real second-based tracking (adds 5s repeatedly)
    const interval = startProgressTracking(topic);
    progressIntervalRef.current = interval;
  };

  const startProgressTracking = (topic: Topic): NodeJS.Timeout => {
    // topic.duration is in minutes, convert to seconds
    const topicDurationSeconds = Math.max(1, Math.floor(topic.duration * 60));
    setIsTrackingProgress(true);
    watchedSecondsRef.current = 0;

    const interval = setInterval(() => {
      // increment watched seconds by 5
      watchedSecondsRef.current += 5;
      if (watchedSecondsRef.current > topicDurationSeconds) {
        watchedSecondsRef.current = topicDurationSeconds;
      }

      const percent = Math.round((watchedSecondsRef.current / topicDurationSeconds) * 100);
      setVideoProgressPercent(percent);

      // If watched >= 80% of topic, mark completed
      if (percent >= 80) {
        // mark topic completed (will call backend)
        markTopicAsCompleted(topic, watchedSecondsRef.current).catch(err => {
          console.error('Error auto marking topic completed:', err);
        });

        // stop interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsTrackingProgress(false);
      }
    }, 5000);

    return interval;
  };

  const markTopicAsCompleted = async (topic: Topic, watchedSecondsArg?: number) => {
    if (!selectedCourse || !enrollment) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentTopicProgress = getTopicProgress(selectedCourse._id, topic.name);
      if (currentTopicProgress?.watched) {
        // already watched -> update maybe watchedDuration if new is larger
        if ((watchedSecondsArg || 0) <= (currentTopicProgress.watchedDuration || 0)) {
          return;
        }
      }

      // compute total watched seconds across enrollment (existing) + this topic's new seconds
      const existingWatchedSum = (topicProgress || []).reduce((acc, tp) => acc + Number(tp.watchedDuration || 0), 0);
      const newWatchedForThis = watchedSecondsArg != null ? watchedSecondsArg : (topic.duration * 60);
      const totalCourseDuration = Number(enrollment.totalCourseDuration || 0); // expect seconds

      // protect division by zero
      const newTotalWatched = Math.min(existingWatchedSum + newWatchedForThis, totalCourseDuration || (existingWatchedSum + newWatchedForThis));
      const newWatchedPercent = totalCourseDuration ? Math.round((newTotalWatched / totalCourseDuration) * 100) : 0;

      const payload: UpdateTopicProgressData = {
        courseId: String(selectedCourse._id), // send the MongoDB ID string
        topicName: topic.name,
        watchedDuration: Math.floor(newWatchedForThis), // seconds
        totalWatchedPercentage: newWatchedPercent,
        lastWatchedAt: new Date().toISOString()
      };

      const response = await pack365Api.updateTopicProgress(token, payload);
      if (response && response.success) {
        // update local topicProgress state by refetching enrollment from server
        // this ensures data consistency and avoids ID mismatch issues
        await refreshEnrollmentAndProgress();
        // mark last update so other pages can refresh
        try {
          localStorage.setItem('lastEnrollmentUpdate', new Date().toISOString());
        } catch (err) {
          // ignore localStorage errors
        }
        toast({
          title: 'Progress Updated',
          description: `"${topic.name}" marked as completed.`,
          variant: 'default'
        });
      } else {
        throw new Error(response?.message || 'Failed to update progress');
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress. Try again.',
        variant: 'destructive'
      });
    }
  };

  const refreshEnrollmentAndProgress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      if (enrollmentResponse.success && enrollmentResponse.enrollments) {
        const streamEnrollment = enrollmentResponse.enrollments.find(
          (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );
        if (streamEnrollment) {
          setEnrollment(streamEnrollment);
          setTopicProgress((streamEnrollment.topicProgress || []).map((tp: any) => ({
            courseId: String(tp.courseId),
            topicName: tp.topicName,
            watched: !!tp.watched,
            watchedDuration: Number(tp.watchedDuration || 0),
            lastWatchedAt: tp.lastWatchedAt
          })));
          await checkExamEligibility(streamEnrollment);
        }
      }
    } catch (err) {
      console.error('Error refreshing enrollment:', err);
    }
  };

  const calculateNewProgress = (completedTopic: Topic) => {
    // compute based on topicProgress (watched count / total topics)
    const courseTopics = selectedCourse?.topics || [];
    const currentWatchedCount = topicProgress.filter(tp => 
      tp.courseId === selectedCourse?._id && tp.watched
    ).length;
    
    const newWatchedCount = currentWatchedCount + 1;
    const percent = Math.round((newWatchedCount / courseTopics.length) * 100);
    return percent;
  };

  const handleManualComplete = async (topic: Topic) => {
    // Use topic.duration * 60 seconds if no better info
    const seconds = topic.duration * 60;
    await markTopicAsCompleted(topic, seconds);
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsTrackingProgress(false);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedTopic(null);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsTrackingProgress(false);
    watchedSecondsRef.current = 0;
    setVideoProgressPercent(0);
  };

  const getTopicProgress = (courseId: string, topicName: string) => {
    return topicProgress.find(
      tp => String(tp.courseId) === String(courseId) && tp.topicName === topicName
    );
  };

  const getCourseProgress = (courseId: string) => {
    const courseTopics = topicProgress.filter(tp => String(tp.courseId) === String(courseId));
    const watchedTopics = courseTopics.filter(tp => tp.watched).length;
    const totalTopics = courses.find(c => c._id === courseId)?.topics?.length || 0;
    if (totalTopics === 0) return 0;
    return Math.round((watchedTopics / totalTopics) * 100);
  };

  if (loading) {
    // keep original skeleton/loader approach (not modifying UI)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedCourse?.courseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCourse?.topics?.map((topic) => {
                    const tp = getTopicProgress(selectedCourse._id, topic.name);
                    return (
                      <div key={topic.name} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-semibold">{topic.name}</div>
                          <div className="text-sm text-gray-500">{topic.duration} minutes</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{tp?.watched ? 'Completed' : 'Not started'}</Badge>
                          <Button onClick={() => handleTopicClick(topic)}><Play className="mr-2" /> Play</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Stream Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">Course progress</div>
                  {selectedCourse && (
                    <Progress value={getCourseProgress(selectedCourse._id)} />
                  )}
                  <div className="mt-4 text-sm">
                    Total watched: {enrollment?.totalWatchedPercentage ?? 0}%
                  </div>
                  <div className="mt-2">
                    <Button onClick={() => {
                      if (enrollment?.totalWatchedPercentage >= 80) {
                        toast({
                          title: 'Eligible',
                          description: 'You are eligible for the exam.',
                          variant: 'default'
                        });
                      } else {
                        toast({
                          title: 'Not Eligible',
                          description: 'Complete more to be eligible.',
                          variant: 'destructive'
                        });
                      }
                    }}>Check Exam Eligibility</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={val => { if (!val) handleCloseModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTopic?.name}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Instead of embedding heavy player logic, keep existing UI. The tracking is handled in the interval above. */}
            <div className="w-full h-64 bg-black flex items-center justify-center text-white">
              <div>
                Video placeholder — playing: {selectedTopic?.name}
                <div className="mt-2">Progress: {videoProgressPercent}%</div>
                <div className="mt-2">
                  <Button onClick={() => handleManualComplete(selectedTopic!)}>Mark as Completed</Button>
                  <Button variant="ghost" onClick={handleCloseModal} className="ml-2">Close</Button>
                </div>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamLearningInterface;
