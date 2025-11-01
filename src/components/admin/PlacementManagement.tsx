// components/admin/PlacementManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Building2,
  GraduationCap,
  DollarSign,
  Plus,
  X,
  Image,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Placement {
  _id: string;
  name: string;
  collegeName: string;
  companyName: string;
  salary: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const PlacementManagement = () => {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    collegeName: '',
    companyName: '',
    salary: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch('/api/users/placements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPlacements(data);
    } catch (error) {
      console.error('Error fetching placements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load placements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.collegeName.trim() || !formData.companyName.trim() || !formData.salary.trim()) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('collegeName', formData.collegeName.trim());
      formDataToSend.append('companyName', formData.companyName.trim());
      formDataToSend.append('salary', formData.salary.trim());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingPlacement 
        ? `/api/users/placements/${editingPlacement._id}`
        : '/api/users/placements';
      
      const method = editingPlacement ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save placement');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: editingPlacement ? 'Placement updated successfully' : 'Placement created successfully',
      });
      
      setShowForm(false);
      setEditingPlacement(null);
      setFormData({ name: '', collegeName: '', companyName: '', salary: '' });
      setImageFile(null);
      fetchPlacements();
      
    } catch (error: any) {
      console.error('Error saving placement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save placement',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (placement: Placement) => {
    setEditingPlacement(placement);
    setFormData({
      name: placement.name,
      collegeName: placement.collegeName,
      companyName: placement.companyName,
      salary: placement.salary
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this placement?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/users/placements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete placement');
      }

      toast({
        title: 'Success',
        description: 'Placement deleted successfully',
      });
      fetchPlacements();
    } catch (error: any) {
      console.error('Error deleting placement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete placement',
        variant: 'destructive'
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const filteredPlacements = placements.filter(placement =>
    placement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingPlacement(null);
    setFormData({ name: '', collegeName: '', companyName: '', salary: '' });
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Placement Management</h2>
          <p className="text-gray-600">Manage student placements and achievements</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Placement
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search placements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Placement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingPlacement ? 'Edit Placement' : 'Add New Placement'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Student Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">College Name</label>
                  <Input
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    placeholder="Enter college name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary</label>
                  <Input
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="Enter salary package"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Student Image {!editingPlacement?.image && '(Optional)'}
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                    disabled={submitting}
                  />
                  {editingPlacement?.image && !imageFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Current image: {editingPlacement.image.split('/').pop()}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPlacement ? 'Update' : 'Create'} Placement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placements Grid */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading placements...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlacements.map((placement) => (
            <Card key={placement._id} className="overflow-hidden">
              {placement.image && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={placement.image} 
                    alt={placement.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-lg">{placement.name}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{placement.collegeName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{placement.companyName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <Badge variant="secondary" className="font-medium">
                      {placement.salary}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(placement.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(placement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(placement._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPlacements.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No placements found</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementManagement;
