import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Loader2
} from 'lucide-react';
import { pack365Api } from '@/services/api';

interface Question {
  questionText: string;
  options: string[];
  type: 'easy' | 'medium' | 'hard';
  correctAnswer?: string;
  description?: string;
}

interface ExamResult {
  message: string;
  currentScore: number;
  bestScore: number;
  attemptNumber: number;
  maxAttempts: number;
  remainingAttempts: number;
  isPassed: boolean;
  canRetake: boolean;
}

interface ExamInterfaceProps {
  examId: string;
  courseId?: string;
  onExamComplete: (result: ExamResult) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId, courseId, onExamComplete }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    fetchQuestions();
    startTimer();
  }, [examId]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await pack365Api.getExamQuestions(examId, token || '');
      setQuestions(response.questions || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load exam questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
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
  };

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await submitExam();
  };

  const submitExam = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Calculate score
      const correctAnswers = questions.filter((question, index) => 
        answers[index] === question.correctAnswer
      ).length;
      
      const score = (correctAnswers / questions.length) * 100;
      const timeTaken = 3600 - timeLeft;

      const response = await pack365Api.submitExam(token || '', {
        examId,
        marks: Math.round(score),
        timeTaken,
        courseId: courseId || ''
      });

      setExamResult(response);
      setShowResults(true);
      onExamComplete(response);
    } catch (error: any) {
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            examResult.isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {examResult.isPassed ? (
              <Award className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {examResult.isPassed ? 'Exam Passed! 🎉' : 'Exam Failed'}
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Your Score:</span>
              <span className="font-semibold">{examResult.currentScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Best Score:</span>
              <span className="font-semibold">{examResult.bestScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Attempt:</span>
              <span className="font-semibold">{examResult.attemptNumber} of {examResult.maxAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Attempts:</span>
              <span className="font-semibold">{examResult.remainingAttempts}</span>
            </div>
          </div>

          {examResult.isPassed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800">
                Congratulations! You have successfully passed the exam.
              </p>
            </div>
          ) : examResult.canRetake ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                You can retake the exam. You have {examResult.remainingAttempts} attempts remaining.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">
                You have used all your attempts. Please contact support.
              </p>
            </div>
          )}

          <Button onClick={() => window.location.reload()} className="w-full">
            {examResult.canRetake && !examResult.isPassed ? 'Retake Exam' : 'Close'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
          <p className="text-gray-600">There are no questions available for this exam.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Exam Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Exam in Progress</h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </Badge>
              <Progress 
                value={((currentQuestion + 1) / questions.length) * 100} 
                className="w-24" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {currentQuestionData.questionText}
            </CardTitle>
            <Badge className={getDifficultyColor(currentQuestionData.type)}>
              {currentQuestionData.type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion] || ''}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestionData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Question Navigation Dots */}
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestion
                    ? 'bg-blue-600'
                    : answers[index]
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {currentQuestion < questions.length - 1 ? (
          <Button onClick={handleNext}>
            Next Question
          </Button>
        ) : (
          <Button
            onClick={submitExam}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Exam
              </>
            )}
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900">
                {Object.keys(answers).length}
              </div>
              <div className="text-gray-600">Answered</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {questions.length - Object.keys(answers).length}
              </div>
              <div className="text-gray-600">Remaining</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {Math.round((Object.keys(answers).length / questions.length) * 100)}%
              </div>
              <div className="text-gray-600">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamInterface;
