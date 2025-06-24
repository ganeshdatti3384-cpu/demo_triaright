
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface CourseInstructorProps {
  instructor: {
    name: string;
    bio: string;
    quote: string;
  };
}

const CourseInstructor = ({ instructor }: CourseInstructorProps) => {
  return (
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
            <h3 className="font-semibold text-lg">{instructor.name}</h3>
            <p className="text-gray-600 mb-2">{instructor.bio}</p>
            <blockquote className="italic text-gray-700 border-l-4 border-blue-500 pl-4">
              "{instructor.quote}"
            </blockquote>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInstructor;
