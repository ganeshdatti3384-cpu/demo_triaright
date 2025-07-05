/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  role: 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';
  password: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface User {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE_URL}/users/login`, payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<{ message: string }> => {
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
  }
};
