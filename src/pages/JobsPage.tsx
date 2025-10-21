// JobsPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { jobsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 

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

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    location: ''
  });
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsApi.getAllJobs();
      const openJobs = response.data.filter((job: Job) => job.status === 'Open');
      setJobs(openJobs);
      setFilteredJobs(openJobs);
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

  useEffect(() => {
    let result = jobs;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply job type filter
    if (filters.jobType) {
      result = result.filter(job => job.jobType === filters.jobType);
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredJobs(result);
  }, [searchTerm, filters, jobs]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Full-Time': return 'bg-green-100 text-green-800';
      case 'Part-Time': return 'bg-blue-100 text-blue-800';
      case 'Contract': return 'bg-purple-100 text-purple-800';
      case 'Internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplyNow = (job: Job) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;

    if (!applicationForm.applicantName || !applicationForm.email || !applicationForm.phone || !resumeFile) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill all required fields and upload a resume.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('applicantName', applicationForm.applicantName);
      formData.append('email', applicationForm.email);
      formData.append('phone', applicationForm.phone);
      formData.append('coverLetter', applicationForm.coverLetter);
      formData.append('resume', resumeFile);

      // You'll need to implement this API call in your jobsApi service
      await jobsApi.applyToJob(selectedJob._id, formData);
      
      toast({
        title: "Application Submitted",
        description: `Your application for ${selectedJob.title} has been submitted successfully.`,
      });
      
      setIsApplyDialogOpen(false);
      setApplicationForm({
        applicantName: '',
        email: '',
        phone: '',
        coverLetter: ''
      });
      setResumeFile(null);
    } catch (error) {
      console.error("Failed to apply for job:", error);
      toast({ 
        title: "Error", 
        description: "Could not submit application. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleSaveJob = (job: Job) => {
    // You can implement save job logic here
    toast({
      title: "Job Saved",
      description: `${job.title} has been saved to your favorites`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Navbar */}
      <Navbar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover opportunities that match your skills and career goals
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search jobs, companies, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                  <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-40"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({ jobType: '', location: '' });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all-jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-jobs">
                All Jobs ({filteredJobs.length})
              </TabsTrigger>
              <TabsTrigger value="featured">
                Featured Jobs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-jobs">
              {loading ? (
                <div className="grid gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid gap-6">
                  {filteredJobs.map((job) => (
                    <Card key={job._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                  {job.title}
                                </h3>
                                <p className="text-lg text-gray-700 mb-2">{job.companyName}</p>
                              </div>
                              <Badge className={getJobTypeColor(job.jobType)}>
                                {job.jobType}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {job.skills.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
                            <Button 
                              className="bg-brand-primary hover:bg-blue-700"
                              onClick={() => handleApplyNow(job)}
                            >
                              Apply Now
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleSaveJob(job)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all jobs.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({ jobType: '', location: '' });
                      }}
                    >
                      View All Jobs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="featured">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Briefcase className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Featured Jobs Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Premium job listings will be featured here for better visibility.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={applicationForm.applicantName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={applicationForm.phone}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <Label>Cover Letter</Label>
              <Textarea
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Write a cover letter (optional)"
                rows={4}
              />
            </div>
            
            <div>
              <Label>Resume *</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setResumeFile(file);
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
            </div>
            
            <Button onClick={handleSubmitApplication} className="w-full">
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Footer */}
      <Footer />
    </div>
  );
};

export default JobsPage;
