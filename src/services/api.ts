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

  // UPDATED: try role-specific endpoints when /users/profile isn't available on backend
  getUserDetails: async (token: string): Promise<LoginResponse> => {
    const headers = { Authorization: `Bearer ${token}` };
    const endpoints = [
      `${API_BASE_URL}/users/profile`, // keep compatibility
      `${API_BASE_URL}/users/students/profile`,
      `${API_BASE_URL}/users/jobseekers/profile`,
      `${API_BASE_URL}/users/colleges/profile`,
      `${API_BASE_URL}/users/employers/profile`,
    ];

    let lastError: any = null;

    for (const url of endpoints) {
      try {
        const res = await axios.get(url, { headers });
        if (res && res.status >= 200 && res.status < 300 && res.data) {
          const data = res.data;
          // normalize: if backend returns { user: {...} } use that
          if (data.user) {
            return { success: true, user: data.user };
          }
          // otherwise assume the payload is the user object
          return { success: true, user: data };
        }
      } catch (err: any) {
        lastError = err;
        // continue to next candidate endpoint
        // log for debugging (can remove later)
        // eslint-disable-next-line no-console
        console.warn(`authApi.getUserDetails: endpoint ${url} failed:`, err?.response?.status || err.message);
      }
    }

    // all endpoints failed
    // eslint-disable-next-line no-console
    console.error('authApi.getUserDetails: all profile endpoints failed', lastError);
    throw new Error('Failed to fetch user profile from any known endpoint');
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

  getStudentProfile: async (token: string): Promise<StudentProfile> => {
    const res = await axios.get(`${API_BASE_URL}/users/students/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getProfile: async (token: string): Promise<any> => {
    // Prefer role-specific endpoints via authApi.getUserDetails
    try {
      const res = await authApi.getUserDetails(token);
      return res.user;
    } catch (err) {
      const res = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    }
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
            courses: []
          },
          {
            _id: '2',
            id: '2',
            name: 'Finance Pack 365',
            price: 8999,
            imageUrl: '/lovable-uploads/Finance Pack 365.png',
            courses: []
          }
        ]
      };
    }
  },

  getCourseById: async (
    id: string
  ): Promise<{ success: boolean; data: Pack365Course; message?: string }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/courses/${id}`);
    return res.data;
  },

  createStream: async (
    token: string,
    data: { name: string; price: number; imageFile?: File }
  ): Promise<{ success: boolean; message: string; stream: any }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    if (data.imageFile) formData.append('image', data.imageFile);

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
    if (data.name) formData.append('name', data.name);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.imageFile) formData.append('image', data.imageFile);

    const res = await axios.put(`${API_BASE_URL}/pack365/streams/${streamId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
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
    const res = await axios.put(`${API_BASE_URL}/pack365/enrollment-codes/deactivate/${codeId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  validateEnrollmentCode: async (
    token: string,
    code: string,
    stream: string
  ): Promise<{
    success: boolean;
    message: string;
    courseDetails?: { stream: string; originalPrice: number; finalAmount: number };
    couponDetails?: { discount: number; description: string; code: string };
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
    data: { code: string; courseId?: string }
  ): Promise<{ success: boolean; message: string; enrollment: EnhancedPack365Enrollment; courseDetails: any }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/enroll-with-code`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createOrder: async (
    token: string,
    data: { stream: string; code?: string }
  ): Promise<{ status: string; enrollment: any; message: string; orderId: string; key: string }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/create-order`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }
  ): Promise<{ success: boolean; message: string; enrollment: EnhancedPack365Enrollment }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/payment/verify`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  },

  handlePaymentFailure: async (
    token: string,
    data: { razorpay_order_id: string; }
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/payment/failure`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Normalize enrollment IDs when possible and attach normalizedEnrollmentId
  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    try {
      // helper to extract potential id from various shapes
      const extractId = (enr: any): string | null => {
        if (!enr) return null;
        const candidates = [
          enr._id,
          enr.enrollmentId,
          enr.enrollment_id,
          enr.enrollmentID,
          enr.id,
          enr.orderId,
          enr.order_id,
          enr.enrollment?.enrollmentId,
          enr.enrollment?._id,
          enr.order?._id
        ];

        for (const c of candidates) {
          if (c !== undefined && c !== null) {
            try {
              if (typeof c === 'object') {
                if ((c as any).$oid) return String((c as any).$oid);
                if (typeof c.toString === 'function') {
                  const s = c.toString();
                  if (s && s !== '[object Object]') return s;
                }
              } else {
                return String(c);
              }
            } catch {
              // ignore and continue
            }
          }
        }

        // look for any string that looks like a 24-char hex ObjectId
        for (const v of Object.values(enr)) {
          if (typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v)) return v;
          if (typeof v === 'object' && v) {
            const cand = (v as any).$oid || ((typeof (v as any).toString === 'function') ? (v as any).toString() : null);
            if (cand && typeof cand === 'string' && /^[a-f0-9]{24}$/i.test(cand)) return cand;
          }
        }

        return null;
      };

      // primary pack365 enrollments endpoint
      try {
        const res = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.success && Array.isArray(res.data.enrollments)) {
          const normalized = res.data.enrollments.map((enr: any) => ({
            ...enr,
            normalizedEnrollmentId: extractId(enr)
          }));
          return { success: true, enrollments: normalized };
        }
      } catch (primaryError: any) {
        // continue to fallbacks
        // eslint-disable-next-line no-console
        console.log('Primary pack365 endpoint failed:', primaryError?.message);
      }

      // fallback to general course enrollments endpoint
      try {
        const courseRes = await axios.get(`${API_BASE_URL}/courses/enrollment/allcourses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (courseRes.data && Array.isArray(courseRes.data.enrollments)) {
          const pack365Enrollments = courseRes.data.enrollments
            .filter((enrollment: any) =>
              enrollment.stream ||
              enrollment.enrollmentType === 'pack365' ||
              (enrollment.courseName && String(enrollment.courseName).toLowerCase().includes('pack365'))
            )
            .map((enr: any) => ({
              ...enr,
              normalizedEnrollmentId: extractId(enr)
            }));
          return { success: true, enrollments: pack365Enrollments };
        }
      } catch (courseError: any) {
        // eslint-disable-next-line no-console
        console.log('General courses endpoint failed:', courseError?.message);
      }

      return { success: true, enrollments: [] };
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error fetching pack365 enrollments:', err);
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
    const res = await axios.put(`${API_BASE_URL}/pack365/topic/progress`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
    const res = await axios.put(`${API_BASE_URL}/pack365/admin/deactivate-code/${couponId}`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  ): Promise<{ status: number; success: boolean; request: any }> => {
    const res = await axios.post(`${API_BASE_URL}/colleges/service-request`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getMyServiceRequests: async (token: string): Promise<{ success: boolean; data: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/college/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getCollegeStats: async (): Promise<{ success: boolean; colleges: any }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/collegedata`);
    return res.data;
  },

  getDashboardStats: async (token: string): Promise<{ success: boolean; stats: any }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllServiceRequests: async (token: string): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getCollegeRequests: async (token: string): Promise<{ success: boolean; requests: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  acceptServiceRequest: async (token: string, id: string): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/colleges/admin/accept/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  rejectServiceRequest: async (token: string, id: string): Promise<{ success: boolean; request: any }> => {
    const res = await axios.put(`${API_BASE_URL}/colleges/admin/reject/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getStudentCountByInstitution: async (token: string, institutionName: string): Promise<{ success: boolean; count: number; students: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/admin/students/count/${encodeURIComponent(institutionName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const courseApi = {
  createCourse: async (token: string, data: FormData): Promise<{ success: boolean; course: any; message: string }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/postcourse`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateCourse: async (token: string, courseId: string, data: FormData): Promise<{ success: boolean; course: any; message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/courses/${courseId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteCourse: async (token: string, courseId: string): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllCourses: async (): Promise<{ courses: any[] }> => {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    return response.data;
  },

  getCourseById: async (id: string): Promise<{ success: boolean; course: any }> => {
    const res = await axios.get(`${API_BASE_URL}/courses/${id}`);
    return { success: true, course: res.data.course };
  },

  getFreeCourses: async (): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE_URL}/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const allCourses = res.data.courses || res.data;
    return allCourses.filter((course: any) => course.courseType === 'unpaid');
  },

  getPaidCourses: async (): Promise<any[]> => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE_URL}/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const allCourses = res.data.courses || res.data;
    return allCourses.filter((course: any) => course.courseType === 'paid');
  },

  enrollFreeCourse: async (token: string, courseId: string): Promise<{ success: boolean; message: string; enrollment: any }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/enrollments/free`, { courseId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  createOrder: async (token: string, courseId: string): Promise<{ success: boolean; order: any }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/enrollments/order`, { courseId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  verifyPaymentAndEnroll: async (token: string, paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<{ success: boolean; message: string; enrollment: any }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/enrollments/verify-payment`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  updateTopicProgress: async (token: string, progressData: { courseId: string; topicName: string; subTopicName: string; watchedDuration: number; }): Promise<{ success: boolean; message: string; topicProgress: any; totalWatchedDuration: number }> => {
    const res = await axios.post(`${API_BASE_URL}/courses/updateTopicProgress`, progressData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  getMyEnrollments: async (token: string): Promise<{ success: boolean; enrollments: any[] }> => {
    const res = await axios.get(`${API_BASE_URL}/courses/enrollment/allcourses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  checkEnrollmentStatus: async (token: string, courseId: string): Promise<{ success: boolean; isEnrolled: boolean; enrollment?: any }> => {
    const res = await axios.get(`${API_BASE_URL}/courses/enrollment-status/${courseId}`, {
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
