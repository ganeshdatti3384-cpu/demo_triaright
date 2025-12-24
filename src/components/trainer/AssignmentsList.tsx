// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Search,
//   FileText,
//   Award,
//   Clock,
//   Paperclip,
//   Eye,
//   Edit,
//   Trash2,
//   Download,
//   BarChart3,
//   Users,
//   Calendar,
//   BookOpen,
//   ChevronRight,
//   AlertCircle,
//   CheckCircle,
//   X,
//   Save,
//   ExternalLink,
//   UserCheck,
//   FileCheck,
//   CalendarDays,
//   Tag,
//   ArrowLeft,
//   CheckSquare,
// } from "lucide-react";

// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";

// import CreateAssignment from "./CreateAssignment";
// import { motion, AnimatePresence } from "framer-motion";

// interface AssignmentListProps {
//   assignments: any[];
//   onDelete: (id: number) => void;
//   onCreated?: (data: any) => void;
//   onUpdate?: (id: number, data: any) => void;
// }

// const AssignmentList: React.FC<AssignmentListProps> = ({
//   assignments,
//   onDelete,
//   onCreated,
//   onUpdate,
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
//   const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
//   const [filter, setFilter] = useState<string>("all");
//   const [openCreate, setOpenCreate] = useState(false);
//   const [viewAssignment, setViewAssignment] = useState<any>(null);
//   const [editAssignment, setEditAssignment] = useState<any>(null);
//   const [editForm, setEditForm] = useState<any>({});

//   const handleCreated = (data: any) => {
//     onCreated?.(data);
//     setOpenCreate(false);
//   };

//   const handleSaveEdit = () => {
//     if (editAssignment && onUpdate) {
//       onUpdate(editAssignment.id, editForm);
//       setEditAssignment(null);
//       setEditForm({});
//     }
//   };

//   const handleEditClick = (assignment: any) => {
//     setEditAssignment(assignment);
//     setEditForm({
//       title: assignment.title || "",
//       description: assignment.description || "",
//       batch: assignment.batch || "",
//       maxMarks: assignment.maxMarks || 100,
//       status: assignment.status || "active",
//       submissionType: assignment.submissionType || "file",
//       instructions: assignment.instructions || "",
//       attachments: assignment.attachments || 0,
//     });
//   };

//   const handleViewClick = (assignment: any) => {
//     setViewAssignment(assignment);
//   };

//   // Filtered search
//   const filteredAssignments = assignments.filter((a) =>
//     a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     a.batch?.toLowerCase().includes(searchTerm.toLowerCase())
//   ).filter(a => {
//     if (filter === "all") return true;
//     if (filter === "active") return a.status === "active" || !a.status;
//     if (filter === "completed") return a.status === "completed";
//     if (filter === "upcoming") return a.status === "upcoming";
//     return true;
//   });

//   const formatDate = (date: string) => {
//     const d = new Date(date);
//     return d.toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "active": return "bg-green-100 text-green-800 border-green-200";
//       case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
//       case "upcoming": return "bg-amber-100 text-amber-800 border-amber-200";
//       case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const handleDelete = (id: number) => {
//     onDelete(id);
//     setDeleteConfirmId(null);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header + Create Button */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <motion.h2 
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-2xl md:text-3xl font-bold text-gray-900"
//           >
//             Assignments
//           </motion.h2>
//           <motion.p 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.1 }}
//             className="text-gray-600 text-sm md:text-base"
//           >
//             Manage and track student assignments
//           </motion.p>
//         </div>

//         {/* Modal Trigger */}
//         <Dialog open={openCreate} onOpenChange={setOpenCreate}>
//           <DialogTrigger asChild>
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
//                 <FileText className="h-4 w-4 mr-2" />
//                 Create Assignment
//               </Button>
//             </motion.div>
//           </DialogTrigger>

//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="text-xl">Create New Assignment</DialogTitle>
//               <DialogDescription>
//                 Fill in the details to create a new assignment for your students
//               </DialogDescription>
//             </DialogHeader>
//             <CreateAssignment onCreated={handleCreated} onOpenChange={setOpenCreate} />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Search and Filter Bar */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//       >
//         <Card className="shadow-sm border border-gray-200">
//           <CardContent className="p-4">
//             <div className="flex flex-col md:flex-row gap-4 md:items-center">
//               {/* Search */}
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search assignments by title, description, or batch..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 />
//               </div>

