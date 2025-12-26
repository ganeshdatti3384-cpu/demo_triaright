// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import React, { useEffect, useRef, useState } from "react";
// // import { createPortal } from "react-dom";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Input } from "@/components/ui/input";
// // import {
// //   Eye,
// //   Edit,
// //   Trash2,
// //   Video,
// //   Calendar,
// //   Clock,
// //   Users,
// //   ExternalLink,
// //   Download,
// //   FileText,
// //   UserPlus,
// //   AlertCircle,
// //   Save,
// //   X,
// // } from "lucide-react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { useToast } from "@/components/ui/use-toast";

// // interface SessionsListProps {
// //   sessions: any[];
// //   onDelete: (id: number) => void;
// //   onEdit?: (updated: any) => void;
// // }

// // const Modal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; title?: string; children?: React.ReactNode }> = ({ open, onOpenChange, title, children }) => {
// //   const elRef = useRef<HTMLDivElement | null>(null);

// //   useEffect(() => {
// //     let el = elRef.current;
// //     if (!el) {
// //       el = document.createElement("div");
// //       elRef.current = el;
// //     }
// //     document.body.appendChild(el);
// //     return () => {
// //       if (el && el.parentElement) el.parentElement.removeChild(el);
// //     };
// //   }, []);

// //   useEffect(() => {
// //     const onKey = (e: KeyboardEvent) => {
// //       if (e.key === "Escape") onOpenChange(false);
// //     };
// //     if (open) {
// //       document.addEventListener("keydown", onKey);
// //       document.body.style.overflow = "hidden";
// //     } else {
// //       document.body.style.overflow = "";
// //     }
// //     return () => {
// //       document.removeEventListener("keydown", onKey);
// //       document.body.style.overflow = "";
// //     };
// //   }, [open, onOpenChange]);

// //   if (!elRef.current) return null;

// //   return createPortal(
// //     <AnimatePresence>
// //       {open && (
// //         <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
// //           <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} aria-hidden />
// //           <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
// //             <div className="bg-white rounded-lg shadow-xl overflow-hidden">
// //               {title && <div className="px-6 py-4 border-b"><h3 className="text-lg font-semibold">{title}</h3></div>}
// //               <div className="p-6">{children}</div>
// //             </div>
// //           </motion.div>
// //         </motion.div>
// //       )}
// //     </AnimatePresence>,
// //     elRef.current
// //   );
// // };

// // const SessionsList: React.FC<SessionsListProps> = ({ sessions, onDelete, onEdit }) => {
// //   const { toast } = useToast();
// //   const [viewItem, setViewItem] = useState<any | null>(null);
// //   const [editItem, setEditItem] = useState<any | null>(null);
// //   const [deleteItem, setDeleteItem] = useState<any | null>(null);
// //   const [expandedSession, setExpandedSession] = useState<number | null>(null);
// //   const [editForm, setEditForm] = useState<any>({});

// //   const handleEditClick = (session: any) => {
// //     setEditItem(session);
// //     setEditForm({
// //       title: session.title || session.sessionTitle || "",
// //       date: session.date || session.scheduledDate?.substring(0, 10) || "",
// //       time: session.time || session.scheduledStartTime || "",
// //       duration: session.duration || "",
// //       meetingLink: session.meetingLink || "",
// //       course: session.course || "",
// //       batch: session.batch || "",
// //       status: session.status || "upcoming",
// //     });
// //   };

// //   const handleSaveEdit = () => {
// //     if (onEdit && editItem) {
// //       const updatedSession = {
// //         ...editItem,
// //         title: editForm.title,
// //         sessionTitle: editForm.title,
// //         date: editForm.date,
// //         scheduledDate: editForm.date,
// //         time: editForm.time,
// //         scheduledStartTime: editForm.time,
// //         duration: editForm.duration,
// //         meetingLink: editForm.meetingLink,
// //         course: editForm.course,
// //         batch: editForm.batch,
// //         status: editForm.status,
// //       };
// //       onEdit(updatedSession);
      
// //       toast({
// //         title: "Session Updated",
// //         description: "Session has been successfully updated.",
// //         variant: "default",
// //       });
// //     }
// //     setEditItem(null);
// //     setEditForm({});
// //   };

// //   const handleDeleteConfirm = () => {
// //     if (deleteItem) {
// //       onDelete(deleteItem.id);
// //       setDeleteItem(null);
// //       toast({
// //         title: "Session Deleted",
// //         description: "Session has been successfully deleted.",
// //         variant: "default",
// //       });
// //     }
// //   };

