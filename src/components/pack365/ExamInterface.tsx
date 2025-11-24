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
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer?: string;
  type: 'easy' | 'medium' | 'hard';
}

interface Exam {
  _id: string;
  examId: string;
  questions: Question[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
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
        navigate('/login');
        return;
      }

      // Get available exams
      const examsResponse = await pack365Api.getAvailableExamsForUser(token);
      if (examsResponse.exams && examsResponse.exams.length > 0) {
        const streamExam = examsResponse.exams[0]; // Simplified - you might want better matching
        
        // Get exam questions
        const questionsResponse = await pack365Api.getExamQuestions(token, streamExam.examId);
        const examDetails = await pack365Api.getExamDetails(token, streamExam.examId);

        const fullExam: Exam = {
          _id: streamExam.examId,
          examId: streamExam.examId,
          questions: questionsResponse.questions || [],
          maxAttempts: streamExam.attemptInfo?.maxAttempts || 3,
          passingScore: 50,
          timeLimit: 60
        };

        setExam(fullExam);
        setTimeLeft(fullExam.timeLimit * 60);
      } else {
        toast({
          title: 'No Exam Available',
          description: 'No exam found for this stream.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exam',
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
    return Math.round((correctCount / exam.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (!exam) return;

    const unanswered = exam.questions.filter(q => !answers[q._id]).length;
    if (unanswered > 0) {
      const confirm = window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`);
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const score = calculateScore();
      await pack365Api.submitExam(token, {
        examId: exam.examId,
        courseId: exam._id, // This might need adjustment based on your backend
        marks: score,
        timeTaken: (exam.timeLimit * 60) - timeLeft
      });

      navigate(`/exam-result/${stream}`, {
        state: {
          score,
          passed: score >= exam.passingScore,
          totalQuestions: exam.questions.length
        }
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit exam',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!exam) return;
    await handleSubmit();
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Available</h2>
                <p className="text-gray-600 mb-4">The exam for this stream is not available.</p>
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
                  Complete all {exam.questions.length} questions
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'}>
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {exam.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                  </div>

                  {/* Question Text */}
                  <h2 className="text-lg font-semibold mb-6">{currentQ.questionText}</h2>

                  {/* Options */}
                  <RadioGroup
                    value={answers[currentQ._id] || ''}
                    onValueChange={(value) => handleAnswerSelect(currentQ._id, value)}
                    className="space-y-4"
                  >
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`opt-${index}`} />
                        <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline">
                      Previous
                    </Button>

                    {currentQuestion === exam.questions.length - 1 ? (
                      <Button onClick={handleSubmit} disabled={submitting}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>Next Question</Button>
                    )}
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
