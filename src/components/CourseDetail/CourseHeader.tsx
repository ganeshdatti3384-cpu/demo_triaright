
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, PlayCircle } from 'lucide-react';

interface CourseHeaderProps {
  course: any;
  IconComponent: any;
}

const CourseHeader = ({ course, IconComponent }: CourseHeaderProps) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-4">
          <div className={`${course.color} p-2 rounded-lg text-white mr-4`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <Badge variant="secondary">{course.level}</Badge>
          <Badge variant="outline" className="ml-2">
            {window.location.pathname.includes('live') ? 'Live Course' : 'Recorded Course'}
          </Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{course.tagline}</p>
        
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
  );
};

export default CourseHeader;
