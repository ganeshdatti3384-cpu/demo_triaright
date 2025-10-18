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
    applicationDeadline: '',
    qualification: 'Any Graduate',
    experienceRequired: '0-1 years',
    skills: [] as string[],
    openings: 1,
    perks: [] as string[],
    certificateProvided: true,
    letterOfRecommendation: false,
    status: 'Open' as const,
  });

  // Test with absolute URL if relative doesn't work
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
      const response = await fetch(`${API_BASE_URL}/api/internships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 FETCH RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}/api/internships`
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ FETCHED INTERNSHIPS:', data);
        setInternships(data);
      } else {
        const errorText = await response.text();
        console.error('❌ FETCH ERROR:', errorText);
        toast({
          title: 'Error',
          description: `Failed to load internships: ${response.status}`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('❌ NETWORK ERROR:', error);
      toast({
        title: 'Network Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test function to check if API is accessible
  const testAPI = async () => {
    const token = localStorage.getItem('token');
    console.log('🔑 TOKEN:', token ? 'Present' : 'Missing');
    
    if (!token) {
      toast({
        title: 'No Token',
        description: 'Please login first',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🧪 TESTING API CONNECTION...');
      const testResponse = await fetch(`${API_BASE_URL}/api/internships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('🧪 API TEST RESULT:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok
      });
    } catch (error) {
      console.error('🧪 API TEST FAILED:', error);
    }
  };

  const createInternship = async () => {
    console.log('🚀 STARTING CREATE INTERNSHIP...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'No authentication token found',
        variant: 'destructive'
      });
      return;
    }

    // Basic validation
    if (!newInternship.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
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

      // Simple data structure - match exactly what backend expects
      const internshipData = {
        title: newInternship.title.trim(),
        companyName: newInternship.companyName.trim(),
        location: newInternship.location.trim() || 'Remote',
        internshipType: newInternship.internshipType,
        category: newInternship.category.trim() || 'General',
        description: newInternship.description.trim(),
        mode: newInternship.mode,
        stipendAmount: newInternship.mode === 'Paid' ? newInternship.stipendAmount : 0,
        duration: newInternship.duration,
        applicationDeadline: newInternship.applicationDeadline,
        openings: Number(newInternship.openings) || 1,
        qualification: newInternship.qualification,
        experienceRequired: newInternship.experienceRequired,
        status: newInternship.status,
        // Optional fields with defaults
        skills: newInternship.skills,
        perks: newInternship.perks,
        certificateProvided: newInternship.certificateProvided,
        letterOfRecommendation: newInternship.letterOfRecommendation,
      };

      console.log('📤 SENDING DATA:', internshipData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/internships`);

      const response = await fetch(`${API_BASE_URL}/api/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      });

      console.log('📥 RESPONSE STATUS:', response.status);
      console.log('📥 RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📥 RESPONSE BODY:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('❌ JSON PARSE ERROR:', e);
        responseData = { raw: responseText };
      }

      if (response.ok) {
        console.log('✅ CREATE SUCCESS:', responseData);
        
        toast({
          title: 'Success',
          description: 'Internship created successfully!',
        });

        // Reset form and close dialog
        setIsCreateDialogOpen(false);
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
          applicationDeadline: '',
          qualification: 'Any Graduate',
          experienceRequired: '0-1 years',
          skills: [],
          openings: 1,
          perks: [],
          certificateProvided: true,
          letterOfRecommendation: false,
          status: 'Open',
        });

        // Refresh the list
        fetchInternships();
      } else {
        console.error('❌ CREATE FAILED:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        let errorMessage = 'Failed to create internship';
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.raw) {
          errorMessage = responseData.raw;
        }

        toast({
          title: `Error ${response.status}`,
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('❌ NETWORK ERROR:', error);
      toast({
        title: 'Network Error',
        description: error.message || 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this internship?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/internships/${id}`, {
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
        toast({
          title: 'Error',
          description: 'Failed to delete internship',
          variant: 'destructive'
        });
      }
    } catch (error) {
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
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      'Unpaid': 'default',
      'Paid': 'default',
      'FeeBased': 'destructive'
    } as const;
    return <Badge variant={variants[mode as keyof typeof variants]}>{mode}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Internships Management</h2>
          <p className="text-gray-500">Manage internship listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInternships} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outline" onClick={testAPI}>
            Test API
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
                <DialogDescription>
                  Fill in the required fields to create a new internship.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newInternship.description}
                    onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                    placeholder="Describe the internship..."
                    rows={3}
                    required
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

      {/* Rest of the component remains the same */}
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

      <Card>
        <CardHeader>
          <CardTitle>Internships List</CardTitle>
          <CardDescription>
            {filteredInternships.length} internship(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
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
                    <TableCell>{internship.companyName}</TableCell>
                    <TableCell>{internship.internshipType}</TableCell>
                    <TableCell>{getModeBadge(internship.mode)}</TableCell>
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
                        <Button variant="outline" size="sm">
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
