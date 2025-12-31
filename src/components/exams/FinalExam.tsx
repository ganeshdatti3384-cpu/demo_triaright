// Triaright_EduCareer/src/components/exams/FinalExam.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Trophy,
  ChevronRight,
  Award,
} from "lucide-react";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
  description?: string;
}

interface ExamData {
  examId: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  currentAttempt: number;
  remainingAttempts: number;
  questions: Question[];
}

// Use the same API base URL as other components
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const FinalExam: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exam questions with retry logic
  const fetchExam = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // FIXED: Changed from /internships/exams/ to /courses/exams/
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/final/${courseId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          timeout: 15000
        }
      );

      if (response.data.success) {
        setExam(response.data.exam);
        setTimeLeft(response.data.exam.timeLimit * 60);
      } else {
        throw new Error(response.data.message || 'Failed to fetch final exam');
      }
    } catch (error: any) {
      console.error("Failed to fetch final exam:", error);
      
      let errorMessage = "Failed to load final exam";
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "You are not eligible for the final exam";
            break;
          case 401:
            errorMessage = "Session expired. Please login again.";
            break;
          case 404:
            errorMessage = "Final exam not found for this course";
            break;
          case 502:
            errorMessage = "Server is temporarily unavailable. Please try again later.";
            if (retryCount < 2) {
              setTimeout(() => {
                fetchExam(retryCount + 1);
              }, 2000 * (retryCount + 1));
              return;
            }
            break;
          default:
            errorMessage = error.response.data?.message || "Failed to load final exam";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "Failed to load final exam";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (!errorMessage.includes("unavailable") && !errorMessage.includes("timeout")) {
        setTimeout(() => {
          navigate(`/learning/${courseId}`);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!exam || !examStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, examStarted, timeLeft]);

  useEffect(() => {
    if (courseId && token) {
      fetchExam();
    }
  }, [courseId, token]);

  const handleAnswerSelect = (questionId: string, option: string, optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const prepareAnswersForSubmission = () => {
    return answers;
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      const submissionAnswers = prepareAnswersForSubmission();
      
      // FIXED: Changed from /internships/exams/validate/final to /courses/exams/validate/final
      const response = await axios.post(
        `${API_BASE_URL}/courses/exams/validate/final`,
        {
          courseId,
          answers: submissionAnswers,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        toast({
          title: "Final Exam Submitted",
          description: "Your exam has been submitted automatically due to time limit",
          variant: "default",
        });
        
        navigate(`/learning/${courseId}`, {
          state: {
            finalExamResult: response.data.result,
          },
          replace: true
        });
      }
    } catch (error: any) {
      console.error("Auto-submit error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit exam",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;
    
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < exam.totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredQuestions} out of ${exam.totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const submissionAnswers = prepareAnswersForSubmission();
      
      // FIXED: Changed from /internships/exams/validate/final to /courses/exams/validate/final
      const response = await axios.post(
        `${API_BASE_URL}/courses/exams/validate/final`,
        {
          courseId,
          answers: submissionAnswers,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.success) {
        const result = response.data.result;
        
        toast({
          title: result.passed ? "Congratulations! 🎉" : "Exam Completed",
          description: `Your score: ${result.score}% (${result.correctAnswers}/${exam.totalQuestions} correct)`,
          variant: result.passed ? "default" : "destructive",
        });

        navigate(`/learning/${courseId}`, {
          state: {
            finalExamResult: result,
          },
          replace: true
        });
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit exam",
        variant: "destructive",
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
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startExam = () => {
    if (!exam) return;
    
    const confirmed = window.confirm(
      `Are you ready to start your final exam?\n\n• Time Limit: ${exam.timeLimit} minutes\n• Total Questions: ${exam.totalQuestions}\n• Passing Score: ${exam.passingScore}%\n\nOnce started, the timer will begin.`
    );
    
    if (confirmed) {
      setExamStarted(true);
      toast({
        title: "Exam Started",
        description: "Good luck! The timer has started.",
        variant: "default",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading final exam...</p>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Final Exam Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                <div>
                  <p className="text-gray-700 mb-2">{error}</p>
                  <p className="text-sm text-gray-500">Please try again later or contact support if the issue persists.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchExam()} variant="outline">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={() => navigate(`/learning/${courseId}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Final Exam Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The final exam is not currently available.</p>
              <Button onClick={() => navigate(`/learning/${courseId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/learning/${courseId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Final Exam</h1>
                <p className="text-sm text-gray-600">Test your comprehensive knowledge</p>
              </div>
            </div>
            {examStarted ? (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-xs text-gray-600">Time Remaining</div>
                </div>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Attempt {exam.currentAttempt} of {exam.currentAttempt + exam.remainingAttempts - 1}
                </Badge>
              </div>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Ready to Start
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Questions or Instructions */}
          <div className="lg:col-span-2">
            {!examStarted ? (
              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <CardTitle>Final Exam Instructions</CardTitle>
                      <CardDescription>
                        Complete this exam to get your course certificate
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-blue-800">
                      Important Information
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Time Limit:</strong> {exam.timeLimit} minutes
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Total Questions:</strong> {exam.totalQuestions}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Passing Score:</strong> {exam.passingScore}%
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Current Attempt:</strong> {exam.currentAttempt}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Remaining Attempts:</strong> {exam.remainingAttempts - 1}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Exam Rules:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>The timer starts as soon as you begin the exam</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>You cannot pause or stop the timer once started</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>The exam will auto-submit when time expires</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>All questions must be answered before submitting</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={startExam}
                      className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      <Trophy className="h-5 w-5 mr-2" />
                      Start Final Exam
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      By clicking start, you confirm you're ready to begin
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Final Exam in Progress</CardTitle>
                      <CardDescription>
                        Complete all questions before time runs out
                      </CardDescription>
                    </div>
                    <Badge variant={timeLeft < 600 ? "destructive" : "secondary"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(timeLeft)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {Object.keys(answers).length} / {exam.totalQuestions} answered
                      </span>
                    </div>
                    <Progress
                      value={(Object.keys(answers).length / exam.totalQuestions) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Questions Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {exam.questions.map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          currentQuestion === index
                            ? "default"
                            : selectedOptions[exam.questions[index]._id]
                            ? "secondary"
                            : "outline"
                        }
                        className="w-10 h-10 p-0"
                        onClick={() => setCurrentQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  {/* Current Question */}
                  {exam.questions[currentQuestion] && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">
                            Question {currentQuestion + 1}
                          </h3>
                          <Badge variant="outline">
                            {exam.questions[currentQuestion].type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-800 mb-6">
                          {exam.questions[currentQuestion].questionText}
                        </p>

                        {exam.questions[currentQuestion].description && (
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                            <p className="text-sm text-yellow-800">
                              {exam.questions[currentQuestion].description}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {exam.questions[currentQuestion].options.map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index);
                            const questionId = exam.questions[currentQuestion]._id;
                            const isSelected = selectedOptions[questionId] === optionLetter;

                            return (
                              <div
                                key={index}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-500"
                                    : "hover:bg-gray-50 hover:border-gray-300"
                                }`}
                                onClick={() => handleAnswerSelect(questionId, option, optionLetter)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                      isSelected
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                  <span className="font-medium mr-2">{optionLetter}.</span>
                                  <span>{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentQuestion((prev) => Math.max(0, prev - 1))
                          }
                          disabled={currentQuestion === 0}
                        >
                          Previous
                        </Button>
                        <div className="flex gap-2">
                          {currentQuestion < exam.questions.length - 1 ? (
                            <Button
                              onClick={() =>
                                setCurrentQuestion((prev) =>
                                  Math.min(exam.questions.length - 1, prev + 1)
                                )
                              }
                            >
                              Next Question
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmit}
                              disabled={submitting}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Final Exam"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Exam Info & Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="font-semibold">{exam.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Limit</span>
                  <span className="font-semibold">{exam.timeLimit} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Passing Score</span>
                  <span className="font-semibold text-green-600">{exam.passingScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Attempt</span>
                  <span className="font-semibold">{exam.currentAttempt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Remaining Attempts</span>
                  <span className="font-semibold text-blue-600">
                    {exam.remainingAttempts - 1}
                  </span>
                </div>
              </CardContent>
            </Card>

            {examStarted && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const unanswered = exam.questions.filter(
                          (q) => !answers[q._id]
                        );
                        if (unanswered.length > 0) {
                          const firstUnanswered = exam.questions.findIndex(
                            (q) => !answers[q._id]
                          );
                          setCurrentQuestion(firstUnanswered);
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Go to First Unanswered
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentQuestion(0)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to First Question
                    </Button>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Final Exam"
                  )}
                </Button>
              </>
            )}

            {!examStarted && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">
                    <Award className="h-5 w-5 inline mr-2" />
                    Certificate Award
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-700 mb-4">
                    Passing this final exam makes you eligible for the course certificate!
                  </p>
                  <div className="space-y-2 text-xs text-purple-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Valid course completion proof</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Shareable on LinkedIn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Digital verification available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalExam;