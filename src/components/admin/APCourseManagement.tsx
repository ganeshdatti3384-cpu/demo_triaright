// components/admin/APCourseManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, FileText, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APCourse {
  _id: string;
  title: string;
  stream: string;
  providerName: 'triaright' | 'etv' | 'kalasalingan' | 'instructor';
  instructorName: string;
  courseLanguage: string;
  certificationProvided: 'yes' | 'no';
  hasFinalExam: boolean;
  totalDuration: number;
  curriculum: CurriculumTopic[];
  exams: string[];
  internshipRef: {
    _id: string;
    title: string;
    companyName: string;
  };
  curriculumDocLink?: string;
  finalExamExcelLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface CurriculumTopic {
  topicName: string;
  topicCount: number;
  subtopics: Subtopic[];
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
}

const APCourseManagement = () => {
  const [courses, setCourses] = useState<APCourse[]>([]);
  const [internships, setInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<APCourse | null>(null);
  const [formData, setFormData] = useState({
    internshipId: '',
    title: '',
    curriculum: [] as CurriculumTopic[],
    stream: '',
    providerName: 'triaright' as const,
    instructorName: '',
    courseLanguage: 'English',
    certificationProvided: 'yes' as const,
    hasFinalExam: false
  });
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchInternships();
  }, []);

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
    }
  };

  const handleFileChange = (fieldName: string, file: File) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const formDataToSend = new FormData();
      
      // Append basic form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'curriculum') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append files
      Object.entries(files).forEach(([fieldName, file]) => {
        formDataToSend.append(fieldName, file);
      });

      const response = await fetch('/api/internships/apcourses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Course created successfully with exams'
        });
        setShowCreateDialog(false);
        resetForm();
        fetchCourses();
      } else {
        throw new Error(data.message || 'Failed to create course');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course',
        variant: 'destructive'
      });
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
        body: JSON.stringify(formData)
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

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apcourses/${id}`, {
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

  const handleEdit = (course: APCourse) => {
    setSelectedCourse(course);
    setFormData({
      internshipId: course.internshipRef._id,
      title: course.title,
      curriculum: course.curriculum,
      stream: course.stream,
      providerName: course.providerName,
      instructorName: course.instructorName,
      courseLanguage: course.courseLanguage,
      certificationProvided: course.certificationProvided,
      hasFinalExam: course.hasFinalExam
    });
    setShowEditDialog(true);
  };

  const handleView = (course: APCourse) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const resetForm = () => {
    setFormData({
      internshipId: '',
      title: '',
      curriculum: [],
      stream: '',
      providerName: 'triaright',
      instructorName: '',
      courseLanguage: 'English',
      certificationProvided: 'yes',
      hasFinalExam: false
    });
    setFiles({});
    setSelectedCourse(null);
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [
        ...prev.curriculum,
        {
          topicName: '',
          topicCount: 0,
          subtopics: []
        }
      ]
    }));
  };

  const updateTopic = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((topic, i) => 
        i === index ? { ...topic, [field]: value } : topic
      )
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
  };

  const addSubtopic = (topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((topic, i) => 
        i === topicIndex ? {
          ...topic,
          subtopics: [
            ...topic.subtopics,
            { name: '', link: '', duration: 0 }
          ]
        } : topic
      )
    }));
  };

  const updateSubtopic = (topicIndex: number, subtopicIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((topic, i) => 
        i === topicIndex ? {
          ...topic,
          subtopics: topic.subtopics.map((subtopic, j) => 
            j === subtopicIndex ? { ...subtopic, [field]: value } : subtopic
          )
        } : topic
      )
    }));
  };

  const removeSubtopic = (topicIndex: number, subtopicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((topic, i) => 
        i === topicIndex ? {
          ...topic,
          subtopics: topic.subtopics.filter((_, j) => j !== subtopicIndex)
        } : topic
      )
    }));
  };

  const getProviderBadge = (provider: string) => {
    const variants = {
      triaright: 'default',
      etv: 'secondary',
      kalasalingan: 'outline',
      instructor: 'destructive'
    } as const;

    return (
      <Badge variant={variants[provider as keyof typeof variants] || 'outline'}>
        {provider}
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AP Course Management</h2>
          <p className="text-gray-600">Manage recorded courses for AP internships</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Create a recorded course with topics, subtopics, and exams.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createCourse} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internship *</label>
                  <Select
                    value={formData.internshipId}
                    onValueChange={(value) => setFormData({...formData, internshipId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select internship" />
                    </SelectTrigger>
                    <SelectContent>
                      {internships.map(internship => (
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider *</label>
                  <Select
                    value={formData.providerName}
                    onValueChange={(value: 'triaright' | 'etv' | 'kalasalingan' | 'instructor') => 
                      setFormData({...formData, providerName: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor Name *</label>
                  <Input
                    value={formData.instructorName}
                    onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Language *</label>
                  <Input
                    value={formData.courseLanguage}
                    onChange={(e) => setFormData({...formData, courseLanguage: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certification Provided *</label>
                  <Select
                    value={formData.certificationProvided}
                    onValueChange={(value: 'yes' | 'no') => 
                      setFormData({...formData, certificationProvided: value})
                    }
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
                  <label className="text-sm font-medium">Has Final Exam</label>
                  <Select
                    value={formData.hasFinalExam.toString()}
                    onValueChange={(value) => setFormData({...formData, hasFinalExam: value === 'true'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Curriculum Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Curriculum</h3>
                  <Button type="button" onClick={addTopic} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic
                  </Button>
                </div>

                {formData.curriculum.map((topic, topicIndex) => (
                  <div key={topicIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Topic {topicIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTopic(topicIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Topic Name *</label>
                        <Input
                          value={topic.topicName}
                          onChange={(e) => updateTopic(topicIndex, 'topicName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subtopic Count</label>
                        <Input
                          type="number"
                          value={topic.topicCount}
                          onChange={(e) => updateTopic(topicIndex, 'topicCount', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Subtopics</h5>
                        <Button
                          type="button"
                          onClick={() => addSubtopic(topicIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtopic
                        </Button>
                      </div>

                      {topic.subtopics.map((subtopic, subtopicIndex) => (
                        <div key={subtopicIndex} className="border rounded p-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <h6 className="font-medium">Subtopic {subtopicIndex + 1}</h6>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Name *</label>
                              <Input
                                value={subtopic.name}
                                onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'name', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Video Link *</label>
                              <Input
                                value={subtopic.link}
                                onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'link', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Duration (minutes) *</label>
                              <Input
                                type="number"
                                value={subtopic.duration}
                                onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'duration', parseInt(e.target.value))}
                                min="1"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Topic Exam Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Topic Exam Excel File (10 questions) for "{topic.topicName}"
                      </label>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileChange(`topicExam_${topic.topicName}`, file);
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* File Uploads Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">File Uploads</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Curriculum Document (PDF/DOC)</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileChange('curriculumDoc', file);
                      }
                    }}
                  />
                </div>

                {formData.hasFinalExam && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Exam Excel File (60 questions)</label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileChange('finalExam', file);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AP Courses</CardTitle>
          <CardDescription>
            Manage recorded courses for Andhra Pradesh internships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Final Exam</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.internshipRef.title}</div>
                        <div className="text-sm text-gray-500">{course.internshipRef.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.stream}</TableCell>
                    <TableCell>{getProviderBadge(course.providerName)}</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                    <TableCell>{formatDuration(course.totalDuration)}</TableCell>
                    <TableCell>{course.curriculum.length}</TableCell>
                    <TableCell>
                      <Badge variant={course.certificationProvided === 'yes' ? 'default' : 'secondary'}>
                        {course.certificationProvided === 'yes' ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.hasFinalExam ? 'default' : 'secondary'}>
                        {course.hasFinalExam ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleView(course)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteCourse(course._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course details and curriculum.
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
                <label className="text-sm font-medium">Provider *</label>
                <Select
                  value={formData.providerName}
                  onValueChange={(value: 'triaright' | 'etv' | 'kalasalingan' | 'instructor') => 
                    setFormData({...formData, providerName: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triaright">Triaright</SelectItem>
                    <SelectItem value="etv">ETV</SelectItem>
                    <SelectItem value="kalasalingan">Kalasalingan</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructor Name *</label>
                <Input
                  value={formData.instructorName}
                  onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Language *</label>
                <Input
                  value={formData.courseLanguage}
                  onChange={(e) => setFormData({...formData, courseLanguage: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification Provided *</label>
                <Select
                  value={formData.certificationProvided}
                  onValueChange={(value: 'yes' | 'no') => 
                    setFormData({...formData, certificationProvided: value})
                  }
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

            {/* Curriculum Section for Edit */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Curriculum</h3>
                <Button type="button" onClick={addTopic} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              {formData.curriculum.map((topic, topicIndex) => (
                <div key={topicIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Topic {topicIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTopic(topicIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic Name *</label>
                      <Input
                        value={topic.topicName}
                        onChange={(e) => updateTopic(topicIndex, 'topicName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subtopic Count</label>
                      <Input
                        type="number"
                        value={topic.topicCount}
                        onChange={(e) => updateTopic(topicIndex, 'topicCount', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Subtopics</h5>
                      <Button
                        type="button"
                        onClick={() => addSubtopic(topicIndex)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtopic
                      </Button>
                    </div>

                    {topic.subtopics.map((subtopic, subtopicIndex) => (
                      <div key={subtopicIndex} className="border rounded p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <h6 className="font-medium">Subtopic {subtopicIndex + 1}</h6>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSubtopic(topicIndex, subtopicIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                              value={subtopic.name}
                              onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Video Link *</label>
                            <Input
                              value={subtopic.link}
                              onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'link', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Duration (minutes) *</label>
                            <Input
                              type="number"
                              value={subtopic.duration}
                              onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'duration', parseInt(e.target.value))}
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              Course Details
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Internship</h4>
                  <p className="text-sm text-gray-600">
                    {selectedCourse.internshipRef.title} - {selectedCourse.internshipRef.companyName}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Stream</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.stream}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Provider</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.providerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Instructor</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.instructorName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Course Language</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.courseLanguage}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Total Duration</h4>
                  <p className="text-sm text-gray-600">{formatDuration(selectedCourse.totalDuration)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Certification</h4>
                  <Badge variant={selectedCourse.certificationProvided === 'yes' ? 'default' : 'secondary'}>
                    {selectedCourse.certificationProvided === 'yes' ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Final Exam</h4>
                  <Badge variant={selectedCourse.hasFinalExam ? 'default' : 'secondary'}>
                    {selectedCourse.hasFinalExam ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {selectedCourse.curriculumDocLink && (
                <div>
                  <h4 className="font-semibold">Curriculum Document</h4>
                  <a 
                    href={selectedCourse.curriculumDocLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Curriculum Document
                  </a>
                </div>
              )}

              {selectedCourse.finalExamExcelLink && (
                <div>
                  <h4 className="font-semibold">Final Exam</h4>
                  <a 
                    href={selectedCourse.finalExamExcelLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Final Exam
                  </a>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-4">Curriculum</h4>
                <div className="space-y-4">
                  {selectedCourse.curriculum.map((topic, topicIndex) => (
                    <div key={topicIndex} className="border rounded-lg p-4">
                      <h5 className="font-medium mb-3">{topic.topicName}</h5>
                      <div className="space-y-2">
                        {topic.subtopics.map((subtopic, subtopicIndex) => (
                          <div key={subtopicIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{subtopic.name}</p>
                              <a 
                                href={subtopic.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Watch Video
                              </a>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDuration(subtopic.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APCourseManagement;
