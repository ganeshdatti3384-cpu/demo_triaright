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
