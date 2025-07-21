import axios from 'axios';
import { CreateEnrollmentCodeInput, UpdateEnrollmentCodeInput } from '@/types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  updatePassword: async (payload: any) => {
    try {
      const response = await api.post('/auth/update-password', payload);
      return response.data;
    } catch (error: any) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (payload: any) => {
    try {
      const response = await api.post('/auth/reset-password', payload);
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // No need to send a request to the server, just clear the local storage
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

export const courseApi = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error: any) {
      console.error('Get all courses error:', error);
      throw error;
    }
  },

  getCourseById: async (id: string) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get course by ID error:', error);
      throw error;
    }
  },

  createCourse: async (courseData: any) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error: any) {
      console.error('Create course error:', error);
      throw error;
    }
  },

  updateCourse: async (id: string, courseData: any) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error: any) {
      console.error('Update course error:', error);
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete course error:', error);
      throw error;
    }
  },
};

export const profileApi = {
  getCollegeProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/college', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.college;
    } catch (error: any) {
      console.error('Get college profile error:', error);
      throw error;
    }
  },

  updateCollegeProfile: async (token: string, profileData: any) => {
    try {
      const response = await api.put('/profile/college', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update college profile error:', error);
      throw error;
    }
  },

  getEmployerProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/employer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.employer;
    } catch (error: any) {
      console.error('Get employer profile error:', error);
      throw error;
    }
  },

  updateEmployerProfile: async (token: string, profileData: any) => {
    try {
      const response = await api.put('/profile/employer', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update employer profile error:', error);
      throw error;
    }
  },

  getStudentProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/student', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.student;
    } catch (error: any) {
      console.error('Get student profile error:', error);
      throw error;
    }
  },

  updateStudentProfile: async (token: string, profileData: any) => {
    try {
      const response = await api.put('/profile/student', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update student profile error:', error);
      throw error;
    }
  },

  getJobSeekerProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/job-seeker', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.jobSeeker;
    } catch (error: any) {
      console.error('Get job seeker profile error:', error);
      throw error;
    }
  },

  updateJobSeekerProfile: async (token: string, profileData: any) => {
    try {
      const response = await api.put('/profile/job-seeker', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update job seeker profile error:', error);
      throw error;
    }
  },
};

export const pack365Api = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/pack365/courses');
      return response.data;
    } catch (error: any) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  getAllStreams: async () => {
    try {
      const response = await api.get('/pack365/streams');
      return response.data;
    } catch (error: any) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  getCourseById: async (courseId: string, token: string) => {
    try {
      const response = await api.get(`/pack365/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get course by ID error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch course' };
    }
  },

  checkEnrollmentStatus: async (token: string, courseId: string) => {
    try {
      const response = await api.get(`/pack365/enrollment-status/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Check enrollment status error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to check enrollment status' };
    }
  },

  validateEnrollmentCode: async (token: string, code: string, stream: string) => {
    try {
      const response = await api.post('/pack365/verify/enrollment-codes', {
        code,
        stream
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Validate enrollment code error:', error);
      throw error;
    }
  },

  createEnrollmentCode: async (token: string, codeData: CreateEnrollmentCodeInput) => {
    try {
      const response = await api.post('/pack365/enrollment-codes', codeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Create enrollment code error:', error);
      throw error;
    }
  },

  getAllEnrollmentCodes: async (token: string) => {
    try {
      const response = await api.get('/pack365/enrollment-codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get all enrollment codes error:', error);
      throw error;
    }
  },

  updateEnrollmentCode: async (token: string, id: string, updates: UpdateEnrollmentCodeInput) => {
    try {
      const response = await api.put(`/pack365/enrollment-codes/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update enrollment code error:', error);
      throw error;
    }
  },

  deactivateEnrollmentCode: async (token: string, id: string) => {
    try {
      const response = await api.put(`/pack365/enrollment-codes/${id}`, 
        { isActive: false }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Deactivate enrollment code error:', error);
      throw error;
    }
  }
};
