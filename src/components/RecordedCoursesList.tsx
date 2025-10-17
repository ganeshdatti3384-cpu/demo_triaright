/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  price: number;
  courseImageLink: string;
  totalDuration: number;
}

interface RecordedCoursesListProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
}

// Reusable skeleton card for a better loading experience
export const SkeletonCard = () => (
  <Card className="animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded-t-lg"></div>
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    </CardHeader>
    <CardContent>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </CardContent>
    <CardFooter>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </CardFooter>
  </Card>
);

// Course Card Component
export const CourseCard = ({ course }: { course: Course }) => (
  <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="w-full h-48 overflow-hidden">
      <img
        src={course.courseImageLink || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=.'}
        alt={course.courseName}
        className="w-full h-full object-cover"
      />
    </div>
    <CardHeader>
      <CardTitle className="text-xl h-14 line-clamp-2">{course.courseName}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-gray-600 mb-4 h-20 line-clamp-3">{course.courseDescription}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Clock className="h-4 w-4 mr-1.5" />
        <span>{course.totalDuration} minutes total</span>
      </div>
    </CardContent>
    <CardFooter className="bg-gray-50/50 p-4">
      <Link
        to="/payment-selection"
        state={{
          courseId: course._id,
          courseName: course.courseName,
          coursePrice: course.price,
          fromCourse: true
        }}
        className="w-full"
      >
        <Button className="w-full text-lg">
          {course.price > 0 ? `Enroll for ₹${course.price}` : 'Enroll for Free'}
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

// Loading State Component
export const LoadingState = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-3xl font-bold mb-6">Naveen</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

// Error State Component
export const ErrorState = ({ error }: { error: string }) => (
  <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">
    Error: {error}
  </div>
);

// Main Courses List Component
const RecordedCoursesList: React.FC<RecordedCoursesListProps> = ({ courses, loading, error }) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
};

export default RecordedCoursesList;