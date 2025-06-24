
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  materials?: Array<{
    name: string;
    type: 'pdf' | 'doc' | 'link';
    url: string;
  }>;
  hasQuiz: boolean;
  transcript?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface ContinueLearningCourse {
  id: string;
  title: string;
  modules: Module[];
}

export const continuelearningData: Record<string, ContinueLearningCourse> = {
  'web-development': {
    id: 'web-development',
    title: 'Complete Web Development Bootcamp',
    modules: [
      {
        id: 'html-basics',
        title: 'HTML Fundamentals',
        lessons: [
          {
            id: 'intro-html',
            title: 'Introduction to HTML',
            duration: '15:30',
            videoUrl: '/placeholder-video.mp4',
            description: 'Learn the basics of HTML and semantic markup',
            materials: [
              { name: 'HTML Cheat Sheet', type: 'pdf', url: '/materials/html-cheat-sheet.pdf' },
              { name: 'Practice Exercises', type: 'doc', url: '/materials/html-exercises.doc' }
            ],
            hasQuiz: true,
            transcript: 'Welcome to HTML fundamentals...'
          },
          {
            id: 'semantic-html',
            title: 'Semantic HTML5',
            duration: '22:45',
            videoUrl: '/placeholder-video.mp4',
            description: 'Understanding semantic elements and their importance',
            materials: [
              { name: 'Semantic Elements Guide', type: 'pdf', url: '/materials/semantic-guide.pdf' }
            ],
            hasQuiz: false
          },
          {
            id: 'forms-inputs',
            title: 'Forms and Input Types',
            duration: '18:20',
            videoUrl: '/placeholder-video.mp4',
            description: 'Creating interactive forms with various input types',
            hasQuiz: true
          }
        ]
      },
      {
        id: 'css-styling',
        title: 'CSS Mastery',
        lessons: [
          {
            id: 'css-selectors',
            title: 'CSS Selectors and Specificity',
            duration: '25:10',
            videoUrl: '/placeholder-video.mp4',
            description: 'Master CSS selectors and understand specificity',
            hasQuiz: true
          },
          {
            id: 'flexbox-layout',
            title: 'Flexbox Layout',
            duration: '30:15',
            videoUrl: '/placeholder-video.mp4',
            description: 'Learn modern layout techniques with Flexbox',
            materials: [
              { name: 'Flexbox Visual Guide', type: 'pdf', url: '/materials/flexbox-guide.pdf' }
            ],
            hasQuiz: true
          },
          {
            id: 'css-grid',
            title: 'CSS Grid System',
            duration: '28:40',
            videoUrl: '/placeholder-video.mp4',
            description: 'Advanced layouts with CSS Grid',
            hasQuiz: false
          }
        ]
      },
      {
        id: 'javascript-fundamentals',
        title: 'JavaScript Essentials',
        lessons: [
          {
            id: 'js-variables',
            title: 'Variables and Data Types',
            duration: '20:30',
            videoUrl: '/placeholder-video.mp4',
            description: 'Understanding JavaScript variables and data types',
            hasQuiz: true
          },
          {
            id: 'js-functions',
            title: 'Functions and Scope',
            duration: '35:20',
            videoUrl: '/placeholder-video.mp4',
            description: 'Writing functions and understanding scope',
            hasQuiz: true
          }
        ]
      }
    ]
  },
  'data-science': {
    id: 'data-science',
    title: 'Data Science with Python',
    modules: [
      {
        id: 'python-basics',
        title: 'Python Fundamentals',
        lessons: [
          {
            id: 'python-intro',
            title: 'Introduction to Python',
            duration: '25:00',
            videoUrl: '/placeholder-video.mp4',
            description: 'Getting started with Python programming',
            hasQuiz: true
          },
          {
            id: 'data-structures',
            title: 'Python Data Structures',
            duration: '40:15',
            videoUrl: '/placeholder-video.mp4',
            description: 'Lists, dictionaries, and tuples in Python',
            hasQuiz: true
          }
        ]
      }
    ]
  }
};
