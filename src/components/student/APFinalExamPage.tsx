// components/student/APFinalExamPage.tsx
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
  Award,
  BarChart3,
  Download
} from 'lucide-react';

interface ExamQuestion {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
}

interface FinalExam {
  examId: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  currentAttempt: number;
  remainingAttempts: number;
  questions: ExamQuestion[];
  previousAttempts: Array<{
    attemptNumber: number;
    score: number;
    passed: boolean;
    attemptedAt: string;
  }>;
}

interface ExamResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  attemptNumber: number;
  remainingAttempts: number;
  questionResults: any[];
  courseCompleted: boolean;
}

const APFinalExamPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const enrollmentId = searchParams.get('enrollmentId');
  
  const [exam, setExam] = useState<FinalExam | null>(null);
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
    if (courseId) {
      fetchExam();
    }
  }, [courseId]);

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
      
      const response = await fetch(`/api/internships/exams/final/${courseId}`, {
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
      
      const response = await fetch('/api/internships/exams/final/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
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
          title: data.result.passed ? 'Final Exam Passed!' : 'Final Exam Failed',
          description: `You scored ${data.result.score}% (Required: ${data.result.passingScore}%)`,
          variant: data.result.passed ? 'default' : 'destructive'
        });

        // If course completed and passed, show certificate option immediately
        if (data.result.passed && data.result.courseCompleted) {
          toast({
            title: 'Course Completed!',
            description: 'Congratulations! You can now download your certificate.',
            variant: 'default'
          });
        }
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
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    return ((currentQuestion + 1) / exam.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const handleDownloadCertificate = () => {
    if (enrollmentId && result?.courseCompleted) {
      navigate(`/ap-internship-certificate/${enrollmentId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
          <div className="text-center text-gray-600">Loading final exam...</div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
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
                {error || 'The final exam could not be found or you are not eligible.'}
              </p>
              <Button onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (examCompleted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
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
                  <Award className="h-10 w-10" />
                ) : (
                  <XCircle className="h-10 w-10" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {result.passed ? 'Congratulations!' : 'Final Exam Result'}
              </CardTitle>
              <CardDescription className="text-lg">
                {result.passed 
                  ? 'You have successfully passed the final exam!' 
                  : `You need ${result.passingScore}% to pass. ${result.remainingAttempts > 0 ? `You have ${result.remainingAttempts} attempt(s) remaining.` : 'No attempts remaining.'}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                  <div className="text-sm text-blue-600">Final Score</div>
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

              {result.courseCompleted && (
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">Course Completed!</p>
                      <p className="text-sm text-green-600">
                        You have successfully completed the entire course. You can now download your certificate.
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
                  Back to Course
                </Button>
                {!result.passed && result.remainingAttempts > 0 && (
                  <Button onClick={() => window.location.reload()}>
                    Retry Exam (Attempt {result.attemptNumber + 1})
                  </Button>
                )}
                {result.courseCompleted && result.passed && (
                  <Button 
                    onClick={handleDownloadCertificate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Previous Attempts */}
          {exam.previousAttempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Attempts</CardTitle>
                <CardDescription>
                  Your performance history for this final exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exam.previousAttempts.map((attempt, index) => (
                    <div
                      key={attempt.attemptNumber}
                      className={`p-4 border rounded-lg ${
                        attempt.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant={attempt.passed ? "default" : "destructive"}>
                            Attempt {attempt.attemptNumber}
                          </Badge>
                          <span className="ml-3 font-medium">{attempt.score}%</span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(attempt.attemptedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {attempt.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
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
            <Badge variant="secondary">Final Exam</Badge>
          </div>

          {/* Exam Instructions */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Final Examination</CardTitle>
              <CardDescription>
                Comprehensive assessment of all course topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attempt Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">Attempt {exam.currentAttempt} of {exam.currentAttempt + exam.remainingAttempts - 1}</p>
                    <p className="text-sm text-blue-600">
                      {exam.remainingAttempts} attempt(s) remaining after this
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Attempts */}
              {exam.previousAttempts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Previous Attempts</h3>
                  <div className="space-y-2">
                    {exam.previousAttempts.map((attempt) => (
                      <div key={attempt.attemptNumber} className="flex items-center justify-between text-sm">
                        <span>Attempt {attempt.attemptNumber}:</span>
                        <div className="flex items-center">
                          <span className={`font-medium ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score}%
                          </span>
                          {attempt.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold">Exam Details</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {exam.totalQuestions} questions</li>
                    <li>• {Math.floor(exam.timeLimit / 60)} hours time limit</li>
                    <li>• {exam.passingScore}% passing score</li>
                    <li>• Comprehensive assessment</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                    <h3 className="font-semibold">Important Notes</h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• This is a timed exam</li>
                    <li>• Answer all questions</li>
                    <li>• No pausing allowed</li>
                    <li>• Limited attempts available</li>
                  </ul>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center pt-4">
                <Button 
                  size="lg" 
                  onClick={startExam}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                >
                  Start Final Exam
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exam Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Final Examination</h1>
                <p className="text-gray-600">
                  Question {currentQuestion + 1} of {exam.questions.length} • 
                  Attempt {exam.currentAttempt}
                </p>
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
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
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
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  onClick={() => handleAnswerSelect(currentQ._id, option)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      answers[currentQ._id] === option
                        ? 'border-purple-600 bg-purple-600 text-white'
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
                    'Submit Final Exam'
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
                        ? 'bg-purple-600 text-white'
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

export default APFinalExamPage;
