/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Trash, Upload, FileText, Download, ArrowLeft, BookOpen, AlertCircle, Search } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';
import { StreamData } from '@/types/api';

const Pack365Management = () => {
  const { toast } = useToast();
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Pack365Course | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Pack365Course | null>(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examCourse, setExamCourse] = useState<Pack365Course | null>(null);
  const [examFile, setExamFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState({ isValid: true, message: '' });
  const [viewType, setViewType] = useState<'streams' | 'courses'>('streams');
  
  // View Exam states
  const [showViewExamDialog, setShowViewExamDialog] = useState(false);
  const [viewingExamCourse, setViewingExamCourse] = useState<Pack365Course | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  
  // Stream management states
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [editingStream, setEditingStream] = useState<StreamData | null>(null);
  const [streamFormData, setStreamFormData] = useState({
    name: '',
    price: '',
    imageFile: null as File | null
  });

  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    stream: '',
    topics: [{ name: '', link: '', duration: 0 }],
    courseDocument: null as File | null
  });

  useEffect(() => {
    if (viewType === 'streams') {
      fetchStreams();
    } else if (selectedStream) {
      fetchCoursesForStream(selectedStream.name);
    }
  }, [viewType, selectedStream]);

  // ✅ UPDATED: Fix exam retrieval based on backend routes
  const fetchExamQuestions = async (course: Pack365Course) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoadingExam(true);
      
      // First, we need to get the exam ID for this course
      // Let's try to get all exams and find the one for this course
      const allExamsResponse = await fetch('https://triaright.com/api/pack365/exams/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!allExamsResponse.ok) {
        throw new Error('Failed to fetch exams list');
      }

      const allExamsResult = await allExamsResponse.json();
      
      // Find the exam for this course
      const courseExam = allExamsResult.find((exam: any) => {
        // Check if courseId matches either by object ID or courseId field
        return exam.courseId?._id === course._id || 
               exam.courseId?._id === course.courseId ||
               exam.courseId === course._id ||
               exam.courseId === course.courseId;
      });

      if (!courseExam) {
        setExamQuestions([]);
        setViewingExamCourse(course);
        setShowViewExamDialog(true);
        toast({
          title: 'No exam found',
          description: 'This course does not have an exam uploaded yet.',
          variant: 'default',
        });
        return;
      }

      // Now get the questions for this exam
      const examId = courseExam.examId;
      const questionsResponse = await fetch(`https://triaright.com/api/pack365/exams/${examId}/questions?showAnswers=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (questionsResponse.ok) {
        const questionsResult = await questionsResponse.json();
        setExamQuestions(questionsResult.questions || []);
        setViewingExamCourse(course);
        setShowViewExamDialog(true);
      } else {
        // If that fails, try the exam details endpoint
        const detailsResponse = await fetch(`https://triaright.com/api/pack365/exams/details/${examId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (detailsResponse.ok) {
          const detailsResult = await detailsResponse.json();
          setExamQuestions(detailsResult.questions || []);
          setViewingExamCourse(course);
          setShowViewExamDialog(true);
        } else {
          throw new Error('Failed to fetch exam questions');
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching exam questions:', error);
      toast({
        title: 'Error fetching exam',
        description: error.message || 'No exam data found for this course',
        variant: 'destructive',
      });
    } finally {
      setLoadingExam(false);
    }
  };

  // ✅ NEW: Filter exam questions based on search and type
  const filteredExamQuestions = examQuestions.filter(question => {
    const matchesSearch = question.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.Question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || question.type === filterType;
    return matchesSearch && matchesType;
  });

  // ✅ NEW: Get difficulty badge variant
  const getDifficultyVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const validateExcelFile = async (file: File): Promise<{ isValid: boolean; message: string; rowCount?: number }> => {
    return new Promise((resolve) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        resolve({ isValid: false, message: 'Please upload an Excel file (.xlsx or .xls)' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        resolve({ isValid: false, message: 'File size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          resolve({ 
            isValid: true, 
            message: 'File appears valid. Click Upload to proceed.' 
          });
        } catch (error) {
          resolve({ 
            isValid: false, 
            message: 'Invalid Excel file format' 
          });
        }
      };
      
      reader.onerror = () => {
        resolve({ 
          isValid: false, 
          message: 'Error reading file' 
        });
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setExamFile(file);

    if (file) {
      setFileValidation({ isValid: false, message: 'Validating file...' });
      
      const validation = await validateExcelFile(file);
      setFileValidation(validation);
    } else {
      setFileValidation({ isValid: true, message: '' });
    }
  };

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllStreams();
      console.log('Streams response:', response);
      if (response.success && response.streams) {
        setStreams(response.streams);
      } else {
        setStreams([]);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: 'Error fetching streams',
        description: 'Failed to load Pack365 streams',
        variant: 'destructive',
      });
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesForStream = async (streamName: string) => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllCourses();
      console.log('Courses response:', response);
      if (response.success && response.data) {
        const streamCourses = response.data.filter((course: Pack365Course) => 
          course.stream === streamName
        );
        setCourses(streamCourses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error fetching courses',
        description: 'Failed to load courses for stream',
        variant: 'destructive',
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExamUpload = async () => {
    if (!examFile || !examCourse) {
      toast({
        title: 'Missing information',
        description: 'Please select an Excel file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!fileValidation.isValid) {
      toast({
        title: 'Invalid file',
        description: fileValidation.message,
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', examFile);
      formData.append('courseId', examCourse.courseId || examCourse._id);
      formData.append('maxAttempts', '3');

      console.log('Uploading exam for course:', examCourse.courseId || examCourse._id);

      const response = await fetch('https://triaright.com/api/pack365/exams/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Exam uploaded successfully!',
          description: `Exam file "${examFile.name}" has been uploaded for ${examCourse.courseName}`,
        });

        setShowExamDialog(false);
        setExamFile(null);
        setExamCourse(null);
        setFileValidation({ isValid: true, message: '' });
      } else {
        let errorMessage = result.message || 'Failed to upload exam';
        
        if (errorMessage.includes('30 questions')) {
          errorMessage = '❌ Excel file must contain exactly 30 questions. Please check your file has exactly 30 rows of questions.';
        } else if (errorMessage.includes('Course not found')) {
          errorMessage = 'Course not found. Please refresh the page and try again.';
        } else if (errorMessage.includes('Missing fields')) {
          errorMessage = 'Excel file is missing required columns. Required: Question, Option1, Option2, Option3, Option4, CorrectAnswer, Type';
        } else if (errorMessage.includes('Correct answer')) {
          errorMessage = 'Some questions have incorrect answer format. Correct answer must exactly match one of the options.';
        } else if (errorMessage.includes('Invalid type')) {
          errorMessage = 'Some questions have invalid type. Type must be: easy, medium, or hard';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error uploading exam:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload exam file',
        variant: 'destructive',
      });
    }
  };

  const downloadExamTemplate = () => {
    const templateGuide = `
EXAM UPLOAD TEMPLATE INSTRUCTIONS:

1. Create an Excel file with exactly 30 rows of questions
2. Required columns (exact names):
   - Question
   - Option1
   - Option2  
   - Option3
   - Option4
   - CorrectAnswer
   - Type
   - Description (optional)

3. Column requirements:
   - Question: The question text
   - Option1, Option2, Option3, Option4: Four answer choices
   - CorrectAnswer: Must exactly match one of the options
   - Type: Must be "easy", "medium", or "hard"
   - Description: Optional explanation

4. Example row:
   Question: "What is 2+2?"
   Option1: "1"
   Option2: "2" 
   Option3: "3"
   Option4: "4"
   CorrectAnswer: "4"
   Type: "easy"
   Description: "Basic math question"

5. IMPORTANT: You must have exactly 30 questions (30 data rows + 1 header row = 31 total rows)

6. Save as Excel file (.xlsx or .xls) and upload.
    `;

    const blob = new Blob([templateGuide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam-upload-instructions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Instructions downloaded',
      description: 'Check the downloaded file for Excel template requirements',
    });
  };

  const handleAddStream = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      if (!streamFormData.name || !streamFormData.price) {
        toast({
          title: 'Missing data',
          description: 'Please enter both name and price.',
          variant: 'destructive',
        });
        return;
      }

      const response = await pack365Api.createStream(token, {
        name: streamFormData.name,
        price: Number(streamFormData.price),
        imageFile: streamFormData.imageFile,
      });

      if (response.success) {
        await fetchStreams();
        toast({
          title: 'Stream added successfully',
          description: 'Stream added to Pack365',
        });
        setStreamFormData({ name: '', price: '', imageFile: null });
        setShowStreamDialog(false);
      }
    } catch (error: any) {
      console.error('Error adding stream:', error);
      toast({
        title: 'Error adding stream',
        description: error.response?.data?.message || 'Failed to add stream to Pack365',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStream = async () => {
    const token = localStorage.getItem('token');
    if (!token || !editingStream) {
      toast({
        title: 'Authentication or stream data required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await pack365Api.updateStream(token, editingStream._id, {
        name: streamFormData.name || editingStream.name,
        price: streamFormData.price ? Number(streamFormData.price) : editingStream.price,
        imageFile: streamFormData.imageFile,
      });

      if (response.success) {
        await fetchStreams();
        toast({
          title: 'Stream updated successfully',
          description: 'Stream details have been updated',
        });
        setStreamFormData({ name: '', price: '', imageFile: null });
        setEditingStream(null);
        setShowStreamDialog(false);
      }
    } catch (error: any) {
      console.error('Error updating stream:', error);
      toast({
        title: 'Error updating stream',
        description: error.response?.data?.message || 'Failed to update stream',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication required',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this stream? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await pack365Api.deleteStream(token, streamId);
      if (response.success) {
        await fetchStreams();
        toast({
          title: 'Stream deleted successfully',
          description: 'Stream has been removed from Pack365',
        });
      }
    } catch (error: any) {
      console.error('Error deleting stream:', error);
      toast({
        title: 'Error deleting stream',
        description: error.response?.data?.message || 'Failed to delete stream',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openStreamDialog = (stream?: StreamData) => {
    if (stream) {
      setEditingStream(stream);
      setStreamFormData({
        name: stream.name,
        price: stream.price.toString(),
        imageFile: null
      });
    } else {
      setEditingStream(null);
      setStreamFormData({ name: '', price: '', imageFile: null });
    }
    setShowStreamDialog(true);
  };
                            
  const handleStreamClick = async (stream: StreamData) => {
    setSelectedStream(stream);
    await fetchCoursesForStream(stream.name);
    setViewType('courses');
  };

  const handleBackToStreams = () => {
    setSelectedStream(null);
    setCourses([]);
    setViewType('streams');
  };

  const handleCreateCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    if (!selectedStream) {
      toast({ title: 'Please select a stream first', variant: 'destructive' });
      return;
    }

    try {
      const courseData = {
        ...formData,
        stream: selectedStream.name,
        topics: formData.topics.filter(topic => topic.name.trim() !== '' && topic.duration > 0)
      };
      
      const response = await pack365Api.createCourse(token, courseData);
      if (response.success) {
        toast({ title: 'Course created successfully!' });
        await fetchCoursesForStream(selectedStream.name);
        resetForm();
        setShowDialog(false);
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error creating course',
        description: error.response?.data?.message || 'Failed to create course',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token || !editingCourse) {
      toast({ title: 'Authentication or course ID required', variant: 'destructive' });
      return;
    }

    try {
      const courseData = {
        ...formData,
        topics: formData.topics.filter(topic => topic.name.trim() !== '' && topic.duration > 0)
      };

      const courseId = editingCourse.courseId || editingCourse._id;
      const response = await pack365Api.updateCourse(token, courseId, courseData);
      if (response.success) {
        toast({ title: 'Course updated successfully!' });
        if (selectedStream) {
          await fetchCoursesForStream(selectedStream.name);
        }
        resetForm();
        setShowDialog(false);
        setEditingCourse(null);
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error updating course',
        description: error.response?.data?.message || 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId?: string) => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await pack365Api.deleteCourse(token, courseId);
      if (response.success) {
        toast({ title: 'Course deleted successfully!' });
        if (selectedStream) {
          await fetchCoursesForStream(selectedStream.name);
        }
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error deleting course',
        description: error.response?.data?.message || 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const handleExamDownload = (course: Pack365Course) => {
    if (course.examFile) {
      toast({
        title: 'Download started',
        description: `Downloading exam file: ${course.examFile.originalName}`,
      });
    }
  };

  const openExamDialog = (course: Pack365Course) => {
    setExamCourse(course);
    setExamFile(null);
    setFileValidation({ isValid: true, message: '' });
    setShowExamDialog(true);
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      description: '',
      stream: selectedStream?.name || '',
      topics: [{ name: '', link: '', duration: 0 }],
      courseDocument: null
    });
  };

  const openEditDialog = (course: Pack365Course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      description: course.description || '',
      stream: course.stream,
      topics: course.topics?.length ? course.topics : [{ name: '', link: '', duration: 0 }],
      courseDocument: null
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    resetForm();
    setShowDialog(true);
  };

  const handleViewCourse = (course: Pack365Course) => {
    setViewingCourse(course);
    setShowViewDialog(true);
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { name: '', link: '', duration: 0 }]
    }));
  };

  const updateTopic = (index: number, field: 'name' | 'link' | 'duration', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === index ? { ...topic, [field]: field === 'duration' ? Number(value) : value } : topic
      )
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  if (loading && viewType === 'streams') {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading streams...</p>
      </div>
    );
  }

  // Stream Cards View
  if (viewType === 'streams') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Pack365 Stream Management</h2>
            <p className="text-gray-600">Manage all Pack365 streams and their courses</p>
          </div>
          <Button onClick={() => openStreamDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Stream
          </Button>
        </div>

        {streams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Streams Found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first stream</p>
              <Button onClick={() => openStreamDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Stream
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <Card key={stream._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48">
                  <img 
                    src={stream.imageUrl || '/api/placeholder/400/250'} 
                    alt={`${stream.name} Stream`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        openStreamDialog(stream);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStream(stream._id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{stream.name}</h3>
                    <Badge className="bg-blue-600 text-white mt-1">Pack 365</Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Courses: {stream.courses?.length || 0}</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">₹{stream.price}</div>
                    </div>
                    
                    <Button className="w-full" variant="outline" onClick={() => handleStreamClick(stream)}>
                      Manage Courses
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stream Add/Edit Dialog */}
        <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStream ? 'Edit Stream' : 'Add New Stream'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="streamName">Stream Name</Label>
                <Input
                  id="streamName"
                  value={streamFormData.name}
                  onChange={(e) => setStreamFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter stream name"
                />
              </div>
              <div>
                <Label htmlFor="streamPrice">Price (₹)</Label>
                <Input
                  id="streamPrice"
                  type="number"
                  value={streamFormData.price}
                  onChange={(e) => setStreamFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="streamImage">Stream Image</Label>
                <Input
                  id="streamImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStreamFormData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={editingStream ? handleUpdateStream : handleAddStream}
                  className="flex-1"
                  disabled={!streamFormData.name || !streamFormData.price}
                >
                  {editingStream ? 'Update Stream' : 'Add Stream'}
                </Button>
                <Button variant="outline" onClick={() => setShowStreamDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Courses Management View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToStreams} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Streams
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedStream?.name} Stream Courses</h2>
            <p className="text-gray-600">Manage courses in the {selectedStream?.name} stream</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading courses...</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {courses.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                <p className="text-gray-600 mb-4">No courses available for {selectedStream?.name} stream</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Course
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.courseName}</TableCell>
                      <TableCell className="max-w-xs truncate">{course.description || 'No description'}</TableCell>
                      <TableCell>{course.topics?.length || 0} topics</TableCell>
                      <TableCell>{course.totalDuration || 0} min</TableCell>
                      <TableCell>
                        {course.documentLink ? (
                          <a href={course.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>View Document</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">No document</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewCourse(course)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openExamDialog(course)}>
                            <Upload className="h-4 w-4" />
                          </Button>
                          {/* ✅ NEW: View Exam Button */}
                          <Button variant="outline" size="sm" onClick={() => fetchExamQuestions(course)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.courseId)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : `Create New Course in ${selectedStream?.name} Stream`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                placeholder="Enter course name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter course description"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="courseDocument">Course Document *</Label>
              <Input
                id="courseDocument"
                type="file"
                onChange={(e) => setFormData(prev => ({ ...prev, courseDocument: e.target.files?.[0] || null }))}
                accept="image/*,application/pdf"
                required={!editingCourse}
              />
              <p className="text-xs text-gray-500 mt-1">Required for new courses. Supported formats: images, PDF</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Topics *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Topic
                </Button>
              </div>
              <div className="space-y-2">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Topic name *"
                      value={topic.name}
                      onChange={(e) => updateTopic(index, 'name', e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Topic link (optional)"
                      value={topic.link}
                      onChange={(e) => updateTopic(index, 'link', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min) *"
                      value={topic.duration}
                      onChange={(e) => updateTopic(index, 'duration', e.target.value)}
                      min="0"
                      required
                    />
                    {formData.topics.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeTopic(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                className="flex-1"
                disabled={!formData.courseName || !formData.courseDocument || formData.topics.length === 0}
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {viewingCourse && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{viewingCourse.courseName}</h3>
                <Badge variant="outline" className="capitalize mt-1">{viewingCourse.stream}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 mt-1">{viewingCourse.description || 'No description available'}</p>
              </div>
              {viewingCourse.documentLink && (
                <div>
                  <Label className="text-sm font-medium">Course Document</Label>
                  <div className="mt-1">
                    <a href={viewingCourse.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Topics ({viewingCourse.topics?.length || 0})</Label>
                <div className="mt-1 space-y-2">
                  {viewingCourse.topics?.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{topic.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{topic.duration} min</span>
                        {topic.link && (
                          <a href={topic.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">View Link</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Exam Upload Dialog */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Exam for {examCourse?.courseName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Important Requirements:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong className="text-red-600">Exactly 30 questions</strong> - no more, no less</li>
                    <li>• Required columns: <strong>Question, Option1, Option2, Option3, Option4, CorrectAnswer, Type</strong></li>
                    <li>• <strong>Type</strong> must be: easy, medium, or hard</li>
                    <li>• <strong>CorrectAnswer</strong> must exactly match one of the options</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="examFile">Exam Excel File *</Label>
              <Input
                id="examFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
              />
              {examFile && (
                <div className={`mt-2 text-sm ${fileValidation.isValid ? 'text-green-600' : 'text-red-600'} flex items-center space-x-1`}>
                  {fileValidation.isValid ? '✅' : '❌'} 
                  <span>Selected: {examFile.name} ({(examFile.size / 1024).toFixed(2)} KB) - {fileValidation.message}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={downloadExamTemplate} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Instructions
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={handleExamUpload}
                  disabled={!examFile || !fileValidation.isValid}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExamDialog(false);
                    setExamFile(null);
                    setExamCourse(null);
                    setFileValidation({ isValid: true, message: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ UPDATED: View Exam Dialog with correct field mapping */}
      <Dialog open={showViewExamDialog} onOpenChange={setShowViewExamDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Review: {viewingExamCourse?.courseName}</DialogTitle>
          </DialogHeader>
          
          {loadingExam ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading exam questions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(value: 'all' | 'easy' | 'medium' | 'hard') => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-blue-800">Exam Summary</h4>
                    <p className="text-sm text-blue-600">
                      Total Questions: {examQuestions.length} | 
                      Showing: {filteredExamQuestions.length} |
                      Easy: {examQuestions.filter(q => q.type === 'easy').length} |
                      Medium: {examQuestions.filter(q => q.type === 'medium').length} |
                      Hard: {examQuestions.filter(q => q.type === 'hard').length}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    {viewingExamCourse?.courseName}
                  </Badge>
                </div>
              </div>

              {/* Questions List */}
              {filteredExamQuestions.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No questions found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExamQuestions.map((question, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getDifficultyVariant(question.type)} className="capitalize">
                              {question.type || 'unknown'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                          </div>
                          {question.correctAnswer && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              Correct: {question.correctAnswer}
                            </Badge>
                          )}
                        </div>
                        
                        {/* ✅ UPDATED: Use correct field names from backend schema */}
                        <h4 className="font-semibold mb-3 text-lg">{question.questionText || question.Question}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {(question.options || []).map((option: string, optIndex: number) => (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded border ${
                                question.correctAnswer === option ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}: </span>
                              {option}
                            </div>
                          ))}
                          {/* Fallback for old field names */}
                          {(!question.options || question.options.length === 0) && (
                            <>
                              <div className={`p-2 rounded border ${question.correctAnswer === question.Option1 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                <span className="font-medium">A: </span>{question.Option1}
                              </div>
                              <div className={`p-2 rounded border ${question.correctAnswer === question.Option2 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                <span className="font-medium">B: </span>{question.Option2}
                              </div>
                              <div className={`p-2 rounded border ${question.correctAnswer === question.Option3 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                <span className="font-medium">C: </span>{question.Option3}
                              </div>
                              <div className={`p-2 rounded border ${question.correctAnswer === question.Option4 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                <span className="font-medium">D: </span>{question.Option4}
                              </div>
                            </>
                          )}
                        </div>

                        {question.description && (
                          <div className="bg-gray-50 p-3 rounded border">
                            <span className="font-medium text-sm">Explanation: </span>
                            <span className="text-sm">{question.description}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pack365Management;
