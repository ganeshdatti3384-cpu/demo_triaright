
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
  Edit, 
  Trash2, 
  Plus, 
  Users as UsersIcon, 
  Calendar as CalendarIcon,
  Clock,
  GraduationCap,
  User,
  BookOpen,
  Zap,
  Star,
  CalendarDays,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  Copy,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Course {
  _id: string;
  courseName: string;
}

interface Trainer {
  userId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Batch {
  _id: string;
  batchName: string;
  courseId: {
    _id: string;
    courseName: string;
  };
  trainerUserId: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    timezone: string;
  }[];
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents: number;
  meetingLink?: string;
  notes?: string;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = "http://localhost:5007/api/livecourses";
const USERS_API_URL = "http://localhost:5001/api/users";

const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

const LiveCourseBatchesManagement: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [formData, setFormData] = useState({
    batchName: "",
    courseId: "",
    trainerUserId: "",
    day: "",
    startTime: "",
    endTime: "",
    timezone: "IST (UTC+5:30)",
    startDate: "",
    endDate: "",
    maxStudents: 0,
    currentStudents: 0,
    meetingLink: "",
    notes: "",
    status: "published" as "draft" | "published" | "ongoing" | "completed" | "cancelled",
    isActive: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setPageLoading(true);
    await Promise.all([
      fetchCourses(),
      fetchTrainers(),
      fetchBatches()
    ]);
    setPageLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5007/api/livecourses/live-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const fetchTrainers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5001/api/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch trainers");

      const data = await response.json();
      const formattedTrainers = data
        .filter((trainer: any) => trainer.personalDetails && trainer.personalDetails.firstName)
        .map((trainer: any) => ({
          userId: trainer.userId,
          personalDetails: {
            firstName: trainer.personalDetails.firstName,
            lastName: trainer.personalDetails.lastName,
            email: trainer.personalDetails.email,
          }
        }));

      setTrainers(formattedTrainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast({
        title: "Error",
        description: "Failed to load trainers",
        variant: "destructive",
      });
    }
  };

  const fetchBatches = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/batches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch batches");

    const data = await response.json();
    
    // Check if data is an array or has batches property
    if (Array.isArray(data)) {
      setBatches(data);
    } else if (data.batches && Array.isArray(data.batches)) {
      setBatches(data.batches);
    } else if (data.data && Array.isArray(data.data)) {
      setBatches(data.data);
    } else {
      console.error("Unexpected data format:", data);
      setBatches([]);
    }
  } catch (error) {
    console.error("Error fetching batches:", error);
    setBatches([]); // Set empty array on error
    toast({
      title: "Error",
      description: "Failed to load batches",
      variant: "destructive",
    });
  }
};

  const resetForm = () => {
    setFormData({
      batchName: "",
      courseId: "",
      trainerUserId: "",
      day: "",
      startTime: "",
      endTime: "",
      timezone: "IST (UTC+5:30)",
      startDate: "",
      endDate: "",
      maxStudents: 0,
      currentStudents: 0,
      meetingLink: "",
      notes: "",
      status: "published",
      isActive: true,
    });
  };

  const filteredBatches = (batches || []).filter(batch => {
  if (filterStatus !== "all" && batch.status !== filterStatus) return false;
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    const courseName = batch.courseId?.courseName || '';
    return (
      batch.batchName.toLowerCase().includes(searchLower) ||
      courseName.toLowerCase().includes(searchLower) ||
      batch.trainerUserId.toLowerCase().includes(searchLower)
    );
  }
  return true;
});
const clearAllBatches = async () => {
    if (!window.confirm("Are you sure you want to delete all batches? This action cannot be undone.")) {
      return;
    }

    try {
      const token = getAuthToken();
      await Promise.all(
        batches.map(batch =>
          fetch(`${API_BASE_URL}/admin/batches/${batch._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      await fetchBatches();
      toast({
        title: "Success",
        description: "All batches deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting batches:", error);
      toast({
        title: "Error",
        description: "Failed to delete all batches",
        variant: "destructive",
      });
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing": return "bg-gradient-to-r from-emerald-500 to-green-400";
      case "published": return "bg-gradient-to-r from-blue-500 to-cyan-400";
      case "completed": return "bg-gradient-to-r from-purple-500 to-pink-400";
      case "draft": return "bg-gradient-to-r from-gray-500 to-gray-400";
      case "cancelled": return "bg-gradient-to-r from-red-500 to-rose-400";
      default: return "bg-gradient-to-r from-gray-500 to-gray-400";
    }
  };

  const getProgressPercentage = (current: number, max?: number) => {
    if (!max || max === 0) return 0;
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const getTrainerName = (userId: string) => {
    const trainer = trainers.find(t => t.userId === userId);
    if (trainer) {
      return `${trainer.personalDetails.firstName} ${trainer.personalDetails.lastName}`;
    }
    return userId;
  };

  const handleAddBatch = async () => {
    if (!formData.batchName || !formData.courseId || !formData.trainerUserId) {
      toast({
        title: "Error",
        description: "Batch Name, Course and Trainer are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate) {
      toast({
        title: "Error",
        description: "Start Date is required",
        variant: "destructive",
      });
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
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/admin/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create batch");
      }

      await fetchBatches();
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Batch created successfully",
      });
    } catch (error: any) {
      console.error("Error creating batch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (batch: Batch) => {
    setEditingBatch(batch);
    const schedule = batch.schedule && batch.schedule.length > 0 ? batch.schedule[0] : null;
    
    setFormData({
      batchName: batch.batchName,
      courseId: batch.courseId._id,
      trainerUserId: batch.trainerUserId,
      day: schedule?.day || "",
      startTime: schedule?.startTime || "",
      endTime: schedule?.endTime || "",
      timezone: schedule?.timezone || "IST (UTC+5:30)",
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "",
      maxStudents: batch.maxStudents || 0,
      currentStudents: batch.currentStudents || 0,
      meetingLink: batch.meetingLink || "",
      notes: batch.notes || "",
      status: batch.status,
      isActive: batch.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditBatch = async () => {
    if (!editingBatch) return;

    if (!formData.batchName || !formData.courseId || !formData.trainerUserId) {
      toast({
        title: "Error",
        description: "Batch Name, Course and Trainer are required",
        variant: "destructive",
      });
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
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/admin/batches/${editingBatch._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating batch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/batches/${batchToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete batch");
      }

      await fetchBatches();
      setBatchToDelete(null);

      toast({
        title: "Deleted",
        description: "Batch deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast({
        title: "Error",
        description: "Failed to delete batch",
        variant: "destructive",
      });
    }
  };

  const totalStudents = batches.reduce((sum, batch) => sum + batch.currentStudents, 0);
  const activeBatches = batches.filter(b => b.isActive).length;
  const avgRating = "4.5";

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  const BatchFormFields = () => (
    <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Batch Name <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="e.g., Full Stack Development - Cohort 5"
          value={formData.batchName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, batchName: e.target.value }))
          }
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Course <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
            value={formData.courseId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, courseId: e.target.value }))
            }
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Trainer <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
            value={formData.trainerUserId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, trainerUserId: e.target.value }))
            }
          >
            <option value="">Select Trainer</option>
            {trainers.map(trainer => (
              <option key={trainer.userId} value={trainer.userId}>
                {trainer.personalDetails.firstName} {trainer.personalDetails.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Day
          </Label>
          <select
            className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
            value={formData.day}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, day: e.target.value }))
            }
          >
            <option value="">Select Day</option>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Timezone
          </Label>
          <Input
            value={formData.timezone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, timezone: e.target.value }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Start Time
          </Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startTime: e.target.value }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            End Time
          </Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endTime: e.target.value }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            End Date
          </Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Max Students
          </Label>
          <Input
            type="number"
            placeholder="50"
            value={formData.maxStudents}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxStudents: parseInt(e.target.value) || 0,
              }))
            }
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Status
          </Label>
          <select
            className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as any,
              }))
            }
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
        <Label className="text-sm font-semibold text-gray-700">
          Meeting Link
        </Label>
        <Input
          placeholder="https://meet.google.com/abc-defg-hij"
          value={formData.meetingLink}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
          }
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Notes / Description
        </Label>
        <Textarea
          rows={3}
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm p-3"
          placeholder="Add any additional notes, instructions, or special requirements..."
        />
      </div>

      <div className="flex items-center space-x-3 p-3.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border-2 border-gray-100">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }))
          }
          className="h-4 w-4 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
        />
        <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900 cursor-pointer">
          Activate Batch
        </Label>
      </div>
    </div>
  );

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-xl blur-md opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Live Course Batches
                  </h1>
                  <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-gray-600">
                    Manage and schedule live learning sessions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchBatches}
              variant="outline"
              className="border-2 border-gray-200 hover:border-gray-400 bg-white/80"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Plus className="h-4 w-4 mr-2 relative z-10" />
                  <span className="text-sm relative z-10">New Batch</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                        Create New Batch
                      </DialogTitle>
                      <p className="text-sm text-gray-600 font-medium mt-0.5">
                        Schedule a new live learning batch
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5 p-1">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Batch Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Full Stack Development - Cohort 5"
                      value={formData.batchName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, batchName: e.target.value }))
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Course <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
                        value={formData.courseId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, courseId: e.target.value }))
                        }
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Trainer <span className="text-red-500">*</span>
                      </Label>
                      <select
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
                        value={formData.trainerUserId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, trainerUserId: e.target.value }))
                        }
                      >
                        <option value="">Select Trainer</option>
                        {trainers.map(trainer => (
                          <option key={trainer.userId} value={trainer.userId}>
                            {trainer.personalDetails.firstName} {trainer.personalDetails.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Day
                      </Label>
                      <select
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
                        value={formData.day}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, day: e.target.value }))
                        }
                      >
                        <option value="">Select Day</option>
                        {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Timezone
                      </Label>
                      <Input
                        value={formData.timezone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, timezone: e.target.value }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Max Students
                      </Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={formData.maxStudents}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxStudents: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Status
                      </Label>
                      <select
                        className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
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
                    <Label className="text-sm font-semibold text-gray-700">
                      Meeting Link
                    </Label>
                    <Input
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Notes / Description
                    </Label>
                    <Textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
                      placeholder="Add any additional notes, instructions, or special requirements..."
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-3.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border-2 border-gray-100">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
                    />
                    <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                      Activate Batch
                    </Label>
                  </div>

                  <Button
                    onClick={handleAddBatch}
                    className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {loading ? (
                      <span className="relative z-10 flex items-center justify-center text-sm">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Batch
                      </span>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Batches</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {batches.length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Active Batches</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {activeBatches}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Students</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {totalStudents}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Avg Rating</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {avgRating}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batches by name, course, or trainer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {batches.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAllBatches}
                className="border-2 border-gray-200 hover:border-red-400 bg-white/80 hover:bg-red-50 text-red-600 hover:text-red-700 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Batches Grid */}
        {filteredBatches.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map((batch) => {
                const progress = getProgressPercentage(batch.currentStudents, batch.maxStudents);
                const isFull = batch.maxStudents && batch.maxStudents > 0 && batch.currentStudents >= batch.maxStudents;
                
                return (
                  <Card
                    key={batch._id}
                    className="group relative overflow-hidden bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-gray-200/70 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className={`text-xs font-bold px-2.5 py-1 rounded-full shadow ${getStatusColor(batch.status)} text-white border-0`}>
                        {batch.status}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pt-6 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <div className={`p-2 rounded-lg shadow ${getStatusColor(batch.status)}`}>
                              <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent line-clamp-2">
                              {batch.batchName}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2.5 mt-2">
                            <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-sm">
                              <BookOpen className="h-3.5 w-3.5 text-gray-700" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                              {batch.courseId?.courseName || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0 pb-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <User className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">TRAINER</p>
                            <p className="text-xs text-gray-700 font-medium">{getTrainerName(batch.trainerUserId)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">SCHEDULE</p>
                            <p className="text-xs text-gray-700 font-medium">
                              {batch.schedule?.[0]?.day || "Not set"} {batch.schedule?.[0]?.startTime && `• ${batch.schedule[0].startTime}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <UsersIcon className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">STUDENTS</p>
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-medium ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                                {batch.currentStudents}/{batch.maxStudents || '∞'}
                              </p>
                              {batch.maxStudents > 0 && (
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${progress > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {batch.startDate && batch.endDate && (
                          <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                              <CalendarIcon className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">DURATION</p>
                              <p className="text-xs text-gray-700 font-medium">
                                {new Date(batch.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(batch.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {batch.meetingLink && (
                        <a
                          href={batch.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-3 group/link relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-xs p-3 rounded-lg shadow hover:shadow-xl transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                          <div className="flex items-center gap-2 relative z-10">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            <span>Join Live Session</span>
                          </div>
                          <p className="text-xs text-white/80 truncate mt-1 relative z-10">{batch.meetingLink}</p>
                        </a>
                      )}

                      <div className="flex justify-between pt-3 border-t border-gray-100/50">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                             onClick={() => copyToClipboard(batch._id, "Batch ID")}
                            className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <Copy className="h-3 w-3 mr-1.5 relative z-10" />
                            <span className="relative z-10">Copy ID</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(batch)}
                            className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <Edit className="h-3 w-3 mr-1.5 relative z-10" />
                            <span className="relative z-10">Edit</span>
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setBatchToDelete(batch)}
                          className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <Trash2 className="h-3 w-3 mr-1.5 relative z-10" />
                          <span className="relative z-10">Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredBatches.map((batch) => {
                const progress = getProgressPercentage(batch.currentStudents, batch.maxStudents);
                
                return (
                  <Card 
                    key={batch._id} 
                    className="bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shadow ${getStatusColor(batch.status)}`}>
                              <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-gray-900">{batch.batchName}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(batch.status)} text-white border-0`}>
                                  {batch.status}
                                </Badge>
                                <span className="text-xs text-gray-600">•</span>
                               <span className="text-xs text-gray-600">{batch.courseId?.courseName || 'N/A'}</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">{batch.currentStudents} students</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(batch)}
                            className="border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setBatchToDelete(batch)}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <Card className="bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-dashed border-gray-300/50 shadow-lg">
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full blur-md opacity-30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                  No Batches Yet
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Create your first live batch to get started with interactive learning sessions!
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Plus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Create First Batch</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Edit Batch
                  </DialogTitle>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">
                    Update your live batch details
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
              {/* Same form fields as Add Dialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Batch Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.batchName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, batchName: e.target.value }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Course ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.courseId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, courseId: e.target.value }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Trainer ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.trainerUserId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, trainerId: e.target.value }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Day
                  </Label>
                  <select
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm h-10"
                    value={formData.day}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, day: e.target.value }))
                    }
                  >
                    <option value="">Select Day</option>
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ... rest of form fields ... */}

              <Button
                onClick={handleEditBatch}
                className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Batch
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!batchToDelete}
          onOpenChange={(open) => {
            if (!open) setBatchToDelete(null);
          }}
        >
          <AlertDialogContent className="bg-gradient-to-b from-white to-rose-50/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-rose-200/30 rounded-2xl max-w-md">
            <AlertDialogHeader className="p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-400 rounded-lg shadow">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-bold bg-gradient-to-r from-rose-800 to-pink-700 bg-clip-text text-transparent">
                    Delete Batch
                  </AlertDialogTitle>
                  <p className="text-sm text-rose-600/80 font-medium mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="space-y-5 p-5 pt-0">
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-100">
                <p className="text-sm font-bold text-rose-900 mb-2">
                  "{batchToDelete?.batchName}"
                </p>
                <p className="text-xs text-rose-700">
                  Are you sure you want to delete this batch? This will permanently remove all batch data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <AlertDialogCancel className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Cancel</span>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBatch}
                  className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Delete Batch</span>
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};


export default LiveCourseBatchesManagement;