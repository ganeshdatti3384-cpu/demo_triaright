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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'live' | 'recorded';
  price: number;
  isPaid: boolean;
  image: string;
  skills: string[];
  category: string;
  subtopics: SubTopicSchema[];
}

interface SubTopicSchema {
  name: string;
  link: string;
}
const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [isExamUploadOpen, setIsExamUploadOpen] = useState(false);
  const [selectedCourseForExam, setSelectedCourseForExam] = useState<string>('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    type: 'live' as 'live' | 'recorded',
    price: 0,
    isPaid: false,
    image: '',
    skills: '',
    category: '',
    subtopics: [{ name: '', link: '' }],
  });
  const { toast } = useToast();

  // Load courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('adminCourses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Save courses to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem('adminCourses', JSON.stringify(courses));
  }, [courses]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Beginner',
      type: 'live',
      price: 0,
      isPaid: false,
      image: '',
      skills: '',
      category: '',
      subtopics: [{ name: '', link: '' }],
    });
  };

  const handleAddCourse = () => {
    if (!formData.title || !formData.instructor) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      subtopics: formData.subtopics.filter(st => st.name.trim() && st.link.trim()),
    };

    setCourses(prev => [...prev, newCourse]);
    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Course added successfully"
    });
  };

  const handleEditCourse = () => {
    if (!editingCourse || !formData.title || !formData.instructor) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedCourse: Course = {
      ...editingCourse,
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      subtopics: formData.subtopics.filter(st => st.name.trim() && st.link.trim()),
    };

    setCourses(prev => prev.map(course => 
      course.id === editingCourse.id ? updatedCourse : course
    ));
    resetForm();
    setIsEditDialogOpen(false);
    setEditingCourse(null);
    toast({
      title: "Success",
      description: "Course updated successfully"
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast({
      title: "Success",
      description: "Course deleted successfully"
    });
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      type: course.type,
      price: course.price,
      isPaid: course.isPaid,
      image: course.image,
      skills: course.skills.join(', '),
      category: course.category,
      subtopics: course.subtopics
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
const handleAddSubtopic = () => {
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, { name: '', link: '' }],
    }));
  };

  const handleSubtopicChange = (index: number, key: 'name' | 'link', value: string) => {
    const updated = [...formData.subtopics];
    updated[index][key] = value;
    setFormData(prev => ({ ...prev, subtopics: updated }));
  };
  const CourseForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
     <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter course title"
          />
        </div>
        <div>
          <Label htmlFor="instructor">Instructor *</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
            placeholder="Enter instructor name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter course description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="e.g., 8 weeks"
          />
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') =>
              setFormData(prev => ({ ...prev, level: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'live' | 'recorded') =>
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="recorded">Recorded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Web Development"
          />
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="Enter image URL"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
          placeholder="e.g., React, JavaScript, CSS"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPaid"
            checked={formData.isPaid}
            onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
          />
          <Label htmlFor="isPaid">Paid Course</Label>
        </div>
        {formData.isPaid && (
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

      {/* Subtopics Section */}
      <div>
        <Label>Subtopics</Label>
        <div className="space-y-4">
          {formData.subtopics.map((subtopic, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Subtopic Name"
                value={subtopic.name}
                onChange={(e) => handleSubtopicChange(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Subtopic Link"
                value={subtopic.link}
                onChange={(e) => handleSubtopicChange(index, 'link', e.target.value)}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddSubtopic}
          className="mt-2"
        >
          + Add Subtopic
        </Button>
      </div>

      <Button onClick={onSubmit} className="w-full mt-4">
        {submitText}
      </Button>
    </div>
  );

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
              <CourseForm onSubmit={handleAddCourse} submitText="Add Course" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => openExamUpload(course.id)}>
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                <p className="text-sm text-gray-600">Duration: {course.duration}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={course.type === 'live' ? 'default' : 'secondary'}>
                    {course.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant={course.isPaid ? 'destructive' : 'secondary'}>
                    {course.isPaid ? `$${course.price}` : 'FREE'}
                  </Badge>
                </div>
                {course.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {course.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
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
          <CourseForm onSubmit={handleEditCourse} submitText="Update Course" />
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
