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
}

const InternshipsManagement = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/internships', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched internships:', data);
        setInternships(data);
      } else {
        const errorText = await response.text();
        console.error('Fetch error:', errorText);
        toast({
          title: 'Error',
          description: `Failed to load internships: ${response.status} ${response.statusText}`,
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

  const createInternship = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found',
        variant: 'destructive'
      });
      return;
    }

    // Validation
    if (!newInternship.title || !newInternship.companyName || !newInternship.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreating(true);
      
      // Prepare the data according to your backend schema
      const internshipData = {
        title: newInternship.title,
        description: newInternship.description,
        companyName: newInternship.companyName,
        location: newInternship.location,
        internshipType: newInternship.internshipType,
        category: newInternship.category,
        duration: newInternship.duration,
        startDate: newInternship.startDate,
        applicationDeadline: newInternship.applicationDeadline,
        mode: newInternship.mode,
        stipendAmount: newInternship.mode === 'Paid' ? newInternship.stipendAmount : 0,
        currency: newInternship.currency,
        payFrequency: newInternship.payFrequency,
        qualification: newInternship.qualification,
        experienceRequired: newInternship.experienceRequired,
        skills: newInternship.skills,
        openings: newInternship.openings,
        perks: newInternship.perks,
        certificateProvided: newInternship.certificateProvided,
        letterOfRecommendation: newInternship.letterOfRecommendation,
        status: newInternship.status
      };

      console.log('Sending internship data:', internshipData);

      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      });

      console.log('Create response status:', response.status);
      
      if (response.ok) {
        const createdInternship = await response.json();
        console.log('Created internship:', createdInternship);
        
        toast({
          title: 'Success',
          description: 'Internship created successfully',
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
        const errorText = await response.text();
        console.error('Create error response:', errorText);
        toast({
          title: 'Error',
          description: `Failed to create internship: ${response.status} ${response.statusText}`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error creating internship:', error);
      toast({
        title: 'Error',
        description: `Failed to create internship: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setNewInternship({...newInternship, skills: skillsArray});
  };

  const handlePerksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const perksArray = e.target.value.split(',').map(perk => perk.trim()).filter(perk => perk);
    setNewInternship({...newInternship, perks: perksArray});
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
                Fill in the details to create a new internship listing.
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
                    <Label htmlFor="stipendAmount">Stipend Amount</Label>
                    <Input
                      id="stipendAmount"
                      type="number"
                      value={newInternship.stipendAmount}
                      onChange={(e) => setNewInternship({...newInternship, stipendAmount: Number(e.target.value)})}
                      placeholder="Stipend Amount"
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
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={newInternship.applicationDeadline}
                    onChange={(e) => setNewInternship({...newInternship, applicationDeadline: e.target.value})}
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search internships..."
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading internships...</p>
            </div>
          ) : (
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {internship.location}
                      </div>
                    </TableCell>
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
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(internship.applicationDeadline).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(internship.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteInternship(internship._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInternships.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No internships found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InternshipsManagement;
