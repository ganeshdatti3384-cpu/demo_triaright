
import axios from 'axios';

const BASE_URL = 'https://triaright.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Course interfaces
export interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  demoVideoLink?: string;
  courseType: 'paid' | 'unpaid';
  price: number;
  duration: number;
  stream: string;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: boolean;
  additionalInformation?: string;
  courseImageLink?: string;
  curriculumDocLink?: string;
  curriculum: Array<{
    title: string;
    duration: number;
    description?: string;
  }>;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  course?: Course;
  courses?: Course[];
}

// Course API functions
export const courseApi = {
  // Get all courses
  getAllCourses: async (): Promise<CourseResponse> => {
    try {
      const response = await api.get('/courses');
      return {
        success: true,
        courses: response.data
      };
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch courses'
      };
    }
  },

  // Get course by ID
  getCourseById: async (courseId: string): Promise<CourseResponse> => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return {
        success: true,
        course: response.data
      };
    } catch (error: any) {
      console.error('Error fetching course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch course'
      };
    }
  },

  // Get free courses
  getFreeCourses: async (): Promise<CourseResponse> => {
    try {
      const response = await api.get('/courses/free');
      return {
        success: true,
        courses: response.data
      };
    } catch (error: any) {
      console.error('Error fetching free courses:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch free courses'
      };
    }
  },

  // Get paid courses
  getPaidCourses: async (): Promise<CourseResponse> => {
    try {
      const response = await api.get('/courses/paid');
      return {
        success: true,
        courses: response.data
      };
    } catch (error: any) {
      console.error('Error fetching paid courses:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch paid courses'
      };
    }
  },

  // Create course (admin only)
  createCourse: async (courseData: FormData, token: string): Promise<CourseResponse> => {
    try {
      const response = await api.post('/courses/postcourse', courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        course: response.data.course,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error creating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create course'
      };
    }
  },

  // Update course (superadmin only)
  updateCourse: async (courseId: string, courseData: FormData, token: string): Promise<CourseResponse> => {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        course: response.data.course,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error updating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update course'
      };
    }
  },

  // Delete course (superadmin only)
  deleteCourse: async (courseId: string, token: string): Promise<CourseResponse> => {
    try {
      const response = await api.delete(`/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete course'
      };
    }
  }
};
