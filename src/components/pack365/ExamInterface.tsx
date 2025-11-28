/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BarChart3,
  History
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
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
  attemptId: string;
  examId: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
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
  attempts: ExamAttempt[];
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

const ExamInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stream } = useParams<{ stream: string }>();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [history, setHistory] = useState<ExamHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;

  useEffect(() => {
    const initializeExam = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      if (!courseId) {
        toast({ title: 'No Course Selected', variant: 'destructive' });
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      try {
        setLoading(true);

        // Check enrollment and eligibility
        const enrollmentResponse = await axios.get(
          `${API_BASE_URL}/pack365/enrollments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const streamEnrollment = enrollmentResponse.data.enrollments.find(
          (e: any) => e.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (!streamEnrollment) {
          toast({ title: 'Not Enrolled', variant: 'destructive' });
          navigate(`/pack365-learning/${stream}`);
          return;
        }

        if (streamEnrollment.totalWatchedPercentage < 80) {
          toast({ 
            title: 'Not Eligible', 
            description: 'Complete 80% of the course to take the exam.',
            variant: 'destructive' 
          });
          navigate(`/pack365-learning/${stream}`);
          return;
        }

        // Fetch exam for course
        const examsResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/available`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const courseExam = examsResponse.data.exams.find(
          (e: any) => e.courseId === courseId
        );

        if (!courseExam) {
          toast({ 
            title: 'No Exam Available', 
            description: 'No exam found for this course.',
            variant: 'destructive' 
          });
          navigate(`/pack365-learning/${stream}`);
          return;
        }

        // Get exam details
        const examDetailsResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/details/${courseExam.examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (examDetailsResponse.data.success) {
          setExam(examDetailsResponse.data.exam);
          setTimeLeft(examDetailsResponse.data.exam.timeLimit * 60); // Convert to seconds
        }

        // Get exam history
        const historyResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/history/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (historyResponse.data.success) {
          setHistory(historyResponse.data.examHistory);
        }

      } catch (error: any) {
        console.error('Error initializing exam:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load exam.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [courseId, stream, navigate, toast]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const startExam = () => {
    if (history && history.remainingAttempts <= 0) {
      toast({ 
        title: 'No Attempts Left', 
        description: 'You have used all your exam attempts.',
        variant: 'destructive' 
      });
      return;
    }
    setExamStarted(true);
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = (): number => {
    if (!exam) return 0;

    let correctAnswers = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return (correctAnswers / exam.questions.length) * 100;
  };

  const handleAutoSubmit = async () => {
    if (!exam) return;
    
    const score = calculateScore();
    await submitExam(score, timeLeft);
  };

  const submitExam = async (score?: number, remainingTime?: number) => {
    if (!exam) return;

    const token = localStorage.getItem('token');
    const finalScore = score || calculateScore();
    const timeTaken = exam.timeLimit * 60 - (remainingTime || timeLeft);

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/pack365/exams/submit`,
        {
          courseId: courseId,
          examId: exam.examId,
          marks: finalScore,
          timeTaken: timeTaken
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setExamResult(response.data);
        setShowResults(true);
        setExamStarted(false);
        
        toast({ 
          title: response.data.isPassed ? 'Exam Passed!' : 'Exam Failed', 
          variant: response.data.isPassed ? 'default' : 'destructive' 
        });
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to submit exam.', 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetakeExam = () => {
    setShowResults(false);
    setExamStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(exam?.timeLimit ? exam.timeLimit * 60 : 0);
    setExamResult(null);
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

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Exam Not Available</h2>
          <p className="text-gray-500 mb-6">Unable to load exam content.</p>
          <Button onClick={() => navigate(`/pack365-learning/${stream}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  examResult.isPassed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {examResult.isPassed ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <CardTitle className={`text-2xl ${
                  examResult.isPassed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {examResult.isPassed ? 'Exam Passed!' : 'Exam Failed'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {examResult.currentScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-600">Your Score</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {examResult.bestScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Best Score</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {examResult.attemptNumber}
                    </div>
                    <div className="text-sm text-purple-600">Attempt</div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {examResult.remainingAttempts}
                    </div>
                    <div className="text-sm text-orange-600">Remaining</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    Passing Score: {exam.passingScore}%
                  </p>
                  {examResult.isPassed ? (
                    <p className="text-green-600">Congratulations! You passed the exam.</p>
                  ) : (
                    <p className="text-red-600">
                      You need {exam.passingScore - Math.ceil(examResult.currentScore)}% more to pass.
                    </p>
                  )}
                </div>

                <div className="flex justify-center space-x-4">
                  {examResult.canRetake && (
                    <Button onClick={handleRetakeExam} variant="outline">
                      Retake Exam
                    </Button>
                  )}
                  
                  <Button onClick={() => navigate(`/pack365-learning/${stream}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning
                  </Button>
                  
                  <Button 
                    onClick={() => navigate(`/exam-result/${stream}`, { state: { examResult } })}
                    variant="secondary"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Detailed Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (!examStarted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Exam Instructions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Course: {courseName}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Questions:</span>
                        <span className="font-semibold">{exam.questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-semibold">{exam.timeLimit} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Passing Score:</span>
                        <span className="font-semibold">{exam.passingScore}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Attempts:</span>
                        <span className="font-semibold">{exam.maxAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Attempts:</span>
                        <span className="font-semibold">
                          {history ? history.totalAttempts : 0} / {exam.maxAttempts}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best Score:</span>
                        <span className="font-semibold">
                          {history?.bestScore ? `${history.bestScore.toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• The exam must be completed in one session</li>
                    <li>• Timer will start when you begin the exam</li>
                    <li>• You cannot pause the exam once started</li>
                    <li>• Answers are auto-saved as you select them</li>
                    <li>• Exam will auto-submit when time expires</li>
                  </ul>
                </div>

                {history && history.attempts.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      Previous Attempts
                    </h4>
                    <div className="space-y-2">
                      {history.attempts.slice(0, 3).map((attempt, index) => (
                        <div key={attempt.attemptId} className="flex justify-between items-center text-sm">
                          <span>Attempt {history.totalAttempts - index}:</span>
                          <Badge variant={attempt.isPassed ? "default" : "destructive"}>
                            {attempt.score.toFixed(1)}% - {attempt.isPassed ? 'Passed' : 'Failed'}
                          </Badge>
                          <span className="text-gray-500">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate(`/pack365-learning/${stream}`)} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning
                  </Button>
                  
                  <Button 
                    onClick={startExam}
                    disabled={history && history.remainingAttempts <= 0}
                    size="lg"
                  >
                    Start Exam
                  </Button>
                </div>

                {history && history.remainingAttempts <= 0 && (
                  <div className="text-center text-red-600 font-semibold">
                    No attempts remaining. Please contact administrator.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const currentQuestionData = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Exam Header */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-xl font-bold">{courseName} - Exam</h1>
                  <p className="text-gray-600 text-sm">
                    Question {currentQuestion + 1} of {exam.questions.length}
                  </p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-bold text-red-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  <Progress value={progress} className="w-32" />
                  
                  <Button 
                    onClick={() => submitExam()}
                    disabled={submitting}
                    variant="default"
                  >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questions Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {exam.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${
                          index === currentQuestion
                            ? 'bg-blue-500 text-white border-blue-500'
                            : answers[index]
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Current Question</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Unanswered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        currentQuestionData.type === 'easy' ? 'default' :
                        currentQuestionData.type === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {currentQuestionData.type.charAt(0).toUpperCase() + currentQuestionData.type.slice(1)}
                      </Badge>
                      
                      <span className="text-sm text-gray-500">
                        Question {currentQuestion + 1} / {exam.questions.length}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="text-lg font-medium">
                      {currentQuestionData.questionText}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuestionData.options.map((option, optionIndex) => {
                        const isSelected = answers[currentQuestion] === option;
                        const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                        
                        return (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(currentQuestion, option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {optionLetter}
                              </div>
                              <span>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      
                      <Button
                        onClick={() => setCurrentQuestion(prev => 
                          Math.min(exam.questions.length - 1, prev + 1)
                        )}
                        disabled={currentQuestion === exam.questions.length - 1}
                      >
                        Next Question
                      </Button>
                    </div>
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
