import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
  import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowLeft,
  Award,
  Loader2
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  type: 'easy' | 'medium' | 'hard';
  description?: string;
}

interface ExamDetails {
  _id: string;
  examId: string;
  courseId: string;
  questions: Question[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  stream: string;
}

interface AvailableExam {
  _id: string;
  examId: string;
  courseId: string; // backend returns ObjectId
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
}

interface ExamHistoryRecord {
  attemptId: string;
  score: number;
  examId: string;
  submittedAt: string;
  timeTaken: number;
  isPassed: boolean;
}

interface ExamHistory {
  courseName: string;
  totalAttempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  bestScore: number;
  currentScore: number;
  isExamCompleted: boolean;
  lastAttempt: string;
  isPassed: boolean;
  canRetake: boolean;
  attempts: ExamHistoryRecord[];
}

const ExamInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examHistory, setExamHistory] = useState<ExamHistory | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Load exam when stream changes
  useEffect(() => {
    loadExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !showResults && !showConfirmation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleAutoSubmit();
    }
  }, [timeLeft, showResults, showConfirmation]);

  // -------------------------------------------------
  // LOAD EXAM BASED ON STREAM
  // -------------------------------------------------
  const loadExamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to take the exam',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      // 1) Get available exams
      const availableExams = await pack365Api.getAvailableExamsForUser(token);
      if (!availableExams.success || !availableExams.exams.length) {
        setError('No exams available.');
        return;
      }

      // 2) Match exam by resolving each courseId
      let selectedExam: AvailableExam | null = null;
      let selectedCourse: Course | null = null;

      for (const exam of availableExams.exams) {
        try {
          const courseResponse = await pack365Api.getCourseById(String(exam.courseId));
          const course = courseResponse.data || courseResponse.course || null;
          if (!course) continue;

          const courseStream = course.stream?.toLowerCase() || '';
          if (courseStream === (stream || '').toLowerCase()) {
            selectedExam = exam;
            selectedCourse = course;
            break;
          }
        } catch (err) {
          console.warn('Failed to fetch course for exam:', exam, err);
        }
      }

      if (!selectedExam || !selectedCourse) {
        setError(`No exam found for stream "${stream}".`);
        return;
      }

      setCourseDetails(selectedCourse);

      // 3) Load exam details
      const examId = selectedExam.examId;
      const examDetailResp = await pack365Api.getExamDetails(examId, token);

      if (!examDetailResp.success || !examDetailResp.exam) {
        setError('Failed to load exam details.');
        return;
      }

      setExamDetails(examDetailResp.exam);
      setTimeLeft((examDetailResp.exam.timeLimit || 60) * 60);

      // 4) Load questions
      const questionResp = await pack365Api.getExamQuestions(examId, false, token);
      if (!questionResp.success) {
        setError('Failed to load exam questions.');
        return;
      }

      setQuestions(questionResp.questions);

      // 5) Load history
      try {
        const historyResp = await pack365Api.getExamHistory(token, selectedCourse._id);
        if (historyResp.success) {
          setExamHistory(historyResp.examHistory);
        }
      } catch (historyErr) {
        console.warn('History load failed:', historyErr);
      }

    } catch (err: any) {
      console.error('Load exam error:', err);
      setError('Failed to load exam.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------
  // HANDLE ANSWER SELECT
  // -------------------------------------------------
  const handleAnswerSelect = (index: number, value: string) => {
    setSelectedAnswers({ ...selectedAnswers, [index]: value });
  };

  // -------------------------------------------------
  // SUBMIT EXAM
  // -------------------------------------------------
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const courseId = courseDetails?._id;
      const examId = examDetails?.examId;

      if (!courseId || !examId) {
        toast({ title: 'Error', description: 'Invalid exam/course.', variant: 'destructive' });
        return;
      }

      // Calculate score
      let score = 0;
      questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correctAnswer) score++;
      });

      const submitResp = await pack365Api.submitExam(token, {
        courseId,
        examId,
        marks: score,
        timeTaken: (examDetails?.timeLimit || 0) * 60 - timeLeft
      });

      if (!submitResp.success) {
        toast({ title: 'Error', description: submitResp.message, variant: 'destructive' });
        return;
      }

      setExamResult(submitResp);
      setShowResults(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to submit exam.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!showResults) handleSubmit();
  };

  // -------------------------------------------------
  // UI LOADING & ERRORS
  // -------------------------------------------------
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 text-lg">{error}</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </>
    );
  }

  if (!examDetails || !courseDetails) {
    return null;
  }

  // -------------------------------------------------
  // RENDER EXAM UI
  // -------------------------------------------------
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{courseDetails.courseName} - Exam</CardTitle>
            <CardDescription>
              Answer all questions. Passing Score: {examDetails.passingScore}%
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              <Badge variant="secondary">
                {answeredQuestions} / {totalQuestions}
              </Badge>
            </div>

            <Progress value={progressPercentage} className="mb-6" />

            <div className="mb-4">
              <h2 className="font-semibold mb-2">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h2>
              <p className="mb-3">{currentQuestion.questionText}</p>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]}
                onValueChange={(value) =>
                  handleAnswerSelect(currentQuestionIndex, value)
                }
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              >
                Previous
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => setShowConfirmation(true)}
                  disabled={isSubmitting}
                >
                  Submit Exam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CONFIRMATION DIALOG */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Exam?</DialogTitle>
              <DialogDescription>
                Once submitted, you cannot change your answers.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RESULT DIALOG */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exam Results</DialogTitle>
            </DialogHeader>

            {examResult ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Score: {examResult.currentScore}
                </h2>
                <p>
                  Best Score: {examResult.bestScore} / Attempts: {examResult.attemptNumber}/{examResult.maxAttempts}
                </p>

                {examResult.isPassed ? (
                  <div className="text-green-600 mt-4 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-6 w-6" /> Passed
                  </div>
                ) : (
                  <div className="text-red-600 mt-4 flex items-center justify-center gap-2">
                    <XCircle className="h-6 w-6" /> Failed
                  </div>
                )}

                <Button className="mt-6" onClick={() => navigate('/pack365')}>
                  Back to Learning
                </Button>
              </div>
            ) : (
              <p>No result found.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ExamInterface;
