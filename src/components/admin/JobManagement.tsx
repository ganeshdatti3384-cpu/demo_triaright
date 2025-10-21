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
import {jobsApi}from "../../services/api";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage all your job postings.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Post New Job
        </Button>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
        </TabsList>
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
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        No job postings found.
                        <Button variant="link" onClick={() => { resetForm(); setIsFormOpen(true); }}>
                          Post your first job
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
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
                        <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => viewJobDetails(job)}>
                              <Eye className="h-4 w-4" />
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
