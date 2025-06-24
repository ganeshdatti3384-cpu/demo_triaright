
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import VideoPlayer from '@/components/ContinueLearning/VideoPlayer';
import CourseNavigation from '@/components/ContinueLearning/CourseNavigation';
import LessonContent from '@/components/ContinueLearning/LessonContent';
import QuizSection from '@/components/ContinueLearning/QuizSection';
import CertificateSection from '@/components/ContinueLearning/CertificateSection';
import { continuelearningData } from '@/data/continueLearningData';
import { useToast } from '@/hooks/use-toast';

const ContinueLearning = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);

  const courseData = continuelearningData[courseId] || continuelearningData['web-development'];
  const allLessons = courseData.modules.flatMap(module => module.lessons);
  const currentLesson = allLessons[currentLessonIndex];
  const progressPercentage = Math.round((completedLessons.size / allLessons.length) * 100);

  const handleOpenAuth = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const handleAuthSuccess = (userRole: string, userName: string) => {
    console.log(`User ${userName} logged in as ${userRole}`);
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const handleLessonComplete = () => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLessonIndex);
    setCompletedLessons(newCompleted);
    
    toast({
      title: "Lesson Completed!",
      description: "Great job! Keep up the momentum.",
    });

    // Show quiz if lesson has one
    if (currentLesson.hasQuiz) {
      setShowQuiz(true);
    }
  };

  const handleLessonSelect = (lessonIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    setShowQuiz(false);
  };

  const handleContinueWhereLast = () => {
    const lastIncompleteIndex = allLessons.findIndex((_, index) => !completedLessons.has(index));
    if (lastIncompleteIndex !== -1) {
      setCurrentLessonIndex(lastIncompleteIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
      {/* Course Overview Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseData.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progressPercentage}% Complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <Badge variant="secondary">
                  {completedLessons.size} of {allLessons.length} lessons
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleContinueWhereLast} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Continue Where You Left Off
              </Button>
              
              {progressPercentage === 100 && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Award className="h-4 w-4 mr-2" />
                  Get Certificate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Course Navigation Sidebar */}
          <div className="lg:col-span-1">
            <CourseNavigation
              modules={courseData.modules}
              currentLessonIndex={currentLessonIndex}
              completedLessons={completedLessons}
              onLessonSelect={handleLessonSelect}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              lesson={currentLesson}
              onComplete={handleLessonComplete}
              isCompleted={completedLessons.has(currentLessonIndex)}
            />

            {/* Lesson Content */}
            <LessonContent lesson={currentLesson} />

            {/* Quiz Section */}
            {showQuiz && currentLesson.hasQuiz && (
              <QuizSection
                lesson={currentLesson}
                onQuizComplete={() => setShowQuiz(false)}
              />
            )}

            {/* Certificate Section */}
            {progressPercentage === 100 && (
              <CertificateSection
                courseName={courseData.title}
                studentName="Student Name"
              />
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        type={authModal.type}
        userType={authModal.userType}
        onAuthSuccess={handleAuthSuccess}
      />
      <Footer />
    </div>
  );
};

export default ContinueLearning;
