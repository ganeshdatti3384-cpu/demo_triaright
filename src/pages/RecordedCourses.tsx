import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '@/services/api';
import Navbar from '@/components/Navbar';
import RecordedCoursesList, { Course } from '@/components/RecordedCoursesList';

const RecordedCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses();

        // Correctly access the nested 'courses' array from the response
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900">Explore Our Courses</h1>
            <p className="text-lg text-gray-600 mt-2">
              Find the perfect course to advance your skills and career.
            </p>
          </div>
          <RecordedCoursesList 
            courses={courses} 
            loading={loading} 
            error={error} 
          />
        </div>
      </div>
    </>
  );
};

export default RecordedCoursesPage;
