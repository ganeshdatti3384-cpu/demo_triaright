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
  Award
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Question {
  _id: string;
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
  attemptNumber: number;
  score: number;
  passed: boolean;
  completedAt: string;
  answers: { [key: string]: string };
}

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
  const [hasOngoingAttempt, setHasOngoingAttempt] = useState(false);

  useEffect(() => {
    loadExamData();
  }, [stream]);

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

  const loadExamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Check if user is eligible
      const enrollmentResponse = await pack365Api.getMyEnrollments(token);
      if (!enrollmentResponse.success) {
        throw new Error('Failed to fetch enrollment data');
      }

      const streamEnrollment = enrollmentResponse.enrollments.find(
        (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamEnrollment || streamEnrollment.totalWatchedPercentage < 80) {
        toast({
          title: 'Not Eligible',
          description: 'You need to complete at least 80% of the stream to take the exam.',
          variant: 'destructive'
        });
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      // Fetch exam for this stream
      const examResponse = await pack365Api.getExamByStream(stream || '');
      if (!examResponse.success || !examResponse.exam) {
        throw new Error('Exam not found for this stream');
      }

      setExam(examResponse.exam);
      setTimeLeft(examResponse.exam.timeLimit * 60); // Convert minutes to seconds

      // Load user's previous attempts
      const attemptsResponse = await pack365Api.getExamAttempts(token, examResponse.exam._id);
      if (attemptsResponse.success) {
        setUserAttempts(attemptsResponse.attempts || []);
      }

    } catch (error: any) {
      console.error('Error loading exam:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load exam',
        variant: 'destructive'
      });
      navigate(`/pack365-learning/${stream}`);
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

  // Add this function to refresh enrollment data
  const refreshEnrollmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Update the enrollment data to reflect exam completion
      const response = await pack365Api.getMyEnrollments(token);
      if (response.success) {
        // Set a flag to trigger refresh in other components
        localStorage.setItem('lastEnrollmentUpdate', new Date().toISOString());
        console.log('Enrollment data refreshed after exam completion');
      }
    } catch (error) {
      console.error('Error refreshing enrollment data:', error);
    }
  };

  const handleAutoSubmit = async () => {
    if (!exam) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const submission = {
        examId: exam._id,
        answers: answers,
        timeSpent: (exam.timeLimit * 60) - timeLeft
      };

      const result = await pack365Api.submitExam(token, submission);
      
      if (result.success) {
        // Refresh enrollment data to update exam status
        await refreshEnrollmentData();
        
        toast({
          title: 'Exam Auto-Submitted',
          description: 'Time is up! Your exam has been automatically submitted.',
          variant: 'default'
        });
        
        // Show results
        navigate(`/exam-result/${stream}`, { 
          state: { 
            result: result.result,
            exam: exam
          } 
        });
      }
    } catch (error) {
      console.error('Error auto-submitting exam:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const unansweredQuestions = exam.questions.filter(
      q => !answers[q._id]
    ).length;

    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const submission = {
        examId: exam._id,
        answers: answers,
        timeSpent: (exam.timeLimit * 60) - timeLeft
      };

      const result = await pack365Api.submitExam(token, submission);
      
      if (result.success) {
        // Refresh enrollment data to update exam status
        await refreshEnrollmentData();
        
        toast({
          title: 'Exam Submitted',
          description: 'Your exam has been submitted successfully!',
          variant: 'default'
        });
        
        navigate(`/exam-result/${stream}`, { 
          state: { 
            result: result.result,
            exam: exam
          } 
        });
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading exam...</p>
          </div>
        </div>
      </>
    );
  }

  if (!exam) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Available</h2>
                <p className="text-gray-600 mb-4">The exam for this stream is not available at the moment.</p>
                <Button onClick={() => navigate(`/pack365-learning/${stream}`)}>
                  Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentQ = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

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
                <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="flex items-center">
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
                            ? "default" 
                            : answers[exam.questions[index]._id] 
                              ? "secondary" 
                              : "outline"
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
                  <h2 className="text-lg font-semibold mb-6">
                    {currentQ.questionText}
                  </h2>

                  {/* Options */}
                  <RadioGroup
                    value={answers[currentQ._id] || ''}
                    onValueChange={(value) => handleAnswerSelect(currentQ._id, value)}
                    className="space-y-4"
                  >
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    
                    {currentQuestion === exam.questions.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>
                        Next Question
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Submit */}
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Ready to submit your exam? Make sure you've answered all questions.
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      size="lg"
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
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
