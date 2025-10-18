// admin/InternshipsManagement.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, Search, Filter, Building2, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  internshipType: 'Remote' | 'On-Site' | 'Hybrid';
  category: string;
  mode: 'Free' | 'Paid' | 'Pay-to-Work';
  stipendAmount?: number;
  status: 'Open' | 'Closed' | 'On Hold';
  applicationDeadline: string;
  openings: number;
  createdAt: string;
}

const InternshipsManagement = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
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
    mode: 'Free' as const,
    stipendAmount: 0,
    duration: '',
    startDate: '',
    applicationDeadline: '',
    qualification: '',
    experienceRequired: '',
    skills: [] as string[],
    openings: 1,
    perks: [] as string[],
    certificateProvided: false,
    letterOfRecommendation: false,
    status: 'Open' as const
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
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

  const createInternship = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newInternship),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Internship created successfully',
        });
        setIsCreateDialogOpen(false);
        setNewInternship({
          title: '',
          companyName: '',
          location: '',
          internshipType: 'Remote',
          category: '',
          description: '',
          mode: 'Free',
          stipendAmount: 0,
          duration: '',
          startDate: '',
          applicationDeadline: '',
          qualification: '',
          experienceRequired: '',
          skills: [],
          openings: 1,
          perks: [],
          certificateProvided: false,
          letterOfRecommendation: false,
          status: 'Open'
        });
        fetchInternships();
      }
    } catch (error) {
      console.error('Error creating internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to create internship',
        variant: 'destructive'
      });
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
      'Free': 'default',
      'Paid': 'default',
      'Pay-to-Work': 'destructive'
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newInternship.title}
                  onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                  placeholder="Internship Title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={newInternship.companyName}
                  onChange={(e) => setNewInternship({...newInternship, companyName: e.target.value})}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newInternship.location}
                  onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                  placeholder="Location"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Internship Type</label>
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
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={newInternship.category}
                  onChange={(e) => setNewInternship({...newInternship, category: e.target.value})}
                  placeholder="e.g., Web Development, Data Science"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select
                  value={newInternship.mode}
                  onValueChange={(value: 'Free' | 'Paid' | 'Pay-to-Work') => 
                    setNewInternship({...newInternship, mode: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pay-to-Work">Pay-to-Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newInternship.mode === 'Paid' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stipend Amount</label>
                  <Input
                    type="number"
                    value={newInternship.stipendAmount}
                    onChange={(e) => setNewInternship({...newInternship, stipendAmount: Number(e.target.value)})}
                    placeholder="Stipend Amount"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Openings</label>
                <Input
                  type="number"
                  value={newInternship.openings}
                  onChange={(e) => setNewInternship({...newInternship, openings: Number(e.target.value)})}
                  placeholder="Number of openings"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newInternship.description}
                  onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                  placeholder="Detailed description of the internship"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Deadline</label>
                <Input
                  type="date"
                  value={newInternship.applicationDeadline}
                  onChange={(e) => setNewInternship({...newInternship, applicationDeadline: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newInternship.startDate}
                  onChange={(e) => setNewInternship({...newInternship, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createInternship}>
                Create Internship
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Internships</CardTitle>
          <CardDescription>
            Manage existing internships and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search internships..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
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
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{internship.companyName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{internship.internshipType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getModeBadge(internship.mode)}
                      {internship.mode === 'Paid' && internship.stipendAmount && (
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <IndianRupee className="h-3 w-3" />
                          {internship.stipendAmount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{internship.openings}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(internship.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(internship.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                {filteredInternships.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No internships found matching your criteria
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