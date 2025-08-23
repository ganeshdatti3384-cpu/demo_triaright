
import { mockCourses, getFreeCourses, getPaidCourses, getCourseById } from '@/data/mockCourses';

// Simulate API delay for realistic experience
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Course interfaces
export interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  demoVideoLink?: string;
  courseType: 'paid' | 'unpaid';
  price: number;
  duration: number;
  stream: string;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: boolean;
  additionalInformation?: string;
  courseImageLink?: string;
  curriculumDocLink?: string;
  curriculum: Array<{
    title: string;
    duration: number;
    description?: string;
  }>;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  success: boolean;
  message?: string;
  course?: Course;
  courses?: Course[];
}

// Course API functions
export const courseApi = {
  // Get all courses
  getAllCourses: async (): Promise<CourseResponse> => {
    try {
      await delay(500); // Simulate network delay
      return {
        success: true,
        courses: mockCourses
      };
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        message: 'Failed to fetch courses'
      };
    }
  },

  // Get course by ID
  getCourseById: async (courseId: string): Promise<CourseResponse> => {
    try {
      await delay(300); // Simulate network delay
      const course = getCourseById(courseId);
      if (course) {
        return {
          success: true,
          course
        };
      } else {
        return {
          success: false,
          message: 'Course not found'
        };
      }
    } catch (error: any) {
      console.error('Error fetching course:', error);
      return {
        success: false,
        message: 'Failed to fetch course'
      };
    }
  },

  // Get free courses
  getFreeCourses: async (): Promise<CourseResponse> => {
    try {
      await delay(400); // Simulate network delay
      return {
        success: true,
        courses: getFreeCourses()
      };
    } catch (error: any) {
      console.error('Error fetching free courses:', error);
      return {
        success: false,
        message: 'Failed to fetch free courses'
      };
    }
  },

  // Get paid courses
  getPaidCourses: async (): Promise<CourseResponse> => {
    try {
      await delay(400); // Simulate network delay
      return {
        success: true,
        courses: getPaidCourses()
      };
    } catch (error: any) {
      console.error('Error fetching paid courses:', error);
      return {
        success: false,
        message: 'Failed to fetch paid courses'
      };
    }
  },

  // Create course (admin only) - Mock implementation
  createCourse: async (courseData: FormData, token: string): Promise<CourseResponse> => {
    try {
      await delay(1000); // Simulate network delay
      // In a real implementation, this would create a new course
      return {
        success: true,
        message: 'Course created successfully (mock)'
      };
    } catch (error: any) {
      console.error('Error creating course:', error);
      return {
        success: false,
        message: 'Failed to create course'
      };
    }
  },

  // Update course (superadmin only) - Mock implementation
  updateCourse: async (courseId: string, courseData: FormData, token: string): Promise<CourseResponse> => {
    try {
      await delay(1000); // Simulate network delay
      // In a real implementation, this would update the course
      return {
        success: true,
        message: 'Course updated successfully (mock)'
      };
    } catch (error: any) {
      console.error('Error updating course:', error);
      return {
        success: false,
        message: 'Failed to update course'
      };
    }
  },

  // Delete course (superadmin only) - Mock implementation
  deleteCourse: async (courseId: string, token: string): Promise<CourseResponse> => {
    try {
      await delay(800); // Simulate network delay
      // In a real implementation, this would delete the course
      return {
        success: true,
        message: 'Course deleted successfully (mock)'
      };
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        message: 'Failed to delete course'
      };
    }
  }
};
