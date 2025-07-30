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
import { Plus, Eye, Edit, Trash, Upload, FileText, Download } from 'lucide-react';
import { pack365Api, Pack365Course } from '@/services/api';

const Pack365Management = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Pack365Course | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Pack365Course | null>(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examCourse, setExamCourse] = useState<Pack365Course | null>(null);
  const [examFile, setExamFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    stream: 'IT' as 'IT'  | 'PHARMA' | 'MARKETING' | 'HR' | 'FINANCE',
    topics: [{ name: '', link: '', duration: 0 }],
    courseDocument: null as File | null
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await pack365Api.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error fetching courses',
        description: 'Failed to load Pack365 courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    try {
      const courseData = {
        ...formData,
        topics: formData.topics.filter(topic => topic.name.trim() !== '' && topic.duration > 0)
      };
      console.log(courseData)
      const response = await pack365Api.createCourse(token, courseData);
      if (response.success) {
        toast({ title: 'Course created successfully!' });
        fetchCourses();
        resetForm();
        setShowDialog(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error creating course',
        description: error.response?.data?.message || 'Failed to create course',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token || !editingCourse?._id) {
      toast({ title: 'Authentication or course ID required', variant: 'destructive' });
      return;
    }

    try {
      const courseData = {
        ...formData,
        topics: formData.topics.filter(topic => topic.name.trim() !== '' && topic.duration > 0)
      };

      const response = await pack365Api.updateCourse(token, editingCourse.courseId || editingCourse._id, courseData);
      if (response.success) {
        toast({ title: 'Course updated successfully!' });
        fetchCourses();
        resetForm();
        setShowDialog(false);
        setEditingCourse(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error updating course',
        description: error.response?.data?.message || 'Failed to update course',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
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
        fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: 'Error deleting course',
        description: error.response?.data?.message || 'Failed to delete course',
        variant: 'destructive',
      });
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

    if (!examFile.name.endsWith('.xlsx') && !examFile.name.endsWith('.xls')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel file (.xlsx or .xls)',
        variant: 'destructive',
      });
      return;
    }

    try {
      // For now, we'll simulate the upload and store the file reference
      // In a real implementation, this would upload to a backend service
      const updatedCourses = courses.map(course => 
        course._id === examCourse._id 
          ? { 
              ...course, 
              examFile: { 
                filename: examFile.name, 
                originalName: examFile.name,
                uploadDate: new Date().toISOString() 
              } 
            }
          : course
      );
      setCourses(updatedCourses);

      toast({
        title: 'Exam uploaded successfully!',
        description: `Exam file "${examFile.name}" has been uploaded for ${examCourse.courseName}`,
      });

      setShowExamDialog(false);
      setExamFile(null);
      setExamCourse(null);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload exam file',
        variant: 'destructive',
      });
    }
  };

  const handleExamDownload = (course: Pack365Course) => {
    if (course.examFile) {
      // In a real implementation, this would download from the backend
      toast({
        title: 'Download started',
        description: `Downloading exam file: ${course.examFile.originalName}`,
      });
    }
  };

  const openExamDialog = (course: Pack365Course) => {
    setExamCourse(course);
    setExamFile(null);
    setShowExamDialog(true);
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      description: '',
      stream: 'IT',
      topics: [{ name: '', link: '', duration: 0 }],
      courseDocument: null
    });
  };

  const openEditDialog = (course: Pack365Course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      description: course.description || '',
      stream: course.stream as 'IT' |'PHARMA' | 'MARKETING' | 'HR' | 'FINANCE',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pack365 Course Management</h2>
          <p className="text-gray-600">Manage all Pack365 courses</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Course
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.courseName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {course.stream}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{course.description || 'No description'}</TableCell>
                  <TableCell>{course.topics?.length || 0} topics</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {course.examFile ? (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Uploaded</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExamDownload(course)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No exam</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExamDialog(course)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Exam
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCourse(course)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCourse(course._id!)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                placeholder="Enter course name"
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
              <Label htmlFor="stream">Stream</Label>
              <Select
                value={formData.stream}
                onValueChange={(value: 'IT' | 'PHARMA' | 'MARKETING' | 'HR' | 'FINANCE') => setFormData(prev => ({ ...prev, stream: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="PHARMA">Pharma</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="courseDocument">Course Document</Label>
              <Input
                id="courseDocument"
                type="file"
                onChange={(e) => setFormData(prev => ({ ...prev, courseDocument: e.target.files?.[0] || null }))}
                accept="image/*,application/pdf"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Topics</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Topic
                </Button>
              </div>
              <div className="space-y-2">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Topic name"
                      value={topic.name}
                      onChange={(e) => updateTopic(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Topic link"
                      value={topic.link}
                      onChange={(e) => updateTopic(index, 'link', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min)"
                      value={topic.duration}
                      onChange={(e) => updateTopic(index, 'duration', e.target.value)}
                      min="0"
                    />
                    {formData.topics.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTopic(index)}
                      >
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
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
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
                <Badge variant="outline" className="capitalize mt-1">
                  {viewingCourse.stream}
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 mt-1">{viewingCourse.description || 'No description available'}</p>
              </div>

              {viewingCourse.documentLink && (
                <div>
                  <Label className="text-sm font-medium">Course Document</Label>
                  <div className="mt-1">
                    <img
                      src={viewingCourse.documentLink}
                      alt="Course document"
                      className="max-w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Topics ({viewingCourse.topics?.length || 0})</Label>
                <div className="mt-1 space-y-2">
                  {viewingCourse.topics?.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{topic.name}</span>
                      {topic.link && (
                        <a
                          href={topic.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          View Link
                        </a>
                      )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Course Exam</DialogTitle>
          </DialogHeader>
          {examCourse && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{examCourse.courseName}</h3>
                <Badge variant="outline" className="capitalize mt-1">
                  {examCourse.stream}
                </Badge>
              </div>

              {examCourse.examFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Current Exam File</p>
                      <p className="text-sm text-green-600">{examCourse.examFile.originalName}</p>
                      <p className="text-xs text-green-500">
                        Uploaded: {new Date(examCourse.examFile.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleExamDownload(examCourse)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="examFile">Upload New Exam (Excel file)</Label>
                <Input
                  id="examFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setExamFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: .xlsx, .xls
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleExamUpload}
                  disabled={!examFile}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowExamDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pack365Management;
