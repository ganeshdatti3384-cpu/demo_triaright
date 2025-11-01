// components/admin/APInternshipManagement.tsx
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

const APInternshipManagement = () => {
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAPInternship, setSelectedAPInternship] = useState<APInternship | null>(null);
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
    fetchAPInternships();
  }, []);

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
        setShowCreateDialog(false);
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

  const deleteInternship = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/ap-internships/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'AP Internship deleted successfully'
        });
        fetchAPInternships();
      } else {
        throw new Error('Failed to delete AP internship');
      }
    } catch (error) {
      console.error('Error deleting AP internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete AP internship',
        variant: 'destructive'
      });
    }
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
        <h2 className="text-2xl font-bold">AP Internship Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
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
              {/* AP Internship form fields */}
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

              {/* ... rest of AP form fields ... */}

              <DialogFooter>
                <Button type="submit">Create AP Internship</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                        onClick={() => deleteInternship(internship._id)}
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

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAPInternship?.title}
            </DialogTitle>
            <DialogDescription>
              AP Internship Details
            </DialogDescription>
          </DialogHeader>
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
              {/* ... rest of AP view details ... */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APInternshipManagement;