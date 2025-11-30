import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  List,
  Clock,
  Award,
  CheckCircle2,
  Archive,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { pack365Api } from "@/services/api";
import Navbar from "@/components/Navbar";


interface AvailableExam {
  examId: string;
  courseId: string;
  courseName: string;
  attemptInfo?: {
    totalAttempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    currentScore: number;
    canRetake: boolean;
    isPassed: boolean;
    lastAttempt?: string | null;
  };
}

interface Question {
  questionText: string;
  options: string[];
  type?: string;
  // correctAnswer is only present when showAnswers=true
  correctAnswer?: string;
  description?: string;
}

const ExamInterface: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<AvailableExam | null>(null);
  const [examDetails, setExamDetails] = useState<any | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fetchingQuestions, setFetchingQuestions] = useState<boolean>(false);
  const [historyForCourse, setHistoryForCourse] = useState<any | null>(null);

  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    loadAvailableExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getToken = () => localStorage.getItem("token");

  const ensureAuth = (): string | null => {
    const token = getToken();
    if (!token) {
      toast({ title: "Authentication required", variant: "destructive" });
      navigate("/login");
      return null;
    }
    return token;
  };

  const loadAvailableExams = async () => {
    try {
      setLoading(true);
      const token = ensureAuth();
      if (!token) return;

      const res = await pack365Api.getAvailableExamsForUser(token);

      // Backend returns { exams: [...] } per pack365Routes -> examController.getAvailableExamsForUser
      const examsList: AvailableExam[] = res?.exams || res?.data || [];
      setExams(examsList);
    } catch (err: any) {
      console.error("Error loading available exams:", err);
      toast({
        title: "Failed to load exams",
        description: err?.message || "Could not fetch available exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (exam: AvailableExam) => {
    const token = ensureAuth();
    if (!token) return;

    try {
      setExamDetails(null);
      const res = await pack365Api.getExamDetails(exam.examId, token);
      // backend returns { examDetails }
      setExamDetails(res?.examDetails || res?.exam || null);
      setSelectedExam(exam);
    } catch (err: any) {
      console.error("Failed to fetch exam details:", err);
      toast({
        title: "Failed to fetch details",
        description: err?.message || "Could not load exam details",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = async (exam: AvailableExam) => {
    const token = ensureAuth();
    if (!token) return;

    try {
      setHistoryForCourse(null);
      const res = await pack365Api.getExamHistory(token, exam.courseId);
      // backend returns { examHistory }
      setHistoryForCourse(res?.examHistory || res?.data?.examHistory || null);
      setSelectedExam(exam);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      toast({
        title: "Failed to load history",
        description: err?.message || "Could not fetch exam history",
        variant: "destructive",
      });
    }
  };

  const beginExam = async (exam: AvailableExam) => {
    const token = ensureAuth();
    if (!token) return;

    // Check if user can take exam via attemptInfo or by fetching details
    const canTake =
      exam.attemptInfo?.canRetake ||
      (exam.attemptInfo && exam.attemptInfo.remainingAttempts > 0);

    // But server also requires course completed check - we fetch details to confirm
    try {
      setFetchingQuestions(true);
      const detailsRes = await pack365Api.getExamDetails(exam.examId, token);
      const details = detailsRes?.examDetails || detailsRes?.exam || null;
      if (!details) {
        toast({
          title: "Cannot start exam",
          description: "Failed to get exam eligibility details",
          variant: "destructive",
        });
        return;
      }

      const canTakeExam = details?.userAttemptInfo?.canTakeExam === true;
      if (!canTakeExam) {
        toast({
          title: "Exam Locked",
          description: "You must complete 100% of this course to take the exam.",
          variant: "destructive",
        });
        return;
      }

      // Fetch questions WITHOUT answers for actual attempt
      const qRes = await pack365Api.getExamQuestions(exam.examId, false, token);
      // backend returns { questions: [...] } or res.data directly
      const fetchedQuestions: Question[] = qRes?.questions || qRes?.data || [];
      if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
        toast({
          title: "No questions",
          description: "This exam has no questions configured.",
          variant: "destructive",
        });
        return;
      }

      setQuestions(fetchedQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setQuizMode(true);
      setSelectedExam(exam);
      startTimeRef.current = Date.now();
    } catch (err: any) {
      console.error("Error starting exam:", err);
      toast({
        title: "Failed to start exam",
        description: err?.message || "Could not load exam questions",
        variant: "destructive",
      });
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleSelectOption = (qIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const goToNext = () => {
    setCurrentQuestionIndex((c) => Math.min(c + 1, questions.length - 1));
  };
  const goToPrev = () => {
    setCurrentQuestionIndex((c) => Math.max(c - 1, 0));
  };

  const submitExam = async () => {
    if (!selectedExam) return;
    const token = ensureAuth();
    if (!token) return;

    setSubmitting(true);
    try {
      // 1) Fetch questions WITH answers so we can compute marks securely on client (backend requires marks)
      const qRes = await pack365Api.getExamQuestions(selectedExam.examId, true, token);
      const fullQuestions: Question[] = qRes?.questions || qRes?.data || [];

      if (!Array.isArray(fullQuestions) || fullQuestions.length === 0) {
        toast({
          title: "Submission failed",
          description: "Could not fetch correct answers for grading",
          variant: "destructive",
        });
        return;
      }

      // 2) Compare answers to compute score
      let correctCount = 0;
      fullQuestions.forEach((q, idx) => {
        const selected = answers[idx];
        if (!selected) return;
        // Ensure option comparison tolerant of types
        if (q.correctAnswer && String(selected).trim() === String(q.correctAnswer).trim()) {
          correctCount++;
        }
      });

      const total = fullQuestions.length;
      const marks = Math.round((correctCount / total) * 100);
      const timeTakenMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const timeTakenSeconds = Math.round(timeTakenMs / 1000);

      // 3) Submit to backend
      const submitRes = await pack365Api.submitExam(token, {
        courseId: selectedExam.courseId,
        examId: selectedExam.examId,
        marks,
        timeTaken: timeTakenSeconds,
      });

      // backend returns currentScore, bestScore, attemptNumber, remainingAttempts, isPassed etc
      if (submitRes && (submitRes.currentScore !== undefined || submitRes.message)) {
        toast({
          title: "Exam submitted",
          description: submitRes.message || "Your attempt was submitted",
          variant: "default",
        });
      } else {
        toast({
          title: "Exam submitted",
          description: "Submission completed",
          variant: "default",
        });
      }

      // Reset quiz mode and reload available exams to refresh attemptInfo
      setQuizMode(false);
      setQuestions([]);
      setSelectedExam(null);
      await loadAvailableExams();

      // Show history for the course after submit
      await handleViewHistory(selectedExam);
    } catch (err: any) {
      console.error("Error submitting exam:", err);
      toast({
        title: "Submission failed",
        description: err?.message || "Could not submit exam",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      startTimeRef.current = null;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p>Loading exams...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Course Exams</h1>
            <div>
              <Button onClick={loadAvailableExams} variant="ghost" size="sm">
                Refresh
              </Button>
            </div>
          </div>

          {/* List of available exams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.length === 0 && (
              <Card>
                <CardContent>
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                    <p className="text-gray-700">No exams available. Complete a course to unlock its exam.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {exams.map((exam) => {
              const attempt = exam.attemptInfo;
              const canTake = attempt?.canRetake || (attempt && attempt.remainingAttempts > 0);
              return (
                <Card key={exam.examId} className="shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          <span>{exam.courseName}</span>
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          Exam ID: {exam.examId}
                        </CardDescription>
                      </div>

                      <div className="text-right">
                        <Badge variant={attempt?.isPassed ? "default" : "secondary"}>
                          {attempt?.isPassed ? "Passed" : "Not Passed"}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-2">
                          {attempt ? `${attempt.remainingAttempts} attempts left` : "No attempts yet"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-700">
                          Best Score: <strong>{attempt?.bestScore ?? "--"}</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Attempts: <strong>{attempt?.totalAttempts ?? 0}/{attempt?.maxAttempts ?? "?"}</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Last: <strong>{attempt?.lastAttempt ? new Date(attempt.lastAttempt).toLocaleString() : "--"}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewDetails(exam)}
                          variant="outline"
                          size="sm"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Details
                        </Button>

                        <Button
                          onClick={() => handleViewHistory(exam)}
                          variant="ghost"
                          size="sm"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          History
                        </Button>

                        <div className="ml-auto">
                          <Button
                            onClick={() => beginExam(exam)}
                            variant={canTake ? "default" : "outline"}
                            size="sm"
                            disabled={!canTake || fetchingQuestions}
                          >
                            {fetchingQuestions ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {canTake ? "Start Exam" : "Locked"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Exam Details / History / Quiz */}
          <div>
            {examDetails && selectedExam && !quizMode && (
              <Card className="shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{examDetails.courseName}</CardTitle>
                    <div className="text-sm text-gray-600">Max Attempts: {examDetails.maxAttempts}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Course Completion</h4>
                      {examDetails.courseCompletion ? (
                        <div className="text-sm text-gray-700">
                          <div>Watched: {examDetails.courseCompletion.watchedTopics}/{examDetails.courseCompletion.totalTopics}</div>
                          <div>Completion: {examDetails.courseCompletion.completionPercentage}%</div>
                          <div>Status: {examDetails.courseCompletion.isCompleted ? "Completed" : "Incomplete"}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No course progress available</div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">Your Attempt Info</h4>
                      {examDetails.userAttemptInfo ? (
                        <div className="text-sm text-gray-700">
                          <div>Attempts used: {examDetails.userAttemptInfo.totalAttempts}</div>
                          <div>Remaining: {examDetails.userAttemptInfo.remainingAttempts}</div>
                          <div>Best Score: {examDetails.userAttemptInfo.bestScore}</div>
                          <div>Can Take Now: {examDetails.userAttemptInfo.canTakeExam ? "Yes" : "No"}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No attempts data</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button onClick={() => setExamDetails(null)} variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <Button
                      onClick={() => beginExam(selectedExam)}
                      variant="default"
                      disabled={!examDetails.userAttemptInfo?.canTakeExam}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {historyForCourse && selectedExam && !quizMode && (
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Exam History — {selectedExam.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyForCourse.attempts && historyForCourse.attempts.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">
                        Total Attempts: {historyForCourse.totalAttempts} • Remaining: {historyForCourse.remainingAttempts}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {historyForCourse.attempts.map((a: any) => (
                          <div key={a.attemptId} className="p-3 rounded border">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">Score: {a.score}</div>
                                <div className="text-xs text-gray-500">Submitted: {new Date(a.submittedAt).toLocaleString()}</div>
                              </div>
                              <div className="text-xs text-gray-500">{a.isPassed ? "Passed" : "Failed"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">No attempts found for this course.</div>
                  )}

                  <div className="mt-4">
                    <Button onClick={() => setHistoryForCourse(null)} variant="ghost" size="sm">
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {quizMode && selectedExam && (
              <Card className="shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {selectedExam.courseName} — Quiz
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </CardDescription>
                    </div>

                    <div className="text-sm text-gray-600">
                      Attempts left: {selectedExam.attemptInfo?.remainingAttempts ?? "--"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {questions.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <div className="text-lg font-medium mb-2">
                          {questions[currentQuestionIndex].questionText}
                        </div>

                        <div className="space-y-2">
                          {questions[currentQuestionIndex].options.map((opt, i) => {
                            const selected = answers[currentQuestionIndex] === opt;
                            return (
                              <div
                                key={i}
                                onClick={() => handleSelectOption(currentQuestionIndex, opt)}
                                className={`p-3 rounded border cursor-pointer ${
                                  selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className={`flex items-center gap-3`}>
                                  <div className="w-6 text-sm font-medium">{String.fromCharCode(65 + i)}.</div>
                                  <div className="flex-1 text-sm">{opt}</div>
                                  {selected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button onClick={goToPrev} variant="outline" disabled={currentQuestionIndex === 0}>
                          Previous
                        </Button>

                        <Button
                          onClick={goToNext}
                          variant="outline"
                          disabled={currentQuestionIndex === questions.length - 1}
                        >
                          Next
                        </Button>

                        <div className="ml-auto flex items-center gap-2">
                          <Button
                            onClick={() => {
                              // Cancel quiz and return to list/details
                              setQuizMode(false);
                              setQuestions([]);
                              setSelectedExam(null);
                              startTimeRef.current = null;
                            }}
                            variant="ghost"
                          >
                            Cancel
                          </Button>

                          <Button onClick={submitExam} variant="default" disabled={submitting}>
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Award className="h-4 w-4 mr-2" />
                            )}
                            Submit Attempt
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <div>Loading questions...</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamInterface;