//               {/* Filter Buttons */}
//               <div className="flex items-center gap-2 flex-wrap">
//                 <Button
//                   variant={filter === "all" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setFilter("all")}
//                   className={`gap-1 ${filter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
//                 >
//                   All
//                 </Button>
//                 <Button
//                   variant={filter === "active" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setFilter("active")}
//                   className={`gap-1 ${filter === "active" ? "bg-green-600 hover:bg-green-700" : ""}`}
//                 >
//                   <CheckCircle className="h-3 w-3" />
//                   Active
//                 </Button>
//                 <Button
//                   variant={filter === "upcoming" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setFilter("upcoming")}
//                   className={`gap-1 ${filter === "upcoming" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
//                 >
//                   <Clock className="h-3 w-3" />
//                   Upcoming
//                 </Button>
//                 <Button
//                   variant={filter === "completed" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setFilter("completed")}
//                   className={`gap-1 ${filter === "completed" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
//                 >
//                   <Award className="h-3 w-3" />
//                   Completed
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Assignments List - Line by Line */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.3 }}
//         className="space-y-3"
//       >
//         <AnimatePresence>
//           {filteredAssignments.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className="text-center py-12"
//             >
//               <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-500 mb-2">No assignments found</h3>
//               <p className="text-gray-400">
//                 {searchTerm ? "Try adjusting your search terms" : "Create your first assignment to get started"}
//               </p>
//             </motion.div>
//           ) : (
//             filteredAssignments.map((assignment, index) => (
//               <motion.div
//                 key={assignment.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ delay: index * 0.05 }}
//                 layout
//               >
//                 <Card 
//                   className={`border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${
//                     expandedAssignment === assignment.id ? 'ring-2 ring-blue-500' : ''
//                   }`}
//                 >
//                   <CardContent className="p-5">
//                     {/* Main Assignment Row */}
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                       {/* Left Side - Assignment Info */}
//                       <div className="flex-1">
//                         <div className="flex items-start gap-3">
//                           <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
//                             <FileText className="h-5 w-5 text-blue-600" />
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex flex-wrap items-center gap-2 mb-2">
//                               <h3 className="font-bold text-lg text-gray-900">{assignment.title}</h3>
//                               <Badge className={getStatusColor(assignment.status)}>
//                                 {assignment.status || "Active"}
//                               </Badge>
//                               {assignment.batch && (
//                                 <span className="text-sm text-gray-500 flex items-center gap-1">
//                                   <BookOpen className="h-3 w-3" />
//                                   {assignment.batch}
//                                 </span>
//                               )}
//                             </div>
//                             <p className="text-gray-600 mb-3 line-clamp-2">
//                               {assignment.description || "No description provided"}
//                             </p>
                            
//                             {/* Metadata */}
//                             <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                               <div className="flex items-center gap-2">
//                                 <Calendar className="h-4 w-4 text-gray-400" />
//                                 <span>Due: {formatDate(assignment.dueDate)}</span>
//                                 {new Date(assignment.dueDate) < new Date() && (
//                                   <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
//                                 )}
//                               </div>
//                               {assignment.maxMarks && (
//                                 <div className="flex items-center gap-2">
//                                   <Award className="h-4 w-4 text-gray-400" />
//                                   <span>Marks: {assignment.maxMarks}</span>
//                                 </div>
//                               )}
//                               {(assignment.attachments || assignment.attachments === 0) && (
//                                 <div className="flex items-center gap-2">
//                                   <Paperclip className="h-4 w-4 text-gray-400" />
//                                   <span>Attachments: {assignment.attachments}</span>
//                                 </div>
//                               )}
//                               {assignment.submissionType && (
//                                 <div className="flex items-center gap-2">
//                                   <FileText className="h-4 w-4 text-gray-400" />
//                                   <span>Type: {assignment.submissionType}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Right Side - Action Buttons */}
//                       <div className="flex items-center gap-2">
//                         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="gap-1"
//                             onClick={() => handleViewClick(assignment)}
//                           >
//                             <Eye className="h-4 w-4" />
//                             <span className="hidden sm:inline">View</span>
//                           </Button>
//                         </motion.div>
                        
