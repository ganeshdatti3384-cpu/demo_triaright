// Triaright_EduCareer/src/components/exams/TopicExam.tsx
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
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Award,
  ChevronRight,
} from "lucide-react";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  type: string;
}

interface ExamData {
  examId: string;
  topicName: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: Question[];
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const TopicExam: React.FC = () => {
  const { courseId, topicName } = useParams<{ courseId: string; topicName: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // Changed: stores actual option text
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({}); // New: stores option letters for UI
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch exam questions with retry logic
  const fetchExam = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/courses/exams/topic/${courseId}/${encodeURIComponent(topicName || "")}`,
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
        throw new Error(response.data.message || 'Failed to fetch exam');
      }
    } catch (error: any) {
      console.error("Failed to fetch exam:", error);
      
      let errorMessage = "Failed to load exam";
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "You need to complete the topic content first";
            break;
          case 401:
            errorMessage = "Session expired. Please login again.";
            break;
          case 404:
            errorMessage = "Exam not found for this topic";
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
            errorMessage = error.response.data?.message || "Failed to load exam";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "Failed to load exam";
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
    if (!exam || timeLeft <= 0) return;

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
  }, [exam, timeLeft]);

  useEffect(() => {
    if (courseId && topicName && token) {
      fetchExam();
    }
  }, [courseId, topicName, token]);

  const handleAnswerSelect = (questionId: string, option: string, optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option, // Store the actual option text
    }));
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionLetter, // Store the option letter for UI
    }));
  };

  const prepareAnswersForSubmission = () => {
    // The answers object already contains { questionId: optionText }
    // which is what the backend expects
    return answers;
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      const submissionAnswers = prepareAnswersForSubmission();
      console.log("Auto-submitting answers:", submissionAnswers); // Debug log
      
      const response = await axios.post(
        `${API_BASE_URL}/courses/exams/topic/validate`,
        {
          courseId,
          topicName,
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
          title: "Exam Submitted",
          description: "Your exam has been submitted automatically due to time limit",
          variant: "default",
        });
        
        navigate(`/learning/${courseId}`, {
          state: {
            examResult: response.data.result,
            topicName,
          },
          replace: true
        });
      }
    } catch (error: any) {
      console.error("Auto-submit error:", error);
      let errorMessage = error.response?.data?.message || "Failed to submit exam";
      
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes("already attempted")) {
          errorMessage = "You have already attempted this exam";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
      console.log("Submitting answers:", submissionAnswers); // Debug log
      
      const response = await axios.post(
        `${API_BASE_URL}/courses/exams/topic/validate`,
        {
          courseId,
          topicName,
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

      console.log("Response from server:", response.data); // Debug log

      if (response.data.success) {
        toast({
          title: "Exam Submitted Successfully",
          description: `Your score: ${response.data.result.score}%`,
          variant: response.data.result.passed ? "default" : "destructive",
        });

        navigate(`/learning/${courseId}`, {
          state: {
            examResult: response.data.result,
            topicName,
          },
          replace: true
        });
      }
    } catch (error: any) {
      console.error("Submit error details:", error.response?.data); // Debug log
      let errorMessage = error.response?.data?.message || "Failed to submit exam";
      
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes("already attempted")) {
          errorMessage = "You have already attempted this exam";
        } else if (error.response.data?.message?.includes("content before attempting")) {
          errorMessage = "Complete all topic lessons before attempting the exam";
        } else {
          // Show backend validation errors
          errorMessage = error.response.data?.message || "Validation failed. Please check your answers.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading exam...</p>
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
              <CardTitle className="text-red-600">Exam Not Available</CardTitle>
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
              <CardTitle>Exam Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This exam is not currently available.</p>
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
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-xl font-bold text-gray-900">{exam.topicName} - Topic Exam</h1>
                <p className="text-sm text-gray-600">Test your knowledge on this topic</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <Clock className="h-5 w-5" />
                  <span className="text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-xs text-gray-600">Time Remaining</div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Question {currentQuestion + 1} of {exam.totalQuestions}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Questions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Exam Instructions</CardTitle>
                    <CardDescription>
                      • You have {exam.timeLimit} minutes to complete this exam<br />
                      • Passing score: {exam.passingScore}%<br />
                      • Answer all questions before submitting
                    </CardDescription>
                  </div>
                  <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
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
                              "Submit Exam"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Exam Info & Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
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
                  <span className="text-gray-600">Answered</span>
                  <span className="font-semibold">
                    {Object.keys(answers).length} / {exam.totalQuestions}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Read each question carefully before answering</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage your time wisely</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You can review and change answers before submitting</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>Exam will auto-submit when time expires</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Exam"
              )}
            </Button>

            {/* Debug Section - Only in development */}
            {import.meta.env.DEV && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-sm">Debug Info</CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <p>Answers submitted: {Object.keys(answers).length}</p>
                  <p>Sample answer format: {JSON.stringify(Object.entries(answers)[0] || {})}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicExam;