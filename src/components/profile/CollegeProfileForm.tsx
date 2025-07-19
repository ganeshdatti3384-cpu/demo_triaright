
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api';
import { Building, User, Mail, Phone, MapPin, Sparkles, GraduationCap, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Complete Your College Profile
          </h1>
          <p className="text-blue-200">Please provide your college information to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic College Information */}
          <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <Building className="h-5 w-5 text-white" />
                </div>
                College Information
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <Label htmlFor="collegeName" className="text-blue-100 font-medium">College Name *</Label>
                <Input
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="university" className="text-blue-100 font-medium">University *</Label>
                <Input
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="collegeCode" className="text-blue-100 font-medium">College Code</Label>
                <Input
                  id="collegeCode"
                  name="collegeCode"
                  value={formData.collegeCode}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="establishedYear" className="text-blue-100 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Established Year
                </Label>
                <Input
                  id="establishedYear"
                  name="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="accreditation" className="text-blue-100 font-medium">Accreditation</Label>
                <Input
                  id="accreditation"
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Principal Details */}
          <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                Principal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <Label htmlFor="principalName" className="text-blue-100 font-medium">Principal Name *</Label>
                <Input
                  id="principalName"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="principalEmail" className="text-blue-100 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Principal Email
                </Label>
                <Input
                  id="principalEmail"
                  name="principalEmail"
                  type="email"
                  value={formData.principalEmail}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="principalPhone" className="text-blue-100 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Principal Phone
                </Label>
                <Input
                  id="principalPhone"
                  name="principalPhone"
                  value={formData.principalPhone}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordinator Details */}
          <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                Coordinator Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <Label htmlFor="coordinatorName" className="text-blue-100 font-medium">Coordinator Name *</Label>
                <Input
                  id="coordinatorName"
                  name="coordinatorName"
                  value={formData.coordinatorName}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="coordinatorEmail" className="text-blue-100 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Coordinator Email
                </Label>
                <Input
                  id="coordinatorEmail"
                  name="coordinatorEmail"
                  type="email"
                  value={formData.coordinatorEmail}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="coordinatorPhone" className="text-blue-100 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Coordinator Phone
                </Label>
                <Input
                  id="coordinatorPhone"
                  name="coordinatorPhone"
                  value={formData.coordinatorPhone}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <Label htmlFor="email" className="text-blue-100 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  College Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-blue-100 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  College Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-blue-100 font-medium">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-blue-100 font-medium">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-blue-100 font-medium">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-blue-100 font-medium">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-blue-100 font-medium">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={loading}
              className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving Profile...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Complete Profile & Continue
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeProfileForm;