//                         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="gap-1"
//                             onClick={() => handleEditClick(assignment)}
//                           >
//                             <Edit className="h-4 w-4" />
//                             <span className="hidden sm:inline">Edit</span>
//                           </Button>
//                         </motion.div>

//                         <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             className="gap-1"
//                             onClick={() => setDeleteConfirmId(assignment.id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                             <span className="hidden sm:inline">Delete</span>
//                           </Button>
//                         </motion.div>

//                         <motion.div
//                           animate={{ rotate: expandedAssignment === assignment.id ? 90 : 0 }}
//                           transition={{ duration: 0.3 }}
//                         >
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => setExpandedAssignment(
//                               expandedAssignment === assignment.id ? null : assignment.id
//                             )}
//                           >
//                             <ChevronRight className="h-4 w-4" />
//                           </Button>
//                         </motion.div>
//                       </div>
//                     </div>

//                     {/* Expanded Details Section */}
//                     <AnimatePresence>
//                       {expandedAssignment === assignment.id && (
//                         <motion.div
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: "auto" }}
//                           exit={{ opacity: 0, height: 0 }}
//                           transition={{ duration: 0.3 }}
//                           className="overflow-hidden"
//                         >
//                           <div className="mt-4 pt-4 border-t space-y-4">
//                             <div>
//                               <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                                 <FileText className="h-4 w-4" />
//                                 Instructions
//                               </h4>
//                               <p className="text-gray-600">
//                                 {assignment.instructions || "No specific instructions provided."}
//                               </p>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div className="p-3 rounded-lg bg-blue-50">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <Users className="h-4 w-4 text-blue-600" />
//                                   <span className="font-medium">Total Students</span>
//                                 </div>
//                                 <p className="text-2xl font-bold">{assignment.totalStudents || 25}</p>
//                               </div>
                              
//                               <div className="p-3 rounded-lg bg-green-50">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <CheckCircle className="h-4 w-4 text-green-600" />
//                                   <span className="font-medium">Submissions</span>
//                                 </div>
//                                 <p className="text-2xl font-bold">{assignment.submissions || 0}</p>
//                               </div>
                              
//                               <div className="p-3 rounded-lg bg-purple-50">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <BarChart3 className="h-4 w-4 text-purple-600" />
//                                   <span className="font-medium">Progress</span>
//                                 </div>
//                                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                                   <div 
//                                     className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
//                                     style={{ 
//                                       width: `${Math.min(((assignment.submissions || 0) / (assignment.totalStudents || 25)) * 100, 100)}%` 
//                                     }}
//                                   />
//                                 </div>
//                                 <p className="text-sm mt-1">
//                                   {Math.round(((assignment.submissions || 0) / (assignment.totalStudents || 25)) * 100)}% submitted
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="flex flex-wrap gap-2">
//                               <Button variant="outline" className="gap-1">
//                                 <Download className="h-4 w-4" />
//                                 Download Submissions
//                               </Button>
//                               <Button variant="outline" className="gap-1">
//                                 <BarChart3 className="h-4 w-4" />
//                                 View Analytics
//                               </Button>
//                               <Button variant="outline" className="gap-1">
//                                 <Users className="h-4 w-4" />
//                                 Grade Students
//                               </Button>
//                             </div>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {/* View Assignment Dialog */}
//       <Dialog open={viewAssignment !== null} onOpenChange={() => setViewAssignment(null)}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="flex items-center gap-3"
//             >
//               <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
//                 <FileText className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <DialogTitle className="text-xl">{viewAssignment?.title}</DialogTitle>
//                 <DialogDescription>
//                   Assignment Details and Information
//                 </DialogDescription>
//               </div>
//             </motion.div>
//           </DialogHeader>

