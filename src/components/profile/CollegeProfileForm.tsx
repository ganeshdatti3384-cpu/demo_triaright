
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api';
import { Building, User, Mail, Phone, MapPin } from 'lucide-react';

interface CollegeProfileFormProps {
  onProfileComplete: () => void;
}

const CollegeProfileForm: React.FC<CollegeProfileFormProps> = ({ onProfileComplete }) => {
  const [formData, setFormData] = useState({
    collegeName: '',
    university: '',
    collegeCode: '',
    establishedYear: '',
    accreditation: '',
    principalName: '',
    principalEmail: '',
    principalPhone: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please login to continue',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    if (!formData.collegeName || !formData.university || !formData.principalName || 
        !formData.coordinatorName || !formData.address) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields marked with *',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      await profileApi.updateCollegeProfile(token, formData);
      toast({
        title: 'Success',
        description: 'Profile completed successfully! Redirecting to dashboard...',
      });
      
      setTimeout(() => {
        onProfileComplete();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your College Profile</h1>
          <p className="text-gray-600">Please provide your college information to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic College Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collegeName">College Name *</Label>
                <Input
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="collegeCode">College Code</Label>
                <Input
                  id="collegeCode"
                  name="collegeCode"
                  value={formData.collegeCode}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input
                  id="establishedYear"
                  name="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Input
                  id="accreditation"
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Principal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Principal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principalName">Principal Name *</Label>
                <Input
                  id="principalName"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="principalEmail">Principal Email</Label>
                <Input
                  id="principalEmail"
                  name="principalEmail"
                  type="email"
                  value={formData.principalEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="principalPhone">Principal Phone</Label>
                <Input
                  id="principalPhone"
                  name="principalPhone"
                  value={formData.principalPhone}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordinator Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Coordinator Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coordinatorName">Coordinator Name *</Label>
                <Input
                  id="coordinatorName"
                  name="coordinatorName"
                  value={formData.coordinatorName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="coordinatorEmail">Coordinator Email</Label>
                <Input
                  id="coordinatorEmail"
                  name="coordinatorEmail"
                  type="email"
                  value={formData.coordinatorEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="coordinatorPhone">Coordinator Phone</Label>
                <Input
                  id="coordinatorPhone"
                  name="coordinatorPhone"
                  value={formData.coordinatorPhone}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">College Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="px-12 py-3 text-lg"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeProfileForm;
