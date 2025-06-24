
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';
import { 
  Clock, 
  Users, 
  Star, 
  PlayCircle, 
  CheckCircle, 
  Award, 
  HeadphonesIcon,
  Download,
  Smartphone,
  Code,
  Database,
  Calculator,
  TrendingUp,
  Briefcase
} from 'lucide-react';

const CourseDetail = () => {
  const { courseId, courseType } = useParams();
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Sample course data - in real app this would come from API
  const courseData = {
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
      videoThumbnail: '/placeholder.svg',
      whatYoullLearn: [
        'HTML5 and semantic markup',
        'CSS3, Flexbox, and Grid layouts',
        'JavaScript ES6+ fundamentals',
        'React.js and component architecture',
        'Responsive web design',
        'Git version control',
        'Deployment and hosting'
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
        quote: 'Building web applications should be fun and creative!',
        avatar: '/placeholder.svg'
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
    }
  };

  const course = courseData['web-development']; // For demo, using static data
  const IconComponent = course.icon;

  const handleEnrollClick = () => {
    // Redirect to login page for enrollment
    navigate('/register');
  };

  const whatsIncluded = [
    'Lifetime access to course content',
    'Certificate of completion',
    'Direct instructor support',
    'Mobile and desktop access',
    'Downloadable resources',
    '30-day money-back guarantee'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <div className={`${course.color} p-2 rounded-lg text-white mr-4`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline" className="ml-2">{courseType === 'live' ? 'Live Course' : 'Recorded Course'}</Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{course.tagline}</p>
          
          {/* Course Overview Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {course.duration}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {course.students} students
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
              {course.rating} ({Math.floor(Math.random() * 500) + 100} reviews)
            </div>
            <div className="flex items-center">
              <PlayCircle className="h-4 w-4 mr-2" />
              {course.lessons} lessons
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {!isVideoPlaying ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Button
                        onClick={() => setIsVideoPlaying(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        size="lg"
                      >
                        <PlayCircle className="h-8 w-8 mr-2" />
                        Watch Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <p>Video Player Placeholder - Course Preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.whatYoullLearn.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.curriculum.length} modules • {course.lessons} lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.curriculum.map((module, index) => (
                    <AccordionItem key={index} value={`module-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <span className="font-medium">{module.module}</span>
                          <Badge variant="outline" className="ml-2">
                            {module.lessons.length} lessons
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center py-2">
                              <PlayCircle className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-600">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                    <p className="text-gray-600 mb-2">{course.instructor.bio}</p>
                    <blockquote className="italic text-gray-700 border-l-4 border-blue-500 pl-4">
                      "{course.instructor.quote}"
                    </blockquote>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl font-bold text-brand-primary">{course.price}</span>
                      <span className="text-xl text-gray-500 line-through ml-2">{course.originalPrice}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(((parseInt(course.originalPrice.replace('₹', '').replace(',', '')) - parseInt(course.price.replace('₹', '').replace(',', ''))) / parseInt(course.originalPrice.replace('₹', '').replace(',', ''))) * 100)}% OFF
                    </Badge>
                  </div>
                  
                  <Button onClick={handleEnrollClick} className="w-full bg-brand-primary hover:bg-blue-700 text-white mb-4" size="lg">
                    Enroll Now
                  </Button>
                  
                  <p className="text-center text-sm text-gray-600 mb-4">30-day money-back guarantee</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">What's Included:</h4>
                    {whatsIncluded.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Award className="h-4 w-4 text-blue-500 mr-3" />
                    <span>Certificate of Completion</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HeadphonesIcon className="h-4 w-4 text-blue-500 mr-3" />
                    <span>Direct Instructor Support</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Download className="h-4 w-4 text-blue-500 mr-3" />
                    <span>Downloadable Resources</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Smartphone className="h-4 w-4 text-blue-500 mr-3" />
                    <span>Mobile Access</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-brand-primary">{course.price}</span>
            <span className="text-lg text-gray-500 line-through ml-2">{course.originalPrice}</span>
          </div>
          <Button onClick={handleEnrollClick} className="bg-brand-primary hover:bg-blue-700 text-white">
            Enroll Now
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