// //   const formatDate = (dateString: string) => {
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString("en-US", {
// //       weekday: "short",
// //       month: "short",
// //       day: "numeric",
// //       year: "numeric",
// //     });
// //   };

// //   const getSessionStatus = (session: any) => {
// //     const now = new Date();
// //     const sessionDate = new Date(session.date || session.scheduledDate || session.createdAt || Date.now());
// //     const isPast = sessionDate < now;

// //     if (isPast) return { text: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200" };

// //     const isToday = sessionDate.toDateString() === now.toDateString();
// //     if (isToday) return { text: "Live Today", color: "bg-green-100 text-green-800 border-green-200" };

// //     return { text: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" };
// //   };

// //   const calculateDuration = (time: string, duration: string | number) => {
// //     if (!time) return "N/A";
// //     const [hours, minutes] = (time || "").split(":").map(Number);
// //     const durationMinutes = Number(duration) || 60;
// //     const startDate = new Date();
// //     startDate.setHours(hours || 0, minutes || 0, 0, 0);
// //     const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
// //     const formatTime = (date: Date) =>
// //       date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// //     return `${formatTime(startDate)} - ${formatTime(endDate)}`;
// //   };

// //   return (
// //     <div className="space-y-6">
// //       {/* Sessions list card - Removed "Live Sessions" heading */}
// //       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
// //         <Card className="shadow-lg border-0">
// //           <CardContent className="p-6">
// //             <div className="mb-6">
// //               <Badge variant="outline" className="text-sm mb-2">
// //                 {sessions.length} session{sessions.length !== 1 ? 's' : ''}
// //               </Badge>
// //               <p className="text-gray-600 text-sm">Manage your scheduled live classes</p>
// //             </div>

// //             <AnimatePresence>
// //               {sessions.length === 0 ? (
// //                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-12">
// //                   <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
// //                   <h3 className="text-lg font-semibold text-gray-500 mb-2">No sessions scheduled</h3>
// //                   <p className="text-gray-400">Create your first live session to get started</p>
// //                 </motion.div>
// //               ) : (
// //                 <div className="space-y-3">
// //                   {sessions.map((session, index) => {
// //                     const status = getSessionStatus(session);
// //                     const durationText = calculateDuration(session.time || session.scheduledStartTime, session.duration);

// //                     return (
// //                       <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.04 }} layout>
// //                         <Card className={`border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${expandedSession === session.id ? "ring-2 ring-blue-500" : ""}`}>
// //                           <CardContent className="p-5">
// //                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //                               <div className="flex-1">
// //                                 <div className="flex items-start gap-3">
// //                                   <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
// //                                     <Video className="h-5 w-5 text-blue-600" />
// //                                   </div>
// //                                   <div className="flex-1">
// //                                     <div className="flex flex-wrap items-center gap-2 mb-2">
// //                                       <h3 className="font-bold text-lg text-gray-900">{session.title || session.sessionTitle}</h3>
// //                                       <Badge className={status.color}>{status.text}</Badge>
// //                                       {session.course && (<Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />{session.course}</Badge>)}
// //                                       {session.batch && (<Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{session.batch}</Badge>)}
// //                                     </div>

// //                                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
// //                                       <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{formatDate(session.date || session.scheduledDate)}</span></div>
// //                                       <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{durationText}</span></div>
// //                                       {session.duration && (<div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{session.duration} minutes</span></div>)}
// //                                       {session.meetingLink && (<div className="flex items-center gap-2"><ExternalLink className="h-4 w-4 text-gray-400" /><span className="text-blue-600 hover:underline cursor-pointer">Join Link</span></div>)}
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               </div>

// //                               <div className="flex items-center gap-2">
// //                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
// //                                   <Button size="sm" variant="outline" className="gap-1" onClick={() => setViewItem(session)}>
// //                                     <Eye className="h-4 w-4" />
// //                                     <span className="hidden sm:inline">View</span>
// //                                   </Button>
// //                                 </motion.div>

// //                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
// //                                   <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEditClick(session)}>
// //                                     <Edit className="h-4 w-4" />
// //                                     <span className="hidden sm:inline">Edit</span>
// //                                   </Button>
// //                                 </motion.div>

// //                                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
// //                                   <Button 
// //                                     size="sm" 
// //                                     variant="destructive" 
// //                                     className="gap-1" 
// //                                     onClick={() => setDeleteItem(session)}
// //                                   >
// //                                     <Trash2 className="h-4 w-4" />
// //                                     <span className="hidden sm:inline">Delete</span>
// //                                   </Button>
// //                                 </motion.div>
// //                               </div>
// //                             </div>

// //                             <AnimatePresence>
// //                               {expandedSession === session.id && (
// //                                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
// //                                   <div className="mt-4 pt-4 border-t space-y-4">
// //                                     {session.meetingLink && (
// //                                       <div>
// //                                         <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><ExternalLink className="h-4 w-4" />Meeting Link</h4>
// //                                         <p className="text-blue-600 break-all"><a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{session.meetingLink}</a></p>
// //                                       </div>
// //                                     )}

// //                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                                       <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" />Invite Students</Button>
// //                                       <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Download Materials</Button>
// //                                     </div>
// //                                   </div>
// //                                 </motion.div>
// //                               )}
// //                             </AnimatePresence>
// //                           </CardContent>
// //                         </Card>
// //                       </motion.div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </AnimatePresence>
// //           </CardContent>
// //         </Card>
// //       </motion.div>

// //       {/* VIEW MODAL - User can view session details */}
// //       <AnimatePresence>
// //         {viewItem && (
// //           <Modal open={!!viewItem} onOpenChange={() => setViewItem(null)} title="Session Details">
// //             <div className="space-y-6">
// //               <div className="flex items-start gap-3">
// //                 <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
// //                   <Video className="h-6 w-6 text-blue-600" />
// //                 </div>
// //                 <div className="flex-1">
// //                   <h3 className="font-bold text-xl text-gray-900">{viewItem.title || viewItem.sessionTitle}</h3>
// //                   <div className="flex items-center gap-2 mt-2">
// //                     <Badge className={getSessionStatus(viewItem).color}>
// //                       {getSessionStatus(viewItem).text}
// //                     </Badge>
// //                     {viewItem.course && (
// //                       <Badge variant="outline" className="gap-1">
// //                         <FileText className="h-3 w-3" />
// //                         {viewItem.course}
// //                       </Badge>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 <div className="space-y-4">
// //                   <div className="p-4 bg-gray-50 rounded-lg">
// //                     <div className="flex items-center gap-2 mb-2">
// //                       <Calendar className="h-5 w-5 text-gray-500" />
// //                       <h4 className="font-semibold text-gray-700">Date & Time</h4>
// //                     </div>
// //                     <p className="text-gray-600">{formatDate(viewItem.date || viewItem.scheduledDate)}</p>
// //                     <p className="text-gray-600">{calculateDuration(viewItem.time || viewItem.scheduledStartTime, viewItem.duration)}</p>
// //                   </div>

// //                   <div className="p-4 bg-gray-50 rounded-lg">
// //                     <div className="flex items-center gap-2 mb-2">
// //                       <Clock className="h-5 w-5 text-gray-500" />
// //                       <h4 className="font-semibold text-gray-700">Duration</h4>
// //                     </div>
// //                     <p className="text-gray-600">{viewItem.duration || 60} minutes</p>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4">
// //                   {viewItem.batch && (
// //                     <div className="p-4 bg-gray-50 rounded-lg">
// //                       <div className="flex items-center gap-2 mb-2">
// //                         <Users className="h-5 w-5 text-gray-500" />
// //                         <h4 className="font-semibold text-gray-700">Batch</h4>
// //                       </div>
// //                       <p className="text-gray-600">{viewItem.batch}</p>
// //                     </div>
// //                   )}

// //                   {viewItem.meetingLink && (
// //                     <div className="p-4 bg-gray-50 rounded-lg">
// //                       <div className="flex items-center gap-2 mb-2">
// //                         <ExternalLink className="h-5 w-5 text-gray-500" />
// //                         <h4 className="font-semibold text-gray-700">Meeting Link</h4>
// //                       </div>
// //                       <a 
// //                         href={viewItem.meetingLink} 
// //                         target="_blank" 
// //                         rel="noopener noreferrer" 
// //                         className="text-blue-600 hover:underline break-all"
// //                       >
// //                         {viewItem.meetingLink}
// //                       </a>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="pt-4 border-t flex flex-wrap gap-3">
// //                 <Button variant="outline" className="gap-2">
// //                   <UserPlus className="h-4 w-4" />
// //                   Invite Students
// //                 </Button>
// //                 <Button className="bg-blue-600 text-white gap-2">
// //                   <Video className="h-4 w-4" />
// //                   Join Session
// //                 </Button>
// //                 <Button 
// //                   variant="outline" 
// //                   className="gap-2 ml-auto"
// //                   onClick={() => {
// //                     setViewItem(null);
// //                     handleEditClick(viewItem);
// //                   }}
// //                 >
// //                   <Edit className="h-4 w-4" />
// //                   Edit Session
// //                 </Button>
// //               </div>
// //             </div>
// //           </Modal>
// //         )}
// //       </AnimatePresence>

// //       {/* EDIT MODAL - User can make changes */}
// //       <AnimatePresence>
// //         {editItem && (
// //           <Modal open={!!editItem} onOpenChange={() => { setEditItem(null); setEditForm({}); }} title="Edit Session">
// //             <div className="space-y-5">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Session Title <span className="text-red-500">*</span>
// //                 </label>
// //                 <Input
// //                   type="text"
// //                   value={editForm.title}
// //                   onChange={(e: any) => setEditForm({...editForm, title: e.target.value})}
// //                   placeholder="Enter session title"
// //                 />
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Date <span className="text-red-500">*</span>
// //                   </label>
// //                   <Input
// //                     type="date"
// //                     value={editForm.date}
// //                     onChange={(e: any) => setEditForm({...editForm, date: e.target.value})}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Start Time <span className="text-red-500">*</span>
// //                   </label>
// //                   <Input
// //                     type="time"
// //                     value={editForm.time}
// //                     onChange={(e: any) => setEditForm({...editForm, time: e.target.value})}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Duration (minutes)
// //                   </label>
// //                   <Input
// //                     type="number"
// //                     value={editForm.duration}
// //                     onChange={(e: any) => setEditForm({...editForm, duration: e.target.value})}
// //                     placeholder="e.g., 60"
// //                     min={1}
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Meeting Link <span className="text-red-500">*</span>
// //                   </label>
// //                   <Input
// //                     type="text"
// //                     value={editForm.meetingLink}
// //                     onChange={(e: any) => setEditForm({...editForm, meetingLink: e.target.value})}
// //                     placeholder="Zoom / Google Meet link"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Course
// //                   </label>
// //                   <select
// //                     value={editForm.course}
// //                     onChange={(e) => setEditForm({...editForm, course: e.target.value})}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
// //                   >
// //                     <option value="">-- Select Course --</option>
// //                     <option value="MERN">MERN Full Stack</option>
// //                     <option value="Python">Python</option>
// //                     <option value="Java">Java</option>
// //                     <option value="UI/UX">UI/UX Design</option>
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Batch
// //                   </label>
// //                   <select
// //                     value={editForm.batch}
// //                     onChange={(e) => setEditForm({...editForm, batch: e.target.value})}
// //                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
// //                   >
// //                     <option value="">-- Select Batch --</option>
// //                     <option value="Batch A">Batch A</option>
// //                     <option value="Batch B">Batch B</option>
// //                     <option value="Batch C">Batch C</option>
// //                   </select>
// //                 </div>
// //               </div>

// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Status
// //                 </label>
// //                 <select
// //                   value={editForm.status}
// //                   onChange={(e) => setEditForm({...editForm, status: e.target.value})}
// //                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
// //                 >
// //                   <option value="upcoming">Upcoming</option>
// //                   <option value="active">Active</option>
// //                   <option value="completed">Completed</option>
// //                   <option value="cancelled">Cancelled</option>
// //                 </select>
// //               </div>

// //               <div className="flex justify-end gap-3 pt-4 border-t">
// //                 <Button variant="outline" onClick={() => { setEditItem(null); setEditForm({}); }}>
// //                   <X className="h-4 w-4 mr-2" />
// //                   Cancel
// //                 </Button>
// //                 <Button 
// //                   className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2"
// //                   onClick={handleSaveEdit}
// //                 >
// //                   <Save className="h-4 w-4" />
// //                   Save Changes
// //                 </Button>
// //               </div>
// //             </div>
// //           </Modal>
// //         )}
// //       </AnimatePresence>

// //       {/* DELETE CONFIRMATION MODAL */}
// //       <AnimatePresence>
// //         {deleteItem && (
// //           <Modal open={!!deleteItem} onOpenChange={() => setDeleteItem(null)} title="Confirm Deletion">
// //             <div className="space-y-6">
// //               <div className="text-center">
// //                 <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4">
// //                   <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
// //                 </div>
// //                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
// //                   Delete Session?
// //                 </h3>
// //                 <p className="text-gray-600 mb-4">
// //                   Are you sure you want to delete the session <span className="font-semibold">"{deleteItem.title || deleteItem.sessionTitle}"</span>?
// //                 </p>
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <div className="grid grid-cols-2 gap-2 text-sm">
// //                     <div className="text-gray-500">Date:</div>
// //                     <div className="font-medium">{formatDate(deleteItem.date || deleteItem.scheduledDate)}</div>
// //                     <div className="text-gray-500">Time:</div>
// //                     <div className="font-medium">{calculateDuration(deleteItem.time || deleteItem.scheduledStartTime, deleteItem.duration)}</div>
// //                     <div className="text-gray-500">Batch:</div>
// //                     <div className="font-medium">{deleteItem.batch || "Not specified"}</div>
// //                   </div>
// //                 </div>
// //                 <p className="text-sm text-red-600 mt-4">
// //                   This action cannot be undone. All session data will be permanently deleted.
// //                 </p>
// //               </div>

// //               <div className="flex justify-center gap-3 pt-4">
// //                 <Button 
// //                   variant="outline" 
// //                   onClick={() => setDeleteItem(null)}
// //                   className="flex-1"
// //                 >
// //                   Cancel
// //                 </Button>
// //                 <Button 
// //                   variant="destructive"
// //                   onClick={handleDeleteConfirm}
// //                   className="flex-1 gap-2"
// //                 >
// //                   <Trash2 className="h-4 w-4" />
// //                   Delete Session
// //                 </Button>
// //               </div>
// //             </div>
// //           </Modal>
// //         )}
// //       </AnimatePresence>
// //     </div>
// //   );
// // };

// // export default SessionsList;

// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Calendar,
//   Clock,
//   Video,
//   Users,
//   BookOpen,
//   Eye,
//   Edit,
//   Trash2,
//   ExternalLink,
//   X,
//   Save,
//   AlertCircle,
// } from "lucide-react";

// // API base URL - replace with your actual API
// const API_BASE = "http://localhost:5007/api/livecourses";

// const SessionList = () => {
//   const { toast } = useToast();
  
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [batches, setBatches] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [currentSession, setCurrentSession] = useState(null);
  
//   const [editForm, setEditForm] = useState({
//     sessionTitle: "",
//     sessionNumber: "",
//     description: "",
//     scheduledDate: "",
//     scheduledStartTime: "",
//     scheduledEndTime: "",
//     meetingLink: ""
//   });

//   // Helper function to format duration - FIX FOR THE ERROR
//   const formatDuration = (duration) => {
//     if (!duration) return "N/A";
//     if (typeof duration === 'string') return duration;
//     // Handle object format like {value: 12, unit: "weeks"}
//     if (typeof duration === 'object' && duration.value && duration.unit) {
//       return `${duration.value} ${duration.unit}`;
//     }
//     return "N/A";
//   };

//   // Fetch trainer's courses on mount
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:5007/api/livecourses/trainer/assigned/courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
//       setCourses(data.courses || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch courses",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBatchesByCourse = async (courseId) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE}/admin/courses/${courseId}/batches`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
//       setBatches(data.batches || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch batches",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSessions = async (courseId) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE}/trainer/live-sessions?courseId=${courseId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
//       setSessions(data.sessions || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to fetch sessions",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCourseSelect = (course) => {
//     setSelectedCourse(course);
//     fetchBatchesByCourse(course._id);
//     fetchSessions(course._id);
//   };

//   const handleEditClick = (session) => {
//     setCurrentSession(session);
//     setEditForm({
//       sessionTitle: session.sessionTitle || "",
//       sessionNumber: session.sessionNumber || "",
//       description: session.description || "",
//       scheduledDate: session.scheduledDate?.substring(0, 10) || "",
//       scheduledStartTime: session.scheduledStartTime || "",
//       scheduledEndTime: session.scheduledEndTime || "",
//       meetingLink: session.meetingLink || ""
//     });
//     setShowEditModal(true);
//   };

//   const handleUpdateSession = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE}/trainer/live-sessions/${currentSession._id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(editForm)
//       });

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "Session updated successfully"
//         });
//         setShowEditModal(false);
//         fetchSessions(selectedCourse._id);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update session",
//         variant: "destructive"
//       });
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE}/trainer/live-sessions/${currentSession._id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "Session deleted successfully"
//         });
//         setShowDeleteModal(false);
//         fetchSessions(selectedCourse._id);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete session",
//         variant: "destructive"
//       });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//       year: "numeric"
//     });
//   };

//   const getStatusBadge = (status) => {
//     const variants = {
//       scheduled: "bg-blue-100 text-blue-800 border-blue-200",
//       live: "bg-green-100 text-green-800 border-green-200",
//       completed: "bg-gray-100 text-gray-800 border-gray-200",
//       cancelled: "bg-red-100 text-red-800 border-red-200"
//     };
//     return variants[status] || variants.scheduled;
//   };

//   const getSessionsByBatch = (batchId) => {
//     // Handle both direct batchId strings and populated batchId objects
//     return sessions.filter(session => {
//       const sessionBatchId = typeof session.batchId === 'object' ? session.batchId?._id : session.batchId;
//       return sessionBatchId === batchId;
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
//           <CardHeader>
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
//                 <Video className="h-8 w-8" />
//               </div>
//               <div>
//                 <CardTitle className="text-2xl font-bold">Live Session Management</CardTitle>
//                 <p className="text-blue-100 mt-1">Manage your live sessions by course and batch</p>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>

//         {/* Course Selection */}
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BookOpen className="h-5 w-5 text-blue-600" />
//               Select Course to View Sessions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading && !selectedCourse ? (
//               <div className="text-center py-8">
//                 <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
//                 <p className="text-gray-600 mt-4">Loading courses...</p>
//               </div>
//             ) : courses.length === 0 ? (
//               <div className="text-center py-8">
//                 <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-600">No courses found</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {courses.map((course) => (
//                   <Card
//                     key={course._id}
//                     className={`cursor-pointer transition-all hover:shadow-md ${
//                       selectedCourse?._id === course._id
//                         ? "ring-2 ring-blue-500 bg-blue-50"
//                         : "hover:border-blue-200"
//                     }`}
//                     onClick={() => handleCourseSelect(course)}
//                   >
//                     <CardContent className="p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 rounded-lg">
//                           <BookOpen className="h-5 w-5 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-900">
//                             {course.courseName}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             {formatDuration(course.duration)}
//                           </p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Batches and Sessions */}
//         {selectedCourse && (
//           <div className="space-y-6">
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
//                 <p className="text-gray-600 mt-4">Loading sessions...</p>
//               </div>
//             ) : batches.length === 0 ? (
//               <Card className="shadow-lg">
//                 <CardContent className="p-12 text-center">
//                   <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-500 mb-2">
//                     No batches found for this course
//                   </h3>
//                 </CardContent>
//               </Card>
//             ) : (
//               batches.map((batch) => {
//                 const batchSessions = getSessionsByBatch(batch._id);
                
//                 return (
//                   <Card key={batch._id} className="shadow-lg">
//                     <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 bg-purple-100 rounded-lg">
//                             <Users className="h-5 w-5 text-purple-600" />
//                           </div>
//                           <div>
//                             <CardTitle>{batch.batchName}</CardTitle>
//                             <p className="text-sm text-gray-600 mt-1">
//                               {batchSessions.length} session(s)
//                             </p>
//                           </div>
//                         </div>
//                         <Badge variant="outline">
//                           {batch.students?.length || batch.currentStudents || 0} Students
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-6">
//                       {batchSessions.length === 0 ? (
//                         <div className="text-center py-8">
//                           <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                           <p className="text-gray-600">No sessions for this batch</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-3">
//                           {batchSessions.map((session) => (
//                             <Card key={session._id} className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
//                               <CardContent className="p-4">
//                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                   <div className="flex-1">
//                                     <div className="flex items-start gap-3">
//                                       <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
//                                         <Video className="h-5 w-5 text-blue-600" />
//                                       </div>
//                                       <div className="flex-1">
//                                         <div className="flex flex-wrap items-center gap-2 mb-2">
//                                           {session.sessionNumber && (
//                                             <Badge variant="outline" className="text-xs">
//                                               Session {session.sessionNumber}
//                                             </Badge>
//                                           )}
//                                           <h3 className="font-bold text-lg text-gray-900">
//                                             {session.sessionTitle}
//                                           </h3>
//                                           <Badge className={getStatusBadge(session.status)}>
//                                             {session.status}
//                                           </Badge>
//                                         </div>
//                                         {session.description && (
//                                           <p className="text-sm text-gray-600 mb-2">
//                                             {session.description}
//                                           </p>
//                                         )}
//                                         <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                                           <div className="flex items-center gap-2">
//                                             <Calendar className="h-4 w-4 text-gray-400" />
//                                             <span>{formatDate(session.scheduledDate)}</span>
//                                           </div>
//                                           <div className="flex items-center gap-2">
//                                             <Clock className="h-4 w-4 text-gray-400" />
//                                             <span>
//                                               {session.scheduledStartTime || "N/A"}
//                                               {session.scheduledEndTime && ` - ${session.scheduledEndTime}`}
//                                             </span>
//                                           </div>
//                                           {session.meetingLink && (
//                                             <div className="flex items-center gap-2">
//                                               <ExternalLink className="h-4 w-4 text-gray-400" />
//                                               <a 
//                                                 href={session.meetingLink} 
//                                                 target="_blank" 
//                                                 rel="noopener noreferrer"
//                                                 className="text-blue-600 hover:underline"
//                                               >
//                                                 Join Link
//                                               </a>
//                                             </div>
//                                           )}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div className="flex items-center gap-2">
//                                     <Button
//                                       size="sm"
//                                       variant="outline"
//                                       className="gap-1"
//                                       onClick={() => handleEditClick(session)}
//                                     >
//                                       <Edit className="h-4 w-4" />
//                                       <span className="hidden sm:inline">Edit</span>
//                                     </Button>
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       className="gap-1"
//                                       onClick={() => {
//                                         setCurrentSession(session);
//                                         setShowDeleteModal(true);
//                                       }}
//                                     >
//                                       <Trash2 className="h-4 w-4" />
//                                       <span className="hidden sm:inline">Delete</span>
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           ))}
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 );
//               })
//             )}
//           </div>
//         )}
//       </div>