//           {viewAssignment && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.1 }}
//               className="space-y-6"
//             >
//               {/* Status and Batch */}
//               <div className="flex flex-wrap gap-3">
//                 <Badge className={getStatusColor(viewAssignment.status)}>
//                   {viewAssignment.status || "Active"}
//                 </Badge>
//                 {viewAssignment.batch && (
//                   <Badge variant="outline" className="gap-1">
//                     <BookOpen className="h-3 w-3" />
//                     {viewAssignment.batch}
//                   </Badge>
//                 )}
//                 <Badge variant="outline" className="gap-1">
//                   <Tag className="h-3 w-3" />
//                   {viewAssignment.submissionType || "File Upload"}
//                 </Badge>
//               </div>

//               {/* Description */}
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                   <FileText className="h-4 w-4" />
//                   Description
//                 </h3>
//                 <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
//                   {viewAssignment.description || "No description provided"}
//                 </p>
//               </div>

//               {/* Grid of Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                       <CalendarDays className="h-4 w-4" />
//                       Timeline
//                     </h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Created:</span>
//                         <span className="font-medium">{formatDate(viewAssignment.dueDate)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Due Date:</span>
//                         <span className={`font-medium ${new Date(viewAssignment.dueDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
//                           {formatDate(viewAssignment.dueDate)}
//                           {new Date(viewAssignment.dueDate) < new Date() && (
//                             <span className="ml-2 text-xs text-red-600">(Overdue)</span>
//                           )}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                       <Award className="h-4 w-4" />
//                       Grading
//                     </h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Max Marks:</span>
//                         <span className="font-medium">{viewAssignment.maxMarks || 100}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Submission Type:</span>
//                         <span className="font-medium capitalize">{viewAssignment.submissionType || "File"}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                       <Users className="h-4 w-4" />
//                       Submissions
//                     </h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Total Students:</span>
//                         <span className="font-medium">{viewAssignment.totalStudents || 25}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Submissions Received:</span>
//                         <span className="font-medium">{viewAssignment.submissions || 0}</span>
//                       </div>
//                       <div className="pt-2">
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-gray-600">Submission Progress</span>
//                           <span className="font-medium">
//                             {Math.round(((viewAssignment.submissions || 0) / (viewAssignment.totalStudents || 25)) * 100)}%
//                           </span>
//                         </div>
//                         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <motion.div 
//                             className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
//                             initial={{ width: 0 }}
//                             animate={{ 
//                               width: `${Math.min(((viewAssignment.submissions || 0) / (viewAssignment.totalStudents || 25)) * 100, 100)}%` 
//                             }}
//                             transition={{ duration: 1 }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                       <Paperclip className="h-4 w-4" />
//                       Resources
//                     </h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Attachments:</span>
//                         <span className="font-medium">{viewAssignment.attachments || 0}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Instructions */}
//               {viewAssignment.instructions && (
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                     <FileCheck className="h-4 w-4" />
//                     Instructions
//                   </h3>
//                   <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
//                     {viewAssignment.instructions}
//                   </p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3 pt-4 border-t">
//                 <Button variant="outline" className="gap-2">
//                   <Download className="h-4 w-4" />
//                   Download All Submissions
//                 </Button>
//                 <Button variant="outline" className="gap-2">
//                   <BarChart3 className="h-4 w-4" />
//                   View Analytics
//                 </Button>
//                 <Button variant="outline" className="gap-2">
//                   <UserCheck className="h-4 w-4" />
//                   Grade Students
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   className="gap-2 ml-auto"
//                   onClick={() => {
//                     setViewAssignment(null);
//                     handleEditClick(viewAssignment);
//                   }}
//                 >
//                   <Edit className="h-4 w-4" />
//                   Edit Assignment
//                 </Button>
//               </div>
//             </motion.div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Edit Assignment Dialog */}
//       <Dialog open={editAssignment !== null} onOpenChange={() => {
//         setEditAssignment(null);
//         setEditForm({});
//       }}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="flex items-center gap-3"
//             >
//               <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
//                 <Edit className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <DialogTitle className="text-xl">Edit Assignment</DialogTitle>
//                 <DialogDescription>
//                   Update assignment details and settings
//                 </DialogDescription>
//               </div>
//             </motion.div>
//           </DialogHeader>

