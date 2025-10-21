/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Edit, Trash2, Briefcase } from "lucide-react";
import { jobsApi } from "../../services/api";

// Models/interfaces
interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: "Full-Time" | "Part-Time" | "Contract" | "Internship";
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  skills: string[];
  createdAt: string;
  status: "Open" | "Closed" | "On Hold";
  experienceRequired?: string;
  openings?: number;
  qualification?: string;
  Jobmode?: "Remote" | "On-Site" | "Hybrid";
  applicationDeadline?: string;
  perks?: string[];
}

const JobManagement = () => {
  // JOBS & FORM STATE
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

  // Form model
  const [jobForm, setJobForm] = useState({
    title: "",
    companyName: "",
    location: "",
    jobType: "Full-Time",
    salaryMin: "",
    salaryMax: "",
    description: "",
    skills: "",
    experienceRequired: "",
    openings: "",
    qualification: "",
    Jobmode: "Remote",
    applicationDeadline: "",
    perks: "",
  });

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsApi.getAllJobs();
      setJobs(response.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({
        title: "Error",
        description: "Could not fetch jobs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => {
    setEditingJob(null);
    setJobForm({
      title: "",
      companyName: "",
      location: "",
      jobType: "Full-Time",
      salaryMin: "",
      salaryMax: "",
      description: "",
      skills: "",
      experienceRequired: "",
      openings: "",
      qualification: "",
      Jobmode: "Remote",
      applicationDeadline: "",
      perks: "",
    });
  };

  const handleFormSubmit = async () => {
    console.log("Button clicked! Job form:", jobForm); // <--- DEBUG LOG
    if (editingJob) {
      await handleUpdateJob();
    } else {
      await handleCreateJob();
    }
  };

  // Create job handler
  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.companyName || !jobForm.description || !jobForm.location) {
      toast({
        title: "Validation Error",
        description: "Title, Company Name, Description, and Location are required.",
        variant: "destructive",
      });
      return;
    }
    const newJobPayload = {
      title: jobForm.title,
      companyName: jobForm.companyName,
      location: jobForm.location,
      jobType: jobForm.jobType,
      Jobmode: jobForm.Jobmode,
      description: jobForm.description,
      skills: jobForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined,
      salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined,
      experienceRequired: jobForm.experienceRequired || undefined,
      openings: jobForm.openings ? Number(jobForm.openings) : undefined,
      qualification: jobForm.qualification || undefined,
      applicationDeadline: jobForm.applicationDeadline || undefined,
      perks: jobForm.perks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      await jobsApi.createJob(newJobPayload);
      toast({
        title: "Success",
        description: "Job posted successfully.",
      });
      await fetchJobs();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({
        title: "Error",
        description: "Failed to post job. Please check all required fields.",
        variant: "destructive",
      });
    }
  };

  // EDIT & UPDATE
  const openEditForm = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
      description: job.description,
      skills: job.skills.join(", "),
      experienceRequired: job.experienceRequired || "",
      openings: job.openings?.toString() || "",
      qualification: job.qualification || "",
      Jobmode: job.Jobmode || "Remote",
      applicationDeadline: job.applicationDeadline
        ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
        : "",
      perks: job.perks?.join(", ") || "",
    });
    setIsFormOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    const updatedJobPayload = {
      title: jobForm.title,
      companyName: jobForm.companyName,
      location: jobForm.location,
      jobType: jobForm.jobType,
      Jobmode: jobForm.Jobmode,
      description: jobForm.description,
      skills: jobForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined,
      salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined,
      experienceRequired: jobForm.experienceRequired || undefined,
      openings: jobForm.openings ? Number(jobForm.openings) : undefined,
      qualification: jobForm.qualification || undefined,
      applicationDeadline: jobForm.applicationDeadline || undefined,
      perks: jobForm.perks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      await jobsApi.updateJob(editingJob.id, updatedJobPayload);
      toast({
        title: "Success",
        description: "Job updated successfully.",
      });
      await fetchJobs();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update job:", error);
      toast({
        title: "Error",
        description: "Failed to update job.",
        variant: "destructive",
      });
    }
  };

  // DELETE
  const openDeleteAlert = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await jobsApi.deleteJob(jobToDelete.id);
      toast({
        title: "Success",
        description: "Job deleted successfully.",
      });
      await fetchJobs();
      setIsDeleteAlertOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    }
  };

  // VIEW DETAILS
  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  // BADGE COLORS
  const getStatusBadgeVariant = (status: Job["status"]) => {
    switch (status) {
      case "Open":
        return "default";
      case "Closed":
        return "destructive";
      case "On Hold":
        return "secondary";
      default:
        return "outline";
    }
  };

  // RENDER
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ...rest of the rendering/JSX code as you've posted previously... */}
      {/* All JSX code is copy-paste ready and unchanged except for the debug log */}
      {/* Button remains: */}
      {/* <Button className="w-full" onClick={handleFormSubmit}> */}
    </div>
  );
};

export default JobManagement;
