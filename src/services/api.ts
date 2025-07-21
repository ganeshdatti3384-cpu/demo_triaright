/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { College, CreateEnrollmentCodeInput, CreateEnrollmentCodeResponse, Employer, EnhancedPack365Enrollment, EnrollmentCode, Exam, JobSeekerProfile, LoginPayload, LoginResponse, Pack365Course, RazorpayOrderResponse, RegisterPayload, StudentProfile, TopicProgress, UpdatePasswordPayload, UpdateEnrollmentCodeInput } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

// Add request interceptor for better error handling
axios.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.baseURL || ''}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

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

  changePasswordWithEmail: async (payload: {
    email: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/users/forgot-password`, payload);
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

  getStatistics: async (token: string): Promise<{
    totalUsers: number;
    students: number;
    jobseekers: number;
    employers: number;
    colleges: number;
  }> => {
    const [totalUsers, students, jobseekers, employers, colleges] = await Promise.all([
      axios.get(`${API_BASE_URL}/users/statistics/count/total`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE_URL}/users/statistics/count/students`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE_URL}/users/statistics/count/jobseekers`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE_URL}/users/statistics/count/employers`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_BASE_URL}/users/statistics/count/colleges`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    return {
      totalUsers: totalUsers.data.count || 0,
      students: students.data.count || 0,
      jobseekers: jobseekers.data.count || 0,
      employers: employers.data.count || 0,
      colleges: colleges.data.count || 0
    };
  },
};

export const profileApi = {
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

  getProfile: async (token: string): Promise<any> => {
    const res = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateProfile: async (token: string, profileData: any): Promise<any> => {
    const res = await axios.put(`${API_BASE_URL}/users/profile`, toFormData(profileData), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updatePassword: async (
    token: string,
    payload: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/users/update-password`, {
      oldPassword: payload.currentPassword,
      newPassword: payload.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },
};

export const pack365Api = {
  getAllCourses: async (): Promise<{ success: boolean; data: Pack365Course[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/courses`);
    return res.data;
  },
  getAllStreams: async (): Promise<{ success: boolean }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/getstreams`);
    return res.data;
  },

  getCourseById: async (
    id: string, 
    token: string
  ): Promise<{ success: boolean; data: Pack365Course }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

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

  deleteCourse: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/pack365/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createEnrollmentCode: async (
    token: string,
    data: CreateEnrollmentCodeInput
  ): Promise<CreateEnrollmentCodeResponse> => {
    try {
      const res = await axios.post(`${API_BASE_URL}/pack365/enrollment-codes`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    } catch (error: any) {
      console.error('Failed to create enrollment code:', error?.response?.data || error.message);
      throw new Error(error?.response?.data?.message || 'Failed to create enrollment code');
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
  code: string,
  stream: string
): Promise<{ 
  success: boolean; 
  message: string; 
  courseDetails?: {
    stream: string;
    originalPrice: number;
    finalAmount: number;
  };
  couponDetails?: {
    discount: number;
    description: string;
    code: string;
  };
}> => {
  const data = { code, stream };

  const res = await axios.post(`${API_BASE_URL}/pack365/verify/enrollment-codes`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
        },
      }
    );

    return res.data;
  },

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
    const res = await axios.get(`${API_BASE_URL}/pack365/enrollment-codes`, {
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

  uploadExamFromExcel: async (
    token: string,
    formData: FormData
  ): Promise<{ success: boolean; message: string; exam: any }> => {
    const res = await axios.post(`${API_BASE_URL}/exam/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return res.data;
  },

  getExamQuestions: async (
    token: string,
    examId: string
  ): Promise<{ questions: any[]; maxAttempts: number; examId: string }> => {
    const res = await axios.get(`${API_BASE_URL}/exam/${examId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getExamDetails: async (
    token: string,
    examId: string
  ): Promise<{ examDetails: any }> => {
    const res = await axios.get(`${API_BASE_URL}/exam/${examId}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllExams: async (
    token: string
  ): Promise<any[]> => {
    const res = await axios.get(`${API_BASE_URL}/exam/getexam`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  submitExam: async (
    token: string,
    data: {
      courseId: string;
      examId: string;
      marks: number;
      timeTaken?: number;
    }
  ): Promise<{
    message: string;
    currentScore: number;
    bestScore: number;
    attemptNumber: number;
    maxAttempts: number;
    remainingAttempts: number;
    isPassed: boolean;
    canRetake: boolean;
  }> => {
    const res = await axios.post(`${API_BASE_URL}/exam/submit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAvailableExamsForUser: async (
    token: string
  ): Promise<{ message?: string; exams: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/exam/available/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getExamHistory: async (
    token: string,
    courseId: string
  ): Promise<{ examHistory: any }> => {
    const res = await axios.get(`${API_BASE_URL}/exam/history/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getExamStatistics: async (
    token: string,
    courseId: string
  ): Promise<{ statistics: any }> => {
    const res = await axios.get(`${API_BASE_URL}/exam/statistics/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  resetExamAttempts: async (
    token: string,
    data: { userId: string; courseId: string }
  ): Promise<{ message: string; resetData: any }> => {
    const res = await axios.post(`${API_BASE_URL}/exam/reset-attempts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateExamMaxAttempts: async (
    token: string,
    data: { examId: string; maxAttempts: number }
  ): Promise<{ message: string; examId: string; maxAttempts: number }> => {
    const res = await axios.put(`${API_BASE_URL}/exam/update-max-attempts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const collegeApi = {
  createServiceRequest: async (
    token: string,
    data: {
      institutionName: string;
      contactPerson: string;
      email: string;
      phoneNumber: string;
      expectedStudents: number;
      preferredDate: string;
      serviceCategory: string[];
      serviceDescription: string;
      additionalRequirements?: string;
    }
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.post(`${API_BASE_URL}/colleges/service-request`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getMyServiceRequests: async (
    token: string
  ): Promise<{ success: boolean; data: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/college/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getCollegeStats: async (
    token: string
  ): Promise<{ success: boolean; data: any }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/collegedata`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getDashboardStats: async (
    token: string
  ): Promise<{ success: boolean; stats: any }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllServiceRequests: async (
    token: string
  ): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getCollegeRequests: async (
    token: string
  ): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  acceptServiceRequest: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/colleges/admin/accept/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  rejectServiceRequest: async (
    token: string,
    id: string
  ): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/colleges/admin/reject/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

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
