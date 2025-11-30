import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { pack365Api } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExamQuestion {
  questionText: string;
  options: string[];
  type?: string;
  correctAnswer?: string;
  description?: string;
}

const ExamPage: React.FC = () => {
  const params = useParams<{ examId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Accept examId from route param, location.state, or query string as fallback
  const examIdFromParams = params.examId ? decodeURIComponent(params.examId) : undefined;
  const examIdFromState = (location.state as any)?.examId;
  const examIdFromQuery = new URLSearchParams(location.search).get('examId') || undefined;

  const examId = examIdFromParams || examIdFromState || examIdFromQuery;

  useEffect(() => {
    // If examId is missing, show a clearer debug message
    if (!examId) {
      console.error('ExamPage: missing examId', {
        params,
        locationState: location.state,
        locationPathname: location.pathname,
        locationSearch: location.search
      });
      setError('Invalid exam ID — no examId was provided in the URL or state. See console for details.');
      setLoading(false);
      return;
    }
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const loadExam = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      console.log('ExamPage loading examId:', examId);

      // Fetch exam details (contains course completion info & attempt info)
      try {
        const detailsRes = await pack365Api.getExamDetails(examId, token);
        if (detailsRes && detailsRes.examDetails) {
          setExamDetails(detailsRes.examDetails);
        } else if (detailsRes && detailsRes.exam) {
          setExamDetails(detailsRes.exam);
        }
      } catch (err) {
        console.warn('getExamDetails failed (non-fatal):', err);
      }

      // Fetch questions for this exam only
      const questionsRes = await pack365Api.getExamQuestions(examId, false, token);
      const fetchedQuestions = (questionsRes && (questionsRes as any).questions) || [];
      setQuestions(fetchedQuestions);

    } catch (err: any) {
      console.error('Error loading exam:', err);
      setError('Failed to load exam questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading exam...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-lg w-full">
            <CardContent>
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-gray-600 mt-2">{error}</p>
                <div className="text-xs text-gray-400 mt-2">
                  <div>URL: {location.pathname + location.search}</div>
                  <div>State: {JSON.stringify(location.state)}</div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>
                {examDetails?.courseName ? `${examDetails.courseName} — Exam` : `Exam ${examId}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {examDetails && (
                <div className="mb-4 text-sm text-gray-700">
                  <div>Total Questions: {examDetails.totalQuestions ?? questions.length}</div>
                  {examDetails.userAttemptInfo && (
                    <div>
                      Attempts used: {examDetails.userAttemptInfo.totalAttempts} / {examDetails.maxAttempts}
                    </div>
                  )}
                </div>
              )}

              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No questions found for this exam.
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-white border rounded">
                      <div className="font-medium mb-2">
                        {idx + 1}. {q.questionText}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="p-2 border rounded bg-gray-50">
                            <span className="text-sm">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                <Button
                  variant="default"
                  onClick={() => toast({ title: 'Start Exam', description: 'Exam flow not implemented in this component.', variant: 'default' })}
                >
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExamPage;
