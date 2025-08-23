export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  error?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
  collegeName?: string;
  collegeCode?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  error?: string;
}

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: string;
  originalPrice: string;
  isPaid: boolean;
  image: string;
  skills: string[];
  rating: number;
  studentsEnrolled: number;
}

export interface Pack365Course {
  _id: string;
  id?: string;
  courseName: string;
  description?: string;
  stream: string;
  videoCount?: number;
  totalHours?: number;
  totalDuration?: number;
  price?: number;
  topics?: {
    name: string;
    link: string;
    duration: number;
  }[];
  documentLink?: string;
  courseId?: string;
  examFile?: {
    filename: string;
    originalName: string;
    uploadDate: string;
  };
}

export interface TopicProgress {
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

export interface EnhancedPack365Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  courseName: string;
  stream: string;
  enrollmentDate: string;
  amountPaid: number;
  totalWatchedPercentage: number;
  videoProgress: number;
  topicProgress: TopicProgress[];
  isExamCompleted: boolean;
  examScore: number;
  certificateGenerated?: boolean;
  certificateUrl?: string;
  status?: string;
  progress?: number;
  paymentStatus?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  key: string;
  amount: number;
  currency: string;
}

export interface EnrollmentCode {
  _id: string;
  code: string;
  stream: string;
  discountAmount?: number;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  expiresAt: string | null;
  description?: string;
  createdAt: string;
}

export interface CreateEnrollmentCodeInput {
  code: string;
  stream: string;
  discountAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  description?: string;
}

export interface UpdateEnrollmentCodeInput {
  code?: string;
  stream?: string;
  discountAmount?: number;
  usageLimit?: number;
  expiresAt?: string | null;
  description?: string;
  isActive?: boolean;
}

export interface CreateEnrollmentCodeResponse {
  success: boolean;
  message: string;
  code: EnrollmentCode;
}

export interface Exam {
  _id: string;
  title: string;
  courseId: string;
  questions: any[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
}

export interface College {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  establishedYear?: number;
  type?: string;
  affiliation?: string;
  logo?: string;
  description?: string;
  contactPerson?: string;
  registrationNumber?: string;
  collegeName?: string;
  university?: string;
  principalName?: string;
  principalEmail?: string;
  principalPhone?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  collegeCode?: string;
  accreditation?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Employer {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  logo?: string;
  description?: string;
  contactPerson?: string;
  establishedYear?: number;
}

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  course?: string;
  year?: string;
  skills?: string[];
  resume?: string;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  fullName?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  hobbies?: string[];
}

export interface JobSeekerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resume?: string;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  expectedSalary?: string;
  jobPreferences?: string[];
}

export interface Pack365Bundle {
  _id: string;
  name: string;
  stream: 'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance';
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  courses: Pack365Course[];
  totalVideos: number;
  totalHours: number;
  features: string[];
  image: string;
  isActive: boolean;
}

export interface StreamData {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  courses?: Pack365Course[];
  id: string;
  status?: string;
}

// Enhanced Course Types based on MongoDB Schema
export interface SubTopic {
  name: string;
  link: string;
  duration: number;
}

export interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: SubTopic[];
  directLink?: string;
  examExcelLink?: string;
}

export interface EnhancedCourse {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  curriculum: Topic[];
  demoVideoLink: string;
  courseType: 'paid' | 'unpaid';
  price: number;
  totalDuration: number;
  stream: 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability';
  providerName: 'triaright' | 'etv' | 'kalasalingan' | 'instructor';
  instructorName: string;
  courseLanguage: string;
  certificationProvided: 'yes' | 'no';
  additionalInformation?: string;
  courseImageLink: string;
  curriculumDocLink?: string;
  hasFinalExam: boolean;
  finalExamExcelLink?: string;
  createdAt: string;
  updatedAt: string;
}

// Question and Exam Types
export interface Question {
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
  type: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface CourseExam {
  _id: string;
  examId: string;
  courseId: string;
  topicName?: string;
  isFinalExam: boolean;
  questions: Question[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Exam Result Types
export interface CourseExamResult {
  _id: string;
  userId: string;
  courseId: string;
  examId: string;
  topicName?: string;
  isFinalExam: boolean;
  attemptNumber?: number;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

// Progress Tracking Types
export interface SubTopicProgress {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
}

export interface TopicProgressEnhanced {
  topicName: string;
  subtopics: SubTopicProgress[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
}

export interface CourseEnrollment {
  _id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  isPaid: boolean;
  orderId?: string;
  paymentId?: string;
  amountPaid?: number;
  progress: TopicProgressEnhanced[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  accessExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}
