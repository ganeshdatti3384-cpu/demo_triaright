import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { courseApi } from "@/services/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


type Subtopic = {
  name: string;
  link?: string;
  duration?: number; // minutes
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
  courseName: string;
  courseDescription?: string;
  curriculum: Topic[];
  demoVideoLink?: string;
  totalDuration?: number;
  courseImageLink?: string;
  price?: number;
  courseType?: string;
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
  // Any other fields from backend...
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";

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
  const [currentExam, setCurrentExam] = useState<any | null>(null); // exam object returned from backend
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

        // 1) fetch course
        const courseResp = await courseApi.getCourseById(courseId);
        const fetchedCourse = courseResp.course || courseResp;
        setCourse(fetchedCourse);

        // 2) fetch enrollment for logged-in user
        if (token) {
          try {
            const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/${encodeURIComponent(courseId)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (enrollResp.data && enrollResp.data.enrollment) {
              setEnrollment(enrollResp.data.enrollment);
            } else if (enrollResp.data) {
              // some backends return enrollment directly
              setEnrollment(enrollResp.data);
            }
          } catch (err: any) {
            // Not enrolled or API returned 404
            if (err.response && err.response.status !== 404) {
              console.error("Error fetching enrollment", err);
            }
            setEnrollment(null);
          }
        } else {
          setEnrollment(null);
        }
      } catch (err: any) {
        console.error("Failed to load course", err);
        toast({ title: "Error", description: "Failed to load course details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, token]);

  // helper: compute overall video progress percent
  const videoProgressPercent = useMemo(() => {
    if (!enrollment) return 0;
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
      // navigate to course enrollment page (frontend has /course-enrollment/:id)
      navigate(`/course-enrollment/${courseId}`);
      return;
    }
    // scroll to content or expand - we set playingSubtopic to first available subtopic
    if (course && course.curriculum && course.curriculum.length > 0) {
      setPlayingSubtopic({ topicIndex: 0, subIndex: 0 });
      const first = course.curriculum[0].subtopics?.[0];
      if (first?.link) {
        setPlayerUrl(first.link);
      }
    }
  };

  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;
    const sub = course.curriculum[tIndex].subtopics[sIndex];
    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });
    setPlayerUrl(sub.link || null);
  };

  // mark subtopic as watched (set watchedDuration to totalDuration of subtopic)
  const markSubtopicWatched = async (tIndex: number, sIndex: number) => {
    if (!enrollment || !course || !token) {
      toast({ title: "Error", description: "You must be enrolled to update progress", variant: "destructive" });
      return;
    }

    const topicProgress = enrollment.progress.find((t) => t.topicName === course.curriculum[tIndex].topicName);
    if (!topicProgress) {
      toast({ title: "Error", description: "Progress not found for this topic", variant: "destructive" });
      return;
    }

    const sub = topicProgress.subtopics[sIndex];
    if (!sub) {
      toast({ title: "Error", description: "Subtopic not found in progress", variant: "destructive" });
      return;
    }

    // if already marked fully watched, do nothing
    if (sub.watchedDuration >= sub.totalDuration) {
      toast({ title: "Info", description: "Subtopic already marked as watched", variant: "default" });
      return;
    }

    // prepare payload used by backend updateTopicProgress (controller expects courseId, topicName, subTopicName, watchedDuration)
    const payload = {
      courseId,
      topicName: course.curriculum[tIndex].topicName,
      subTopicName: sub.subTopicName,
      watchedDuration: sub.totalDuration,
    };

    try {
      const resp = await axios.post(`${API_BASE_URL}/courses/updateTopicProgress`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // optimistic behaviour: refresh enrollment details from backend after update
      const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/${encodeURIComponent(courseId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollment(enrollResp.data.enrollment || enrollResp.data);
      toast({ title: "Progress updated", description: "Subtopic marked as watched", variant: "success" });
    } catch (err: any) {
      console.error("Failed to update progress", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update progress", variant: "destructive" });
    }
  };

  // Topic Exam flow: fetch and open
  const handleOpenTopicExam = async (topicName: string) => {
    if (!token) {
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
      const resp = await axios.get(`${API_BASE_URL}/courses/exams/topic/${encodeURIComponent(courseId)}/${encodedTopic}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data && resp.data.exam) {
        setCurrentExam(resp.data.exam);
      } else {
        // Some backends return exam directly
        setCurrentExam(resp.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch topic exam", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch topic exam", variant: "destructive" });
      setShowTopicExamModal(false);
    }
  };

  const handleTopicAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submitTopicExam = async () => {
    if (!currentExam || !token) return;
    setSubmittingExam(true);
    try {
      const payload = {
        courseId,
        topicName: currentExam.topicName,
        answers,
      };
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/topic/validate`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        // refresh enrollment
        const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/${encodeURIComponent(courseId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollment(enrollResp.data.enrollment || enrollResp.data);
        toast({ title: "Exam submitted", description: "Topic exam submitted successfully", variant: "success" });
      }
    } catch (err: any) {
      console.error("Topic exam submit failed", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to submit exam", variant: "destructive" });
    } finally {
      setSubmittingExam(false);
    }
  };

  // Final exam flow
  const handleOpenFinalExam = async () => {
    if (!token) {
      toast({ title: "Login required", description: "Please login to attempt exams", variant: "destructive" });
      navigate("/login");
      return;
    }
    try {
      setShowFinalExamModal(true);
      setFinalExam(null);
      setAnswers({});
      setExamResult(null);

      const resp = await axios.get(`${API_BASE_URL}/courses/exams/final/${encodeURIComponent(courseId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data && resp.data.exam) {
        setFinalExam(resp.data.exam);
      } else {
        setFinalExam(resp.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch final exam", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch final exam", variant: "destructive" });
      setShowFinalExamModal(false);
    }
  };

  const submitFinalExam = async () => {
    if (!finalExam || !token) return;
    setSubmittingExam(true);
    try {
      const payload = {
        courseId,
        answers,
      };
      const resp = await axios.post(`${API_BASE_URL}/courses/exams/validate/final`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.data) {
        setExamResult(resp.data.result || resp.data);
        // refresh enrollment
        const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/${encodeURIComponent(courseId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollment(enrollResp.data.enrollment || enrollResp.data);
        toast({ title: "Final exam submitted", description: "Final exam submitted successfully", variant: "success" });
      }
    } catch (err: any) {
      console.error("Final exam submit failed", err);
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to submit final exam", variant: "destructive" });
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
      <div className="flex items-center justify-between gap-4 border-b py-3">
        <div>
          <div className="font-medium">{sub.name}</div>
          <div className="text-xs text-gray-500">
            Duration: {total} min • Watched: {Math.min(watched, total)} min
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={isPlaying ? "secondary" : "outline"} onClick={() => openSubtopic(tIndex, sIndex)}>
            {isPlaying ? "Playing" : "Play"}
          </Button>
          <Button size="sm" onClick={() => markSubtopicWatched(tIndex, sIndex)} variant="ghost">
            Mark Watched
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Course not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This course could not be found. It may have been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player + basic info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{course.courseName}</CardTitle>
              <CardDescription>{course.courseDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {playerUrl ? (
                    // If youtube link - use iframe, otherwise show anchor and video tag fallback
                    /(youtube|youtu\.be)/i.test(playerUrl) ? (
                      <div className="w-full aspect-video bg-black">
                        <iframe
                          title="Course player"
                          src={playerUrl.includes("embed") ? playerUrl : `https://www.youtube.com/embed/${playerUrl.split("v=")[1] || playerUrl}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div>
                        <video className="w-full" controls src={playerUrl}>
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
                      Select a lesson to start learning
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Progress</div>
                    <div className="flex items-center gap-3">
                      <div className="w-36">
                        <Progress value={videoProgressPercent} />
                      </div>
                      <div className="text-sm font-medium">{videoProgressPercent}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Total Duration</div>
                    <div className="text-sm font-medium">{course.totalDuration || 0} min</div>
                  </div>

                  <div>
                    {!enrollment ? (
                      <Button onClick={handleStartLearning} className="w-full">
                        Start Learning
                      </Button>
                    ) : (
                      <Button onClick={() => toast({ title: "Resume", description: "Use the curriculum to pick a lesson" })} className="w-full">
                        Resume Learning
                      </Button>
                    )}
                  </div>

                  <div>
                    {enrollment?.finalExamEligible && !enrollment?.courseCompleted && (
                      <Button onClick={handleOpenFinalExam} variant="secondary" className="w-full">
                        Attempt Final Exam
                      </Button>
                    )}

                    {enrollment?.courseCompleted && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-green-700">Course completed</div>
                        <div className="text-xs text-gray-600">Completed on {new Date(enrollment.completedAt || "").toLocaleDateString()}</div>
                        <Button onClick={() => {
                          // If backend provides certificate link in enrollment, open it; otherwise show message
                          const certLink = (enrollment as any).certificateLink;
                          if (certLink) {
                            window.open(certLink, "_blank");
                            return;
                          }
                          toast({ title: "Certificate", description: "Certificate is generated by admin. Contact support if not available.", variant: "default" });
                        }} className="w-full">
                          View / Download Certificate
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Topics and lessons</CardDescription>
            </CardHeader>
            <CardContent>
              {course.curriculum && course.curriculum.length > 0 ? (
                <div className="space-y-6">
                  {course.curriculum.map((topic, tIndex) => {
                    const topicProgress = enrollment?.progress?.find((p) => p.topicName === topic.topicName);
                    const topicWatched = topicProgress?.topicWatchedDuration || 0;
                    const topicTotal = topicProgress?.topicTotalDuration || topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);

                    const canAttemptExam = !!topicProgress && topicWatched >= topicTotal;

                    return (
                      <div key={topic.topicName} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold">{topic.topicName}</div>
                            <div className="text-xs text-gray-500">Lessons: {topic.subtopics.length} • Duration: {topicTotal} min</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{Math.round((topicWatched / (topicTotal || 1)) * 100)}%</div>
                            <div className="w-40">
                              <Progress value={Math.round((topicWatched / (topicTotal || 1)) * 100)} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {topic.subtopics.map((sub, sIndex) => (
                            <SubtopicRow key={sub.name + sIndex} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                          ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button onClick={() => {
                            // If user not enrolled -> prompt enrollment
                            if (!enrollment) {
                              navigate(`/course-enrollment/${courseId}`);
                              return;
                            }
                            // Open first subtopic of this topic
                            if (topic.subtopics && topic.subtopics.length > 0) {
                              openSubtopic(tIndex, 0);
                            } else {
                              toast({ title: "No lessons", description: "This topic has no lessons", variant: "default" });
                            }
                          }}>
                            Start Topic
                          </Button>

                          <Button disabled={!canAttemptExam || !!topicProgress?.examAttempted} variant={canAttemptExam ? "secondary" : "outline"} onClick={() => handleOpenTopicExam(topic.topicName)}>
                            {topicProgress?.examAttempted ? "Exam Attempted" : "Attempt Topic Exam"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No curriculum available for this course.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar / Enrollment summary / Exams history */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              {!enrollment ? (
                <>
                  <div className="text-sm text-gray-600 mb-4">You are not enrolled in this course.</div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate(`/course-enrollment/${courseId}`)}>Enroll</Button>
                    <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-2">Enrolled on {new Date(enrollment.enrollmentDate || "").toLocaleDateString()}</div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500">Course Progress</div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-full">
                        <Progress value={videoProgressPercent} />
                      </div>
                      <div className="text-sm font-medium">{videoProgressPercent}%</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">Exam Eligibility</div>
                  <div className="mb-4">
                    <div>Topic exams passed: {enrollment.progress.filter(p => p.passed).length} / {enrollment.progress.length}</div>
                    <div>Final exam eligible: {enrollment.finalExamEligible ? "Yes" : "No"}</div>
                    <div>Final exam attempted: {enrollment.finalExamAttempted ? "Yes" : "No"}</div>
                    <div>Course completed: {enrollment.courseCompleted ? "Yes" : "No"}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => {
                      // open final exam if eligible
                      if (!enrollment.finalExamEligible) {
                        toast({ title: "Not eligible", description: "Complete all topic exams to be eligible for final exam", variant: "default" });
                        return;
                      }
                      handleOpenFinalExam();
                    }}>
                      Attempt Final Exam
                    </Button>
                    <Button variant="outline" onClick={async () => {
                      // quick refresh enrollment
                      try {
                        const resp = await axios.get(`${API_BASE_URL}/courses/enrollment/${encodeURIComponent(courseId)}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setEnrollment(resp.data.enrollment || resp.data);
                        toast({ title: "Refreshed", description: "Enrollment refreshed", variant: "success" });
                      } catch (err: any) {
                        toast({ title: "Error", description: "Failed to refresh enrollment", variant: "destructive" });
                      }
                    }}>
                      Refresh
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Exam Result / History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Use the exam modal to take exams. After submission, results will appear here after refresh.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Topic Exam Modal */}
      <Dialog open={showTopicExamModal} onOpenChange={setShowTopicExamModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Topic Exam</DialogTitle>
            <div className="text-sm text-gray-500">{currentExam?.topicName || currentExam?.examId}</div>
          </DialogHeader>

          <div className="space-y-4">
            {!currentExam ? (
              <div className="text-center py-8">Loading exam...</div>
            ) : examResult ? (
              <div className="p-4">
                <div className="font-semibold text-lg">Result</div>
                <div className="mt-2">Score: {examResult.score}%</div>
                <div>Passed: {examResult.passed ? "Yes" : "No"}</div>
                <div className="mt-3 text-sm text-gray-600">You can close this modal now.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Time limit: {currentExam?.timeLimit} minutes • Passing score: {currentExam?.passingScore}%</div>

                <div className="space-y-6">
                  {currentExam.questions.map((q: any, idx: number) => (
                    <div key={q.questionId || q._id || idx} className="border rounded p-3">
                      <div className="font-medium">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2 mt-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = (q._id || q.questionId).toString();
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={qid}
                                checked={checked}
                                onChange={() => handleTopicAnswerChange(qid, opt)}
                                className="form-radio"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowTopicExamModal(false)}>Cancel</Button>
                  <Button onClick={submitTopicExam} disabled={submittingExam}>{submittingExam ? "Submitting..." : "Submit Exam"}</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Exam Modal */}
      <Dialog open={showFinalExamModal} onOpenChange={setShowFinalExamModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Final Exam</DialogTitle>
            <div className="text-sm text-gray-500">Final exam for this course</div>
          </DialogHeader>

          <div className="space-y-4">
            {!finalExam ? (
              <div className="text-center py-8">Loading final exam...</div>
            ) : examResult ? (
              <div className="p-4">
                <div className="font-semibold text-lg">Final Exam Result</div>
                <div className="mt-2">Score: {examResult.score}%</div>
                <div>Passed: {examResult.passed ? "Yes" : "No"}</div>
                <div className="mt-3 text-sm text-gray-600">If you've passed and the backend supports certificates, your enrollment will be marked as completed and certificate will be available.</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Time limit: {finalExam?.timeLimit} minutes • Passing score: {finalExam?.passingScore}%</div>

                <div className="space-y-6">
                  {finalExam.questions.map((q: any, idx: number) => (
                    <div key={q.questionId || q._id || idx} className="border rounded p-3">
                      <div className="font-medium">{idx + 1}. {q.questionText}</div>
                      <div className="space-y-2 mt-2">
                        {(q.options || []).map((opt: string, oi: number) => {
                          const qid = (q._id || q.questionId).toString();
                          const checked = answers[qid] === opt;
                          return (
                            <label key={oi} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={qid}
                                checked={checked}
                                onChange={() => setAnswers(prev => ({ ...prev, [qid]: opt }))}
                                className="form-radio"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowFinalExamModal(false)}>Cancel</Button>
                  <Button onClick={submitFinalExam} disabled={submittingExam}>{submittingExam ? "Submitting..." : "Submit Final Exam"}</Button>
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
