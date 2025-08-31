
/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, UserPlus, Download, Upload, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building, GraduationCap, Briefcase, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    personal: false,
    education: false,
    projects: false,
    certifications: false,
    internships: false,
    account: false,
  });

  // Form states matching registration form
  const [formData, setFormData] = useState({
    role: 'student',
    profilePicture: null,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    fatherName: '',
    maritalStatus: '',
    nationality: '',
    languagesKnown: '',
    hobbies: '',
    education: [{ instituteName: '', stream: '', yearOfPassing: '' }],
    projects: [],
    certifications: [],
    internships: [],
    username: '',
    password: '',
    confirmPassword: '',
    // Job seeker specific
    jobCategory: '',
    experience: [],
    resume: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch both students and job seekers from your backend
      const [studentRes, jobseekerRes] = await Promise.all([
        axios.get('http://localhost:8080/api/students'),
        axios.get('http://localhost:8080/api/jobseekers')
      ]);

      // Combine the two lists
      const allUsers = [...studentRes.data, ...jobseekerRes.data];
      setUsers(allUsers);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.password && !selectedUser) {
      toast.error('Password is required');
      return false;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required');
      return false;
    }
    if (!formData.gender) {
      toast.error('Gender is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.maritalStatus) {
      toast.error('Marital status is required');
      return false;
    }
    if (!formData.nationality.trim()) {
      toast.error('Nationality is required');
      return false;
    }
    if (!formData.languagesKnown.trim()) {
      toast.error('Languages known is required');
      return false;
    }
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    // Validate education
    if (formData.education.length === 0 || !formData.education[0].instituteName.trim()) {
      toast.error('At least one education entry is required');
      return false;
    }

    // Role-specific validation
    if (formData.role === 'job-seeker' && !formData.jobCategory) {
      toast.error('Job category is required for job seekers');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const role = formData.role;
      const endpoint = role === 'student'
        ? 'http://localhost:8080/api/auth/register/student'
        : 'http://localhost:8080/api/auth/register/jobseeker';

      await axios.post(endpoint, formData);

      toast.success('User created successfully!');
      fetchUsers(); // Refresh the list with the new user
      setCreateUserOpen(false);
      resetForm();

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm()) return;
    setLoading(true);
    try {
      const endpoint = selectedUser.role === 'student'
        ? `http://localhost:8080/api/students/${selectedUser._id}`
        : `http://localhost:8080/api/jobseekers/${selectedUser._id}`;
      
      await axios.put(endpoint, formData); // Using PUT for update

      toast.success('User updated successfully!');
      fetchUsers();
      setEditUserOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const endpoint = userToDelete.role === 'student'
        ? `http://localhost:8080/api/students/${userToDelete._id}`
        : `http://localhost:8080/api/jobseekers/${userToDelete._id}`;

      await axios.delete(endpoint); // Using DELETE

      toast.success('User deleted successfully!');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };
  const resetForm = () => {
    setFormData({
      role: 'student',
      profilePicture: null,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      fatherName: '',
      maritalStatus: '',
      nationality: '',
      languagesKnown: '',
      hobbies: '',
      education: [{ instituteName: '', stream: '', yearOfPassing: '' }],
      projects: [],
      certifications: [],
      internships: [],
      username: '',
      password: '',
      confirmPassword: '',
      jobCategory: '',
      experience: [],
      resume: null,
    });
    setSelectedUser(null);
    setOpenSections({
      basic: true,
      personal: false,
      education: false,
      projects: false,
      certifications: false,
      internships: false,
      account: false,
    });
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || 'student',
      profilePicture: user.profilePicture || null,
      fullName: user.fullName || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      email: user.email || '',
      phone: user.phone || '',
      alternatePhone: user.alternatePhone || '',
      address: user.address || '',
      fatherName: user.fatherName || '',
      maritalStatus: user.maritalStatus || '',
      nationality: user.nationality || '',
      languagesKnown: user.languagesKnown || '',
      hobbies: user.hobbies || '',
      education: user.education || [{ instituteName: '', stream: '', yearOfPassing: '' }],
      projects: user.projects || [],
      certifications: user.certifications || [],
      internships: user.internships || [],
      username: user.username || '',
      password: '',
      confirmPassword: '',
      jobCategory: user.jobCategory || '',
      experience: user.experience || [],
      resume: user.resume || null,
    });
    setEditUserOpen(true);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { instituteName: '', stream: '', yearOfPassing: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', githubLink: '', description: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', details: '' }]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addInternship = () => {
    setFormData(prev => ({
      ...prev,
      internships: [...prev.internships, { companyName: '', role: '', responsibilities: '' }]
    }));
  };

  const removeInternship = (index: number) => {
    setFormData(prev => ({
      ...prev,
      internships: prev.internships.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { companyName: '', role: '', duration: '', responsibilities: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const downloadSampleExcel = () => {
    const sampleData = `firstname,lastname,email,role,phone,whatsappnumber,address,password,collegename
    John,Doe,john@example.com,student,9876543210,9876543210,123 Main St,password123,Bcd College
    Jane,Smith,jane@company.com,job-seeker,9876543211,9876543211,456 Business Ave,password123,JHJ College`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedUsers = results.data;

        // Create an array of API call promises
        const userCreationPromises = parsedUsers.map((userRow: any) => {
          const role = userRow.role || 'student';
          const endpoint = role === 'student' 
            ? 'http://localhost:8080/api/auth/register/student' 
            : 'http://localhost:8080/api/auth/register/jobseeker';

          // Map CSV columns to your formData structure
          const userData = {
            fullName: `${userRow.firstname || ''} ${userRow.lastname || ''}`.trim(),
            email: userRow.email,
            password: userRow.password,
            phone: userRow.phone,
            role: role,
            // Add any other required fields from your CSV here...
            dateOfBirth: userRow.dateOfBirth,
            gender: userRow.gender,
            address: userRow.address,
          };
          
          return axios.post(endpoint, userData);
        });

        try {
          // Wait for all the API calls to complete
          const responses = await Promise.allSettled(userCreationPromises);
          
          const successfulUploads = responses.filter(res => res.status === 'fulfilled').length;
          const failedUploads = responses.length - successfulUploads;

          if (successfulUploads > 0) {
            toast.success(`${successfulUploads} users uploaded successfully!`);
          }
          if (failedUploads > 0) {
            toast.error(`${failedUploads} users failed to upload.`);
            console.error('Failed uploads:', responses.filter(res => res.status === 'rejected'));
          }

          // Refresh the user list from the database
          fetchUsers();
        } catch (error) {
          console.error('An unexpected error occurred during bulk upload:', error);
          toast.error('An unexpected error occurred during bulk upload.');
        } finally {
          setLoading(false);
          if (event.target) {
            event.target.value = '';
          }
        }
      },
      error: (error) => {
        console.error('Error parsing CSV file:', error);
        toast.error('Failed to parse the CSV file.');
        setLoading(false);
      },
    });
  };
  const renderBasicInformation = () => (
    <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label>Gender *</Label>
            <RadioGroup value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input
              id="alternatePhone"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderPersonalInfo = () => (
    <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Family & Personal Info</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.personal ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="fatherName">Father's Name</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
            />
          </div>

          <div>
            <Label>Marital Status *</Label>
            <RadioGroup value={formData.maritalStatus} onValueChange={(value) => setFormData({...formData, maritalStatus: value})}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="married" />
                <Label htmlFor="married">Married</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="languagesKnown">Languages Known *</Label>
              <Input
                id="languagesKnown"
                value={formData.languagesKnown}
                onChange={(e) => setFormData({...formData, languagesKnown: e.target.value})}
                placeholder="e.g., English, Hindi, Telugu"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hobbies">Hobbies</Label>
            <Textarea
              id="hobbies"
              value={formData.hobbies}
              onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
            />
          </div>

          {formData.role === 'job-seeker' && (
            <div>
              <Label htmlFor="jobCategory">Looking for Job Category *</Label>
              <Select value={formData.jobCategory} onValueChange={(value) => setFormData({...formData, jobCategory: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Non-IT">Non-IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Pharma">Pharma</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderEducation = () => (
    <Collapsible open={openSections.education} onOpenChange={() => toggleSection('education')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Education</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.education ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          {formData.education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Education {index + 1}</h4>
                {formData.education.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Institute Name *</Label>
                <Input
                  value={edu.instituteName}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].instituteName = e.target.value;
                    setFormData({...formData, education: newEducation});
                  }}
                />
              </div>

              <div>
                <Label>Stream/Course *</Label>
                <Select value={edu.stream} onValueChange={(value) => {
                  const newEducation = [...formData.education];
                  newEducation[index].stream = value;
                  setFormData({...formData, education: newEducation});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                    <SelectItem value="B.Sc">B.Sc</SelectItem>
                    <SelectItem value="M.Sc">M.Sc</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Year of Passing *</Label>
                <Input
                  type="number"
                  min="1950"
                  max="2030"
                  value={edu.yearOfPassing}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].yearOfPassing = e.target.value;
                    setFormData({...formData, education: newEducation});
                  }}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addEducation}>
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderAccountSetup = () => (
    <Collapsible open={openSections.account} onOpenChange={() => toggleSection('account')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Account Setup</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.account ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Re-enter Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={downloadSampleExcel}>
            <Download className="h-4 w-4 mr-2" />
            Sample Excel
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </span>
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New User
                </DialogTitle>
                <DialogDescription>
                  Add a new user to the platform with complete registration details.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Role Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student-role" />
                        <Label htmlFor="student-role">User / Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="job-seeker" id="job-seeker-role" />
                        <Label htmlFor="job-seeker-role">Job Seeker</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {renderBasicInformation()}
                {renderPersonalInfo()}
                {renderEducation()}
                {renderAccountSetup()}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setCreateUserOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateUser} disabled={loading}>
                  {loading ? 'Creating...' : `Register as ${formData.role === 'student' ? 'Student' : 'Job Seeker'}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="job-seeker">Job Seekers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {user.role === 'student' && <GraduationCap className="h-5 w-5 text-blue-600" />}
                      {user.role === 'job-seeker' && <Briefcase className="h-5 w-5 text-blue-600" />}
                      {user.role === 'admin' && <Users className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {user.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {renderBasicInformation()}
            {renderPersonalInfo()}
            {renderEducation()}
            {renderAccountSetup()}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setEditUserOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;