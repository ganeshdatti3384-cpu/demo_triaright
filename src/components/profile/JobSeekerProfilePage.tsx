import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import Navbar from '../Navbar';

interface JobSeekerProfile {
  userId: string;
  profilePicture?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  languagesKnown?: string;
  hobbies?: string;
  jobCategory?: string[];
  qualifications?: {
    instituteName: string;
    course: string;
    yearOfPassing: string;
  }[];
  experiences?: {
    companyName: string;
    role: string;
    duration: string;
    responsibilities: string;
  }[];
  projects?: {
    projectName: string;
    technologies: string;
    description: string;
  }[];
  certifications?: string[];
  internships?: {
    companyName: string;
    role: string;
    responsibilities: string;
  }[];
  resume?: string;
}

const JobSeekerProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<JobSeekerProfile>({
    userId: user?.id || '',
    jobCategory: [''],
    qualifications: [{ instituteName: '', course: '', yearOfPassing: '' }],
    experiences: [{ companyName: '', role: '', duration: '', responsibilities: '' }],
    projects: [{ projectName: '', technologies: '', description: '' }],
    certifications: [''],
    internships: [{ companyName: '', role: '', responsibilities: '' }]
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName: string, index: number, field: string, value: string) => {
    setProfile(prev => {
      const currentArray = prev[arrayName as keyof JobSeekerProfile];
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
      ? { instituteName: '', course: '', yearOfPassing: '' }
      : arrayName === 'experiences'
      ? { companyName: '', role: '', duration: '', responsibilities: '' }
      : arrayName === 'projects'
      ? { projectName: '', technologies: '', description: '' }
      : arrayName === 'internships'
      ? { companyName: '', role: '', responsibilities: '' }
      : '';

    setProfile(prev => {
      const currentArray = prev[arrayName as keyof JobSeekerProfile];
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
      const currentArray = prev[arrayName as keyof JobSeekerProfile];
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
            onClick={() => navigate('/job-seeker')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Job Seeker Profile</h1>
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
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  value={profile.alternatePhone || ''}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                />
              </div>
              <div>
                <Label>Job Categories</Label>
                <Input
                  placeholder="e.g., Software Development, Marketing"
                  value={profile.jobCategory?.join(', ') || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, jobCategory: e.target.value.split(', ') }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Work Experience</CardTitle>
                <Button onClick={() => addArrayItem('experiences')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.experiences?.map((exp, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 mb-4 p-4 border rounded">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={exp.companyName}
                        onChange={(e) => handleArrayChange('experiences', index, 'companyName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={exp.role}
                        onChange={(e) => handleArrayChange('experiences', index, 'role', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Duration</Label>
                        <Input
                          value={exp.duration}
                          onChange={(e) => handleArrayChange('experiences', index, 'duration', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('experiences', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Responsibilities</Label>
                    <Textarea
                      value={exp.responsibilities}
                      onChange={(e) => handleArrayChange('experiences', index, 'responsibilities', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
                {profile.resume && (
                  <span className="text-sm text-gray-600">Current: {profile.resume}</span>
                )}
              </div>
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

export default JobSeekerProfilePage;
