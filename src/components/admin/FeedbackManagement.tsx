// components/admin/FeedbackManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Edit, 
  Trash2, 
  User, 
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  _id: string;
  name: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    feedback: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedbacks');
      const data = await response.json();
      
      if (response.ok) {
        setFeedbacks(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedbacks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.feedback) {
      toast({
        title: 'Error',
        description: 'Name and feedback are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const url = editingFeedback 
        ? `/api/feedbacks/${editingFeedback._id}`
        : '/api/feedbacks';
      
      const method = editingFeedback ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingFeedback ? 'Feedback updated successfully' : 'Feedback created successfully',
        });
        setShowForm(false);
        setEditingFeedback(null);
        setFormData({ name: '', feedback: '' });
        fetchFeedbacks();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feedback',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      name: feedback.name,
      feedback: feedback.feedback
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`/api/feedbacks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Feedback deleted successfully',
        });
        fetchFeedbacks();
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback',
        variant: 'destructive'
      });
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Feedback Management</h2>
          <p className="text-gray-600">Manage user feedback and testimonials</p>
        </div>
        <Button onClick={() => {
          setEditingFeedback(null);
          setFormData({ name: '', feedback: '' });
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search feedbacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Feedback Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFeedback(null);
                    setFormData({ name: '', feedback: '' });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Feedback</label>
                  <Textarea
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Enter feedback"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingFeedback(null);
                      setFormData({ name: '', feedback: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFeedback ? 'Update' : 'Create'} Feedback
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedbacks List */}
      {loading ? (
        <div className="text-center py-8">Loading feedbacks...</div>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">{feedback.name}</h3>
                      <Badge variant="secondary">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{feedback.feedback}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(feedback)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(feedback._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredFeedbacks.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No feedbacks found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;