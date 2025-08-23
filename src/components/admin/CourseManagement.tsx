import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { courseApi } from '@/services/api';
import { EnhancedCourse } from '@/types/api';

interface SubTopicForm {
  name: string;
  link: string;
  duration: number;
}

interface TopicForm {
  topicName: string;
  topicCount: number;
  subtopics: SubTopicForm[];
  directLink: string;
  examExcelLink: string;
}

// CourseForm component - moved outside to prevent re-rendering issues
const CourseForm: React.FC<{
  formData: {
    courseName: string;
    courseDescription: string;
    instructorName: string;
    totalDuration: number;
    courseType: 'paid' | 'unpaid';
    price: number;
    courseImageLink: string;
    stream: 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability';
    providerName: 'triaright' | 'etv' | 'kalasalingan' | 'instructor';
    courseLanguage: string;
    certificationProvided: 'yes' | 'no';
    additionalInformation: string;
    demoVideoLink: string;
    curriculumDocLink: string;
    curriculum: TopicForm[];
    hasFinalExam: boolean;
    finalExamExcelLink: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleTopicChange: (index: number, key: keyof TopicForm, value: string | number) => void;
  handleSubtopicChange: (topicIndex: number, subtopicIndex: number, key: 'name' | 'link' | 'duration', value: string | number) => void;
  handleAddTopic: () => void;
  handleAddSubtopic: (topicIndex: number) => void;
  onSubmit: () => void;
  submitText: string;
  loading: boolean;
}> = ({ formData, setFormData, handleTopicChange, handleSubtopicChange, handleAddTopic, handleAddSubtopic, onSubmit, submitText, loading }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="courseName">Course Name *</Label>
        <Input
          id="courseName"
          value={formData.courseName}
          onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
          placeholder="Enter course name"
        />
      </div>
      <div>
        <Label htmlFor="instructorName">Instructor Name *</Label>
        <Input
          id="instructorName"
          value={formData.instructorName}
          onChange={(e) => setFormData(prev => ({ ...prev, instructorName: e.target.value }))}
          placeholder="Enter instructor name"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="courseDescription">Course Description</Label>
      <Textarea
        id="courseDescription"
        value={formData.courseDescription}
        onChange={(e) => setFormData(prev => ({ ...prev, courseDescription: e.target.value }))}
        placeholder="Enter course description"
        rows={3}
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="totalDuration">Total Duration (minutes)</Label>
        <Input
          id="totalDuration"
          type="number"
          value={formData.totalDuration}
          onChange={(e) => setFormData(prev => ({ ...prev, totalDuration: parseInt(e.target.value) || 0 }))}
          placeholder="e.g., 480"
        />
      </div>
      <div>
        <Label htmlFor="stream">Stream</Label>
        <Select
          value={formData.stream}
          onValueChange={(value: 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability') =>
            setFormData(prev => ({ ...prev, stream: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select stream" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="it">IT</SelectItem>
            <SelectItem value="nonit">Non-IT</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="management">Management</SelectItem>
            <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
            <SelectItem value="carrerability">Career Ability</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="providerName">Provider</Label>
        <Select
          value={formData.providerName}
          onValueChange={(value: 'triaright' | 'etv' | 'kalasalingan' | 'instructor') =>
            setFormData(prev => ({ ...prev, providerName: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="triaright">Triaright</SelectItem>
            <SelectItem value="etv">ETV</SelectItem>
            <SelectItem value="kalasalingan">Kalasalingan</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="courseLanguage">Course Language</Label>
        <Input
          id="courseLanguage"
          value={formData.courseLanguage}
          onChange={(e) => setFormData(prev => ({ ...prev, courseLanguage: e.target.value }))}
          placeholder="e.g., English"
        />
      </div>
      <div>
        <Label htmlFor="courseImageLink">Course Image URL</Label>
        <Input
          id="courseImageLink"
          value={formData.courseImageLink}
          onChange={(e) => setFormData(prev => ({ ...prev, courseImageLink: e.target.value }))}
          placeholder="Enter image URL"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="demoVideoLink">Demo Video Link *</Label>
      <Input
        id="demoVideoLink"
        value={formData.demoVideoLink}
        onChange={(e) => setFormData(prev => ({ ...prev, demoVideoLink: e.target.value }))}
        placeholder="Enter demo video URL"
      />
    </div>

    <div className="grid grid-cols-2 gap-4 items-center">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPaid"
          checked={formData.courseType === 'paid'}
          onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.checked ? 'paid' : 'unpaid' }))}
        />
        <Label htmlFor="isPaid">Paid Course</Label>
      </div>
      {formData.courseType === 'paid' && (
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
            }
            placeholder="0.00"
          />
        </div>
      )}
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="certificationProvided"
        checked={formData.certificationProvided === 'yes'}
        onChange={(e) => setFormData(prev => ({ ...prev, certificationProvided: e.target.checked ? 'yes' : 'no' }))}
      />
      <Label htmlFor="certificationProvided">Certification Provided</Label>
    </div>

    <div>
      <Label htmlFor="additionalInformation">Additional Information</Label>
      <Textarea
        id="additionalInformation"
        value={formData.additionalInformation}
        onChange={(e) => setFormData(prev => ({ ...prev, additionalInformation: e.target.value }))}
        placeholder="Enter additional information"
        rows={2}
      />
    </div>

    {/* Curriculum Section */}
    <div>
      <Label>Curriculum</Label>
      <div className="space-y-6">
        {formData.curriculum.map((topic, topicIndex) => (
          <div key={topicIndex} className="border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Topic Name"
                value={topic.topicName}
                onChange={(e) => handleTopicChange(topicIndex, 'topicName', e.target.value)}
              />
              <Input
                placeholder="Topic Count"
                type="number"
                value={topic.topicCount}
                onChange={(e) => handleTopicChange(topicIndex, 'topicCount', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subtopics</Label>
              {topic.subtopics.map((subtopic, subtopicIndex) => (
                <div key={subtopicIndex} className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Subtopic Name"
                    value={subtopic.name}
                    onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Subtopic Link"
                    value={subtopic.link}
                    onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'link', e.target.value)}
                  />
                  <Input
                    placeholder="Duration (min)"
                    type="number"
                    value={subtopic.duration}
                    onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSubtopic(topicIndex)}
              >
                + Add Subtopic
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddTopic}
        className="mt-2"
      >
        + Add Topic
      </Button>
    </div>

    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="hasFinalExam"
        checked={formData.hasFinalExam}
        onChange={(e) => setFormData(prev => ({ ...prev, hasFinalExam: e.target.checked }))}
      />
      <Label htmlFor="hasFinalExam">Has Final Exam</Label>
    </div>

    {formData.hasFinalExam && (
      <div>
        <Label htmlFor="finalExamExcelLink">Final Exam Excel Link</Label>
        <Input
          id="finalExamExcelLink"
          value={formData.finalExamExcelLink}
          onChange={(e) => setFormData(prev => ({ ...prev, finalExamExcelLink: e.target.value }))}
          placeholder="Enter final exam excel file URL"
        />
      </div>
    )}

    <Button onClick={onSubmit} className="w-full mt-4" disabled={loading}>
      {loading ? 'Processing...' : submitText}
    </Button>
  </div>
);

const CourseManagement = () => {
  const [courses, setCourses] = useState<EnhancedCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isExamUploadOpen, setIsExamUploadOpen] = useState(false);
  const [selectedCourseForExam, setSelectedCourseForExam] = useState<string>('');
  const [editingCourse, setEditingCourse] = useState<EnhancedCourse | null>(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseDescription: '',
    instructorName: '',
    totalDuration: 0,
    courseType: 'unpaid' as 'paid' | 'unpaid',
    price: 0,
    courseImageLink: '',
    stream: 'it' as 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability',
    providerName: 'triaright' as 'triaright' | 'etv' | 'kalasalingan' | 'instructor',
    courseLanguage: 'English',
    certificationProvided: 'yes' as 'yes' | 'no',
    additionalInformation: '',
    demoVideoLink: '',
    curriculumDocLink: '',
    curriculum: [{ 
      topicName: '', 
      topicCount: 1, 
      subtopics: [{ name: '', link: '', duration: 0 }], 
      directLink: '', 
      examExcelLink: '' 
    }] as TopicForm[],
    hasFinalExam: false,
    finalExamExcelLink: '',
  });
  const { toast } = useToast();

  // Load courses from API on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseApi.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseDescription: '',
      instructorName: '',
      totalDuration: 0,
      courseType: 'unpaid',
      price: 0,
      courseImageLink: '',
      stream: 'it',
      providerName: 'triaright',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      additionalInformation: '',
      demoVideoLink: '',
      curriculumDocLink: '',
      curriculum: [{ 
        topicName: '', 
        topicCount: 1, 
        subtopics: [{ name: '', link: '', duration: 0 }], 
        directLink: '', 
        examExcelLink: '' 
      }] as TopicForm[],
      hasFinalExam: false,
      finalExamExcelLink: '',
    });
  };

  const handleAddCourse = async () => {
    if (!formData.courseName || !formData.instructorName || !formData.demoVideoLink) {
      toast({
        title: "Error",
        description: "Please fill in required fields (Course Name, Instructor, Demo Video)",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive"
        });
        return;
      }

      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'curriculum') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await courseApi.createCourse(token, formDataToSend);
      
      if (response.success) {
        await fetchCourses(); // Refresh courses list
        resetForm();
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: response.message || "Course added successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add course",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !formData.courseName || !formData.instructorName) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive"
        });
        return;
      }

      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'curriculum') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await courseApi.updateCourse(token, editingCourse.courseId!, formDataToSend);
      
      if (response.success) {
        await fetchCourses(); // Refresh courses list
        resetForm();
        setIsEditDialogOpen(false);
        setEditingCourse(null);
        toast({
          title: "Success",
          description: response.message || "Course updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update course",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive"
        });
        return;
      }

      const response = await courseApi.deleteCourse(token, courseId);
      
      if (response.success) {
        await fetchCourses(); // Refresh courses list
        toast({
          title: "Success",
          description: response.message || "Course deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete course",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (course: EnhancedCourse) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      instructorName: course.instructorName,
      totalDuration: course.totalDuration,
      courseType: course.courseType,
      price: course.price || 0,
      courseImageLink: course.courseImageLink,
      stream: course.stream,
      providerName: course.providerName,
      courseLanguage: course.courseLanguage,
      certificationProvided: course.certificationProvided,
      additionalInformation: course.additionalInformation || '',
      demoVideoLink: course.demoVideoLink,
      curriculumDocLink: course.curriculumDocLink || '',
      curriculum: course.curriculum.map(topic => ({
        topicName: topic.topicName,
        topicCount: topic.topicCount,
        subtopics: topic.subtopics,
        directLink: topic.directLink || '',
        examExcelLink: topic.examExcelLink || ''
      })) as TopicForm[],
      hasFinalExam: course.hasFinalExam || false,
      finalExamExcelLink: course.finalExamExcelLink || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Excel Upload",
        description: `File ${file.name} uploaded successfully. Processing...`
      });
      setIsExcelUploadOpen(false);
    }
  };

  const handleExamUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCourseForExam) {
      toast({
        title: "Exam Upload",
        description: `Exam questions for course uploaded successfully from ${file.name}`
      });
      setIsExamUploadOpen(false);
      setSelectedCourseForExam('');
    }
  };

  const openExamUpload = (courseId: string) => {
    setSelectedCourseForExam(courseId);
    setIsExamUploadOpen(true);
  };
