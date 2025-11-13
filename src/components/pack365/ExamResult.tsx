import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  BarChart3,
  Clock,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface ExamResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  attemptNumber: number;
  submittedAt: string;
  answers: { [key: string]: string };
  correctAnswersMap: { [key: string]: string };
}

const ExamResult = () => {
  const { stream } = useParams<{ stream: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const result = location.state?.result as ExamResult;
  const exam = location.state?.exam;

  if (!result || !exam) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Result Not Found</h2>
                <p className="text-gray-600 mb-4">Exam results are not available.</p>
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate(`/pack365-learning/${stream}`)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
            
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {result.passed ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <XCircle className="h-8 w-8" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {result.passed ? 'Congratulations!' : 'Exam Failed'}
              </h1>
              <p className="text-gray-600 text-lg">
                {result.passed 
                  ? `You have successfully passed the ${stream} stream exam!`
                  : `You need more practice to pass the ${stream} stream exam.`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Result Card */}
            <div className="lg:col-span-2">
              <Card className={result.passed ? 'border-green-200' : 'border-red-200'}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Exam Results</span>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Score Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Your Score</span>
                        <span className="text-sm font-medium">{result.score}%</span>
                      </div>
                      <Progress 
                        value={result.score} 
                        className={`h-3 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>Passing: {exam.passingScore}%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{result.correctAnswers}/{result.totalQuestions}</div>
                        <div className="text-sm text-gray-600">Correct Answers</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{formatTime(result.timeSpent)}</div>
                        <div className="text-sm text-gray-600">Time Spent</div>
                      </div>
                    </div>

                    {/* Attempt Info */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Attempt #{result.attemptNumber}</h4>
                          <p className="text-sm text-blue-700">
                            Submitted on {new Date(result.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Review */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Question Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exam.questions.map((question, index) => {
                      const userAnswer = result.answers[question._id];
                      const correctAnswer = result.correctAnswersMap[question._id];
                      const isCorrect = userAnswer === correctAnswer;

                      return (
                        <div key={question._id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium flex-1">
                              {index + 1}. {question.questionText}
                            </h4>
                            <Badge variant={isCorrect ? "default" : "destructive"}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className={`p-2 rounded text-sm ${
                              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                              <span className="font-medium">Your answer:</span> {userAnswer || 'Not answered'}
                            </div>
                            
                            {!isCorrect && (
                              <div className="p-2 rounded text-sm bg-green-50 border border-green-200">
                                <span className="font-medium">Correct answer:</span> {correctAnswer}
                              </div>
                            )}
                          </div>

                          {question.description && (
                            <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                              <span className="font-medium">Explanation:</span> {question.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.passed ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Award className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium">Stream Completed!</span>
                      </div>
                      <Button 
                        onClick={() => navigate('/pack365-dashboard')}
                        className="w-full"
                      >
                        View Dashboard
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <BookOpen className="h-6 w-6 text-yellow-600" />
                        <span className="text-sm font-medium">Review course materials</span>
                      </div>
                      <Button 
                        onClick={() => navigate(`/pack365-learning/${stream}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Continue Learning
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    onClick={() => navigate('/pack365')}
                    variant="outline"
                    className="w-full"
                  >
                    Browse Other Streams
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {result.passed ? (
                    <>
                      <p>🎉 Great job! Consider exploring advanced topics in this stream.</p>
                      <p>📚 Share your achievement and help others learn.</p>
                      <p>🚀 Continue your learning journey with other streams.</p>
                    </>
                  ) : (
                    <>
                      <p>📖 Review the topics where you had incorrect answers.</p>
                      <p>⏱️ Practice with timed quizzes to improve speed.</p>
                      <p>🔍 Focus on understanding concepts rather than memorizing.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamResult;