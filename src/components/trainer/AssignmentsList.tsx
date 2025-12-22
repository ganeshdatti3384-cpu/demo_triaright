/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Award,
  Clock,
  Paperclip,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Users,
  Calendar,
  BookOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  ExternalLink,
  UserCheck,
  FileCheck,
  CalendarDays,
  Tag,
  ArrowLeft,
  CheckSquare,
} from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import CreateAssignment from "./CreateAssignment";
import { motion, AnimatePresence } from "framer-motion";

interface AssignmentListProps {
  assignments: any[];
  onDelete: (id: number) => void;
  onCreated?: (data: any) => void;
  onUpdate?: (id: number, data: any) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  onDelete,
  onCreated,
  onUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<any>(null);
  const [editAssignment, setEditAssignment] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleCreated = (data: any) => {
    onCreated?.(data);
    setOpenCreate(false);
  };

  const handleSaveEdit = () => {
    if (editAssignment && onUpdate) {
      onUpdate(editAssignment.id, editForm);
      setEditAssignment(null);
      setEditForm({});
    }
  };

  const handleEditClick = (assignment: any) => {
    setEditAssignment(assignment);
    setEditForm({
      title: assignment.title || "",
      description: assignment.description || "",
      batch: assignment.batch || "",
      maxMarks: assignment.maxMarks || 100,
      status: assignment.status || "active",
      submissionType: assignment.submissionType || "file",
      instructions: assignment.instructions || "",
      attachments: assignment.attachments || 0,
    });
  };

  const handleViewClick = (assignment: any) => {
    setViewAssignment(assignment);
  };