//           {editAssignment && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="space-y-4"
//             >
//               {/* Title */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Assignment Title *
//                 </label>
//                 <input
//                   type="text"
//                   value={editForm.title}
//                   onChange={(e) => setEditForm({...editForm, title: e.target.value})}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   placeholder="Enter assignment title"
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={editForm.description}
//                   onChange={(e) => setEditForm({...editForm, description: e.target.value})}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
//                   placeholder="Enter assignment description"
//                 />
//               </div>

//               {/* Batch */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Batch
//                 </label>
//                 <select
//                   value={editForm.batch}
//                   onChange={(e) => setEditForm({...editForm, batch: e.target.value})}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 >
//                   <option value="">Select Batch</option>
//                   <option value="MERN-A">MERN-A</option>
//                   <option value="Python-B">Python-B</option>
//                   <option value="Java-C">Java-C</option>
//                   <option value="UI/UX-D">UI/UX-D</option>
//                 </select>
//               </div>

//               {/* Status and Marks */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={editForm.status}
//                     onChange={(e) => setEditForm({...editForm, status: e.target.value})}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   >
//                     <option value="active">Active</option>
//                     <option value="upcoming">Upcoming</option>
//                     <option value="completed">Completed</option>
//                     <option value="draft">Draft</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Maximum Marks
//                   </label>
//                   <input
//                     type="number"
//                     value={editForm.maxMarks}
//                     onChange={(e) => setEditForm({...editForm, maxMarks: e.target.value})}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     placeholder="Enter maximum marks"
//                   />
//                 </div>
//               </div>

//               {/* Submission Type and Attachments */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Submission Type
//                   </label>
//                   <select
//                     value={editForm.submissionType}
//                     onChange={(e) => setEditForm({...editForm, submissionType: e.target.value})}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   >
//                     <option value="file">File Upload</option>
//                     <option value="text">Text Submission</option>
//                     <option value="link">Link Submission</option>
//                     <option value="multiple">Multiple Files</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Attachments
//                   </label>
//                   <input
//                     type="number"
//                     value={editForm.attachments}
//                     onChange={(e) => setEditForm({...editForm, attachments: parseInt(e.target.value) || 0})}
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     placeholder="Number of attachments"
//                   />
//                 </div>
//               </div>

//               {/* Instructions */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Instructions
//                 </label>
//                 <textarea
//                   value={editForm.instructions}
//                   onChange={(e) => setEditForm({...editForm, instructions: e.target.value})}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
//                   placeholder="Enter detailed instructions for students"
//                 />
//               </div>

//               {/* Dialog Footer */}
//               <DialogFooter className="pt-4 border-t">
//                 <DialogClose asChild>
//                   <Button variant="outline" onClick={() => {
//                     setEditAssignment(null);
//                     setEditForm({});
//                   }}>
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </Button>
//                 </DialogClose>
//                 <Button 
//                   className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
//                   onClick={handleSaveEdit}
//                 >
//                   <Save className="h-4 w-4" />
//                   Save Changes
//                 </Button>
//               </DialogFooter>
//             </motion.div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
//         <DialogContent className="max-w-md">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//           >
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-600" />
//                 Confirm Delete
//               </DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to delete this assignment? This action cannot be undone.
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="p-4 bg-red-50 rounded-lg border border-red-200">
//               <p className="text-red-800 font-medium">
//                 {assignments.find(a => a.id === deleteConfirmId)?.title}
//               </p>
//               <p className="text-red-600 text-sm mt-1">
//                 All submission data will be permanently deleted.
//               </p>
//             </div>
            
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
//                   <X className="h-4 w-4 mr-2" />
//                   Cancel
//                 </Button>
//               </DialogClose>
//               <Button 
//                 variant="destructive"
//                 onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
//                 className="gap-2"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Delete Assignment
//               </Button>
//             </DialogFooter>
//           </motion.div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AssignmentList;

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
  CalendarDays, Tag, Loader2, Upload, RefreshCw,
} from "lucide-react";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:5007/api/livecourses";

