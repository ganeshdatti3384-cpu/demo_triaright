import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, FileText, Award, Clock, Paperclip, Eye, Edit, Trash2,
  Download, BarChart3, Users, Calendar, BookOpen, ChevronRight,
  AlertCircle, CheckCircle, X, Save, UserCheck, FileCheck,
  CalendarDays, Tag, Loader2, Upload, RefreshCw, Plus,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

import AssignmentSubmissions from './AssignmentSubmission';
import CreateAssignment from './CreateAssignment';

const API_BASE_URL = "https://triaright.com/api/livecourses";

const AssignmentList = ({ onViewSubmissions }) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [deleteId, setDeleteId] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  
  const [editForm, setEditForm] = useState({});
  const [viewSubmissionsFor, setViewSubmissionsFor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const token = () => localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/trainer/assigned/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCourses(data.courses || data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/batches`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setBatches(data.batches || data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      let url = `${API_BASE_URL}/assignments/trainer/my-assignments`;
      const params = [];
      if (courseFilter !== "all") params.push(`courseId=${courseFilter}`);
      if (batchFilter !== "all") params.push(`batchId=${batchFilter}`);
      if (statusFilter !== "all") params.push(`status=${statusFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load assignments", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [courseFilter, batchFilter, statusFilter]);

  useEffect(() => {
    if (courseFilter !== "all") {
      fetchBatches(courseFilter);
    } else {
      setBatches([]);
      setBatchFilter("all");
    }
  }, [courseFilter]);

  const updateAssignment = async () => {
    if (!editAssignment) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key !== "existingAttachments" && key !== "newAttachments" && editForm[key] !== undefined && editForm[key] !== "") {
          formData.append(key, editForm[key]);
        }
      });

      if (editForm.newAttachments?.length > 0) {
        editForm.newAttachments.forEach(file => formData.append("attachments", file));
      }

      const res = await fetch(`${API_BASE_URL}/assignments/${editAssignment._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to update");

      toast({ title: "Success", description: "Assignment updated!" });
      setEditAssignment(null);
      fetchAssignments(true);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast({ title: "Success", description: "Assignment deleted!" });
      setDeleteId(null);
      fetchAssignments(true);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredAssignments = assignments.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.courseId?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.batchId?.batchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      closed: "bg-red-100 text-red-800"
    };
    return colors[status?.toLowerCase()] || "bg-blue-100 text-blue-800";
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchAssignments(true);
  };

  // Conditional returns AFTER all hooks
  if (showCreateForm) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            <X className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
        <CreateAssignment onSuccess={handleCreateSuccess} />
      </div>
    );
  }

  if (viewSubmissionsFor) {
    return (
      <AssignmentSubmissions
        assignmentId={viewSubmissionsFor}
        onBack={() => setViewSubmissionsFor(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Assignments</h2>
          <p className="text-gray-600">Manage {assignments.length} assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchAssignments(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={courseFilter} onChange={e => { setCourseFilter(e.target.value); setBatchFilter("all"); }}
              className="px-4 py-2 border rounded-lg">
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
            </select>
            <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg" disabled={courseFilter === "all"}>
              <option value="all">All Batches</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No assignments found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map(a => (
            <Card key={a._id} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{a.title}</h3>
                          <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{a.description}</p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {a.courseId?.courseName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {a.batchId?.batchName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(a.dueDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {a.maxMarks} marks
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setViewSubmissionsFor(a._id)}
                      className="bg-purple-50 hover:bg-purple-100"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Submissions
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => setViewAssignment(a)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditAssignment(a);
                      setEditForm({
                        title: a.title,
                        description: a.description,
                        instructions: a.instructions || "",
                        maxMarks: a.maxMarks,
                        dueDate: formatDateForInput(a.dueDate),
                        submissionType: a.submissionType,
                        allowLateSubmission: a.allowLateSubmission,
                        status: a.status,
                        existingAttachments: a.attachments || [],
                        newAttachments: []
                      });
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(a._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewAssignment !== null} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewAssignment?.title}</DialogTitle>
          </DialogHeader>
          {viewAssignment && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(viewAssignment.status)}>{viewAssignment.status}</Badge>
                <Badge variant="outline">{viewAssignment.courseId?.courseName}</Badge>
                <Badge variant="outline">{viewAssignment.batchId?.batchName}</Badge>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{viewAssignment.description}</p>
              </div>
              {viewAssignment.instructions && (
                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-gray-600">{viewAssignment.instructions}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Max Marks</h4>
                  <p>{viewAssignment.maxMarks}</p>
                </div>
                <div>
                  <h4 className="font-medium">Due Date</h4>
                  <p>{formatDate(viewAssignment.dueDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium">Submission Type</h4>
                  <p className="capitalize">{viewAssignment.submissionType}</p>
                </div>
                <div>
                  <h4 className="font-medium">Late Submission</h4>
                  <p>{viewAssignment.allowLateSubmission ? "Allowed" : "Not Allowed"}</p>
                </div>
              </div>
              {viewAssignment.attachments?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {viewAssignment.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {file.fileName || "View Document"}
                        </a>
                        <span className="text-xs text-gray-500">
                          ({(file.fileSize / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editAssignment !== null} onOpenChange={() => setEditAssignment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          {editAssignment && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Description</label>
                <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Instructions</label>
                <Textarea value={editForm.instructions} onChange={e => setEditForm({...editForm, instructions: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Max Marks</label>
                  <Input type="number" value={editForm.maxMarks} onChange={e => setEditForm({...editForm, maxMarks: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Due Date</label>
                  <Input type="datetime-local" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Submission Type</label>
                <select value={editForm.submissionType} onChange={e => setEditForm({...editForm, submissionType: e.target.value})}
                  className="w-full border rounded-md p-2">
                  <option value="file">File</option>
                  <option value="text">Text</option>
                  <option value="link">Link</option>
                  <option value="multiple">Multiple</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.allowLateSubmission}
                  onChange={e => setEditForm({...editForm, allowLateSubmission: e.target.checked})} />
                <label className="text-sm">Allow late submissions</label>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full border rounded-md p-2">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {editForm.existingAttachments?.length > 0 && (
                <div>
                  <label className="block mb-2 text-sm font-medium">Existing Attachments</label>
                  <div className="space-y-2">
                    {editForm.existingAttachments.map((file, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {file.fileName || "View Document"}
                          </a>
                          <span className="text-xs text-gray-500">
                            ({(file.fileSize / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              existingAttachments: editForm.existingAttachments.filter((_, idx) => idx !== i)
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium">Add New Attachments (Max 5 total)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const totalFiles = (editForm.existingAttachments?.length || 0) + (editForm.newAttachments?.length || 0) + files.length;
                    
                    if (totalFiles > 5) {
                      toast({ title: "Error", description: "Maximum 5 files allowed", variant: "destructive" });
                      return;
                    }
                    
                    setEditForm({
                      ...editForm,
                      newAttachments: [...(editForm.newAttachments || []), ...files]
                    });
                  }}
                  className="hidden"
                  id="edit-file-upload"
                />
                <label htmlFor="edit-file-upload" className="border-2 border-dashed p-4 rounded-lg flex flex-col items-center cursor-pointer hover:border-blue-500">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm">Click to upload new files</span>
                </label>
                
                {editForm.newAttachments?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {editForm.newAttachments.map((file, i) => (
                      <div key={i} className="flex justify-between items-center bg-blue-50 p-2 rounded">
                        <span className="text-sm text-blue-700">📄 {file.name}</span>
                        <X
                          className="w-4 h-4 cursor-pointer text-blue-700"
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              newAttachments: editForm.newAttachments.filter((_, idx) => idx !== i)
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditAssignment(null)}>Cancel</Button>
                <Button onClick={updateAssignment} disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteAssignment(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentList;