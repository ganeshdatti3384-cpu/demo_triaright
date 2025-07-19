/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api';
import Navbar from './Navbar';
import ProfileHeader from './profile/ProfileHeader';
import BasicInfoTab from './profile/BasicInfoTab';
import EducationTab from './profile/EducationTab';
import ProjectsTab from './profile/ProjectsTab';
import AccountTab from './profile/AccountTab';
import DocumentsTab from './profile/DocumentsTab';
import PayslipsTab from './profile/PayslipsTab';

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.string().optional(),
  hobbies: z.string().optional(),
  education: z.array(
    z.object({
      institute: z.string(),
      course: z.string(),
      year: z.string(),
    })
  ).optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        github: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  certifications: z.string().optional(),
  internships: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        responsibilities: z.string(),
      })
    )
    .optional(),
  username: z.string().optional(),
}).passthrough();

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'document' | 'payslip';
}

const EnhancedProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      dob: '',
      gender: '',
      email: '',
      phone: '',
      altPhone: '',
      address: '',
      fatherName: '',
      maritalStatus: '',
      nationality: '',
      languages: '',
      hobbies: '',
      education: [{ institute: '', course: '', year: '' }],
      projects: [{ name: '', github: '', description: '' }],
      internships: [{ company: '', role: '', responsibilities: '' }],
      username: '',
    },
  });

  const { fields: eduFields, append: appendEdu } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: projFields, append: appendProj } = useFieldArray({
    control: form.control,
    name: 'projects',
  });

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (currentUser && token) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      await fetchUserProfile(userData.role, token);
    } else {
      toast({
        title: 'Error',
        description: 'Please login to access profile',
        variant: 'destructive'
      });
    }
  };

  const fetchUserProfile = async (role: string, token: string) => {
    setIsLoading(true);
    try {
      let profileData;
      
      switch (role) {
        case 'student':
          profileData = await profileApi.getStudentProfile(token);
          break;
        case 'jobseeker':
          profileData = await profileApi.getJobSeekerProfile(token);
          break;
        case 'employer':
          profileData = await profileApi.getEmployerProfile(token);
          break;
        case 'college':
          profileData = await profileApi.getCollegeProfile(token);
          break;
        default:
          console.log('No profile API available for this role');
          return;
      }

      if (profileData) {
        // Combine firstName and lastName to create fullName
        const fullName = profileData.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        
        const formData = {
          fullName,
          dob: profileData.dateOfBirth || profileData.dob || '',
          gender: profileData.gender || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || user?.phoneNumber || '',
          altPhone: profileData.alternatePhone || profileData.altPhone || user?.whatsappNumber || '',
          address: profileData.address || user?.address || '',
          fatherName: profileData.fatherName || '',
          maritalStatus: profileData.maritalStatus || '',
          nationality: profileData.nationality || '',
          languages: profileData.languagesKnown || profileData.languages || '',
          hobbies: profileData.hobbies || '',
          education: profileData.qualifications || profileData.education || [{ institute: '', course: '', year: '' }],
          projects: profileData.projects || [{ name: '', github: '', description: '' }],
          internships: profileData.internships || [{ company: '', role: '', responsibilities: '' }],
          username: profileData.username || user?.email || '',
          certifications: profileData.certifications || '',
          ...profileData
        };
        
        form.reset(formData);
        
        if (profileData.profilePicture) {
          setProfilePic(profileData.profilePicture);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePic(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>, category: 'document' | 'payslip') => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc: UploadedDocument = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          category
        };
        
        setUploadedDocuments(prev => [...prev, newDoc]);
      });

      toast({
        title: 'Success',
        description: `${category === 'document' ? 'Document' : 'Payslip'} uploaded successfully`,
      });
    }
  };

  const deleteDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    toast({
      title: 'Success',
      description: 'Document deleted successfully',
    });
  };

  const onSubmit = async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      toast({
        title: 'Error',
        description: 'Please login to update profile',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSubmit = {
        ...data,
        profilePicture: profilePic
      };

      let response;
      
      switch (user.role) {
        case 'student':
          response = await profileApi.updateStudentProfile(token, formDataToSubmit);
          break;
        case 'jobseeker':
          response = await profileApi.updateJobSeekerProfile(token, formDataToSubmit);
          break;
        case 'employer':
          response = await profileApi.updateEmployerProfile(token, formDataToSubmit);
          break;
        case 'college':
          response = await profileApi.updateCollegeProfile(token, formDataToSubmit);
          break;
        default:
          throw new Error('No update API available for this role');
      }

      toast({
        title: 'Success',
        description: response.message || 'Profile updated successfully!',
      });

      // Refresh profile data
      await fetchUserProfile(user.role, token);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isEmployeeOrEmployer = user?.role === 'employee' || user?.role === 'employer';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <ProfileHeader 
            user={user}
            profilePic={profilePic}
            onProfilePicUpload={handleProfilePicUpload}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading profile...</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                {isEmployeeOrEmployer && <TabsTrigger value="documents">Documents</TabsTrigger>}
                {isEmployeeOrEmployer && <TabsTrigger value="payslips">Payslips</TabsTrigger>}
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  
                  <TabsContent value="basic" className="space-y-6">
                    <BasicInfoTab form={form} />
                  </TabsContent>

                  <TabsContent value="education" className="space-y-6">
                    <EducationTab 
                      form={form} 
                      eduFields={eduFields} 
                      appendEdu={appendEdu} 
                    />
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-6">
                    <ProjectsTab 
                      form={form} 
                      projFields={projFields} 
                      appendProj={appendProj} 
                    />
                  </TabsContent>

                  <TabsContent value="account" className="space-y-6">
                    <AccountTab form={form} />
                  </TabsContent>

                  {isEmployeeOrEmployer && (
                    <>
                      <TabsContent value="documents" className="space-y-6">
                        <DocumentsTab 
                          uploadedDocuments={uploadedDocuments}
                          onDocumentUpload={handleDocumentUpload}
                          onDeleteDocument={deleteDocument}
                          formatFileSize={formatFileSize}
                        />
                      </TabsContent>

                      <TabsContent value="payslips" className="space-y-6">
                        <PayslipsTab 
                          uploadedDocuments={uploadedDocuments}
                          onDocumentUpload={handleDocumentUpload}
                          onDeleteDocument={deleteDocument}
                          formatFileSize={formatFileSize}
                        />
                      </TabsContent>
                    </>
                  )}

                  <div className="flex justify-center mt-8">
                    <Button 
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-900 text-white px-12 py-3 text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Updating Profile...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedProfile;
