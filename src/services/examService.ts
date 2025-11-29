// services/examService.ts
import { pack365Api } from '@/services/api';

export interface Exam {
  _id: string;
  examId: string;
  courseId: {
    _id: string;
    courseName: string;
    stream?: string;
  };
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  questionsCount?: number;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  type: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface ExamAttempt {
  attemptId: string;
  score: number;
  examId: string;
  submittedAt: string;
  timeTaken: number;
  isPassed: boolean;
}

export interface ExamHistory {
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

export const examService = {
  // Get all available exams
  getAllExams: async (token: string): Promise<{ success: boolean; exams: Exam[]; message?: string }> => {
    try {
      const response = await pack365Api.getAllExams(token);
      return response;
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      return {
        success: false,
        exams: [],
        message: error.response?.data?.message || 'Failed to fetch exams'
      };
    }
  },

  // Get exam questions
  getExamQuestions: async (
    examId: string,
    token: string,
    showAnswers: boolean = false
  ): Promise<{ success: boolean; questions: Question[]; message?: string }> => {
    try {
      const response = await pack365Api.getExamQuestions(examId, showAnswers, token);
      return response;
    } catch (error: any) {
      console.error('Error fetching exam questions:', error);
      return {
        success: false,
        questions: [],
        message: error.response?.data?.message || 'Failed to fetch exam questions'
      };
    }
  },

  // Get exam details
  getExamDetails: async (
    examId: string,
    token: string
  ): Promise<{ success: boolean; exam: any; message?: string }> => {
    try {
      const response = await pack365Api.getExamDetails(examId, token);
      return response;
    } catch (error: any) {
      console.error('Error fetching exam details:', error);
      return {
        success: false,
        exam: null,
        message: error.response?.data?.message || 'Failed to fetch exam details'
      };
    }
  },

  // Submit exam
  submitExam: async (
    token: string,
    data: {
      courseId: string;
      examId: string;
      marks: number;
      timeTaken?: number;
    }
  ) => {
    return await pack365Api.submitExam(token, data);
  },

  // Get exam history
  getExamHistory: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; examHistory: ExamHistory; message?: string }> => {
    try {
      const response = await pack365Api.getExamHistory(token, courseId);
      return response;
    } catch (error: any) {
      console.error('Error fetching exam history:', error);
      return {
        success: false,
        examHistory: {} as ExamHistory,
        message: error.response?.data?.message || 'Failed to fetch exam history'
      };
    }
  },

  // Get available exams for user
  getAvailableExamsForUser: async (token: string) => {
    return await pack365Api.getAvailableExamsForUser(token);
  }
};
