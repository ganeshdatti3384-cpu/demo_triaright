// components/admin/RegularInternshipManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Users, FileText, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Remote' | 'On-Site' | 'Hybrid';
  category: string;
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Unpaid' | 'Paid';
  stipendAmount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
  term: 'Shortterm' | 'Longterm' | 'others';
  payFrequency: 'One-Time' | 'Monthly' | 'Weekly' | 'None';
  skills: string[];
  perks: string[];
  certificateProvided: boolean;
  letterOfRecommendation: boolean;
  experienceRequired: string;
}

interface Application {
  _id: string;
  internshipId: Internship;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn';
  applicantDetails: {
    name: string;
    email: string;
    phone: string;
    college: string;
    qualification: string;
  };
  resumeLink: string;
  coverLetter?: string;
  portfolioLink?: string;
  appliedAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'not_required';
}

const RegularInternshipManagement = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('internships');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    location: '',
    internshipType: 'Remote' as const,
    category: 'Web Development',
    duration: '',
    startDate: '',
    applicationDeadline: '',
    mode: 'Unpaid' as const,
    stipendAmount: 0,
    currency: 'INR',
    qualification: 'Any Graduate',
    openings: 1,
    status: 'Open' as const,
    term: 'Shortterm' as const,
    payFrequency: 'None' as const,
    skills: [] as string[],
    perks: [] as string[],
    certificateProvided: true,
    letterOfRecommendation: false,
    experienceRequired: 'Fresher'
  });
  
  const { toast } = useToast();

  // Base URL for API calls - FIXED: No trailing slash
  const API_BASE_URL = 'https://triaright.com/api/internships';

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, applicationSearch, applicationStatusFilter]);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      toast({
        title: 'Error',
        description: 'Please log in to view internships',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch internships response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched internships:', data);
      
      if (Array.isArray(data)) {
        setInternships(data);
      } else {
        console.error('Unexpected response format:', data);
        toast({
          title: 'Error',
          description: 'Unexpected response format from server',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internships',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (internshipId?: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setApplicationsLoading(true);
      // FIXED: Use the correct endpoint for getting all applications
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch applications response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched applications:', data);
      
      // Handle different response formats
      let applicationsData: Application[] = [];
      if (data.success && Array.isArray(data.applications)) {
        applicationsData = data.applications;
      } else if (Array.isArray(data)) {
        applicationsData = data;
      } else {
        console.error('Unexpected applications response format:', data);
        toast({
          title: 'Error',
          description: 'Unexpected response format for applications',
          variant: 'destructive'
        });
      }

      // Filter by internshipId if provided
      if (internshipId) {
        applicationsData = applicationsData.filter((app: Application) => 
          app.internshipId._id === internshipId
        );
      }
      
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = 
        app.applicantDetails.name.toLowerCase().includes(applicationSearch.toLowerCase()) ||
        app.applicantDetails.email.toLowerCase().includes(applicationSearch.toLowerCase()) ||
        app.internshipId.title.toLowerCase().includes(applicationSearch.toLowerCase());
      
      const matchesStatus = applicationStatusFilter === 'all' || app.status === applicationStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredApplications(filtered);
  };

  const validateFormData = () => {
    const required = ['title', 'description', 'companyName', 'location', 'duration', 'applicationDeadline', 'term'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Fields',
        description: `Please fill in: ${missing.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }

    // Validate application deadline is in the future
    if (formData.applicationDeadline) {
      const deadline = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline <= today) {
        toast({
          title: 'Invalid Date',
          description: 'Application deadline must be in the future',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const createInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please log in to create internships',
        variant: 'destructive'
      });
      return;
    }

    if (!validateFormData()) return;

    try {
      // Prepare data according to backend schema - FIXED: Match backend Internship model
      const internshipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        internshipType: formData.internshipType,
        category: formData.category.trim(),
        duration: formData.duration.trim(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
        mode: formData.mode,
        stipendAmount: formData.mode === 'Paid' ? formData.stipendAmount : 0,
        currency: formData.currency,
        qualification: formData.qualification.trim(),
        openings: formData.openings,
        status: formData.status,
        term: formData.term,
        payFrequency: formData.payFrequency,
        skills: formData.skills,
        perks: formData.perks,
        certificateProvided: formData.certificateProvided,
        letterOfRecommendation: formData.letterOfRecommendation,
        experienceRequired: formData.experienceRequired.trim()
      };

      console.log('Sending internship data:', internshipData);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(internshipData)
      });

      console.log('Create internship response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `Failed to create internship: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Create internship response:', data);

      toast({
        title: 'Success',
        description: 'Internship created successfully'
      });
      setShowCreateDialog(false);
      resetFormData();
      fetchInternships();
      
    } catch (error: any) {
      console.error('Error creating internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create internship. Please check console for details.',
        variant: 'destructive'
      });
    }
  };

  const updateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const internshipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        internshipType: formData.internshipType,
        category: formData.category.trim(),
        duration: formData.duration.trim(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
        mode: formData.mode,
        stipendAmount: formData.mode === 'Paid' ? formData.stipendAmount : 0,
        currency: formData.currency,
        qualification: formData.qualification.trim(),
        openings: formData.openings,
        status: formData.status,
        term: formData.term,
        payFrequency: formData.payFrequency,
        skills: formData.skills,
        perks: formData.perks,
        certificateProvided: formData.certificateProvided,
        letterOfRecommendation: formData.letterOfRecommendation,
        experienceRequired: formData.experienceRequired.trim()
      };

      console.log('Updating internship with data:', internshipData);

      // FIXED: Use the correct update endpoint
      const response = await fetch(`${API_BASE_URL}/update/${selectedInternship._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(internshipData)
      });

      console.log('Update internship response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `Failed to update internship: ${response.status}`);
      }

      const data = await response.json();
      console.log('Update internship response:', data);

      toast({
        title: 'Success',
        description: 'Internship updated successfully'
      });
      setShowEditDialog(false);
      setSelectedInternship(null);
      fetchInternships();
    } catch (error: any) {
      console.error('Error updating internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update internship',
        variant: 'destructive'
      });
    }
  };

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // FIXED: Use the correct delete endpoint
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to delete internship');
      }

      const data = await response.json();
      console.log('Delete internship response:', data);

      toast({
        title: 'Success',
        description: 'Internship deleted successfully'
      });
      fetchInternships();
    } catch (error: any) {
      console.error('Error deleting internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete internship',
        variant: 'destructive'
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // FIXED: Use the correct endpoint for updating application status
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update application status');
      }

      const data = await response.json();
      console.log('Update application status response:', data);

      toast({
        title: 'Success',
        description: 'Application status updated successfully'
      });
      
      // Refresh applications
      if (selectedInternship) {
        fetchApplications(selectedInternship._id);
      } else {
        fetchApplications();
      }
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application status',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship);
    setFormData({
      title: internship.title,
      description: internship.description,
      companyName: internship.companyName,
      location: internship.location,
      internshipType: internship.internshipType,
      category: internship.category || 'Web Development',
      duration: internship.duration,
      startDate: internship.startDate ? internship.startDate.split('T')[0] : '',
      applicationDeadline: internship.applicationDeadline.split('T')[0],
      mode: internship.mode,
      stipendAmount: internship.stipendAmount || 0,
      currency: internship.currency || 'INR',
      qualification: internship.qualification || 'Any Graduate',
      openings: internship.openings,
      status: internship.status,
      term: internship.term || 'Shortterm',
      payFrequency: internship.payFrequency || 'None',
      skills: internship.skills || [],
      perks: internship.perks || [],
      certificateProvided: internship.certificateProvided !== false,
      letterOfRecommendation: internship.letterOfRecommendation || false,
      experienceRequired: internship.experienceRequired || 'Fresher'
    });
    setShowEditDialog(true);
  };

  const handleView = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowViewDialog(true);
  };

  const handleViewApplications = (internship: Internship) => {
    setSelectedInternship(internship);
    fetchApplications(internship._id);
    setShowApplicationsDialog(true);
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      companyName: '',
      location: '',
      internshipType: 'Remote',
      category: 'Web Development',
      duration: '',
      startDate: '',
      applicationDeadline: '',
      mode: 'Unpaid',
      stipendAmount: 0,
      currency: 'INR',
      qualification: 'Any Graduate',
      openings: 1,
      status: 'Open',
      term: 'Shortterm',
      payFrequency: 'None',
      skills: [],
      perks: [],
      certificateProvided: true,
      letterOfRecommendation: false,
      experienceRequired: 'Fresher'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Open: 'default',
      Closed: 'destructive',
      'On Hold': 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      Paid: 'default',
      Unpaid: 'outline'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getApplicationStatusBadge = (status: string) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-800',
      Shortlisted: 'bg-yellow-100 text-yellow-800',
      Selected: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Withdrawn: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Regular Internship Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Regular Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Internship</DialogTitle>
              <DialogDescription>
                Fill in the details for the new internship opportunity. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createInternship} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Frontend Developer Intern"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="e.g., Tech Solutions Inc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the internship role, responsibilities, and learning opportunities..."
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Remote, Hyderabad, Bangalore"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internship Type</label>
                  <Select value={formData.internshipType} onValueChange={(value: any) => setFormData({...formData, internshipType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-Site">On-Site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Web Development, Data Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Term *</label>
                  <Select value={formData.term} onValueChange={(value: any) => setFormData({...formData, term: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shortterm">Short Term</SelectItem>
                      <SelectItem value="Longterm">Long Term</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration *</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 3 Months, 6 Months"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode *</label>
                  <Select value={formData.mode} onValueChange={(value: any) => setFormData({...formData, mode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.mode === 'Paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stipend Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.stipendAmount}
                      onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pay Frequency</label>
                    <Select value={formData.payFrequency} onValueChange={(value: any) => setFormData({...formData, payFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="One-Time">One-Time</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application Deadline *</label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualification</label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    placeholder="e.g., Any Graduate, B.Tech"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings</label>
                  <Input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Required</label>
                <Input
                  value={formData.experienceRequired}
                  onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})}
                  placeholder="e.g., Fresher, 0-1 years"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certificateProvided}
                    onChange={(e) => setFormData({...formData, certificateProvided: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Certificate Provided</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.letterOfRecommendation}
                    onChange={(e) => setFormData({...formData, letterOfRecommendation: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Letter of Recommendation</label>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create Internship</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internships">Internships</TabsTrigger>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="internships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regular Internships</CardTitle>
              <CardDescription>
                Manage all regular internship opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading internships...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Openings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internships.map((internship) => (
                      <TableRow key={internship._id}>
                        <TableCell className="font-medium">{internship.title}</TableCell>
                        <TableCell>{internship.companyName}</TableCell>
                        <TableCell>{internship.internshipType}</TableCell>
                        <TableCell>{getModeBadge(internship.mode)}</TableCell>
                        <TableCell>{internship.duration}</TableCell>
                        <TableCell>{internship.openings}</TableCell>
                        <TableCell>{getStatusBadge(internship.status)}</TableCell>
                        <TableCell>
                          {new Date(internship.applicationDeadline).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewApplications(internship)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(internship)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteInternship(internship._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {internships.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No internships found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>
                View and manage all internship applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications..."
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={applicationStatusFilter} onValueChange={setApplicationStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="Selected">Selected</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {applicationsLoading ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Internship</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell className="font-medium">
                          {application.applicantDetails.name}
                        </TableCell>
                        <TableCell>{application.applicantDetails.email}</TableCell>
                        <TableCell>{application.internshipId.title}</TableCell>
                        <TableCell>{application.internshipId.companyName}</TableCell>
                        <TableCell>
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getApplicationStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={application.status}
                              onValueChange={(value) => updateApplicationStatus(application._id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Applied">Applied</SelectItem>
                                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="Selected">Selected</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredApplications.length === 0 && !applicationsLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No applications found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Internship</DialogTitle>
            <DialogDescription>
              Update the details for this internship opportunity.
            </DialogDescription>
          </DialogHeader>
          {selectedInternship && (
            <form onSubmit={updateInternship} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internship Type</label>
                  <Select value={formData.internshipType} onValueChange={(value: any) => setFormData({...formData, internshipType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-Site">On-Site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Term</label>
                  <Select value={formData.term} onValueChange={(value: any) => setFormData({...formData, term: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shortterm">Short Term</SelectItem>
                      <SelectItem value="Longterm">Long Term</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <Select value={formData.mode} onValueChange={(value: any) => setFormData({...formData, mode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.mode === 'Paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stipend Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.stipendAmount}
                      onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pay Frequency</label>
                    <Select value={formData.payFrequency} onValueChange={(value: any) => setFormData({...formData, payFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="One-Time">One-Time</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application Deadline</label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualification</label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings</label>
                  <Input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Required</label>
                <Input
                  value={formData.experienceRequired}
                  onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certificateProvided}
                    onChange={(e) => setFormData({...formData, certificateProvided: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Certificate Provided</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.letterOfRecommendation}
                    onChange={(e) => setFormData({...formData, letterOfRecommendation: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Letter of Recommendation</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit">Update Internship</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Applications Dialog */}
      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Applications for {selectedInternship?.title}
            </DialogTitle>
            <DialogDescription>
              View and manage applications for this internship
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {applicationsLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : (
              <>
                {applications.filter(app => app.internshipId._id === selectedInternship?._id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applications found for this internship
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications
                        .filter(app => app.internshipId._id === selectedInternship?._id)
                        .map((application) => (
                          <TableRow key={application._id}>
                            <TableCell className="font-medium">
                              {application.applicantDetails.name}
                            </TableCell>
                            <TableCell>{application.applicantDetails.email}</TableCell>
                            <TableCell>{application.applicantDetails.college}</TableCell>
                            <TableCell>{application.applicantDetails.qualification}</TableCell>
                            <TableCell>
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getApplicationStatusBadge(application.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Select
                                  value={application.status}
                                  onValueChange={(value) => updateApplicationStatus(application._id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Applied">Applied</SelectItem>
                                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                                    <SelectItem value="Selected">Selected</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegularInternshipManagement;
