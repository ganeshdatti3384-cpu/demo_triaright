import axios from 'axios';

const API_BASE_URL = 'https://triaright.com/api';

const api = axios.createInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error - redirect to login or refresh token
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  },

  changePassword: async (passwords: any) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      console.error('Changing password failed', error);
      throw error;
    }
  },

  updateProfile: async (token: string, profileData: any) => {
    try {
      const response = await api.put('/auth/update-profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Updating profile failed:', error);
      throw error;
    }
  },

  getUserProfile: async (token: string) => {
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Fetching user profile failed:', error);
      throw error;
    }
  }
};

// Course API
export const courseApi = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses/getcourses');
      return response.data;
    } catch (error) {
      console.error('Error loading courses:', error);
      throw error;
    }
  },

  getCourseById: async (courseId: string) => {
    try {
      const response = await api.get(`/courses/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading course:', error);
      throw error;
    }
  },

  enrollInCourse: async (courseId: string, token: string) => {
    try {
      const response = await api.post(`/courses/enroll/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  getEnrolledCourses: async (token: string) => {
    try {
      const response = await api.get('/courses/enrolled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  },

  getCourseContent: async (courseId: string, token: string) => {
    try {
      const response = await api.get(`/courses/content/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course content:', error);
      throw error;
    }
  },

  markTopicCompleted: async (courseId: string, topicId: string, token: string) => {
    try {
      const response = await api.post(`/courses/mark-completed/${courseId}/${topicId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking topic completed:', error);
      throw error;
    }
  },

  getCourseExams: async (courseId: string, token: string) => {
    try {
      const response = await api.get(`/courses/exams/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course exams:', error);
      throw error;
    }
  },

  submitExam: async (examId: string, answers: any, token: string) => {
    try {
      const response = await api.post(`/courses/submit-exam/${examId}`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  },

  getExamResult: async (examId: string, token: string) => {
    try {
      const response = await api.get(`/courses/exam-result/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam result:', error);
      throw error;
    }
  }
};

// Pack365 API
export const pack365Api = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/pack365/getcourses');
      return response.data;
    } catch (error) {
      console.error('Error loading courses:', error);
      throw error;
    }
  },

  getCourseById: async (courseId: string) => {
    try {
      const response = await api.get(`/pack365/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading course:', error);
      throw error;
    }
  },

  getAllCoupons: async (token: string) => {
    try {
      const response = await api.get('/pack365/coupons/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  createCoupon: async (token: string, couponData: any) => {
    try {
      const response = await api.post('/pack365/coupons/create', couponData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  updateCouponStatus: async (token: string, couponId: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/pack365/coupons/${couponId}/status`, 
        { isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating coupon status:', error);
      throw error;
    }
  },

  validateCoupon: async (couponCode: string, courseId: string) => {
    try {
      const response = await api.post('/pack365/coupons/validate', {
        code: couponCode,
        courseId: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  },

  // New Pack365 Payment endpoints
  createPaymentOrder: async (token: string, orderData: {
    stream: string;
    courseId?: string;
    fromStream: boolean;
    fromCourse: boolean;
  }) => {
    try {
      const response = await api.post('/pack365/packenroll365/create-order', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  verifyPayment: async (token: string, paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const response = await api.post('/pack365/verify-payment', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  handlePaymentFailure: async (token: string, failureData: {
    razorpay_order_id: string;
  }) => {
    try {
      const response = await api.post('/pack365/packenroll365/payment-failure', failureData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  },

  checkEnrollmentStatus: async (token: string, courseId: string) => {
    try {
      const response = await api.get(`/pack365/packenroll365/check-enrollment/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      throw error;
    }
  }
};

// College API
export const collegeApi = {
  getCollegeStats: async (token: string) => {
    try {
      const response = await api.get('/colleges/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching college stats:', error);
      throw error;
    }
  },

  createServiceRequest: async (token: string, requestData: {
    institutionName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    expectedStudents: number;
    preferredDate: string;
    additionalRequirements: string;
    serviceDescription: string;
    serviceCategory: string[];
  }) => {
    try {
      const response = await api.post('/colleges/service-request', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  },

  getMyServiceRequests: async (token: string) => {
    try {
      const response = await api.get('/colleges/college/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  getAllServiceRequests: async (token: string) => {
    try {
      const response = await api.get('/colleges/admin/all-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all service requests:', error);
      throw error;
    }
  },

  acceptServiceRequest: async (token: string, requestId: string) => {
    try {
      const response = await api.patch(`/colleges/admin/accept-request/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error accepting service request:', error);
      throw error;
    }
  },

  rejectServiceRequest: async (token: string, requestId: string) => {
    try {
      const response = await api.patch(`/colleges/admin/reject-request/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting service request:', error);
      throw error;
    }
  }
};

// Jobs API
export const jobsApi = {
  getAllJobs: async () => {
    try {
      const response = await api.get('/jobs/getjobs');
      return response.data;
    } catch (error) {
      console.error('Error loading jobs:', error);
      throw error;
    }
  },

  getJobById: async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading job:', error);
      throw error;
    }
  },

  applyForJob: async (jobId: string, token: string) => {
    try {
      const response = await api.post(`/jobs/apply/${jobId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  getAppliedJobs: async (token: string) => {
    try {
      const response = await api.get('/jobs/applied', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      throw error;
    }
  }
};
