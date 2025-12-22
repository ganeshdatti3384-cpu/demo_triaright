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
import { Edit, Trash2, Plus, Users, Clock, Video, DollarSign, Calendar, Zap, Sparkles, BookOpen, Target, GraduationCap, Upload, FileText, MapPin, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API Configuration - Update these with your actual backend URLs
const API_BASE_URL = "http://localhost:5007"; // Change this to your backend URL
const getAuthToken = () => localStorage.getItem("token"); // Adjust based on your auth implementation

interface LiveCourse {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  price: number;
  trainerUserId: string;
  trainerName: string;
  duration?: {
    value: number;
    unit: string;
  };
  location?: {
    type: string;
    venue?: string;
    city?: string;
    state?: string;
  };
  courseOverview?: string;
  courseDocuments?: string[];
  courseImage?: string;
  certificateProvided: boolean;
  learningOutcomes?: string[];
  syllabus?: Array<{
    module: string;
    topics: string[];
    duration: string;
  }>;
  maxStudents?: number;
  enrolledCount: number;
  status: string;
  category?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  trainer?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Trainer {
  userId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const LiveCourseManagement: React.FC = () => {
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<LiveCourse | null>(null);
  const [editingCourse, setEditingCourse] = useState<LiveCourse | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    price: 0,
    trainerUserId: "",
    durationValue: 0,
    durationUnit: "weeks",
    locationType: "online",
    venue: "",
    city: "",
    state: "",
    courseOverview: "",
    certificateProvided: false,
    learningOutcomes: "",
    maxStudents: 0,
    status: "draft",
    category: "",
    language: "English",
  });

  // File uploads
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseDocuments, setCourseDocuments] = useState<File[]>([]);

  const { toast } = useToast();

const fetchTrainers = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch('http://localhost:5001/api/users/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
 
    if (!response.ok) throw new Error("Failed to fetch trainers");
 
    const data = await response.json();
 
    // Filter and format trainers - the response structure matches Trainer interface
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

  // Fetch all live courses
  const fetchLiveCourses = async () => {
    try {
      setFetchingData(true);
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5007/api/livecourses/live-courses`, {
      });

      if (!response.ok) throw new Error("Failed to fetch live courses");

      const data = await response.json();
      setLiveCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching live courses:", error);
      toast({
        title: "Error",
        description: "Failed to load live courses",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
    fetchLiveCourses();
  }, []);

  const resetForm = () => {
    setFormData({
      courseName: "",
      description: "",
      price: 0,
      trainerUserId: "",
      durationValue: 0,
      durationUnit: "weeks",
      locationType: "online",
      venue: "",
      city: "",
      state: "",
      courseOverview: "",
      certificateProvided: false,
      learningOutcomes: "",
      maxStudents: 0,
      status: "draft",
      category: "",
      language: "English",
    });
    setCourseImage(null);
    setCourseDocuments([]);
  };

  const handleAddLiveCourse = async () => {
    if (!formData.courseName || !formData.description || !formData.trainerUserId) {
      toast({
        title: "Error",
        description: "Course Name, Description and Trainer are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("courseName", formData.courseName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("trainerUserId", formData.trainerUserId);
      formDataToSend.append("certificateProvided", formData.certificateProvided.toString());
      formDataToSend.append("status", formData.status);
      formDataToSend.append("enrolledCount", "0");

      // Duration
      if (formData.durationValue > 0) {
        formDataToSend.append("duration", JSON.stringify({
          value: formData.durationValue,
          unit: formData.durationUnit,
        }));
      }

      // Location
      formDataToSend.append("location", JSON.stringify({
        type: formData.locationType,
        venue: formData.venue,
        city: formData.city,
        state: formData.state,
      }));

      // Optional fields
      if (formData.courseOverview) formDataToSend.append("courseOverview", formData.courseOverview);
      if (formData.maxStudents > 0) formDataToSend.append("maxStudents", formData.maxStudents.toString());
      if (formData.category) formDataToSend.append("category", formData.category);
      if (formData.language) formDataToSend.append("language", formData.language);

      // Learning outcomes
      if (formData.learningOutcomes) {
        const outcomes = formData.learningOutcomes.split("\n").filter(o => o.trim());
        formDataToSend.append("learningOutcomes", JSON.stringify(outcomes));
      }

      // Files
      if (courseImage) {
        formDataToSend.append("courseImage", courseImage);
      }

      courseDocuments.forEach((doc) => {
        formDataToSend.append("courseDocuments", doc);
      });

      const response = await fetch(`${API_BASE_URL}/api/livecourses/admin/live-courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: "Live course created successfully",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchLiveCourses(); // Refresh the list
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create live course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (course: LiveCourse) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      description: course.description,
      price: course.price,
      trainerUserId: course.trainerUserId,
      durationValue: course.duration?.value || 0,
      durationUnit: course.duration?.unit || "weeks",
      locationType: course.location?.type || "online",
      venue: course.location?.venue || "",
      city: course.location?.city || "",
      state: course.location?.state || "",
      courseOverview: course.courseOverview || "",
      certificateProvided: course.certificateProvided,
      learningOutcomes: course.learningOutcomes?.join("\n") || "",
      maxStudents: course.maxStudents || 0,
      status: course.status,
      category: course.category || "",
      language: course.language || "English",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditLiveCourse = async () => {
    if (!editingCourse) return;

    if (!formData.courseName || !formData.description || !formData.trainerUserId) {
      toast({
        title: "Error",
        description: "Course Name, Description and Trainer are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const formDataToSend = new FormData();

      // Append all fields
      formDataToSend.append("courseName", formData.courseName);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("trainerUserId", formData.trainerUserId);
      formDataToSend.append("certificateProvided", formData.certificateProvided.toString());
      formDataToSend.append("status", formData.status);

      if (formData.durationValue > 0) {
        formDataToSend.append("duration", JSON.stringify({
          value: formData.durationValue,
          unit: formData.durationUnit,
        }));
      }

      formDataToSend.append("location", JSON.stringify({
        type: formData.locationType,
        venue: formData.venue,
        city: formData.city,
        state: formData.state,
      }));

      if (formData.courseOverview) formDataToSend.append("courseOverview", formData.courseOverview);
      if (formData.maxStudents > 0) formDataToSend.append("maxStudents", formData.maxStudents.toString());
      if (formData.category) formDataToSend.append("category", formData.category);
      if (formData.language) formDataToSend.append("language", formData.language);

      if (formData.learningOutcomes) {
        const outcomes = formData.learningOutcomes.split("\n").filter(o => o.trim());
        formDataToSend.append("learningOutcomes", JSON.stringify(outcomes));
      }

      if (courseImage) {
        formDataToSend.append("courseImage", courseImage);
      }

      courseDocuments.forEach((doc) => {
        formDataToSend.append("courseDocuments", doc);
      });

      const response = await fetch(`${API_BASE_URL}/api/livecourses/admin/live-courses/${editingCourse._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }

      toast({
        title: "Success",
        description: "Live course updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchLiveCourses();
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update live course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLiveCourse = async () => {
    if (!courseToDelete) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/livecourses/admin/live-courses/${courseToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete course");
      }

      toast({
        title: "Deleted",
        description: "Live course deleted successfully",
      });

      setCourseToDelete(null);
      fetchLiveCourses();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete live course",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-gradient-to-r from-emerald-500 to-green-400";
      case "ongoing": return "bg-gradient-to-r from-blue-500 to-cyan-400";
      case "completed": return "bg-gradient-to-r from-gray-500 to-gray-400";
      case "cancelled": return "bg-gradient-to-r from-red-500 to-rose-400";
      default: return "bg-gradient-to-r from-amber-500 to-orange-400";
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case "online": return "bg-gradient-to-r from-blue-500 to-cyan-400";
      case "offline": return "bg-gradient-to-r from-purple-500 to-pink-400";
      case "hybrid": return "bg-gradient-to-r from-indigo-500 to-violet-400";
      default: return "bg-gradient-to-r from-gray-500 to-gray-400";
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading live courses...</p>
        </div>
      </div>
    );
  }

  const CourseFormFields = () => (
    <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Course Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={formData.courseName}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
              className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
              placeholder="e.g., Advanced React Development"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Trainer <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.trainerUserId} onValueChange={(value) => setFormData((prev) => ({ ...prev, trainerUserId: value }))}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
              <SelectValue placeholder="Select trainer" />
            </SelectTrigger>
            <SelectContent>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.userId} value={trainer.userId}>
                  {trainer.personalDetails.firstName} {trainer.personalDetails.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
          placeholder="Detailed description of the course..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Duration</Label>
          <Input
            type="number"
            value={formData.durationValue}
            onChange={(e) => setFormData((prev) => ({ ...prev, durationValue: parseInt(e.target.value) || 0 }))}
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
            placeholder="Duration"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Unit</Label>
          <Select value={formData.durationUnit} onValueChange={(value) => setFormData((prev) => ({ ...prev, durationUnit: value }))}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Location Type</Label>
          <Select value={formData.locationType} onValueChange={(value) => setFormData((prev) => ({ ...prev, locationType: value }))}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.locationType !== "online" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-gray-700">Venue</Label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
              placeholder="Venue name"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-gray-700">City</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
              placeholder="City"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-gray-700">State</Label>
            <Input
              value={formData.state}
              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
              placeholder="State"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Max Students</Label>
          <Input
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))}
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
            placeholder="0"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
            placeholder="e.g., Programming"
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">Language</Label>
          <Input
            value={formData.language}
            onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
            placeholder="English"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">Course Overview</Label>
        <Textarea
          rows={3}
          value={formData.courseOverview}
          onChange={(e) => setFormData((prev) => ({ ...prev, courseOverview: e.target.value }))}
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
          placeholder="Brief overview..."
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">Learning Outcomes (one per line)</Label>
        <Textarea
          rows={4}
          value={formData.learningOutcomes}
          onChange={(e) => setFormData((prev) => ({ ...prev, learningOutcomes: e.target.value }))}
          className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
          placeholder="Enter each learning outcome on a new line"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="certificate"
          checked={formData.certificateProvided}
          onChange={(e) => setFormData((prev) => ({ ...prev, certificateProvided: e.target.checked }))}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-300"
        />
        <Label htmlFor="certificate" className="text-sm font-semibold text-gray-700 cursor-pointer">
          Certificate Provided
        </Label>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">Course Image</Label>
        <div className="relative">
          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setCourseImage(e.target.files?.[0] || null)}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">Course Documents</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCourseDocuments(Array.from(e.target.files || []))}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
        {courseDocuments.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">{courseDocuments.length} file(s) selected</p>
        )}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-xl blur-md opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Live Course Management
                  </h1>
                  <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-gray-600">
                    Manage and schedule interactive live sessions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Interactive Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3 text-indigo-500" />
                <span className="text-xs font-medium text-gray-600">Expert Instructors</span>
              </div>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="text-sm relative z-10">Add Course</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
              <DialogHeader className="pb-4 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                      Create New Live Course
                    </DialogTitle>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Design your interactive live session
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <CourseFormFields />

              <Button
                onClick={handleAddLiveCourse}
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
                    Create Live Course
                  </span>
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Courses</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {liveCourses.length}
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
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Published</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {liveCourses.filter(c => c.status === "published").length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Enrolled</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {liveCourses.reduce((sum, c) => sum + c.enrolledCount, 0)}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Trainers</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {new Set(liveCourses.map(c => c.trainerUserId)).size}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveCourses.map((course) => (
            <Card
              key={course._id}
              className="group relative overflow-hidden bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-gray-200/70 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200/5 via-gray-200/5 to-gray-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`text-xs font-bold px-2.5 py-1 rounded-full shadow text-white border-0 ${getStatusColor(course.status)}`}>
                  {course.status.toUpperCase()}
                </Badge>
              </div>
              
              <CardHeader className="pt-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {course.courseImage && (
                      <img src={course.courseImage} alt={course.courseName} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-400 rounded-lg shadow">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent line-clamp-2">
                        {course.courseName}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-sm">
                        <Users className="h-3.5 w-3.5 text-gray-700" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {course.trainerName}
                      </p>
                    </div>
                  </div>
                  {course.price > 0 && (
                    <Badge className="text-xs font-bold px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-400 text-white border-0 shadow">
                      ${course.price}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0 pb-5">
                <div className="space-y-3">
                  {course.duration && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Clock className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">DURATION</p>
                        <p className="text-xs text-gray-700 font-medium">
                          {course.duration.value} {course.duration.unit}
                        </p>
                      </div>
                    </div>
                  )}

                  {course.location && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">LOCATION</p>
                        <Badge className={`text-xs font-medium px-2 py-0.5 text-white border-0 shadow ${getLocationColor(course.location.type)}`}>
                          {course.location.type}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {course.maxStudents && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Users className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">CAPACITY</p>
                        <p className="text-xs text-gray-700 font-medium">
                          {course.enrolledCount} / {course.maxStudents} students
                        </p>
                      </div>
                    </div>
                  )}

                  {course.certificateProvided && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Award className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <p className="text-xs font-semibold text-amber-900">Certificate Provided</p>
                    </div>
                  )}
                </div>

                {course.description && (
                  <div className="pt-2 border-t border-gray-100/50">
                    <p className="text-xs text-gray-700 line-clamp-3">{course.description}</p>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-100/50">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(course)}
                      className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Edit className="h-3 w-3 mr-1.5 relative z-10" />
                      <span className="relative z-10">Edit</span>
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setCourseToDelete(course)}
                    className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <Trash2 className="h-3 w-3 mr-1.5 relative z-10" />
                    <span className="relative z-10">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {liveCourses.length === 0 && (
          <Card className="bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-dashed border-gray-300/50 shadow-lg">
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full blur-md opacity-30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                  No Live Courses Yet
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Start creating engaging live sessions to teach students!
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Plus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Schedule First Course</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Edit Live Course
                  </DialogTitle>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">
                    Update your live course details
                  </p>
                </div>
              </div>
            </DialogHeader>

            <CourseFormFields />

            <Button
              onClick={handleEditLiveCourse}
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
                  Update Live Course
                </span>
              )}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!courseToDelete}
          onOpenChange={(open) => {
            if (!open) setCourseToDelete(null);
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
                    Delete Live Course
                  </AlertDialogTitle>
                  <p className="text-sm text-rose-600/80 font-medium mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="space-y-5 p-5 pt-0">
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-100">
                <p className="text-sm font-bold text-rose-900 mb-2">
                  "{courseToDelete?.courseName}"
                </p>
                <p className="text-xs text-rose-700">
                  Are you sure you want to delete this live course? This will permanently remove all course data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <AlertDialogCancel className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Cancel</span>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLiveCourse}
                  className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Delete Course</span>
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LiveCourseManagement;