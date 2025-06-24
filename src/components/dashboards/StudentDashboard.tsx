
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Award, BookOpen, Clock, Users, Trophy } from 'lucide-react';
import CourseVideoPlayer from './CourseLearningInterface';
import CourseSidebar from './CourseSidebar';
import CourseQuizAssignment from './CourseQuizAssignment';
import CertificateSection from './CertificateSection';
import { useToast } from '@/hooks/use-toast';

interface User {
  role: string;
  name: string;
}

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'learning'>('dashboard');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [courseProgress, setCourseProgress] = useState(25);
  const [completedLessons, setCompletedLessons] = useState([0]);
  const { toast } = useToast();

  const enrolledCourses = [
    {
      id: 1,
      title: 'Web Development',
      progress: courseProgress,
      instructor: 'John Doe',
      nextLesson: 'HTML Basics',
      totalLessons: 12,
      completedLessons: 3,
      estimatedTime: '2 hours left'
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals',
      progress: 60,
      instructor: 'Jane Smith',
      nextLesson: 'Functions and Scope',
      totalLessons: 8,
      completedLessons: 5,
      estimatedTime: '1.5 hours left'
    }
  ];

  const stats = [
    { icon: BookOpen, label: 'Courses Enrolled', value: '2', color: 'text-blue-600' },
    { icon: Trophy, label: 'Certificates Earned', value: '0', color: 'text-yellow-600' },
    { icon: Clock, label: 'Hours Learned', value: '24', color: 'text-green-600' },
    { icon: Award, label: 'Assignments Completed', value: '5', color: 'text-purple-600' }
  ];

  const handleContinueLearning = (courseId: number) => {
    setCurrentView('learning');
  };

  const handleMarkComplete = () => {
    const newCompletedLessons = [...completedLessons, currentLesson + 1];
    setCompletedLessons(newCompletedLessons);
    
    // Calculate new progress
    const totalLessons = 12;
    const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);
    setCourseProgress(newProgress);
    
    toast({
      title: "Lesson Completed!",
      description: "Great job! Moving to the next lesson.",
    });
    
    if (currentLesson < 11) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (currentView === 'learning') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToDashboard}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Web Development</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <Progress value={courseProgress} className="w-48" />
                    <span className="text-sm text-gray-600">{courseProgress}% complete</span>
                    {courseProgress === 100 && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Ready for Certificate
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {courseProgress === 100 && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Award className="h-4 w-4 mr-2" />
                    Get Certificate
                  </Button>
                )}
                <Button variant="outline">
                  Continue Where You Left Off
                </Button>
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Learning Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              <div className="space-y-6">
                {/* Video Player */}
                <CourseVideoPlayer 
                  courseTitle="Web Development"
                  currentLesson={currentLesson}
                  onMarkComplete={handleMarkComplete}
                  isCompleted={completedLessons.includes(currentLesson)}
                />
                
                {/* Course Content Tabs */}
                <Tabs defaultValue="resources" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    <TabsTrigger value="assignment">Assignment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="resources" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Downloadable Resources</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">HTML Basics Cheat Sheet.pdf</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Sample HTML Templates.zip</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">HTML Best Practices Guide.pdf</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="quiz" className="mt-4">
                    <CourseQuizAssignment type="quiz" />
                  </TabsContent>
                  
                  <TabsContent value="assignment" className="mt-4">
                    <CourseQuizAssignment type="assignment" />
                  </TabsContent>
                </Tabs>

                {/* Certificate Section */}
                {courseProgress === 100 && (
                  <CertificateSection 
                    studentName={user.name}
                    courseName="Web Development"
                    completionDate={new Date().toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80">
              <CourseSidebar 
                currentLesson={currentLesson}
                completedLessons={completedLessons}
                onLessonSelect={setCurrentLesson}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Learning Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">by {course.instructor}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Progress value={course.progress} className="w-32" />
                      <span className="text-sm text-gray-600">{course.progress}%</span>
                      <span className="text-sm text-gray-500">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Next: {course.nextLesson}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">{course.estimatedTime}</p>
                    <Button onClick={() => handleContinueLearning(course.id)}>
                      Continue Learning
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Discover new courses to expand your skills</p>
              <Button variant="outline" className="w-full">Explore Courses</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and download your earned certificates</p>
              <Button variant="outline" className="w-full">View Certificates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Join study groups with fellow learners</p>
              <Button variant="outline" className="w-full">Find Groups</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