const handleAddSubtopic = (topicIndex: number) => {
    const updated = [...formData.curriculum];
    updated[topicIndex].subtopics.push({ name: '', link: '', duration: 0 });
    setFormData(prev => ({ ...prev, curriculum: updated }));
  };

  const handleSubtopicChange = (topicIndex: number, subtopicIndex: number, key: 'name' | 'link' | 'duration', value: string | number) => {
    const updated = [...formData.curriculum];
    if (key === 'duration') {
      updated[topicIndex].subtopics[subtopicIndex][key] = value as number;
    } else {
      updated[topicIndex].subtopics[subtopicIndex][key] = value as string;
    }
    setFormData(prev => ({ ...prev, curriculum: updated }));
  };

  const handleAddTopic = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, { 
        topicName: '', 
        topicCount: 1, 
        subtopics: [{ name: '', link: '', duration: 0 }], 
        directLink: '', 
        examExcelLink: '' 
      }]
    }));
  };

  const handleTopicChange = (index: number, key: keyof TopicForm, value: string | number) => {
    const updated = [...formData.curriculum];
    if (key === 'topicCount') {
      (updated[index] as any)[key] = value as number;
    } else if (key === 'directLink' || key === 'examExcelLink') {
      (updated[index] as any)[key] = value as string;
    } else if (key === 'topicName') {
      (updated[index] as any)[key] = value as string;
    }
    setFormData(prev => ({ ...prev, curriculum: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <div className="flex space-x-2">
          <Dialog open={isExcelUploadOpen} onOpenChange={setIsExcelUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Upload Courses via Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Courses via Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">Select Excel File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Upload an Excel file with columns: Title, Description, Instructor, Duration, Level, Type, Price, Category, Skills
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>
              <CourseForm 
                formData={formData}
                setFormData={setFormData}
                handleTopicChange={handleTopicChange}
                handleSubtopicChange={handleSubtopicChange}
                handleAddTopic={handleAddTopic}
                handleAddSubtopic={handleAddSubtopic}
                onSubmit={handleAddCourse} 
                submitText="Add Course"
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.courseId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.courseName}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => openExamUpload(course.courseId!)}>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.courseId!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Instructor: {course.instructorName}</p>
                <p className="text-sm text-gray-600">Duration: {course.totalDuration} minutes</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={course.stream === 'it' ? 'default' : 'secondary'}>
                    {course.stream.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{course.providerName}</Badge>
                  <Badge variant={course.courseType === 'paid' ? 'destructive' : 'secondary'}>
                    {course.courseType === 'paid' ? `$${course.price}` : 'FREE'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">{course.courseDescription}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Loading courses...</p>
          </CardContent>
        </Card>
      )}

      {!loading && courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No courses added yet. Click "Add Course" to get started.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <CourseForm 
            formData={formData}
            setFormData={setFormData}
            handleTopicChange={handleTopicChange}
            handleSubtopicChange={handleSubtopicChange}
            handleAddTopic={handleAddTopic}
            handleAddSubtopic={handleAddSubtopic}
            onSubmit={handleEditCourse} 
            submitText="Update Course"
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isExamUploadOpen} onOpenChange={setIsExamUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Exam Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exam-excel-file">Select Excel File with Questions</Label>
              <Input
                id="exam-excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExamUpload}
              />
            </div>
            <p className="text-sm text-gray-600">
              Excel should contain columns: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
