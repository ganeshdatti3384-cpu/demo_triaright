import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api';
import { College } from '@/types/api';

interface CollegeProfileFormProps {
  token: string | null;
  onSuccess?: () => void;
}

const CollegeProfileForm: React.FC<CollegeProfileFormProps> = ({ token, onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<College>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    establishedYear: undefined,
    type: '',
    affiliation: '',
    logo: '',
    description: '',
    contactPerson: '',
    registrationNumber: '',
    collegeName: '',
    university: '',
    principalName: '',
    coordinatorName: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const profile = await profileApi.getCollegeProfile(token);
          setFormData(profile);
        } catch (error: any) {
          toast({
            title: 'Error fetching profile',
            description: error.response?.data?.message || 'Failed to load profile',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [token, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'establishedYear' ? (value ? parseInt(value) : undefined) : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files?.[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await profileApi.updateCollegeProfile(token!, formData);
      toast({
        title: 'Profile updated successfully!',
        description: 'Your college information has been saved.',
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="collegeName">College Name</Label>
        <Input
          type="text"
          id="collegeName"
          name="collegeName"
          value={formData.collegeName || ''}
          onChange={handleChange}
          placeholder="Enter college name"
        />
      </div>
      <div>
        <Label htmlFor="name">Contact Person Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Enter contact person name"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="Enter email"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          type="text"
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="Enter address"
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          type="url"
          id="website"
          name="website"
          value={formData.website || ''}
          onChange={handleChange}
          placeholder="Enter website URL"
        />
      </div>
      <div>
        <Label htmlFor="establishedYear">Established Year</Label>
        <Input
          type="number"
          id="establishedYear"
          name="establishedYear"
          value={formData.establishedYear?.toString() || ''}
          onChange={handleChange}
          placeholder="Enter established year"
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Input
          type="text"
          id="type"
          name="type"
          value={formData.type || ''}
          onChange={handleChange}
          placeholder="Enter type"
        />
      </div>
      <div>
        <Label htmlFor="affiliation">Affiliation</Label>
        <Input
          type="text"
          id="affiliation"
          name="affiliation"
          value={formData.affiliation || ''}
          onChange={handleChange}
          placeholder="Enter affiliation"
        />
      </div>
      <div>
        <Label htmlFor="logo">Logo</Label>
        <Input
          type="file"
          id="logo"
          name="logo"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Enter description"
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          type="text"
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson || ''}
          onChange={handleChange}
          placeholder="Enter contact person"
        />
      </div>
      <div>
        <Label htmlFor="registrationNumber">Registration Number</Label>
        <Input
          type="text"
          id="registrationNumber"
          name="registrationNumber"
          value={formData.registrationNumber || ''}
          onChange={handleChange}
          placeholder="Enter registration number"
        />
      </div>
      <div>
        <Label htmlFor="university">University</Label>
        <Input
          type="text"
          id="university"
          name="university"
          value={formData.university || ''}
          onChange={handleChange}
          placeholder="Enter university"
        />
      </div>
      <div>
        <Label htmlFor="principalName">Principal Name</Label>
        <Input
          type="text"
          id="principalName"
          name="principalName"
          value={formData.principalName || ''}
          onChange={handleChange}
          placeholder="Enter principal name"
        />
      </div>
      <div>
        <Label htmlFor="coordinatorName">Coordinator Name</Label>
        <Input
          type="text"
          id="coordinatorName"
          name="coordinatorName"
          value={formData.coordinatorName || ''}
          onChange={handleChange}
          placeholder="Enter coordinator name"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
};

export default CollegeProfileForm;
