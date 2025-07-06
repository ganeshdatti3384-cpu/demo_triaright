
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle } from 'lucide-react';


interface CourseCurriculumProps {
  curriculum: Array<{
    module: string;
    lessons: string[];
  }>;
  totalLessons: number;
}

const CourseCurriculum = ({ curriculum, totalLessons }: CourseCurriculumProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
        <CardDescription>
          {curriculum.length} modules • {totalLessons} lessons
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {curriculum.map((module, index) => (
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
  );
};

export default CourseCurriculum;
