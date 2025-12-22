/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Edit,
  Trash2,
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Download,
  FileText,
  UserPlus,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface SessionsListProps {
  sessions: any[];
  onDelete: (id: number) => void;
  onEdit?: (updated: any) => void;
}

const Modal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; title?: string; children?: React.ReactNode }> = ({ open, onOpenChange, title, children }) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let el = elRef.current;
    if (!el) {
      el = document.createElement("div");
      elRef.current = el;
    }
    document.body.appendChild(el);
    return () => {
      if (el && el.parentElement) el.parentElement.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!elRef.current) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} aria-hidden />
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {title && <div className="px-6 py-4 border-b"><h3 className="text-lg font-semibold">{title}</h3></div>}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    elRef.current
  );
};

const SessionsList: React.FC<SessionsListProps> = ({ sessions, onDelete, onEdit }) => {
  const { toast } = useToast();
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEditClick = (session: any) => {
    setEditItem(session);
    setEditForm({
      title: session.title || session.sessionTitle || "",
      date: session.date || session.scheduledDate?.substring(0, 10) || "",
      time: session.time || session.scheduledStartTime || "",
      duration: session.duration || "",
      meetingLink: session.meetingLink || "",
      course: session.course || "",
      batch: session.batch || "",
      status: session.status || "upcoming",
    });
  };

  const handleSaveEdit = () => {
    if (onEdit && editItem) {
      const updatedSession = {
        ...editItem,
        title: editForm.title,
        sessionTitle: editForm.title,
        date: editForm.date,
        scheduledDate: editForm.date,
        time: editForm.time,
        scheduledStartTime: editForm.time,
        duration: editForm.duration,
        meetingLink: editForm.meetingLink,
        course: editForm.course,
        batch: editForm.batch,
        status: editForm.status,
      };
      onEdit(updatedSession);
      
      toast({
        title: "Session Updated",
        description: "Session has been successfully updated.",
        variant: "default",
      });
    }
    setEditItem(null);
    setEditForm({});
  };

  const handleDeleteConfirm = () => {
    if (deleteItem) {
      onDelete(deleteItem.id);
      setDeleteItem(null);
      toast({
        title: "Session Deleted",
        description: "Session has been successfully deleted.",
        variant: "default",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSessionStatus = (session: any) => {
    const now = new Date();
    const sessionDate = new Date(session.date || session.scheduledDate || session.createdAt || Date.now());
    const isPast = sessionDate < now;

    if (isPast) return { text: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200" };

    const isToday = sessionDate.toDateString() === now.toDateString();
    if (isToday) return { text: "Live Today", color: "bg-green-100 text-green-800 border-green-200" };

    return { text: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" };
  };

  const calculateDuration = (time: string, duration: string | number) => {
    if (!time) return "N/A";
    const [hours, minutes] = (time || "").split(":").map(Number);
    const durationMinutes = Number(duration) || 60;
    const startDate = new Date();
    startDate.setHours(hours || 0, minutes || 0, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  return (
    <div className="space-y-6">
      {/* Sessions list card - Removed "Live Sessions" heading */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <Badge variant="outline" className="text-sm mb-2">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </Badge>
              <p className="text-gray-600 text-sm">Manage your scheduled live classes</p>
            </div>

            <AnimatePresence>
              {sessions.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-12">
                  <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">No sessions scheduled</h3>
                  <p className="text-gray-400">Create your first live session to get started</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => {
                    const status = getSessionStatus(session);
                    const durationText = calculateDuration(session.time || session.scheduledStartTime, session.duration);

                    return (
                      <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.04 }} layout>
                        <Card className={`border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 ${expandedSession === session.id ? "ring-2 ring-blue-500" : ""}`}>
                          <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 mt-1">
                                    <Video className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <h3 className="font-bold text-lg text-gray-900">{session.title || session.sessionTitle}</h3>
                                      <Badge className={status.color}>{status.text}</Badge>
                                      {session.course && (<Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />{session.course}</Badge>)}
                                      {session.batch && (<Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{session.batch}</Badge>)}
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{formatDate(session.date || session.scheduledDate)}</span></div>
                                      <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{durationText}</span></div>
                                      {session.duration && (<div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{session.duration} minutes</span></div>)}
                                      {session.meetingLink && (<div className="flex items-center gap-2"><ExternalLink className="h-4 w-4 text-gray-400" /><span className="text-blue-600 hover:underline cursor-pointer">Join Link</span></div>)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setViewItem(session)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline">View</span>
                                  </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleEditClick(session)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="gap-1" 
                                    onClick={() => setDeleteItem(session)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </Button>
                                </motion.div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedSession === session.id && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                  <div className="mt-4 pt-4 border-t space-y-4">
                                    {session.meetingLink && (
                                      <div>
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><ExternalLink className="h-4 w-4" />Meeting Link</h4>
                                        <p className="text-blue-600 break-all"><a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{session.meetingLink}</a></p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" />Invite Students</Button>
                                      <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Download Materials</Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* VIEW MODAL - User can view session details */}
      <AnimatePresence>
        {viewItem && (
          <Modal open={!!viewItem} onOpenChange={() => setViewItem(null)} title="Session Details">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{viewItem.title || viewItem.sessionTitle}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getSessionStatus(viewItem).color}>
                      {getSessionStatus(viewItem).text}
                    </Badge>
                    {viewItem.course && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {viewItem.course}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-700">Date & Time</h4>
                    </div>
                    <p className="text-gray-600">{formatDate(viewItem.date || viewItem.scheduledDate)}</p>
                    <p className="text-gray-600">{calculateDuration(viewItem.time || viewItem.scheduledStartTime, viewItem.duration)}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-700">Duration</h4>
                    </div>
                    <p className="text-gray-600">{viewItem.duration || 60} minutes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {viewItem.batch && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <h4 className="font-semibold text-gray-700">Batch</h4>
                      </div>
                      <p className="text-gray-600">{viewItem.batch}</p>
                    </div>
                  )}

                  {viewItem.meetingLink && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-5 w-5 text-gray-500" />
                        <h4 className="font-semibold text-gray-700">Meeting Link</h4>
                      </div>
                      <a 
                        href={viewItem.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline break-all"
                      >
                        {viewItem.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Students
                </Button>
                <Button className="bg-blue-600 text-white gap-2">
                  <Video className="h-4 w-4" />
                  Join Session
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 ml-auto"
                  onClick={() => {
                    setViewItem(null);
                    handleEditClick(viewItem);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Session
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* EDIT MODAL - User can make changes */}
      <AnimatePresence>
        {editItem && (
          <Modal open={!!editItem} onOpenChange={() => { setEditItem(null); setEditForm({}); }} title="Edit Session">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={editForm.title}
                  onChange={(e: any) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Enter session title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e: any) => setEditForm({...editForm, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={editForm.time}
                    onChange={(e: any) => setEditForm({...editForm, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={editForm.duration}
                    onChange={(e: any) => setEditForm({...editForm, duration: e.target.value})}
                    placeholder="e.g., 60"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={editForm.meetingLink}
                    onChange={(e: any) => setEditForm({...editForm, meetingLink: e.target.value})}
                    placeholder="Zoom / Google Meet link"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    value={editForm.course}
                    onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">-- Select Course --</option>
                    <option value="MERN">MERN Full Stack</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="UI/UX">UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch
                  </label>
                  <select
                    value={editForm.batch}
                    onChange={(e) => setEditForm({...editForm, batch: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">-- Select Batch --</option>
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => { setEditItem(null); setEditForm({}); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2"
                  onClick={handleSaveEdit}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteItem && (
          <Modal open={!!deleteItem} onOpenChange={() => setDeleteItem(null)} title="Confirm Deletion">
            <div className="space-y-6">
              <div className="text-center">
                <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Session?
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the session <span className="font-semibold">"{deleteItem.title || deleteItem.sessionTitle}"</span>?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Date:</div>
                    <div className="font-medium">{formatDate(deleteItem.date || deleteItem.scheduledDate)}</div>
                    <div className="text-gray-500">Time:</div>
                    <div className="font-medium">{calculateDuration(deleteItem.time || deleteItem.scheduledStartTime, deleteItem.duration)}</div>
                    <div className="text-gray-500">Batch:</div>
                    <div className="font-medium">{deleteItem.batch || "Not specified"}</div>
                  </div>
                </div>
                <p className="text-sm text-red-600 mt-4">
                  This action cannot be undone. All session data will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Session
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionsList;