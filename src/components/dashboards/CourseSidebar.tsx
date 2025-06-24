
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, CheckCircle, PlayCircle, FileText, PenTool, Clock } from 'lucide-react';

interface CourseSidebarProps {
  currentLesson: number;
  completedLessons: number[];
  onLessonSelect: (lessonId: number) => void;
}

const courseModules = [
  {
    id: 1,
    title: 'Getting Started',
    lessons: [
      { id: 0, title: 'HTML Basics', type: 'video', duration: '15:30', isQuiz: false },
      { id: 1, title: 'CSS Styling', type: 'video', duration: '18:45', isQuiz: false },
      { id: 2, title: 'Module 1 Quiz', type: 'quiz', duration: '10 min', isQuiz: true }
    ]
  },
  {
    id: 2,
    title: 'JavaScript Fundamentals',
    lessons: [
      { id: 3, title: 'Variables & Data Types', type: 'video', duration: '22:15', isQuiz: false },
      { id: 4, title: 'Functions & Scope', type: 'video', duration: '19:30', isQuiz: false },
      { id: 5, title: 'DOM Manipulation', type: 'video', duration: '25:45', isQuiz: false },
      { id: 6, title: 'JavaScript Assignment', type: 'assignment', duration: '45 min', isQuiz: false }
    ]
  },
  {
    id: 3,
    title: 'Building Your First Website',
    lessons: [
      { id: 7, title: 'Project Planning', type: 'video', duration: '12:00', isQuiz: false },
      { id: 8, title: 'HTML Structure', type: 'video', duration: '28:15', isQuiz: false },
      { id: 9, title: 'CSS Layout', type: 'video', duration: '32:30', isQuiz: false },
      { id: 10, title: 'Adding Interactivity', type: 'video', duration: '26:45', isQuiz: false },
      { id: 11, title: 'Final Project', type: 'assignment', duration: '2 hours', isQuiz: false }
    ]
  }
];

const CourseSidebar = ({ currentLesson, completedLessons, onLessonSelect }: CourseSidebarProps) => {
  const [openModules, setOpenModules] = useState([1, 2, 3]);

  const toggleModule = (moduleId: number) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getIcon = (lesson: any) => {
    if (lesson.type === 'quiz') return FileText;
    if (lesson.type === 'assignment') return PenTool;
    return PlayCircle;
  };

  const getLessonStatus = (lessonId: number) => {
    if (completedLessons.includes(lessonId)) return 'completed';
    if (lessonId === currentLesson) return 'current';
    return 'upcoming';
  };

  const getStatusIcon = (lessonId: number) => {
    const status = getLessonStatus(lessonId);
    if (status === 'completed') return CheckCircle;
    if (status === 'current') return PlayCircle;
    return Clock;
  };

  const getStatusColor = (lessonId: number) => {
    const status = getLessonStatus(lessonId);
    if (status === 'completed') return 'text-green-600';
    if (status === 'current') return 'text-blue-600';
    return 'text-gray-400';
  };

  const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  return (
    <Card className="sticky top-24 h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Course Content</CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{completedCount}/{totalLessons} lessons completed</span>
          <Badge variant="outline">{progressPercentage}%</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {courseModules.map((module) => (
            <Collapsible
              key={module.id}
              open={openModules.includes(module.id)}
              onOpenChange={() => toggleModule(module.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto font-medium text-left"
                >
                  <span>{module.title}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openModules.includes(module.id) ? 'rotate-180' : ''
                  }`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-1 pb-2">
                  {module.lessons.map((lesson) => {
                    const Icon = getIcon(lesson);
                    const StatusIcon = getStatusIcon(lesson.id);
                    const statusColor = getStatusColor(lesson.id);
                    const isCurrentLesson = lesson.id === currentLesson;
                    
                    return (
                      <Button
                        key={lesson.id}
                        variant="ghost"
                        onClick={() => onLessonSelect(lesson.id)}
                        className={`w-full justify-start p-3 h-auto text-left ${
                          isCurrentLesson ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <StatusIcon className={`h-4 w-4 mt-1 ${statusColor}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isCurrentLesson ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Icon className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                              {lesson.type === 'quiz' && (
                                <Badge variant="secondary" className="text-xs">Quiz</Badge>
                              )}
                              {lesson.type === 'assignment' && (
                                <Badge variant="secondary" className="text-xs">Assignment</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSidebar;
