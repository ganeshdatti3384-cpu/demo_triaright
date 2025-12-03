import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, CheckCircle, Clock, Award, FileText, GraduationCap, ArrowLeft, Home } from "lucide-react";

type Subtopic = {
  name: string;
  link?: string;
  duration?: number;
};

type Topic = {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
};

type CourseModel = {
  _id: string;
  courseId?: string;
  courseName: string;
  courseDescription?: string;
  curriculum: Topic[];
  demoVideoLink?: string;
  totalDuration?: number;
  courseImageLink?: string;
  price?: number;
  courseType?: string;
  stream?: string;
  hasFinalExam?: boolean;
};

type EnrollmentProgressSubtopic = {
  subTopicName: string;
  subTopicLink?: string;
  watchedDuration: number;
  totalDuration: number;
};

type EnrollmentProgressTopic = {
  topicName: string;
  subtopics: EnrollmentProgressSubtopic[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
  completed?: boolean;
};

type EnrollmentModel = {
  _id?: string;
  courseId: string | { _id?: string };
  userId?: string;
  isPaid?: boolean;
  amountPaid?: number;
  progress: EnrollmentProgressTopic[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible?: boolean;
  finalExamAttempted?: boolean;
  courseCompleted?: boolean;
  completedAt?: string;
  enrollmentDate?: string;
  accessExpiresAt?: string;
  videoProgressPercent?: number;
  courseName?: string;
  courseImageLink?: string;
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const CourseLearningInterface: React.FC = () => {
  const { id: courseIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [showTopicExamModal, setShowTopicExamModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [showFinalExamModal, setShowFinalExamModal] = useState(false);
  const [finalExam, setFinalExam] = useState<any | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);

  const courseId = courseIdParam;

  // fetch course details + enrollment
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!courseId) {
          toast({ title: "Error", description: "Course not specified", variant: "destructive" });
          return;
        }

        console.log("🔍 Loading course data for ID:", courseId);

        // 1) fetch course directly
        try {
          const courseResp = await axios.get(
            `${API_BASE_URL}/courses/${courseId}`
          );
          
          console.log('Course API response:', courseResp.data);
          
          if (courseResp.data && courseResp.data.course) {
            console.log('✅ Course found:', courseResp.data.course.courseName);
            setCourse(courseResp.data.course);
          } else {
            console.error('❌ Course not found in response');
            toast({ 
              title: "Course not found", 
              description: "This course doesn't exist or was removed", 
              variant: "destructive" 
            });
            navigate("/student");
            return;
          }
        } catch (courseErr: any) {
          console.error("Failed to fetch course:", courseErr);
          toast({ 
            title: "Error", 
            description: "Failed to load course details", 
            variant: "destructive" 
          });
          navigate("/student");
          return;
        }

        // 2) fetch enrollment for logged-in user
        if (token) {
          try {
            console.log("📊 Fetching enrollments for user...");
            
            // Get all enrollments and find the one for this course
            const enrollResp = await axios.get(
              `${API_BASE_URL}/courses/enrollment/allcourses`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            console.log('All enrollments response:', enrollResp.data);
            
            if (enrollResp.data && enrollResp.data.success && enrollResp.data.enrollments) {
              // Find the enrollment for this specific course
              const courseEnrollment = enrollResp.data.enrollments.find(
                (enr: any) => {
                  // Check different possible structures for courseId
                  const enrCourseId = enr.courseId;
                  return (
                    enrCourseId === courseId || 
                    enrCourseId?._id === courseId ||
                    enrCourseId?._id?.toString() === courseId
                  );
                }
              );
              
              if (courseEnrollment) {
                console.log('✅ Found enrollment for this course:', courseEnrollment);
                setEnrollment(courseEnrollment);
              } else {
                console.log('ℹ️ Not enrolled in this course');
                setEnrollment(null);
              }
            } else {
              console.log('ℹ️ No enrollments found');
              setEnrollment(null);
            }
          } catch (err: any) {
            console.error("Error fetching enrollments", err);
            if (err.response?.status !== 404) {
              toast({ 
                title: "Error", 
                description: "Failed to load enrollment data", 
                variant: "destructive" 
              });
            }
            setEnrollment(null);
          }
        } else {
          console.log('ℹ️ No token found, user not logged in');
          setEnrollment(null);
        }
      } catch (err: any) {
        console.error("Failed to load course", err);
        toast({ 
          title: "Error", 
          description: "Failed to load course details", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, token]);

  // helper: compute overall video progress percent
  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
    if (enrollment.videoProgressPercent !== undefined) {
      return enrollment.videoProgressPercent;
    }
    if (!enrollment.totalVideoDuration || enrollment.totalVideoDuration === 0) return 0;
    return Math.floor((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100);
  }, [enrollment]);

  // Open learning: if not enrolled navigate to enrollment page, else expand UI to show content
  const handleStartLearning = () => {
    if (!token) {
      toast({ title: "Login required", description: "Please login to start learning", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!enrollment) {
      // navigate to course enrollment page
      navigate(`/course-enrollment/${courseId}`);
      return;
    }
    // scroll to content or expand - we set playingSubtopic to first available subtopic
    if (course && course.curriculum && course.curriculum.length > 0) {
      const firstTopic = course.curriculum[0];
      if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
        setPlayingSubtopic({ topicIndex: 0, subIndex: 0 });
        const first = firstTopic.subtopics[0];
        if (first?.link) {
          setPlayerUrl(first.link);
        }
      }
    }
  };

  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;
    const topic = course.curriculum[tIndex];
    if (!topic || !topic.subtopics || sIndex >= topic.subtopics.length) return;
    
    const sub = topic.subtopics[sIndex];
    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });
    setPlayerUrl(sub.link || null);
  };

  // mark subtopic as watched (set watchedDuration to totalDuration of subtopic)
  const markSubtopicWatched = async (tIndex: number, sIndex: number) => {
    if (!enrollment || !course || !token) {
      toast({ title: "Error", description: "You must be enrolled to update progress", variant: "destructive" });
      return;
    }

    const topic = course.curriculum[tIndex];
    if (!topic || !topic.subtopics || sIndex >= topic.subtopics.length) {
      toast({ title: "Error", description: "Subtopic not found", variant: "destructive" });
      return;
    }
    
    const sub = topic.subtopics[sIndex];
    
    if (!sub) {
      toast({ title: "Error", description: "Subtopic not found", variant: "destructive" });
      return;
    }

    // Use the correct API endpoint from your backend
    const payload = {
      courseId,
      topicName: topic.topicName,
      subTopicName: sub.name,
      watchedDuration: sub.duration || 30,
    };

    console.log("📤 Updating progress with payload:", payload);

    try {
      const resp = await axios.post(
        `${API_BASE_URL}/courses/updateTopicProgress`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Progress update response:', resp.data);
      
      if (resp.data && resp.data.success) {
        // Update local state optimistically
        const updatedEnrollment = { ...enrollment };
        const topicIndex = updatedEnrollment.progress.findIndex(
          (t: any) => t.topicName === topic.topicName
        );
        
        if (topicIndex !== -1 && updatedEnrollment.progress[topicIndex].subtopics[sIndex]) {
          updatedEnrollment.progress[topicIndex].subtopics[sIndex].watchedDuration = sub.duration || 30;
          updatedEnrollment.progress[topicIndex].topicWatchedDuration = 
            updatedEnrollment.progress[topicIndex].subtopics.reduce(
              (sum: number, st: any) => sum + st.watchedDuration, 0
            );
          updatedEnrollment.totalWatchedDuration = 
            updatedEnrollment.progress.reduce(
              (sum: number, t: any) => sum + t.topicWatchedDuration, 0
            );
          
          setEnrollment(updatedEnrollment);
        }
        
        toast({ 
          title: "Progress updated", 
          description: "Subtopic marked as watched", 
          variant: "default" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: resp.data?.message || "Failed to update progress", 
          variant: "destructive" 
        });
      }
    } catch (err: any) {
      console.error("Failed to update progress", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to update progress", 
        variant: "destructive" 
      });
    }
  };

  // Topic Exam flow: fetch and open
  const handleOpenTopicExam = async (topicName: string) => {
    if (!token || !courseId) {
      toast({ title: "Login required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    
    try {
      setShowTopicExamModal(true);
      setCurrentExam(null);
      setAnswers({});
      setExamResult(null);

      const encodedTopic = encodeURIComponent(topicName);
      const resp = await axios.get(
        `${API_BASE_URL}/courses/exams/topic/${courseId}/${encodedTopic}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Topic exam response:', resp.data);
      
      if (resp.data && resp.data.exam) {
        setCurrentExam(resp.data.exam);
      } else if (resp.data) {
        setCurrentExam(resp.data);
      } else {
        toast({ 
          title: "No exam", 
          description: "No exam found for this topic", 
          variant: "default" 
        });
        setShowTopicExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch topic exam", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to fetch topic exam", 
        variant: "destructive" 
      });
      setShowTopicExamModal(false);
    }
  };

  const handleTopicAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async () => {
    if (!currentExam || !token || !courseId) return;
    setSubmittingExam(true);
    try {
      const payload = {
        courseId,
        topicName: currentExam.topicName,
        answers,
      };
      
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/topic/validate`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Exam submit response:', resp.data);
      
      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        // Refresh enrollment data
        try {
          const enrollResp = await axios.get(
            `${API_BASE_URL}/courses/enrollment/allcourses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (enrollResp.data && enrollResp.data.success && enrollResp.data.enrollments) {
            const courseEnrollment = enrollResp.data.enrollments.find(
              (enr: any) => {
                const enrCourseId = enr.courseId;
                return (
                  enrCourseId === courseId || 
                  enrCourseId?._id === courseId ||
                  (typeof enrCourseId === 'object' && enrCourseId?._id === courseId)
                );
              }
            );
            
            if (courseEnrollment) {
              setEnrollment(courseEnrollment);
            }
          }
        } catch (refreshErr) {
          console.error("Failed to refresh enrollment:", refreshErr);
        }
        
        toast({ 
          title: "Exam submitted", 
          description: "Topic exam submitted successfully", 
          variant: "default" 
        });
      }
    } catch (err: any) {
      console.error("Topic exam submit failed", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to submit exam", 
        variant: "destructive" 
      });
    } finally {
      setSubmittingExam(false);
    }
  };

  // Final exam flow
  const handleOpenFinalExam = async () => {
    if (!token || !courseId) {
      toast({ title: "Login required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    
    try {
      setShowFinalExamModal(true);
      setFinalExam(null);
      setAnswers({});
      setExamResult(null);

      const resp = await axios.get(
        `${API_BASE_URL}/courses/exams/final/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Final exam response:', resp.data);
      
      if (resp.data && resp.data.exam) {
        setFinalExam(resp.data.exam);
      } else if (resp.data) {
        setFinalExam(resp.data);
      } else {
        toast({ 
          title: "No exam", 
          description: "No final exam found for this course", 
          variant: "default" 
        });
        setShowFinalExamModal(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch final exam", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to fetch final exam", 
        variant: "destructive" 
      });
      setShowFinalExamModal(false);
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam || !token || !courseId) return;
    setSubmittingExam(true);
    try {
      const payload = {
        courseId,
        answers,
      };
      
      const resp = await axios.post(
        `${API_BASE_URL}/courses/exams/validate/final`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Final exam submit response:', resp.data);
      
      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        // Refresh enrollment data
        try {
          const enrollResp = await axios.get(
            `${API_BASE_URL}/courses/enrollment/allcourses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (enrollResp.data && enrollResp.data.success && enrollResp.data.enrollments) {
            const courseEnrollment = enrollResp.data.enrollments.find(
              (enr: any) => {
                const enrCourseId = enr.courseId;
                return (
                  enrCourseId === courseId || 
                  enrCourseId?._id === courseId ||
                  (typeof enrCourseId === 'object' && enrCourseId?._id === courseId)
                );
              }
            );
            
            if (courseEnrollment) {
              setEnrollment(courseEnrollment);
            }
          }
        } catch (refreshErr) {
          console.error("Failed to refresh enrollment:", refreshErr);
        }
        
        toast({ 
          title: "Final exam submitted", 
          description: "Final exam submitted successfully", 
          variant: "default" 
        });
      }
    } catch (err: any) {
      console.error("Final exam submit failed", err);
      toast({ 
        title: "Error", 
        description: err?.response?.data?.message || "Failed to submit final exam", 
        variant: "destructive" 
      });
    } finally {
      setSubmittingExam(false);
    }
  };

  // Render a single subtopic: name, play button, mark watched
  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const progressTopic = enrollment?.progress?.find((pt) => pt.topicName === course?.curriculum[tIndex].topicName);
    const watched = progressTopic ? progressTopic.subtopics[sIndex]?.watchedDuration || 0 : 0;
    const total = progressTopic ? progressTopic.subtopics[sIndex]?.totalDuration || sub.duration || 0 : sub.duration || 0;

    const isPlaying = playingSubtopic && playingSubtopic.topicIndex === tIndex && playingSubtopic.subIndex === sIndex;

    return (
      <div className="flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded">
        <div className="flex-1">
          <div className="font-medium">{sub.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>Duration: {total} min • Watched: {Math.min(watched, total)} min</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={isPlaying ? "secondary" : "outline"} 
            onClick={() => openSubtopic(tIndex, sIndex)}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            {isPlaying ? "Playing" : "Play"}
          </Button>
          <Button 
            size="sm" 
            onClick={() => markSubtopicWatched(tIndex, sIndex)} 
            variant="ghost"
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Mark Watched
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Course not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This course could not be found. It may have been removed.</p>
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)}>
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => navigate("/student")}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-sm text-gray-600">Course Learning Interface</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="text-xl font-bold text-blue-600">{videoProgressPercent}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player + basic info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                    <CardDescription className="mt-2">{course.courseDescription}</CardDescription>
                  </div>
                  <Badge variant={course.courseType === 'paid' ? 'default' : 'secondary'}>
                    {course.courseType === 'paid' ? 'Paid Course' : 'Free Course'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    {playerUrl ? (
                      /(youtube|youtu\.be)/i.test(playerUrl) ? (
                        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            title="Course player"
                            src={playerUrl.includes("embed") ? playerUrl : `https://www.youtube.com/embed/${playerUrl.split("v=")[1] || playerUrl}`}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                          <video className="w-full h-full" controls src={playerUrl}>
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Select a lesson to start learning</p>
                          <p className="text-sm mt-2">Click on any lesson below to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Your Progress</div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <Progress value={videoProgressPercent} />
                              </div>
                              <div className="text-sm font-medium">{videoProgressPercent}%</div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Total Duration</div>
                            <div className="text-lg font-medium">{course.totalDuration || 0} minutes</div>
                          </div>

                          <div>
                            {!enrollment ? (
                              <Button onClick={handleStartLearning} className="w-full" size="lg">
                                Start Learning
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => {
                                  if (course.curriculum && course.curriculum.length > 0) {
                                    const firstTopic = course.curriculum[0];
                                    if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
                                      openSubtopic(0, 0);
                                    }
                                  }
                                }} 
                                className="w-full" 
                                size="lg"
                              >
                                Continue Learning
                              </Button>
                            )}
                          </div>

                          {enrollment?.finalExamEligible && !enrollment?.courseCompleted && (
                            <Button onClick={handleOpenFinalExam} variant="secondary" className="w-full">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Attempt Final Exam
                            </Button>
                          )}

                          {enrollment?.courseCompleted && (
                            <div className="space-y-2 p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-green-600" />
                                <div className="text-sm font-medium text-green-700">Course completed</div>
                              </div>
                              <div className="text-xs text-gray-600">
                                Completed on {new Date(enrollment.completedAt || "").toLocaleDateString()}
                              </div>
                              <Button 
                                onClick={() => {
                                  // If backend provides certificate link in enrollment, open it
                                  const certLink = (enrollment as any).certificateLink;
                                  if (certLink) {
                                    window.open(certLink, "_blank");
                                    return;
                                  }
                                  toast({ 
                                    title: "Certificate", 
                                    description: "Certificate is generated by admin. Contact support if not available.", 
                                    variant: "default" 
                                  });
                                }} 
                                variant="outline" 
                                className="w-full border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Certificate
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>Topics and lessons to complete</CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((topic, tIndex) => {
                      const topicProgress = enrollment?.progress?.find((p) => p.topicName === topic.topicName);
                      const topicWatched = topicProgress?.topicWatchedDuration || 0;
                      const topicTotal = topicProgress?.topicTotalDuration || 
                        topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);

                      const canAttemptExam = !!topicProgress && topicWatched >= topicTotal;
                      const topicProgressPercent = topicTotal > 0 ? Math.round((topicWatched / topicTotal) * 100) : 0;

                      return (
                        <div key={topic.topicName} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold text-lg">{topic.topicName}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {topic.subtopics.length} lessons • {topicTotal} minutes
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{topicProgressPercent}%</div>
                              <div className="w-32">
                                <Progress value={topicProgressPercent} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {topic.subtopics.map((sub, sIndex) => (
                              <SubtopicRow key={`${sub.name}-${sIndex}`} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                            ))}
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <Button 
                              onClick={() => {
                                if (!enrollment) {
                                  navigate(`/course-enrollment/${courseId}`);
                                  return;
                                }
                                if (topic.subtopics && topic.subtopics.length > 0) {
                                  openSubtopic(tIndex, 0);
                                }
                              }}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Topic
                            </Button>

                            <Button 
                              disabled={!canAttemptExam || !!topicProgress?.examAttempted} 
                              variant={canAttemptExam ? "secondary" : "outline"} 
                              onClick={() => handleOpenTopicExam(topic.topicName)}
                              className="flex-1"
                            >
                              {topicProgress?.examAttempted ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Exam Completed
                                </>
                              ) : (
                                "Attempt Topic Exam"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No curriculum available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar / Enrollment summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!enrollment ? (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      You are not enrolled in this course. Enroll now to start learning.
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/course-enrollment/${courseId}`)} 
                        className="flex-1"
                      >
                        Enroll Now
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/student")}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Enrolled On</div>
                        <div className="font-medium">
                          {new Date(enrollment.enrollmentDate || Date.now()).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Course Progress</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={videoProgressPercent} />
                          </div>
                          <div className="text-sm font-medium">{videoProgressPercent}%</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Topics Passed</div>
                          <div className="text-lg font-medium">
                            {enrollment.progress.filter(p => p.passed).length} / {enrollment.progress.length}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Final Exam</div>
                          <div className="text-lg font-medium">
                            {enrollment.finalExamEligible ? 'Eligible' : 'Not Eligible'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">Status Summary</div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Final Exam Attempted:</span>
                            <span className={enrollment.finalExamAttempted ? "text-green-600 font-medium" : ""}>
                              {enrollment.finalExamAttempted ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Course Completed:</span>
                            <span className={enrollment.courseCompleted ? "text-green-600 font-medium" : ""}>
                              {enrollment.courseCompleted ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Access Expires:</span>
                            <span>
                              {enrollment.accessExpiresAt 
                                ? new Date(enrollment.accessExpiresAt).toLocaleDateString()
                                : 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleOpenFinalExam}
                          disabled={!enrollment.finalExamEligible || enrollment.courseCompleted}
                          className="flex-1"
                        >
                          {enrollment.courseCompleted ? 'Course Completed' : 'Take Final Exam'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={async () => {
                            try {
                              const enrollResp = await axios.get(
                                `${API_BASE_URL}/courses/enrollment/allcourses`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              
                              if (enrollResp.data && enrollResp.data.success && enrollResp.data.enrollments) {
                                const courseEnrollment = enrollResp.data.enrollments.find(
                                  (enr: any) => {
                                    const enrCourseId = enr.courseId;
                                    return (
                                      enrCourseId === courseId || 
                                      enrCourseId?._id === courseId ||
                                      (typeof enrCourseId === 'object' && enrCourseId?._id === courseId)
                                    );
                                  }
                                );
                                
                                if (courseEnrollment) {
                                  setEnrollment(courseEnrollment);
                                }
                              }
                              toast({ 
                                title: "Refreshed", 
                                description: "Enrollment data refreshed", 
                                variant: "default" 
                              });
                            } catch (err: any) {
                              toast({ 
                                title: "Error", 
                                description: "Failed to refresh", 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.stream && (
                  <div>
                    <div className="text-xs text-gray-500">Stream</div>
                    <div className="font-medium capitalize">{course.stream}</div>
                  </div>
                )}
                {course.courseType && (
                  <div>
                    <div className="text-xs text-gray-500">Type</div>
                    <div className="font-medium">{course.courseType === 'paid' ? 'Paid' : 'Free'}</div>
                  </div>
                )}
                {course.price !== undefined && course.courseType === 'paid' && (
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="font-medium">₹{course.price}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500">Total Lessons</div>
                  <div className="font-medium">
                    {course.curriculum?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Topics</div>
                  <div className="font-medium">
                    {course.curriculum?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Topic Exam Modal */}
      <Dialog open={showTopicExamModal} onOpenChange={setShowTopicExamModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Topic Exam</DialogTitle>
            <div className="text-sm text-gray-500">{currentExam?.topicName || currentExam?.examId}</div>
          </DialogHeader>

          <div className="space-y-4">
            {!currentExam ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="font-semibold text-lg mb-2">Exam Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passed:</span>
                    <span className={`font-semibold ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {examResult.passed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {examResult.correctAnswers !== undefined && (
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  You can close this modal now. The results have been saved.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Time limit: {currentExam?.timeLimit} minutes • Passing score: {currentExam?.passingScore}%
                </div>

                <div className="space-y-6">
                  {currentExam.questions?.map((q: any, idx: number) => (
                    <div key={q._id || idx} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = q._id?.toString() || `q${idx}`;
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input
                                type="radio"
                                name={qid}
                                checked={checked}
                                onChange={() => handleTopicAnswerChange(qid, opt)}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowTopicExamModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitTopicExam} 
                    disabled={submittingExam || Object.keys(answers).length === 0}
                  >
                    {submittingExam ? "Submitting..." : "Submit Exam"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Exam Modal */}
      <Dialog open={showFinalExamModal} onOpenChange={setShowFinalExamModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Final Exam</DialogTitle>
            <div className="text-sm text-gray-500">Final assessment for this course</div>
          </DialogHeader>

          <div className="space-y-4">
            {!finalExam ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2">Loading final exam...</p>
              </div>
            ) : examResult ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="font-semibold text-lg mb-2">Final Exam Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-semibold">{examResult.score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passed:</span>
                    <span className={`font-semibold ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {examResult.passed ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {examResult.correctAnswers !== undefined && (
                    <div className="flex justify-between">
                      <span>Correct Answers:</span>
                      <span>{examResult.correctAnswers} / {examResult.totalQuestions}</span>
                    </div>
                  )}
                  {examResult.attemptNumber && (
                    <div className="flex justify-between">
                      <span>Attempt Number:</span>
                      <span>{examResult.attemptNumber}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {examResult.passed 
                    ? "Congratulations! You have passed the final exam. The course is now marked as completed."
                    : "You did not pass this attempt. You can try again if you have remaining attempts."
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Time limit: {finalExam?.timeLimit} minutes • Passing score: {finalExam?.passingScore}%
                  {finalExam?.currentAttempt && (
                    <span> • Attempt: {finalExam.currentAttempt} of {finalExam.maxAttempts}</span>
                  )}
                </div>

                <div className="space-y-6">
                  {finalExam.questions?.map((q: any, idx: number) => (
                    <div key={q._id || idx} className="border rounded p-4 bg-white">
                      <div className="font-medium mb-3">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = q._id?.toString() || `q${idx}`;
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input
                                type="radio"
                                name={qid}
                                checked={checked}
                                onChange={() => setAnswers(prev => ({ ...prev, [qid]: opt }))}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowFinalExamModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={submitFinalExam} 
                    disabled={submittingExam || Object.keys(answers).length === 0}
                  >
                    {submittingExam ? "Submitting..." : "Submit Final Exam"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearningInterface;
