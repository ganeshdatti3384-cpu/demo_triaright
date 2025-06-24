
import { 
  Code,
  Database,
  Calculator,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';

export const courseData = {
  'web-development': {
    title: 'Web Development',
    tagline: 'Master HTML, CSS, JavaScript, React and build modern web applications',
    duration: '12 weeks',
    students: '2,500+',
    rating: 4.8,
    lessons: 45,
    price: '₹2,999',
    originalPrice: '₹4,999',
    level: 'Beginner to Advanced',
    icon: Code,
    color: 'bg-blue-500',
    whatYoullLearn: [
      'HTML5 and semantic markup',
      'CSS3, Flexbox, and Grid layouts',
      'JavaScript ES6+ fundamentals',
      'React.js and component architecture',
      'Responsive web design',
      'Git version control',
      'Deployment and hosting',
      'API integration and REST services'
    ],
    curriculum: [
      {
        module: 'HTML Fundamentals',
        lessons: ['Introduction to HTML', 'Semantic HTML5', 'Forms and Input Types', 'Accessibility Basics']
      },
      {
        module: 'CSS Mastery',
        lessons: ['CSS Selectors', 'Flexbox Layout', 'CSS Grid', 'Responsive Design', 'CSS Animations']
      },
      {
        module: 'JavaScript Essentials',
        lessons: ['Variables and Data Types', 'Functions and Scope', 'DOM Manipulation', 'Event Handling', 'Async JavaScript']
      },
      {
        module: 'React Development',
        lessons: ['Components and JSX', 'State and Props', 'Hooks', 'Routing', 'State Management']
      }
    ],
    instructor: {
      name: 'Sarah Johnson',
      bio: '8+ years of web development experience at Google and Meta',
      quote: 'Building web applications should be fun and creative!'
    },
    reviews: [
      {
        name: 'Raj Patel',
        rating: 5,
        comment: 'Excellent course! The instructor explains concepts clearly and the projects are very practical.'
      },
      {
        name: 'Priya Sharma',
        rating: 5,
        comment: 'Best web development course I have taken. Got a job as frontend developer after completing this!'
      }
    ]
  },
  'data-science': {
    title: 'Data Science',
    tagline: 'Learn Python, Machine Learning, Statistics and Data Analysis',
    duration: '16 weeks',
    students: '1,800+',
    rating: 4.9,
    lessons: 38,
    price: '₹2,499',
    originalPrice: '₹3,999',
    level: 'Beginner',
    icon: Database,
    color: 'bg-orange-500',
    whatYoullLearn: [
      'Python programming fundamentals',
      'Data manipulation with Pandas',
      'Data visualization with Matplotlib and Seaborn',
      'Statistical analysis and hypothesis testing',
      'Machine learning algorithms',
      'Deep learning with TensorFlow',
      'Data cleaning and preprocessing',
      'Model evaluation and deployment'
    ],
    curriculum: [
      {
        module: 'Python for Data Science',
        lessons: ['Python Basics', 'NumPy Arrays', 'Pandas DataFrames', 'Data Import/Export']
      },
      {
        module: 'Data Visualization',
        lessons: ['Matplotlib Basics', 'Seaborn Advanced Plots', 'Interactive Visualizations', 'Dashboard Creation']
      },
      {
        module: 'Statistics & Analysis',
        lessons: ['Descriptive Statistics', 'Probability Theory', 'Hypothesis Testing', 'Correlation Analysis']
      },
      {
        module: 'Machine Learning',
        lessons: ['Supervised Learning', 'Unsupervised Learning', 'Model Selection', 'Deep Learning Intro']
      }
    ],
    instructor: {
      name: 'Dr. Amit Krishnan',
      bio: 'PhD in Data Science, 10+ years experience at Microsoft and IBM',
      quote: 'Data tells stories - let me teach you how to listen!'
    },
    reviews: [
      {
        name: 'Neha Gupta',
        rating: 5,
        comment: 'Amazing course! Dr. Krishnan makes complex concepts easy to understand.'
      },
      {
        name: 'Rohit Singh',
        rating: 5,
        comment: 'Perfect for beginners. Got my first data analyst job after this course!'
      }
    ]
  },
  '3': {
    title: 'Aptitude Training',
    tagline: 'Quantitative aptitude, logical reasoning, and verbal ability',
    duration: '8 weeks',
    students: '3,200+',
    rating: 4.7,
    lessons: 30,
    price: '₹1,999',
    originalPrice: '₹2,999',
    level: 'Beginner to Intermediate',
    icon: Calculator,
    color: 'bg-green-500',
    whatYoullLearn: [
      'Number systems and calculations',
      'Algebra and equations',
      'Geometry and mensuration',
      'Time, speed and distance problems',
      'Logical reasoning patterns',
      'Data interpretation techniques',
      'English grammar and vocabulary',
      'Reading comprehension strategies'
    ],
    curriculum: [
      {
        module: 'Quantitative Aptitude',
        lessons: ['Number Systems', 'Percentages', 'Profit & Loss', 'Simple & Compound Interest']
      },
      {
        module: 'Logical Reasoning',
        lessons: ['Series Completion', 'Coding-Decoding', 'Blood Relations', 'Direction Sense']
      },
      {
        module: 'Data Interpretation',
        lessons: ['Tables & Charts', 'Graphs Analysis', 'Case Studies', 'Data Sufficiency']
      },
      {
        module: 'Verbal Ability',
        lessons: ['Grammar Rules', 'Vocabulary Building', 'Reading Comprehension', 'Sentence Correction']
      }
    ],
    instructor: {
      name: 'Prof. Rajesh Kumar',
      bio: '15+ years of coaching experience, helped 5000+ students crack competitive exams',
      quote: 'Every problem has a pattern - master the pattern, master the exam!'
    },
    reviews: [
      {
        name: 'Arun Sharma',
        rating: 5,
        comment: 'Excellent training! Cleared my bank exam on first attempt.'
      },
      {
        name: 'Kavita Singh',
        rating: 4,
        comment: 'Great systematic approach to problem solving. Highly recommend!'
      }
    ]
  },
  '4': {
    title: 'Business Analytics',
    tagline: 'Excel, Power BI, Tableau and business intelligence tools',
    duration: '10 weeks',
    students: '1,500+',
    rating: 4.6,
    lessons: 55,
    price: '₹3,499',
    originalPrice: '₹5,499',
    level: 'Beginner to Advanced',
    icon: TrendingUp,
    color: 'bg-purple-500',
    whatYoullLearn: [
      'Advanced Excel functions and formulas',
      'Power BI dashboard creation',
      'Tableau data visualization',
      'SQL for business analysis',
      'Statistical analysis techniques',
      'Business intelligence concepts',
      'KPI development and tracking',
      'Predictive analytics basics'
    ],
    curriculum: [
      {
        module: 'Excel Mastery',
        lessons: ['Advanced Formulas', 'Pivot Tables', 'Data Analysis Tools', 'Macros & VBA']
      },
      {
        module: 'Power BI',
        lessons: ['Data Import', 'DAX Functions', 'Dashboard Design', 'Report Publishing']
      },
      {
        module: 'Tableau',
        lessons: ['Data Connections', 'Visual Analytics', 'Interactive Dashboards', 'Story Building']
      },
      {
        module: 'Business Intelligence',
        lessons: ['KPI Development', 'Performance Metrics', 'Forecasting', 'Business Cases']
      }
    ],
    instructor: {
      name: 'Meera Patel',
      bio: 'Senior Business Analyst at Deloitte, MBA from IIM Bangalore',
      quote: 'Transform data into actionable business insights!'
    },
    reviews: [
      {
        name: 'Suresh Reddy',
        rating: 5,
        comment: 'Comprehensive course covering all major BI tools. Got promoted after completing this!'
      },
      {
        name: 'Anjali Joshi',
        rating: 4,
        comment: 'Great practical examples and real-world case studies.'
      }
    ]
  },
  '5': {
    title: 'Soft Skills',
    tagline: 'Communication, leadership and professional development',
    duration: '6 weeks',
    students: '4,000+',
    rating: 4.8,
    lessons: 35,
    price: '₹2,299',
    originalPrice: '₹3,499',
    level: 'Beginner',
    icon: Users,
    color: 'bg-pink-500',
    whatYoullLearn: [
      'Effective communication techniques',
      'Public speaking and presentation skills',
      'Leadership and team management',
      'Emotional intelligence development',
      'Conflict resolution strategies',
      'Time management and productivity',
      'Professional networking',
      'Career advancement strategies'
    ],
    curriculum: [
      {
        module: 'Communication Skills',
        lessons: ['Verbal Communication', 'Non-verbal Cues', 'Active Listening', 'Written Communication']
      },
      {
        module: 'Leadership Development',
        lessons: ['Leadership Styles', 'Team Building', 'Motivation Techniques', 'Decision Making']
      },
      {
        module: 'Professional Skills',
        lessons: ['Time Management', 'Goal Setting', 'Networking', 'Personal Branding']
      },
      {
        module: 'Emotional Intelligence',
        lessons: ['Self-awareness', 'Empathy', 'Social Skills', 'Stress Management']
      }
    ],
    instructor: {
      name: 'Dr. Sunita Malhotra',
      bio: 'Corporate Trainer & Life Coach, 12+ years experience with Fortune 500 companies',
      quote: 'Great leaders are made, not born - let me help you become one!'
    },
    reviews: [
      {
        name: 'Vikram Agarwal',
        rating: 5,
        comment: 'Life-changing course! My confidence and communication skills improved dramatically.'
      },
      {
        name: 'Deepika Rao',
        rating: 5,
        comment: 'Excellent for career growth. Got promoted to team lead after this course!'
      }
    ]
  },
  '6': {
    title: 'Job Readiness',
    tagline: 'Resume building, interview preparation and placement support',
    duration: '4 weeks',
    students: '2,800+',
    rating: 4.9,
    lessons: 42,
    price: '₹3,299',
    originalPrice: '₹4,799',
    level: 'Intermediate',
    icon: Briefcase,
    color: 'bg-indigo-500',
    whatYoullLearn: [
      'Professional resume writing',
      'Cover letter optimization',
      'Interview preparation strategies',
      'Salary negotiation techniques',
      'LinkedIn profile optimization',
      'Job search strategies',
      'Personal portfolio development',
      'Follow-up and networking'
    ],
    curriculum: [
      {
        module: 'Resume & Portfolio',
        lessons: ['Resume Writing', 'ATS Optimization', 'Portfolio Creation', 'LinkedIn Profile']
      },
      {
        module: 'Interview Mastery',
        lessons: ['Common Questions', 'Behavioral Interviews', 'Technical Interviews', 'Mock Interviews']
      },
      {
        module: 'Job Search Strategy',
        lessons: ['Job Portals', 'Company Research', 'Application Tracking', 'Networking']
      },
      {
        module: 'Career Success',
        lessons: ['Salary Negotiation', 'Offer Evaluation', 'First Day Tips', 'Career Planning']
      }
    ],
    instructor: {
      name: 'Rakesh Khanna',
      bio: 'HR Director with 18+ years experience, placed 3000+ candidates in top companies',
      quote: 'Your dream job is just one perfect interview away!'
    },
    reviews: [
      {
        name: 'Pooja Mehta',
        rating: 5,
        comment: 'Got my dream job at Google! The interview preparation was spot-on.'
      },
      {
        name: 'Arjun Nair',
        rating: 5,
        comment: 'Best investment for career growth. 100% worth it!'
      }
    ]
  }
};