const AssignmentList = () => {
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
  
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  
  const [openCreate, setOpenCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const [form, setForm] = useState({
    title: "", description: "", instructions: "",
    maxMarks: "100", dueDate: "", submissionType: "file",
    allowLateSubmission: false, status: "published", attachments: []
  });
  
  const [editForm, setEditForm] = useState({});

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

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedBatch(null);
    setBatches([]);
    fetchBatches(course._id);
    setStep(2);
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setStep(3);
  };

  const createAssignment = async () => {
    if (!selectedCourse || !selectedBatch || !form.title || !form.description || !form.dueDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("courseId", selectedCourse._id);
      formData.append("batchId", selectedBatch._id);
      Object.keys(form).forEach(key => {
        if (key !== "attachments") formData.append(key, form[key]);
      });
      form.attachments.forEach(file => formData.append("attachments", file));

      const res = await fetch(`${API_BASE_URL}/assignments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to create");

      toast({ title: "Success", description: "Assignment created!" });
      resetForm();
      setOpenCreate(false);
      fetchAssignments(true);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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

  const resetForm = () => {
    setStep(1);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setForm({
      title: "", description: "", instructions: "",
      maxMarks: "100", dueDate: "", submissionType: "file",
      allowLateSubmission: false, status: "published", attachments: []
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + form.attachments.length > 5) {
      toast({ title: "Error", description: "Max 5 files", variant: "destructive" });
      return;
    }
    setForm({ ...form, attachments: [...form.attachments, ...files] });
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
          
          <Dialog open={openCreate} onOpenChange={(open) => { setOpenCreate(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Assignment - Step {step}/3</DialogTitle>
              </DialogHeader>

              <div className="flex mb-6">
                {[1,2,3].map(s => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s <= step ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1 ${s < step ? "bg-blue-600" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Course</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {courses.map(c => (
                      <div key={c._id} onClick={() => handleCourseSelect(c)}
                        className="border p-4 rounded-lg hover:border-blue-500 cursor-pointer">
                        <h4 className="font-semibold">{c.courseName}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm"><strong>Course:</strong> {selectedCourse?.courseName}</p>
                  </div>
                  <h3 className="font-semibold">Select Batch</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {batches.map(b => (
                      <div key={b._id} onClick={() => handleBatchSelect(b)}
                        className="border p-4 rounded-lg hover:border-blue-500 cursor-pointer">
                        <h4 className="font-semibold">{b.batchName}</h4>
                        {b.students && <p className="text-sm text-gray-500">{b.students.length} students</p>}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded space-y-1">
                    <p className="text-sm"><strong>Course:</strong> {selectedCourse?.courseName}</p>
                    <p className="text-sm"><strong>Batch:</strong> {selectedBatch?.batchName}</p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Title *</label>
                    <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Description *</label>
                    <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Instructions</label>
                    <Textarea value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Max Marks</label>
                      <Input type="number" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value})} />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Due Date *</label>
                      <Input type="datetime-local" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Submission Type</label>
                    <select value={form.submissionType} onChange={e => setForm({...form, submissionType: e.target.value})}
                      className="w-full border rounded-md p-2">
                      <option value="file">File</option>
                      <option value="text">Text</option>
                      <option value="link">Link</option>
                      <option value="multiple">Multiple</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.allowLateSubmission}
                      onChange={e => setForm({...form, allowLateSubmission: e.target.checked})} />
                    <label className="text-sm">Allow late submissions</label>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                      className="w-full border rounded-md p-2">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Attachments (Max 5)</label>
                    <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="border-2 border-dashed p-4 rounded-lg flex flex-col items-center cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </label>
                    {form.attachments.map((f, i) => (
                      <div key={i} className="flex justify-between bg-gray-50 p-2 rounded mt-2">
                        <span className="text-sm">{f.name}</span>
                        <X className="w-4 h-4 cursor-pointer" onClick={() => 
                          setForm({...form, attachments: form.attachments.filter((_, idx) => idx !== i)})} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={createAssignment} disabled={submitting}>
                      {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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

              {/* Existing Attachments */}
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

              {/* Add New Attachments */}
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