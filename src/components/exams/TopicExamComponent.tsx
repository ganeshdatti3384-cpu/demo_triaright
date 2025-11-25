// components/exams/TopicExamComponent.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, XCircle, ArrowLeft, FileText } from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
}

interface Exam {
  examId: string;
  topicName: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: Question[];
  previousAttempt?: {
    score: number;
    passed: boolean;
    attemptedAt: string;
    attemptNumber: number;
  };
}

const TopicExamComponent = () => {
  const { courseId, topicName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [courseId, topicName]);

  useEffect(() => {
    if (exam?.timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam?.timeLimit, timeLeft]);

  const fetchExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/internships/exams/topic/${courseId}/${topicName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setExam(data.exam);
        setTimeLeft(data.exam.timeLimit * 60); // Convert to seconds
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load exam',
          variant: 'destructive'
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
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

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    await submitExam();
  };

  const submitExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/internships/exams/topic/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          topicName,
          answers
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: data.result.passed ? 'Congratulations!' : 'Exam Completed',
          description: `You scored ${data.result.score}% (Required: ${data.result.passingScore}%)`,
          variant: data.result.passed ? 'default' : 'destructive'
        });
        
        navigate(-1);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to submit exam',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit exam',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Not Found</h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestionData = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {exam.totalQuestions}
            </Badge>
          </div>
        </div>

        {/* Exam Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {exam.topicName} - Topic Exam
            </CardTitle>
            <CardDescription>
              Passing Score: {exam.passingScore}% • Time Limit: {exam.timeLimit} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{currentQuestionData.questionText}</p>
            
            <RadioGroup
              value={answers[currentQuestionData._id] || ''}
              onValueChange={(value) => handleAnswerSelect(currentQuestionData._id, value)}
            >
              {currentQuestionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg mb-2 hover:bg-gray-50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
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
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!answers[currentQuestionData._id]}
                >
                  Next Question
                </Button>
              )}
            </div>

            {/* Question Progress Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {exam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestion
                      ? 'bg-blue-600'
                      : answers[exam.questions[index]._id]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Previous Attempt Info */}
        {exam.previousAttempt && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {exam.previousAttempt.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <div>
                    <p className="font-medium">
                      Previous Attempt: {exam.previousAttempt.score}% 
                      ({exam.previousAttempt.passed ? 'Passed' : 'Failed'})
                    </p>
                    <p className="text-sm text-gray-600">
                      Attempt #{exam.previousAttempt.attemptNumber} •{' '}
                      {new Date(exam.previousAttempt.attemptedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={exam.previousAttempt.passed ? "default" : "secondary"}>
                  {exam.previousAttempt.passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopicExamComponent;
