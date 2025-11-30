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
  courseId: string;
  courseName: string;
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  courseProgress?: any;
  attemptInfo?: {
    totalAttempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    currentScore: number;
    lastAttempt: string | null;
    canRetake: boolean;
    isPassed: boolean;
  };
}

const ExamInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [selectedExam, setSelectedExam] = useState<AvailableExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  // LOAD EXAM BASED ON STREAM - UPDATED TO MATCH BACKEND
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

      // 1) Get available exams for user
      const availableExams = await pack365Api.getAvailableExamsForUser(token);
      
      console.log('Available exams response:', availableExams);

      if (!availableExams.success || !availableExams.exams || availableExams.exams.length === 0) {
        setError('No exams available. Complete 100% of a course to unlock exams.');
        return;
      }

      // 2) Find exam for current stream
      const streamExam = availableExams.exams.find((exam: AvailableExam) => {
        // Check if course belongs to current stream
        return exam.courseProgress?.stream?.toLowerCase() === stream?.toLowerCase() ||
               exam.courseName?.toLowerCase().includes(stream?.toLowerCase() || '');
      });

      if (!streamExam) {
        setError(`No exam found for stream "${stream}". Complete 100% of a course in this stream.`);
        return;
      }

      setSelectedExam(streamExam);
      console.log('Selected exam:', streamExam);

      // 3) Load exam details
      const examDetailResp = await pack365Api.getExamDetails(streamExam.examId, token);

      if (!examDetailResp.success || !examDetailResp.exam) {
        setError('Failed to load exam details.');
        return;
      }

      console.log('Exam details:', examDetailResp.exam);
      setExamDetails(examDetailResp.exam);
      setTimeLeft((examDetailResp.exam.timeLimit || 60) * 60);

      // 4) Load questions
      const questionResp = await pack365Api.getExamQuestions(streamExam.examId, false, token);
      if (!questionResp.success || !questionResp.questions) {
        setError('Failed to load exam questions.');
        return;
      }

      console.log('Loaded questions:', questionResp.questions);
      setQuestions(questionResp.questions);

    } catch (err: any) {
      console.error('Load exam error:', err);
      setError(err.response?.data?.message || 'Failed to load exam data');
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
  // SUBMIT EXAM - UPDATED TO MATCH BACKEND
  // -------------------------------------------------
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!selectedExam || !examDetails) {
        toast({ title: 'Error', description: 'Exam data not loaded properly', variant: 'destructive' });
        return;
      }

      // Calculate score based on correct answers
      let correctAnswers = 0;
      questions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correctAnswer) correctAnswers++;
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      // Submit exam using backend structure
      const submitResp = await pack365Api.submitExam(token, {
        courseId: selectedExam.courseId,
        examId: selectedExam.examId,
        marks: score,
        timeTaken: (examDetails.timeLimit || 0) * 60 - timeLeft
      });

      console.log('Submit response:', submitResp);

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

    } catch (err: any) {
      console.error('Submit exam error:', err);
      toast({ 
        title: 'Error', 
        description: err.response?.data?.message || 'Failed to submit exam', 
        variant: 'destructive' 
      });
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
        <div className="flex flex-col items-center justify-center h-screen gap-3 p-4">
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 text-lg text-center">{error}</p>
          <div className="flex gap-2">
            <Button onClick={loadExamData}>Try Again</Button>
            <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
          </div>
        </div>
      </>
    );
  }

  if (!examDetails || !selectedExam) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <p className="text-lg">No exam data available</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
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
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedExam.courseName} - Exam</CardTitle>
            <CardDescription>
              Answer all questions. Passing Score: {selectedExam.passingScore}%
              {selectedExam.attemptInfo && (
                <span className="ml-2">
                  (Attempt {selectedExam.attemptInfo.totalAttempts + 1} of {selectedExam.attemptInfo.maxAttempts})
                </span>
              )}
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

            {currentQuestion && (
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
            )}

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
                {selectedExam.attemptInfo && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded">
                    <p className="text-sm">
                      This is attempt {selectedExam.attemptInfo.totalAttempts + 1} of {selectedExam.attemptInfo.maxAttempts}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
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
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  examResult.isPassed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {examResult.isPassed ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mt-4 mb-2">
                  Score: {examResult.currentScore}%
                </h2>
                
                <div className="space-y-2 mb-4">
                  <p className="text-lg">
                    <span className={examResult.isPassed ? 'text-green-600' : 'text-red-600'}>
                      {examResult.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </p>
                  <p>Best Score: {examResult.bestScore}%</p>
                  <p>Attempt: {examResult.attemptNumber}/{examResult.maxAttempts}</p>
                  <p>Remaining Attempts: {examResult.remainingAttempts}</p>
                </div>

                {examResult.canRetake && !examResult.isPassed && (
                  <div className="p-3 bg-blue-50 rounded mb-4">
                    <p className="text-sm text-blue-700">
                      You can retake this exam. Remaining attempts: {examResult.remainingAttempts}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/pack365')}>
                    Back to Learning
                  </Button>
                  {examResult.canRetake && !examResult.isPassed && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowResults(false);
                        setSelectedAnswers({});
                        setCurrentQuestionIndex(0);
                        setTimeLeft((examDetails.timeLimit || 60) * 60);
                      }}
                    >
                      Retake Exam
                    </Button>
                  )}
                </div>
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
