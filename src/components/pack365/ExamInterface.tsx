/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

interface Question {
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
  attemptId: string;
  examId: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
  isPassed: boolean;
}

interface ExamHistory {
  courseName: string;
  totalAttempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  bestScore: number;
  currentScore: number;
  isExamCompleted: boolean;
  lastAttempt: string;
  isPassed: boolean;
  canRetake: boolean;
  attempts: ExamAttempt[];
}

const ExamInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stream } = useParams<{ stream: string }>();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [history, setHistory] = useState<ExamHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;

  // Simple toast replacement
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Simple progress bar component
  const ProgressBar = ({ value, className = '' }: { value: number; className?: string }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      ></div>
    </div>
  );

  // Icons as simple components
  const ClockIcon = () => <span>⏰</span>;
  const BookIcon = () => <span>📚</span>;
  const BackIcon = () => <span>←</span>;
  const CheckIcon = () => <span>✓</span>;
  const CrossIcon = () => <span>✗</span>;
  const ChartIcon = () => <span>📊</span>;
  const HistoryIcon = () => <span>📝</span>;

  useEffect(() => {
    const initializeExam = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication Required');
        navigate('/login');
        return;
      }

      if (!courseId) {
        setError('No Course Selected');
        navigate(`/pack365-learning/${stream}`);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check enrollment and eligibility
        const enrollmentResponse = await axios.get(
          `${API_BASE_URL}/pack365/enrollments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Handle different enrollment response structures
        let enrollmentsData = [];
        
        if (enrollmentResponse.data.enrollments) {
          enrollmentsData = enrollmentResponse.data.enrollments;
        } else if (Array.isArray(enrollmentResponse.data)) {
          enrollmentsData = enrollmentResponse.data;
        } else if (enrollmentResponse.data.success && enrollmentResponse.data.data) {
          enrollmentsData = enrollmentResponse.data.data;
        } else {
          enrollmentsData = [];
        }

        const streamEnrollment = enrollmentsData.find(
          (e: any) => e.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (!streamEnrollment) {
          throw new Error('Not enrolled in this stream');
        }

        if (streamEnrollment.totalWatchedPercentage < 80) {
          throw new Error('Complete 80% of the course to take the exam');
        }

        // Fetch available exams
        const examsResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/available`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Available exams response:', examsResponse.data);

        let examsData = [];
        
        if (examsResponse.data.exams) {
          examsData = examsResponse.data.exams;
        } else if (Array.isArray(examsResponse.data)) {
          examsData = examsResponse.data;
        } else if (examsResponse.data.success && examsResponse.data.data) {
          examsData = examsResponse.data.data;
        } else {
          examsData = [];
        }

        const courseExam = examsData.find(
          (e: any) => e.courseId === courseId
        );

        if (!courseExam) {
          throw new Error('No exam available for this course');
        }

        // Get exam details
        const examDetailsResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/details/${courseExam.examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Exam details response:', examDetailsResponse.data);

        if (examDetailsResponse.data.success && examDetailsResponse.data.exam) {
          setExam(examDetailsResponse.data.exam);
          setTimeLeft(examDetailsResponse.data.exam.timeLimit * 60);
        } else {
          throw new Error('Failed to load exam details');
        }

        // Get exam history
        try {
          const historyResponse = await axios.get(
            `${API_BASE_URL}/pack365/exams/history/${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log('Exam history response:', historyResponse.data);

          if (historyResponse.data.success) {
            setHistory(historyResponse.data.examHistory);
          }
        } catch (historyError) {
          console.warn('Failed to load exam history:', historyError);
          // Continue without history
        }

      } catch (error: any) {
        console.error('Error initializing exam:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load exam';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [courseId, stream, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

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

    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const startExam = () => {
    if (history && history.remainingAttempts <= 0) {
      showToast('You have used all your exam attempts', 'error');
      return;
    }
    setExamStarted(true);
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = (): number => {
    if (!exam) return 0;

    let correctAnswers = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return (correctAnswers / exam.questions.length) * 100;
  };

  const handleAutoSubmit = async () => {
    if (!exam) return;
    
    const score = calculateScore();
    await submitExam(score, timeLeft);
  };

  const submitExam = async (score?: number, remainingTime?: number) => {
    if (!exam) return;

    const token = localStorage.getItem('token');
    const finalScore = score || calculateScore();
    const timeTaken = exam.timeLimit * 60 - (remainingTime || timeLeft);

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_BASE_URL}/pack365/exams/submit`,
        {
          courseId: courseId,
          examId: exam.examId,
          marks: finalScore,
          timeTaken: timeTaken
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setExamResult(response.data);
        setShowResults(true);
        setExamStarted(false);
        
        showToast(response.data.isPassed ? 'Exam Passed!' : 'Exam Failed', 
                 response.data.isPassed ? 'success' : 'error');
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      showToast('Failed to submit exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetakeExam = () => {
    setShowResults(false);
    setExamStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(exam?.timeLimit ? exam.timeLimit * 60 : 0);
    setExamResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookIcon />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Exam</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookIcon />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Exam Not Available</h2>
          <p className="text-gray-500 mb-6">Unable to load exam content.</p>
          <button 
            onClick={() => navigate(`/pack365-learning/${stream}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                examResult.isPassed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {examResult.isPassed ? (
                  <CheckIcon />
                ) : (
                  <CrossIcon />
                )}
              </div>
              <h1 className={`text-2xl font-bold mt-4 ${
                examResult.isPassed ? 'text-green-600' : 'text-red-600'
              }`}>
                {examResult.isPassed ? 'Exam Passed!' : 'Exam Failed'}
              </h1>
            </div>
            
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {examResult.currentScore?.toFixed(1) || '0'}%
                  </div>
                  <div className="text-sm text-blue-600">Your Score</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {examResult.bestScore?.toFixed(1) || '0'}%
                  </div>
                  <div className="text-sm text-green-600">Best Score</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {examResult.attemptNumber || '1'}
                  </div>
                  <div className="text-sm text-purple-600">Attempt</div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {examResult.remainingAttempts || '0'}
                  </div>
                  <div className="text-sm text-orange-600">Remaining</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold mb-2">
                  Passing Score: {exam.passingScore}%
                </p>
                {examResult.isPassed ? (
                  <p className="text-green-600">Congratulations! You passed the exam.</p>
                ) : (
                  <p className="text-red-600">
                    You need {exam.passingScore - Math.ceil(examResult.currentScore || 0)}% more to pass.
                  </p>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                {examResult.canRetake && (
                  <button 
                    onClick={handleRetakeExam}
                    className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                  >
                    Retake Exam
                  </button>
                )}
                
                <button 
                  onClick={() => navigate(`/pack365-learning/${stream}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <BackIcon />
                  Back to Learning
                </button>
                
                <button 
                  onClick={() => navigate(`/exam-result/${stream}`, { state: { examResult } })}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  <ChartIcon />
                  Detailed Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Exam Instructions</h1>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course: {courseName}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-semibold">{exam.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Limit:</span>
                      <span className="font-semibold">{exam.timeLimit} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passing Score:</span>
                      <span className="font-semibold">{exam.passingScore}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Attempts:</span>
                      <span className="font-semibold">{exam.maxAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Attempts:</span>
                      <span className="font-semibold">
                        {history ? history.totalAttempts : 0} / {exam.maxAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Score:</span>
                      <span className="font-semibold">
                        {history?.bestScore ? `${history.bestScore.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• The exam must be completed in one session</li>
                  <li>• Timer will start when you begin the exam</li>
                  <li>• You cannot pause the exam once started</li>
                  <li>• Answers are auto-saved as you select them</li>
                  <li>• Exam will auto-submit when time expires</li>
                </ul>
              </div>

              {history && history.attempts && history.attempts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <HistoryIcon />
                    Previous Attempts
                  </h4>
                  <div className="space-y-2">
                    {history.attempts.slice(0, 3).map((attempt, index) => (
                      <div key={attempt.attemptId} className="flex justify-between items-center text-sm">
                        <span>Attempt {history.totalAttempts - index}:</span>
                        <span className={`px-2 py-1 rounded ${
                          attempt.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.score.toFixed(1)}% - {attempt.isPassed ? 'Passed' : 'Failed'}
                        </span>
                        <span className="text-gray-500">
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate(`/pack365-learning/${stream}`)}
                  className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  <BackIcon />
                  Back to Learning
                </button>
                
                <button 
                  onClick={startExam}
                  disabled={history && history.remainingAttempts <= 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Start Exam
                </button>
              </div>

              {history && history.remainingAttempts <= 0 && (
                <div className="text-center text-red-600 font-semibold">
                  No attempts remaining. Please contact administrator.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exam Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-xl font-bold">{courseName} - Exam</h1>
              <p className="text-gray-600 text-sm">
                Question {currentQuestion + 1} of {exam.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <ClockIcon />
                <span className="text-lg font-bold text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <ProgressBar value={progress} className="w-32" />
              
              <button 
                onClick={() => submitExam()}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${
                      index === currentQuestion
                        ? 'bg-blue-500 text-white border-blue-500'
                        : answers[index]
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Current Question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    currentQuestionData.type === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestionData.type === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestionData.type.charAt(0).toUpperCase() + currentQuestionData.type.slice(1)}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion + 1} / {exam.questions.length}
                  </span>
                </div>

                {/* Question Text */}
                <div className="text-lg font-medium">
                  {currentQuestionData.questionText}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, optionIndex) => {
                    const isSelected = answers[currentQuestion] === option;
                    const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(currentQuestion, option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {optionLetter}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() => setCurrentQuestion(prev => 
                      Math.min(exam.questions.length - 1, prev + 1)
                    )}
                    disabled={currentQuestion === exam.questions.length - 1}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
