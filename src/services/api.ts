/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { College, Employer, JobSeekerProfile, StudentProfile } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address: string;
  role: 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';
  password: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export type UserRole = 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';

export interface User {
  id: string;
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

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

export interface Pack365Course {
  _id?: string;
  courseId?: string;
  courseName: string;
  description: string;
  stream: 'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance';
  documentLink: string;
  topics: Array<{ name: string; link: string; }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pack365Enrollment {
  _id?: string;
  userId: string;
  courseId: string;
  courseName: string;
  amountPaid: number;
  paymentId: string;
  enrollmentDate: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
}

export const profileApi = {
  // ✅ College
  updateCollegeProfile: async (
    token: string,
    data: Partial<College>
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_BASE_URL}/colleges/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getCollegeProfile: async (token: string): Promise<College> => {
    const res = await axios.get(`${API_BASE_URL}/colleges/profile`, {
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
    const res = await axios.put(`${API_BASE_URL}/students/profile`, toFormData(data), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getStudentProfile: async (token: string): Promise<StudentProfile> => {
    const res = await axios.get(`${API_BASE_URL}/students/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const pack365Api = {
  // Get all Pack365 courses
  getAllCourses: async (): Promise<{ success: boolean; data: Pack365Course[] }> => {
    const res = await axios.get(`${API_BASE_URL}/pack365`);
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
    const res = await axios.post(`${API_BASE_URL}/pack365`, formData, {
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
    const res = await axios.put(`${API_BASE_URL}/pack365/${id}`, formData, {
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
    const res = await axios.delete(`${API_BASE_URL}/pack365/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Create Razorpay order
  createOrder: async (
    token: string,
    courseId: string
  ): Promise<RazorpayOrderResponse> => {
    const res = await axios.post(
      `${API_BASE_URL}/enrollments/create-order`,
      { courseId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  // Enroll in course after payment
  enrollInCourse: async (
    token: string,
    data: {
      courseId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ success: boolean; message: string; enrollment: Pack365Enrollment }> => {
    const res = await axios.post(`${API_BASE_URL}/enrollments/enroll`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get user's enrollments
  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: Pack365Enrollment[] }> => {
    const res = await axios.get(`${API_BASE_URL}/enrollments/my-enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};