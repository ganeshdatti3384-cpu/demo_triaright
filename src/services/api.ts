
import axios from 'axios';
import { RegisterPayload, LoginPayload } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: RegisterPayload) => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  login: async (data: LoginPayload) => {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },

  getUser: async (token: string) => {
    const response = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateUser: async (token: string, data: any) => {
    const response = await api.put('/users/me', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteUser: async (token: string) => {
    const response = await api.delete('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  changePassword: async (token: string, data: any) => {
    const response = await api.post('/users/change-password', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updatePassword: async (token: string, data: any) => {
    const response = await api.post('/users/change-password', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  forgotPassword: async (data: any) => {
    const response = await api.post('/users/forgot-password', data);
    return response.data;
  },

  resetPassword: async (token: string, data: any) => {
    const response = await api.post('/users/reset-password', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  changePasswordWithEmail: async (data: any) => {
    const response = await api.post('/users/forgot-password', data);
    return response.data;
  },

  createUser: async (token: string, data: any) => {
    const response = await api.post('/users/create', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export const collegeApi = {
  getCollegeRequests: async (token: string) => {
    const response = await api.get('/colleges/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  acceptServiceRequest: async (token: string, requestId: string) => {
    const response = await api.put(`/colleges/requests/${requestId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  rejectServiceRequest: async (token: string, requestId: string) => {
    const response = await api.put(`/colleges/requests/${requestId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getDashboardStats: async (token: string) => {
    const response = await api.get('/colleges/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getMyServiceRequests: async (token: string) => {
    const response = await api.get('/colleges/my-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createServiceRequest: async (token: string, data: any) => {
    const response = await api.post('/colleges/service-request', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const statisticsApi = {
  getStudentCount: async (token: string) => {
    const response = await api.get('/users/statistics/count/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getCollegeCount: async (token: string) => {
    const response = await api.get('/users/statistics/count/colleges', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getEmployerCount: async (token: string) => {
    const response = await api.get('/users/statistics/count/employers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getJobseekerCount: async (token: string) => {
    const response = await api.get('/users/statistics/count/jobseekers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const pack365Api = {
  getAllCourses: async () => {
    const response = await api.get('/pack365/courses');
    return response.data;
  },

  getCourse: async (courseId: string) => {
    const response = await api.get(`/pack365/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (token: string, data: any) => {
    const response = await api.post('/pack365/courses', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateCourse: async (token: string, courseId: string, data: any) => {
    const response = await api.put(`/pack365/courses/${courseId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteCourse: async (token: string, courseId: string) => {
    const response = await api.delete(`/pack365/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  enrollInCourse: async (token: string, data: any) => {
    const response = await api.post('/pack365/enroll', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getUserEnrollments: async (token: string) => {
    const response = await api.get('/pack365/enrollments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateTopicProgress: async (token: string, enrollmentId: string, data: any) => {
    const response = await api.put(`/pack365/enrollments/${enrollmentId}/progress`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getExam: async (token: string, courseId: string) => {
    const response = await api.get(`/pack365/exams/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  submitExam: async (token: string, data: any) => {
    const response = await api.post('/pack365/exams/submit', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createOrder: async (token: string, data: any) => {
    const response = await api.post('/pack365/create-order', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  verifyPayment: async (token: string, data: any) => {
    const response = await api.post('/pack365/verify-payment', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const profileApi = {
  getProfile: async (token: string) => {
    const response = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (token: string, data: any) => {
    const response = await api.put('/users/profile', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  uploadFile: async (token: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/users/upload', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Export types
export type { RegisterPayload, LoginPayload } from '@/types/api';
export type { Pack365Course, EnhancedPack365Enrollment } from '@/types/api';
