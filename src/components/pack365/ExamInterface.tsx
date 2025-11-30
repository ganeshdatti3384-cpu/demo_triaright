import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { pack365Api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Question {
  questionText: string;
  options: string[];
  type?: string;
  // correctAnswer will be present when backend returns showAnswers=true
  correctAnswer?: string;
  description?: string;
}

const ExamInterface: React.FC = () => {
  const { examId: paramExamId } = useParams<{ examId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Accept examId from path, state or query
  const examIdFromState = (location.state as any)?.examId;
  const examIdFromQuery = new URLSearchParams(location.search).get('examId') || undefined;
  const examId = paramExamId ? decodeURIComponent(paramExamId) : examIdFromState || examIdFromQuery;

  const [loading, setLoading] = useState<boolean>(true);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  // exam-taking state
  const [started, setStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // courseId used when submitting (try to get from location.state or available exams)
  const courseIdFromState = (location.state as any)?.courseId;
  const [resolvedCourseId, setResolvedCourseId] = useState<string | null>(courseIdFromState || null);

  useEffect(() => {
    const load = async () => {
      if (!examId) {
        setError('Invalid exam ID — no examId provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: 'Authentication required', variant: 'destructive' });
          navigate('/login');
          return;
        }

        // 1) Fetch exam details (attempts / meta)
        try {
          const det = await pack365Api.getExamDetails(examId, token);
          if (det && det.examDetails) {
            setExamDetails(det.examDetails);
          } else if (det && det.exam) {
            setExamDetails(det.exam);
          } else {
            // safe fallback
            setExamDetails(null);
          }
        } catch (err) {
          console.warn('getExamDetails failed (non-fatal):', err);
        }

        // 2) Fetch questions WITH answers (frontend will grade and then call submitExam)
        // NOTE: backend currently allows showAnswers=true for students (same as existing API),
        // so we request answers so the frontend can compute marks before calling submitExam.
        try {
          const qres = await pack365Api.getExamQuestions(examId, true, token);
          const fetched = (qres && (qres as any).questions) || [];
          setQuestions(fetched);
        } catch (err) {
          console.error('Failed to fetch questions with answers:', err);
          setError('Failed to load exam questions. Please try again.');
          setQuestions([]);
        }

        // 3) Resolve courseId if missing (we need courseId for submitExam payload)
        if (!resolvedCourseId) {
          try {
            const avail = await pack365Api.getAvailableExamsForUser(token);
            const exams = (avail && (avail as any).exams) || [];
            const matched = exams.find((e: any) => e.examId === examId);
            if (matched) {
              // backend sometimes returns courseId as object or string
              const candidate = matched.courseId?._id ? matched.courseId._id.toString() : matched.courseId?.toString?.();
              if (candidate) {
                setResolvedCourseId(candidate);
              }
            }
          } catch (err) {
            console.warn('Could not resolve courseId from available exams:', err);
          }
        }
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('Unexpected error loading exam. See console.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // derived
  const totalQuestions = useMemo(() => questions.length || (examDetails?.totalQuestions || 0), [questions, examDetails]);
  const currentQuestion = questions[currentIndex];

  // Helpers
  const selectOption = (option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(idx => idx + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(idx => idx - 1);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setStartedAt(Date.now());
    setCurrentIndex(0);
    setSelectedAnswers({});
    setResult(null);
  };

  const computeScore = () => {
    if (!questions || questions.length === 0) return 0;
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      // fallback if correctAnswer isn't populated (shouldn't happen because we requested it)
      const correctAnswer = (q as any).correctAnswer;
      if (!correctAnswer) return;
      if (selected !== undefined && selected === correctAnswer) correct++;
    });
    const percent = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, percent };
  };

  const handleSubmit = async () => {
    // confirmation
    if (!window.confirm('Submit exam? You cannot change answers after submission.')) return;

    // Validate we have the necessary data
    if (!questions || questions.length === 0) {
      toast({ title: 'No questions', description: 'Exam has no questions to submit', variant: 'destructive' });
      return;
    }
    // Ensure correctAnswer exists for grading
    const missingCorrect = questions.some(q => (q as any).correctAnswer === undefined);
    if (missingCorrect) {
      toast({ title: 'Cannot grade', description: 'Correct answers not available. Contact support.', variant: 'destructive' });
      return;
    }

    // Compute timeTaken
    const now = Date.now();
    const timeTakenSec = startedAt ? Math.round((now - startedAt) / 1000) : 0;

    // Grade locally
    const score = computeScore();
    const marks = score.percent;

    // courseId is required by backend - try resolvedCourseId or examDetails (if any)
    const courseIdToSend = resolvedCourseId || (location.state as any)?.courseId || null;
    if (!courseIdToSend) {
      // last resort: attempt to find from examDetails.userAttemptInfo? (some API shapes include it)
      toast({ title: 'Missing courseId', description: 'Cannot submit exam — courseId unknown. Contact support.', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Call submitExam API (backend expects computed marks)
      const res = await pack365Api.submitExam(token, {
        courseId: courseIdToSend,
        examId,
        marks,
        timeTaken: timeTakenSec
      });

      if (res && (res as any).success !== false) {
        // Show result using both local grading and server response where available
        const reply = res as any;
        setResult({
          currentScore: reply.currentScore ?? marks,
          bestScore: reply.bestScore ?? marks,
          attemptNumber: reply.attemptNumber ?? 1,
          maxAttempts: reply.maxAttempts ?? examDetails?.maxAttempts ?? 3,
          remainingAttempts: reply.remainingAttempts ?? Math.max(0, (reply.maxAttempts ?? 3) - (reply.attemptNumber ?? 1)),
          isPassed: reply.isPassed ?? (marks >= 50),
          server: reply
        });

        toast({
          title: 'Exam Submitted',
          description: `You scored ${marks}% (${score.correct}/${score.total})`,
          variant: 'default'
        });
        setStarted(false);
      } else {
        const message = (res && (res as any).message) || 'Failed to submit exam';
        toast({ title: 'Submission failed', description: message, variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Submit exam error:', err);
      toast({ title: 'Error', description: err?.message || 'Failed to submit exam', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // UI rendering helpers
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading exam...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-lg w-full">
            <CardContent>
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-gray-600 mt-2">{error}</p>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Main exam UI
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">
                  {examDetails?.courseName ? `${examDetails.courseName} — Exam` : `Exam ${examId}`}
                </CardTitle>
                <div className="text-sm text-gray-600 mt-1">
                  Total Questions: {totalQuestions} • Attempts used: {examDetails?.userAttemptInfo?.totalAttempts ?? 0} / {examDetails?.maxAttempts ?? '—'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {started ? 'In progress' : 'Not started'}
                </Badge>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* If exam not started show preview + Start button */}
              {!started && !result && (
                <div className="space-y-6">
                  <div className="p-4 bg-white border rounded-md">
                    <p className="text-gray-700">
                      You are about to start the exam. Once you start, the timer will begin (if any)
                      and you must submit when finished. You can navigate between questions using Next / Previous.
                    </p>
                    <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                      <li>Questions: {totalQuestions}</li>
                      <li>Passing score: 50%</li>
                      <li>Attempts allowed: {examDetails?.maxAttempts ?? 3}</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button variant="default" onClick={handleStart}>Start Exam</Button>
                  </div>
                </div>
              )}

              {/* Exam running */}
              {started && !result && (
                <div className="space-y-6">
                  <div className="p-4 bg-white border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Question {currentIndex + 1} of {totalQuestions}</div>
                        <h3 className="text-lg font-medium mt-2">{currentQuestion?.questionText}</h3>
                        {currentQuestion?.description && (
                          <div className="text-sm text-gray-500 mt-1">{currentQuestion.description}</div>
                        )}
                      </div>

                      <div className="text-right text-sm">
                        {/* show selected progress */}
                        <div className="text-gray-500">Answered: {Object.keys(selectedAnswers).length} / {totalQuestions}</div>
                        {examDetails?.userAttemptInfo && (
                          <div className="text-gray-400 text-xs mt-1">Attempt {examDetails.userAttemptInfo.totalAttempts + 1} / {examDetails.maxAttempts}</div>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion?.options?.map((opt, idx) => {
                        const selected = selectedAnswers[currentIndex] === opt;
                        return (
                          <button
                            key={idx}
                            onClick={() => selectOption(opt)}
                            className={`text-left p-3 rounded border transition ${
                              selected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{opt}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
                        Previous
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* If last question show Submit instead of Next */}
                      {currentIndex < totalQuestions - 1 ? (
                        <Button
                          variant="default"
                          onClick={goNext}
                          disabled={currentIndex >= totalQuestions - 1}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleSubmit}
                          disabled={submitting}
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Submit Exam
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* After submit: show result */}
              {result && (
                <div className="space-y-6">
                  <div className="p-4 bg-white border rounded-md text-center">
                    <CheckCircle2 className="mx-auto text-green-600" />
                    <h3 className="text-2xl font-semibold mt-3">Exam Completed</h3>
                    <p className="mt-2 text-gray-700">
                      Score: <span className="font-semibold">{result.currentScore}%</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Best Score: {result.bestScore}%</p>
                    <p className="text-sm text-gray-600">Attempt: {result.attemptNumber} / {result.maxAttempts}</p>
                    <p className="text-sm mt-2">
                      {result.isPassed ? (
                        <Badge variant="default">Passed</Badge>
                      ) : (
                        <Badge variant="secondary">Not Passed</Badge>
                      )}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>Back to Course</Button>
                    <Button variant="default" onClick={() => {
                      // Optionally allow retake in place if remaining attempts exist
                      if ((result.server?.remainingAttempts ?? result.remainingAttempts ?? 0) > 0) {
                        // Reload exam to allow retake
                        setResult(null);
                        setStarted(false);
                        // re-fetch to update attempt info
                        window.location.reload();
                      } else {
                        toast({ title: 'No attempts left', description: 'You have used all your attempts for this exam', variant: 'destructive' });
                      }
                    }}>
                      {((result.server?.remainingAttempts ?? result.remainingAttempts ?? 0) > 0) ? 'Retake Exam' : 'Close'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExamInterface;
