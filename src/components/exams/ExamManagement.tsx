// components/exams/ExamManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Calendar, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exam {
  _id: string;
  title: string;
  description: string;
  internshipId: string;
  internshipTitle: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  maxAttempts: number;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  instructions: string;
  createdAt: string;
}

const ExamManagement = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    internshipId: '',
    duration: 60,
    totalQuestions: 10,
    passingScore: 60,
    maxAttempts: 1,
    startDate: '',
    endDate: '',
    instructions: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/exams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setExams(data.exams);
      } else {
        throw new Error(data.message || 'Failed to fetch exams');
      }
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load exams',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Exam created successfully'
        });
        setShowCreateDialog(false);
        resetForm();
        fetchExams();
      } else {
        throw new Error(data.message || 'Failed to create exam');
      }
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create exam',
        variant: 'destructive'
      });
    }
  };

  const updateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/exams/${selectedExam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Exam updated successfully'
        });
        setShowEditDialog(false);
        resetForm();
        fetchExams();
      } else {
        throw new Error(data.message || 'Failed to update exam');
      }
    } catch (error: any) {
      console.error('Error updating exam:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update exam',
        variant: 'destructive'
      });
    }
  };

  const deleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Exam deleted successfully'
        });
        fetchExams();
      } else {
        throw new Error(data.message || 'Failed to delete exam');
      }
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete exam',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description,
      internshipId: exam.internshipId,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
      startDate: exam.startDate.split('T')[0],
      endDate: exam.endDate.split('T')[0],
      instructions: exam.instructions
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      internshipId: '',
      duration: 60,
      totalQuestions: 10,
      passingScore: 60,
      maxAttempts: 1,
      startDate: '',
      endDate: '',
      instructions: ''
    });
    setSelectedExam(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'secondary',
      active: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exam Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Create an exam for internship assessment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createExam} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internship ID *</label>
                  <Input
                    value={formData.internshipId}
                    onChange={(e) => setFormData({...formData, internshipId: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes) *</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Questions *</label>
                  <Input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({...formData, totalQuestions: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passing Score (%) *</label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: Number(e.target.value)})}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Attempts *</label>
                  <Input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData({...formData, maxAttempts: Number(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date *</label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows={4}
                  placeholder="Enter exam instructions and guidelines..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Exam</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exams</CardTitle>
          <CardDescription>
            Manage internship exams and assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading exams...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.internshipTitle}</TableCell>
                    <TableCell>{formatDuration(exam.duration)}</TableCell>
                    <TableCell>{exam.totalQuestions}</TableCell>
                    <TableCell>{exam.passingScore}%</TableCell>
                    <TableCell>{exam.maxAttempts}</TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell>
                      {new Date(exam.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(exam.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(exam)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteExam(exam._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No exams found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update exam details and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateExam} className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            {/* Include all other form fields */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Exam</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;