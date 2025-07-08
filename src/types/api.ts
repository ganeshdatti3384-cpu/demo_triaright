// ---------- User ----------
export interface User {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  password: string;
  address: string;
  role: 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';
  createdAt?: string;
  updatedAt?: string;
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
export interface User {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  password: string; // optional in responses
  address: string;
  role: 'student' | 'jobseeker' | 'employer' | 'college' | 'admin' | 'superadmin';
  createdAt?: string;
  updatedAt?: string;
}
export interface CourseTopic {
  name: string;
  link: string;
  duration: number;
}

export interface Pack365Course {
  _id?: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: 'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance';
  documentLink: string;
  price: number;
  totalDuration: number;
  topics: CourseTopic[];
  createdAt?: string;
  updatedAt?: string;
}
export interface TopicProgress {
  topicName: string;
  watched: boolean;
  watchedDuration: number;
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
