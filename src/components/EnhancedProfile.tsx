
import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Trash2,
  User,
  GraduationCap,
  Briefcase,
  Star
} from 'lucide-react';
import Navbar from './Navbar';

const profileSchema = z.object({
  fullName: z.string().min(2),
  dob: z.string(),
  gender: z.string(),
  email: z.string().email(),
  phone: z.string(),
  altPhone: z.string().optional(),
  address: z.string(),
  fatherName: z.string().optional(),
  maritalStatus: z.string(),
  nationality: z.string(),
  languages: z.string(),
  hobbies: z.string().optional(),
  education: z.array(
    z.object({
      institute: z.string(),
      course: z.string(),
      year: z.string(),
    })
  ),
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
  username: z.string(),
  password: z.string(),
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

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
      password: '',
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

  const { fields: internFields, append: appendIntern } = useFieldArray({
    control: form.control,
    name: 'internships',
  });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }

    const stored = localStorage.getItem('profileData');
    if (stored) {
      const profileData = JSON.parse(stored);
      form.reset(profileData);
    }

    const storedPic = localStorage.getItem('profilePic');
    if (storedPic) {
      setProfilePic(storedPic);
    }

    const storedDocs = localStorage.getItem('uploadedDocuments');
    if (storedDocs) {
      setUploadedDocuments(JSON.parse(storedDocs));
    }
  }, []);

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePic(result);
        localStorage.setItem('profilePic', result);
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
        
        const updatedDocs = [...uploadedDocuments, newDoc];
        setUploadedDocuments(updatedDocs);
        localStorage.setItem('uploadedDocuments', JSON.stringify(updatedDocs));
      });
    }
  };

  const deleteDocument = (docId: string) => {
    const updatedDocs = uploadedDocuments.filter(doc => doc.id !== docId);
    setUploadedDocuments(updatedDocs);
    localStorage.setItem('uploadedDocuments', JSON.stringify(updatedDocs));
  };

  const onSubmit = (data: any) => {
    localStorage.setItem('profileData', JSON.stringify(data));
    alert('Profile saved successfully!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isEmployeeOrEmployer = user?.role === 'employee' || user?.role === 'employer';

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 3D Header Section */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl transform perspective-1000 rotate-x-5">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Picture Section */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={profilePic} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {user?.firstName ? getInitials(user.firstName + ' ' + (user.lastName || '')) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2">
                    {user?.firstName || 'Your Name'} {user?.lastName || ''}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <User className="h-4 w-4 mr-1" />
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Student'}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Star className="h-4 w-4 mr-1" />
                      Active Learner
                    </Badge>
                  </div>
                  <p className="text-white/90 text-lg">
                    Welcome to your enhanced profile dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="basic" className="space-y-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Personal Details
                        </CardTitle>
                        <CardDescription className="text-white/90">
                          Your basic personal information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <FormField name="fullName" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} className="border-2 focus:border-blue-500" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        
                        <FormField name="dob" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl><Input type="date" {...field} className="border-2 focus:border-blue-500" /></FormControl>
                          </FormItem>
                        )} />
                        
                        <FormField name="gender" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl><Input placeholder="Male / Female / Other" {...field} className="border-2 focus:border-blue-500" /></FormControl>
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription className="text-white/90">
                          How to reach you
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <FormField name="email" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} className="border-2 focus:border-green-500" /></FormControl>
                          </FormItem>
                        )} />
                        
                        <FormField name="phone" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} className="border-2 focus:border-green-500" /></FormControl>
                          </FormItem>
                        )} />
                        
                        <FormField name="altPhone" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternate Phone</FormLabel>
                            <FormControl><Input {...field} className="border-2 focus:border-green-500" /></FormControl>
                          </FormItem>
                        )} />
                        
                        <FormField name="address" control={form.control} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Textarea {...field} className="border-2 focus:border-green-500" /></FormControl>
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Education History
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Your academic qualifications and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {eduFields.map((field, index) => (
                        <div key={field.id} className="p-4 border-2 border-purple-200 rounded-lg space-y-4">
                          <h4 className="font-semibold text-purple-700">Education #{index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField name={`education.${index}.institute`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institute</FormLabel>
                                <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField name={`education.${index}.course`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Course</FormLabel>
                                <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField name={`education.${index}.year`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        onClick={() => appendEdu({ institute: '', course: '', year: '' })}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        + Add Another Qualification
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Projects & Experience
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Showcase your work and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {projFields.map((field, index) => (
                        <div key={field.id} className="p-4 border-2 border-orange-200 rounded-lg space-y-4">
                          <h4 className="font-semibold text-orange-700">Project #{index + 1}</h4>
                          <div className="space-y-4">
                            <FormField name={`projects.${index}.name`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl><Input {...field} className="border-2 focus:border-orange-500" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField name={`projects.${index}.github`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>GitHub Link</FormLabel>
                                <FormControl><Input {...field} className="border-2 focus:border-orange-500" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} className="border-2 focus:border-orange-500" /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        onClick={() => appendProj({ name: '', github: '', description: '' })}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        + Add Another Project
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-lg">
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription className="text-white/90">
                        Manage your login credentials
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <FormField name="username" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl><Input {...field} className="border-2 focus:border-gray-500" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField name="password" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" {...field} className="border-2 focus:border-gray-500" /></FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {isEmployeeOrEmployer && (
                  <TabsContent value="documents" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Document Management
                        </CardTitle>
                        <CardDescription className="text-white/90">
                          Upload and manage your documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 text-teal-500 mx-auto mb-4" />
                          <Button
                            type="button"
                            onClick={() => documentInputRef.current?.click()}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500"
                          >
                            Upload Documents
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Supported formats: PDF, DOC, DOCX, JPG, PNG
                          </p>
                          <input
                            ref={documentInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                            onChange={(e) => handleDocumentUpload(e, 'document')}
                            className="hidden"
                          />
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg">Uploaded Documents</h4>
                          {uploadedDocuments.filter(doc => doc.category === 'document').map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-teal-600" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {isEmployeeOrEmployer && (
                  <TabsContent value="payslips" className="space-y-6">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Payslips Management
                        </CardTitle>
                        <CardDescription className="text-white/90">
                          Upload and view your payslips
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = '.pdf,.doc,.docx,.jpg,.png,.jpeg';
                              input.onchange = (e) => handleDocumentUpload(e as any, 'payslip');
                              input.click();
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-green-500"
                          >
                            Upload Payslips
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Upload your monthly payslips securely
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-lg">Payslip History</h4>
                          {uploadedDocuments.filter(doc => doc.category === 'payslip').map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Submit Button */}
                <div className="flex justify-center mt-8">
                  <Button 
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-3 text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                  >
                    Save Profile
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EnhancedProfile;
