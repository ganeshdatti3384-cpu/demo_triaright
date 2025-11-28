import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  courseId: any; // More flexible to handle different structures
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  stream?: string; // Some exams might have stream directly
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
  attempts: Array<{
    attemptId: string;
    score: number;
    examId: string;
    submittedAt: string;
    timeTaken: number;
    isPassed: boolean;
  }>;
}

const ExamInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
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
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  useEffect(() => {
    loadExamData();
  }, [stream]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults && !showConfirmation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleAutoSubmit();
    }
  }, [timeLeft, showResults, showConfirmation]);

  const loadExamData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      if (!token) {
        setError('Authentication required');
        toast({
          title: 'Authentication Required',
          description: 'Please log in to take the exam',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      // Get ALL exams first using the working endpoint
      console.log('Fetching all exams...');
      const availableExamsResponse = await pack365Api.getAvailableExamsForUser(token);
      console.log('All exams response:', availableExamsResponse);
      
      if (!availableExamsResponse.success) {
        console.error('Exams API failed:', availableExamsResponse);
        setError(`Failed to load exams: ${availableExamsResponse.message || 'Unknown error'}`);
        return;
      }

      if (!availableExamsResponse.exams || availableExamsResponse.exams.length === 0) {
        console.log('No exams found');
        setError('No exams are currently available. Please contact administrator.');
        return;
      }

      // Filter exams for the current stream
      console.log('All exams:', availableExamsResponse.exams);
      const streamExam = availableExamsResponse.exams.find((exam: any) => {
        // Check different possible structures for course data
        const courseStream = exam.courseId?.stream || 
                            exam.courseId?.courseId?.stream || 
                            exam.stream;
        console.log('Exam course stream:', courseStream, 'Looking for:', stream?.toLowerCase());
        return courseStream?.toLowerCase() === stream?.toLowerCase();
      });

      console.log('Found stream exam:', streamExam);

      if (!streamExam) {
        // Get available streams from all exams
        const availableStreams = [...new Set(availableExamsResponse.exams
          .map((exam: any) => {
            return exam.courseId?.stream || 
                   exam.courseId?.courseId?.stream || 
                   exam.stream;
          })
          .filter(Boolean))].join(', ');
        
        setError(`No exam available for "${stream}" stream. ${availableStreams ? `Available streams: ${availableStreams}` : 'No streams available.'}`);
        return;
      }

      // Get exam details using examId or _id
      const examIdToUse = streamExam.examId || streamExam._id;
      console.log('Fetching exam details for:', examIdToUse);
      const examDetailsResponse = await pack365Api.getExamDetails(examIdToUse, token);
      console.log('Exam details response:', examDetailsResponse);
      
      if (!examDetailsResponse.success || !examDetailsResponse.exam) {
        setError('Failed to load exam details: ' + (examDetailsResponse.message || 'Unknown error'));
        return;
      }

      const examDetails = examDetailsResponse.exam;
      setExamDetails(examDetails);
      setTimeLeft(examDetails.timeLimit * 60);
      
      // Get questions without answers
      console.log('Fetching questions for exam:', examDetails.examId);
      const questionsResponse = await pack365Api.getExamQuestions(examDetails.examId, false, token);
      console.log('Questions response:', questionsResponse);
      
      if (!questionsResponse.success || !questionsResponse.questions) {
        setError('Failed to load exam questions: ' + (questionsResponse.message || 'Unknown error'));
        return;
      }

      setQuestions(questionsResponse.questions);

      // Load exam history
      try {
        const courseIdForHistory = streamExam.courseId?._id || 
                                  streamExam.courseId?.courseId?._id || 
                                  examDetails.courseId;
        if (courseIdForHistory) {
          const historyResponse = await pack365Api.getExamHistory(token, courseIdForHistory);
          console.log('Exam history:', historyResponse);
          if (historyResponse.success) {
            setExamHistory(historyResponse.examHistory);
          }
        }
      } catch (historyError) {
        console.warn('Failed to load exam history:', historyError);
        // Continue without history - it's not critical
      }

    } catch (error: any) {
      console.error('Error loading exam data:', error);
      setError(`Failed to load exam data: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const calculateScore = (): number => {
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const timeTaken = (examDetails?.timeLimit || 60) * 60 - timeLeft; // in seconds
      
      await submitExam(score, timeTaken);
    } catch (error) {
      console.error('Error auto-submitting exam:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit exam automatically. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitExam = async (score: number, timeTaken: number) => {
    if (!examDetails) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const submitResponse = await pack365Api.submitExam(token, {
        courseId: examDetails.courseId,
        examId: examDetails.examId,
        marks: score,
        timeTaken: timeTaken
      });

      if (!submitResponse.success) {
        throw new Error(submitResponse.message || 'Failed to submit exam');
      }

      setExamResult(submitResponse);
      setShowResults(true);
      setShowConfirmation(false);

      toast({
        title: 'Exam Submitted Successfully!',
        description: `Your score: ${score}%`,
        variant: 'default'
      });

    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || error.message || 'Failed to submit exam. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const timeTaken = (examDetails?.timeLimit || 60) * 60 - timeLeft;
      
      await submitExam(score, timeTaken);
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Available</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={loadExamData} variant="default">
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => navigate(`/pack365-learning/${stream}`)} 
                    variant="outline"
                  >
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p>Loading exam...</p>
          </div>
        </div>
      </>
    );
  }

  if (showResults && examResult) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  examResult.isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {examResult.isPassed ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : (
                    <XCircle className="h-8 w-8" />
                  )}
                </div>
                <CardTitle className="mt-4">
                  {examResult.isPassed ? 'Exam Passed!' : 'Exam Failed'}
                </CardTitle>
                <CardDescription>
                  {examResult.isPassed 
                    ? 'Congratulations! You have successfully passed the exam.' 
                    : 'You did not meet the passing criteria. You can retake the exam if you have attempts remaining.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{examResult.currentScore}%</div>
                    <div className="text-sm text-gray-600">Your Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{examDetails?.passingScore}%</div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">
                      {examResult.attemptNumber}/{examDetails?.maxAttempts}
                    </div>
                    <div className="text-sm text-gray-600">Attempts</div>
                  </div>
                </div>

                {examHistory && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Previous Attempts</h3>
                    <div className="space-y-2">
                      {examHistory.attempts.map((attempt, index) => (
                        <div key={attempt.attemptId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span>Attempt {index + 1}</span>
                          <Badge variant={attempt.isPassed ? "default" : "secondary"}>
                            {attempt.score}% - {attempt.isPassed ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => navigate(`/pack365-learning/${stream}`)}
                    variant="default"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Back to Learning
                  </Button>
                  
                  {examResult.canRetake && (
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Retake Exam
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => navigate('/pack365-dashboard')}
                    variant="outline"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredQuestions} out of {totalQuestions} questions. 
              Are you sure you want to submit your exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Continue Exam
            </Button>
            <Button 
              onClick={handleSubmitExam} 
              disabled={isSubmitting}
              variant="default"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Exam'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Exam Header */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => navigate(`/pack365-learning/${stream}`)}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning
                  </Button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {stream} Stream Exam
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Complete all questions before time runs out
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Timer */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                  
                  {/* Progress */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">
                      {answeredQuestions}/{totalQuestions}
                    </div>
                    <div className="text-xs text-gray-500">Answered</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questions Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAnswers[index] 
                            ? "default" 
                            : currentQuestionIndex === index 
                            ? "outline" 
                            : "ghost"
                        }
                        size="sm"
                        className={`h-8 w-8 p-0 ${
                          currentQuestionIndex === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleQuestionNavigation(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Exam Info */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-medium">{examDetails?.timeLimit} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passing Score:</span>
                      <span className="font-medium">{examDetails?.passingScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Attempts:</span>
                      <span className="font-medium">{examDetails?.maxAttempts}</span>
                    </div>
                    {examHistory && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining Attempts:</span>
                        <span className="font-medium">{examHistory.remainingAttempts}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Question Area */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  {currentQuestion && (
                    <div className="space-y-6">
                      {/* Question Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className={getDifficultyColor(currentQuestion.type)}>
                            {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
                          </Badge>
                          <h2 className="text-lg font-semibold mt-2">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                          </h2>
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil(currentQuestion.questionText.length / 100)} min read
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 leading-relaxed">
                          {currentQuestion.questionText}
                        </p>
                      </div>

                      {/* Options */}
                      <RadioGroup
                        value={selectedAnswers[currentQuestionIndex] || ''}
                        onValueChange={handleAnswerSelect}
                        className="space-y-3"
                      >
                        {currentQuestion.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <RadioGroupItem value={option} id={`option-${optionIndex}`} />
                            <Label
                              htmlFor={`option-${optionIndex}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-4 border-t">
                        <Button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          variant="outline"
                        >
                          Previous
                        </Button>
                        
                        <div className="flex gap-2">
                          {currentQuestionIndex === totalQuestions - 1 ? (
                            <Button
                              onClick={() => setShowConfirmation(true)}
                              variant="default"
                            >
                              Submit Exam
                            </Button>
                          ) : (
                            <Button
                              onClick={handleNextQuestion}
                              variant="default"
                            >
                              Next Question
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Submit Button for Mobile */}
              <div className="lg:hidden mt-4">
                <Button
                  onClick={() => setShowConfirmation(true)}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  Submit Exam
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamInterface;
