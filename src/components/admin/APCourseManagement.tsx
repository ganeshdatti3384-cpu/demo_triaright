import React, { useEffect, useState } from "react";
import {
  Button
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * This component implements:
 * - List AP Courses (admin)
 * - Create AP Course (multipart/form-data)
 * - Update AP Course (multipart/form-data)
 * - Delete AP Course
 *
 * IMPORTANT:
 * Field names and files keys must match backend:
 * Body fields: internshipId, title, curriculum, stream, providerName,
 * instructorName, courseLanguage, certificationProvided, hasFinalExam
 *
 * Files:
 * - curriculumDoc
 * - finalExam
 * - topicExam_<topicName>  (exactly this key; topicName may contain spaces)
 *
 * The backend expects curriculum as JSON string or parsed object.
 */

type Subtopic = {
  name: string;
  link?: string;
  duration: number;
};

type Topic = {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
};

type APCourse = {
  _id: string;
  internshipRef?: {
    _id?: string;
    title?: string;
    companyName?: string;
  };
  title: string;
  curriculum: Topic[];
  stream: string;
  providerName: string;
  instructorName: string;
  courseLanguage?: string;
  certificationProvided?: string; // 'yes' | 'no'
  hasFinalExam?: boolean;
  totalDuration?: number;
  finalExamExcelLink?: string;
  curriculumDocLink?: string;
  createdAt?: string;
};

const defaultTopic = (): Topic => ({
  topicName: "",
  topicCount: 0,
  subtopics: [{ name: "", link: "", duration: 0 }]
});

const APCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<APCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<APCourse | null>(null);
  const { toast } = useToast();

  // Form state (used for create & edit)
  const [form, setForm] = useState({
    internshipId: "",
    title: "",
    stream: "",
    providerName: "triaright",
    instructorName: "",
    courseLanguage: "English",
    certificationProvided: "yes", // backend expects 'yes' | 'no'
    hasFinalExam: false,
    // curriculum is an array of topics (Topic[])
    curriculum: [] as Topic[],
  } as {
    internshipId: string;
    title: string;
    stream: string;
    providerName: string;
    instructorName: string;
    courseLanguage: string;
    certificationProvided: string;
    hasFinalExam: boolean;
    curriculum: Topic[];
  });

  // File inputs (we store File | null for each)
  const [curriculumDocFile, setCurriculumDocFile] = useState<File | null>(null);
  const [finalExamFile, setFinalExamFile] = useState<File | null>(null);
  // topicExamFiles: key = `topicExam_${topicName}` (exact key used on backend)
  const [topicExamFiles, setTopicExamFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch("/api/internships/apcourses", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.courses || []);
      } else {
        // In some setups the endpoint returns courses without success flag
        if (Array.isArray(data)) setCourses(data);
        else if (data.courses) setCourses(data.courses);
        else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch courses",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error("fetchCourses", err);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      internshipId: "",
      title: "",
      stream: "",
      providerName: "triaright",
      instructorName: "",
      courseLanguage: "English",
      certificationProvided: "yes",
      hasFinalExam: false,
      curriculum: [],
    });
    setCurriculumDocFile(null);
    setFinalExamFile(null);
    setTopicExamFiles({});
    setSelectedCourse(null);
  };

  // Calculate total duration helper (used client-side display only)
  const calculateTotalDuration = (curr: Topic[]) => {
    let total = 0;
    curr.forEach((t) => {
      t.subtopics.forEach((s) => {
        total += Number(s.duration || 0);
      });
    });
    return total;
  };

  // Create course
  const createCourse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
        return;
      }

      // Basic validation
      if (!form.internshipId || !form.title || form.curriculum.length === 0) {
        toast({ title: "Validation", description: "Please fill internshipId, title and curriculum", variant: "destructive" });
        return;
      }

      const fd = new FormData();
      fd.append("internshipId", form.internshipId);
      fd.append("title", form.title);
      fd.append("stream", form.stream);
      fd.append("providerName", form.providerName);
      fd.append("instructorName", form.instructorName);
      fd.append("courseLanguage", form.courseLanguage);
      fd.append("certificationProvided", form.certificationProvided);
      fd.append("hasFinalExam", form.hasFinalExam ? "true" : "false");

      // Backend accepts curriculum as JSON string OR object; we will send string
      fd.append("curriculum", JSON.stringify(form.curriculum));

      if (curriculumDocFile) fd.append("curriculumDoc", curriculumDocFile);
      if (finalExamFile && form.hasFinalExam) fd.append("finalExam", finalExamFile);

      // Append topic exams with keys: topicExam_<topicName>
      form.curriculum.forEach((topic) => {
        const key = `topicExam_${topic.topicName}`;
        const file = topicExamFiles[key];
        if (file) {
          // IMPORTANT: backend expects this field name exactly (topicExam_<topicName>)
          fd.append(key, file);
        }
      });

      setLoading(true);
      const res = await fetch("/api/internships/apcourses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Success", description: "Course created successfully" });
        setShowCreateDialog(false);
        resetForm();
        fetchCourses();
      } else {
        throw new Error(data.message || "Failed to create course");
      }
    } catch (err: any) {
      console.error("createCourse", err);
      toast({ title: "Error", description: err.message || "Failed to create course", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Edit / Populate form for update
  const handleEdit = async (courseId: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/internships/apcourses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.course) {
        const c: APCourse = data.course;
        setSelectedCourse(c);
        setForm({
          internshipId: c.internshipRef?._id || "",
          title: c.title || "",
          stream: c.stream || "",
          providerName: c.providerName || "triaright",
          instructorName: c.instructorName || "",
          courseLanguage: c.courseLanguage || "English",
          certificationProvided: c.certificationProvided || "yes",
          hasFinalExam: !!c.hasFinalExam,
          curriculum: c.curriculum || [],
        });

        // Clear file inputs (existing links remain on backend)
        setCurriculumDocFile(null);
        setFinalExamFile(null);
        setTopicExamFiles({});
        setShowEditDialog(true);
      } else {
        throw new Error(data.message || "Failed to fetch course");
      }
    } catch (err: any) {
      console.error("handleEdit", err);
      toast({ title: "Error", description: err.message || "Failed to fetch course", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const updateCourse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCourse) return;

    try {
      const token = getToken();
      if (!token) {
        toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
        return;
      }

      const fd = new FormData();
      // Append only the fields we want to update (backend accepts full body)
      fd.append("internshipId", form.internshipId);
      fd.append("title", form.title);
      fd.append("stream", form.stream);
      fd.append("providerName", form.providerName);
      fd.append("instructorName", form.instructorName);
      fd.append("courseLanguage", form.courseLanguage);
      fd.append("certificationProvided", form.certificationProvided);
      fd.append("hasFinalExam", form.hasFinalExam ? "true" : "false");
      fd.append("curriculum", JSON.stringify(form.curriculum));

      if (curriculumDocFile) fd.append("curriculumDoc", curriculumDocFile);
      if (finalExamFile && form.hasFinalExam) fd.append("finalExam", finalExamFile);

      form.curriculum.forEach((topic) => {
        const key = `topicExam_${topic.topicName}`;
        const file = topicExamFiles[key];
        if (file) fd.append(key, file);
      });

      setLoading(true);
      const res = await fetch(`/api/internships/apcourses/${selectedCourse._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Success", description: "Course updated successfully" });
        setShowEditDialog(false);
        resetForm();
        fetchCourses();
      } else {
        throw new Error(data.message || "Failed to update course");
      }
    } catch (err: any) {
      console.error("updateCourse", err);
      toast({ title: "Error", description: err.message || "Failed to update course", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      const token = getToken();
      if (!token) {
        toast({ title: "Unauthorized", description: "No token found", variant: "destructive" });
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/internships/apcourses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Deleted", description: "Course deleted successfully" });
        fetchCourses();
      } else {
        throw new Error(data.message || "Failed to delete course");
      }
    } catch (err: any) {
      console.error("deleteCourse", err);
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Curriculum helpers
  const addTopic = () => {
    setForm((prev) => ({ ...prev, curriculum: [...prev.curriculum, defaultTopic()] }));
  };

  const removeTopic = (index: number) => {
    setForm((prev) => {
      const newCurr = [...prev.curriculum];
      const removed = newCurr.splice(index, 1);
      // Remove any topicExamFiles for removed topic
      if (removed[0]) {
        const key = `topicExam_${removed[0].topicName}`;
        setTopicExamFiles((files) => {
          const copy = { ...files };
          delete copy[key];
          return copy;
        });
      }
      return { ...prev, curriculum: newCurr };
    });
  };

  const updateTopicName = (index: number, name: string) => {
    setForm((prev) => {
      const newCurr = [...prev.curriculum];
      const oldName = newCurr[index]?.topicName;
      newCurr[index] = { ...newCurr[index], topicName: name };
      // If topic name changed, move any file under old key to new key
      if (oldName && oldName !== name) {
        const oldKey = `topicExam_${oldName}`;
        const newKey = `topicExam_${name}`;
        setTopicExamFiles((files) => {
          const copy = { ...files };
          if (copy[oldKey]) {
            copy[newKey] = copy[oldKey];
            delete copy[oldKey];
          }
          return copy;
        });
      }
      return { ...prev, curriculum: newCurr };
    });
  };

  const addSubtopic = (topicIndex: number) => {
    setForm((prev) => {
      const newCurr = [...prev.curriculum];
      newCurr[topicIndex].subtopics.push({ name: "", link: "", duration: 0 });
      return { ...prev, curriculum: newCurr };
    });
  };

  const removeSubtopic = (topicIndex: number, subIndex: number) => {
    setForm((prev) => {
      const newCurr = [...prev.curriculum];
      newCurr[topicIndex].subtopics.splice(subIndex, 1);
      return { ...prev, curriculum: newCurr };
    });
  };

  const updateSubtopic = (topicIndex: number, subIndex: number, key: keyof Subtopic, value: any) => {
    setForm((prev) => {
      const newCurr = [...prev.curriculum];
      newCurr[topicIndex].subtopics[subIndex] = {
        ...newCurr[topicIndex].subtopics[subIndex],
        [key]: key === "duration" ? Number(value) : value,
      };
      return { ...prev, curriculum: newCurr };
    });
  };

  // topic exam file change
  const onTopicExamFileChange = (topicName: string, file?: File) => {
    const key = `topicExam_${topicName}`;
    setTopicExamFiles((prev) => ({ ...prev, [key]: file || null }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AP Course Management</h2>
          <p className="text-gray-600">Create, update or delete recorded courses linked to AP internships</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create AP Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create AP Course</DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); createCourse(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Internship ID *</label>
                  <Input
                    value={form.internshipId}
                    onChange={(e) => setForm({ ...form, internshipId: e.target.value })}
                    required
                    placeholder="MongoDB Internship _id (internshipRef)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Stream</label>
                  <Input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <Select value={form.providerName} onValueChange={(v: string) => setForm({ ...form, providerName: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triaright">triaright</SelectItem>
                      <SelectItem value="etv">etv</SelectItem>
                      <SelectItem value="kalasalingan">kalasalingan</SelectItem>
                      <SelectItem value="instructor">instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Instructor Name</label>
                  <Input value={form.instructorName} onChange={(e) => setForm({ ...form, instructorName: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Course Language</label>
                  <Input value={form.courseLanguage} onChange={(e) => setForm({ ...form, courseLanguage: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Certification Provided</label>
                  <Select value={form.certificationProvided} onValueChange={(v: string) => setForm({ ...form, certificationProvided: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">yes</SelectItem>
                      <SelectItem value="no">no</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Has Final Exam</label>
                  <Select value={form.hasFinalExam ? "true" : "false"} onValueChange={(v: string) => setForm({ ...form, hasFinalExam: v === "true" })}>
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

              {/* Curriculum editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Curriculum</CardTitle>
                  <CardDescription>Add topics and subtopics. Each topic can have an Excel file named topicExam_<topicName> (10 questions)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.curriculum.map((topic, tIdx) => (
                      <div key={tIdx} className="border rounded p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <Input
                            value={topic.topicName}
                            onChange={(e) => updateTopicName(tIdx, e.target.value)}
                            placeholder="Topic Name"
                            className="flex-1 mr-2"
                          />
                          <Button variant="destructive" onClick={() => removeTopic(tIdx)}>Remove Topic</Button>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Topic Exam (Excel - 10 rows)</label>
                          <input
                            type="file"
                            accept=".xls,.xlsx"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              onTopicExamFileChange(topic.topicName, f);
                            }}
                            className="block mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">Field name will be: <code>topicExam_{topic.topicName}</code></p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">Subtopics</h4>
                          {topic.subtopics.map((sub, sIdx) => (
                            <div key={sIdx} className="grid grid-cols-3 gap-2 items-end">
                              <Input
                                placeholder="Subtopic name"
                                value={sub.name}
                                onChange={(e) => updateSubtopic(tIdx, sIdx, "name", e.target.value)}
                              />
                              <Input
                                placeholder="Link (video)"
                                value={sub.link}
                                onChange={(e) => updateSubtopic(tIdx, sIdx, "link", e.target.value)}
                              />
                              <Input
                                placeholder="Duration (minutes)"
                                value={String(sub.duration)}
                                type="number"
                                onChange={(e) => updateSubtopic(tIdx, sIdx, "duration", Number(e.target.value))}
                              />
                              <div className="col-span-3 flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => removeSubtopic(tIdx, sIdx)}>Remove Subtopic</Button>
                              </div>
                            </div>
                          ))}

                          <div>
                            <Button onClick={() => addSubtopic(tIdx)}>Add Subtopic</Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex space-x-2">
                      <Button onClick={addTopic}>Add Topic</Button>
                      <div className="ml-auto text-sm text-gray-600">
                        Total Duration: {calculateTotalDuration(form.curriculum)} minutes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium">Curriculum Document (pdf/doc)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCurriculumDocFile(e.target.files?.[0] || null)} />
              </div>

              {form.hasFinalExam && (
                <div>
                  <label className="text-sm font-medium">Final Exam (Excel - 60 rows)</label>
                  <input type="file" accept=".xls,.xlsx" onChange={(e) => setFinalExamFile(e.target.files?.[0] || null)} />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => createCourse()}>Create Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Quick Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AP Courses</CardTitle>
              <CardDescription>List of recorded courses</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading courses...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead>Total Duration</TableHead>
                      <TableHead>Has Final Exam</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.providerName}</TableCell>
                        <TableCell>{c.stream}</TableCell>
                        <TableCell>{c.totalDuration ?? calculateTotalDuration(c.curriculum)} mins</TableCell>
                        <TableCell>{c.hasFinalExam ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(c._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteCourse(c._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {courses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No AP courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Quick Create</CardTitle>
              <CardDescription>Create a course with minimal fields</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setShowCreateDialog(true); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Internship ID" value={form.internshipId} onChange={(e) => setForm({ ...form, internshipId: e.target.value })} />
                  <Input placeholder="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setShowCreateDialog(true)}>Open Create Modal</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AP Course</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); updateCourse(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Internship ID *</label>
                <Input
                  value={form.internshipId}
                  onChange={(e) => setForm({ ...form, internshipId: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stream</label>
                <Input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Provider</label>
                <Select value={form.providerName} onValueChange={(v: string) => setForm({ ...form, providerName: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triaright">triaright</SelectItem>
                    <SelectItem value="etv">etv</SelectItem>
                    <SelectItem value="kalasalingan">kalasalingan</SelectItem>
                    <SelectItem value="instructor">instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Curriculum (reuse same UI as create) */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum</CardTitle>
                <CardDescription>Edit topics and subtopics. Upload topic exam files as needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {form.curriculum.map((topic, tIdx) => (
                    <div key={tIdx} className="border rounded p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <Input
                          value={topic.topicName}
                          onChange={(e) => updateTopicName(tIdx, e.target.value)}
                          placeholder="Topic Name"
                          className="flex-1 mr-2"
                        />
                        <Button variant="destructive" onClick={() => removeTopic(tIdx)}>Remove Topic</Button>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Topic Exam (Excel - 10 rows)</label>
                        <input
                          type="file"
                          accept=".xls,.xlsx"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            onTopicExamFileChange(topic.topicName, f);
                          }}
                          className="block mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Field name: <code>topicExam_{topic.topicName}</code></p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Subtopics</h4>
                        {topic.subtopics.map((sub, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-3 gap-2 items-end">
                            <Input
                              placeholder="Subtopic name"
                              value={sub.name}
                              onChange={(e) => updateSubtopic(tIdx, sIdx, "name", e.target.value)}
                            />
                            <Input
                              placeholder="Link (video)"
                              value={sub.link}
                              onChange={(e) => updateSubtopic(tIdx, sIdx, "link", e.target.value)}
                            />
                            <Input
                              placeholder="Duration (minutes)"
                              value={String(sub.duration)}
                              type="number"
                              onChange={(e) => updateSubtopic(tIdx, sIdx, "duration", Number(e.target.value))}
                            />
                            <div className="col-span-3 flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => removeSubtopic(tIdx, sIdx)}>Remove Subtopic</Button>
                            </div>
                          </div>
                        ))}

                        <div>
                          <Button onClick={() => addSubtopic(tIdx)}>Add Subtopic</Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex space-x-2">
                    <Button onClick={addTopic}>Add Topic</Button>
                    <div className="ml-auto text-sm text-gray-600">
                      Total Duration: {calculateTotalDuration(form.curriculum)} minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <label className="text-sm font-medium">Replace Curriculum Document (optional)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCurriculumDocFile(e.target.files?.[0] || null)} />
            </div>

            {form.hasFinalExam && (
              <div>
                <label className="text-sm font-medium">Replace Final Exam Excel (optional)</label>
                <input type="file" accept=".xls,.xlsx" onChange={(e) => setFinalExamFile(e.target.files?.[0] || null)} />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" onClick={() => updateCourse()}>Update Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APCourseManagement;
