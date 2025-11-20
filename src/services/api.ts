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

/**
 * Helper: convert object -> FormData
 * - stringifies plain objects (except File)
 */
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

// Updated interface for topic progress - ONLY backend-required fields
export interface UpdateTopicProgressData {
  courseId: string;
  topicName: string;
  watchedDuration: number;
}

/**
 * authApi: Authentication & user admin related endpoints
 */
export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE_URL}/users/login`, payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE_URL}/users/register`, payload);
    return res.data;
  },

  adminRegister: async (token: string, payload: any): Promise<{ message: string }> => {
    const res = await axios.post(`${API_BASE_URL}/users/admin/register`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  getUserDetails: async (token: string): Promise<LoginResponse> => {
    const res = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // backend often returns the user object directly; unify shape
    return { success: true, user: res.data };
  },

  // Authenticated user updating their own password
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

  // Generic forgot/change password via email (public)
  // Ensure confirmPassword present because some backends validate it
  changePasswordWithEmail: async (payload: {
    email: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string }> => {
    const body = {
      email: payload.email,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword ?? payload.newPassword
    };
    const res = await axios.put(`${API_BASE_URL}/users/forgot-password`, body, {
      headers: {
        'Content-Type': 'application/json'
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
      },
    });
    return res.data;
  },

  deleteUserById: async (
    token: string,
    userId: string
  ): Promise<{ message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  getAllUsers: async (token: string): Promise<any> => {
    const res = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Admin updating a user
  updateUserByAdmin: async (
    token: string,
    userId: string,
    updates: {
      name?: string;
      email?: string;
      mobileNumber?: string;
      role?: string;
    }
  ): Promise<{ message: string; user: any }> => {
    const res = await axios.put(`${API_BASE_URL}/users/${userId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Superadmin updating another user's password
  changeUserPasswordByAdmin: async (
    token: string,
    userId: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const res = await axios.put(
      `${API_BASE_URL}/users/${userId}/password`,
      { newPassword },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return res.data;
  },
};

/**
 * pack365Api: Pack365-specific endpoints (keeps many helpers and fallbacks)
 */
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
      // Return fallback data when API is unavailable
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

    const res = await axios.patch(
      `${API_BASE_URL}/pack365/streams/${streamId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  },

  createCourse: async (
    token: string,
    data: FormData | any
  ): Promise<{ success: boolean; message: string; data: Pack365Course }> => {
    const formData = data instanceof FormData ? data : toFormData(data);

    const res = await axios.post(`${API_BASE_URL}/pack365/courses`, formData, {
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  },

  updateCourse: async (
    token: string,
    courseId: string,
    data: FormData | any
  ): Promise<{ success: boolean; message: string; data: Pack365Course }> => {
    const formData = data instanceof FormData ? data : toFormData(data);

    const res = await axios.patch(
      `${API_BASE_URL}/pack365/courses/${courseId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data;
  },

  getUserEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      console.error('Error fetching user enrollments:', error);
      // Return empty enrollments instead of throwing
      return {
        success: false,
        enrollments: []
      };
    }
  },

  getEnrollmentByStream: async (
    token: string,
    streamName: string
  ): Promise<{ success: boolean; enrollment: EnhancedPack365Enrollment }> => {
    const res = await axios.get(
      `${API_BASE_URL}/pack365/enrollments/stream/${encodeURIComponent(streamName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  getAllEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/all-enrollments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  createOrder: async (
    token: string,
    payload: {
      stream: string;
      amount: number;
      couponCode?: string;
      baseAmount?: number;
      discount?: number;
      gst?: number;
    }
  ): Promise<{ success: boolean; order: RazorpayOrderResponse }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/create-order`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  verifyPayment: async (
    token: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      stream: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    enrollment?: EnhancedPack365Enrollment;
  }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/verify-payment`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  applyCoupon: async (
    code: string
  ): Promise<{ success: boolean; discount: number; message?: string }> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/apply-coupon`, { code });
    return res.data;
  },

  // ✅ FIX #1: ADDED updateTopicProgress method
  // ✅ FIX #3: Sends ONLY required fields: courseId, topicName, watchedDuration
  updateTopicProgress: async (
    token: string,
    progressData: UpdateTopicProgressData
  ): Promise<{
    success: boolean;
    watched: boolean;
    watchedTopics: number;
    totalWatchedPercentage: number;
  }> => {
    const res = await axios.patch(
      `${API_BASE_URL}/pack365/update-progress`,
      {
        courseId: progressData.courseId,
        topicName: progressData.topicName,
        watchedDuration: progressData.watchedDuration
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    return res.data;
  },

  createEnrollmentCode: async (
    token: string,
    codeData: CreateEnrollmentCodeInput
  ): Promise<CreateEnrollmentCodeResponse> => {
    const res = await axios.post(`${API_BASE_URL}/pack365/enrollment-codes`, codeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  getAllEnrollmentCodes: async (
    token: string
  ): Promise<{ success: boolean; codes: EnrollmentCode[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365/enrollment-codes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  updateEnrollmentCode: async (
    token: string,
    codeId: string,
    updates: UpdateEnrollmentCodeInput
  ): Promise<{ success: boolean; message: string; code: EnrollmentCode }> => {
    const res = await axios.patch(
      `${API_BASE_URL}/pack365/enrollment-codes/${codeId}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  deleteEnrollmentCode: async (
    token: string,
    codeId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/pack365/enrollment-codes/${codeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  redeemEnrollmentCode: async (
    token: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
    enrollment?: EnhancedPack365Enrollment;
  }> => {
    const res = await axios.post(
      `${API_BASE_URL}/pack365/redeem-code`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },

  getCoursesByStream: async (
    streamName: string
  ): Promise<{ success: boolean; courses: Course[]; streamImageUrl?: string }> => {
    const res = await axios.get(
      `${API_BASE_URL}/pack365/courses-by-stream/${encodeURIComponent(streamName)}`
    );
    return res.data;
  },
};

/**
 * examApi: Exam-related endpoints
 */
export const examApi = {
  createExam: async (
    token: string,
    examData: any
  ): Promise<{ success: boolean; message: string; data: Exam }> => {
    const res = await axios.post(`${API_BASE_URL}/exams`, examData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  },

  getAllExams: async (): Promise<{ success: boolean; data: Exam[] }> => {
    const res = await axios.get(`${API_BASE_URL}/exams`);
    return res.data;
  },

  getExamById: async (id: string): Promise<{ success: boolean; data: Exam }> => {
    const res = await axios.get(`${API_BASE_URL}/exams/${id}`);
    return res.data;
  },

  updateExam: async (
    token: string,
    examId: string,
    examData: any
  ): Promise<{ success: boolean; message: string; data: Exam }> => {
    const res = await axios.patch(`${API_BASE_URL}/exams/${examId}`, examData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  },

  deleteExam: async (
    token: string,
    examId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/exams/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  submitExam: async (
    token: string,
    examId: string,
    answers: Record<string, string>
  ): Promise<{
    success: boolean;
    message: string;
    score: number;
    totalQuestions: number;
    passed: boolean;
  }> => {
    const res = await axios.post(
      `${API_BASE_URL}/exams/${examId}/submit`,
      { answers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  },

  getExamsByStream: async (stream: string): Promise<{ success: boolean; data: Exam[] }> => {
    const res = await axios.get(
      `${API_BASE_URL}/exams/by-stream/${encodeURIComponent(stream)}`
    );
    return res.data;
  },
};

/**
 * profileApi: Student and Job Seeker profile endpoints
 */
export const profileApi = {
  getStudentProfile: async (token: string): Promise<StudentProfile | null> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createStudentProfile: async (
    token: string,
    profileData: any
  ): Promise<{ success: boolean; message: string; profile: StudentProfile }> => {
    const formData = toFormData(profileData);

    const res = await axios.post(`${API_BASE_URL}/student-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateStudentProfile: async (
    token: string,
    profileData: any
  ): Promise<{ success: boolean; message: string; profile: StudentProfile }> => {
    const formData = toFormData(profileData);

    const res = await axios.patch(`${API_BASE_URL}/student-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getJobSeekerProfile: async (token: string): Promise<JobSeekerProfile | null> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobseeker-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.profile;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createJobSeekerProfile: async (
    token: string,
    profileData: any
  ): Promise<{ success: boolean; message: string; profile: JobSeekerProfile }> => {
    const formData = toFormData(profileData);

    const res = await axios.post(`${API_BASE_URL}/jobseeker-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateJobSeekerProfile: async (
    token: string,
    profileData: any
  ): Promise<{ success: boolean; message: string; profile: JobSeekerProfile }> => {
    const formData = toFormData(profileData);

    const res = await axios.patch(`${API_BASE_URL}/jobseeker-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

/**
 * collegeApi: College-related endpoints
 */
export const collegeApi = {
  createCollege: async (
    token: string,
    collegeData: any
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const formData = toFormData(collegeData);

    const res = await axios.post(`${API_BASE_URL}/colleges`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getAllColleges: async (): Promise<{ success: boolean; data: College[] }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges`);
    return res.data;
  },

  getCollegeById: async (id: string): Promise<{ success: boolean; data: College }> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/${id}`);
    return res.data;
  },

  updateCollege: async (
    token: string,
    collegeId: string,
    collegeData: any
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const formData = toFormData(collegeData);

    const res = await axios.patch(`${API_BASE_URL}/colleges/${collegeId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteCollege: async (
    token: string,
    collegeId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/colleges/${collegeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};

/**
 * employerApi: Employer-related endpoints
 */
export const employerApi = {
  createEmployer: async (
    token: string,
    employerData: any
  ): Promise<{ success: boolean; message: string; data: Employer }> => {
    const formData = toFormData(employerData);

    const res = await axios.post(`${API_BASE_URL}/employers`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getAllEmployers: async (): Promise<{ success: boolean; data: Employer[] }> => {
    const res = await axios.get(`${API_BASE_URL}/employers`);
    return res.data;
  },

  getEmployerById: async (id: string): Promise<{ success: boolean; data: Employer }> => {
    const res = await axios.get(`${API_BASE_URL}/employers/${id}`);
    return res.data;
  },

  updateEmployer: async (
    token: string,
    employerId: string,
    employerData: any
  ): Promise<{ success: boolean; message: string; data: Employer }> => {
    const formData = toFormData(employerData);

    const res = await axios.patch(`${API_BASE_URL}/employers/${employerId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteEmployer: async (
    token: string,
    employerId: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/employers/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};

/**
 * jobApi: Job-related endpoints
 */
export const jobApi = {
  getAllJobs: async (): Promise<AxiosResponse> => {
    return await axios.get(`${API_BASE_URL}/jobs`);
  },

  getJobById: async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_BASE_URL}/jobs/${id}`);
  },

  createJob: async (token: string, jobData: any): Promise<AxiosResponse> => {
    return await axios.post(`${API_BASE_URL}/jobs`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  updateJob: async (
    token: string,
    jobId: string,
    jobData: any
  ): Promise<AxiosResponse> => {
    return await axios.patch(`${API_BASE_URL}/jobs/${jobId}`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  deleteJob: async (token: string, jobId: string): Promise<AxiosResponse> => {
    return await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  applyForJob: async (
    token: string,
    jobId: string,
    resumeFile: File
  ): Promise<AxiosResponse> => {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    return await axios.post(`${API_BASE_URL}/jobs/${jobId}/apply`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getJobApplications: async (
    token: string,
    jobId: string
  ): Promise<AxiosResponse> => {
    return await axios.get(`${API_BASE_URL}/jobs/${jobId}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
