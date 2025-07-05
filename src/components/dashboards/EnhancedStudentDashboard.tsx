
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, FastForward, CheckCircle, Clock, BookOpen } from 'lucide-react';

interface EnrolledCourse {
  courseId: string;
  title: string;
  instructor: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  currentLesson?: string;
  totalLessons?: number;
  completedLessons?: number;
}

const EnhancedStudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(100);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    // Add mock progress data for demonstration
    const coursesWithProgress = courses.map((course: EnrolledCourse) => ({
      ...course,
      progress: course.progress || Math.floor(Math.random() * 100),
      currentLesson: course.currentLesson || 'Introduction to Basics',
      totalLessons: course.totalLessons || Math.floor(Math.random() * 20) + 10,
      completedLessons: course.completedLessons || Math.floor(Math.random() * 15),
      completed: course.completed || Math.random() > 0.7
    }));
    setEnrolledCourses(coursesWithProgress);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleForward = () => {
    setCurrentTime(Math.min(currentTime + 10, totalDuration));
  };

  const updateProgress = (courseId: string, newProgress: number) => {
    const updatedCourses = enrolledCourses.map(course => 
      course.courseId === courseId 
        ? { ...course, progress: newProgress, completed: newProgress >= 100 }
        : course
    );
    setEnrolledCourses(updatedCourses);
    localStorage.setItem('enrolledCourses', JSON.stringify(updatedCourses));
  };

  const CoursePlayer = ({ course }: { course: EnrolledCourse }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{course.title}</span>
          <Badge variant={course.completed ? "default" : "secondary"}>
            {course.completed ? "Completed" : "In Progress"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video Player Mockup */}
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
            <div className="text-white text-center">
              <Play className="h-16 w-16 mx-auto mb-2" />
              <p>Video: {course.currentLesson}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.floor((currentTime / totalDuration) * 100)}% Complete</span>
              <span>{currentTime}s / {totalDuration}s</span>
            </div>
            <Progress value={(currentTime / totalDuration) * 100} className="w-full" />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={handlePlayPause} size="lg">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleForward}>
              <FastForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Course Progress */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{course.progress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {course.completedLessons}/{course.totalLessons}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
          </div>

          {/* Update Progress Button */}
          <Button 
            onClick={() => updateProgress(course.courseId, Math.min(course.progress + 10, 100))}
            className="w-full"
          >
            Mark Current Lesson Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Courses</TabsTrigger>
            <TabsTrigger value="completed">Completed Courses</TabsTrigger>
            <TabsTrigger value="all">All Enrolled</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {selectedCourse ? (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCourse(null)}
                  className="mb-4"
                >
                  ← Back to Course List
                </Button>
                <CoursePlayer 
                  course={enrolledCourses.find(c => c.courseId === selectedCourse)!} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.filter(course => !course.completed).map((course) => (
                  <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600">by {course.instructor}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Current: {course.currentLesson}
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {course.completedLessons}/{course.totalLessons} lessons
                          </div>
                        </div>

                        <Button 
                          onClick={() => setSelectedCourse(course.courseId)}
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.filter(course => course.completed).map((course) => (
                <Card key={course.courseId} className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      {course.title}
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                    </CardTitle>
                    <p className="text-sm text-gray-600">by {course.instructor}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Badge variant="default" className="w-full justify-center py-2">
                        Course Completed
                      </Badge>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Completed on:</span>
                          <span>{new Date(course.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.courseId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600">by {course.instructor}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={course.completed ? "default" : "secondary"}>
                          {course.completed ? "Completed" : "In Progress"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {course.progress}% complete
                        </span>
                      </div>
                      
                      <Progress value={course.progress} />
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Enrolled:</span>
                          <span>{new Date(course.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedCourse(course.courseId)}
                        className="w-full"
                        variant={course.completed ? "outline" : "default"}
                      >
                        {course.completed ? "Review Course" : "Continue Learning"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;
