// components/ExamInterface.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Play,
  FileText
} from 'lucide-react';
import { examService, Exam, Question, ExamHistory } from '@/services/examService';
import Navbar from '@/components/Navbar';

const ExamInterface = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examHistory, setExamHistory] = useState<ExamHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, [stream]);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      const response = await examService.getAllExams(token);
      
      if (response.success && response.exams) {
        // Filter exams by stream if stream is provided
        let filteredExams = response.exams;
        if (stream) {
          filteredExams = response.exams.filter(exam => 
            exam.courseId.stream?.toLowerCase() === stream.toLowerCase() ||
            exam.courseId.courseName.toLowerCase().includes(stream.toLowerCase())
          );
        }
        
        setExams(filteredExams);
        
        if (filteredExams.length === 0) {
          setError('No exams available for this stream');
        }
      } else {
        setError(response.message || 'Failed to load exams');
      }
    } catch (error: any) {
      console.error('Error loading exams:', error);
      setError('Failed to load exams. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load exams',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExamQuestions = async (exam: Exam) => {
    try {
      setQuestionsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        return;
      }

      const response = await examService.getExamQuestions(exam.examId, token);
      
      if (response.success && response.questions) {
        setQuestions(response.questions);
        setSelectedExam(exam);
        
        // Also load exam history for this course
        const historyResponse = await examService.getExamHistory(token, exam.courseId._id);
        if (historyResponse.success) {
          setExamHistory(historyResponse.examHistory);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load questions',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error loading exam questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exam questions',
        variant: 'destructive'
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const startExam = (exam: Exam) => {
    navigate(`/exam/take/${exam.examId}`, { 
      state: { 
        exam,
        stream
      }
    });
  };

  const getExamStatus = (exam: Exam) => {
    if (!examHistory) return 'available';
    
    const courseHistory = examHistory;
    if (courseHistory.isExamCompleted) return 'completed';
    if (courseHistory.remainingAttempts === 0) return 'no-attempts';
    return 'available';
  };

  const getStatusBadge = (exam: Exam) => {
    const status = getExamStatus(exam);
    
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'no-attempts':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">No Attempts Left</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Available</Badge>;
    }
  };

  const getRemainingAttemptsText = (exam: Exam) => {
    if (!examHistory) return `${exam.maxAttempts} attempts available`;
    
    return `${examHistory.remainingAttempts} of ${exam.maxAttempts} attempts remaining`;
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Exams</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={loadExams} variant="default">
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/pack365-dashboard')} variant="outline">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading exams...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                onClick={() => navigate('/pack365-dashboard')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">Stream Exams</h2>
                {stream && (
                  <p className="text-gray-600 capitalize">For {stream} Stream</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Available Exams</h1>
                  <p className="text-gray-600 mt-2">
                    Test your knowledge and earn certifications for completed streams
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {exams.length} Exam{exams.length !== 1 ? 's' : ''} Available
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              const isAvailable = status === 'available';
              
              return (
                <Card key={exam._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {exam.courseId.courseName}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {exam.courseId.stream || 'General'} Stream
                        </CardDescription>
                      </div>
                      {getStatusBadge(exam)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium">{exam.timeLimit} minutes</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Passing Score:</span>
                        <span className="font-medium">{exam.passingScore}%</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Attempts:</span>
                        <span className="font-medium">{getRemainingAttemptsText(exam)}</span>
                      </div>

                      {examHistory && examHistory.bestScore > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Best Score:</span>
                          <span className="font-medium text-green-600">
                            {examHistory.bestScore}%
                          </span>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          onClick={() => isAvailable ? startExam(exam) : loadExamQuestions(exam)}
                          variant={isAvailable ? "default" : "outline"}
                          className="w-full"
                          disabled={!isAvailable && status !== 'completed'}
                        >
                          {isAvailable ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Exam
                            </>
                          ) : status === 'completed' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              View Results
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              No Attempts Left
                            </>
                          )}
                        </Button>
                      </div>

                      {!isAvailable && status === 'completed' && examHistory && (
                        <div className="text-center text-sm text-gray-600">
                          Completed with {examHistory.bestScore}% score
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {exams.length === 0 && !loading && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exams Available</h3>
                <p className="text-gray-600 mb-4">
                  There are no exams available for this stream at the moment.
                </p>
                <Button onClick={() => navigate('/pack365-dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Selected Exam Details */}
          {selectedExam && questions.length > 0 && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Exam Preview: {selectedExam.courseId.courseName}</span>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedExam(null);
                        setQuestions([]);
                      }}
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      This exam contains {questions.length} questions. You'll have {selectedExam.timeLimit} minutes to complete it.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Exam Structure</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• {questions.length} total questions</li>
                          <li>• {selectedExam.timeLimit} minute time limit</li>
                          <li>• {selectedExam.passingScore}% passing score required</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Your Progress</h4>
                        {examHistory && (
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Best Score: {examHistory.bestScore}%</li>
                            <li>• Attempts: {examHistory.totalAttempts}/{selectedExam.maxAttempts}</li>
                            <li>• Status: {examHistory.isPassed ? 'Passed' : 'In Progress'}</li>
                          </ul>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => startExam(selectedExam)}
                      variant="default"
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Exam Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamInterface;
