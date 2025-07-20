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
  courseName: string;
  stream: string;
  videoCount?: number;
  totalHours?: number;
}
