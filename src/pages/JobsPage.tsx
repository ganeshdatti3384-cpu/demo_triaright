// JobsPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Building2, DollarSign, Clock, Bookmark, Share2, ArrowRight, Star } from 'lucide-react';
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
  isFeatured?: boolean;
  companyLogo?: string;
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
      case 'Full-Time': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'Part-Time': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Contract': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'Internship': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
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
    toast({
      title: "Job Saved",
      description: `${job.title} has been saved to your favorites`,
    });
  };

  const handleShareJob = (job: Job) => {
    toast({
      title: "Link Copied",
      description: "Job link copied to clipboard",
    });
  };

  const featuredJobs = jobs.filter(job => job.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Navbar />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Modern Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Discover your next career move
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals discovering opportunities that match their skills and career ambitions
            </p>
          </div>

          {/* Featured Jobs Banner */}
          {featuredJobs.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredJobs.map((job) => (
                  <Card key={job._id} className="group relative overflow-hidden border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.companyName} className="w-8 h-8" />
                            ) : (
                              <Building2 className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.companyName}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={getJobTypeColor(job.jobType)}>
                          {job.jobType}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {job.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleApplyNow(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="mb-12 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Search Opportunities</Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Job title, company, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Job Type</Label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 h-12 focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Types</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Any location"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="pl-10 border-2 border-gray-200 rounded-xl h-12 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({ jobType: '', location: '' });
                      }}
                      className="h-12 px-6 border-2 rounded-xl"
                    >
                      Clear
                    </Button>
                    <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all-jobs" className="space-y-8">
            <TabsList className="bg-gray-100/80 p-1 rounded-2xl w-full max-w-md">
              <TabsTrigger 
                value="all-jobs" 
                className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                All Jobs 
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs min-w-6">
                  {filteredJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="featured" 
                className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Featured
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-jobs" className="space-y-6">
              {loading ? (
                <div className="grid gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-0 shadow-sm rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="flex gap-4">
                              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid gap-6">
                  {filteredJobs.map((job) => (
                    <Card key={job._id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                  {job.companyLogo ? (
                                    <img src={job.companyLogo} alt={job.companyName} className="w-8 h-8" />
                                  ) : (
                                    <Building2 className="h-6 w-6 text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {job.title}
                                      </h3>
                                      <p className="text-lg text-gray-700 font-medium">{job.companyName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleSaveJob(job)}
                                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Bookmark className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleShareJob(job)}
                                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <Badge className={`${getJobTypeColor(job.jobType)} border`}>
                                    {job.jobType}
                                  </Badge>

                                  <p className="text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                                    {job.description}
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {job.skills.slice(0, 4).map((skill, index) => (
                                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
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
                              </div>
                            </div>
                            
                            <div className="flex lg:flex-col gap-2 lg:items-end">
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
                                onClick={() => handleApplyNow(job)}
                              >
                                Apply Now
                              </Button>
                              <Button 
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => handleSaveJob(job)}
                              >
                                <Bookmark className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      We couldn't find any jobs matching your criteria. Try adjusting your search filters or browse all available positions.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({ jobType: '', location: '' });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"
                    >
                      View All Jobs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="featured">
              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Star className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Premium Opportunities
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Featured job listings with enhanced visibility and premium placement are coming soon. 
                    Stay tuned for exclusive opportunities from top companies.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modern Application Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Apply for {selectedJob?.title}
            </DialogTitle>
            <p className="text-gray-600">at {selectedJob?.companyName}</p>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input
                  value={applicationForm.applicantName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email *</Label>
                <Input
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="rounded-xl h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phone Number *</Label>
              <Input
                value={applicationForm.phone}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                className="rounded-xl h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cover Letter</Label>
              <Textarea
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Tell us why you're the perfect candidate for this position..."
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resume *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setResumeFile(file);
                    }
                  }}
                  className="hidden"
                  id="resume-upload"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Upload your resume</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                    {resumeFile && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ {resumeFile.name}
                      </p>
                    )}
                  </div>
                </Label>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmitApplication} 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-medium"
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobsPage;