//       {/* Edit Modal */}
//       {showEditModal && currentSession && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => setShowEditModal(false)}
//           />
//           <div
//             className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Card className="shadow-2xl">
//               <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center gap-2">
//                     <Edit className="h-5 w-5 text-blue-600" />
//                     Edit Session
//                   </CardTitle>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowEditModal(false)}
//                     className="h-8 w-8 p-0"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-5">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Session Title <span className="text-red-500">*</span>
//                     </label>
//                     <Input
//                       value={editForm.sessionTitle}
//                       onChange={(e) =>
//                         setEditForm({ ...editForm, sessionTitle: e.target.value })
//                       }
//                       placeholder="Enter session title"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Session Number
//                       </label>
//                       <Input
//                         type="number"
//                         value={editForm.sessionNumber}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, sessionNumber: e.target.value })
//                         }
//                         placeholder="e.g., 1"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Date <span className="text-red-500">*</span>
//                       </label>
//                       <Input
//                         type="date"
//                         value={editForm.scheduledDate}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, scheduledDate: e.target.value })
//                         }
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Description
//                     </label>
//                     <textarea
//                       value={editForm.description}
//                       onChange={(e) =>
//                         setEditForm({ ...editForm, description: e.target.value })
//                       }
//                       placeholder="Session description"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                       rows={3}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Start Time <span className="text-red-500">*</span>
//                       </label>
//                       <Input
//                         type="time"
//                         value={editForm.scheduledStartTime}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, scheduledStartTime: e.target.value })
//                         }
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         End Time
//                       </label>
//                       <Input
//                         type="time"
//                         value={editForm.scheduledEndTime}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, scheduledEndTime: e.target.value })
//                         }
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Meeting Link <span className="text-red-500">*</span>
//                     </label>
//                     <Input
//                       value={editForm.meetingLink}
//                       onChange={(e) =>
//                         setEditForm({ ...editForm, meetingLink: e.target.value })
//                       }
//                       placeholder="Zoom / Google Meet link"
//                     />
//                   </div>

