import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import axios from 'axios'; // 💡 Using axios for API calls

// ✅ Interface updated to match your backend schema
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
  _id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  createdAt: string;
  status: 'Applied' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired';
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002/api';

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

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

  // ✅ Fetch jobs from the API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
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
    // In a real app, you would fetch applications here too.
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

  const handleFormSubmit = () => {
    if (editingJob) {
      handleUpdateJob();
    } else {
      handleCreateJob();
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.companyName) {
      toast({ title: "Error", description: "Title and Company are required.", variant: "destructive" });
      return;
    }

    const newJobPayload = {
      ...jobForm,
      skills: jobForm.skills.split(',').map(req => req.trim()),
      salaryMin: Number(jobForm.salaryMin) || undefined,
      salaryMax: Number(jobForm.salaryMax) || undefined,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/jobs`, newJobPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Job posted successfully." });
      fetchJobs();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({ title: "Error", description: "Failed to post job.", variant: "destructive" });
    }
  };

  // ✅ Function to open the edit form
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

  // ✅ Function to handle the update API call
  const handleUpdateJob = async () => {
    if (!editingJob) return;

    const updatedJobPayload = {
        ...jobForm,
        skills: jobForm.skills.split(',').map(req => req.trim()),
        salaryMin: Number(jobForm.salaryMin) || undefined,
        salaryMax: Number(jobForm.salaryMax) || undefined,
    };

    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/jobs/${editingJob._id}`, updatedJobPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: "Success", description: "Job updated successfully." });
        fetchJobs();
        setIsFormOpen(false);
        resetForm();
    } catch (error) {
        console.error("Failed to update job:", error);
        toast({ title: "Error", description: "Failed to update job.", variant: "destructive" });
    }
  };

  // ✅ Function to open the delete confirmation
  const openDeleteAlert = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteAlertOpen(true);
  };

  // ✅ Function to handle the delete API call
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/jobs/${jobToDelete._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: "Success", description: "Job deleted successfully." });
        fetchJobs();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Management</h2>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader><CardTitle>Job Postings</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.companyName}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => viewJobDetails(job)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditForm(job)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(job)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
            <p className="p-4">Application management can be connected here.</p>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Job Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>Job Title *</Label>
                      <Input value={jobForm.title} onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))} />
                  </div>
                  <div>
                      <Label>Company *</Label>
                      <Input value={jobForm.companyName} onChange={(e) => setJobForm(prev => ({ ...prev, companyName: e.target.value }))} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>Location</Label>
                      <Input value={jobForm.location} onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))} />
                  </div>
                  <div>
                      <Label>Type</Label>
                      <select value={jobForm.jobType} onChange={(e) => setJobForm(prev => ({ ...prev, jobType: e.target.value as Job['jobType'] }))} className="w-full p-2 border rounded">
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                      </select>
                  </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Salary Minimum</Label>
                        <Input type="number" value={jobForm.salaryMin} onChange={(e) => setJobForm(prev => ({ ...prev, salaryMin: e.target.value }))} />
                    </div>
                    <div>
                        <Label>Salary Maximum</Label>
                        <Input type="number" value={jobForm.salaryMax} onChange={(e) => setJobForm(prev => ({ ...prev, salaryMax: e.target.value }))} />
                    </div>
                </div>
              <div>
                  <Label>Job Description</Label>
                  <Textarea value={jobForm.description} onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))} rows={4} />
              </div>
              <div>
                  <Label>Skills (comma-separated)</Label>
                  <Input value={jobForm.skills} onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))} />
              </div>
              <Button onClick={handleFormSubmit} className="w-full">
                {editingJob ? 'Save Changes' : 'Post Job'}
              </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Job Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Job Details</DialogTitle></DialogHeader>
              {selectedJob && (
                  <div className="space-y-4 py-4">
                    <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
                    <p>{selectedJob.companyName} • {selectedJob.location}</p>
                    <p>{selectedJob.description}</p>
                    <div>
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedJob.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                    </div>
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
              This action cannot be undone. This will permanently delete the job posting for "{jobToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobManagement;