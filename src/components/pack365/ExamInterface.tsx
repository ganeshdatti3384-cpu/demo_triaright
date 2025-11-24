import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Award,
  RefreshCw,
  Home
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
  type: 'easy' | 'medium' | 'hard';
  description?: string;
}

interface Exam {
  _id: string;
  examId: string;
  courseId: string;
  questions: Question[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
}

interface ExamAttempt {
  attemptNumber: number;
  score: number;
  passed: boolean;
  completedAt: string;
  answers: { [key: string]: string };
}

// FIXED: Improved exam ID extraction
const getExamId = (exam: any): string | null => {
  // Prioritize examId field, then _id, then other candidates
  if (exam.examId) return exam.examId;
  if (exam._id) return exam._id;
  if (exam.id) return exam.id;
  if (exam.mongoId) return exam.mongoId;
  if (exam.examMongoId) return exam.examMongoId;
  return null;
};

const ExamInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userAttempts, setUserAttempts] = useState<ExamAttempt[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadExamData();
  }, [stream, retryCount]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && exam) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  // FIXED: Improved exam loading with better error handling
  const loadExamData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Step 1: Get enrollments to validate eligibility
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      console.log('getMyEnrollments =>', enrollmentResponse);

      if (!enrollmentResponse.success) {
        throw new Error('Failed to fetch enrollment data');
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment) {
        throw new Error('You are not enrolled in this stream');
      }

      if (streamEnrollment.totalWatchedPercentage < 80) {
        throw new Error(`Not eligible: complete 80% of the stream (current ${Math.round(streamEnrollment.totalWatchedPercentage)}%)`);
      }

      // Step 2: Get available exams
      const availableExamsResponse = await pack365Api.getAvailableExamsForUser(token);
      console.log('getAvailableExamsForUser =>', availableExamsResponse);

      if (!availableExamsResponse || !Array.isArray(availableExamsResponse.exams)) {
        throw new Error('Failed to fetch available exams');
      }

      if (availableExamsResponse.exams.length === 0) {
        throw new Error('No exams available for your enrolled courses. Complete more content to unlock exams.');
      }

      // FIXED: Improved exam matching logic
      let streamExam: any = null;

      // Try to find exam by stream name first
      streamExam = availableExamsResponse.exams.find((exam: any) => {
        return exam.stream && typeof exam.stream === 'string' && exam.stream.toLowerCase() === stream?.toLowerCase();
      });

      // Fallback: use first available exam
      if (!streamExam) {
        streamExam = availableExamsResponse.exams[0];
        console.warn('No stream-specific exam found, using first available exam:', streamExam);
      }

      if (!streamExam) {
        throw new Error('No exam found. Please contact administrator.');
      }

      // FIXED: Use improved ID extraction
      const examId = getExamId(streamExam);
      if (!examId) {
        throw new Error('Invalid exam data: missing exam identifier');
      }

      console.log('Using exam ID:', examId);

      // Step 3: Fetch exam details and questions
      let examDetailsObj: any = null;
      let questions: any[] = [];

      try {
        // Try to get exam details
        const detailsResponse = await pack365Api.getExamDetails(token, examId);
        if (detailsResponse && detailsResponse.examDetails) {
          examDetailsObj = detailsResponse.examDetails;
        }
      } catch (detailsError) {
        console.warn('Could not fetch exam details, using fallback:', detailsError);
      }

      try {
        // Try to get questions
        const questionsResponse = await pack365Api.getExamQuestions(token, examId);
        if (questionsResponse && Array.isArray(questionsResponse.questions)) {
          questions = questionsResponse.questions;
        }
      } catch (questionsError) {
        console.warn('Could not fetch exam questions:', questionsError);
        throw new Error('Failed to load exam questions. Please try again.');
      }

      // Create exam object with fallback values
      const fullExam: Exam = {
        _id: streamExam._id || examId,
        examId: examId,
        courseId: streamExam.courseId || 'unknown',
        questions: questions,
        maxAttempts: examDetailsObj?.maxAttempts || streamExam.attemptInfo?.maxAttempts || 3,
        passingScore: examDetailsObj?.passingScore || 50,
        timeLimit: examDetailsObj?.timeLimit || 60,
        isActive: true
      };

      if (fullExam.questions.length === 0) {
        throw new Error('Exam contains no questions. Please contact administrator.');
      }

      setExam(fullExam);
      setTimeLeft(fullExam.timeLimit * 60);

      // Step 4: Load user's exam history
      try {
        const historyResponse = await pack365Api.getExamHistory(token, streamEnrollment.courseId || streamExam.courseId);
        console.log('getExamHistory =>', historyResponse);
        if (historyResponse.success && historyResponse.examHistory) {
          const attempts: ExamAttempt[] = (historyResponse.examHistory.attempts || []).map((attempt: any, index: number) => ({
            attemptNumber: index + 1,
            score: attempt.score,
            passed: attempt.score >= 50,
            completedAt: attempt.submittedAt,
            answers: {}
          }));
          setUserAttempts(attempts);
        }
      } catch (historyError) {
        console.log('Could not load exam history:', historyError);
      }

    } catch (error: any) {
      console.error('Error loading exam:', error);
      const errorMessage = error.message || 'Failed to load exam. Please check your connection and try again.';
      setLoadError(errorMessage);
      toast({
        title: 'Error loading exam',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (exam && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correctCount = 0;
    exam.questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / (exam.questions.length || 1)) * 100);
  };

  const submitExamToBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token || !exam) return;

    const score = calculateScore();

    const submission = {
      examId: exam.examId,
      courseId: exam.courseId,
      marks: score,
      timeTaken: (exam.timeLimit * 60) - timeLeft
    };

    const result = await pack365Api.submitExam(token, submission);
    if (result && result.message) {
      return result;
    }
    throw new Error('Submission failed');
  };

  const handleAutoSubmit = async () => {
    if (!exam) return;
    setSubmitting(true);
    try {
      await submitExamToBackend();
      toast({
        title: 'Time Up!',
        description: 'Exam automatically submitted due to time limit.',
        variant: 'default'
      });
      navigateToResults();
    } catch (error: any) {
      console.error('Error auto-submitting exam:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit exam automatically. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToResults = () => {
    if (!exam) return;
    
    const computedScore = calculateScore();
    const examResult = {
      score: computedScore,
      passed: computedScore >= exam.passingScore,
      totalQuestions: exam.questions.length,
      correctAnswers: Math.round((computedScore / 100) * exam.questions.length),
      timeSpent: (exam.timeLimit * 60) - timeLeft,
      attemptNumber: userAttempts.length + 1,
      submittedAt: new Date().toISOString(),
      answers: answers,
      correctAnswersMap: exam.questions.reduce((acc, q) => {
        acc[q._id] = q.correctAnswer;
        return acc;
      }, {} as { [key: string]: string })
    };

    navigate(`/exam-result/${stream}`, {
      state: {
        result: examResult,
        exam: exam
      }
    });
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const unansweredQuestions = exam.questions.filter(q => !answers[q._id]).length;
    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const result = await submitExamToBackend();

      toast({
        title: 'Exam Submitted',
        description: 'Your exam has been submitted successfully!',
        variant: 'default'
      });

      navigateToResults();
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit exam. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoadError(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // FIXED: Improved loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Exam</h3>
                <p className="text-gray-600">Preparing your exam interface...</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={() => navigate(`/pack365-learning/${stream}`)} variant="outline" size="sm">
                    <Home className="h-4 w-4 mr-1" />
                    Back to Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // FIXED: Improved error state with recovery options
  if (!exam || loadError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Available</h2>
                <p className="text-gray-600 mb-4">
                  {loadError || 'The exam for this stream is not available at the moment.'}
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Loading Exam
                  </Button>
                  <Button 
                    onClick={() => navigate(`/pack365-learning/${stream}`)} 
                    variant="outline" 
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning Portal
                  </Button>
                  <Button 
                    onClick={() => navigate('/pack365-dashboard')} 
                    variant="ghost" 
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Need help?</strong> Contact support if the problem persists.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentQ = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / (exam.questions.length || 1)) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => navigate(`/pack365-learning/${stream}`)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {stream} Stream Exam
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete all {exam.questions.length} questions to finish the exam
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'} className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>

                <Badge variant="outline">
                  {userAttempts.length + 1}/{exam.maxAttempts} Attempts
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {exam.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Questions Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {exam.questions.map((_, index) => (
                      <Button
                        key={index}
                        variant={
                          currentQuestion === index
                            ? 'default'
                            : answers[exam.questions[index]._id]
                              ? 'secondary'
                              : 'outline'
                        }
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                      <span>Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                      <span>Unanswered</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span>Answered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exam Info */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Exam Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-medium">{exam.passingScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <span className="font-medium">{exam.timeLimit} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{exam.questions.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Area */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Badge variant={
                      currentQ.type === 'easy' ? 'default' :
                        currentQ.type === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {currentQ.type.charAt(0).toUpperCase() + currentQ.type.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Question {currentQuestion + 1}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-lg font-semibold mb-6">{currentQ.questionText}</h2>

                  {/* Options */}
                  <RadioGroup
                    value={answers[currentQ._id] || ''}
                    onValueChange={(value) => handleAnswerSelect(currentQ._id, value)}
                    className="space-y-4"
                  >
                    {currentQ.options.map((option, index) => {
                      const optionId = `q-${currentQ._id}-opt-${index}`;
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option} id={optionId} />
                          <Label htmlFor={optionId} className="flex-1 cursor-pointer text-sm">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
                      Previous
                    </Button>

                    {currentQuestion === exam.questions.length - 1 ? (
                      <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>Next Question</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Submit */}
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Ready to submit your exam? Make sure you've answered all questions.</p>
                    <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamInterface;
