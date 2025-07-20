import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Navbar from '../Navbar';

interface StudentProfile {
  userId: string;
  profilePicture?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  languagesKnown?: string;
  hobbies?: string;
  qualifications?: {
    instituteName: string;
    stream: string;
    yearOfPassing: string;
  }[];
  projects?: {
    projectName: string;
    githubLink: string;
    description: string;
  }[];
  certifications?: string[];
  internships?: {
    companyName: string;
    role: string;
    responsibilities: string;
  }[];
}

const StudentProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>({
    userId: user?.id || '',
    qualifications: [{ instituteName: '', stream: '', yearOfPassing: '' }],
    projects: [{ projectName: '', githubLink: '', description: '' }],
    certifications: [''],
    internships: [{ companyName: '', role: '', responsibilities: '' }]
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName: string, index: number, field: string, value: string) => {
    setProfile(prev => {
      const currentArray = prev[arrayName as keyof StudentProfile];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [arrayName]: currentArray.map((item: any, i: number) =>
            i === index ? (typeof item === 'string' ? value : { ...item, [field]: value }) : item
          )
        };
      }
      return prev;
    });
  };

  const addArrayItem = (arrayName: string) => {
    const newItem = arrayName === 'qualifications' 
      ? { instituteName: '', stream: '', yearOfPassing: '' }
      : arrayName === 'projects'
      ? { projectName: '', githubLink: '', description: '' }
      : arrayName === 'internships'
      ? { companyName: '', role: '', responsibilities: '' }
      : '';

    setProfile(prev => {
      const currentArray = prev[arrayName as keyof StudentProfile];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [arrayName]: [...currentArray, newItem]
        };
      }
      return prev;
    });
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    setProfile(prev => {
      const currentArray = prev[arrayName as keyof StudentProfile];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [arrayName]: currentArray.filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would call your API to save the profile
      // const response = await api.updateStudentProfile(profile);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={profile.whatsappNumber || ''}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  id="fatherName"
                  value={profile.fatherName || ''}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select value={profile.maritalStatus || ''} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={profile.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="languagesKnown">Languages Known</Label>
                <Input
                  id="languagesKnown"
                  value={profile.languagesKnown || ''}
                  onChange={(e) => handleInputChange('languagesKnown', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="hobbies">Hobbies</Label>
                <Textarea
                  id="hobbies"
                  value={profile.hobbies || ''}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Qualifications</CardTitle>
                <Button onClick={() => addArrayItem('qualifications')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Qualification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.qualifications?.map((qual, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded">
                  <div>
                    <Label>Institute Name</Label>
                    <Input
                      value={qual.instituteName}
                      onChange={(e) => handleArrayChange('qualifications', index, 'instituteName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Stream</Label>
                    <Input
                      value={qual.stream}
                      onChange={(e) => handleArrayChange('qualifications', index, 'stream', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Year of Passing</Label>
                      <Input
                        value={qual.yearOfPassing}
                        onChange={(e) => handleArrayChange('qualifications', index, 'yearOfPassing', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('qualifications', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Projects</CardTitle>
                <Button onClick={() => addArrayItem('projects')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.projects?.map((project, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={project.projectName}
                        onChange={(e) => handleArrayChange('projects', index, 'projectName', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>GitHub Link</Label>
                        <Input
                          value={project.githubLink}
                          onChange={(e) => handleArrayChange('projects', index, 'githubLink', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('projects', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
