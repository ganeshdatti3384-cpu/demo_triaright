
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Edit, Trash2, Briefcase, Users } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: 'active' | 'closed';
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  coverLetter: string;
  applicationDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);
  const { toast } = useToast();

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time' as Job['type'],
    salary: '',
    description: '',
    requirements: ''
  });

  useEffect(() => {
    // Load sample data
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$60,000 - $80,000',
        description: 'We are looking for a skilled Frontend Developer...',
        requirements: ['React', 'TypeScript', 'CSS'],
        postedDate: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        title: 'Backend Developer',
        company: 'StartupXYZ',
        location: 'New York',
        type: 'Full-time',
        salary: '$70,000 - $90,000',
        description: 'Join our backend team to build scalable systems...',
        requirements: ['Node.js', 'Python', 'MongoDB'],
        postedDate: '2024-01-10',
        status: 'active'
      }
    ];

    const sampleApplications: JobApplication[] = [
      {
        id: '1',
        jobId: '1',
        jobTitle: 'Frontend Developer',
        applicantName: 'John Doe',
        applicantEmail: 'john@example.com',
        resumeUrl: '/resume.pdf',
        coverLetter: 'I am excited to apply for this position...',
        applicationDate: '2024-01-16',
        status: 'pending'
      },
      {
        id: '2',
        jobId: '1',
        jobTitle: 'Frontend Developer',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane@example.com',
        resumeUrl: '/resume2.pdf',
        coverLetter: 'With 3 years of React experience...',
        applicationDate: '2024-01-17',
        status: 'reviewed'
      }
    ];

    setJobs(sampleJobs);
    setApplications(sampleApplications);
  }, []);

  const handleAddJob = () => {
    if (!jobForm.title || !jobForm.company) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const newJob: Job = {
      id: Date.now().toString(),
      ...jobForm,
      requirements: jobForm.requirements.split(',').map(req => req.trim()),
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setJobs(prev => [...prev, newJob]);
    setJobForm({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: ''
    });
    setIsAddJobOpen(false);
    toast({
      title: "Success",
      description: "Job posted successfully"
    });
  };

  const updateApplicationStatus = (applicationId: string, status: JobApplication['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status } : app
    ));
    toast({
      title: "Success",
      description: `Application status updated to ${status}`
    });
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const viewApplicationDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsApplicationDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Management</h2>
        <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Job Title *</Label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                <div>
                  <Label>Company *</Label>
                  <Input
                    value={jobForm.company}
                    onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Remote/City"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <Label>Salary Range</Label>
                  <Input
                    value={jobForm.salary}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="$50,000 - $70,000"
                  />
                </div>
              </div>
              <div>
                <Label>Job Description</Label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Requirements (comma-separated)</Label>
                <Input
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="React, TypeScript, 2+ years experience"
                />
              </div>
              <Button onClick={handleAddJob} className="w-full">
                Post Job
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
            </CardHeader>
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
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.postedDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => viewJobDetails(job)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
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
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.applicantName}</TableCell>
                      <TableCell>{application.jobTitle}</TableCell>
                      <TableCell>{application.applicantEmail}</TableCell>
                      <TableCell>{application.applicationDate}</TableCell>
                      <TableCell>
                        <Badge variant={
                          application.status === 'accepted' ? 'default' :
                          application.status === 'rejected' ? 'destructive' :
                          application.status === 'reviewed' ? 'secondary' : 'outline'
                        }>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => viewApplicationDetails(application)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                            Reject
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
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                <p className="text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">{selectedJob.type}</Badge>
                <Badge variant={selectedJob.status === 'active' ? 'default' : 'secondary'}>
                  {selectedJob.status}
                </Badge>
              </div>
              <div>
                <Label>Salary</Label>
                <p>{selectedJob.salary}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedJob.description}</p>
              </div>
              <div>
                <Label>Requirements</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedJob.requirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Posted Date</Label>
                <p>{selectedJob.postedDate}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={isApplicationDetailOpen} onOpenChange={setIsApplicationDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedApplication.applicantName}</h3>
                <p className="text-gray-600">{selectedApplication.applicantEmail}</p>
              </div>
              <div>
                <Label>Applied for</Label>
                <p>{selectedApplication.jobTitle}</p>
              </div>
              <div>
                <Label>Application Date</Label>
                <p>{selectedApplication.applicationDate}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={
                  selectedApplication.status === 'accepted' ? 'default' :
                  selectedApplication.status === 'rejected' ? 'destructive' :
                  selectedApplication.status === 'reviewed' ? 'secondary' : 'outline'
                }>
                  {selectedApplication.status}
                </Badge>
              </div>
              <div>
                <Label>Cover Letter</Label>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.coverLetter}</p>
              </div>
              <div>
                <Label>Resume</Label>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => {
                  updateApplicationStatus(selectedApplication.id, 'accepted');
                  setIsApplicationDetailOpen(false);
                }}>
                  Accept Application
                </Button>
                <Button variant="destructive" onClick={() => {
                  updateApplicationStatus(selectedApplication.id, 'rejected');
                  setIsApplicationDetailOpen(false);
                }}>
                  Reject Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobManagement;
