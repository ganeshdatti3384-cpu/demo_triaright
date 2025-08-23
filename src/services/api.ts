/* eslint-disable @typescript-eslint/no-explicit-any */
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
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }, token: string) => {
    try {
      const response = await api.put('/auth/update-password', passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update password failed:', error.response.data);
      throw error.response.data;
    }
  },
  changePasswordWithEmail: async (email: string, newPassword: string, token: string) => {
    try {
      const response = await api.put('/auth/change-password-email', { email, newPassword }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Change password with email failed:', error.response.data);
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
  getCollegeStats: async (token: string) => {
    try {
      const response = await api.get('/college/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch college stats:', error.response.data);
      throw error.response.data;
    }
  },
  getCollegeRequests: async (token: string) => {
    try {
      const response = await api.get('/college/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch college requests:', error.response.data);
      throw error.response.data;
    }
  },
  acceptServiceRequest: async (requestId: string, token: string) => {
    try {
      const response = await api.put(`/college/requests/${requestId}/accept`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to accept service request:', error.response.data);
      throw error.response.data;
    }
  },
  rejectServiceRequest: async (requestId: string, token: string) => {
    try {
      const response = await api.put(`/college/requests/${requestId}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to reject service request:', error.response.data);
      throw error.response.data;
    }
  },
};

export interface Pack365Course {
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
  description?: string;
  topics?: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  examFile?: File;
  documentLink?: string;
}

export interface EnhancedPack365Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  course: Pack365Course;
  enrolledAt: string;
  progress: number;
  completionStatus: 'enrolled' | 'in-progress' | 'completed';
  topicProgress: Array<{
    topicName: string;
    completed: boolean;
    completedAt?: string;
  }>;
  totalWatchedPercentage?: number;
  isExamCompleted?: boolean;
  examScore?: number;
  courseName?: string;
  stream?: string;
}

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
  updateTopicProgress: async (enrollmentId: string, topicName: string, progress: any, token: string) => {
    try {
      const response = await api.put(`/pack365/enrollment/${enrollmentId}/progress`, 
        { topicName, progress }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to update topic progress:', error.response.data);
      throw error.response.data;
    }
  },
  validateEnrollmentCode: async (code: string, streamName: string, token: string) => {
    try {
      const response = await api.post('/pack365/enrollment/validate-code', 
        { code, streamName }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to validate enrollment code:', error.response.data);
      throw error.response.data;
    }
  },
  createStream: async (streamData: { name: string; price: number; imageFile: File }, token: string) => {
    try {
      const formData = new FormData();
      formData.append('name', streamData.name);
      formData.append('price', streamData.price.toString());
      formData.append('imageFile', streamData.imageFile);
      
      const response = await api.post('/pack365/streams', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create stream:', error.response.data);
      throw error.response.data;
    }
  },
  updateStream: async (streamId: string, streamData: { name: string; price: number; imageFile?: File }, token: string) => {
    try {
      const formData = new FormData();
      formData.append('name', streamData.name);
      formData.append('price', streamData.price.toString());
      if (streamData.imageFile) {
        formData.append('imageFile', streamData.imageFile);
      }
      
      const response = await api.put(`/pack365/streams/${streamId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update stream:', error.response.data);
      throw error.response.data;
    }
  },
  deleteStream: async (streamId: string, token: string) => {
    try {
      const response = await api.delete(`/pack365/streams/${streamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete stream:', error.response.data);
      throw error.response.data;
    }
  },
  createCourse: async (courseData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'topics') {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (courseData[key] instanceof File) {
          formData.append(key, courseData[key]);
        } else {
          formData.append(key, courseData[key]);
        }
      });
      
      const response = await api.post('/pack365/courses', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create course:', error.response.data);
      throw error.response.data;
    }
  },
  updateCourse: async (courseId: string, courseData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'topics') {
          formData.append(key, JSON.stringify(courseData[key]));
        } else if (courseData[key] instanceof File) {
          formData.append(key, courseData[key]);
        } else {
          formData.append(key, courseData[key]);
        }
      });
      
      const response = await api.put(`/pack365/courses/${courseId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update course:', error.response.data);
      throw error.response.data;
    }
  },
  deleteCourse: async (courseId: string, token: string) => {
    try {
      const response = await api.delete(`/pack365/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete course:', error.response.data);
      throw error.response.data;
    }
  },
  getAllCourses: async (token: string) => {
    try {
      const response = await api.get('/pack365/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch courses:', error.response.data);
      throw error.response.data;
    }
  },
  getAllEnrollmentCodes: async (token: string) => {
    try {
      const response = await api.get('/pack365/enrollment-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch enrollment codes:', error.response.data);
      throw error.response.data;
    }
  },
  createEnrollmentCode: async (codeData: any, token: string) => {
    try {
      const response = await api.post('/pack365/enrollment-codes', codeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create enrollment code:', error.response.data);
      throw error.response.data;
    }
  },
  deactivateEnrollmentCode: async (codeId: string, token: string) => {
    try {
      const response = await api.put(`/pack365/enrollment-codes/${codeId}/deactivate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to deactivate enrollment code:', error.response.data);
      throw error.response.data;
    }
  },
  enrollWithCode: async (code: string, token: string) => {
    try {
      const response = await api.post('/pack365/enrollment/enroll-with-code', { code }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to enroll with code:', error.response.data);
      throw error.response.data;
    }
  },
  getExamDetails: async (examId: string, token: string) => {
    try {
      const response = await api.get(`/pack365/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch exam details:', error.response.data);
      throw error.response.data;
    }
  },
  getExamQuestions: async (examId: string, token: string) => {
    try {
      const response = await api.get(`/pack365/exams/${examId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch exam questions:', error.response.data);
      throw error.response.data;
    }
  },
  submitExam: async (examId: string, answers: any, token: string) => {
    try {
      const response = await api.post(`/pack365/exams/${examId}/submit`, { answers }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit exam:', error.response.data);
      throw error.response.data;
    }
  },
  getAvailableExamsForUser: async (token: string) => {
    try {
      const response = await api.get('/pack365/exams/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch available exams:', error.response.data);
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

// Profile API functions
export const profileApi = {
  getProfile: async (token: string) => {
    try {
      const response = await api.get('/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch profile:', error.response.data);
      return {
        success: false,
        profile: {}
      };
    }
  },
  getStudentProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch student profile:', error.response.data);
      return {
        success: false,
        profile: {}
      };
    }
  },
  getJobSeekerProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/jobseeker', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch jobseeker profile:', error.response.data);
      return {
        success: false,
        profile: {}
      };
    }
  },
  getEmployerProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/employer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch employer profile:', error.response.data);
      return {
        success: false,
        profile: {}
      };
    }
  },
  getCollegeProfile: async (token: string) => {
    try {
      const response = await api.get('/profile/college', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch college profile:', error.response.data);
      return {
        success: false,
        profile: {}
      };
    }
  },
  updateProfile: async (profileData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to update profile:', error.response.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },
  updateStudentProfile: async (profileData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/profile/student', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to update student profile:', error.response.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update student profile'
      };
    }
  },
  updateJobSeekerProfile: async (profileData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/profile/jobseeker', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to update jobseeker profile:', error.response.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update jobseeker profile'
      };
    }
  },
  updateEmployerProfile: async (profileData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/profile/employer', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to update employer profile:', error.response.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update employer profile'
      };
    }
  },
  updateCollegeProfile: async (profileData: any, token: string) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        } else if (typeof profileData[key] === 'object') {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await api.put('/profile/college', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return {
        success: true,
        profile: response.data
      };
    } catch (error: any) {
      console.error('Failed to update college profile:', error.response.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update college profile'
      };
    }
  },
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }, token: string) => {
    try {
      const response = await api.put('/auth/update-password', passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update password failed:', error.response.data);
      throw error.response.data;
    }
  },
};

export default api;