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
  Calendar,
  GraduationCap,
  BookCopy,
  Users,
  FileText
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

// --- Interfaces for Type Safety ---
interface Course {
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topicsCount: number;
  _id: string;
  stream: string;
  topics: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  documentLink?: string;
  progress?: any;
}

interface CourseProgressFromServer {
  courseId?: string | { toString?: () => string } | any;
  totalTopics?: number;
  watchedTopics?: number;
  isCompleted?: boolean;
  completionPercentage?: number;
  // exam-related fields that backend might provide (names vary)
  isExamPassed?: boolean;
  isPassed?: boolean;
  examStatus?: string;
  bestScore?: number;
  passingScore?: number;
  examHistory?: any;
}

interface EnrollmentCourseFromServer {
  courseId?: string;
  courseName?: string;
  description?: string;
  topicsCount?: number;
  progress?: CourseProgressFromServer | null;
}

interface StreamEnrollment {
  _id?: string;
  stream?: string;
  enrollmentDate: string;
  expiresAt: string;
  coursesCount: number;
  totalTopics: number;
  courses?: EnrollmentCourseFromServer[];
  // keep any other fields that backend may return (like examAttempts, etc.)
  totalWatchedPercentage?: number;
  isExamCompleted?: boolean; // stream-level flag if available
  [key: string]: any;
}

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
        
        if (response.success && response.enrollments) {
          const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
          const currentEnrollment = streamEnrollments.find(
            (e) => (e.stream || '').toString().toLowerCase() === (stream || '').toLowerCase()
          );

          if (currentEnrollment) {
            // Fetch all courses to get complete course data
            const coursesResponse = await pack365Api.getAllCourses();
            if (coursesResponse.success && coursesResponse.data) {
              const streamCourses = coursesResponse.data.filter(
                (course: Course) => (course.stream || '').toString().toLowerCase() === (stream || '').toLowerCase()
              );

              // Merge server-side course progress (if available) into the UI course list
              const mergedCourses = streamCourses.map((course: Course) => {
                // Try to find matching entry from the enrollment returned by the server
                const serverCourseEntry = (currentEnrollment.courses || []).find((c: EnrollmentCourseFromServer) => {
                  const serverCourseIdStr = c?.courseId ?? (c?.progress?.courseId ? (c.progress.courseId.toString?.() ?? '') : '');
                  const uiCourseIdStr = course.courseId ?? course._id;
                  try {
                    return String(serverCourseIdStr) === String(uiCourseIdStr) || String(serverCourseIdStr) === String(course._id) || String(serverCourseIdStr) === String(course.courseId);
                  } catch {
                    return false;
                  }
                });

                // prefer progress from serverCourseEntry.progress if available
                const progressFromServer: CourseProgressFromServer | undefined = serverCourseEntry?.progress;

                return {
                  ...course,
                  // attach a progress field that the UI can read
                  progress: progressFromServer ? {
                    totalTopics: progressFromServer.totalTopics ?? course.topics?.length ?? 0,
                    watchedTopics: progressFromServer.watchedTopics ?? 0,
                    isCompleted: !!progressFromServer.isCompleted,
                    completionPercentage: progressFromServer.completionPercentage ?? 0,
                    isExamPassed: progressFromServer.isExamPassed ?? progressFromServer.isPassed ?? false,
                    // keep other exam fields for robust checking
                    examStatus: progressFromServer.examStatus,
                    bestScore: progressFromServer.bestScore,
                    passingScore: progressFromServer.passingScore,
                    examHistory: progressFromServer.examHistory
                  } : undefined
                };
              });

              // Calculate total topics based on the streamCourses
              let totalTopicsInStream = 0;
              streamCourses.forEach((course: Course) => {
                const courseTopics = course.topics?.length || 0;
                totalTopicsInStream += courseTopics;
              });

              const enhancedEnrollment: StreamEnrollment = {
                ...currentEnrollment,
                courses: mergedCourses.map((c: any) => ({
                  courseId: c.courseId,
                  courseName: c.courseName,
                  description: c.description,
                  topicsCount: c.topics?.length || 0,
                  progress: c.progress || null
                })),
                totalTopics: totalTopicsInStream,
                coursesCount: streamCourses.length
              };

              setAllCourses(streamCourses);
              setEnrollment(enhancedEnrollment);
            } else {
              // fallback: no courses returned but we have enrollment
              setEnrollment(currentEnrollment);
            }
          } else {
            toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
            navigate('/pack365');
          }
        } else {
          toast({ title: 'Access Denied', description: 'You are not enrolled in this stream.', variant: 'destructive' });
          navigate('/pack365');
        }
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

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

  // Helper: robust detection whether a course's exam is passed
  const isCourseExamPassed = (course: any) => {
    const p = course.progress || {};

    // 1) Direct booleans (common)
    if (p.isExamPassed === true) return true;
    if (p.isPassed === true) return true;

    // 2) String statuses
    if (typeof p.examStatus === 'string') {
      const s = p.examStatus.toLowerCase();
      if (s === 'passed' || s === 'pass' || s === 'cleared') return true;
    }

    // 3) examHistory flags
    if (p.examHistory && typeof p.examHistory === 'object') {
      if (p.examHistory.isPassed === true) return true;
      // sometimes examHistory.bestAttempt or attempts array
      if (Array.isArray(p.examHistory.attempts)) {
        const last = p.examHistory.attempts[p.examHistory.attempts.length - 1];
        if (last && last.isPassed) return true;
      }
    }

    // 4) numeric scores: bestScore and passingScore
    if (typeof p.bestScore === 'number' && typeof p.passingScore === 'number') {
      if (p.bestScore >= p.passingScore) return true;
    }

    // 5) course-level top-level flags (in case backend attaches directly)
    if (course.isExamPassed === true) return true;
    if (course.isPassed === true) return true;

    // Not passed as far as we can detect
    return false;
  };

  // Helper to determine completion and exam status for a course (UI only)
  const getCourseStatus = (course: Course & { progress?: CourseProgressFromServer | any }) => {
    const progress = course.progress;
    const completionPercentage = typeof progress?.completionPercentage === 'number'
      ? progress.completionPercentage
      : // fallback compute from topics (if progress missing, try to guess 0)
        0;
    const isCompleted = completionPercentage === 100 || !!progress?.isCompleted;
    const isExamPassed = isCourseExamPassed(course);
    return {
      completionPercentage,
      isCompleted,
      isExamPassed
    };
  };

  const getExamStatusForCourse = (course: Course & { progress?: CourseProgressFromServer | any }) => {
    const { isCompleted, isExamPassed } = getCourseStatus(course);
    if (isCompleted && isExamPassed) return { label: 'Passed', color: 'green' };
    if (isCompleted && !isExamPassed) return { label: 'Exam Pending', color: 'yellow' };
    return { label: 'Locked', color: 'gray' };
  };

  // Determine if certificate button should be displayed:
  // Criteria: all courses completed AND all exams passed (robust detection)
  const canShowCertificate = () => {
    if (!enrollment?.courses || enrollment.courses.length === 0) return false;

    const courseEntries = enrollment.courses as any[];

    // All courses must be completed (progress.completionPercentage >= 100 or isCompleted flag)
    const allCompleted = courseEntries.every((c: any) => {
      const completion = typeof c.progress?.completionPercentage === 'number' ? c.progress.completionPercentage : (c.progress?.isCompleted ? 100 : 0);
      return completion >= 100 || !!c.progress?.isCompleted;
    });

    // All exams passed (use robust helper)
    const allExamsPassed = courseEntries.every((c: any) => isCourseExamPassed(c)) || !!enrollment.isExamCompleted;

    return allCompleted && allExamsPassed;
  };

  // If pack365 server provides an enrollment id field, prefer that when navigating to certificate
  const enrollmentIdForCertificate = (enrollment._id || (enrollment as any).enrollmentId || '');

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{stream} Stream</h1>
              <p className="text-gray-600 mt-2">Continue your learning journey</p>
            </div>

            {/* Show Certificate button when eligible */}
            <div className="flex items-center gap-4">
              {canShowCertificate() && enrollmentIdForCertificate && (
                <Button
                  onClick={() => navigate(`/pack365-certificate/${enrollmentIdForCertificate}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Get Certificate
                </Button>
              )}
            </div>
          </div>

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- Left Sidebar (Sticky) --- */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4"/>Enrolled On</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.enrollmentDate)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookOpen className="h-4 w-4"/>Total Courses</span>
                      <span className="font-semibold text-gray-800">{enrollment.coursesCount}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><BookCopy className="h-4 w-4"/>Total Topics</span>
                      <span className="font-semibold text-gray-800">{enrollment.totalTopics}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2"><Users className="h-4 w-4"/>Access Until</span>
                      <span className="font-semibold text-gray-800">{formatDate(enrollment.expiresAt)}</span>
                   </div>
                </CardContent>
              </Card>
            </aside>

            {/* --- Right Content (Course List) --- */}
            <main className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Courses in this Stream</CardTitle>
                  <CardDescription>Select a course below to start learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {enrollment.courses && enrollment.courses.length > 0 ? (
                    enrollment.courses.map((course: any) => {
                      // course here is the merged item (contains progress if server provided)
                      const uiCourse = allCourses.find(c => String(c.courseId) === String(course.courseId) || String(c._id) === String(course.courseId)) || (course as any);
                      // prefer uiCourse (full course object) but also copy progress from enrollment.course entry
                      const merged = {
                        ...uiCourse,
                        courseId: uiCourse.courseId ?? course.courseId,
                        courseName: uiCourse.courseName ?? course.courseName,
                        description: uiCourse.description ?? course.description,
                        topics: uiCourse.topics ?? [],
                        totalDuration: uiCourse.totalDuration ?? uiCourse.totalDuration ?? 0,
                        progress: course.progress ?? (uiCourse as any).progress ?? null
                      };

                      const { completionPercentage, isCompleted, isExamPassed } = getCourseStatus(merged);
                      const examStatus = getExamStatusForCourse(merged);

                      return (
                        <div key={merged.courseId || merged._id} className="border bg-white rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-800 text-lg">{merged.courseName}</h3>
                                <Badge variant="secondary">
                                  {merged.topics?.length || 0} topics
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{merged.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" /> 
                                  {merged.totalDuration} minutes
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="h-4 w-4" /> 
                                  {merged.topics?.length || 0} topics
                                </span>
                                {merged.documentLink && (
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" /> 
                                    Resources
                                  </span>
                                )}

                                {/* --- Selection square area: show Course Status & Exam Status --- */}
                                <div className="ml-4">
                                  <div className="w-56 border rounded-md p-3 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-gray-500">Course Status</span>
                                      <span className={`text-xs font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                                        {isCompleted ? 'Completed' : `${completionPercentage}%`}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Exam Status</span>
                                      <span className={`text-xs font-semibold ${examStatus.color === 'green' ? 'text-green-700' : examStatus.color === 'yellow' ? 'text-yellow-700' : 'text-gray-700'}`}>
                                        {examStatus.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3">
                              <Button 
                                onClick={() => handleCourseStart(merged)}
                                className="w-full sm:w-auto flex-shrink-0"
                                variant="default"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Learning
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Available</h3>
                      <p className="text-gray-500">Courses for this stream are being prepared.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stream Information */}
              <Card className="shadow-md mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Stream Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total courses in stream:</span>
                      <span className="text-sm font-medium">{enrollment.coursesCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total topics available:</span>
                      <span className="text-sm font-medium">{enrollment.totalTopics}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Access expires:</span>
                      <span className="text-sm font-medium">{formatDate(enrollment.expiresAt)}</span>
                    </div>
                    {canShowCertificate() && enrollmentIdForCertificate && (
                      <div className="mt-4">
                        <Button
                          onClick={() => navigate(`/pack365-certificate/${enrollmentIdForCertificate}`)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Download Stream Certificate
                        </Button>
                      </div>
                    )}
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
