/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { College, Employer, EnhancedPack365Enrollment, EnrollmentCode, Exam, JobSeekerProfile, LoginPayload, LoginResponse, Pack365Course, RazorpayOrderResponse, RegisterPayload, StudentProfile, TopicProgress, UpdatePasswordPayload } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';


const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
  return formData;
};

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE_URL}/users/login`, payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE_URL}/users/register`, payload);
    return res.data;
  },

  updatePassword: async (
    token: string,
    payload: UpdatePasswordPayload
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/users/update-password`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },

  bulkRegisterFromExcel: async (
    file: File,
    token: string
  ): Promise<{ message: string; results: any[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(`${API_BASE_URL}/users/bulk-register`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    return res.data;
  },
};


export const profileApi = {
  // ✅ College
  updateCollegeProfile: async (
    token: string,
    data: Partial<College>
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/users/colleges/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getCollegeProfile: async (token: string): Promise<College> => {
    const res = await axios.get(`${API_BASE_URL}/users/colleges/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ✅ Employer
  updateEmployerProfile: async (
    token: string,
    data: Partial<Employer>
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/employers/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getEmployerProfile: async (token: string): Promise<Employer> => {
    const res = await axios.get(`${API_BASE_URL}/employers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ✅ Job Seeker
  updateJobSeekerProfile: async (
    token: string,
    data: Partial<JobSeekerProfile>
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/jobseekers/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getJobSeekerProfile: async (token: string): Promise<JobSeekerProfile> => {
    const res = await axios.get(`${API_BASE_URL}/jobseekers/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ✅ Student
  updateStudentProfile: async (
    token: string,
    data: Partial<StudentProfile>
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/users/students/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getStudentProfile: async (token: string): Promise<StudentProfile> => {
    const res = await axios.get(`${API_BASE_URL}/users/students/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};


export const pack365Api = {
  // Get all Pack365 courses
  getAllCourses: async (): Promise<{ success: boolean; data: Pack365Course[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/getcourses`);
    return res.data;
  },

  // Get course by ID
  getCourseById: async (
    id: string, 
    token: string
  ): Promise<{ success: boolean; data: Pack365Course }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Create course (admin only)
  createCourse: async (
    token: string,
    data: Partial<Pack365Course> & { courseDocument?: File }
  ): Promise<{ success: boolean; message: string; course: Pack365Course }> => {
    const formData = toFormData(data);
    const res = await axios.post(`${API_BASE_URL}/pack365/courses`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Update course (admin only)
  updateCourse: async (
    token: string,
    id: string,
    data: Partial<Pack365Course> & { courseDocument?: File }
  ): Promise<{ success: boolean; message: string; course: Pack365Course }> => {
    const formData = toFormData(data);
    const res = await axios.put(`${API_BASE_URL}/pack365/update/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Delete course (admin only)
  deleteCourse: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/pack365/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Create enrollment code (admin only)
  createEnrollmentCode: async (
    token: string,
    data: {
      code: string;
      courseId: string;
      usageLimit?: number;
      expiresAt?: string;
      description?: string;
    }
  ): Promise<{ success: boolean; message: string; code: EnrollmentCode }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/admin/create-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get all enrollment codes (admin only)
  getAllEnrollmentCodes: async (
    token: string
  ): Promise<{ success: boolean; codes: EnrollmentCode[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Deactivate enrollment code (admin only)
  deactivateEnrollmentCode: async (
    token: string,
    codeId: string
  ): Promise<{ success: boolean; message: string; code: EnrollmentCode }> => {
    const res = await axios.put(`${API_BASE_URL}/pack365/admin/deactivate-code/${codeId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Upload exam from Excel (admin only)
  uploadExamFromExcel: async (
    token: string,
    courseId: string,
    file: File
  ): Promise<{ message: string; exam: Exam }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    const res = await axios.post(`${API_BASE_URL}/pack365/exam/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Get exam questions (admin only)
  getExamQuestions: async (
    token: string,
    examId: string
  ): Promise<{ questions: Exam['questions'] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exam/${examId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get all exams (admin only)
  getAllExams: async (
    token: string
  ): Promise<Exam[]> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exam/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Submit exam (student only)
  submitExam: async (
    token: string,
    data: {
      courseId: string;
      examId: string;
      marks: number;
    }
  ): Promise<{ message: string; score: number }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/exam/submit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get available exams for user (student only)
  getAvailableExamsForUser: async (
    token: string
  ): Promise<{ exams: Exam[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exam/available/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Validate enrollment code
  validateEnrollmentCode: async (
    token: string,
    data: {
      code: string;
      courseId?: string;
    }
  ): Promise<{ success: boolean; message: string; courseDetails?: any }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/validate-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Enroll with code
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

  // Create Razorpay order (enhanced)
  createOrder: async (
    token: string,
    courseId: string,
    enrollmentType: 'payment' | 'code' = 'payment'
  ): Promise<RazorpayOrderResponse> => {
    const res = await axios.post(
      `${API_BASE_URL}/pack365/packenroll365/create-order`,
      { courseId, enrollmentType },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  // Verify payment
  verifyPayment: async (
    token: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ success: boolean; message: string; enrollment: EnhancedPack365Enrollment }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/verify-payment`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Handle payment failure
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

  // Get user's enrollments
  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/packenroll365/my-enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Check enrollment status
  checkEnrollmentStatus: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; isEnrolled: boolean; enrollment: EnhancedPack365Enrollment | null }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/packenroll365/check-enrollment/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Update topic progress
  updateTopicProgress: async (
  token: string,
  data: {
    courseId: string;
    topicName: string;
    watchedDuration: number;
    totalCourseDuration?: number;          // Optional but sent if available
    totalWatchedPercentage?: number;       // Optional but sent if available
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
      },
    }
  );

  return res.data;
},

  // Coupon Management APIs
  createCoupon: async (
    token: string,
    data: {
      code: string;
      courseId: string;
      discount: number;
      expiryDate: string;
      description?: string;
    }
  ): Promise<{ success: boolean; message: string; coupon: any }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/admin/create-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllCoupons: async (
    token: string
  ): Promise<{
    success: boolean; codes: any[]; coupons: any[] 
}> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateCouponStatus: async (
    token: string,
    couponId: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string; coupon: any }> => {
    const res = await axios.put(`${API_BASE_URL}/pack365/admin/deactivate-code/${couponId}`, 
      { isActive }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },
};

export const collegeApi = {
  // Create service request
  createServiceRequest: async (
    token: string,
    data: {
      contactPerson: string;
      email: string;
      phoneNumber: string;
      expectedStudents: number;
      preferredDate: string;
      serviceCategory: string;
      serviceDescription: string;
      additionalRequirements?: string[];
    }
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.post(`${API_BASE_URL}/service-request`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get college's service requests
  getCollegeRequests: async (
    token: string
  ): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/service-request/college/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get dashboard stats
  getDashboardStats: async (
    token: string
  ): Promise<{ success: boolean; stats: any }> => {
    const res = await axios.get(`${API_BASE_URL}/service-request/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get all service requests (admin only)
  getAllServiceRequests: async (
    token: string
  ): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/service-request/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Accept service request (admin only)
  acceptServiceRequest: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/service-request/admin/accept/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Reject service request (admin only)
  rejectServiceRequest: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/service-request/admin/reject/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// Export all types that are used by components
export type { 
  Pack365Course, 
  RegisterPayload, 
  LoginPayload, 
  LoginResponse,
  TopicProgress,
  EnhancedPack365Enrollment,
  RazorpayOrderResponse,
  EnrollmentCode,
  Exam
};
