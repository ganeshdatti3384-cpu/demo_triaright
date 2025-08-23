import axios from 'axios';

const BASE_URL = 'https://triaright.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API functions
export const authApi = {
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response.data);
      throw error.response.data;
    }
  },
  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error.response.data);
      throw error.response.data;
    }
  },
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password request failed:', error.response.data);
      throw error.response.data;
    }
  },
  resetPassword: async (resetToken: string, newPassword: string) => {
    try {
      const response = await api.put(`/auth/resetpassword/${resetToken}`, { password: newPassword });
      return response.data;
    } catch (error: any) {
      console.error('Password reset failed:', error.response.data);
      throw error.response.data;
    }
  },
  changePassword: async (userId: string, currentPassword: string, newPassword: string, token: string) => {
    try {
      const response = await api.put(`/auth/changepassword/${userId}`, { currentPassword, newPassword }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Change password failed:', error.response.data);
      throw error.response.data;
    }
  },
  verifyEmail: async (verificationToken: string) => {
    try {
      const response = await api.get(`/auth/verifyemail/${verificationToken}`);
      return response.data;
    } catch (error: any) {
      console.error('Email verification failed:', error.response.data);
      throw error.response.data;
    }
  },
};

// College API functions
export const collegeApi = {
  getStudentCountByInstitution: async (institutionName: string, token: string) => {
    try {
      const response = await api.get(`/college/student-count?institutionName=${institutionName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch student count:', error.response.data);
      throw error.response.data;
    }
  },
};

// Pack365 API functions
export const pack365Api = {
  getAllStreams: async () => {
    try {
      const response = await api.get('/pack365/streams');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch streams:', error.response.data);
      throw error.response.data;
    }
  },
  getStreamByName: async (streamName: string) => {
    try {
      const response = await api.get(`/pack365/streams/${streamName}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch stream:', error.response.data);
      throw error.response.data;
    }
  },
  getCourseById: async (courseId: string, token: string) => {
    try {
      const response = await api.get(`/pack365/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch course:', error.response.data);
      throw error.response.data;
    }
  },
  checkEnrollmentStatus: async (token: string, courseId: string) => {
    try {
      const response = await api.get(`/pack365/enrollment/status?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to check enrollment status:', error.response.data);
      throw error.response.data;
    }
  },
  enrollInCourse: async (token: string, courseId: string) => {
    try {
      const response = await api.post(`/pack365/enrollment/enroll`, { courseId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to enroll in course:', error.response.data);
      throw error.response.data;
    }
  },
  getMyEnrollments: async (token: string) => {
    try {
      const response = await api.get('/pack365/enrollment/my-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error.response.data);
      throw error.response.data;
    }
  },
  getStreamCourses: async (streamName: string, token: string) => {
    try {
      const response = await api.get(`/pack365/courses/stream/${streamName}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch stream courses:', error.response.data);
      throw error.response.data;
    }
  },
};

// Coupon API functions
export const couponApi = {
  validateCoupon: async (couponCode: string, courseId: string, token: string) => {
    try {
      const response = await api.post('/coupon/validate', { couponCode, courseId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to validate coupon:', error.response.data);
      throw error.response.data;
    }
  },
};

// Razorpay API functions
export const razorpayApi = {
  createOrder: async (amount: number, token: string) => {
    try {
      const response = await api.post('/razorpay/create-order', { amount }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create order:', error.response.data);
      throw error.response.data;
    }
  },
  verifyPayment: async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, token: string) => {
    try {
      const response = await api.post('/razorpay/verify-payment', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify payment:', error.response.data);
      throw error.response.data;
    }
  },
};

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

// Profile API (placeholder)
export const profileApi = {
  updateProfile: async (data: any, token: string) => {
    return { success: true, message: 'Profile updated' };
  },
  getStudentProfile: async (token: string) => {
    return { success: true, profile: {} };
  },
  getJobSeekerProfile: async (token: string) => {
    return { success: true, profile: {} };
  },
  getEmployerProfile: async (token: string) => {
    return { success: true, profile: {} };
  },
  getCollegeProfile: async (token: string) => {
    return { success: true, profile: {} };
  },
  updateStudentProfile: async (data: any, token: string) => {
    return { success: true, message: 'Profile updated' };
  },
  updateJobSeekerProfile: async (data: any, token: string) => {
    return { success: true, message: 'Profile updated' };
  },
  updateEmployerProfile: async (data: any, token: string) => {
    return { success: true, message: 'Profile updated' };
  },
  updateCollegeProfile: async (data: any, token: string) => {
    return { success: true, message: 'Profile updated' };
  },
  updatePassword: async (data: any, token: string) => {
    return { success: true, message: 'Password updated' };
  }
};

// Add missing API functions
export const pack365ApiExtended = {
  ...pack365Api,
  updateTopicProgress: async (enrollmentId: string, topicName: string, progress: any, token: string) => {
    try {
      const response = await api.post(`/pack365/enrollment/${enrollmentId}/progress`, {
        topicName,
        ...progress
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  validateEnrollmentCode: async (code: string, streamName: string, token: string) => {
    try {
      const response = await api.post('/pack365/enrollment/validate-code', { code, streamName }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getAllCourses: async (token: string) => {
    try {
      const response = await api.get('/pack365/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  createStream: async (data: any, token: string) => {
    try {
      const response = await api.post('/pack365/streams', data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  updateStream: async (id: string, data: any, token: string) => {
    try {
      const response = await api.put(`/pack365/streams/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  deleteStream: async (id: string, token: string) => {
    try {
      const response = await api.delete(`/pack365/streams/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  createCourse: async (data: any, token: string) => {
    try {
      const response = await api.post('/pack365/courses', data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  updateCourse: async (id: string, data: any, token: string) => {
    try {
      const response = await api.put(`/pack365/courses/${id}`, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  deleteCourse: async (id: string, token: string) => {
    try {
      const response = await api.delete(`/pack365/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getAllEnrollmentCodes: async (token: string) => {
    try {
      const response = await api.get('/pack365/enrollment-codes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  createEnrollmentCode: async (data: any, token: string) => {
    try {
      const response = await api.post('/pack365/enrollment-codes', data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }
};

export const collegeApiExtended = {
  ...collegeApi,
  getCollegeStats: async (token: string) => {
    try {
      const response = await api.get('/college/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getCollegeRequests: async (token: string) => {
    try {
      const response = await api.get('/college/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  acceptServiceRequest: async (requestId: string, token: string) => {
    try {
      const response = await api.post(`/college/requests/${requestId}/accept`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  rejectServiceRequest: async (requestId: string, token: string) => {
    try {
      const response = await api.post(`/college/requests/${requestId}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  }
};

// Re-export everything from types/api
export * from '@/types/api';
