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
  courseId: {
    _id: string;
    courseName: string;
  };
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

interface ExamResult {
  message: string;
  currentScore: number;
  bestScore: number;
  attemptNumber: number;
  maxAttempts: number;
  remainingAttempts: number;
  isPassed: boolean;
  canRetake: boolean;
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
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
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
  // LOAD EXAM BASED ON STREAM - UPDATED TO USE /exams/all
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

      // 1) Get all exams using /exams/all endpoint
      const allExamsResponse = await pack365Api.getAllExams(token);
      if (!allExamsResponse.success || !allExamsResponse.exams?.length) {
        setError('No exams available.');
        return;
      }

      // 2) Filter active exams and match by stream
      const activeExams = allExamsResponse.exams.filter((exam: AvailableExam) => exam.isActive);
      
      let selectedExam: AvailableExam | null = null;
      let selectedCourse: Course | null = null;

      for (const exam of activeExams) {
        try {
          // Get course details from the exam data or fetch separately if needed
          const course = exam.courseId;
          if (!course) continue;

          const courseStream = course.courseName?.toLowerCase() || '';
          const targetStream = (stream || '').toLowerCase();
          
          // Match by stream name in course name or separate stream field
          if (courseStream.includes(targetStream) || courseStream === targetStream) {
            selectedExam = exam;
            
            // Create course details from exam data
            selectedCourse = {
              _id: course._id,
              courseId: course._id, // Using _id as courseId since it's not directly available
              courseName: course.courseName,
              stream: targetStream
            };
            break;
          }
        } catch (err) {
          console.warn('Failed to process exam:', exam, err);
        }
      }

      if (!selectedExam || !selectedCourse) {
        setError(`No active exam found for stream "${stream}".`);
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

      // 4) Load questions (without answers for student)
      const questionResp = await pack365Api.getExamQuestions(examId, false, token);
      if (!questionResp.success || !questionResp.questions) {
        setError('Failed to load exam questions.');
        return;
      }

      setQuestions(questionResp.questions);

      // 5) Load history using course ID from the selected exam
      try {
        const historyResp = await pack365Api.getExamHistory(token, selectedCourse._id);
        if (historyResp.success && historyResp.examHistory) {
          setExamHistory(historyResp.examHistory);
        }
      } catch (historyErr) {
        console.warn('History load failed:', historyErr);
      }

    } catch (err: any) {
      console.error('Load exam error:', err);
      setError(err.response?.data?.message || 'Failed to load exam.');
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

      // Calculate score based on correct answers
      let score = 0;
      questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correctAnswer) score++;
      });

      // Convert score to percentage
      const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

      // Submit exam
      const submitResp = await pack365Api.submitExam(token, {
        courseId,
        examId,
        marks: scorePercentage, // Send percentage score
        timeTaken: (examDetails?.timeLimit || 0) * 60 - timeLeft
      });

      if (!submitResp.success) {
        toast({ 
          title: 'Error', 
          description: submitResp.message || 'Failed to submit exam', 
          variant: 'destructive' 
        });
        return;
      }

      setExamResult(submitResp);
      setShowResults(true);
      setShowConfirmation(false);
      
      toast({
        title: 'Exam Submitted',
        description: `Your exam has been submitted successfully. Score: ${scorePercentage.toFixed(1)}%`,
        variant: 'default'
      });

    } catch (err: any) {
      console.error('Submit exam error:', err);
      toast({ 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to submit exam.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!showResults && !showConfirmation) {
      toast({
        title: 'Time Up!',
        description: 'Time has expired. Submitting your exam automatically.',
        variant: 'default'
      });
      handleSubmit();
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <Button onClick={() => navigate('/pack365')}>Back to Learning</Button>
        </div>
      </>
    );
  }

  if (!examDetails || !courseDetails || !questions.length) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <p className="text-lg">No exam content available.</p>
          <Button onClick={() => navigate('/pack365')}>Back to Learning</Button>
        </div>
      </>
    );
  }

  // -------------------------------------------------
  // RENDER EXAM UI
  // -------------------------------------------------
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/pack365')} className="mb-4 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{courseDetails.courseName} - Exam</CardTitle>
                <CardDescription>
                  Answer all questions. Passing Score: {examDetails.passingScore}%
                  {examHistory && (
                    <span className="ml-2">
                      (Attempts: {examHistory.totalAttempts || 0}/{examDetails.maxAttempts})
                    </span>
                  )}
                </CardDescription>
              </div>
              <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Progress: {answeredQuestions} / {totalQuestions} questions
              </span>
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
            </div>

            <Progress value={progressPercentage} className="mb-6" />

            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.type}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-4">{currentQuestion.questionText}</h3>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex] || ''}
                onValueChange={(value) =>
                  handleAnswerSelect(currentQuestionIndex, value)
                }
              >
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-3 mb-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
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

        {/* Question Navigation Dots */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary text-primary-foreground'
                  : selectedAnswers[index]
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* CONFIRMATION DIALOG */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Exam?</DialogTitle>
              <DialogDescription>
                You have answered {answeredQuestions} out of {totalQuestions} questions.
                Once submitted, you cannot change your answers.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Continue Exam
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Exam'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RESULT DIALOG */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Exam Results</DialogTitle>
            </DialogHeader>

            {examResult ? (
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  examResult.isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {examResult.isPassed ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : (
                    <XCircle className="h-8 w-8" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {examResult.currentScore.toFixed(1)}%
                  </h3>
                  <p className={`text-lg font-semibold ${
                    examResult.isPassed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {examResult.isPassed ? 'Passed' : 'Failed'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>Best Score</p>
                    <p className="font-semibold text-foreground">
                      {examResult.bestScore.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p>Attempt</p>
                    <p className="font-semibold text-foreground">
                      {examResult.attemptNumber}/{examResult.maxAttempts}
                    </p>
                  </div>
                </div>

                {examResult.canRetake && !examResult.isPassed && (
                  <p className="text-sm text-yellow-600">
                    You can retake the exam. {examResult.remainingAttempts} attempts remaining.
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResults(false)}
                    className="flex-1"
                  >
                    Review
                  </Button>
                  <Button 
                    onClick={() => navigate('/pack365')}
                    className="flex-1"
                  >
                    Back to Learning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Processing results...</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ExamInterface;
