// admin/InternshipsManagement.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, Search, Filter, Building2, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  internshipType: 'Remote' | 'On-Site' | 'Hybrid';
  category: string;
  mode: 'Unpaid' | 'Paid' | 'FeeBased';
  stipendAmount?: number;
  status: 'Open' | 'Closed' | 'On Hold';
  applicationDeadline: string;
  openings: number;
  createdAt: string;
  description?: string;
  duration?: string;
  qualification?: string;
  experienceRequired?: string;
  skills?: string[];
  perks?: string[];
  certificateProvided?: boolean;
  letterOfRecommendation?: boolean;
  payFrequency?: string;
  currency?: string;
}

const InternshipsManagement = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const { toast } = useToast();

  const [newInternship, setNewInternship] = useState({
    title: '',
    companyName: '',
    location: '',
    internshipType: 'Remote' as const,
    category: '',
    description: '',
    mode: 'Unpaid' as const,
    stipendAmount: 0,
    duration: 'Shortterm' as const,
    startDate: '',
    applicationDeadline: '',
    qualification: 'Any Graduate',
    experienceRequired: '0-1 years',
    skills: [] as string[],
    openings: 1,
    perks: [] as string[],
    certificateProvided: true,
    letterOfRecommendation: false,
    status: 'Open' as const,
    payFrequency: 'None' as const,
    currency: 'INR' as const
  });

  // Get base URL from environment or use relative path
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found. Please login again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching internships from:', `${API_BASE_URL}/api/internships`);
      
      const response = await fetch(`${API_BASE_URL}/api/internships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched internships data:', data);
        setInternships(data);
      } else {
        const errorText = await response.text();
        console.error('Fetch error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Please login again',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: `Failed to load internships: ${response.status} ${response.statusText}`,
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      console.error('Network error fetching internships:', error);
      toast({
        title: 'Network Error',
        description: 'Failed to connect to server. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createInternship = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found. Please login again.',
        variant: 'destructive'
      });
      return;
    }

    // Enhanced validation
    if (!newInternship.title.trim()) {
      toast({
        title: 'Error',
        description: 'Internship title is required',
        variant: 'destructive'
      });
      return;
    }

    if (!newInternship.companyName.trim()) {
      toast({
        title: 'Error',
        description: 'Company name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!newInternship.description.trim()) {
      toast({
        title: 'Error',
        description: 'Description is required',
        variant: 'destructive'
      });
      return;
    }

    if (!newInternship.applicationDeadline) {
      toast({
        title: 'Error',
        description: 'Application deadline is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreating(true);
      
      // Prepare the data according to your backend schema
      const internshipData = {
        title: newInternship.title.trim(),
        description: newInternship.description.trim(),
        companyName: newInternship.companyName.trim(),
        location: newInternship.location.trim(),
        internshipType: newInternship.internshipType,
        category: newInternship.category.trim(),
        duration: newInternship.duration,
        startDate: newInternship.startDate || undefined,
        applicationDeadline: newInternship.applicationDeadline,
        mode: newInternship.mode,
        stipendAmount: newInternship.mode === 'Paid' ? newInternship.stipendAmount : 0,
        currency: newInternship.currency,
        payFrequency: newInternship.payFrequency,
        qualification: newInternship.qualification,
        experienceRequired: newInternship.experienceRequired,
        skills: newInternship.skills,
        openings: Number(newInternship.openings) || 1,
        perks: newInternship.perks,
        certificateProvided: newInternship.certificateProvided,
        letterOfRecommendation: newInternship.letterOfRecommendation,
        status: newInternship.status
      };

      console.log('Sending internship data:', internshipData);
      console.log('API URL:', `${API_BASE_URL}/api/internships`);

      const response = await fetch(`${API_BASE_URL}/api/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      });

      console.log('Create response status:', response.status);
      
      const responseText = await response.text();
      console.log('Create response text:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        responseData = { message: responseText };
      }

      if (response.ok) {
        console.log('Internship created successfully:', responseData);
        
        toast({
          title: 'Success',
          description: responseData.message || 'Internship created successfully',
        });
        
        setIsCreateDialogOpen(false);
        // Reset form
        setNewInternship({
          title: '',
          companyName: '',
          location: '',
          internshipType: 'Remote',
          category: '',
          description: '',
          mode: 'Unpaid',
          stipendAmount: 0,
          duration: 'Shortterm',
          startDate: '',
          applicationDeadline: '',
          qualification: 'Any Graduate',
          experienceRequired: '0-1 years',
          skills: [],
          openings: 1,
          perks: [],
          certificateProvided: true,
          letterOfRecommendation: false,
          status: 'Open',
          payFrequency: 'None',
          currency: 'INR'
        });
        
        // Refresh the list
        fetchInternships();
      } else {
        console.error('Create error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        let errorMessage = `Failed to create internship: ${response.status} ${response.statusText}`;
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Network error creating internship:', error);
      toast({
        title: 'Network Error',
        description: `Failed to create internship: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const updateInternship = async () => {
    if (!editingInternship) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found. Please login again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUpdating(true);
      
      // Prepare update data
      const updateData = {
        title: editingInternship.title,
        description: editingInternship.description,
        companyName: editingInternship.companyName,
        location: editingInternship.location,
        internshipType: editingInternship.internshipType,
        category: editingInternship.category,
        duration: editingInternship.duration,
        applicationDeadline: editingInternship.applicationDeadline,
        mode: editingInternship.mode,
        stipendAmount: editingInternship.stipendAmount,
        qualification: editingInternship.qualification,
        experienceRequired: editingInternship.experienceRequired,
        skills: editingInternship.skills || [],
        openings: editingInternship.openings,
        perks: editingInternship.perks || [],
        certificateProvided: editingInternship.certificateProvided,
        letterOfRecommendation: editingInternship.letterOfRecommendation,
        status: editingInternship.status,
        payFrequency: editingInternship.payFrequency,
      };

      console.log('Updating internship:', editingInternship._id);
      console.log('Update data:', updateData);

      const response = await fetch(`${API_BASE_URL}/api/internships/${editingInternship._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update response status:', response.status);
      
      const responseText = await response.text();
      console.log('Update response text:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        responseData = { message: responseText };
      }

      if (response.ok) {
        console.log('Internship updated successfully:', responseData);
        
        toast({
          title: 'Success',
          description: responseData.message || 'Internship updated successfully',
        });
        
        setIsEditDialogOpen(false);
        setEditingInternship(null);
        
        // Refresh the list
        fetchInternships();
      } else {
        console.error('Update error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        let errorMessage = `Failed to update internship: ${response.status} ${response.statusText}`;
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Network error updating internship:', error);
      toast({
        title: 'Network Error',
        description: `Failed to update internship: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this internship?')) {
      return;
    }

    try {
      console.log('Deleting internship:', id);
      const response = await fetch(`${API_BASE_URL}/api/internships/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship deleted successfully',
        });
        fetchInternships();
      } else {
        const errorText = await response.text();
        console.error('Delete error:', errorText);
        toast({
          title: 'Error',
          description: 'Failed to delete internship',
          variant: 'destructive'
        });
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

  const handleEditClick = (internship: Internship) => {
    setEditingInternship({ ...internship });
    setIsEditDialogOpen(true);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    if (isEdit && editingInternship) {
      setEditingInternship({ ...editingInternship, skills: skillsArray });
    } else {
      setNewInternship({...newInternship, skills: skillsArray});
    }
  };

  const handlePerksChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const perksArray = e.target.value.split(',').map(perk => perk.trim()).filter(perk => perk);
    if (isEdit && editingInternship) {
      setEditingInternship({ ...editingInternship, perks: perksArray });
    } else {
      setNewInternship({...newInternship, perks: perksArray});
    }
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || internship.status === statusFilter;
    const matchesType = typeFilter === 'all' || internship.internshipType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'Open': 'default',
      'Closed': 'destructive',
      'On Hold': 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      'Unpaid': 'default',
      'Paid': 'default',
      'FeeBased': 'destructive'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants]}>
        {mode}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Internships Management</h2>
          <p className="text-gray-500">Manage and monitor all internship listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInternships} disabled={loading}>
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new internship listing. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newInternship.title}
                      onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                      placeholder="Internship Title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newInternship.companyName}
                      onChange={(e) => setNewInternship({...newInternship, companyName: e.target.value})}
                      placeholder="Company Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newInternship.location}
                      onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                      placeholder="Location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="internshipType">Internship Type</Label>
                    <Select
                      value={newInternship.internshipType}
                      onValueChange={(value: 'Remote' | 'On-Site' | 'Hybrid') => 
                        setNewInternship({...newInternship, internshipType: value})
                      }
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newInternship.category}
                      onChange={(e) => setNewInternship({...newInternship, category: e.target.value})}
                      placeholder="e.g., Web Development, Data Science"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration Type</Label>
                    <Select
                      value={newInternship.duration}
                      onValueChange={(value: 'Shortterm' | 'Longterm' | 'others') => 
                        setNewInternship({...newInternship, duration: value})
                      }
                    >
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

                {/* Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mode">Mode</Label>
                    <Select
                      value={newInternship.mode}
                      onValueChange={(value: 'Unpaid' | 'Paid' | 'FeeBased') => 
                        setNewInternship({...newInternship, mode: value})
                      }
                    >
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

                  {newInternship.mode === 'Paid' && (
                    <div className="space-y-2">
                      <Label htmlFor="stipendAmount">Stipend Amount (INR)</Label>
                      <Input
                        id="stipendAmount"
                        type="number"
                        value={newInternship.stipendAmount}
                        onChange={(e) => setNewInternship({...newInternship, stipendAmount: Number(e.target.value)})}
                        placeholder="Stipend Amount"
                        min="0"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="payFrequency">Pay Frequency</Label>
                    <Select
                      value={newInternship.payFrequency}
                      onValueChange={(value: 'One-Time' | 'Monthly' | 'Weekly' | 'None') => 
                        setNewInternship({...newInternship, payFrequency: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One-Time">One Time</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openings">Openings</Label>
                    <Input
                      id="openings"
                      type="number"
                      value={newInternship.openings}
                      onChange={(e) => setNewInternship({...newInternship, openings: Number(e.target.value)})}
                      placeholder="Number of openings"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={newInternship.applicationDeadline}
                      onChange={(e) => setNewInternship({...newInternship, applicationDeadline: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newInternship.startDate}
                      onChange={(e) => setNewInternship({...newInternship, startDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newInternship.description}
                    onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                    placeholder="Detailed description of the internship, responsibilities, requirements, etc."
                    rows={4}
                    required
                  />
                </div>

                {/* Skills and Perks */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Requirements</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      value={newInternship.skills.join(', ')}
                      onChange={handleSkillsChange}
                      placeholder="React, Node.js, JavaScript, ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={newInternship.qualification}
                      onChange={(e) => setNewInternship({...newInternship, qualification: e.target.value})}
                      placeholder="e.g., Any Graduate, B.Tech, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input
                      id="experience"
                      value={newInternship.experienceRequired}
                      onChange={(e) => setNewInternship({...newInternship, experienceRequired: e.target.value})}
                      placeholder="e.g., 0-1 years, 1-2 years"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Benefits</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="perks">Perks (comma separated)</Label>
                    <Input
                      id="perks"
                      value={newInternship.perks.join(', ')}
                      onChange={handlePerksChange}
                      placeholder="Flexible hours, Certificate, Letter of recommendation, ..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newInternship.certificateProvided}
                      onCheckedChange={(checked) => 
                        setNewInternship({...newInternship, certificateProvided: checked})
                      }
                    />
                    <Label>Certificate Provided</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newInternship.letterOfRecommendation}
                      onCheckedChange={(checked) => 
                        setNewInternship({...newInternship, letterOfRecommendation: checked})
                      }
                    />
                    <Label>Letter of Recommendation</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newInternship.status}
                      onValueChange={(value: 'Open' | 'Closed' | 'On Hold') => 
                        setNewInternship({...newInternship, status: value})
                      }
                    >
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
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createInternship} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Internship'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Internship Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Internship</DialogTitle>
            <DialogDescription>
              Update the internship details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingInternship && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingInternship.title}
                    onChange={(e) => setEditingInternship({...editingInternship, title: e.target.value})}
                    placeholder="Internship Title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-companyName">Company Name *</Label>
                  <Input
                    id="edit-companyName"
                    value={editingInternship.companyName}
                    onChange={(e) => setEditingInternship({...editingInternship, companyName: e.target.value})}
                    placeholder="Company Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingInternship.location}
                    onChange={(e) => setEditingInternship({...editingInternship, location: e.target.value})}
                    placeholder="Location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-internshipType">Internship Type</Label>
                  <Select
                    value={editingInternship.internshipType}
                    onValueChange={(value: 'Remote' | 'On-Site' | 'Hybrid') => 
                      setEditingInternship({...editingInternship, internshipType: value})
                    }
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingInternship.category || ''}
                    onChange={(e) => setEditingInternship({...editingInternship, category: e.target.value})}
                    placeholder="e.g., Web Development, Data Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration Type</Label>
                  <Select
                    value={editingInternship.duration || 'Shortterm'}
                    onValueChange={(value: 'Shortterm' | 'Longterm' | 'others') => 
                      setEditingInternship({...editingInternship, duration: value})
                    }
                  >
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

              {/* Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-mode">Mode</Label>
                  <Select
                    value={editingInternship.mode}
                    onValueChange={(value: 'Unpaid' | 'Paid' | 'FeeBased') => 
                      setEditingInternship({...editingInternship, mode: value})
                    }
                  >
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

                {editingInternship.mode === 'Paid' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-stipendAmount">Stipend Amount (INR)</Label>
                    <Input
                      id="edit-stipendAmount"
                      type="number"
                      value={editingInternship.stipendAmount || 0}
                      onChange={(e) => setEditingInternship({...editingInternship, stipendAmount: Number(e.target.value)})}
                      placeholder="Stipend Amount"
                      min="0"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-payFrequency">Pay Frequency</Label>
                  <Select
                    value={editingInternship.payFrequency || 'None'}
                    onValueChange={(value: 'One-Time' | 'Monthly' | 'Weekly' | 'None') => 
                      setEditingInternship({...editingInternship, payFrequency: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-Time">One Time</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-openings">Openings</Label>
                  <Input
                    id="edit-openings"
                    type="number"
                    value={editingInternship.openings}
                    onChange={(e) => setEditingInternship({...editingInternship, openings: Number(e.target.value)})}
                    placeholder="Number of openings"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-applicationDeadline">Application Deadline *</Label>
                  <Input
                    id="edit-applicationDeadline"
                    type="date"
                    value={editingInternship.applicationDeadline.split('T')[0]}
                    onChange={(e) => setEditingInternship({...editingInternship, applicationDeadline: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingInternship.status}
                    onValueChange={(value: 'Open' | 'Closed' | 'On Hold') => 
                      setEditingInternship({...editingInternship, status: value})
                    }
                  >
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
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editingInternship.description || ''}
                  onChange={(e) => setEditingInternship({...editingInternship, description: e.target.value})}
                  placeholder="Detailed description of the internship, responsibilities, requirements, etc."
                  rows={4}
                  required
                />
              </div>

              {/* Skills and Perks */}
              <div className="space-y-3">
                <h3 className="font-semibold">Requirements</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-skills">Required Skills (comma separated)</Label>
                  <Input
                    id="edit-skills"
                    value={(editingInternship.skills || []).join(', ')}
                    onChange={(e) => handleSkillsChange(e, true)}
                    placeholder="React, Node.js, JavaScript, ..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-qualification">Qualification</Label>
                  <Input
                    id="edit-qualification"
                    value={editingInternship.qualification || ''}
                    onChange={(e) => setEditingInternship({...editingInternship, qualification: e.target.value})}
                    placeholder="e.g., Any Graduate, B.Tech, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-experience">Experience Required</Label>
                  <Input
                    id="edit-experience"
                    value={editingInternship.experienceRequired || ''}
                    onChange={(e) => setEditingInternship({...editingInternship, experienceRequired: e.target.value})}
                    placeholder="e.g., 0-1 years, 1-2 years"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Benefits</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-perks">Perks (comma separated)</Label>
                  <Input
                    id="edit-perks"
                    value={(editingInternship.perks || []).join(', ')}
                    onChange={(e) => handlePerksChange(e, true)}
                    placeholder="Flexible hours, Certificate, Letter of recommendation, ..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingInternship.certificateProvided || false}
                    onCheckedChange={(checked) => 
                      setEditingInternship({...editingInternship, certificateProvided: checked})
                    }
                  />
                  <Label>Certificate Provided</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingInternship.letterOfRecommendation || false}
                    onCheckedChange={(checked) => 
                      setEditingInternship({...editingInternship, letterOfRecommendation: checked})
                    }
                  />
                  <Label>Letter of Recommendation</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateInternship} disabled={updating}>
              {updating ? 'Updating...' : 'Update Internship'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search internships by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="On-Site">On-Site</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Internships List</CardTitle>
          <CardDescription>
            {filteredInternships.length} internship(s) found
            {loading && ' - Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading internships...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Stipend</TableHead>
                    <TableHead>Openings</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInternships.map((internship) => (
                    <TableRow key={internship._id}>
                      <TableCell className="font-medium">{internship.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          {internship.companyName}
                        </div>
                      </TableCell>
                      <TableCell>{internship.location}</TableCell>
                      <TableCell>{internship.internshipType}</TableCell>
                      <TableCell>{getModeBadge(internship.mode)}</TableCell>
                      <TableCell>
                        {internship.mode === 'Paid' && internship.stipendAmount ? (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {internship.stipendAmount.toLocaleString()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{internship.openings}</TableCell>
                      <TableCell>
                        {new Date(internship.applicationDeadline).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(internship.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(internship)}
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
                  {filteredInternships.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        {internships.length === 0 ? 'No internships found. Create your first internship!' : 'No internships match your search criteria.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InternshipsManagement;
