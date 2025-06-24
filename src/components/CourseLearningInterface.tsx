import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  Download, 
  Upload, 
  FileText, 
  Award,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseLearningInterfaceProps {
  course: any;
  onBack: () => void;
}

const CourseLearningInterface = ({ course, onBack }: CourseLearningInterfaceProps) => {
  const { toast } = useToast();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentModule, setCurrentModule] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [assignmentText, setAssignmentText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [openModules, setOpenModules] = useState<{ [key: number]: boolean }>({ 0: true });

  // Sample course data structure
  const courseData = {
    title: "Web Development",
    description: "Complete guide to modern web development",
    progress: 25,
    modules: [
      {
        title: "HTML Fundamentals",
        lessons: [
          {
            title: "HTML Basics",
            duration: "15 min",
            type: "video",
            videoId: "5IEMnRHl05Y",
            completed: false,
            hasQuiz: true,
            hasAssignment: true
          },
          {
            title: "HTML Structure",
            duration: "20 min",
            type: "video",
            videoId: "dQw4w9WgXcQ",
            completed: false,
            hasQuiz: true
          },
          {
            title: "HTML Forms",
            duration: "25 min",
            type: "video",
            videoId: "oHg5SJYRHA0",
            completed: false,
            hasAssignment: true
          }
        ]
      },
      {
        title: "CSS Styling",
        lessons: [
          {
            title: "CSS Basics",
            duration: "18 min",
            type: "video",
            videoId: "1PnVor36_40",
            completed: false,
            hasQuiz: true
          },
          {
            title: "CSS Flexbox",
            duration: "30 min",
            type: "video",
            videoId: "JJSoEo8JSnc",
            completed: false,
            hasAssignment: true
          }
        ]
      },
      {
        title: "JavaScript Fundamentals",
        lessons: [
          {
            title: "JavaScript Basics",
            duration: "22 min",
            type: "video",
            videoId: "W6NZfCO5SIk",
            completed: false,
            hasQuiz: true,
            hasAssignment: true
          }
        ]
      }
    ]
  };

  const currentLessonData = courseData.modules[currentModule]?.lessons[currentLesson];
  const isCompleted = courseData.progress === 100;

  const handleMarkComplete = () => {
    toast({
      title: "Lesson Completed!",
      description: `"${currentLessonData.title}" has been marked as complete.`,
    });
    // Update lesson completion status
    courseData.modules[currentModule].lessons[currentLesson].completed = true;
  };

  const toggleModule = (moduleIndex: number) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
  };

  const submitQuiz = () => {
    if (quizAnswer.trim()) {
      toast({
        title: "Quiz Submitted!",
        description: "Your answer has been submitted for review.",
      });
      setQuizAnswer('');
    }
  };

  const submitAssignment = () => {
    if (assignmentText.trim()) {
      toast({
        title: "Assignment Submitted!",
        description: "Your assignment has been submitted successfully.",
      });
      setAssignmentText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                <p className="text-sm text-gray-600">{currentLessonData?.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <Progress value={courseData.progress} className="w-24" />
                <span className="text-sm font-medium">{courseData.progress}%</span>
              </div>
              {isCompleted && (
                <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
                  <Award className="h-4 w-4 mr-2" />
                  Get Certificate
                </Button>
              )}
              <Button variant="outline">
                Continue Where You Left Off
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Learning Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentLessonData?.videoId || '5IEMnRHl05Y'}`}
                    title={currentLessonData?.title || 'HTML Basics'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{currentLessonData?.title || 'HTML Basics'}</h2>
                      <p className="text-gray-600">Learn the fundamentals of HTML structure and syntax</p>
                    </div>
                    <Button onClick={handleMarkComplete} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  </div>
                  
                  {/* Resources */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Downloadable Resources</h3>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        HTML Basics Notes.pdf
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Code Examples.zip
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowTranscript(!showTranscript)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {showTranscript ? 'Hide' : 'Show'} Transcript
                      </Button>
                    </div>
                    
                    {showTranscript && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Video Transcript</h4>
                        <p className="text-sm text-gray-600">
                          Welcome to HTML Basics. In this lesson, we'll cover the fundamental structure of HTML documents, 
                          including doctype declarations, head sections, and body content. HTML is the backbone of web development...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz and Assignment Tabs */}
            <Tabs defaultValue="quiz" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="assignment">Assignment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quiz" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Check</CardTitle>
                    <CardDescription>Test your understanding of HTML basics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Question: What does HTML stand for and what is its primary purpose in web development?
                      </Label>
                      <Textarea
                        placeholder="Type your answer here..."
                        value={quizAnswer}
                        onChange={(e) => setQuizAnswer(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={submitQuiz} disabled={!quizAnswer.trim()}>
                      Submit Answer
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assignment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Practical Assignment</CardTitle>
                    <CardDescription>Apply what you've learned</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Assignment: Build a simple HTML page with at least 3 different HTML tags (h1, p, and ul)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Create a basic HTML structure and include a heading, paragraph, and unordered list.
                      </p>
                    </div>
                    
                    <div>
                      <Label>Upload your HTML file or paste your code:</Label>
                      <div className="mt-2 space-y-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Drag and drop your HTML file here, or click to browse</p>
                          <Input type="file" accept=".html" className="mt-2" />
                        </div>
                        
                        <div>
                          <Label>Or paste your code:</Label>
                          <Textarea
                            placeholder="<html>&#10;<head>&#10;  <title>My Page</title>&#10;</head>&#10;<body>&#10;  <!-- Your code here -->&#10;</body>&#10;</html>"
                            value={assignmentText}
                            onChange={(e) => setAssignmentText(e.target.value)}
                            className="mt-2 font-mono text-sm"
                            rows={8}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={submitAssignment} disabled={!assignmentText.trim()}>
                      Submit Assignment
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <CardDescription>
                  {courseData.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseData.modules.map((module, moduleIndex) => (
                  <Collapsible 
                    key={moduleIndex}
                    open={openModules[moduleIndex]}
                    onOpenChange={() => toggleModule(moduleIndex)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-left">{module.title}</span>
                      {openModules[moduleIndex] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            currentModule === moduleIndex && currentLesson === lessonIndex
                              ? 'bg-blue-100 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => selectLesson(moduleIndex, lessonIndex)}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : currentModule === moduleIndex && currentLesson === lessonIndex ? (
                              <Play className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration}
                              </span>
                              {lesson.hasQuiz && (
                                <Badge variant="outline" className="text-xs">Quiz</Badge>
                              )}
                              {lesson.hasAssignment && (
                                <Badge variant="outline" className="text-xs">Assignment</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Certificate Section */}
            {isCompleted && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Certificate Ready!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-full h-32 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-white text-center">
                        <Award className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-semibold">Certificate of Completion</p>
                        <p className="text-sm">Web Development</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
