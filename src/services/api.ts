/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { AxiosResponse } from 'axios';
import {
  College,
  CreateEnrollmentCodeInput,
  CreateEnrollmentCodeResponse,
  Employer,
  EnhancedPack365Enrollment,
  EnrollmentCode,
  Exam,
  JobSeekerProfile,
  LoginPayload,
  LoginResponse,
  Pack365Course,
  RazorpayOrderResponse,
  RegisterPayload,
  StudentProfile,
  TopicProgress,
  UpdatePasswordPayload,
  UpdateEnrollmentCodeInput,
  Course
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';
const PRODUCTION_API_URL = 'https://triaright.com/api';

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

  getUserDetails: async (token: string): Promise<any> => {
    const res = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
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

  getAllUsers: async (token: string): Promise<{ success: boolean; users: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/users/allusers`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const formData = toFormData(data);
    const res = await axios.put(`${API_BASE_URL}/users/colleges/profile`, formData, {
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
    const formData = toFormData(data);
    const res = await axios.put(`${API_BASE_URL}/employers/profile`, formData, {
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
    const formData = toFormData(data);
    const res = await axios.put(`${API_BASE_URL}/jobseekers/profile`, formData, {
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
    const formData = toFormData(data);
    const res = await axios.put(`${API_BASE_URL}/users/students/profile`, formData, {
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
    const formData = toFormData(profileData);
    const res = await axios.put(`${API_BASE_URL}/users/profile`, formData, {
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
  getAllStreams: async (): Promise<{ success: boolean; streams?: any[] }> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pack365/getstreams`);
      return res.data;
    } catch (error: any) {
      console.log('API endpoint unavailable, using fallback data');
      return {
        success: true,
        streams: [
          {
            _id: '1',
            id: '1',
            name: 'IT Pack 365',
            price: 9999,
            imageUrl: '/lovable-uploads/IT Pack365.png',
            courses: [
              { courseName: 'Full Stack Development', stream: 'IT Pack 365' },
              { courseName: 'Python Programming', stream: 'IT Pack 365' },
              { courseName: 'Data Science Fundamentals', stream: 'IT Pack 365' },
              { courseName: 'Machine Learning Basics', stream: 'IT Pack 365' },
              { courseName: 'Cloud Computing', stream: 'IT Pack 365' }
            ]
          },
          {
            _id: '2',
            id: '2',
            name: 'Finance Pack 365',
            price: 8999,
            imageUrl: '/lovable-uploads/Finance Pack 365.png',
            courses: [
              { courseName: 'Financial Analysis', stream: 'Finance Pack 365' },
              { courseName: 'Investment Banking', stream: 'Finance Pack 365' },
              { courseName: 'Risk Management', stream: 'Finance Pack 365' },
              { courseName: 'Corporate Finance', stream: 'Finance Pack 365' }
            ]
          },
          {
            _id: '3',
            id: '3',
            name: 'Marketing Pack 365',
            price: 7999,
            imageUrl: '/lovable-uploads/Marketing Pack 365.png',
            courses: [
              { courseName: 'Digital Marketing', stream: 'Marketing Pack 365' },
              { courseName: 'Social Media Strategy', stream: 'Marketing Pack 365' },
              { courseName: 'Content Marketing', stream: 'Marketing Pack 365' },
              { courseName: 'SEO & Analytics', stream: 'Marketing Pack 365' }
            ]
          }
        ]
      };
    }
  },

  getCourseById: async (
    id: string,
  ): Promise<{ success: boolean; data: Pack365Course; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/courses/${id}`);
    return res.data;
  },
  createStream: async (
    token: string,
    data: { name: string; price: number; imageFile?: File }
  ): Promise<{ success: boolean; message: string; stream: any }> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", String(data.price));
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const res = await axios.post(`${API_BASE_URL}/pack365/streams`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },
  deleteStream: async (
    token: string,
    streamId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/pack365/streams/${streamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  updateStream: async (
    token: string,
    streamId: string,
    data: { name?: string; price?: number | string; imageFile?: File }
  ): Promise<{ success: boolean; message: string; stream: any }> => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.imageFile) formData.append("image", data.imageFile);

    const res = await axios.put(`${API_BASE_URL}/pack365/streams/${streamId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
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
    const res = await axios.put(`${API_BASE_URL}/pack365/courses/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteCourse: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/pack365/courses/${courseId}`, {
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
    const res = await axios.put(`${API_BASE_URL}/pack365/enrollment-codes/deactivate/${codeId}`, 
      {}, 
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
    const data = { stream, code };
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
    data: { stream: string ; code?: string }
  ): Promise<{
    status: string;
    enrollment: any;
    message: string; orderId: string; key: string 
  }> => {
    const res = await axios.post(
      `${API_BASE_URL}/pack365/create-order`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      status: res.data.status || 'success',
      enrollment: res.data.enrollment || null,
      message: res.data.message || 'Order created successfully',
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
    const res = await axios.post(
      `${API_BASE_URL}/pack365/payment/verify`,
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
    const res = await axios.post(`${API_BASE_URL}/pack365/payment/failure`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success && Array.isArray(res.data.enrollments)) {
        const normalized = res.data.enrollments.map((enr: any) => ({
          ...enr,
          normalizedEnrollmentId: (enr._id || enr.enrollmentId || enr.id || (enr.enrollment && enr.enrollment._id)) || null
        }));
        return { success: true, enrollments: normalized };
      }
      return { success: true, enrollments: [] };
    } catch (error: any) {
      console.error('Error fetching pack365 enrollments:', error);
      return { success: false, enrollments: [] };
    }
  },

  checkEnrollmentStatus: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; isEnrolled: boolean; enrollment: EnhancedPack365Enrollment | null; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/enrollment/${courseId}`, {
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
    const res = await axios.put(
      `${API_BASE_URL}/pack365/topic/progress`,
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
    const res = await axios.post(`${API_BASE_URL}/pack365/exams/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return res.data;
  },

  getAvailableExamsForUser: async (
    token: string
  ): Promise<{ success: boolean; exams: any[]; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exams/available`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  getExamQuestions: async (
    examId: string,
    sendAnswers: boolean = false,
    token?: string
  ): Promise<{ success: boolean; questions: any[]; message?: string }> => {
    const url = `${API_BASE_URL}/pack365/exams/${examId}/questions?showAnswers=${sendAnswers}`;
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
  },

  getExamDetails: async (
    examId: string,
    token?: string
  ): Promise<{ success: boolean; exam: any; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exams/details/${examId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
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
    success: boolean;
    message: string;
    currentScore: number;
    bestScore: number;
    attemptNumber: number;
    maxAttempts: number;
    remainingAttempts: number;
    isPassed: boolean;
    canRetake: boolean;
  }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/exams/submit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getExamHistory: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; examHistory: any; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exams/history/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getExamStatistics: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; statistics: any; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/exams/statistics/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  resetExamAttempts: async (
    token: string,
    data: { userId: string; courseId: string }
  ): Promise<{ success: boolean; message: string; resetData: any }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/exams/reset`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateExamMaxAttempts: async (
    token: string,
    data: { examId: string; maxAttempts: number }
  ): Promise<{ success: boolean; message: string; examId: string; maxAttempts: number }> => {
    const res = await axios.put(`${API_BASE_URL}/pack365/exams/update-max-attempts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  checkStreamCodeEnrollment: async (
    token: string,
    stream: string
  ): Promise<{ success: boolean; isStreamEnrolled: boolean; stream: string; coursesCount: number }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/stream/check/${stream}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  checkOrderStatus: async (
    token: string,
    orderId: string
  ): Promise<{ 
    success: boolean; 
    orderId: string;
    status: string;
    stream: string;
    amountPaid: number;
    coursesCount: number;
    createdAt: string;
    expiresAt: string;
    isExpired: boolean;
  }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/order/status/${orderId}`, {
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
  ): Promise<{
    status: number; success: boolean; request: any 
  }> => {
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
  ): Promise<{ success: boolean; colleges: any }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/collegedata`, {
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

  getStudentCountByInstitution: async (
    token: string,
    institutionName: string
  ): Promise<{ success: boolean; count: number; students: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/students/count/${encodeURIComponent(institutionName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const courseApi = {
  createCourse: async (
    token: string,
    data: FormData
  ): Promise<{ success: boolean; course: any; message: string }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/postcourse`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  updateCourse: async (
    token: string,
    courseId: string,
    data: FormData
  ): Promise<{ success: boolean; course: any; message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/courses/${courseId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  deleteCourse: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllCourses: async (): Promise<{ courses: any[] }> => {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    return response.data;
  },

  // Updated: handle when id is not a Mongo ObjectId (e.g., CRS_014)
  getCourseById: async (
    id: string
  ): Promise<{ success: boolean; course: any }> => {
    try {
      const isObjectId = typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

      if (!isObjectId) {
        // Try resolve via all courses lookup for course code like CRS_014
        try {
          const allResp = await axios.get(`${API_BASE_URL}/courses`);
          const allCourses = allResp.data.courses || allResp.data || [];
          const match = allCourses.find((c: any) => {
            if (!c) return false;
            return (c.courseId && String(c.courseId) === String(id)) || (c._id && String(c._id) === String(id));
          });
          if (match) {
            return { success: true, course: match };
          }
        } catch (err) {
          console.warn('courseApi.getCourseById: could not resolve non-object id via all-courses lookup', err);
        }
      }

      const res = await axios.get(`${API_BASE_URL}/courses/${id}`);
      return { success: true, course: res.data.course || res.data };
    } catch (err: any) {
      console.error('courseApi.getCourseById error:', err?.response?.data || err.message || err);
      throw err;
    }
  },

  enrollFreeCourse: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; message: string; enrollment: any }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/enrollments/free`, 
      { courseId }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  createOrder: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; order: any }> => {
    try {
      const res = await axios.post(`${API_BASE_URL}/courses/enrollments/order`, 
        { courseId }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  verifyPaymentAndEnroll: async (
    token: string,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ success: boolean; message: string; enrollment: any }> => {
    try {
      const res = await axios.post(`${API_BASE_URL}/courses/enrollments/verify-payment`, 
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 404 && API_BASE_URL.includes('localhost')) {
        try {
          const res = await axios.post(`${PRODUCTION_API_URL}/courses/enrollments/verify-payment`, 
            paymentData,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          return res.data;
        } catch (prodError: any) {
          throw prodError;
        }
      }
      throw error;
    }
  },

  updateTopicProgress: async (
    token: string,
    progressData: {
      courseId: string;
      topicName: string;
      subTopicName: string;
      watchedDuration: number;
    }
  ): Promise<{ success: boolean; message: string; topicProgress: any; totalWatchedDuration: number }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/updateTopicProgress`, 
      progressData, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },

  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/courses/enrollment/allcourses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  checkEnrollmentStatus: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; isEnrolled: boolean; enrollment?: any }> => {
    const res = await axios.get(`${API_BASE_URL}/courses/enrollment-status/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const jobsApi = {
  getAllJobs: (): Promise<AxiosResponse> => {
    return axios.get(`${API_BASE_URL}/jobs`);
  },

  getJobById: (jobId: string): Promise<AxiosResponse> => {
    return axios.get(`${API_BASE_URL}/jobs/${jobId}`);
  },

  createJob: (jobData: object): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.post(`${API_BASE_URL}/jobs`, jobData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  updateJob: (jobId: string, jobData: object): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.put(`${API_BASE_URL}/jobs/${jobId}`, jobData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  deleteJob: (jobId: string): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateJobStatus: (jobId: string, statusData: { status: 'Open' | 'Closed' | 'On Hold' }): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.patch(`${API_BASE_URL}/jobs/${jobId}/status`, statusData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  updateJobDeadline: (jobId: string, deadlineData: { applicationDeadline: string }): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.patch(`${API_BASE_URL}/jobs/${jobId}/deadline`, deadlineData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  },

  applyToJob: (jobId: string, formData: FormData): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.post(`${API_BASE_URL}/jobs/job-applications/${jobId}/apply`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getApplicationsForJob: (jobId: string): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.get(`${API_BASE_URL}/jobs/job-applications/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMyApplications: (): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.get(`${API_BASE_URL}/jobs/job-applications/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  withdrawApplication: (jobId: string): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.delete(`${API_BASE_URL}/jobs/job-applications/${jobId}/withdraw`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateApplicationStatus: (applicationId: string, statusData: { status: 'Applied' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired' }): Promise<AxiosResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.put(`${API_BASE_URL}/jobs/job-applications/${applicationId}/status`, statusData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
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
