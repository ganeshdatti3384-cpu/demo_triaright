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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Video, FileText, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import APCourseManagement from './APCourseManagement';

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
  amount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
  relatedCourse?: string;
}

const APInternshipManagement = () => {
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAPInternship, setSelectedAPInternship] = useState<APInternship | null>(null);
  const [activeTab, setActiveTab] = useState('internships');
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
    amount: 0,
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
      const response = await fetch('/api/internships/apinternships', {
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
        resetForm();
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

  const updateAPInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAPInternship) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apinternships/${selectedAPInternship._id}`, {
        method: 'PUT',
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
          description: 'AP Internship updated successfully'
        });
        setShowEditDialog(false);
        resetForm();
        fetchAPInternships();
      } else {
        throw new Error(data.message || 'Failed to update AP internship');
      }
    } catch (error: any) {
      console.error('Error updating AP internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update AP internship',
        variant: 'destructive'
      });
    }
  };

  const deleteInternship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apinternships/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'AP Internship deleted successfully'
        });
        fetchAPInternships();
      } else {
        throw new Error(data.message || 'Failed to delete AP internship');
      }
    } catch (error: any) {
      console.error('Error deleting AP internship:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete AP internship',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (internship: APInternship) => {
    setSelectedAPInternship(internship);
    setApFormData({
      title: internship.title,
      description: internship.description,
      companyName: internship.companyName,
      location: internship.location,
      internshipType: internship.internshipType,
      term: internship.term,
      duration: internship.duration,
      startDate: internship.startDate.split('T')[0],
      applicationDeadline: internship.applicationDeadline.split('T')[0],
      mode: internship.mode,
      stream: internship.stream,
      amount: internship.amount || 0,
      currency: internship.currency,
      qualification: internship.qualification,
      openings: internship.openings,
      status: internship.status
    });
    setShowEditDialog(true);
  };

  const handleViewAP = (internship: APInternship) => {
    setSelectedAPInternship(internship);
    setShowViewDialog(true);
  };

  const resetForm = () => {
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
      amount: 0,
      currency: 'INR',
      qualification: '',
      openings: 1,
      status: 'Open'
    });
    setSelectedAPInternship(null);
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
      Free: 'secondary'
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
        <div>
          <h2 className="text-2xl font-bold">AP Internship Management</h2>
          <p className="text-gray-600">Manage Andhra Pradesh exclusive internship programs</p>
        </div>
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium">Stream *</label>
                  <Input
                    value={apFormData.stream}
                    onChange={(e) => setApFormData({...apFormData, stream: e.target.value})}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode *</label>
                  <Select
                    value={apFormData.mode}
                    onValueChange={(value: 'Free' | 'Paid') => {
                      setApFormData({...apFormData, mode: value});
                      if (value === 'Free') {
                        setApFormData({...apFormData, mode: value, amount: 0});
                      }
                    }}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <Select
                    value={apFormData.status}
                    onValueChange={(value: 'Open' | 'Closed' | 'On Hold') => 
                      setApFormData({...apFormData, status: value})
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

              {apFormData.mode === 'Paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (INR)</label>
                    <Input
                      type="number"
                      value={apFormData.amount}
                      onChange={(e) => setApFormData({...apFormData, amount: Number(e.target.value)})}
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualification</label>
                  <Input
                    value={apFormData.qualification}
                    onChange={(e) => setApFormData({...apFormData, qualification: e.target.value})}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Openings *</label>
                  <Input
                    type="number"
                    value={apFormData.openings}
                    onChange={(e) => setApFormData({...apFormData, openings: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create AP Internship</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internships" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Internships
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Course Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AP Internships</CardTitle>
              <CardDescription>
                Manage Andhra Pradesh specific internship opportunities
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
                    {apInternships.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No AP internships found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <APCourseManagement />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AP Internship</DialogTitle>
            <DialogDescription>
              Update internship details for Andhra Pradesh.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateAPInternship} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration *</label>
                <Input
                  value={apFormData.duration}
                  onChange={(e) => setApFormData({...apFormData, duration: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stream *</label>
                <Input
                  value={apFormData.stream}
                  onChange={(e) => setApFormData({...apFormData, stream: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode *</label>
                <Select
                  value={apFormData.mode}
                  onValueChange={(value: 'Free' | 'Paid') => {
                    setApFormData({...apFormData, mode: value});
                    if (value === 'Free') {
                      setApFormData({...apFormData, mode: value, amount: 0});
                    }
                  }}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Select
                  value={apFormData.status}
                  onValueChange={(value: 'Open' | 'Closed' | 'On Hold') => 
                    setApFormData({...apFormData, status: value})
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

            {apFormData.mode === 'Paid' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (INR)</label>
                  <Input
                    type="number"
                    value={apFormData.amount}
                    onChange={(e) => setApFormData({...apFormData, amount: Number(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification</label>
                <Input
                  value={apFormData.qualification}
                  onChange={(e) => setApFormData({...apFormData, qualification: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Openings *</label>
                <Input
                  type="number"
                  value={apFormData.openings}
                  onChange={(e) => setApFormData({...apFormData, openings: Number(e.target.value)})}
                  min="1"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update AP Internship</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedAPInternship.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Type</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.internshipType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Term</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.term}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Duration</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Stream</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.stream}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Mode</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.mode}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.status}</p>
                </div>
              </div>
              {selectedAPInternship.amount && selectedAPInternship.amount > 0 && (
                <div>
                  <h4 className="font-semibold">Amount</h4>
                  <p className="text-sm text-gray-600">₹{selectedAPInternship.amount}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Qualification</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.qualification || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Openings</h4>
                  <p className="text-sm text-gray-600">{selectedAPInternship.openings}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Start Date</h4>
                  <p className="text-sm text-gray-600">
                    {selectedAPInternship.startDate ? new Date(selectedAPInternship.startDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Application Deadline</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAPInternship.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APInternshipManagement;
