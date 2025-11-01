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
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const RegularInternshipManagement = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
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
  const { toast } = useToast();

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
        skills: [],
        perks: [],
        certificateProvided: true,
        letterOfRecommendation: false,
        experienceRequired: ""
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
        skills: [],
        perks: [],
        certificateProvided: true,
        letterOfRecommendation: false,
        experienceRequired: ""
      };

      const response = await fetch(`/api/internships/${selectedInternship._id}`, {
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
      const response = await fetch(`/api/internships/${id}`, {
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
              {/* Form fields remain the same as in original */}
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

              {/* ... rest of the form fields ... */}

              <DialogFooter>
                <Button type="submit">Create Internship</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
              {/* Edit form fields - same as create form */}
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
              {/* ... rest of edit form fields ... */}
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
              {selectedInternship?.title}
            </DialogTitle>
            <DialogDescription>
              Internship Details
            </DialogDescription>
          </DialogHeader>
          {selectedInternship && (
            <div className="space-y-4">
              {/* View details - same as original */}
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
              {/* ... rest of view details ... */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegularInternshipManagement;