/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';

// 1. IMPROVED: Updated interface to match the actual API response data.
interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  price: number;
  courseImageLink: string;
  totalDuration: number;
}

// Reusable skeleton card for a better loading experience
const SkeletonCard = () => (
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

const RecordedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses();

        // 4. FIXED: Correctly access the nested 'courses' array from the response.
        const coursesData = response.courses;
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else {
          throw new Error("Received invalid data format from the server.");
        }

      } catch (err: any) {
        console.error("Error fetching all courses:", err);
        setError("Could not load courses at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // 5. IMPROVED: Render UI based on the state (Loading, Error, or Success)
  if (loading) {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  return (
    <><Navbar />
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Explore Our Courses</h1>
          <p className="text-lg text-gray-600 mt-2">Find the perfect course to advance your skills and career.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course._id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={course.courseImageLink || 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=.'}
                  alt={course.courseName}
                  className="w-full h-full object-cover" />
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
                {/* IMPROVED: Link to payment selection with correct state for enrollment */}
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
          ))}
        </div>
      </div>
    </div></>
  );
};

export default RecordedCourses;
