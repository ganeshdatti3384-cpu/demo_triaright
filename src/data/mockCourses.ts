import { Course } from '@/services/courseApi';

export const mockCourses: Course[] = [
  {
    _id: '1',
    courseId: 'react-basics-101',
    courseName: 'React Fundamentals',
    courseDescription: 'Learn the fundamentals of React including components, props, state, and hooks. Perfect for beginners starting their React journey.',
    demoVideoLink: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
    courseType: 'unpaid',
    price: 0,
    duration: 1200, // 20 hours in minutes
    stream: 'IT',
    providerName: 'TechEd',
    instructorName: 'John Smith',
    courseLanguage: 'English',
    certificationProvided: true,
    additionalInformation: 'Includes hands-on projects and coding exercises',
    courseImageLink: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    curriculumDocLink: '',
    curriculum: [
      { title: 'Introduction to React', duration: 120, description: 'Overview of React and its ecosystem' },
      { title: 'Components and JSX', duration: 180, description: 'Creating and using React components' },
      { title: 'Props and State', duration: 150, description: 'Managing data in React applications' },
      { title: 'Event Handling', duration: 120, description: 'Handling user interactions' },
      { title: 'React Hooks', duration: 240, description: 'useState, useEffect, and custom hooks' },
      { title: 'Building a Project', duration: 390, description: 'Creating a complete React application' }
    ],
    totalDuration: 1200,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z'
  },
  {
    _id: '2',
    courseId: 'js-advanced-202',
    courseName: 'Advanced JavaScript',
    courseDescription: 'Master advanced JavaScript concepts including async programming, closures, and modern ES6+ features.',
    demoVideoLink: 'https://www.youtube.com/watch?v=hKB-YGF14L0',
    courseType: 'paid',
    price: 2999,
    duration: 1800, // 30 hours in minutes
    stream: 'IT',
    providerName: 'CodeAcademy',
    instructorName: 'Sarah Johnson',
    courseLanguage: 'English',
    certificationProvided: true,
    additionalInformation: 'Includes real-world projects and industry best practices',
    courseImageLink: '/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png',
    curriculumDocLink: '',
    curriculum: [
      { title: 'ES6+ Features', duration: 180, description: 'Arrow functions, destructuring, modules' },
      { title: 'Async Programming', duration: 240, description: 'Promises, async/await, callbacks' },
      { title: 'Closures and Scope', duration: 150, description: 'Understanding JavaScript scope' },
      { title: 'Object-Oriented JavaScript', duration: 180, description: 'Classes, inheritance, prototypes' },
      { title: 'Functional Programming', duration: 200, description: 'Higher-order functions, immutability' },
      { title: 'Performance Optimization', duration: 150, description: 'Memory management and optimization' },
      { title: 'Testing and Debugging', duration: 180, description: 'Unit testing and debugging techniques' },
      { title: 'Capstone Project', duration: 520, description: 'Build a complex JavaScript application' }
    ],
    totalDuration: 1800,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-05T14:20:00Z'
  },
  {
    _id: '3',
    courseId: 'python-data-science',
    courseName: 'Python for Data Science',
    courseDescription: 'Complete guide to using Python for data analysis, visualization, and machine learning.',
    demoVideoLink: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
    courseType: 'paid',
    price: 3999,
    duration: 2400, // 40 hours in minutes
    stream: 'IT',
    providerName: 'DataLearn',
    instructorName: 'Dr. Michael Chen',
    courseLanguage: 'English',
    certificationProvided: true,
    additionalInformation: 'Hands-on projects with real datasets',
    courseImageLink: '/lovable-uploads/cdf8ab47-8b3d-4445-820a-e1e1baca31e0.png',
    curriculumDocLink: '',
    curriculum: [
      { title: 'Python Basics for Data Science', duration: 240, description: 'Python fundamentals and libraries' },
      { title: 'NumPy and Pandas', duration: 300, description: 'Data manipulation and analysis' },
      { title: 'Data Visualization', duration: 240, description: 'Matplotlib, Seaborn, and Plotly' },
      { title: 'Statistical Analysis', duration: 180, description: 'Descriptive and inferential statistics' },
      { title: 'Machine Learning Basics', duration: 360, description: 'Scikit-learn and ML algorithms' },
      { title: 'Deep Learning Introduction', duration: 240, description: 'Neural networks with TensorFlow' },
      { title: 'Data Cleaning and Preprocessing', duration: 180, description: 'Handling real-world messy data' },
      { title: 'Capstone Project', duration: 660, description: 'End-to-end data science project' }
    ],
    totalDuration: 2400,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z'
  },
  {
    _id: '4',
    courseId: 'web-design-fundamentals',
    courseName: 'Web Design Fundamentals',
    courseDescription: 'Learn the principles of modern web design including UI/UX, responsive design, and accessibility.',
    demoVideoLink: 'https://www.youtube.com/watch?v=3YW65K6LcIA',
    courseType: 'unpaid',
    price: 0,
    duration: 900, // 15 hours in minutes
    stream: 'IT',
    providerName: 'DesignHub',
    instructorName: 'Emma Wilson',
    courseLanguage: 'English',
    certificationProvided: false,
    additionalInformation: 'Includes design tools and templates',
    courseImageLink: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    curriculumDocLink: '',
    curriculum: [
      { title: 'Design Principles', duration: 120, description: 'Color theory, typography, layout' },
      { title: 'HTML & CSS Basics', duration: 180, description: 'Structure and styling fundamentals' },
      { title: 'Responsive Design', duration: 150, description: 'Mobile-first design approach' },
      { title: 'UI/UX Best Practices', duration: 120, description: 'User experience and interface design' },
      { title: 'Design Tools', duration: 90, description: 'Figma, Adobe XD, and other tools' },
      { title: 'Portfolio Project', duration: 240, description: 'Create a complete website design' }
    ],
    totalDuration: 900,
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-15T13:20:00Z'
  },
  {
    _id: '5',
    courseId: 'digital-marketing-101',
    courseName: 'Digital Marketing Essentials',
    courseDescription: 'Master the fundamentals of digital marketing including SEO, social media, and content marketing.',
    demoVideoLink: 'https://www.youtube.com/watch?v=nU-IIXBWlS4',
    courseType: 'paid',
    price: 1999,
    duration: 1200, // 20 hours in minutes
    stream: 'MARKETING',
    providerName: 'MarketPro',
    instructorName: 'Alex Rodriguez',
    courseLanguage: 'English',
    certificationProvided: true,
    additionalInformation: 'Real campaign examples and case studies',
    courseImageLink: '/lovable-uploads/Marketing Pack 365.png',
    curriculumDocLink: '',
    curriculum: [
      { title: 'Digital Marketing Overview', duration: 120, description: 'Introduction to digital marketing landscape' },
      { title: 'Search Engine Optimization', duration: 240, description: 'SEO strategies and techniques' },
      { title: 'Social Media Marketing', duration: 180, description: 'Platform-specific marketing strategies' },
      { title: 'Content Marketing', duration: 150, description: 'Creating engaging content' },
      { title: 'Email Marketing', duration: 120, description: 'Email campaigns and automation' },
      { title: 'Analytics and Measurement', duration: 150, description: 'Google Analytics and KPIs' },
      { title: 'Paid Advertising', duration: 180, description: 'Google Ads and Facebook Ads' },
      { title: 'Campaign Project', duration: 240, description: 'Create and launch a marketing campaign' }
    ],
    totalDuration: 1200,
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-02-08T17:15:00Z'
  }
];

export const getFreeCourses = () => mockCourses.filter(course => course.courseType === 'unpaid');
export const getPaidCourses = () => mockCourses.filter(course => course.courseType === 'paid');
export const getCourseById = (id: string) => mockCourses.find(course => course.courseId === id || course._id === id);