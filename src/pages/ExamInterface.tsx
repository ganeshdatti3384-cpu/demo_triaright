import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { pack365Api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  questionText: string;
  options: string[];
  type: 'easy' | 'medium' | 'hard';
}

interface ExamData {
  questions: Question[];
  maxAttempts: number;
  examId: string;
}

interface ExamDetails {
  examId: string;
  courseName: string;
  maxAttempts: number;
  totalQuestions: number;
  userAttemptInfo: {
    totalAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    canTakeExam: boolean;
    isPassed: boolean;
    lastAttempt: string | null;
  } | null;
}

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Exam state
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Fetch exam details and questions
  useEffect(() => {
    if (examId && token) {
      fetchExamData();
    }
  }, [examId, token]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (examStarted && timeRemaining > 0 && !examCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Show warning at 5 minutes
          if (newTime === 300 && !showTimeWarning) {
            setShowTimeWarning(true);
            toast.warning('5 minutes remaining!');
          }
          
          // Auto-submit when time is up
          if (newTime <= 0) {
            handleAutoSubmit();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, timeRemaining, examCompleted, showTimeWarning]);

  const fetchExamData = async () => {
    if (!examId || !token) return;

    try {
      setLoading(true);
      
      // Fetch exam details first
      const detailsResponse = await pack365Api.getExamDetails(token, examId);
      setExamDetails(detailsResponse.examDetails);

      // Check if user can take the exam
      if (!detailsResponse.examDetails.userAttemptInfo?.canTakeExam) {
        toast.error('You cannot take this exam. Check your course progress or attempt limits.');
        navigate('/exams');
        return;
      }

      // Fetch exam questions
      const questionsResponse = await pack365Api.getExamQuestions(token, examId);
      setExamData(questionsResponse);
      
      // Set initial time (default 60 minutes if not specified)
      setTimeRemaining(60 * 60); // 60 minutes in seconds
      
    } catch (error: any) {
      console.error('Error fetching exam data:', error);
      toast.error(error.response?.data?.message || 'Failed to load exam');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
    toast.success('Exam started! Good luck!');
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (examData && currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!examData) return 0;
    
    // For demo purposes, we'll simulate scoring
    // In real implementation, this would be done on the backend
    const totalQuestions = examData.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    // Simple simulation: assume 70% correct answers
    return Math.round((answeredQuestions / totalQuestions) * 70);
  };

  const handleSubmitExam = async () => {
    if (!examData || !examDetails || !token) return;

    try {
      setSubmitting(true);
      
      const score = calculateScore();
      const timeTaken = (60 * 60) - timeRemaining; // Time taken in seconds

      // Find the course ID from exam details
      const courseId = examDetails.examId; // This should be mapped correctly from your backend

      const submitData = {
        courseId: courseId,
        examId: examData.examId,
        marks: score,
        timeTaken: Math.round(timeTaken / 60) // Convert to minutes
      };

      const response = await pack365Api.submitExam(examData.examId, submitData, token);
      
      setExamCompleted(true);
      setShowSubmitDialog(false);
      
      toast.success(`Exam submitted successfully! Score: ${response.currentScore}%`);
      
      // Navigate to results or back to exams list
      setTimeout(() => {
        navigate('/exams');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    toast.warning('Time is up! Auto-submitting exam...');
    handleSubmitExam();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    if (!examData) return 0;
    return Math.round((getAnsweredCount() / examData.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!examData || !examDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</h2>
          <p className="text-gray-600 mb-4">The requested exam could not be loaded.</p>
          <Button onClick={() => navigate('/exams')} variant="outline">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Exam Completed!</CardTitle>
            <CardDescription>Your exam has been submitted successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You will be redirected to the exams page shortly.
            </p>
            <Button onClick={() => navigate('/exams')} className="w-full">
              View All Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{examDetails.courseName} - Exam</CardTitle>
            <CardDescription className="text-center">
              Exam ID: {examDetails.examId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exam Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-blue-600">{examData.questions.length}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Time Limit</p>
                <p className="text-2xl font-bold text-green-600">60 min</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Passing Score</p>
                <p className="text-2xl font-bold text-orange-600">50%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Attempts Left</p>
                <p className="text-2xl font-bold text-purple-600">
                  {examDetails.userAttemptInfo?.remainingAttempts || 0}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You have 60 minutes to complete the exam</li>
                <li>• Each question has 4 options, select the best answer</li>
                <li>• You can navigate between questions using the navigation buttons</li>
                <li>• The exam will auto-submit when time runs out</li>
                <li>• Make sure you have a stable internet connection</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/exams')} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exams
              </Button>
              <Button onClick={startExam} className="flex-1">
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{examDetails.courseName}</h1>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {examData.questions.length}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="w-32">
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
              <span className="text-sm font-medium">{getAnsweredCount()}/{examData.questions.length}</span>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <Badge variant={currentQuestion.type === 'easy' ? 'default' : currentQuestion.type === 'medium' ? 'secondary' : 'destructive'}>
                {currentQuestion.type}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="text-lg text-gray-900 leading-relaxed">
              {currentQuestion.questionText}
            </div>

            {/* Options */}
            <RadioGroup
              value={answers[currentQuestionIndex] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestionIndex, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentQuestionIndex === examData.questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {examData.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? "default" : answers[index] ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className="w-10 h-10 p-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {examData.questions.length} questions.
              {getAnsweredCount() < examData.questions.length && (
                <span className="block mt-2 text-yellow-600">
                  Warning: You have {examData.questions.length - getAnsweredCount()} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamInterface;