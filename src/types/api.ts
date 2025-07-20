/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------- User ----------
export interface User {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  password: string;
  address: string;
  role: 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';
  createdAt?: string;
  updatedAt?: string;
}

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
  collegeName?: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export type UserRole = 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';

export interface LoginResponse {
  token: string;
  user: User;
}

// ---------- College ----------
export interface College {
  _id?: string;
  userId: string;
  collegeName: string;
  university: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  establishedYear?: string;
  collegeCode: string;
  accreditation?: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  collegeLogo?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Employer ----------
export interface Employer {
  _id?: string;
  userId: string;
  companyName: string;
  industry?: string;
  companyWebsite?: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone?: string;
  companyAddress?: string;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Job Seeker Profile ----------
export interface JobSeekerProfile {
  _id?: string;
  userId: string;
  profilePicture?: string | null;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  languagesKnown?: string;
  hobbies?: string;
  jobCategory?: string[];
  qualifications?: {
    instituteName: string;
    course: string;
    yearOfPassing: string;
  }[];
  experiences?: {
    companyName: string;
    role: string;
    duration: string;
    responsibilities: string;
  }[];
  projects?: {
    projectName: string;
    technologies: string;
    description: string;
  }[];
  certifications?: string[];
  internships?: {
    companyName: string;
    role: string;
    responsibilities: string;
  }[];
  resume?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Student Profile ----------
export interface StudentProfile {
  _id?: string;
  userId: string;
  profilePicture?: string | null;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  languagesKnown?: string;
  hobbies?: string;
  qualifications?: {
    instituteName: string;
    stream: string;
    yearOfPassing: string;
  }[];
  projects?: {
    projectName: string;
    githubLink: string;
    description: string;
  }[];
  certifications?: string[];
  internships?: {
    companyName: string;
    role: string;
    responsibilities: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseTopic {
  name: string;
  link: string;
  duration: number;
}

export interface Pack365Course {
  [x: string]: any;
  _id?: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: 'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance';
  documentLink?: string;
  price: number;
  totalDuration: number;
  topics: CourseTopic[];
  examFile?: {
    filename: string;
    uploadDate: string;
    originalName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicProgress {
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

export interface EnrollmentData {
  _id: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  videoProgress: number;
  isExamCompleted: boolean;
  examScore: number | null;
  topicProgress: TopicProgress[];
}

export interface Enrollment {
  _id?: string;
  userId: string | User;
  courseId: string | Pack365Course;
  courseName: string;
  amountPaid: number;
  paymentId: string;
  orderId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  enrollmentType: 'payment' | 'code';
  enrollmentDate: string;
  expiresAt: string;
  topicProgress: TopicProgress[];
  videoProgress: number;
  examScore: number | null;
  isExamCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentCode {
  _id?: string;
  code: string;
  courseId: string | Pack365Course;
  courseName: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdBy: string | User;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamQuestion {
  questionText: string;
  options: string[]; // always 4
  correctAnswer: string;
  type: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface Pack365Exam {
  _id?: string;
  examId: string;
  courseId: string | Pack365Course;
  questions: ExamQuestion[]; // always 30
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  _id?: string;
  examId: string;
  courseId: string;
  questions: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
    type: 'easy' | 'medium' | 'hard';
    description?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnhancedPack365Enrollment extends Pack365Enrollment {
  _id: string;
  status?: string;
  totalWatchedPercentage?: number;
  progress?: any;
  topicProgress: TopicProgress[];
  videoProgress: number;
  enrollmentType: 'payment' | 'code';
  isExamCompleted?: boolean;
  examScore?: number;
}
export interface CreateEnrollmentCodeInput {
  code: string;
  stream: string;
  usageLimit?: number;
  expiresAt?: string; // ISO string (e.g. "2025-12-31T00:00:00.000Z")
}

export interface CreateEnrollmentCodeResponse {
  success: boolean;
  message: string;
  code: EnrollmentCode;
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

export interface PaymentOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    userId?: string;
  };
}
