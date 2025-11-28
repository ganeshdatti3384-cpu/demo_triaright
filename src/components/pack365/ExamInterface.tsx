// ExamInterface.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

interface Enrollment {
  _id: string;
  stream: string;
  totalWatchedPercentage: number;
  examAttempts: ExamAttempt[];
  bestExamScore: number;
  isExamCompleted: boolean;
  examScore: number;
}

interface Course {
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
}

const ExamInterface: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [history, setHistory] = useState<ExamHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentView, setCurrentView] = useState<'exam' | 'results' | 'history'>('exam');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get course info from navigation state or fetch it
  const locationCourse = location.state?.course as Course;

  // Simple toast replacement
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Check eligibility
  const isEligibleForExam = enrollment?.totalWatchedPercentage >= 80;

  // Fetch exam data
  const fetchExamData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch course details if not provided via state
      if (!locationCourse && courseId) {
        const courseResponse = await axios.get(
          `${API_BASE_URL}/pack365/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (courseResponse.data.success) {
          setCourse(courseResponse.data.data);
        }
      } else {
        setCourse(locationCourse);
      }

      // Fetch user enrollments to check eligibility
      const enrollmentResponse = await axios.get(
        `${API_BASE_URL}/pack365/enrollments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let enrollmentsData: Enrollment[] = [];
      if (enrollmentResponse.data.enrollments) {
        enrollmentsData = enrollmentResponse.data.enrollments;
      } else if (Array.isArray(enrollmentResponse.data)) {
        enrollmentsData = enrollmentResponse.data;
      }

      // Find enrollment for this course's stream
      const streamEnrollment = enrollmentsData.find(
        (e: Enrollment) => e.stream === locationCourse?.stream
      );
      setEnrollment(streamEnrollment || null);

      if (!isEligibleForExam) {
        setError('Complete 80% of the course to unlock exam');
        setLoading(false);
        return;
      }

      // Fetch available exams
      const examsResponse = await axios.get(
        `${API_BASE_URL}/pack365/exams/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Find exam for this course
      const courseExam = examsResponse.data.find(
        (e: Exam) => e.courseId === courseId
      );

      if (courseExam) {
        // Get full exam details with questions
        const examDetailsResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/details/${courseExam.examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setExam(examDetailsResponse.data);
        setTimeLeft(courseExam.timeLimit * 60); // Convert to seconds
      } else {
        setError('No exam found for this course');
      }

      // Fetch exam history
      if (courseId) {
        const historyResponse = await axios.get(
          `${API_BASE_URL}/pack365/exams/history/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(historyResponse.data.examHistory);
      }

    } catch (error: any) {
      console.error('Error fetching exam data:', error);
      setError(error.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || currentView !== 'exam') return;

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
  }, [timeLeft, currentView]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex: number, selectedAnswer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  // Auto-submit when timer ends
  const handleAutoSubmit = async () => {
    if (exam && Object.keys(answers).length > 0) {
      await submitExam();
    }
  };

  // Submit exam
  const submitExam = async () => {
    if (!exam || !courseId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSubmitting(true);

      // Calculate score
      let correctAnswers = 0;
      exam.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / exam.questions.length) * 100);
      const timeTaken = exam.timeLimit * 60 - timeLeft;

      const submitData = {
        courseId,
        examId: exam.examId,
        marks: score,
        timeTaken
      };

      const response = await axios.post(
        `${API_BASE_URL}/pack365/exams/submit`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      setCurrentView('results');
      showToast('Exam submitted successfully!');

      // Refresh history
      const historyResponse = await axios.get(
        `${API_BASE_URL}/pack365/exams/history/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(historyResponse.data.examHistory);

    } catch (error: any) {
      console.error('Error submitting exam:', error);
      setError(error.response?.data?.message || 'Failed to submit exam');
      showToast('Failed to submit exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle manual submit
  const handleSubmit = async () => {
    const unanswered = exam?.questions.filter((_, index) => !answers[index]);
    if (unanswered && unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }
    await submitExam();
  };

  // Initialize
  useEffect(() => {
    fetchExamData();
  }, [courseId, locationCourse]);

  // Icons as simple components
  const ClockIcon = () => <span>⏱</span>;
  const CheckIcon = () => <span>✓</span>;
  const CrossIcon = () => <span>✗</span>;
  const BookIcon = () => <span>📚</span>;
  const BackIcon = () => <span>←</span>;
  const HistoryIcon = () => <span>📊</span>;
  const LockIcon = () => <span>🔒</span>;

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

  if (error && !isEligibleForExam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <LockIcon />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Locked</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Complete 80% of the course content to unlock this exam.'}
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Current Progress</span>
              <span>{enrollment?.totalWatchedPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${enrollment?.totalWatchedPercentage || 0}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Back to Course
          </button>
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
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Go Back
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
          <p className="text-gray-500 mb-6">No exam found for this course.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <BackIcon />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results View
  if (currentView === 'results' && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
              <p className="text-gray-600">{course?.courseName}</p>
            </div>

            <div className={`p-6 rounded-lg mb-6 ${
              result.isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="text-center">
                <div className={`text-6xl mb-4 ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isPassed ? <CheckIcon /> : <CrossIcon />}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${result.isPassed ? 'text-green-800' : 'text-red-800'}`}>
                  {result.isPassed ? 'Congratulations! You Passed!' : 'Exam Not Passed'}
                </h2>
                <p className={`text-lg ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  Score: {result.currentScore}% (Required: {exam.passingScore}%)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.currentScore}%</div>
                <div className="text-sm text-blue-600">Your Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.bestScore}%</div>
                <div className="text-sm text-green-600">Best Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.remainingAttempts}/{result.maxAttempts}
                </div>
                <div className="text-sm text-purple-600">Remaining Attempts</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentView('history')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <HistoryIcon />
                <span>View History</span>
              </button>
              
              {result.canRetake && (
                <button
                  onClick={() => {
                    setCurrentView('exam');
                    setAnswers({});
                    setTimeLeft(exam.timeLimit * 60);
                    setResult(null);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Retake Exam
                </button>
              )}
              
              <button
                onClick={() => navigate(-1)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <BackIcon />
                <span>Back to Course</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // History View
  if (currentView === 'history' && history) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Exam History</h1>
                <p className="text-gray-600">{course?.courseName}</p>
              </div>
              <button
                onClick={() => setCurrentView('exam')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Exam
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Attempts:</span>
                    <span className="font-medium">{history.totalAttempts}/{history.maxAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Attempts:</span>
                    <span className="font-medium">{history.remainingAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Score:</span>
                    <span className="font-medium text-green-600">{history.bestScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Score:</span>
                    <span className="font-medium">{history.currentScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${history.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                      {history.isPassed ? 'Passed' : 'Not Passed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Eligibility</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Course Progress</span>
                      <span>{enrollment?.totalWatchedPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${enrollment?.totalWatchedPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className={`p-2 rounded text-center text-sm ${
                    isEligibleForExam ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isEligibleForExam ? 'Eligible for Exam' : 'Complete 80% to unlock exam'}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 mb-4">Attempt History</h3>
            <div className="space-y-4">
              {history.attempts && history.attempts.length > 0 ? (
                history.attempts.map((attempt, index) => (
                  <div key={attempt.attemptId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Attempt {history.attempts.length - index}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        attempt.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Score:</span> {attempt.score}%
                      </div>
                      <div>
                        <span className="font-medium">Time Taken:</span> {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(attempt.submittedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {new Date(attempt.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No exam attempts yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Exam View
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">{course?.courseName} - Exam</h1>
              <p className="text-gray-600">Complete all 30 questions before time runs out</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <ClockIcon />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>

              {/* Progress */}
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Answered: {Object.keys(answers).length}/{exam.questions.length}
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(Object.keys(answers).length / exam.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('history')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <HistoryIcon />
                <span>History</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Easy Questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span>Medium Questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Hard Questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Passing: {exam.passingScore}%</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-8">
            {exam.questions.map((question, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex-1">
                    Question {index + 1}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    question.type === 'easy' ? 'bg-green-100 text-green-800' :
                    question.type === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{question.questionText}</p>

                {question.description && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">{question.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerSelect(index, option)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>

                {answers[index] && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    Selected: {answers[index]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Section */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).length === exam.questions.length ? (
                  <span className="text-green-600">All questions answered ✓</span>
                ) : (
                  <span>
                    {exam.questions.length - Object.keys(answers).length} questions remaining
                  </span>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length === 0}
                  className={`px-6 py-2 rounded-lg text-white ${
                    submitting || Object.keys(answers).length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
