// components/admin/APCourseManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Video, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
  stream: string;
}

interface APCourse {
  _id: string;
  courseId: string;
  title: string;
  stream: string;
  totalDuration: number;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: string;
  hasFinalExam: boolean;
  internshipRef: {
    _id: string;
    title: string;
    companyName: string;
  };
  curriculum: Topic[];
  createdAt: string;
}

interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

const APCourseManagement = () => {
  const [courses, setCourses] = useState<APCourse[]>([]);
  const [internships, setInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<APCourse | null>(null);
  const [formData, setFormData] = useState({
    internshipId: '',
    title: '',
    stream: '',
    providerName: 'triaright',
    instructorName: '',
    courseLanguage: 'English',
    certificationProvided: 'yes',
    hasFinalExam: false,
    curriculum: [] as Topic[]
  });
  const [currentTopic, setCurrentTopic] = useState<Topic>({
    topicName: '',
    topicCount: 0,
    subtopics: []
  });
  const [currentSubtopic, setCurrentSubtopic] = useState<Subtopic>({
    name: '',
    link: '',
    duration: 0
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInternships();
    fetchCourses();
  }, []);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/ap-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInternships(data.internships);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internships',
        variant: 'destructive'
      });
    }
  };

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/apcourses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found. Please login again.',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    if (!formData.internshipId) {
      toast({
        title: 'Error',
        description: 'Please select an internship',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter course title',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.stream.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter stream',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.instructorName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter instructor name',
        variant: 'destructive'
      });
      return;
    }

    if (formData.curriculum.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one topic with subtopics',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('internshipId', formData.internshipId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('stream', formData.stream);
      formDataToSend.append('providerName', formData.providerName);
      formDataToSend.append('instructorName', formData.instructorName);
      formDataToSend.append('courseLanguage', formData.courseLanguage);
      formDataToSend.append('certificationProvided', formData.certificationProvided);
      formDataToSend.append('hasFinalExam', formData.hasFinalExam.toString());
      formDataToSend.append('curriculum', JSON.stringify(formData.curriculum));

      // Add topic exam files
      formData.curriculum.forEach((topic) => {
        const examFileInput = document.getElementById(`topicExam_${topic.topicName}`) as HTMLInputElement;
        if (examFileInput?.files?.[0]) {
          formDataToSend.append(`topicExam_${topic.topicName}`, examFileInput.files[0]);
        }
      });

      // Add final exam file if exists
      if (formData.hasFinalExam) {
        const finalExamInput = document.getElementById('finalExam') as HTMLInputElement;
        if (finalExamInput?.files?.[0]) {
          formDataToSend.append('finalExam', finalExamInput.files[0]);
        }
      }

      console.log('Creating course with data:', {
        internshipId: formData.internshipId,
        title: formData.title,
        stream: formData.stream,
        curriculum: formData.curriculum
      });

      const response = await fetch('/api/internships/apcourses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('Create course response:', data);

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Course created successfully with exams'
        });
        setShowCreateDialog(false);
        resetForm();
        fetchCourses();
      } else {
        throw new Error(data.message || `Failed to create course: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apcourses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          stream: formData.stream,
          providerName: formData.providerName,
          instructorName: formData.instructorName,
          courseLanguage: formData.courseLanguage,
          certificationProvided: formData.certificationProvided,
          hasFinalExam: formData.hasFinalExam,
          curriculum: formData.curriculum
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Course updated successfully'
        });
        setShowEditDialog(false);
        resetForm();
        fetchCourses();
      } else {
        throw new Error(data.message || 'Failed to update course');
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course',
        variant: 'destructive'
      });
    }
  };

  const deleteCourse = async () => {
    if (!selectedCourse) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apcourses/${selectedCourse._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Course deleted successfully'
        });
        setShowDeleteDialog(false);
        setSelectedCourse(null);
        fetchCourses();
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        variant: 'destructive'
      });
    }
  };

  const addSubtopic = () => {
    if (!currentSubtopic.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter subtopic name',
        variant: 'destructive'
      });
      return;
    }

    if (!currentSubtopic.link.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter video link',
        variant: 'destructive'
      });
      return;
    }

    if (!currentSubtopic.duration || currentSubtopic.duration <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid duration',
        variant: 'destructive'
      });
      return;
    }

    setCurrentTopic(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, { ...currentSubtopic }],
      topicCount: prev.subtopics.length + 1
    }));

    setCurrentSubtopic({
      name: '',
      link: '',
      duration: 0
    });
  };

  const addTopic = () => {
    if (!currentTopic.topicName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter topic name',
        variant: 'destructive'
      });
      return;
    }

    if (currentTopic.subtopics.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one subtopic',
        variant: 'destructive'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, { ...currentTopic }]
    }));

    setCurrentTopic({
      topicName: '',
      topicCount: 0,
      subtopics: []
    });
  };

  const removeSubtopic = (index: number) => {
    setCurrentTopic(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index),
      topicCount: prev.subtopics.length - 1
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      internshipId: '',
      title: '',
      stream: '',
      providerName: 'triaright',
      instructorName: '',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      hasFinalExam: false,
      curriculum: []
    });
    setCurrentTopic({
      topicName: '',
      topicCount: 0,
      subtopics: []
    });
    setCurrentSubtopic({
      name: '',
      link: '',
      duration: 0
    });
    setSelectedCourse(null);
  };

  const handleCreateDialogOpen = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleViewCourse = (course: APCourse) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const handleEditCourse = (course: APCourse) => {
    setSelectedCourse(course);
    setFormData({
      internshipId: course.internshipRef._id,
      title: course.title,
      stream: course.stream,
      providerName: course.providerName,
      instructorName: course.instructorName,
      courseLanguage: course.courseLanguage,
      certificationProvided: course.certificationProvided,
      hasFinalExam: course.hasFinalExam,
      curriculum: course.curriculum
    });
    setShowEditDialog(true);
  };

  const handleDeleteCourse = (course: APCourse) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const calculateTotalDuration = (curriculum: Topic[]) => {
    return curriculum.reduce((total, topic) => {
      return total + topic.subtopics.reduce((topicTotal, subtopic) => topicTotal + subtopic.duration, 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AP Course Management</h2>
          <p className="text-gray-600">Manage course content for AP internships</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateDialogOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add course content with topics, subtopics, and exams for AP internship.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createCourse} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Internship *</label>
                  <Select
                    value={formData.internshipId}
                    onValueChange={(value) => setFormData({...formData, internshipId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select internship" />
                    </SelectTrigger>
                    <SelectContent>
                      {internships.map((internship) => (
                        <SelectItem key={internship._id} value={internship._id}>
                          {internship.title} - {internship.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter course title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream *</label>
                  <Input
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor Name *</label>
                  <Input
                    value={formData.instructorName}
                    onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                    placeholder="Enter instructor name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <Select
                    value={formData.providerName}
                    onValueChange={(value) => setFormData({...formData, providerName: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triaright">Triaright Education</SelectItem>
                      <SelectItem value="etv">ETV</SelectItem>
                      <SelectItem value="kalasalingan">Kalasalingan</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Language</label>
                  <Select
                    value={formData.courseLanguage}
                    onValueChange={(value) => setFormData({...formData, courseLanguage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Telugu">Telugu</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certification</label>
                  <Select
                    value={formData.certificationProvided}
                    onValueChange={(value: 'yes' | 'no') => setFormData({...formData, certificationProvided: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Final Exam</label>
                  <Select
                    value={formData.hasFinalExam ? 'yes' : 'no'}
                    onValueChange={(value) => setFormData({...formData, hasFinalExam: value === 'yes'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Curriculum Builder */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Curriculum Builder</h3>
                
                {/* Current Topic */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Topic</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic Name *</label>
                      <Input
                        value={currentTopic.topicName}
                        onChange={(e) => setCurrentTopic({...currentTopic, topicName: e.target.value})}
                        placeholder="e.g., Introduction to Programming"
                      />
                    </div>

                    {/* Subtopic Builder */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Add Subtopic</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium">Subtopic Name *</label>
                          <Input
                            value={currentSubtopic.name}
                            onChange={(e) => setCurrentSubtopic({...currentSubtopic, name: e.target.value})}
                            placeholder="e.g., Variables and Data Types"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Video Link *</label>
                          <Input
                            value={currentSubtopic.link}
                            onChange={(e) => setCurrentSubtopic({...currentSubtopic, link: e.target.value})}
                            placeholder="YouTube/Vimeo URL"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Duration (minutes) *</label>
                          <Input
                            type="number"
                            value={currentSubtopic.duration}
                            onChange={(e) => setCurrentSubtopic({...currentSubtopic, duration: Number(e.target.value)})}
                            min="1"
                            placeholder="e.g., 30"
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={addSubtopic} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Subtopic
                      </Button>
                    </div>

                    {/* Current Topic Subtopics */}
                    {currentTopic.subtopics.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Current Subtopics ({currentTopic.subtopics.length})</h4>
                        <div className="space-y-2">
                          {currentTopic.subtopics.map((subtopic, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="font-medium">{subtopic.name}</span>
                                <span className="text-sm text-gray-600 ml-2">({subtopic.duration} mins)</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubtopic(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button type="button" onClick={addTopic} className="w-full">
                          Add Topic to Curriculum
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Curriculum Preview */}
                {formData.curriculum.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Curriculum Preview ({formData.curriculum.length} topics, {calculateTotalDuration(formData.curriculum)} minutes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {formData.curriculum.map((topic, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{topic.topicName}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTopic(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {topic.subtopics.map((subtopic, subIndex) => (
                                <div key={subIndex} className="flex justify-between text-sm">
                                  <span>{subtopic.name}</span>
                                  <span className="text-gray-600">{subtopic.duration} mins</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <label className="text-sm font-medium">Topic Exam (Excel)</label>
                              <Input
                                id={`topicExam_${topic.topicName}`}
                                type="file"
                                accept=".xlsx,.xls"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Final Exam Upload */}
                {formData.hasFinalExam && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Final Exam</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Final Exam Excel File (60 questions)</label>
                        <Input
                          id="finalExam"
                          type="file"
                          accept=".xlsx,.xls"
                        />
                        <p className="text-sm text-gray-600">
                          Upload Excel file with 60 questions for final exam
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AP Courses</CardTitle>
          <CardDescription>
            Manage course content for AP exclusive internships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-mono text-sm">{course.courseId}</TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.internshipRef.title}</div>
                        <div className="text-sm text-gray-600">{course.internshipRef.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.stream}</TableCell>
                    <TableCell>{course.totalDuration} mins</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {course.curriculum.length} topics
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(course.createdAt).toLocaleDateString()}
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
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No courses found. Create your first course to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Complete course information and curriculum
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Course Title</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Course ID</h4>
                  <p className="text-sm text-gray-600 font-mono">{selectedCourse.courseId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Internship</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.internshipRef.title}</p>
                  <p className="text-sm text-gray-600">{selectedCourse.internshipRef.companyName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Stream</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.stream}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Instructor</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.instructorName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Provider</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.providerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Total Duration</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.totalDuration} minutes</p>
                </div>
                <div>
                  <h4 className="font-semibold">Language</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.courseLanguage}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Curriculum</h4>
                <div className="space-y-4">
                  {selectedCourse.curriculum.map((topic, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{topic.topicName}</CardTitle>
                        <CardDescription>
                          {topic.subtopics.length} subtopics • {topic.subtopics.reduce((sum, st) => sum + st.duration, 0)} minutes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {topic.subtopics.map((subtopic, subIndex) => (
                            <div key={subIndex} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <span className="font-medium">{subtopic.name}</span>
                                <div className="text-sm text-gray-600">{subtopic.link}</div>
                              </div>
                              <Badge variant="outline">{subtopic.duration} mins</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course content and curriculum
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateCourse} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stream *</label>
                <Input
                  value={formData.stream}
                  onChange={(e) => setFormData({...formData, stream: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor Name *</label>
                <Input
                  value={formData.instructorName}
                  onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Select
                  value={formData.providerName}
                  onValueChange={(value) => setFormData({...formData, providerName: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triaright">Triaright Education</SelectItem>
                    <SelectItem value="etv">ETV</SelectItem>
                    <SelectItem value="kalasalingan">Kalasalingan</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Language</label>
                <Select
                  value={formData.courseLanguage}
                  onValueChange={(value) => setFormData({...formData, courseLanguage: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification</label>
                <Select
                  value={formData.certificationProvided}
                  onValueChange={(value: 'yes' | 'no') => setFormData({...formData, certificationProvided: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Final Exam</label>
              <Select
                value={formData.hasFinalExam ? 'yes' : 'no'}
                onValueChange={(value) => setFormData({...formData, hasFinalExam: value === 'yes'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Curriculum Preview for Edit */}
            {formData.curriculum.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Curriculum</h3>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Current Curriculum ({formData.curriculum.length} topics, {calculateTotalDuration(formData.curriculum)} minutes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.curriculum.map((topic, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{topic.topicName}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {topic.subtopics.map((subtopic, subIndex) => (
                              <div key={subIndex} className="flex justify-between text-sm">
                                <span>{subtopic.name}</span>
                                <span className="text-gray-600">{subtopic.duration} mins</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the course "{selectedCourse?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCourse}>
              Delete Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APCourseManagement;
