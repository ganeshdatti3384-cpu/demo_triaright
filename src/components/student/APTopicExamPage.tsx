// components/student/APTopicExamPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  BarChart3
} from 'lucide-react';

interface ExamQuestion {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
}

interface TopicExam {
  examId: string;
  topicName: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  previousAttempt?: {
    score: number;
    passed: boolean;
    attemptedAt: string;
    attemptNumber: number;
  };
}

interface ExamResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  attemptNumber: number;
  questionResults: any[];
  finalExamEligible: boolean;
}

const APTopicExamPage = () => {
  const { courseId, topicName } = useParams<{ courseId: string; topicName: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const enrollmentId = searchParams.get('enrollmentId');
  
  const [exam, setExam] = useState<TopicExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (courseId && topicName) {
      fetchExam();
    }
  }, [courseId, topicName]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (examStarted && timeLeft > 0) {
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
  }, [examStarted, timeLeft]);

  const fetchExam = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the exam',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/internships/exams/topic/${courseId}/${encodeURIComponent(topicName!)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExam(data.exam);
        setTimeLeft(data.exam.timeLimit * 60); // Convert minutes to seconds
      } else {
        throw new Error(data.message || 'Failed to fetch exam');
      }
    } catch (error: any) {
      console.error('Error fetching exam:', error);
      setError(error.message || 'Failed to load exam');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load exam',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: 'Time Up!',
      description: 'Exam time has ended. Submitting your answers...',
      variant: 'destructive'
    });
    submitExam();
  };

  const submitExam = async () => {
    if (!exam || !enrollmentId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/internships/exams/topic/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          topicName,
          answers,
          enrollmentId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
        setExamCompleted(true);
        setExamStarted(false);
        
        toast({
          title: data.result.passed ? 'Exam Passed!' : 'Exam Failed',
          description: `You scored ${data.result.score}% (Required: ${data.result.passingScore}%)`,
          variant: data.result.passed ? 'default' : 'destructive'
        });
      } else {
        throw new Error(data.message || 'Failed to submit exam');
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit exam',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    return ((currentQuestion + 1) / exam.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <div className="text-center text-gray-600">Loading exam...</div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {error ? 'Error Loading Exam' : 'Exam Not Found'}
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {error || 'The requested exam could not be found.'}
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (examCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
            <Badge variant={result.passed ? "default" : "destructive"}>
              {result.passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>

          {/* Result Card */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.passed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {result.passed ? (
                  <CheckCircle className="h-10 w-10" />
                ) : (
                  <XCircle className="h-10 w-10" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {result.passed ? 'Congratulations!' : 'Keep Practicing'}
              </CardTitle>
              <CardDescription className="text-lg">
                {result.passed 
                  ? 'You have successfully passed the topic exam!' 
                  : `You need ${result.passingScore}% to pass. Keep learning and try again.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                  <div className="text-sm text-blue-600">Score</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                  <div className="text-sm text-green-600">Correct Answers</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{result.totalQuestions}</div>
                  <div className="text-sm text-purple-600">Total Questions</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{result.attemptNumber}</div>
                  <div className="text-sm text-orange-600">Attempt</div>
                </div>
              </div>

              {result.finalExamEligible && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">Final Exam Unlocked!</p>
                      <p className="text-sm text-green-600">
                        You are now eligible to take the final exam
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4 mt-6">
                <Button 
                  onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}
                  variant="outline"
                >
                  Continue Learning
                </Button>
                {!result.passed && (
                  <Button onClick={() => window.location.reload()}>
                    Retry Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Results */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>
                Review your answers and the correct solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.questionResults.map((question, index) => (
                <div key={question.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-lg">
                      Question {index + 1}
                    </h4>
                    <Badge variant={question.isCorrect ? "default" : "destructive"}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-800 mb-4">{question.questionText}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option: string, optIndex: number) => {
                      const isUserAnswer = option === question.userAnswer;
                      const isCorrectAnswer = option === question.correctAnswer;
                      
                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded border ${
                            isCorrectAnswer
                              ? 'bg-green-50 border-green-200'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="flex-1">{option}</span>
                            {isCorrectAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="h-4 w-4 text-red-600 ml-2" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {question.description && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">{question.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
            <Badge variant="secondary">Topic Exam</Badge>
          </div>

          {/* Exam Instructions */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{exam.topicName} - Topic Exam</CardTitle>
              <CardDescription>
                Test your knowledge on {exam.topicName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Previous Attempt */}
              {exam.previousAttempt && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Previous Attempt</p>
                      <p className="text-sm text-blue-600">
                        Score: {exam.previousAttempt.score}% •{' '}
                        {exam.previousAttempt.passed ? 'Passed' : 'Failed'} •{' '}
                        Attempt #{exam.previousAttempt.attemptNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Exam Details</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {exam.totalQuestions} questions</li>
                    <li>• {exam.timeLimit} minutes time limit</li>
                    <li>• {exam.passingScore}% passing score</li>
                    <li>• Multiple attempts allowed</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                    <h3 className="font-semibold">Instructions</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Read each question carefully</li>
                    <li>• Answer all questions</li>
                    <li>• Time will be tracked automatically</li>
                    <li>• Cannot pause once started</li>
                  </ul>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center pt-4">
                <Button 
                  size="lg" 
                  onClick={startExam}
                  className="bg-green-600 hover:bg-green-700 px-8"
                >
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exam Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{exam.topicName}</h1>
                <p className="text-gray-600">Question {currentQuestion + 1} of {exam.questions.length}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center text-red-600 font-semibold">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs text-gray-500">Time Remaining</div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-blue-600">
                    {getAnsweredCount()}/{exam.questions.length}
                  </div>
                  <div className="text-xs text-gray-500">Answered</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={getProgressPercentage()} className="h-2 mt-4" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                {currentQuestion + 1}
              </span>
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQ._id] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                  onClick={() => handleAnswerSelect(currentQ._id, option)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      answers[currentQ._id] === option
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-400'
                    }`}>
                      {answers[currentQ._id] === option && '✓'}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === exam.questions.length - 1 ? (
                <Button
                  onClick={submitExam}
                  disabled={submitting || Object.keys(answers).length < exam.questions.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Exam'
                  )}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  Next Question
                </Button>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Question Navigation</h4>
              <div className="flex flex-wrap gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white'
                        : answers[exam.questions[index]._id]
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APTopicExamPage;