//                   <div className="flex justify-end gap-3 pt-4 border-t">
//                     <Button
//                       variant="outline"
//                       onClick={() => setShowEditModal(false)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleUpdateSession}
//                       className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2"
//                     >
//                       <Save className="h-4 w-4" />
//                       Save Changes
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteModal && currentSession && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => setShowDeleteModal(false)}
//           />
//           <div
//             className="relative w-full max-w-md"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Card className="shadow-2xl">
//               <CardContent className="p-6">
//                 <div className="text-center">
//                   <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4">
//                     <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                     Delete Session?
//                   </h3>
//                   <p className="text-gray-600 mb-6">
//                     Are you sure you want to delete "<span className="font-semibold">{currentSession.sessionTitle}</span>"? This action cannot be undone.
//                   </p>
//                   <div className="flex justify-center gap-3">
//                     <Button
//                       variant="outline"
//                       onClick={() => setShowDeleteModal(false)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       onClick={handleDeleteConfirm}
//                       className="gap-2"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                       Delete
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SessionList;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  Video,
  Users,
  BookOpen,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Save,
  AlertCircle,
  UserCheck,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  Upload,
  Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:5007/api/livecourses";

const SessionList = () => {
  const { toast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    sessionTitle: "",
    sessionNumber: "",
    description: "",
    scheduledDate: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    meetingLink: "",
    recordingUrl: "",
    recordingDuration: "",
    status: "scheduled",
    sessionMaterials: []
  });

  const [pendingFiles, setPendingFiles] = useState({});
  const [uploadingSession, setUploadingSession] = useState(false);

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    if (typeof duration === 'string') return duration;
    if (typeof duration === 'object' && duration.value && duration.unit) {
      return `${duration.value} ${duration.unit}`;
    }
    return "N/A";
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/trainer/assigned/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesByCourse = async (courseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/admin/courses/${courseId}/batches`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (courseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/trainer/live-sessions?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchStudents = async (batchId) => {
    setAttendanceLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/admin/batches/${batchId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBatchStudents(data.batch?.students || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batch students",
        variant: "destructive"
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchSessionAttendance = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/trainer/live-sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.session?.attendance && data.session.attendance.length > 0) {
        setExistingAttendance(data.session.attendance);
        const presentIds = data.session.attendance
          .filter(a => a.status === 'present')
          .map(a => a.studentId?._id || a.studentId);
        setSelectedStudents(presentIds);
      } else {
        setExistingAttendance(null);
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleAttendanceClick = async (session) => {
    setCurrentSession(session);
    const batchId = typeof session.batchId === 'object' ? session.batchId._id : session.batchId;
    
    await fetchBatchStudents(batchId);
    await fetchSessionAttendance(session._id);
    setShowAttendanceModal(true);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSubmitAttendance = async () => {
    if (!currentSession) return;
    
    setAttendanceLoading(true);
    try {
      const token = localStorage.getItem("token");
      const batchId = typeof currentSession.batchId === 'object' 
        ? currentSession.batchId._id 
        : currentSession.batchId;
      const sessionId = currentSession._id;
      
      const allStudentIds = batchStudents.map(s => s.UserId._id);
      const absentStudents = allStudentIds.filter(id => !selectedStudents.includes(id));
      
      const response = await fetch(
        `${API_BASE}/trainer/${batchId}/${sessionId}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            presentStudents: selectedStudents,
            absentStudents: absentStudents
          })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: existingAttendance 
            ? "Attendance updated successfully" 
            : "Attendance marked successfully"
        });
        setShowAttendanceModal(false);
        fetchSessions(selectedCourse._id);
      } else {
        throw new Error("Failed to submit attendance");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive"
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchBatchesByCourse(course._id);
    fetchSessions(course._id);
  };

  const handleEditClick = (session) => {
    setCurrentSession(session);
    setEditForm({
      sessionTitle: session.sessionTitle || "",
      sessionNumber: session.sessionNumber || "",
      description: session.description || "",
      scheduledDate: session.scheduledDate?.substring(0, 10) || "",
      scheduledStartTime: session.scheduledStartTime || "",
      scheduledEndTime: session.scheduledEndTime || "",
      meetingLink: session.meetingLink || "",
      recordingUrl: session.recordingUrl || "",
      recordingDuration: session.recordingDuration || "",
      status: session.status || "scheduled",
      sessionMaterials: session.sessionMaterials || []
    });
    setPendingFiles({});
    setShowEditModal(true);
  };

  // Upload file to S3 via backend
  const uploadFileToServer = async (file, sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("files", file); // Changed from "material" to "files"

      const response = await fetch(`${API_BASE}/trainer/live-sessions/${sessionId}/materials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns the updated session, get the last added material
        if (data.session?.sessionMaterials?.length > 0) {
          const lastMaterial = data.session.sessionMaterials[data.session.sessionMaterials.length - 1];
          return lastMaterial.url;
        }
        return data.url || data.fileUrl || data.materialUrl;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateSession = async () => {
    setUploadingSession(true);
    try {
      const token = localStorage.getItem("token");
      
      // First, upload any pending files
      const updatedMaterials = [...editForm.sessionMaterials];
      
      for (let i = 0; i < updatedMaterials.length; i++) {
        if (pendingFiles[i]) {
          try {
            toast({
              title: "Uploading",
              description: `Uploading ${updatedMaterials[i].title || 'file'}...`
            });
            
            const uploadedUrl = await uploadFileToServer(pendingFiles[i], currentSession._id);
            updatedMaterials[i].url = uploadedUrl;
          } catch (error) {
            toast({
              title: "Upload Error",
              description: `Failed to upload ${updatedMaterials[i].title || 'file'}: ${error.message}`,
              variant: "destructive"
            });
            setUploadingSession(false);
            return;
          }
        }
      }

      // Then update the session with all data including uploaded material URLs
      const updateData = {
        sessionTitle: editForm.sessionTitle,
        sessionNumber: editForm.sessionNumber,
        description: editForm.description,
        scheduledDate: editForm.scheduledDate,
        scheduledStartTime: editForm.scheduledStartTime,
        scheduledEndTime: editForm.scheduledEndTime,
        meetingLink: editForm.meetingLink,
        recordingUrl: editForm.recordingUrl,
        recordingDuration: editForm.recordingDuration ? Number(editForm.recordingDuration) : undefined,
        status: editForm.status,
        sessionMaterials: updatedMaterials
      };

      const response = await fetch(`${API_BASE}/trainer/live-sessions/${currentSession._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session updated successfully"
        });
        setShowEditModal(false);
        setPendingFiles({});
        fetchSessions(selectedCourse._id);
      } else {
        throw new Error("Failed to update session");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update session",
        variant: "destructive"
      });
    } finally {
      setUploadingSession(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/trainer/live-sessions/${currentSession._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session deleted successfully"
        });
        setShowDeleteModal(false);
        fetchSessions(selectedCourse._id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      live: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return variants[status] || variants.scheduled;
  };

  const getSessionsByBatch = (batchId) => {
    return sessions.filter(session => {
      const sessionBatchId = typeof session.batchId === 'object' ? session.batchId?._id : session.batchId;
      return sessionBatchId === batchId;
    });
  };

  // Material helper functions
  const addMaterial = () => {
    setEditForm({
      ...editForm,
      sessionMaterials: [
        ...editForm.sessionMaterials,
        { type: "document", title: "", url: "" }
      ]
    });
  };

  const removeMaterial = (index) => {
    const updatedMaterials = editForm.sessionMaterials.filter((_, i) => i !== index);
    setEditForm({ ...editForm, sessionMaterials: updatedMaterials });
    
    // Also remove pending file if exists
    setPendingFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const updateMaterial = (index, field, value) => {
    const updatedMaterials = [...editForm.sessionMaterials];
    updatedMaterials[index][field] = value;
    setEditForm({ ...editForm, sessionMaterials: updatedMaterials });
  };

  const handleFileSelect = (index, file) => {
    if (!file) return;
    
    // Store the file for later upload
    setPendingFiles(prev => ({
      ...prev,
      [index]: file
    }));
    
    // Update the title if empty
    if (!editForm.sessionMaterials[index].title) {
      updateMaterial(index, 'title', file.name.split('.')[0]);
    }
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4" />;
      case "video": return <Film className="h-4 w-4" />;
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "link": return <LinkIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Video className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Live Session Management</CardTitle>
                <p className="text-blue-100 mt-1">Manage your live sessions by course and batch</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Course Selection */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Select Course to View Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !selectedCourse ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card
                    key={course._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCourse?._id === course._id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-blue-200"
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {course.courseName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDuration(course.duration)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batches and Sessions */}
        {selectedCourse && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading sessions...</p>
              </div>
            ) : batches.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">
                    No batches found for this course
                  </h3>
                </CardContent>
              </Card>
            ) : (
              batches.map((batch) => {
                const batchSessions = getSessionsByBatch(batch._id);
          
                return (
                  <Card key={batch._id} className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle>{batch.batchName}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              {batchSessions.length} session(s)
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {batch.students?.length || batch.currentStudents || 0} Students
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {batchSessions.length === 0 ? (
                        <div className="text-center py-8">
                          <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No sessions for this batch</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {batchSessions.map((session) => (
                            <Card key={session._id} className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
                                        <Video className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          {session.sessionNumber && (
                                            <Badge variant="outline" className="text-xs">
                                              Session {session.sessionNumber}
                                            </Badge>
                                          )}
                                          <h3 className="font-bold text-lg text-gray-900">
                                            {session.sessionTitle}
                                          </h3>
                                          <Badge className={getStatusBadge(session.status)}>
                                            {session.status}
                                          </Badge>
                                          {session.attendance && session.attendance.length > 0 && (
                                            <Badge className="bg-green-100 text-green-800">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Attendance Marked
                                            </Badge>
                                          )}
                                        </div>
                                        {session.description && (
                                          <p className="text-sm text-gray-600 mb-2">
                                            {session.description}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{formatDate(session.scheduledDate)}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>
                                              {session.scheduledStartTime || "N/A"}
                                              {session.scheduledEndTime && ` - ${session.scheduledEndTime}`}
                                            </span>
                                          </div>
                                          {session.meetingLink && (
                                            <div className="flex items-center gap-2">
                                              <ExternalLink className="h-4 w-4 text-gray-400" />
                                              <a 
                                                href={session.meetingLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                Join Link
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 bg-green-50 hover:bg-green-100"
                                      onClick={() => handleAttendanceClick(session)}
                                    >
                                      <UserCheck className="h-4 w-4" />
                                      <span className="hidden sm:inline">
                                        {session.attendance && session.attendance.length > 0 
                                          ? "View" 
                                          : "Mark"}
                                      </span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1"
                                      onClick={() => handleEditClick(session)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1"
                                      onClick={() => {
                                        setCurrentSession(session);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAttendanceModal(false)}
          />
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      {existingAttendance ? "View/Edit Attendance" : "Mark Attendance"}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentSession.sessionTitle} - {formatDate(currentSession.scheduledDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttendanceModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {attendanceLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading students...</p>
                  </div>
                ) : batchStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No students enrolled in this batch</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Total Students: {batchStudents.length}
                        </p>
                        <p className="text-sm text-gray-600">
                          Present: {selectedStudents.length} | Absent: {batchStudents.length - selectedStudents.length}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudents(batchStudents.map(s => s.UserId._id))}
                        >
                          Select All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudents([])}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {batchStudents.map((student) => {
                        const isSelected = selectedStudents.includes(student.UserId._id);
                        
                        return (
                          <div
                            key={student._id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-green-50 border-green-300"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleStudentToggle(student.UserId._id)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                isSelected ? "bg-green-500" : "bg-gray-400"
                              }`}>
                                {student.UserId.firstName.charAt(0)}{student.UserId.lastName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.UserId.firstName} {student.UserId.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{student.UserId.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <Badge className="bg-green-100 text-green-800 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Present
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Absent
                                </Badge>
                              )}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleStudentToggle(student.UserId._id)}
                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowAttendanceModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitAttendance}
                        disabled={attendanceLoading}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white gap-2"
                      >
                        {attendanceLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {existingAttendance ? "Update Attendance" : "Submit Attendance"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-blue-600" />
                    Edit Session
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Title <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={editForm.sessionTitle} 
                      onChange={(e) => setEditForm({ ...editForm, sessionTitle: e.target.value })}
                      placeholder="Enter session title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Number
                      </label>
                      <Input
                        type="number"
                        value={editForm.sessionNumber}
                        onChange={(e) => setEditForm({ ...editForm, sessionNumber: e.target.value })}
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={editForm.scheduledDate}
                        onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="time"
                        value={editForm.scheduledStartTime}
                        onChange={(e) => setEditForm({ ...editForm, scheduledStartTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={editForm.scheduledEndTime}
                      onChange={(e) => setEditForm({ ...editForm, scheduledEndTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Session description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editForm.meetingLink}
                      onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                      placeholder="Zoom / Google Meet link"
                    />
                  </div>

                  {/* Recording Section */}
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      Session Recording
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recording URL
                        </label>
                        <Input
                          value={editForm.recordingUrl}
                          onChange={(e) => setEditForm({ ...editForm, recordingUrl: e.target.value })}
                          placeholder="https://recording-url.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <Input
                          type="number"
                          value={editForm.recordingDuration}
                          onChange={(e) => setEditForm({ ...editForm, recordingDuration: e.target.value })}
                          placeholder="e.g., 60"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Session Materials Section */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Session Materials
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addMaterial}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Material
                      </Button>
                    </div>
                    
                    {editForm.sessionMaterials.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No materials added yet</p>
                        <p className="text-xs text-gray-500 mt-1">Click "Add Material" to attach resources</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editForm.sessionMaterials.map((material, index) => (
                          <Card key={index} className="border-l-4 border-l-purple-500">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Type
                                      </label>
                                      <select
                                        value={material.type}
                                        onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                                      >
                                        <option value="document">Document</option>
                                        <option value="video">Video</option>
                                        <option value="image">Image</option>
                                        <option value="link">Link</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Title
                                      </label>
                                      <Input
                                        value={material.title}
                                        onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                                        placeholder="Material title"
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeMaterial(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-5"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {/* File Upload or URL Input based on type */}
                                {material.type === "link" ? (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      URL
                                    </label>
                                    <div className="flex items-center gap-2">
                                      {getMaterialIcon(material.type)}
                                      <Input
                                        value={material.url}
                                        onChange={(e) => updateMaterial(index, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Select File (will upload on save)
                                    </label>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer">
                                          <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors">
                                            {pendingFiles[index] ? (
                                              <>
                                                <FileText className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm text-gray-700 truncate">
                                                  {pendingFiles[index].name}
                                                </span>
                                                <Badge className="ml-auto bg-amber-100 text-amber-800">
                                                  Ready to upload
                                                </Badge>
                                              </>
                                            ) : material.url ? (
                                              <>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-700 truncate">
                                                  File already uploaded
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <Upload className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                  Choose file to upload
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept={
                                              material.type === "document" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" :
                                              material.type === "video" ? "video/*" :
                                              material.type === "image" ? "image/*" : "*"
                                            }
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                handleFileSelect(index, file);
                                              }
                                              e.target.value = '';
                                            }}
                                          />
                                        </label>
                                      </div>
                                      {material.url && !pendingFiles[index] && (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                          <span className="text-xs text-green-700 truncate flex-1">
                                            Current file uploaded
                                          </span>
                                          <a
                                            href={material.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex-shrink-0"
                                          >
                                            View
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      disabled={uploadingSession}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSession}
                      disabled={uploadingSession}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2"
                    >
                      {uploadingSession ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading & Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Session?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "<span className="font-semibold">{currentSession.sessionTitle}</span>"? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteConfirm}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;