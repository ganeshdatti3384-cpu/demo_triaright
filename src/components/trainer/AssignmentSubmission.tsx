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
  CalendarDays, Tag, Loader2, Upload, RefreshCw, User, Check,
  ArrowLeft, MessageSquare, Star, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const API_BASE_URL = "http://localhost:5007/api/livecourses";

// Assignment Submissions Component
const AssignmentSubmissions = ({ assignmentId, onBack }) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [ungradedCount, setUngradedCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  const [viewSubmission, setViewSubmission] = useState(null);
  const [gradeSubmission, setGradeSubmission] = useState(null);
  const [bulkGradeMode, setBulkGradeMode] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
    status: "graded"
  });
  
  const [bulkGradeForm, setBulkGradeForm] = useState({
    grade: "",
    feedback: ""
  });

  const token = () => localStorage.getItem("token");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setAssignment(data.assignment || null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/assignments/${assignmentId}/statistics`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      console.log(data);
       setStatistics(data.statistics);

    } catch (err) {
      console.error(err);
    }
  };

  const fetchUngradedCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/ungraded-count`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      setUngradedCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
      fetchStatistics();
      fetchUngradedCount();
    }
  }, [assignmentId]);

  const gradeSubmissionHandler = async () => {
    if (!gradeSubmission || !gradeForm.grade) {
      toast({ title: "Error", description: "Please enter a grade", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/submissions/${gradeSubmission._id}/grade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gradeForm)
      });

      if (!res.ok) throw new Error("Failed to grade");

      toast({ title: "Success", description: "Submission graded successfully!" });
      setGradeSubmission(null);
      setGradeForm({ grade: "", feedback: "", status: "graded" });
      fetchSubmissions();
      fetchStatistics();
      fetchUngradedCount();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const bulkGradeHandler = async () => {
    if (selectedSubmissions.length === 0 || !bulkGradeForm.grade) {
      toast({ title: "Error", description: "Please select submissions and enter a grade", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/trainer/submissions/bulk-grade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          submissionIds: selectedSubmissions,
          grade: bulkGradeForm.grade,
          feedback: bulkGradeForm.feedback
        })
      });

      if (!res.ok) throw new Error("Failed to bulk grade");

      toast({ title: "Success", description: `${selectedSubmissions.length} submissions graded!` });
      setBulkGradeMode(false);
      setSelectedSubmissions([]);
      setBulkGradeForm({ grade: "", feedback: "" });
      fetchSubmissions();
      fetchStatistics();
      fetchUngradedCount();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = submissions
    .filter(s => {
      const matchesSearch = 
        s.UserId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.UserId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || s.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.submissionDate) - new Date(a.submissionDate);
      } else if (sortBy === "grade") {
        return (b.grade || 0) - (a.grade || 0);
      } else if (sortBy === "name") {
        return (a.UserId?.name || "").localeCompare(b.UserId?.name || "");
      }
      return 0;
    });

  const formatDate = (date) => new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const getStatusColor = (status) => {
    const colors = {
      submitted: "bg-yellow-100 text-yellow-800",
      graded: "bg-green-100 text-green-800",
      resubmission_required: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const toggleSubmissionSelection = (submissionId) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{assignment?.title}</h2>
            <p className="text-gray-600">{submissions.length} submissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          {ungradedCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {ungradedCount} Ungraded
            </Badge>
          )}
          <Button
            variant={bulkGradeMode ? "destructive" : "outline"}
            onClick={() => {
              setBulkGradeMode(!bulkGradeMode);
              setSelectedSubmissions([]);
            }}
          >
            {bulkGradeMode ? "Cancel Bulk Grade" : "Bulk Grade"}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{statistics.totalSubmissions || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Graded</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.gradedCount || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pendingCount || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">{statistics.averageGrade?.toFixed(1) || "N/A"}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late Submissions</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.lateSubmissions || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Grade Form */}
      {bulkGradeMode && selectedSubmissions.length > 0 && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <p className="font-semibold">{selectedSubmissions.length} submissions selected</p>
              <Input
                type="number"
                placeholder="Grade"
                value={bulkGradeForm.grade}
                onChange={e => setBulkGradeForm({ ...bulkGradeForm, grade: e.target.value })}
                className="w-32"
              />
              <Input
                placeholder="Feedback (optional)"
                value={bulkGradeForm.feedback}
                onChange={e => setBulkGradeForm({ ...bulkGradeForm, feedback: e.target.value })}
                className="flex-1"
              />
              <Button onClick={bulkGradeHandler} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grade All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="resubmission_required">Resubmission Required</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="date">Sort by Date</option>
              <option value="grade">Sort by Grade</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No submissions found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map(submission => (
            <Card key={submission._id} className="hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    {bulkGradeMode && submission.status !== "graded" && (
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission._id)}
                        onChange={() => toggleSubmissionSelection(submission._id)}
                        className="mt-1 w-5 h-5"
                      />
                    )}
                    
                    <div className="p-2 rounded-lg bg-blue-50">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{submission.UserId?.firstName || "Unknown Student"}</h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.replace("_", " ")}
                        </Badge>
                        {submission.isLateSubmission && (
                          <Badge variant="destructive">Late</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{submission.UserId?.email}</p>
                      
                      <div className="flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(submission.submissionDate)}
                        </div>
                        
                        {submission.submittedFiles?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            {submission.submittedFiles.length} files
                          </div>
                        )}
                        
                        {submission.status === "graded" && (
                          <div className="flex items-center gap-1">
                            <Award className={`h-4 w-4 ${getGradeColor(submission.grade, submission.maxGrade || assignment?.maxMarks)}`} />
                            <span className={`font-semibold ${getGradeColor(submission.grade, submission.maxGrade || assignment?.maxMarks)}`}>
                              {submission.grade}/{submission.maxGrade || assignment?.maxMarks}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setViewSubmission(submission)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {submission.status !== "graded" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setGradeSubmission(submission);
                          setGradeForm({
                            grade: "",
                            feedback: "",
                            status: "graded"
                          });
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Grade
                      </Button>
                    )}
                    
                    {submission.status === "graded" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setGradeSubmission(submission);
                          setGradeForm({
                            grade: submission.grade?.toString() || "",
                            feedback: submission.feedback || "",
                            status: submission.status
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Submission Dialog */}
      <Dialog open={viewSubmission !== null} onOpenChange={() => setViewSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {viewSubmission && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{viewSubmission.UserId?.name}</h3>
                    <p className="text-sm text-gray-600">{viewSubmission.UserId?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge className={getStatusColor(viewSubmission.status)}>
                    {viewSubmission.status.replace("_", " ")}
                  </Badge>
                  {viewSubmission.isLateSubmission && (
                    <Badge variant="destructive">Late Submission</Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Submission Date</h4>
                <p className="text-gray-600">{formatDate(viewSubmission.submissionDate)}</p>
              </div>

              {viewSubmission.textContent && (
                <div>
                  <h4 className="font-semibold mb-2">Text Content</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="whitespace-pre-wrap">{viewSubmission.textContent}</p>
                  </div>
                </div>
              )}

              {viewSubmission.submittedFiles?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Submitted Files</h4>
                  <div className="space-y-2">
                    {viewSubmission.submittedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.fileName}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.fileSize / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewSubmission.links?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Submitted Links</h4>
                  <div className="space-y-2">
                    {viewSubmission.links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm bg-gray-50 p-2 rounded"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewSubmission.status === "graded" && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Grade</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-3xl font-bold ${getGradeColor(viewSubmission.grade, viewSubmission.maxGrade || assignment?.maxMarks)}`}>
                      {viewSubmission.grade}
                    </span>
                    <span className="text-xl text-gray-400">/ {viewSubmission.maxGrade || assignment?.maxMarks}</span>
                  </div>
                  
                  {viewSubmission.feedback && (
                    <>
                      <h4 className="font-semibold mb-2">Feedback</h4>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="whitespace-pre-wrap">{viewSubmission.feedback}</p>
                      </div>
                    </>
                  )}
                  
                  {viewSubmission.gradedBy && (
                    <p className="text-sm text-gray-600 mt-2">
                      Graded by {viewSubmission.gradedBy} on {formatDate(viewSubmission.gradedAt)}
                    </p>
                  )}
                </div>
              )}

              {viewSubmission.resubmissions?.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Resubmissions ({viewSubmission.resubmissions.length})</h4>
                  <div className="space-y-3">
                    {viewSubmission.resubmissions.map((resub, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(resub.submittedAt)}
                        </p>
                        {resub.submittedFiles?.length > 0 && (
                          <div className="space-y-1">
                            {resub.submittedFiles.map((file, j) => (
                              <p key={j} className="text-sm">{file.fileName}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={gradeSubmission !== null} onOpenChange={() => setGradeSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {gradeSubmission?.status === "graded" ? "Edit Grade" : "Grade Submission"}
            </DialogTitle>
          </DialogHeader>
          {gradeSubmission && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold">{gradeSubmission.UserId?.name}</p>
                <p className="text-sm text-gray-600">{gradeSubmission.UserId?.email}</p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Grade (out of {assignment?.maxMarks}) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max={assignment?.maxMarks}
                  value={gradeForm.grade}
                  onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  placeholder="Enter grade"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Feedback</label>
                <Textarea
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Provide feedback to the student..."
                  rows={5}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <select
                  value={gradeForm.status}
                  onChange={e => setGradeForm({ ...gradeForm, status: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="graded">Graded</option>
                  <option value="resubmission_required">Resubmission Required</option>
                </select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setGradeSubmission(null)}>
                  Cancel
                </Button>
                <Button onClick={gradeSubmissionHandler} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Grade"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AssignmentSubmissions;