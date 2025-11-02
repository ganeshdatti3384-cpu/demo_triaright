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
  mode: 'Unpaid' | 'Paid' | 'FeeBased';
  stipendAmount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
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
    category: '',
    duration: '',
    startDate: '',
    applicationDeadline: '',
    mode: 'Unpaid' as const,
    stipendAmount: 0,
    currency: 'INR',
    qualification: '',
    openings: 1,
    status: 'Open' as const,
    term: 'Shortterm' as const,
    payFrequency: 'None' as const,
    skills: [] as string[],
    perks: [] as string[],
    certificateProvided: true,
    letterOfRecommendation: false,
    experienceRequired: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, applicationSearch, applicationStatusFilter]);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setInternships(data);
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
      const url = internshipId 
        ? `/api/internships/applications?internshipId=${internshipId}`
        : '/api/internships/applications';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
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
    const required = ['title', 'description', 'companyName', 'location', 'duration', 'applicationDeadline'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Fields',
        description: `Please fill in: ${missing.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const createInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!validateFormData()) return;

    try {
      const internshipData = {
        title: formData.title,
        description: formData.description,
        companyName: formData.companyName,
        location: formData.location,
        internshipType: formData.internshipType,
        category: formData.category,
        duration: formData.duration,
        startDate: formData.startDate,
        applicationDeadline: formData.applicationDeadline,
        mode: formData.mode,
        stipendAmount: formData.stipendAmount,
        currency: formData.currency,
        qualification: formData.qualification,
        openings: formData.openings,
        status: formData.status,
        term: formData.term,
        payFrequency: formData.payFrequency,
        skills: formData.skills,
        perks: formData.perks,
        certificateProvided: formData.certificateProvided,
        letterOfRecommendation: formData.letterOfRecommendation,
        experienceRequired: formData.experienceRequired
      };

      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(internshipData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship created successfully'
        });
        setShowCreateDialog(false);
        resetFormData();
        fetchInternships();
      } else {
        throw new Error(data.message || data.error || 'Failed to create internship');
      }
    } catch (error: any) {
      console.error('Error creating internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create internship',
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
        title: formData.title,
        description: formData.description,
        companyName: formData.companyName,
        location: formData.location,
        internshipType: formData.internshipType,
        category: formData.category,
        duration: formData.duration,
        startDate: formData.startDate,
        applicationDeadline: formData.applicationDeadline,
        mode: formData.mode,
        stipendAmount: formData.stipendAmount,
        currency: formData.currency,
        qualification: formData.qualification,
        openings: formData.openings,
        status: formData.status,
        term: formData.term,
        payFrequency: formData.payFrequency,
        skills: formData.skills,
        perks: formData.perks,
        certificateProvided: formData.certificateProvided,
        letterOfRecommendation: formData.letterOfRecommendation,
        experienceRequired: formData.experienceRequired
      };

      const response = await fetch(`/api/internships/update/${selectedInternship._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(internshipData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship updated successfully'
        });
        setShowEditDialog(false);
        setSelectedInternship(null);
        fetchInternships();
      } else {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Failed to update internship');
      }
    } catch (error) {
      console.error('Error updating internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to update internship',
        variant: 'destructive'
      });
    }
  };

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship deleted successfully'
        });
        fetchInternships();
      } else {
        throw new Error('Failed to delete internship');
      }
    } catch (error) {
      console.error('Error deleting internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete internship',
        variant: 'destructive'
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application status updated successfully'
        });
        fetchApplications(selectedInternship?._id);
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
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
      category: internship.category || '',
      duration: internship.duration,
      startDate: internship.startDate.split('T')[0],
      applicationDeadline: internship.applicationDeadline.split('T')[0],
      mode: internship.mode,
      stipendAmount: internship.stipendAmount || 0,
      currency: internship.currency || 'INR',
      qualification: internship.qualification,
      openings: internship.openings,
      status: internship.status,
      term: (internship as any).term || 'Shortterm',
      payFrequency: (internship as any).payFrequency || 'None',
      skills: internship.skills || [],
      perks: (internship as any).perks || [],
      certificateProvided: (internship as any).certificateProvided !== false,
      letterOfRecommendation: (internship as any).letterOfRecommendation || false,
      experienceRequired: (internship as any).experienceRequired || ''
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
      category: '',
      duration: '',
      startDate: '',
      applicationDeadline: '',
      mode: 'Unpaid',
      stipendAmount: 0,
      currency: 'INR',
      qualification: '',
      openings: 1,
      status: 'Open',
      term: 'Shortterm',
      payFrequency: 'None',
      skills: [],
      perks: [],
      certificateProvided: true,
      letterOfRecommendation: false,
      experienceRequired: ''
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
      Unpaid: 'outline',
      FeeBased: 'destructive'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getApplicationStatusBadge = (status: string) => {
    const variants = {
      Applied: 'secondary',
      Shortlisted: 'default',
      Selected: 'default',
      Rejected: 'destructive',
      Withdrawn: 'outline'
    } as const;

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
                Fill in the details for the new internship opportunity.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createInternship} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  <label className="text-sm font-medium">Duration *</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 3 Months"
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
                      <SelectItem value="FeeBased">Fee Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.mode === 'Paid' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stipend Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.stipendAmount}
                    onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                  />
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
                    placeholder="e.g., Any Graduate"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings</label>
                  <Input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                  />
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
                            onClick={() => handleView(internship)}
                          >
                            <Eye className="h-4 w-4" />
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
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  <label className="text-sm font-medium">Duration *</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 3 Months"
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
                      <SelectItem value="FeeBased">Fee Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.mode === 'Paid' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stipend Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.stipendAmount}
                    onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                  />
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
                    placeholder="e.g., Any Graduate"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings</label>
                  <Input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                  />
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

      {/* Applications Dialog */}
      <Dialog open={showApplicationsDialog} onOpenChange={setShowApplicationsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Applications for {selectedInternship?.title}
            </DialogTitle>
            <DialogDescription>
              View and manage applications for this internship
            </DialogDescription>
          </DialogHeader>
          
          {applicationsLoading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell className="font-medium">
                        {application.applicantDetails.name}
                      </TableCell>
                      <TableCell>{application.applicantDetails.email}</TableCell>
                      <TableCell>{application.applicantDetails.phone}</TableCell>
                      <TableCell>{application.applicantDetails.college}</TableCell>
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
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No applications found for this internship
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegularInternshipManagement;
