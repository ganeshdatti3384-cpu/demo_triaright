/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi, pack365Api } from '@/services/api';
import { Pack365Course, EnhancedPack365Enrollment } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import CourseLearningInterface from '@/components/CourseLearningInterface';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Pack365Course | null>(null);
  const [enrollment, setEnrollment] = useState<EnhancedPack365Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (id && token) {
      fetchCourseAndEnrollment(id);
    } else if (!token) {
      toast({ title: 'Please login to continue.', variant: 'destructive' });
      navigate('/login');
    }
  }, [id, navigate, toast]);

  const fetchCourseAndEnrollment = async (id: string,) => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await pack365Api.getCourseById(id);
      if (!courseResponse.success) {
        throw new Error('Course not found');
      }
      console.log( 'Course data:', courseResponse);
      
      // Use the course data directly with topics
      const courseData = {
        ...courseResponse.data,
        topics: courseResponse.data.topics?.map((topic: any) => ({
          name: topic.name,
          link: topic.link,
          duration: topic.duration,
          videoUrl: topic.link
        })) || []
      };
      
      setCourse(courseData);
      
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load course data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading course...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not accessible</h2>
            <Button onClick={() => navigate('/pack365')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pack365
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CourseLearningInterface 
        courseId={id!} 
        course={course} 
        enrollment={enrollment} 
      />
      <Footer />
    </>
  );
};

export default CourseLearning;
