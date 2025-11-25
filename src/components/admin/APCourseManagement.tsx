import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, FileText, Download } from 'lucide-react';
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
  courseId?: string;
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
  _id?: string;
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

  // formDataState mirrors exactly what backend expects:
  // internshipId, title, curriculum (we will stringify before sending),
  // stream, providerName, instructorName, courseLanguage, certificationProvided, hasFinalExam
  const [formDataState, setFormDataState] = useState({
    internshipId: '',
    title: '',
    curriculum: [] as CurriculumTopic[],
    stream: '',
    providerName: 'triaright' as 'triaright' | 'etv' | 'kalasalingan' | 'instructor',
    instructorName: '',
    courseLanguage: 'English',
    certificationProvided: 'yes' as 'yes' | 'no',
    hasFinalExam: false
  });

  // files keyed by the exact fieldnames backend expects:
  // 'curriculumDoc', 'finalExam', and topic exam files like `topicExam_${topic.topicName}`
  const [files, setFiles] = useState<{ [fieldName: string]: File }>({});

  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
    fetchInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/internships/apcourses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to load courses',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('fetchCourses error', err);
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
      const res = await fetch('/api/internships/ap-internships', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setInternships(data.internships || []);
      } else {
        console.warn('fetchInternships:', data.message);
      }
    } catch (err) {
      console.error('fetchInternships error', err);
    }
  };

  const handleFileChange = (fieldName: string, file: File | undefined) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormDataState({
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

  // Add/modify curriculum helpers (keeps the structure the backend expects)
  const addTopic = () => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: [
        ...prev.curriculum,
        { topicName: '', topicCount: 0, subtopics: [] }
      ]
    }));
  };

  const updateTopic = (index: number, field: keyof CurriculumTopic, value: any) => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((t, i) => i === index ? { ...t, [field]: value } : t)
    }));
  };

  const removeTopic = (index: number) => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== index)
    }));
    // Also remove any topic exam file mapped to this topic
    setFiles(prev => {
      const copy = { ...prev };
      // topicName might be removed; safest to remove any key that starts with `topicExam_` and matches removed topic name — but since topic name removed we can't know it here.
      // We will simply keep files (no-op) — backend can handle missing files per topic.
      return copy;
    });
  };

  const addSubtopic = (topicIndex: number) => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((t, i) => i === topicIndex ? {
        ...t,
        subtopics: [...t.subtopics, { name: '', link: '', duration: 0 }]
      } : t)
    }));
  };

  const updateSubtopic = (topicIndex: number, subIndex: number, field: keyof Subtopic, value: any) => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((t, i) => i === topicIndex ? {
        ...t,
        subtopics: t.subtopics.map((s, j) => j === subIndex ? { ...s, [field]: value } : s)
      } : t)
    }));
  };

  const removeSubtopic = (topicIndex: number, subIndex: number) => {
    setFormDataState(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((t, i) => i === topicIndex ? {
        ...t,
        subtopics: t.subtopics.filter((_, j) => j !== subIndex)
      } : t)
    }));
  };

  // Build FormData exactly as backend expects and POST to /api/internships/apcourses
  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    // Basic validation before sending
    if (!formDataState.internshipId) {
      toast({ title: 'Validation', description: 'Please select an internship', variant: 'destructive' });
      return;
    }
    if (!formDataState.title) {
      toast({ title: 'Validation', description: 'Please provide a course title', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();

      // IMPORTANT: keys must match backend: internshipId, title, curriculum (JSON), stream, providerName, instructorName,
      // courseLanguage, certificationProvided, hasFinalExam
      fd.append('internshipId', formDataState.internshipId);
      fd.append('title', formDataState.title);
      fd.append('stream', formDataState.stream || '');
      fd.append('providerName', formDataState.providerName);
      fd.append('instructorName', formDataState.instructorName || '');
      fd.append('courseLanguage', formDataState.courseLanguage || 'English');
      fd.append('certificationProvided', formDataState.certificationProvided);
      // backend expects curriculum as JSON string (controller supports string parse)
      fd.append('curriculum', JSON.stringify(formDataState.curriculum || []));
      // hasFinalExam should be sent as boolean-like value; FormData stores strings — backend treats truthy values as OK
      fd.append('hasFinalExam', formDataState.hasFinalExam ? 'true' : 'false');

      // Append curriculum document if provided
      if (files['curriculumDoc']) {
        fd.append('curriculumDoc', files['curriculumDoc']);
      }

      // Append final exam file only if hasFinalExam true and file present
      if (formDataState.hasFinalExam && files['finalExam']) {
        fd.append('finalExam', files['finalExam']);
      }

      // Append topic exam files. Backend expects field names exactly: `topicExam_${topic.topicName}`
      // IMPORTANT: Use the topicName as-is (backend uses the same key). If you sanitize here, backend won't find it.
      formDataState.curriculum.forEach((topic) => {
        const fieldName = `topicExam_${topic.topicName}`;
        const file = files[fieldName];
        if (file) {
          fd.append(fieldName, file);
        }
      });

      // Debugging: (optional) log FormData keys (cannot log values directly)
      // for (const pair of fd.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      const res = await fetch('/api/internships/apcourses', {
        method: 'POST',
        headers: {
          // DO NOT set Content-Type; let browser set multipart boundary
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Course created successfully'
        });
        setShowCreateDialog(false);
        resetForm();
        fetchCourses();
      } else {
        const msg = data.message || 'Failed to create course';
        throw new Error(msg);
      }
    } catch (err: any) {
      console.error('createCourse error', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update course (backend route supports multipart upload on PUT too), but current controller updateAPCourse expects JSON body.
  // We'll send JSON for updates (no file changes here). If you need file update support, switch to FormData & upload.any().
  const updateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);

      // Prepare payload same field names as backend expects
      const payload = {
        internshipRef: formDataState.internshipId, // backend used 'internshipRef' field on model; update accepts req.body
        title: formDataState.title,
        curriculum: formDataState.curriculum,
        stream: formDataState.stream,
        providerName: formDataState.providerName,
        instructorName: formDataState.instructorName,
        courseLanguage: formDataState.courseLanguage,
        certificationProvided: formDataState.certificationProvided,
        hasFinalExam: formDataState.hasFinalExam
      };

      const res = await fetch(`/api/internships/apcourses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
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
    } catch (err: any) {
      console.error('updateCourse error', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update course',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/internships/apcourses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Success', description: 'Course deleted' });
        fetchCourses();
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (err: any) {
      console.error('deleteCourse error', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  // Pre-fill form for editing with backend-compatible fields
  const handleEdit = (course: APCourse) => {
    setSelectedCourse(course);
    setFormDataState({
      internshipId: course.internshipRef?._id || '',
      title: course.title || '',
      curriculum: course.curriculum || [],
      stream: course.stream || '',
      providerName: course.providerName || 'triaright',
      instructorName: course.instructorName || '',
      courseLanguage: course.courseLanguage || 'English',
      certificationProvided: course.certificationProvided || 'yes',
      hasFinalExam: !!course.hasFinalExam
    });
    setShowEditDialog(true);
  };

  const handleView = (course: APCourse) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
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
                    value={formDataState.internshipId}
                    onValueChange={(value) => setFormDataState(prev => ({ ...prev, internshipId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select internship" />
                    </SelectTrigger>
                    <SelectContent>
                      {internships.map(i => (
                        <SelectItem key={i._id} value={i._id}>
                          {i.title} - {i.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Title *</label>
                  <Input
                    value={formDataState.title}
                    onChange={(e) => setFormDataState(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream *</label>
                  <Input
                    value={formDataState.stream}
                    onChange={(e) => setFormDataState(prev => ({ ...prev, stream: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider *</label>
                  <Select
                    value={formDataState.providerName}
                    onValueChange={(value) => setFormDataState(prev => ({ ...prev, providerName: value as any }))}
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
                    value={formDataState.instructorName}
                    onChange={(e) => setFormDataState(prev => ({ ...prev, instructorName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Language *</label>
                  <Input
                    value={formDataState.courseLanguage}
                    onChange={(e) => setFormDataState(prev => ({ ...prev, courseLanguage: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Certification Provided *</label>
                  <Select
                    value={formDataState.certificationProvided}
                    onValueChange={(value) => setFormDataState(prev => ({ ...prev, certificationProvided: value as any }))}
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
                    value={formDataState.hasFinalExam ? 'true' : 'false'}
                    onValueChange={(value) => setFormDataState(prev => ({ ...prev, hasFinalExam: value === 'true' }))}
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

                {formDataState.curriculum.map((topic, tIdx) => (
                  <div key={tIdx} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Topic {tIdx + 1}</h4>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeTopic(tIdx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Topic Name *</label>
                        <Input
                          value={topic.topicName}
                          onChange={(e) => updateTopic(tIdx, 'topicName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subtopic Count</label>
                        <Input
                          type="number"
                          value={topic.topicCount}
                          min={0}
                          onChange={(e) => updateTopic(tIdx, 'topicCount', parseInt(e.target.value || '0', 10))}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Subtopics</h5>
                        <Button type="button" onClick={() => addSubtopic(tIdx)} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtopic
                        </Button>
                      </div>

                      {topic.subtopics.map((sub, sIdx) => (
                        <div key={sIdx} className="border rounded p-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <h6 className="font-medium">Subtopic {sIdx + 1}</h6>
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeSubtopic(tIdx, sIdx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Name *</label>
                              <Input
                                value={sub.name}
                                onChange={(e) => updateSubtopic(tIdx, sIdx, 'name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Video Link *</label>
                              <Input
                                value={sub.link}
                                onChange={(e) => updateSubtopic(tIdx, sIdx, 'link', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Duration (minutes) *</label>
                              <Input
                                type="number"
                                min={1}
                                value={sub.duration}
                                onChange={(e) => updateSubtopic(tIdx, sIdx, 'duration', parseInt(e.target.value || '0', 10))}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Topic Exam Upload - IMPORTANT: name must match backend's expected field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Topic Exam Excel File (10 questions) for "{topic.topicName}"
                      </label>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        // we will use the exact field name backend expects: `topicExam_${topic.topicName}`
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const fieldName = `topicExam_${topic.topicName}`;
                          if (file) handleFileChange(fieldName, file);
                        }}
                        // for debugging you can add name prop:
                        name={`topicExam_${topic.topicName}`}
                      />
                      <p className="text-xs text-gray-500">Excel with exactly 10 rows/questions (backend validates).</p>
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
                      if (file) handleFileChange('curriculumDoc', file);
                    }}
                    name="curriculumDoc"
                  />
                </div>

                {formDataState.hasFinalExam && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Exam Excel File (60 questions)</label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange('finalExam', file);
                      }}
                      name="finalExam"
                    />
                    <p className="text-xs text-gray-500">Excel with exactly 60 rows/questions (backend validates).</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AP Courses</CardTitle>
          <CardDescription>Manage recorded courses for Andhra Pradesh internships</CardDescription>
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
                {courses.map(course => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.internshipRef?.title}</div>
                        <div className="text-sm text-gray-500">{course.internshipRef?.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.stream}</TableCell>
                    <TableCell>{getProviderBadge(course.providerName)}</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                    <TableCell>{formatDuration(course.totalDuration || 0)}</TableCell>
                    <TableCell>{course.curriculum?.length || 0}</TableCell>
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
                        <Button variant="outline" size="sm" onClick={() => handleView(course)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteCourse(course._id)}>
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
            <DialogDescription>Update course details and curriculum.</DialogDescription>
          </DialogHeader>

          <form onSubmit={updateCourse} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title *</label>
                <Input value={formDataState.title} onChange={(e) => setFormDataState(prev => ({ ...prev, title: e.target.value }))} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stream *</label>
                <Input value={formDataState.stream} onChange={(e) => setFormDataState(prev => ({ ...prev, stream: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider *</label>
                <Select value={formDataState.providerName} onValueChange={(value) => setFormDataState(prev => ({ ...prev, providerName: value as any }))}>
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
                <Input value={formDataState.instructorName} onChange={(e) => setFormDataState(prev => ({ ...prev, instructorName: e.target.value }))} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Language *</label>
                <Input value={formDataState.courseLanguage} onChange={(e) => setFormDataState(prev => ({ ...prev, courseLanguage: e.target.value }))} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Certification Provided *</label>
                <Select value={formDataState.certificationProvided} onValueChange={(value) => setFormDataState(prev => ({ ...prev, certificationProvided: value as any }))}>
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

            {/* Curriculum editing area (same as create) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Curriculum</h3>
                <Button type="button" onClick={addTopic} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              {formDataState.curriculum.map((topic, topicIndex) => (
                <div key={topicIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Topic {topicIndex + 1}</h4>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeTopic(topicIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic Name *</label>
                      <Input value={topic.topicName} onChange={(e) => updateTopic(topicIndex, 'topicName', e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subtopic Count</label>
                      <Input type="number" value={topic.topicCount} onChange={(e) => updateTopic(topicIndex, 'topicCount', parseInt(e.target.value || '0', 10))} min={0} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Subtopics</h5>
                      <Button type="button" onClick={() => addSubtopic(topicIndex)} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtopic
                      </Button>
                    </div>

                    {topic.subtopics.map((subtopic, subtopicIndex) => (
                      <div key={subtopicIndex} className="border rounded p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <h6 className="font-medium">Subtopic {subtopicIndex + 1}</h6>
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeSubtopic(topicIndex, subtopicIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input value={subtopic.name} onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'name', e.target.value)} required />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Video Link *</label>
                            <Input value={subtopic.link} onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'link', e.target.value)} required />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Duration (minutes) *</label>
                            <Input type="number" value={subtopic.duration} min={1} onChange={(e) => updateSubtopic(topicIndex, subtopicIndex, 'duration', parseInt(e.target.value || '0', 10))} required />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Course Details</DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Internship</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.internshipRef.title} - {selectedCourse.internshipRef.companyName}</p>
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
                  <p className="text-sm text-gray-600">{formatDuration(selectedCourse.totalDuration || 0)}</p>
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
                  <a href={selectedCourse.curriculumDocLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                    <FileText className="h-4 w-4 mr-2" />
                    View Curriculum Document
                  </a>
                </div>
              )}

              {selectedCourse.finalExamExcelLink && (
                <div>
                  <h4 className="font-semibold">Final Exam</h4>
                  <a href={selectedCourse.finalExamExcelLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
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
                              <a href={subtopic.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                                Watch Video
                              </a>
                            </div>
                            <span className="text-sm text-gray-500">{formatDuration(subtopic.duration || 0)}</span>
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
