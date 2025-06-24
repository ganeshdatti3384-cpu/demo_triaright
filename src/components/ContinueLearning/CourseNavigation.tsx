
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Play, FileText, Clock, HelpCircle } from 'lucide-react';
import { Module } from '@/data/continueLearningData';

interface CourseNavigationProps {
  modules: Module[];
  currentLessonIndex: number;
  completedLessons: Set<number>;
  onLessonSelect: (lessonIndex: number) => void;
}

const CourseNavigation = ({ modules, currentLessonIndex, completedLessons, onLessonSelect }: CourseNavigationProps) => {
  let globalLessonIndex = 0;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg">Course Content</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="w-full">
          {modules.map((module) => {
            const moduleStartIndex = globalLessonIndex;
            const moduleEndIndex = moduleStartIndex + module.lessons.length - 1;
            const moduleCompletedCount = module.lessons.filter((_, index) => 
              completedLessons.has(moduleStartIndex + index)
            ).length;

            return (
              <AccordionItem key={module.id} value={module.id} className="border-b">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <span className="font-medium text-left">{module.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {moduleCompletedCount}/{module.lessons.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCurrentLesson = globalLessonIndex === currentLessonIndex;
                      const isCompleted = completedLessons.has(globalLessonIndex);
                      const currentGlobalIndex = globalLessonIndex++;

                      return (
                        <Button
                          key={lesson.id}
                          variant={isCurrentLesson ? "secondary" : "ghost"}
                          className={`w-full justify-start px-6 py-3 h-auto ${
                            isCurrentLesson ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => onLessonSelect(currentGlobalIndex)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : isCurrentLesson ? (
                                <Play className="h-4 w-4 text-blue-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{lesson.title}</div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lesson.duration}
                                </div>
                                {lesson.materials && (
                                  <div className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {lesson.materials.length}
                                  </div>
                                )}
                                {lesson.hasQuiz && (
                                  <div className="flex items-center">
                                    <HelpCircle className="h-3 w-3 mr-1" />
                                    Quiz
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CourseNavigation;
