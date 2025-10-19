// components/admin/InternshipManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Building2, MapPin, Calendar, IndianRupee, Download } from 'lucide-react';
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

interface APInternship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Online' | 'Offline';
  term: 'Shortterm' | 'Longterm';
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Free' | 'Paid';
  stream: string;
  Amount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
}

const InternshipManagement = () => {
  const [activeTab, setActiveTab] = useState('regular');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAPCreateDialog, setShowAPCreateDialog] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [selectedAPInternship, setSelectedAPInternship] = useState<APInternship | null>(null);
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
    status: 'Open' as const
  });
  const [apFormData, setApFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    location: 'Andhra Pradesh',
    internshipType: 'Online' as const,
    term: 'Shortterm' as const,
    duration: '',
    startDate: '',
    applicationDeadline: '',
    mode: 'Free' as const,
    stream: '',
    Amount: 0,
    currency: 'INR',
    qualification: '',
    openings: 1,
    status: 'Open' as const
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInternships();
    fetchAPInternships();
  }, []);

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

  const fetchAPInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/ap-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApInternships(data.internships);
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship created successfully'
        });
        setShowCreateDialog(false);
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
          status: 'Open'
        });
        fetchInternships();
      } else {
        throw new Error(data.message || 'Failed to create internship');
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
      const response = await fetch(`/api/internships/${selectedInternship._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
        throw new Error('Failed to update internship');
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

  const createAPInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/ap-internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apFormData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'AP Internship created successfully'
        });
        setShowAPCreateDialog(false);
        setApFormData({
          title: '',
          description: '',
          companyName: '',
          location: 'Andhra Pradesh',
          internshipType: 'Online',
          term: 'Shortterm',
          duration: '',
          startDate: '',
          applicationDeadline: '',
          mode: 'Free',
          stream: '',
          Amount: 0,
          currency: 'INR',
          qualification: '',
          openings: 1,
          status: 'Open'
        });
        fetchAPInternships();
      } else {
        throw new Error(data.message || 'Failed to create AP internship');
      }
    } catch (error: any) {
      console.error('Error creating AP internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create AP internship',
        variant: 'destructive'
      });
    }
  };

  const deleteInternship = async (id: string, isAP: boolean = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const endpoint = isAP 
        ? `/api/internships/ap-internships/${id}`
        : `/api/internships/${id}`;

      const response = await fetch(endpoint, {
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
        if (isAP) {
          fetchAPInternships();
        } else {
          fetchInternships();
        }
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

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship);
    setFormData({
      title: internship.title,
      description: internship.description,
      companyName: internship.companyName,
      location: internship.location,
      internshipType: internship.internshipType,
      category: internship.category,
      duration: internship.duration,
      startDate: internship.startDate.split('T')[0],
      applicationDeadline: internship.applicationDeadline.split('T')[0],
      mode: internship.mode,
      stipendAmount: internship.stipendAmount || 0,
      currency: internship.currency,
      qualification: internship.qualification,
      openings: internship.openings,
      status: internship.status
    });
    setShowEditDialog(true);
  };

  const handleView = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowViewDialog(true);
  };

  const handleViewAP = (internship: APInternship) => {
    setSelectedAPInternship(internship);
    setShowViewDialog(true);
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
      Free: 'secondary',
      Unpaid: 'outline',
      FeeBased: 'destructive'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Internship Management</h2>
        <div className="flex space-x-2">
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Internship Type *</label>
                    <Select
                      value={formData.internshipType}
                      onValueChange={(value: 'Remote' | 'On-Site' | 'Hybrid') => 
                        setFormData({...formData, internshipType: value})
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
                    <label className="text-sm font-medium">Category *</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode *</label>
                    <Select
                      value={formData.mode}
                      onValueChange={(value: 'Unpaid' | 'Paid' | 'FeeBased') => 
                        setFormData({...formData, mode: value})
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
                  {formData.mode !== 'Unpaid' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {formData.mode === 'Paid' ? 'Stipend Amount' : 'Fee Amount'} *
                      </label>
                      <Input
                        type="number"
                        value={formData.stipendAmount}
                        onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Openings *</label>
                    <Input
                      type="number"
                      value={formData.openings}
                      onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualification</label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    placeholder="e.g., Any Graduate, B.Tech CSE"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">Create Internship</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAPCreateDialog} onOpenChange={setShowAPCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create AP Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New AP Internship</DialogTitle>
                <DialogDescription>
                  Create internship opportunities specifically for Andhra Pradesh.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createAPInternship} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={apFormData.title}
                      onChange={(e) => setApFormData({...apFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input
                      value={apFormData.companyName}
                      onChange={(e) => setApFormData({...apFormData, companyName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={apFormData.description}
                    onChange={(e) => setApFormData({...apFormData, description: e.target.value})}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input value="Andhra Pradesh" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Internship Type *</label>
                    <Select
                      value={apFormData.internshipType}
                      onValueChange={(value: 'Online' | 'Offline') => 
                        setApFormData({...apFormData, internshipType: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Term *</label>
                    <Select
                      value={apFormData.term}
                      onValueChange={(value: 'Shortterm' | 'Longterm') => 
                        setApFormData({...apFormData, term: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shortterm">Short Term</SelectItem>
                        <SelectItem value="Longterm">Long Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration *</label>
                    <Input
                      value={apFormData.duration}
                      onChange={(e) => setApFormData({...apFormData, duration: e.target.value})}
                      placeholder="e.g., 3 Months"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={apFormData.startDate}
                      onChange={(e) => setApFormData({...apFormData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Application Deadline *</label>
                    <Input
                      type="date"
                      value={apFormData.applicationDeadline}
                      onChange={(e) => setApFormData({...apFormData, applicationDeadline: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode *</label>
                    <Select
                      value={apFormData.mode}
                      onValueChange={(value: 'Free' | 'Paid') => 
                        setApFormData({...apFormData, mode: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {apFormData.mode === 'Paid' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount *</label>
                      <Input
                        type="number"
                        value={apFormData.Amount}
                        onChange={(e) => setApFormData({...apFormData, Amount: Number(e.target.value)})}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Openings *</label>
                    <Input
                      type="number"
                      value={apFormData.openings}
                      onChange={(e) => setApFormData({...apFormData, openings: Number(e.target.value)})}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stream *</label>
                    <Input
                      value={apFormData.stream}
                      onChange={(e) => setApFormData({...apFormData, stream: e.target.value})}
                      placeholder="e.g., Computer Science & Engineering"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Qualification</label>
                    <Input
                      value={apFormData.qualification}
                      onChange={(e) => setApFormData({...apFormData, qualification: e.target.value})}
                      placeholder="e.g., B.Tech/B.E. in CSE"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Create AP Internship</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular">Regular Internships</TabsTrigger>
          <TabsTrigger value="ap">AP Internships</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
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

        <TabsContent value="ap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AP Internships</CardTitle>
              <CardDescription>
                Manage Andhra Pradesh specific internship opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Openings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apInternships.map((internship) => (
                    <TableRow key={internship._id}>
                      <TableCell className="font-medium">{internship.title}</TableCell>
                      <TableCell>{internship.companyName}</TableCell>
                      <TableCell>{internship.internshipType}</TableCell>
                      <TableCell>{internship.term}</TableCell>
                      <TableCell>{getModeBadge(internship.mode)}</TableCell>
                      <TableCell>{internship.stream}</TableCell>
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
                            onClick={() => handleViewAP(internship)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteInternship(internship._id, true)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apInternships.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No AP internships found
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internship Type *</label>
                  <Select
                    value={formData.internshipType}
                    onValueChange={(value: 'Remote' | 'On-Site' | 'Hybrid') => 
                      setFormData({...formData, internshipType: value})
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
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode *</label>
                  <Select
                    value={formData.mode}
                    onValueChange={(value: 'Unpaid' | 'Paid' | 'FeeBased') => 
                      setFormData({...formData, mode: value})
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
                {formData.mode !== 'Unpaid' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {formData.mode === 'Paid' ? 'Stipend Amount' : 'Fee Amount'} *
                    </label>
                    <Input
                      type="number"
                      value={formData.stipendAmount}
                      onChange={(e) => setFormData({...formData, stipendAmount: Number(e.target.value)})}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings *</label>
                  <Input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData({...formData, openings: Number(e.target.value)})}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification</label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                  placeholder="e.g., Any Graduate, B.Tech CSE"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Open' | 'Closed' | 'On Hold') => 
                    setFormData({...formData, status: value})
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

              <DialogFooter>
                <Button type="submit">Update Internship</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInternship ? selectedInternship.title : selectedAPInternship?.title}
            </DialogTitle>
            <DialogDescription>
              Internship Details
            </DialogDescription>
          </DialogHeader>
          {selectedInternship && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Company</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.companyName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.location}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedInternship.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold">Type</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.internshipType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Duration</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Mode</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.mode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Start Date</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedInternship.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Deadline</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedInternship.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Openings</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.openings}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <p className="text-sm text-gray-600">{selectedInternship.status}</p>
                </div>
              </div>
            </div>
          )}
          {selectedAPInternship && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Company</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.companyName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Location</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.location}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedAPInternship.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold">Type</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.internshipType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Term</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.term}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Mode</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.mode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Stream</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.stream}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Duration</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.duration}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Start Date</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAPInternship.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Deadline</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAPInternship.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Openings</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.openings}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.status}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipManagement;
