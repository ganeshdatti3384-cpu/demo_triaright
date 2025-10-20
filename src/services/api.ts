/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { College, CreateEnrollmentCodeInput, CreateEnrollmentCodeResponse, Employer, EnhancedPack365Enrollment, EnrollmentCode, Exam, JobSeekerProfile, LoginPayload, LoginResponse, Pack365Course, RazorpayOrderResponse, RegisterPayload, StudentProfile, TopicProgress, UpdatePasswordPayload, UpdateEnrollmentCodeInput, Course } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';
const PRODUCTION_API_URL = 'https://triaright.com/api';

// Add request interceptor for better error handling
// axios.interceptors.request.use(
//   (config) => {
//     console.log(`Making API request to: ${config.baseURL || ''}${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.error('Request error:', error);
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for better error handling
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', {
//       url: error.config?.url,
//       method: error.config?.method,
//       status: error.response?.status,
//       message: error.message,
//       data: error.response?.data
//     });
//     return Promise.reject(error);
//   }
// );

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

  getUserDetails: async (token: string): Promise<LoginResponse> => {
    const res = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, user: res.data };
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
    if (data.imageFile) formData.append("image", data.imageFile); // assuming backend expects req.file

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
  const data = { stream, code };
  console.log(data)
  const res = await axios.post(`${API_BASE_URL}/pack365/verify/enrollment-codes`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    
  });
  console.log(res.data);
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
  console.log("Sending createOrder request with data:", data);
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
  console.log("Verifying payment with:", data, token);
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
    const res = await axios.post(`${API_BASE_URL}/pack365/packenroll365/payment-failure`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: EnhancedPack365Enrollment[] }> => {
    try {
      console.log('Fetching pack365 enrollments from API...');
      
      // Try the primary pack365 enrollments endpoint first
      try {
        const res = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Pack365 enrollments response:', res.data);
        if (res.data && res.data.success) {
          return res.data;
        }
      } catch (primaryError: any) {
        console.log('Primary pack365 endpoint failed:', primaryError.message);
      }
      
      // Try alternative pack365 endpoint
      try {
        console.log('Trying alternative pack365 endpoint...');
        const res = await axios.get(`${API_BASE_URL}/pack365/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Alternative pack365 endpoint response:', res.data);
        if (res.data && res.data.success) {
          return res.data;
        }
      } catch (altError: any) {
        console.log('Alternative pack365 endpoint also failed:', altError.message);
      }
      
      // Try general courses endpoint and filter for pack365 enrollments
      try {
        console.log('Trying general courses endpoint...');
        const courseRes = await axios.get(`${API_BASE_URL}/courses/enrollment/allcourses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('General courses response:', courseRes.data);
        
        if (courseRes.data && courseRes.data.enrollments) {
          // Filter for pack365/stream based enrollments
          const pack365Enrollments = courseRes.data.enrollments.filter((enrollment: any) => 
            enrollment.stream || 
            enrollment.enrollmentType === 'pack365' ||
            (enrollment.courseName && enrollment.courseName.toLowerCase().includes('pack365'))
          );
          
          console.log('Filtered pack365 enrollments:', pack365Enrollments);
          return {
            success: true,
            enrollments: pack365Enrollments
          };
        }
      } catch (courseError: any) {
        console.log('General courses endpoint also failed:', courseError.message);
      }
      
      console.log('All endpoints failed, returning empty array');
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
  // ✅ Create Course (Admin only)
  createCourse: async (
    token: string,
    formData: FormData
  ): Promise<{ success: boolean; course: any; message: string }> => {
    try {
      console.log('Making course creation request to:', `${API_BASE_URL}/courses/postcourse`);
      
      const response = await axios.post(`${API_BASE_URL}/courses/postcourse`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
      });
      
      console.log('Course creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Course creation API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // ✅ Update Course (Admin/SuperAdmin only)
  updateCourse: async (
    token: string,
    courseId: string,
    formData: FormData
  ): Promise<{ success: boolean; course: any; message: string }> => {
    try {
      console.log('Making course update request to:', `${API_BASE_URL}/courses/${courseId}`);
      
      const response = await axios.put(`${API_BASE_URL}/courses/${courseId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
      });
      
      console.log('Course update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Course update API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // ✅ Delete Course (Admin/SuperAdmin only)
  deleteCourse: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Making course deletion request to:', `${API_BASE_URL}/courses/${courseId}`);
      
      const response = await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Course deletion response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Course deletion API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // ✅ Get All Courses (public endpoint)
  getAllCourses: async (): Promise<{ courses: any[] }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      console.log('Get all courses response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get all courses API error:', error);
      throw error;
    }
  },

  // ✅ Get Course by ID (Public/Student)
  getCourseById: async (
    id: string
  ): Promise<{ success: boolean; course: any }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
      console.log('Get course by ID response:', response.data);
      return { success: true, course: response.data.course };
    } catch (error: any) {
      console.error('Get course by ID API error:', error);
      throw error;
    }
  },

  // ✅ Get Free Courses (requires authentication)
  getFreeCourses: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const allCourses = response.data.courses || response.data;
      const freeCourses = allCourses.filter((course: any) => course.courseType === 'unpaid');
      console.log('Free courses:', freeCourses);
      return freeCourses;
    } catch (error: any) {
      console.error('Get free courses API error:', error);
      throw error;
    }
  },

  // ✅ Get Paid Courses (requires authentication)
  getPaidCourses: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const allCourses = response.data.courses || response.data;
      const paidCourses = allCourses.filter((course: any) => course.courseType === 'paid');
      console.log('Paid courses:', paidCourses);
      return paidCourses;
    } catch (error: any) {
      console.error('Get paid courses API error:', error);
      throw error;
    }
  },

  // ✅ Enroll in Free Course
  enrollFreeCourse: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; message: string; enrollment: any }> => {
    try {
      console.log('Making free enrollment request for course:', courseId);
      
      const response = await axios.post(`${API_BASE_URL}/courses/enrollments/free`, 
        { courseId }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Free enrollment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Free enrollment API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // ✅ Create Razorpay Order for Paid Course
  createOrder: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; order: any }> => {
    try {
      console.log('Making order creation request to:', `${API_BASE_URL}/courses/enrollments/order`);
      console.log('Request payload:', { courseId });
      
      const response = await axios.post(`${API_BASE_URL}/courses/enrollments/order`, 
        { courseId }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Order creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Order creation API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // ✅ Verify Payment and Enroll
  verifyPaymentAndEnroll: async (
    token: string,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ success: boolean; message: string; enrollment: any }> => {
    try {
      console.log('Making payment verification request');
      
      const response = await axios.post(`${API_BASE_URL}/courses/enrollments/verify-payment`, 
        paymentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Payment verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Payment verification API error:', error);
      
      // If local dev server doesn't have the endpoint, try production
      if (error.response?.status === 404 && API_BASE_URL.includes('localhost')) {
        console.log('Local verify endpoint not found, trying production URL');
        
        try {
          const response = await axios.post(`${PRODUCTION_API_URL}/courses/enrollments/verify-payment`, 
            paymentData,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          return response.data;
        } catch (prodError: any) {
          console.error('Production verify API also failed:', prodError);
          throw prodError;
        }
      }
      
      throw error;
    }
  },

  // ✅ Update Topic Progress
  updateTopicProgress: async (
    token: string,
    progressData: {
      courseId: string;
      topicName: string;
      subTopicName: string;
      watchedDuration: number;
    }
  ): Promise<{ success: boolean; message: string; topicProgress: any; totalWatchedDuration: number }> => {
    try {
      console.log('Making topic progress update request');
      
      const response = await axios.post(`${API_BASE_URL}/courses/updateTopicProgress`, 
        progressData, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Topic progress update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Topic progress update API error:', error);
      throw error;
    }
  },

  // ✅ Get user's course enrollments
  getMyEnrollments: async (
    token: string
  ): Promise<{ success: boolean; enrollments: any[] }> => {
    try {
      console.log('Making get enrollments request');
      
      const response = await axios.get(`${API_BASE_URL}/courses/enrollment/allcourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Get enrollments response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get enrollments API error:', error);
      throw error;
    }
  },

  // ✅ Check enrollment status for a course
  checkEnrollmentStatus: async (
    token: string,
    courseId: string
  ): Promise<{ success: boolean; isEnrolled: boolean; enrollment?: any }> => {
    try {
      console.log('Making enrollment status check request for course:', courseId);
      
      const response = await axios.get(`${API_BASE_URL}/courses/enrollment-status/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Enrollment status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Enrollment status API error:', error);
      throw error;
    }
  },
};


export const jobsApi = {
  getAllJobs: () => {
    return axios.get(`${API_BASE_URL}/jobs`);
  },

  getJobById: (jobId: string) => {
    return axios.get(`${API_BASE_URL}/jobs/${jobId}`);
  },

  createJob: (jobData: object) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.post(`${API_BASE_URL}/jobs`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateJob: (jobId: string, jobData: object) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.put(`${API_BASE_URL}/jobs/${jobId}`, jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteJob: (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateJobStatus: (jobId: string, statusData: { status: 'Open' | 'Closed' | 'On Hold' }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.patch(`${API_BASE_URL}/jobs/${jobId}/status`, statusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateJobDeadline: (jobId: string, deadlineData: { applicationDeadline: string }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.patch(`${API_BASE_URL}/jobs/${jobId}/deadline`, deadlineData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  applyToJob: (jobId: string, formData: FormData) => {
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

  getApplicationsForJob: (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.get(`${API_BASE_URL}/jobs/job-applications/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMyApplications: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.get(`${API_BASE_URL}/jobs/job-applications/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  withdrawApplication: (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.delete(`${API_BASE_URL}/jobs/job-applications/${jobId}/withdraw`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateApplicationStatus: (applicationId: string, statusData: { status: 'Applied' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired' }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Authentication token is missing.");
    }
    return axios.put(`${API_BASE_URL}/jobs/job-applications/${applicationId}/status`, statusData, {
      headers: { Authorization: `Bearer ${token}` },
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
