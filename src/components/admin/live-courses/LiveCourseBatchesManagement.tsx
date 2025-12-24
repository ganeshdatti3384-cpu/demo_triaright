import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Edit, Trash2, Plus, Users, Calendar,
  GraduationCap, User, BookOpen, Zap, Star, CalendarDays, Sparkles,
  Search, LayoutGrid, List, Copy, Loader2, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "http://localhost:5007/api/livecourses";
const getAuthToken = () => localStorage.getItem("token") || "";

export default function LiveCourseBatchesManagement() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [formData, setFormData] = useState({
    batchName: "", courseId: "", trainerUserId: "", day: "", startTime: "",
    endTime: "", timezone: "IST (UTC+5:30)", startDate: "", endDate: "",
    maxStudents: 0, currentStudents: 0, meetingLink: "", notes: "",
    status: "published", isActive: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      fetchTrainers(formData.courseId);
    } else {
      setTrainers([]);
      setFormData(prev => ({ ...prev, trainerUserId: "" }));
    }
  }, [formData.courseId]);

  const fetchInitialData = async () => {
    setPageLoading(true);
    await Promise.all([fetchCourses(), fetchBatches()]);
    setPageLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/live-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load courses", variant: "destructive" });
    }
  };

  const fetchTrainers = async (courseId) => {
    if (!courseId) {
      setTrainers([]);
      return;
    }
    
    setTrainersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/live-course/${courseId}/trainer`);

      if (!response.ok) {
        if (response.status === 404) {
          setTrainers([]);
          setFormData(prev => ({ ...prev, trainerUserId: "" }));
          toast({ title: "Info", description: "No trainer assigned to this course yet" });
          setTrainersLoading(false);
          return;
        }
        throw new Error("Failed to fetch trainer");
      }

      const data = await response.json();
      console.log("Trainer API Response:", data);
      
      if (data.success && data.trainer) {
        const trainerObj = {
          userId: data.trainer.userId || '',
          firstName: data.trainer.firstName || '',
          lastName: data.trainer.lastName || '',
          email: data.trainer.email || '',
          expertise: data.trainer.expertise || [],
          rating: data.trainer.rating || 0
        };
        
        console.log("Setting trainers to:", [trainerObj]);
        setTrainers([trainerObj]);
        setFormData(prev => ({ ...prev, trainerUserId: trainerObj.userId }));
      } else {
        console.log("No trainer found in response");
        setTrainers([]);
        setFormData(prev => ({ ...prev, trainerUserId: "" }));
        toast({ title: "Info", description: "No trainer data found" });
      }
    } catch (error) {
      console.error("Trainer fetch error:", error);
      setTrainers([]);
      setFormData(prev => ({ ...prev, trainerUserId: "" }));
      toast({ title: "Error", description: "Failed to load trainer", variant: "destructive" });
    } finally {
      setTrainersLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(Array.isArray(data) ? data : (data.batches || data.data || []));
    } catch (error) {
      setBatches([]);
      toast({ title: "Error", description: "Failed to load batches", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      batchName: "", courseId: "", trainerUserId: "", day: "", startTime: "",
      endTime: "", timezone: "IST (UTC+5:30)", startDate: "", endDate: "",
      maxStudents: 0, currentStudents: 0, meetingLink: "", notes: "",
      status: "published", isActive: true,
    });
    setTrainers([]);
  };

  const handleAddBatch = async () => {
    if (!formData.batchName || !formData.courseId || !formData.trainerUserId || !formData.startDate) {
      toast({ title: "Error", description: "Required fields missing", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const payload = {
        batchName: formData.batchName,
        courseId: formData.courseId,
        trainerUserId: formData.trainerUserId,
        schedule: formData.day ? [{
          day: formData.day, 
          startTime: formData.startTime,
          endTime: formData.endTime, 
          timezone: formData.timezone,
        }] : [],
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        maxStudents: formData.maxStudents || undefined,
        currentStudents: 0,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/admin/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create batch");
      }

      await fetchBatches();
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Batch created successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (batch) => {
    setEditingBatch(batch);
    const schedule = batch.schedule?.[0] || {};
    
    setFormData({
      batchName: batch.batchName,
      courseId: batch.courseId._id,
      trainerUserId: batch.trainerUserId,
      day: schedule.day || "",
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      timezone: schedule.timezone || "IST (UTC+5:30)",
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "",
      maxStudents: batch.maxStudents || 0,
      currentStudents: batch.currentStudents || 0,
      meetingLink: batch.meetingLink || "",
      notes: batch.notes || "",
      status: batch.status,
      isActive: batch.isActive,
    });
    
    if (batch.courseId._id) await fetchTrainers(batch.courseId._id);
    setIsEditDialogOpen(true);
  };

  const handleEditBatch = async () => {
    if (!editingBatch || !formData.batchName || !formData.courseId || !formData.trainerUserId) {
      toast({ title: "Error", description: "Required fields missing", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const payload = {
        batchName: formData.batchName,
        courseId: formData.courseId,
        trainerUserId: formData.trainerUserId,
        schedule: formData.day ? [{
          day: formData.day, 
          startTime: formData.startTime,
          endTime: formData.endTime, 
          timezone: formData.timezone,
        }] : [],
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        maxStudents: formData.maxStudents || undefined,
        currentStudents: formData.currentStudents || 0,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/admin/batches/${editingBatch._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update batch");
      }

      await fetchBatches();
      setIsEditDialogOpen(false);
      setEditingBatch(null);
      resetForm();
      toast({ title: "Success", description: "Batch updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/admin/batches/${batchToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBatches();
      setBatchToDelete(null);
      toast({ title: "Deleted", description: "Batch deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete batch", variant: "destructive" });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ongoing: "bg-gradient-to-r from-emerald-500 to-green-400",
      published: "bg-gradient-to-r from-blue-500 to-cyan-400",
      completed: "bg-gradient-to-r from-purple-500 to-pink-400",
      draft: "bg-gradient-to-r from-gray-500 to-gray-400",
      cancelled: "bg-gradient-to-r from-red-500 to-rose-400",
    };
    return colors[status] || colors.draft;
  };

  const filteredBatches = batches.filter(batch => {
    if (filterStatus !== "all" && batch.status !== filterStatus) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return batch.batchName.toLowerCase().includes(search) ||
             batch.courseId?.courseName?.toLowerCase().includes(search) ||
             batch.trainerUserId.toLowerCase().includes(search);
    }
    return true;
  });

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  const FormFields = () => (
    <>
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold">Batch Name <span className="text-red-500">*</span></Label>
        <Input
          placeholder="e.g., Full Stack Development - Cohort 5"
          value={formData.batchName}
          onChange={(e) => setFormData(prev => ({ ...prev, batchName: e.target.value }))}
          className="border-2 rounded-xl h-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Course <span className="text-red-500">*</span></Label>
          <select
            className="w-full border-2 rounded-xl px-3 py-2 text-sm h-10"
            value={formData.courseId}
            onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.courseName}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Trainer <span className="text-red-500">*</span></Label>
          <select
            className="w-full border-2 rounded-xl px-3 py-2 text-sm h-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={formData.trainerUserId}
            onChange={(e) => setFormData(prev => ({ ...prev, trainerUserId: e.target.value }))}
            disabled={!formData.courseId || trainersLoading}
          >
            <option value="">
              {trainersLoading 
                ? "Loading trainers..." 
                : !formData.courseId 
                ? "Select a course first" 
                : trainers.length === 0 
                ? "No trainer assigned" 
                : "Select Trainer"}
            </option>
            {Array.isArray(trainers) && trainers.map((trainer, index) => {
              if (!trainer || !trainer.userId) {
                console.warn(`Invalid trainer at index ${index}:`, trainer);
                return null;
              }
              return (
                <option key={trainer.userId} value={trainer.userId}>
                  {trainer.firstName || 'Unknown'} {trainer.lastName || ''}
                </option>
              );
            })}
          </select>
          {trainers.length > 0 && trainers[0]?.firstName && (
            <p className="text-xs text-gray-500 mt-1">
              Trainer auto-selected: {trainers[0].firstName} {trainers[0].lastName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Day</Label>
          <select
            className="w-full border-2 rounded-xl px-3 py-2 text-sm h-10"
            value={formData.day}
            onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
          >
            <option value="">Select Day</option>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Timezone</Label>
          <Input value={formData.timezone} onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))} className="rounded-xl h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Start Time</Label>
          <Input type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} className="rounded-xl h-10" />
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">End Time</Label>
          <Input type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} className="rounded-xl h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Start Date <span className="text-red-500">*</span></Label>
          <Input type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl h-10" />
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">End Date</Label>
          <Input type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Max Students</Label>
          <Input type="number" placeholder="50" value={formData.maxStudents} onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))} className="rounded-xl h-10" />
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold">Status</Label>
          <select
            className="w-full border-2 rounded-xl px-3 py-2 text-sm h-10"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold">Meeting Link</Label>
        <Input placeholder="https://meet.google.com/abc-defg-hij" value={formData.meetingLink} onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))} className="rounded-xl h-10" />
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold">Notes / Description</Label>
        <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="rounded-xl resize-none" placeholder="Add notes..." />
      </div>

      <div className="flex items-center space-x-3 p-3.5 bg-gray-50 rounded-xl border-2">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4"
        />
        <Label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Activate Batch</Label>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Live Course Batches</h1>
                <p className="text-xs text-gray-600">Manage live learning sessions</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchBatches} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <FormFields />
                  <Button onClick={handleAddBatch} className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Batch"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border-2 rounded-xl px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBatches.map((batch) => (
              <Card key={batch._id} className="hover:shadow-xl transition-all relative">
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`${getStatusColor(batch.status)} text-white border-0`}>
                    {batch.status}
                  </Badge>
                </div>
                
                <CardHeader className="pt-6 pb-3">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className={`p-2 rounded-lg ${getStatusColor(batch.status)}`}>
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">{batch.batchName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-3.5 w-3.5 text-gray-700" />
                    <p className="text-sm font-semibold">{batch.courseId?.courseName || 'N/A'}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pb-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                      <User className="h-3.5 w-3.5" />
                      <div>
                        <p className="text-xs font-semibold">TRAINER</p>
                        <p className="text-xs">{batch.trainerUserId}</p>
                      </div>
                    </div>

                    {batch.schedule?.[0] && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <div>
                          <p className="text-xs font-semibold">SCHEDULE</p>
                          <p className="text-xs">
                            {batch.schedule[0].day} {batch.schedule[0].startTime && `• ${batch.schedule[0].startTime}`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                      <Users className="h-3.5 w-3.5" />
                      <div>
                        <p className="text-xs font-semibold">STUDENTS</p>
                        <p className="text-xs">{batch.currentStudents} / {batch.maxStudents || '∞'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(batch)}>
                      <Edit className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => setBatchToDelete(batch)} className="bg-rose-500 hover:bg-rose-600">
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-bold mb-2">No Batches Yet</h3>
              <p className="text-gray-600 text-sm mb-6">Create your first batch to get started!</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <FormFields />
              <Button onClick={handleEditBatch} className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Batch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!batchToDelete} onOpenChange={(open) => { if (!open) setBatchToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            </AlertDialogHeader>
            <p>Are you sure you want to delete "{batchToDelete?.batchName}"?</p>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBatch} className="bg-rose-500 hover:bg-rose-600">
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}




