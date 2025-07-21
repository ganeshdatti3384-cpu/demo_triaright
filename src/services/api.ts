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

  getAllEnrollmentCodes: async (
    token: string
  ): Promise<{ success: boolean; total: number; codes: EnrollmentCode[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/enrollment-codes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateEnrollmentCode: async (
    token: string,
    codeId: string,
    data: UpdateEnrollmentCodeInput
  ): Promise<{ success: boolean; message: string; code: EnrollmentCode }> => {
    const res = await axios.put(`${API_BASE_URL}/pack365/enrollment-codes/${codeId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deactivateEnrollmentCode: async (
    token: string,
    codeId: string
  ): Promise<{ success: boolean; message: string; code: EnrollmentCode }> => {
    const res = await axios.put(`${API_BASE_URL}/pack365/enrollment-codes/${codeId}`, 
      { isActive: false }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  validateEnrollmentCode: async (
    token: string,
    data: {
      code: string;
      courseId?: string;
    }
  ): Promise<{ 
    success: boolean; 
    message: string; 
    courseDetails?: any;
    couponDetails?: {
      discount: number;
      description: string;
      code: string;
    };
  }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/validate-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  enrollWithCode: async (
    token: string,
    data: {
      code: string;
      courseId?: string;
    }
  ): Promise<{ success: boolean; message: string; enrollment: EnhancedPack365Enrollment; courseDetails: any }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/enroll-with-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createOrder: async (
    token: string,
    data: { stream: string }
  ): Promise<{ orderId: string; key: string }> => {
    const res = await axios.post(
      `${API_BASE_URL}/pack365/create-order`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      orderId: res.data.orderId,
      key: res.data.key
    };
  },

  verifyPayment: async (
  token: string,
  data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
): Promise<{ success: boolean; message: string; enrollment: EnhancedPack365Enrollment }> => {
  console.log("Verifying payment with:", data, token);
  const res = await axios.post(
    `${API_BASE_URL}/pack365/verify-payment`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
},


  handlePaymentFailure: async (
    token: string,
    data: {
      razorpay_order_id: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/payment-failure`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/packenroll365/my-enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  checkEnrollmentStatus: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; isEnrolled: boolean; enrollment: EnhancedPack365Enrollment | null }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/packenroll365/check-enrollment/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateTopicProgress: async (
    token: string,
    data: {
      courseId: string;
      topicName: string;
      watchedDuration: number;
      totalCourseDuration?: number;
      totalWatchedPercentage?: number;
    }
  ): Promise<{
    success: boolean;
    message: string;
    videoProgress: number;
    totalWatchedPercentage: number;
    topicProgress: TopicProgress[];
  }> => {
    const res = await axios.post(
      `${API_BASE_URL}/pack365/packenroll365/update-topic-progress`,
      data,
      {
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
