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
