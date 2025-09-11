import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, FileSpreadsheet, X } from 'lucide-react';
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

// Enhanced CourseForm component with proper file uploads matching backend requirements
const CourseForm: React.FC<{
  formData: {
    courseName: string;
    courseDescription: string;
    instructorName: string;
    totalDuration: number;
    courseType: 'paid' | 'unpaid';
    price: number;
    stream: 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability';
    providerName: 'triaright' | 'etv' | 'kalasalingan' | 'instructor';
    courseLanguage: string;
    certificationProvided: 'yes' | 'no';
    additionalInformation: string;
    demoVideoLink: string;
    curriculum: TopicForm[];
    hasFinalExam: boolean;
  };
  files: {
    courseImage: File | null;
    curriculumDoc: File | null;
    finalExamExcel: File | null;
    topicExams: Record<string, File | null>;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setFiles: React.Dispatch<React.SetStateAction<any>>;
  handleTopicChange: (index: number, key: keyof TopicForm, value: string | number) => void;
  handleSubtopicChange: (topicIndex: number, subtopicIndex: number, key: 'name' | 'link' | 'duration', value: string | number) => void;
  handleAddTopic: () => void;
  handleAddSubtopic: (topicIndex: number) => void;
  handleRemoveTopic: (index: number) => void;
  onSubmit: () => void;
  submitText: string;
  loading: boolean;
}> = ({ 
  formData, 
  files,
  setFormData, 
  setFiles,
  handleTopicChange, 
  handleSubtopicChange, 
  handleAddTopic, 
  handleAddSubtopic, 
  handleRemoveTopic,
  onSubmit, 
  submitText, 
  loading 
}) => (
  <div className="space-y-6">
    {/* Basic Information */}
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
      <Label htmlFor="courseDescription">Course Description *</Label>
      <Textarea
        id="courseDescription"
        value={formData.courseDescription}
        onChange={(e) => setFormData(prev => ({ ...prev, courseDescription: e.target.value }))}
        placeholder="Enter course description"
        rows={3}
      />
    </div>

    <div>
      <Label htmlFor="demoVideoLink">Demo Video Link *</Label>
      <Input
        id="demoVideoLink"
        value={formData.demoVideoLink}
        onChange={(e) => setFormData(prev => ({ ...prev, demoVideoLink: e.target.value }))}
        placeholder="Enter demo video URL (YouTube, Vimeo, etc.)"
      />
    </div>

    {/* Course Details */}
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="stream">Stream *</Label>
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
        <Label htmlFor="providerName">Provider *</Label>
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
      <div>
        <Label htmlFor="courseLanguage">Language *</Label>
        <Input
          id="courseLanguage"
          value={formData.courseLanguage}
          onChange={(e) => setFormData(prev => ({ ...prev, courseLanguage: e.target.value }))}
          placeholder="e.g., English"
        />
      </div>
    </div>

    {/* Pricing */}
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
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            min="0"
          />
        </div>
      )}
    </div>

    {/* Certification */}
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="certificationProvided"
        checked={formData.certificationProvided === 'yes'}
        onChange={(e) => setFormData(prev => ({ ...prev, certificationProvided: e.target.checked ? 'yes' : 'no' }))}
      />
      <Label htmlFor="certificationProvided">Certification Provided</Label>
    </div>

    {/* File Uploads */}
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium">File Uploads</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="courseImage">Course Image *</Label>
          <Input
            id="courseImage"
            type="file"
            accept="image/*"
            onChange={(e) => setFiles(prev => ({ ...prev, courseImage: e.target.files?.[0] || null }))}
          />
          {files.courseImage && <p className="text-sm text-green-600">✓ {files.courseImage.name}</p>}
        </div>
        <div>
          <Label htmlFor="curriculumDoc">Curriculum Document</Label>
          <Input
            id="curriculumDoc"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFiles(prev => ({ ...prev, curriculumDoc: e.target.files?.[0] || null }))}
          />
          {files.curriculumDoc && <p className="text-sm text-green-600">✓ {files.curriculumDoc.name}</p>}
        </div>
      </div>
    </div>

    {/* Curriculum Section */}
    <div className="space-y-4 border-t pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Curriculum *</h3>
        <Button type="button" variant="outline" onClick={handleAddTopic}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>
      
      {formData.curriculum.map((topic, topicIndex) => (
        <div key={topicIndex} className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <Label>Topic {topicIndex + 1}</Label>
            {formData.curriculum.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveTopic(topicIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Topic Name *"
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
          
          {/* Topic Exam Upload */}
          <div>
            <Label>Topic Exam Excel (10 questions) *</Label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFiles(prev => ({
                  ...prev,
                  topicExams: { ...prev.topicExams, [topic.topicName]: file }
                }));
              }}
            />
            {files.topicExams[topic.topicName] && (
              <p className="text-sm text-green-600">✓ {files.topicExams[topic.topicName]?.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Excel format: Question | Option1 | Option2 | Option3 | Option4 | CorrectAnswer | Type | Description
            </p>
          </div>

          {/* Subtopics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Subtopics</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSubtopic(topicIndex)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subtopic
              </Button>
            </div>
            {topic.subtopics.map((subtopic, subtopicIndex) => (
              <div key={subtopicIndex} className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Subtopic Name *"
                  value={subtopic.name}
                  onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'name', e.target.value)}
                />
                <Input
                  placeholder="Video/Content Link *"
                  value={subtopic.link}
                  onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'link', e.target.value)}
                />
                <Input
                  placeholder="Duration (minutes) *"
                  type="number"
                  value={subtopic.duration}
                  onChange={(e) => handleSubtopicChange(topicIndex, subtopicIndex, 'duration', parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Final Exam */}
    <div className="border-t pt-4">
      <div className="flex items-center space-x-2 mb-4">
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
          <Label htmlFor="finalExamExcel">Final Exam Excel *</Label>
          <Input
            id="finalExamExcel"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFiles(prev => ({ ...prev, finalExamExcel: e.target.files?.[0] || null }))}
          />
          {files.finalExamExcel && <p className="text-sm text-green-600">✓ {files.finalExamExcel.name}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Excel format: Question | Option1 | Option2 | Option3 | Option4 | CorrectAnswer | Type | Description
          </p>
        </div>
      )}
    </div>

    {/* Additional Information */}
    <div>
      <Label htmlFor="additionalInformation">Additional Information</Label>
      <Textarea
        id="additionalInformation"
        value={formData.additionalInformation}
        onChange={(e) => setFormData(prev => ({ ...prev, additionalInformation: e.target.value }))}
        placeholder="Enter additional information about the course"
        rows={2}
      />
    </div>

    <Button onClick={onSubmit} className="w-full mt-4" disabled={loading}>
      {loading ? 'Creating Course...' : submitText}
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<EnhancedCourse | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    courseName: '',
    courseDescription: '',
    instructorName: '',
    totalDuration: 0,
    courseType: 'unpaid' as 'paid' | 'unpaid',
    price: 0,
    stream: 'it' as 'it' | 'nonit' | 'finance' | 'management' | 'pharmaceuticals' | 'carrerability',
    providerName: 'triaright' as 'triaright' | 'etv' | 'kalasalingan' | 'instructor',
    courseLanguage: 'English',
    certificationProvided: 'yes' as 'yes' | 'no',
    additionalInformation: '',
    demoVideoLink: '',
    curriculum: [{ 
      topicName: '', 
      topicCount: 1, 
      subtopics: [{ name: '', link: '', duration: 0 }], 
      directLink: '', 
      examExcelLink: '' 
    }] as TopicForm[],
    hasFinalExam: false,
  });

  // File upload state
  const [files, setFiles] = useState({
    courseImage: null as File | null,
    curriculumDoc: null as File | null,
    finalExamExcel: null as File | null,
    topicExams: {} as Record<string, File | null>
  });

  const { toast } = useToast();

  // Load courses from API on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const data = await courseApi.getAllCourses();
      console.log('Course data:', data);
      setCourses(data);
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
      stream: 'it',
      providerName: 'triaright',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      additionalInformation: '',
      demoVideoLink: '',
      curriculum: [{ 
        topicName: '', 
        topicCount: 1, 
        subtopics: [{ name: '', link: '', duration: 0 }], 
        directLink: '', 
        examExcelLink: '' 
      }] as TopicForm[],
      hasFinalExam: false,
    });
    setFiles({
      courseImage: null,
      curriculumDoc: null,
      finalExamExcel: null,
      topicExams: {}
    });
  };

  const handleAddCourse = async () => {
    // Validation
    if (!formData.courseName || !formData.instructorName || !formData.demoVideoLink) {
      toast({
        title: "Error",
        description: "Please fill in required fields (Course Name, Instructor, Demo Video)",
        variant: "destructive"
      });
      return;
    }

    if (!files.courseImage) {
      toast({
        title: "Error",
        description: "Course image is required",
        variant: "destructive"
      });
      return;
    }

    // Validation for curriculum structure
    for (const topic of formData.curriculum) {
      if (!topic.topicName.trim()) {
        toast({
          title: "Error",
          description: "All topics must have a name",
          variant: "destructive"
        });
        return;
      }

      // Check if topic has at least one subtopic with valid data
      if (topic.subtopics.length === 0) {
        toast({
          title: "Error",
          description: `Topic "${topic.topicName}" must have at least one subtopic`,
          variant: "destructive"
        });
        return;
      }

      // Validate each subtopic
      for (const subtopic of topic.subtopics) {
        if (!subtopic.name.trim()) {
          toast({
            title: "Error",
            description: `All subtopics in "${topic.topicName}" must have a name`,
            variant: "destructive"
          });
          return;
        }
        if (!subtopic.link.trim()) {
          toast({
            title: "Error",
            description: `All subtopics in "${topic.topicName}" must have a video/content link`,
            variant: "destructive"
          });
          return;
        }
        if (!subtopic.duration || subtopic.duration <= 0) {
          toast({
            title: "Error",
            description: `All subtopics in "${topic.topicName}" must have a valid duration`,
            variant: "destructive"
          });
          return;
        }
      }
    }

    // Check if all topics have exam files
    for (const topic of formData.curriculum) {
      if (topic.topicName && !files.topicExams[topic.topicName]) {
        toast({
          title: "Error",
          description: `Topic exam excel file is required for "${topic.topicName}"`,
          variant: "destructive"
        });
        return;
      }
    }

    if (formData.hasFinalExam && !files.finalExamExcel) {
      toast({
        title: "Error", 
        description: "Final exam excel file is required when 'Has Final Exam' is checked",
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

      // Create FormData with all required fields matching backend expectations
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('courseName', formData.courseName);
      formDataToSend.append('courseDescription', formData.courseDescription);
      formDataToSend.append('instructorName', formData.instructorName);
      formDataToSend.append('demoVideoLink', formData.demoVideoLink);
      formDataToSend.append('courseType', formData.courseType);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stream', formData.stream);
      formDataToSend.append('providerName', formData.providerName);
      formDataToSend.append('courseLanguage', formData.courseLanguage);
      formDataToSend.append('certificationProvided', formData.certificationProvided);
      formDataToSend.append('additionalInformation', formData.additionalInformation);
      formDataToSend.append('hasFinalExam', formData.hasFinalExam.toString());
      
      // Add curriculum as JSON string
      formDataToSend.append('curriculum', JSON.stringify(formData.curriculum));
      
      // Add required files
      if (files.courseImage) {
        formDataToSend.append('courseImage', files.courseImage);
      }
      
      if (files.curriculumDoc) {
        formDataToSend.append('curriculumDoc', files.curriculumDoc);
      }
      
      if (formData.hasFinalExam && files.finalExamExcel) {
        formDataToSend.append('finalExamExcel', files.finalExamExcel);
      }
      
      // Add topic-wise exam files with correct field names
      formData.curriculum.forEach(topic => {
        if (topic.topicName && files.topicExams[topic.topicName]) {
          formDataToSend.append(`topicExam_${topic.topicName}`, files.topicExams[topic.topicName]!);
        }
      });

      const response = await courseApi.createCourse(token, formDataToSend);
      
      if (response.success) {
        await fetchCourses(); // Refresh courses list
        resetForm();
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: response.message || "Course created successfully with all exam files"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create course",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create course",
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

      const response = await courseApi.updateCourse(token, editingCourse._id!, formDataToSend);
      
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

  const openDeleteDialog = (course: EnhancedCourse) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
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

      const response = await courseApi.deleteCourse(token, courseToDelete._id!);
      
      if (response.success) {
        await fetchCourses(); // Refresh courses list
        setIsDeleteDialogOpen(false);
        setCourseToDelete(null);
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
      stream: course.stream,
      providerName: course.providerName,
      courseLanguage: course.courseLanguage,
      certificationProvided: course.certificationProvided,
      additionalInformation: course.additionalInformation || '',
      demoVideoLink: course.demoVideoLink,
      curriculum: course.curriculum.map(topic => ({
        topicName: topic.topicName,
        topicCount: topic.topicCount,
        subtopics: topic.subtopics,
        directLink: topic.directLink || '',
        examExcelLink: topic.examExcelLink || ''
      })) as TopicForm[],
      hasFinalExam: course.hasFinalExam || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleRemoveTopic = (index: number) => {
    const updated = formData.curriculum.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, curriculum: updated }));
    
    // Also remove the corresponding topic exam file if it exists
    const topicName = formData.curriculum[index]?.topicName;
    if (topicName && files.topicExams[topicName]) {
      const updatedTopicExams = { ...files.topicExams };
      delete updatedTopicExams[topicName];
      setFiles(prev => ({ ...prev, topicExams: updatedTopicExams }));
    }
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
                files={files}
                setFormData={setFormData}
                setFiles={setFiles}
                handleTopicChange={handleTopicChange}
                handleSubtopicChange={handleSubtopicChange}
                handleAddTopic={handleAddTopic}
                handleAddSubtopic={handleAddSubtopic}
                handleRemoveTopic={handleRemoveTopic}
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
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(course)}>
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
            files={files}
            setFormData={setFormData}
            setFiles={setFiles}
            handleTopicChange={handleTopicChange}
            handleSubtopicChange={handleSubtopicChange}
            handleAddTopic={handleAddTopic}
            handleAddSubtopic={handleAddSubtopic}
            handleRemoveTopic={handleRemoveTopic}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.courseName}"? This action cannot be undone.
              All enrolled students, course content, and exam data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setCourseToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseManagement;
