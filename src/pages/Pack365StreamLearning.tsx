/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Award,
  BookCopy,
  BarChart2,
  Users,
  FileText,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// --- Interfaces for Type Safety ---
interface Course {
  _id?: string;
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number; // in minutes or seconds depending on backend (frontend uses whatever backend provides)
  topics: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  stream: string;
  documentLink?: string;
}

interface TopicProgressItem {
  courseId: any; // could be ObjectId or string
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface StreamEnrollment {
  stream: string;
  enrollmentDate: string;
  expiresAt: string;
  totalWatchedPercentage: number;
  isExamCompleted: boolean;
  examScore: number | null;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Array<any>; // from backend summary; replaced by merged courses with topics
  topicProgress: TopicProgressItem[];
  totalCourseDuration?: number; // in same unit as course.totalDuration
}

// --- Helper Components ---
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * Math.max(0, Math.min(100, percentage))) / 100;

  return (
    <div className="relative w-32 h-32">
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="text-gray-200"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          stroke="currentColor"
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            strokeLinecap: 'round',
          }}
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-64"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-48"></div>
          </div>
          {/* Courses Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm h-40"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Pack365StreamLearning = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStreamEnrollment = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Fetch enrollments
        const response = await pack365Api.getMyEnrollments(token);

        if (!(response && response.success && response.enrollments)) {
          toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
          navigate('/pack365');
          return;
        }

        const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
        const currentEnrollment = streamEnrollments.find(
          (e) => e.stream && e.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (!currentEnrollment) {
          toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
          navigate('/pack365');
          return;
        }

        // Fetch all courses (authoritative data with topics)
        const coursesResponse = await pack365Api.getAllCourses();
        const coursesData: Course[] = (coursesResponse && coursesResponse.success && coursesResponse.data) ? coursesResponse.data : [];

        const streamCourses = coursesData.filter((c) => String(c.stream || '').toLowerCase() === stream?.toLowerCase());
        setAllCourses(streamCourses);

        // Build mapping for course._id (or _id) -> course
        const courseById = new Map<string, Course>();
        streamCourses.forEach(c => {
          const key = String(c._id || '');
          courseById.set(key, c);
        });

        // Compute stream totals
        const totalTopicsInStream = streamCourses.reduce((sum, c) => sum + (c.topics?.length || 0), 0);
        const totalStreamDuration = streamCourses.reduce((sum, c) => sum + (c.totalDuration || 0), 0);

        // Compute watched durations and watched topics from enrollment.topicProgress
        const topicProgress = currentEnrollment.topicProgress || [];
        let watchedTopicsInStream = 0;
        let watchedDurationInStream = 0;

        for (const tp of topicProgress) {
          // tp.courseId may be object or string
          const tpCourseId = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
          if (courseById.has(tpCourseId)) {
            if (tp.watched) watchedTopicsInStream += 1;
            watchedDurationInStream += Number(tp.watchedDuration || 0);
          }
        }

        const durationPercent = totalStreamDuration > 0 ? (watchedDurationInStream / totalStreamDuration) * 100 : null;
        const topicPercent = totalTopicsInStream > 0 ? (watchedTopicsInStream / totalTopicsInStream) * 100 : 0;
        const accurateProgress = durationPercent !== null ? durationPercent : topicPercent;
        const normalizedProgress = Math.max(0, Math.min(100, accurateProgress || 0));

        // Merge course data so UI can show topics and per-course progress
        const mergedCourses = streamCourses.map(course => {
          const courseIdStr = String(course._id || '');
          // Topic progress for this course
          const courseTopicProgress = (topicProgress || []).filter(tp => {
            const tpCourseId = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
            return tpCourseId === courseIdStr;
          });

          const watchedTopics = courseTopicProgress.filter(tp => tp.watched).length;
          const watchedDuration = courseTopicProgress.reduce((s, t) => s + (t.watchedDuration || 0), 0);
          const courseDuration = course.totalDuration || 0;
          const coursePercent = courseDuration > 0 ? (watchedDuration / courseDuration) * 100 : (course.topics?.length ? (watchedTopics / (course.topics.length || 1)) * 100 : 0);

          return {
            ...course,
            _internalWatchedTopics: watchedTopics,
            _internalWatchedDuration: watchedDuration,
            _internalPercent: Math.max(0, Math.min(100, coursePercent || 0)),
            _internalTotalTopics: course.topics?.length || 0
          };
        });

        // Enhance enrollment for UI
        const enhancedEnrollment: StreamEnrollment = {
          ...currentEnrollment,
          courses: mergedCourses,
          totalTopics: totalTopicsInStream,
          watchedTopics: watchedTopicsInStream,
          totalWatchedPercentage: Math.round(normalizedProgress * 100) / 100,
          coursesCount: streamCourses.length,
          totalCourseDuration: totalStreamDuration
        };

        setEnrollment(enhancedEnrollment);
      } catch (error: any) {
        console.error('Error fetching stream enrollment:', error);
        toast({ title: 'Error', description: 'Failed to load enrollment details.', variant: 'destructive' });
        navigate('/pack365');
      } finally {
        setLoading(false);
      }
    };

    fetchStreamEnrollment();
  }, [stream]);

  const refreshEnrollment = async () => {
    // re-run the same logic to refresh enrollment after updates
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await pack365Api.getMyEnrollments(token);
      if (!(response && response.success && response.enrollments)) return;
      const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
      const currentEnrollment = streamEnrollments.find(
        (e) => e.stream && e.stream.toLowerCase() === stream?.toLowerCase()
      );
      if (!currentEnrollment) return;

      // get all courses
      const coursesResponse = await pack365Api.getAllCourses();
      const coursesData: Course[] = (coursesResponse && coursesResponse.success && coursesResponse.data) ? coursesResponse.data : [];
      const streamCourses = coursesData.filter((c) => String(c.stream || '').toLowerCase() === stream?.toLowerCase());
      setAllCourses(streamCourses);

      const courseById = new Map<string, Course>();
      streamCourses.forEach(c => {
        const key = String(c._id || '');
        courseById.set(key, c);
      });

      const totalTopicsInStream = streamCourses.reduce((sum, c) => sum + (c.topics?.length || 0), 0);
      const totalStreamDuration = streamCourses.reduce((sum, c) => sum + (c.totalDuration || 0), 0);

      // Compute watched durations and watched topics from enrollment.topicProgress
      const topicProgress = currentEnrollment.topicProgress || [];
      let watchedTopicsInStream = 0;
      let watchedDurationInStream = 0;

      for (const tp of topicProgress) {
        const tpCourseId = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
        if (courseById.has(tpCourseId)) {
          if (tp.watched) watchedTopicsInStream += 1;
          watchedDurationInStream += Number(tp.watchedDuration || 0);
        }
      }

      const durationPercent = totalStreamDuration > 0 ? (watchedDurationInStream / totalStreamDuration) * 100 : null;
      const topicPercent = totalTopicsInStream > 0 ? (watchedTopicsInStream / totalTopicsInStream) * 100 : 0;
      const accurateProgress = durationPercent !== null ? durationPercent : topicPercent;
      const normalizedProgress = Math.max(0, Math.min(100, accurateProgress || 0));

      const mergedCourses = streamCourses.map(course => {
        const courseIdStr = String(course._id || '');
        const courseTopicProgress = (topicProgress || []).filter(tp => {
          const tpCourseId = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
          return tpCourseId === courseIdStr;
        });

        const watchedTopics = courseTopicProgress.filter(tp => tp.watched).length;
        const watchedDuration = courseTopicProgress.reduce((s, t) => s + (t.watchedDuration || 0), 0);
        const courseDuration = course.totalDuration || 0;
        const coursePercent = courseDuration > 0 ? (watchedDuration / courseDuration) * 100 : (course.topics?.length ? (watchedTopics / (course.topics.length || 1)) * 100 : 0);

        return {
          ...course,
          _internalWatchedTopics: watchedTopics,
          _internalWatchedDuration: watchedDuration,
          _internalPercent: Math.max(0, Math.min(100, coursePercent || 0)),
          _internalTotalTopics: course.topics?.length || 0
        };
      });

      const enhancedEnrollment: StreamEnrollment = {
        ...currentEnrollment,
        courses: mergedCourses,
        totalTopics: totalTopicsInStream,
        watchedTopics: watchedTopicsInStream,
        totalWatchedPercentage: Math.round(normalizedProgress * 100) / 100,
        coursesCount: streamCourses.length,
        totalCourseDuration: totalStreamDuration
      };

      setEnrollment(enhancedEnrollment);
    } catch (err) {
      console.error('refreshEnrollment error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseStart = (course: Course) => {
    navigate(`/pack365-learning/${stream}/course`, {
      state: {
        selectedCourse: course,
        selectedCourseId: course.courseId,
        streamName: stream,
        enrollment: enrollment
      }
    });
  };

  const handlePlayTopic = (course: Course, topicIndex: number) => {
    // Navigate to course player and include topic index so player can start specific topic
    navigate(`/pack365-learning/${stream}/course`, {
      state: {
        selectedCourse: course,
        selectedCourseId: course.courseId,
        streamName: stream,
        startTopicIndex: topicIndex,
        enrollment: enrollment
      }
    });
  };

  const handleMarkTopicWatched = async (course: Course, topicName: string, topicDuration: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Prepare payload expected by backend: courseId (custom courseId), topicName, watchedDuration, totalCourseDuration, totalWatchedPercentage
      // Compute new watchedDuration and total watched across stream
      const courseId = course.courseId; // backend expects custom courseId (string)
      const totalCourseDuration = enrollment?.totalCourseDuration || 0;

      // local compute new totals using existing enrollment data
      const currentTopicProgress = enrollment?.topicProgress || [];
      const streamCourseEntries = allCourses.filter(c => String(c.stream || '').toLowerCase() === stream?.toLowerCase());
      const streamCourseIds = new Set(streamCourseEntries.map(c => String(c._id || '')));

      // Calculate watchedDurationInStream currently
      let watchedDurationInStream = 0;
      for (const tp of currentTopicProgress) {
        const tpCourseIdStr = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
        if (streamCourseIds.has(tpCourseIdStr)) {
          watchedDurationInStream += Number(tp.watchedDuration || 0);
        }
      }

      // Add this topic's duration (but avoid double-counting if already watched)
      const courseTopicEntry = currentTopicProgress.find(tp => {
        const tpCourseIdStr = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
        const courseObjId = String(course._id || '');
        return tpCourseIdStr === courseObjId && tp.topicName === topicName;
      });

      let additional = topicDuration;
      if (courseTopicEntry && courseTopicEntry.watched) {
        additional = 0; // already watched
      } else if (courseTopicEntry && !courseTopicEntry.watched) {
        // If some watchedDuration exists, mark additional as remaining time
        additional = Math.max(0, topicDuration - (courseTopicEntry.watchedDuration || 0));
      }

      const newWatchedDurationInStream = watchedDurationInStream + additional;
      const newTotalWatchedPercent = totalCourseDuration > 0 ? (newWatchedDurationInStream / totalCourseDuration) * 100 : null;

      const payload: any = {
        courseId: courseId,
        topicName,
        watchedDuration: topicDuration, // server uses Math.max(existing, payload) for watchedDuration
      };

      if (typeof totalCourseDuration === 'number') {
        payload.totalCourseDuration = totalCourseDuration;
      }
      if (typeof newTotalWatchedPercent === 'number') {
        payload.totalWatchedPercentage = Math.round(Math.max(0, Math.min(100, newTotalWatchedPercent)) * 100) / 100;
      }

      const res = await pack365Api.updateTopicProgress(payload, token);
      if (res && res.success) {
        toast({ title: 'Marked as watched', description: 'Progress updated', variant: 'default' });
        // Refresh enrollment to reflect backend-canonical state
        await refreshEnrollment();
      } else {
        toast({ title: 'Could not update progress', description: res?.message || 'Try again later', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('handleMarkTopicWatched error', err);
      toast({ title: 'Error', description: 'Failed to update topic progress.', variant: 'destructive' });
    }
  };

  const handleTakeExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 80) {
      navigate(`/exam/${stream}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete at least 80% of the stream to take the exam.',
        variant: 'destructive'
      });
    }
  };

  const handleTakeFinalExam = () => {
    if (enrollment && enrollment.totalWatchedPercentage >= 100) {
      navigate(`/exam/${stream}/final`);
    } else {
      toast({
        title: 'Not Eligible',
        description: 'You need to complete 100% of the stream to take the final exam.',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourseIds(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Enrollment Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find your enrollment details for this stream.</p>
          <Button onClick={() => navigate('/pack365')}>Browse Streams</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/pack365-dashboard')}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{stream} Stream</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey</p>
          </div>

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* --- Left Sidebar (Sticky) --- */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-blue-600" />
                    Stream Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <CircularProgress percentage={enrollment.totalWatchedPercentage || 0} />
                  <p className="text-gray-600 mt-4">Overall Completion (duration-based)</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4" />Enrolled On</span>
                    <span className="font-semibold text-gray-800">{formatDate(enrollment.enrollmentDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><BookOpen className="h-4 w-4" />Total Courses</span>
                    <span className="font-semibold text-gray-800">{enrollment.coursesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><BookCopy className="h-4 w-4" />Topics</span>
                    <span className="font-semibold text-gray-800">{enrollment.totalTopics}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><Users className="h-4 w-4" />Access Until</span>
                    <span className="font-semibold text-gray-800">{formatDate(enrollment.expiresAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Eligibility Cards */}
              {enrollment.totalWatchedPercentage >= 80 && (
                <Card className="shadow-md bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6" />
                      Ready for Exam!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-green-100">
                      You've completed enough of the stream to take the exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-green-600 hover:bg-green-50"
                      onClick={handleTakeExam}
                    >
                      Take Stream Exam
                    </Button>
                  </CardContent>
                </Card>
              )}

              {enrollment.totalWatchedPercentage >= 100 && (
                <Card className="shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6" />
                      Final Exam Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-purple-100">
                      You've completed all courses! Take the final comprehensive exam.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-purple-600 hover:bg-purple-50"
                      onClick={handleTakeFinalExam}
                    >
                      Take Final Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>

            {/* --- Right Content (Course List) --- */}
            <main className="lg:col-span-2 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>Select a course below to start learning or inspect topics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrollment.courses && enrollment.courses.length > 0 ? (
                    enrollment.courses.map((course: any) => (
                      <div key={course.courseId} className="border bg-white rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{course.courseName}</h3>
                                <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                              </div>
                              <Badge variant="secondary" className="ml-4">
                                {course._internalTotalTopics ?? course.topics?.length ?? 0} topics
                              </Badge>
                            </div>

                            {/* Per-course progress bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{course.totalDuration} minutes</span>
                                </div>
                                <div className="text-sm font-medium">
                                  {Math.round(course._internalPercent ?? 0)}%
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.max(0, Math.min(100, course._internalPercent || 0))}%` }}
                                />
                              </div>
                            </div>

                            {/* Expand topics */}
                            <div className="mt-4">
                              <button
                                onClick={() => toggleCourseExpand(String(course._id || course.courseId))}
                                className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                              >
                                {expandedCourseIds[String(course._id || course.courseId)] ? <><ChevronUp className="h-4 w-4" /> Hide topics</> : <><ChevronDown className="h-4 w-4" /> View topics</>}
                              </button>

                              {expandedCourseIds[String(course._id || course.courseId)] && (
                                <div className="mt-3 space-y-2">
                                  {course.topics && course.topics.length > 0 ? (
                                    course.topics.map((topic: any, idx: number) => {
                                      // Find topic progress
                                      const topicProg = (enrollment.topicProgress || []).find((tp) => {
                                        const tpCourseIdStr = String((tp.courseId && (tp.courseId._id || tp.courseId)) || tp.courseId || '');
                                        const courseObjId = String(course._id || '');
                                        return tpCourseIdStr === courseObjId && tp.topicName === topic.name;
                                      });

                                      const watched = !!(topicProg && topicProg.watched);
                                      return (
                                        <div key={`${course.courseId}-topic-${idx}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${watched ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                              {watched ? <CheckCircle2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            </div>
                                            <div>
                                              <div className="text-sm font-medium">{topic.name}</div>
                                              <div className="text-xs text-gray-500">{topic.duration} mins</div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => handlePlayTopic(course, idx)}>
                                              <Play className="h-4 w-4 mr-2" />
                                              Play
                                            </Button>
                                            {!watched && (
                                              <Button size="sm" variant="secondary" onClick={() => handleMarkTopicWatched(course, topic.name, Number(topic.duration || 0))}>
                                                Mark Watched
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-gray-500">No topics available for this course.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-end gap-3">
                            <Button onClick={() => handleCourseStart(course)} variant="default">
                              <Play className="h-4 w-4 mr-2" />
                              Start Learning
                            </Button>
                            {course.documentLink && (
                              <a href={course.documentLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                                <FileText className="h-4 w-4 inline mr-1" />
                                Resources
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Available</h3>
                      <p className="text-gray-500">Courses for this stream are being prepared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stream Progress Summary */}
              <Card className="shadow-md mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Stream Completion Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Minimum completion for exam:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 80 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 80 ? 'Eligible' : '80% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current progress:</span>
                      <span className="text-sm font-medium">{Math.round(enrollment.totalWatchedPercentage)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Final exam eligibility:</span>
                      <Badge variant={enrollment.totalWatchedPercentage >= 100 ? "default" : "secondary"}>
                        {enrollment.totalWatchedPercentage >= 100 ? 'Eligible' : '100% Required'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exam status:</span>
                      <Badge variant={enrollment.isExamCompleted ? "default" : "outline"}>
                        {enrollment.isExamCompleted ? `Completed (${enrollment.examScore}%)` : 'Not Taken'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Topics completed:</span>
                      <span className="text-sm font-medium">{enrollment.watchedTopics}/{enrollment.totalTopics}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total stream duration (mins):</span>
                      <span className="text-sm font-medium">{Math.round((enrollment.totalCourseDuration || 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365StreamLearning;