  // Filtered search
  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(a => {
    if (filter === "all") return true;
    if (filter === "active") return a.status === "active" || !a.status;
    if (filter === "completed") return a.status === "completed";
    if (filter === "upcoming") return a.status === "upcoming";
    return true;
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "upcoming": return "bg-amber-100 text-amber-800 border-amber-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDelete = (id: number) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header + Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-900"
          >
            Assignments
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm md:text-base"
          >
            Manage and track student assignments
          </motion.p>
        </div>

        {/* Modal Trigger */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                <FileText className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </motion.div>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Assignment</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new assignment for your students
              </DialogDescription>
            </DialogHeader>
            <CreateAssignment onCreated={handleCreated} onOpenChange={setOpenCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments by title, description, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={`gap-1 ${filter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  All
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("active")}
                  className={`gap-1 ${filter === "active" ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Button>
                <Button
                  variant={filter === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("upcoming")}
                  className={`gap-1 ${filter === "upcoming" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                >
                  <Clock className="h-3 w-3" />
                  Upcoming
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("completed")}
                  className={`gap-1 ${filter === "completed" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  <Award className="h-3 w-3" />
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assignments List - Line by Line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredAssignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No assignments found</h3>
              <p className="text-gray-400">
                {searchTerm ? "Try adjusting your search terms" : "Create your first assignment to get started"}
              </p>
            </motion.div>
          ) : (
            filteredAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  className={`border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${
                    expandedAssignment === assignment.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-5">
                    {/* Main Assignment Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Side - Assignment Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg text-gray-900">{assignment.title}</h3>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status || "Active"}
                              </Badge>
                              {assignment.batch && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {assignment.batch}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {assignment.description || "No description provided"}
                            </p>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>Due: {formatDate(assignment.dueDate)}</span>
                                {new Date(assignment.dueDate) < new Date() && (
                                  <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                                )}
                              </div>
                              {assignment.maxMarks && (
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-gray-400" />
                                  <span>Marks: {assignment.maxMarks}</span>
                                </div>
                              )}
                              {(assignment.attachments || assignment.attachments === 0) && (
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-gray-400" />
                                  <span>Attachments: {assignment.attachments}</span>
                                </div>
                              )}
                              {assignment.submissionType && (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span>Type: {assignment.submissionType}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Action Buttons */}
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleViewClick(assignment)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleEditClick(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => setDeleteConfirmId(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </motion.div>

                        <motion.div
                          animate={{ rotate: expandedAssignment === assignment.id ? 90 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedAssignment(
                              expandedAssignment === assignment.id ? null : assignment.id
                            )}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    <AnimatePresence>
                      {expandedAssignment === assignment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Instructions
                              </h4>
                              <p className="text-gray-600">
                                {assignment.instructions || "No specific instructions provided."}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 rounded-lg bg-blue-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Total Students</span>
                                </div>
                                <p className="text-2xl font-bold">{assignment.totalStudents || 25}</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-green-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">Submissions</span>
                                </div>
                                <p className="text-2xl font-bold">{assignment.submissions || 0}</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-purple-50">
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart3 className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">Progress</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                    style={{ 
                                      width: `${Math.min(((assignment.submissions || 0) / (assignment.totalStudents || 25)) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                                <p className="text-sm mt-1">
                                  {Math.round(((assignment.submissions || 0) / (assignment.totalStudents || 25)) * 100)}% submitted
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" className="gap-1">
                                <Download className="h-4 w-4" />
                                Download Submissions
                              </Button>
                              <Button variant="outline" className="gap-1">
                                <BarChart3 className="h-4 w-4" />
                                View Analytics
                              </Button>
                              <Button variant="outline" className="gap-1">
                                <Users className="h-4 w-4" />
                                Grade Students
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* View Assignment Dialog */}
      <Dialog open={viewAssignment !== null} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">{viewAssignment?.title}</DialogTitle>
                <DialogDescription>
                  Assignment Details and Information
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>

          {viewAssignment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Status and Batch */}
              <div className="flex flex-wrap gap-3">
                <Badge className={getStatusColor(viewAssignment.status)}>
                  {viewAssignment.status || "Active"}
                </Badge>
                {viewAssignment.batch && (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    {viewAssignment.batch}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {viewAssignment.submissionType || "File Upload"}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {viewAssignment.description || "No description provided"}
                </p>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Timeline
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(viewAssignment.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className={`font-medium ${new Date(viewAssignment.dueDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                          {formatDate(viewAssignment.dueDate)}
                          {new Date(viewAssignment.dueDate) < new Date() && (
                            <span className="ml-2 text-xs text-red-600">(Overdue)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Grading
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Marks:</span>
                        <span className="font-medium">{viewAssignment.maxMarks || 100}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Type:</span>
                        <span className="font-medium capitalize">{viewAssignment.submissionType || "File"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Submissions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Students:</span>
                        <span className="font-medium">{viewAssignment.totalStudents || 25}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submissions Received:</span>
                        <span className="font-medium">{viewAssignment.submissions || 0}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Submission Progress</span>
                          <span className="font-medium">
                            {Math.round(((viewAssignment.submissions || 0) / (viewAssignment.totalStudents || 25)) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(((viewAssignment.submissions || 0) / (viewAssignment.totalStudents || 25)) * 100, 100)}%` 
                            }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Resources
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Attachments:</span>
                        <span className="font-medium">{viewAssignment.attachments || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {viewAssignment.instructions && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Instructions
                  </h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                    {viewAssignment.instructions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download All Submissions
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Grade Students
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 ml-auto"
                  onClick={() => {
                    setViewAssignment(null);
                    handleEditClick(viewAssignment);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Assignment
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editAssignment !== null} onOpenChange={() => {
        setEditAssignment(null);
        setEditForm({});
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Edit Assignment</DialogTitle>
                <DialogDescription>
                  Update assignment details and settings
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>

          {editAssignment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter assignment title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                  placeholder="Enter assignment description"
                />
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <select
                  value={editForm.batch}
                  onChange={(e) => setEditForm({...editForm, batch: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Batch</option>
                  <option value="MERN-A">MERN-A</option>
                  <option value="Python-B">Python-B</option>
                  <option value="Java-C">Java-C</option>
                  <option value="UI/UX-D">UI/UX-D</option>
                </select>
              </div>

              {/* Status and Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={editForm.maxMarks}
                    onChange={(e) => setEditForm({...editForm, maxMarks: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter maximum marks"
                  />
                </div>
              </div>

              {/* Submission Type and Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Type
                  </label>
                  <select
                    value={editForm.submissionType}
                    onChange={(e) => setEditForm({...editForm, submissionType: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="file">File Upload</option>
                    <option value="text">Text Submission</option>
                    <option value="link">Link Submission</option>
                    <option value="multiple">Multiple Files</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <input
                    type="number"
                    value={editForm.attachments}
                    onChange={(e) => setEditForm({...editForm, attachments: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Number of attachments"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={editForm.instructions}
                  onChange={(e) => setEditForm({...editForm, instructions: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
                  placeholder="Enter detailed instructions for students"
                />
              </div>

              {/* Dialog Footer */}
              <DialogFooter className="pt-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setEditAssignment(null);
                    setEditForm({});
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
                  onClick={handleSaveEdit}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Confirm Delete
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this assignment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">
                {assignments.find(a => a.id === deleteConfirmId)?.title}
              </p>
              <p className="text-red-600 text-sm mt-1">
                All submission data will be permanently deleted.
              </p>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Assignment
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentList;