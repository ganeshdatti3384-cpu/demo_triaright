/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Trash2, Briefcase } from 'lucide-react';
import { jobsApi } from '@/services/api';

// --- Interfaces ---
interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  jobType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  skills: string[];
  createdAt: string;
  status: 'Open' | 'Closed' | 'On Hold';
}

interface JobApplication {
  // ... (interface remains the same)
}

// --- Helper Functions ---

// IMPROVED: Helper to determine badge color based on job status
const getStatusBadgeVariant = (status: Job['status']): BadgeProps['variant'] => {
  switch (status) {
    case 'Open':
      return 'default'; // Typically green in shadcn/ui themes
    case 'Closed':
      return 'destructive';
    case 'On Hold':
      return 'secondary';
    default:
      return 'outline';
  }
};

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // State for items being acted upon
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  
  const { toast } = useToast();

  const [jobForm, setJobForm] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'Full-Time' as Job['jobType'],
    salaryMin: '',
    salaryMax: '',
    description: '',
    skills: ''
  });

  // ✅ Fetch jobs from the API using jobsApi
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // FIXED: The API call was missing. This now correctly fetches jobs.
      const response = await jobsApi.getAllJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast({ title: "Error", description: "Could not fetch jobs.", variant: "destructive" });
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
      title: '',
      companyName: '',
      location: '',
      jobType: 'Full-Time',
      salaryMin: '',
      salaryMax: '',
      description: '',
      skills: ''
    });
  };

  const handleFormSubmit = async () => {
    if (editingJob) {
      await handleUpdateJob();
    } else {
      await handleCreateJob();
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.companyName) {
      toast({ title: "Validation Error", description: "Title and Company Name are required.", variant: "destructive" });
      return;
    }
    const newJobPayload = {
      ...jobForm,
      skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      salaryMin: Number(jobForm.salaryMin) || undefined,
      salaryMax: Number(jobForm.salaryMax) || undefined,
    };

    try {
      await jobsApi.createJob(newJobPayload);
      toast({ title: "Success", description: "Job posted successfully." });
      await fetchJobs();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
    }
  };

  const openEditForm = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin?.toString() || '',
      salaryMax: job.salaryMax?.toString() || '',
      description: job.description,
      skills: job.skills.join(', ')
    });
    setIsFormOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    const updatedJobPayload = {
      ...jobForm,
      skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      salaryMin: Number(jobForm.salaryMin) || undefined,
      salaryMax: Number(jobForm.salaryMax) || undefined,
    };

    try {
      await jobsApi.updateJob(editingJob._id, updatedJobPayload);
      toast({ title: "Success", description: "Job updated successfully." });
      await fetchJobs();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update job:", error);
      toast({ title: "Error", description: "Failed to update job.", variant: "destructive" });
    }
  };

  const openDeleteAlert = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await jobsApi.deleteJob(jobToDelete._id);
      toast({ title: "Success", description: "Job deleted successfully." });
      await fetchJobs();
      setIsDeleteAlertOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
    }
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage all your job postings.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>An overview of all jobs you have posted.</CardDescription>
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
                    // IMPROVED: Skeleton loader for better UX
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-4"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                        <TableCell><div className="h-8 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div></TableCell>
                      </TableRow>
                    ))
                  ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => viewJobDetails(job)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(job)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteAlert(job)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // IMPROVED: Informative empty state
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Briefcase className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        No job postings found.
                        <Button variant="link" onClick={() => { resetForm(); setIsFormOpen(true); }}>
                          Post your first job
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          {/* ... application management UI ... */}
        </TabsContent>
      </Tabs>
      
      {/* --- Dialogs --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {/* ... Dialog for Add/Edit Job ... */}
      </Dialog>
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {/* ... Dialog for Job Details ... */}
      </Dialog>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        {/* ... AlertDialog for Delete Confirmation ... */}
      </AlertDialog>
    </div>
  );
};

export default JobManagement;

