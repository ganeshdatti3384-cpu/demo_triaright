
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://triaright.com/api',
  timeout: 10000,
});

// Auth API
export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  changePassword: async (token: string, passwords: any) => {
    const response = await api.post('/auth/change-password', passwords, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  changePasswordWithEmail: async (data: { email: string; newPassword: string }) => {
    const response = await api.post('/auth/change-password-email', data);
    return response.data;
  },

  updatePassword: async (token: string, passwords: any) => {
    const response = await api.post('/auth/update-password', passwords, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (token: string, profileData: any) => {
    const response = await api.put('/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Pack365 API
export const pack365Api = {
  getAllCourses: async () => {
    const response = await api.get('/pack365/getcourses');
    return response.data;
  },

  getCourseById: async (courseId: string) => {
    const response = await api.get(`/pack365/getcourse/${courseId}`);
    return response.data;
  },

  getAllCoupons: async (token: string) => {
    const response = await api.get('/pack365/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createCoupon: async (token: string, couponData: any) => {
    const response = await api.post('/pack365/coupons', couponData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateCoupon: async (token: string, couponId: string, couponData: any) => {
    const response = await api.put(`/pack365/coupons/${couponId}`, couponData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteCoupon: async (token: string, couponId: string) => {
    const response = await api.delete(`/pack365/coupons/${couponId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  enrollWithCode: async (token: string, courseId: string, code: string) => {
    const response = await api.post('/pack365/enroll-with-code', { courseId, code }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  checkEnrollmentStatus: async (token: string, courseId: string) => {
    const response = await api.get(`/pack365/packenroll365/check-enrollment/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getMyEnrollments: async (token: string) => {
    const response = await api.get('/pack365/my-enrollments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateTopicProgress: async (token: string, courseId: string, topicName: string, watchedDuration: number, totalCourseDuration: number) => {
    const response = await api.post('/pack365/update-topic-progress', {
      courseId,
      topicName,
      watchedDuration,
      totalCourseDuration
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createCourse: async (token: string, courseData: any) => {
    const response = await api.post('/pack365/courses', courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateCourse: async (token: string, courseId: string, courseData: any) => {
    const response = await api.put(`/pack365/courses/${courseId}`, courseData, {
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

  getExamDetails: async (token: string, examId: string) => {
    const response = await api.get(`/pack365/exams/${examId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getExamQuestions: async (token: string, examId: string) => {
    const response = await api.get(`/pack365/exams/${examId}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  submitExam: async (token: string, examId: string, answers: any) => {
    const response = await api.post(`/pack365/exams/${examId}/submit`, { answers }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAvailableExamsForUser: async (token: string) => {
    const response = await api.get('/pack365/exams/available', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createOrder: async (token: string, stream: string) => {
    const response = await api.post('/pack365/packenroll365/create-order', { stream }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  verifyPayment: async (token: string, paymentData: any) => {
    const response = await api.post('/pack365/verify-payment', paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  handlePaymentFailure: async (token: string, orderData: any) => {
    const response = await api.post('/pack365/packenroll365/payment-failure', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Profile API
export const profileApi = {
  getProfile: async (token: string) => {
    const response = await api.get('/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (token: string, profileData: any) => {
    const response = await api.put('/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getStudentProfile: async (token: string) => {
    const response = await api.get('/profile/student', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getJobSeekerProfile: async (token: string) => {
    const response = await api.get('/profile/jobseeker', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getEmployerProfile: async (token: string) => {
    const response = await api.get('/profile/employer', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getCollegeProfile: async (token: string) => {
    const response = await api.get('/profile/college', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateStudentProfile: async (token: string, profileData: any) => {
    const response = await api.put('/profile/student', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateJobSeekerProfile: async (token: string, profileData: any) => {
    const response = await api.put('/profile/jobseeker', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateEmployerProfile: async (token: string, profileData: any) => {
    const response = await api.put('/profile/employer', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateCollegeProfile: async (token: string, profileData: any) => {
    const response = await api.put('/profile/college', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Export types
export interface Pack365Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  topics: Array<{
    _id: string;
    name: string;
    link: string;
    duration: number;
  }>;
  totalDuration: number;
}

export interface EnhancedPack365Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  courseName: string;
  enrollmentDate: Date;
  paymentStatus: string;
  topicProgress: Array<{
    topicName: string;
    watched: boolean;
    watchedDuration: number;
  }>;
  totalWatchedPercentage: number;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  collegeName?: string;
  companyName?: string;
}

export default api;
