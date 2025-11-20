// components/admin/UpdateManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface Update {
  _id: string;
  message: string;
  file?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const UpdateManagement = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    image: null as File | null,
    file: null as File | null
  });
  const { toast } = useToast();

  // Fetch all updates
  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/colleges/updates');
      const data = await response.json();
      
      if (data.success) {
        setUpdates(data.updates);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch updates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'file') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  // Create new update
  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: 'Error',
        description: 'Message is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      submitData.append('message', formData.message);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      const response = await fetch('/api/colleges/updates/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Update created successfully'
        });
        setFormData({ message: '', image: null, file: null });
        fetchUpdates();
        
        // Clear file inputs
        const imageInput = document.getElementById('image-input') as HTMLInputElement;
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: 'Error',
        description: 'Failed to create update',
        variant: 'destructive'
      });
    }
  };

  // Delete update
  const handleDeleteUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/colleges/updates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Update deleted successfully'
        });
        fetchUpdates();
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete update',
        variant: 'destructive'
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Create Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Update</CardTitle>
          <CardDescription>
            Post announcements, notifications, or important information for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUpdate} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your announcement or update message..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <label htmlFor="image-input" className="text-sm font-medium">
                  Upload Image
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="flex-1"
                  />
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                </div>
                {formData.image && (
                  <p className="text-sm text-green-600">
                    Selected: {formData.image.name} ({formatFileSize(formData.image.size)})
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="file-input" className="text-sm font-medium">
                  Upload File
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="file-input"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'file')}
                    className="flex-1"
                  />
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>
                {formData.file && (
                  <p className="text-sm text-green-600">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              <Upload className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Updates List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>
            Manage your posted updates and announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading updates...</div>
          ) : updates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No updates posted yet
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {new Date(update.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                        {update.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUpdate(update._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Attachments */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {update.image && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Image
                        <a 
                          href={update.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 underline"
                        >
                          View
                        </a>
                      </Badge>
                    )}
                    {update.file && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        File
                        <a 
                          href={update.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 underline"
                        >
                          Download
                        </a>
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateManagement;
