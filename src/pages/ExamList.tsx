/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { pack365Api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Award, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ExamInfo {
  _id: string;
  examId: string;
  courseId: {
    _id: string;
    courseName: string;
  };
  questions: any[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  attemptInfo: {
    totalAttempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    currentScore: number;
    lastAttempt: string | null;
    canRetake: boolean;
    isPassed: boolean;
  };
}

const ExamList: React.FC = () => {
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableExams();
  }, [token]);

  const fetchAvailableExams = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await pack365Api.getAvailableExamsForUser(token);
      setExams(response.exams || []);

      if (response.message && response.exams.length === 0) {
        toast.info(response.message);
      }
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch available exams');
    } finally {
      setLoading(false);
    }
  };
  console.log(user)
  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  const getStatusBadge = (attemptInfo: ExamInfo['attemptInfo']) => {
    if (attemptInfo.isPassed) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
    }
    if (attemptInfo.totalAttempts === 0) {
      return <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />Not Attempted</Badge>;
    }
    if (!attemptInfo.canRetake) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Attempts Exhausted</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Available</Badge>;
  };

  const getButtonText = (attemptInfo: ExamInfo['attemptInfo']) => {
    if (attemptInfo.totalAttempts === 0) return 'Start Exam';
    if (attemptInfo.canRetake) return 'Retake Exam';
    return 'View Results';
  };

  const canTakeExam = (attemptInfo: ExamInfo['attemptInfo']) => {
    return attemptInfo.canRetake || attemptInfo.totalAttempts === 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available exams...</p>
        </div>
      </div>
    );
  }

  return (
    <><Navbar />
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Exams</h1>
          <p className="text-gray-600">
            Complete your course exams to earn certificates. You need 80% course completion to unlock exams.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.filter(exam => exam.attemptInfo.isPassed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.filter(exam => exam.attemptInfo.canRetake || exam.attemptInfo.totalAttempts === 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {exams.length > 0
                      ? Math.round(exams.reduce((sum, exam) => sum + exam.attemptInfo.bestScore, 0) / exams.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h3>
              <p className="text-gray-600 mb-4">
                Complete at least 80% of your enrolled courses to unlock exams.
              </p>
              <Button
              onClick={() => {
                console.log('User:', user);
                console.log('User role:', user.role);
                navigate(`/${user.role}`);
              }}
              variant="outline"
            >
              Go to Dashboard
            </Button>

            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{exam.courseId.courseName}</CardTitle>
                    {getStatusBadge(exam.attemptInfo)}
                  </div>
                  <CardDescription>Exam ID: {exam.examId}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Exam Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{exam.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{exam.timeLimit} mins</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>{exam.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span>{exam.attemptInfo.remainingAttempts} attempts left</span>
                    </div>
                  </div>

                  {/* Progress Info */}
                  {exam.attemptInfo.totalAttempts > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Best Score</span>
                        <span className="font-medium">{exam.attemptInfo.bestScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Attempts Used</span>
                        <span className="font-medium">
                          {exam.attemptInfo.totalAttempts}/{exam.attemptInfo.maxAttempts}
                        </span>
                      </div>
                      {exam.attemptInfo.lastAttempt && (
                        <div className="flex justify-between text-sm mt-1">
                          <span>Last Attempt</span>
                          <span className="font-medium">
                            {new Date(exam.attemptInfo.lastAttempt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleStartExam(exam.examId)}
                    disabled={!canTakeExam(exam.attemptInfo)}
                    variant={canTakeExam(exam.attemptInfo) ? "default" : "outline"}
                  >
                    {getButtonText(exam.attemptInfo)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ExamList;