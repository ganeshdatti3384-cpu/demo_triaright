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
import { Plus, Eye, Edit, Trash2, Briefcase, Users, Download, Mail, Phone } from "lucide-react";

// Models/interfaces
interface Job {
  _id: string;
  jobId: string;
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
  postedBy?: string;
}

interface JobApplication {
  _id: string;
  applicationId: string;
  jobId: string;
  userId: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
  status: "Applied" | "Reviewed" | "Shortlisted" | "Rejected" | "Hired";
  createdAt: string;
  updatedAt: string;
  job?: {
    title: string;
    companyName: string;
    location: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const JobManagement = () => {
  // JOBS & FORM STATE
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [allApplications, setAllApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [jobForApplications, setJobForApplications] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");
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

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // API Configuration - Updated for your gateway
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://triaright.com/api";
  
  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API Headers
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/jobs`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data);
      
      // Fetch all applications when jobs are loaded
      await fetchAllApplications(data);
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

  // Fetch applications for a specific job
  const fetchJobApplications = async (jobId: string) => {
    setApplicationsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/jobs/job-applications/${jobId}`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast({
        title: "Error",
        description: "Could not fetch job applications.",
        variant: "destructive",
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch all applications across all jobs
  const fetchAllApplications = async (jobsList: Job[] = jobs) => {
    try {
      const allApps: JobApplication[] = [];
      
      for (const job of jobsList) {
        try {
          const response = await fetch(`${API_BASE}/jobs/job-applications/${job._id}`, {
            headers: getHeaders(),
          });
          
          if (response.ok) {
            const jobApps = await response.json();
            const appsWithJobInfo = jobApps.map((app: JobApplication) => ({
              ...app,
              job: {
                title: job.title,
                companyName: job.companyName,
                location: job.location
              }
            }));
            allApps.push(...appsWithJobInfo);
          }
        } catch (error) {
          console.error(`Failed to fetch applications for job ${job._id}:`, error);
        }
      }
      
      setAllApplications(allApps);
    } catch (error) {
      console.error("Failed to fetch all applications:", error);
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
      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newJobPayload),
      });

      if (!response.ok) throw new Error('Failed to create job');

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
      const response = await fetch(`${API_BASE}/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedJobPayload),
      });

      if (!response.ok) throw new Error('Failed to update job');

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
      const response = await fetch(`${API_BASE}/jobs/${jobToDelete._id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to delete job');

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

  // VIEW APPLICATIONS
  const viewJobApplications = async (job: Job) => {
    setJobForApplications(job);
    await fetchJobApplications(job._id);
    setIsApplicationsOpen(true);
  };

  // UPDATE APPLICATION STATUS
  const updateApplicationStatus = async (applicationId: string, status: JobApplication["status"]) => {
    setUpdatingStatus(applicationId);
    try {
      const response = await fetch(`${API_BASE}/jobs/job-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update application status');

      toast({
        title: "Success",
        description: "Application status updated successfully.",
      });
      // Refresh applications
      if (jobForApplications) {
        await fetchJobApplications(jobForApplications._id);
      }
      await fetchAllApplications();
    } catch (error) {
      console.error("Failed to update application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // DOWNLOAD RESUME
  const downloadResume = (resumeUrl: string, applicantName: string) => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getApplicationStatusBadgeVariant = (status: JobApplication["status"]) => {
    switch (status) {
      case "Applied":
        return "outline";
      case "Reviewed":
        return "secondary";
      case "Shortlisted":
        return "default";
      case "Rejected":
        return "destructive";
      case "Hired":
        return "default";
      default:
        return "outline";
    }
  };

  // Count applications by status for the stats
  const getApplicationStats = () => {
    const stats = {
      total: allApplications.length,
      applied: allApplications.filter(app => app.status === "Applied").length,
      reviewed: allApplications.filter(app => app.status === "Reviewed").length,
      shortlisted: allApplications.filter(app => app.status === "Shortlisted").length,
      hired: allApplications.filter(app => app.status === "Hired").length,
      rejected: allApplications.filter(app => app.status === "Rejected").length,
    };
    return stats;
  };

  const applicationStats = getApplicationStats();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage all your job postings and applications.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Post New Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({allApplications.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>
                An overview of all jobs you have posted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton loader
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-4">
                          <div className="h-4 bg-gray-200 rounded w-34 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        No job postings found.
                        <Button variant="link" onClick={() => { resetForm(); setIsFormOpen(true); }}>
                          Post your first job
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => {
                      const jobApplications = allApplications.filter(app => app.jobId === job._id);
                      return (
                        <TableRow key={job._id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.jobType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(job.status)}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={jobApplications.length > 0 ? "default" : "outline"}>
                              {jobApplications.length}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => viewJobDetails(job)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => viewJobApplications(job)}
                                disabled={jobApplications.length === 0}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditForm(job)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openDeleteAlert(job)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>All Job Applications</CardTitle>
              <CardDescription>
                View and manage applications across all your job postings.
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Total: {applicationStats.total}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Applied: {applicationStats.applied}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Reviewed: {applicationStats.reviewed}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Shortlisted: {applicationStats.shortlisted}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Hired: {applicationStats.hired}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Rejected: {applicationStats.rejected}</Badge>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        No applications found.
                        <Button variant="link" onClick={() => setActiveTab("jobs")}>
                          View your jobs
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allApplications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell className="font-medium">{application.applicantName}</TableCell>
                        <TableCell>
                          {application.job?.title || `Job ID: ${application.jobId}`}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.phone}</TableCell>
                        <TableCell>
                          <Badge variant={getApplicationStatusBadgeVariant(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadResume(application.resumeUrl, application.applicantName)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`mailto:${application.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`tel:${application.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job" : "Post New Job"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={jobForm.title}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={jobForm.companyName}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={jobForm.location}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label>Job Type</Label>
                <select
                  value={jobForm.jobType}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, jobType: e.target.value as Job["jobType"] }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Mode</Label>
                <select
                  value={jobForm.Jobmode}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      Jobmode: e.target.value as Job["Jobmode"],
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-Site">On-Site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <Label>Openings</Label>
                <Input
                  type="number"
                  value={jobForm.openings}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, openings: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary Minimum</Label>
                <Input
                  type="number"
                  value={jobForm.salaryMin}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, salaryMin: e.target.value }))}
                />
              </div>
              <div>
                <Label>Salary Maximum</Label>
                <Input
                  type="number"
                  value={jobForm.salaryMax}
                  onChange={(e) => setJobForm((prev) => ({ ...prev, salaryMax: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Experience Required</Label>
              <Input
                value={jobForm.experienceRequired}
                onChange={(e) => setJobForm((prev) => ({ ...prev, experienceRequired: e.target.value }))}
                placeholder="e.g., 2 years in React"
              />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input
                value={jobForm.qualification}
                onChange={(e) => setJobForm((prev) => ({ ...prev, qualification: e.target.value }))}
                placeholder="e.g., B.Tech in Computer Science"
              />
            </div>
            <div>
              <Label>Application Deadline</Label>
              <Input
                type="datetime-local"
                value={jobForm.applicationDeadline}
                onChange={(e) =>
                  setJobForm((prev) => ({ ...prev, applicationDeadline: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Job Description</Label>
              <Textarea
                value={jobForm.description}
                onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <Label>Skills (comma-separated)</Label>
              <Input
                value={jobForm.skills}
                onChange={(e) => setJobForm((prev) => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>
            <div>
              <Label>Perks (comma-separated)</Label>
              <Input
                value={jobForm.perks}
                onChange={(e) => setJobForm((prev) => ({ ...prev, perks: e.target.value }))}
                placeholder="e.g., Health Insurance, Flexible Hours, Work From Home"
              />
            </div>
            <Button className="w-full" onClick={handleFormSubmit}>
              {editingJob ? "Save Changes" : "Post Job"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4 py-4">
              <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
              <p>{selectedJob.companyName} &middot; {selectedJob.location}</p>
              <p>{selectedJob.description}</p>
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedJob.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Experience Required</Label>
                <p>{selectedJob.experienceRequired}</p>
              </div>
              <div>
                <Label>Qualification</Label>
                <p>{selectedJob.qualification}</p>
              </div>
              {selectedJob.perks && selectedJob.perks.length > 0 && (
                <div>
                  <Label>Perks</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedJob.perks.map((perk) => (
                      <Badge key={perk} variant="outline">{perk}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Applications Dialog */}
      <Dialog open={isApplicationsOpen} onOpenChange={setIsApplicationsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Applications for {jobForApplications?.title}
            </DialogTitle>
            <CardDescription>
              {jobForApplications?.companyName} &middot; {jobForApplications?.location}
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {applicationsLoading ? (
              // Skeleton loader for applications
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </div>
              ))
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications received for this job yet.</p>
              </div>
            ) : (
              applications.map((application) => (
                <Card key={application._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{application.applicantName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        {application.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {application.phone}
                      </div>
                    </div>
                    <Badge variant={getApplicationStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadResume(application.resumeUrl, application.applicantName)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                      <select
                        value={application.status}
                        onChange={(e) => updateApplicationStatus(application.applicationId, e.target.value as JobApplication["status"])}
                        disabled={updatingStatus === application.applicationId}
                        className="text-sm border rounded p-1"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting for <b>{jobToDelete?.title}</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteJob}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobManagement;
