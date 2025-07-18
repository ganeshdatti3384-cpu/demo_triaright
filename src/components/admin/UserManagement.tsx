/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Download, Upload, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building, GraduationCap, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states for creating/editing users
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    // Student specific
    collegeName: '',
    course: '',
    year: '',
    branch: '',
    // Employer specific
    companyName: '',
    designation: '',
    industry: '',
    companySize: '',
    // College specific
    instituteName: '',
    instituteType: '',
    location: '',
    establishedYear: '',
    // Job Seeker specific
    experience: '',
    skills: '',
    expectedSalary: '',
    currentLocation: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '+91-9876543210',
          status: 'active',
          createdAt: '2024-01-15',
          collegeName: 'ABC University',
          course: 'Computer Science',
          year: '3rd'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@company.com',
          role: 'employer',
          phone: '+91-9876543211',
          status: 'active',
          createdAt: '2024-01-14',
          companyName: 'Tech Corp',
          designation: 'HR Manager'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
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

    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.collegeName.trim()) {
        toast.error('College name is required for students');
        return false;
      }
      if (!formData.course.trim()) {
        toast.error('Course is required for students');
        return false;
      }
    }

    if (formData.role === 'employer') {
      if (!formData.companyName.trim()) {
        toast.error('Company name is required for employers');
        return false;
      }
    }

    if (formData.role === 'college') {
      if (!formData.instituteName.trim()) {
        toast.error('Institute name is required for colleges');
        return false;
      }
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - replace with actual implementation
      const newUser = {
        id: Date.now(),
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Add to users list
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast.success('User created successfully!');
      setCreateUserOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call - replace with actual implementation
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      );
      
      setUsers(updatedUsers);
      toast.success('User updated successfully!');
      setEditUserOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      collegeName: '',
      course: '',
      year: '',
      branch: '',
      companyName: '',
      designation: '',
      industry: '',
      companySize: '',
      instituteName: '',
      instituteType: '',
      location: '',
      establishedYear: '',
      experience: '',
      skills: '',
      expectedSalary: '',
      currentLocation: ''
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      phone: user.phone || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth || '',
      collegeName: user.collegeName || '',
      course: user.course || '',
      year: user.year || '',
      branch: user.branch || '',
      companyName: user.companyName || '',
      designation: user.designation || '',
      industry: user.industry || '',
      companySize: user.companySize || '',
      instituteName: user.instituteName || '',
      instituteType: user.instituteType || '',
      location: user.location || '',
      establishedYear: user.establishedYear || '',
      experience: user.experience || '',
      skills: user.skills || '',
      expectedSalary: user.expectedSalary || '',
      currentLocation: user.currentLocation || ''
    });
    setEditUserOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const downloadSampleExcel = () => {
    const sampleData = `firstName,lastName,email,role,phone,address,dateOfBirth,collegeName,course,year,branch,companyName,designation,industry,companySize,instituteName,instituteType,location,establishedYear,experience,skills,expectedSalary,currentLocation
John,Doe,john@example.com,student,+91-9876543210,123 Main St,1999-01-01,ABC University,Computer Science,3rd,CSE,,,,,,,,,,,,
Jane,Smith,jane@company.com,employer,+91-9876543211,456 Business Ave,1985-05-15,,,,,TechCorp,HR Manager,Technology,100-500,,,,,,,,`;
    
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

    try {
      // Mock bulk upload - replace with actual API
      console.log('Uploading file:', file.name);
      toast.success('Users uploaded successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error uploading users:', error);
      toast.error('Failed to upload users');
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collegeName" className="text-right">College Name *</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">Course *</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">Year</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branch" className="text-right">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="col-span-3"
              />
            </div>
          </>
        );
      
      case 'employer':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="designation" className="text-right">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industry" className="text-right">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companySize" className="text-right">Company Size</Label>
              <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'college':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instituteName" className="text-right">Institute Name *</Label>
              <Input
                id="instituteName"
                value={formData.instituteName}
                onChange={(e) => setFormData({...formData, instituteName: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instituteType" className="text-right">Institute Type</Label>
              <Select value={formData.instituteType} onValueChange={(value) => setFormData({...formData, instituteType: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="institute">Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="establishedYear" className="text-right">Established Year</Label>
              <Input
                id="establishedYear"
                type="number"
                value={formData.establishedYear}
                onChange={(e) => setFormData({...formData, establishedYear: e.target.value})}
                className="col-span-3"
              />
            </div>
          </>
        );

      case 'jobseeker':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">Skills</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="col-span-3"
                placeholder="List your skills separated by commas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expectedSalary" className="text-right">Expected Salary</Label>
              <Input
                id="expectedSalary"
                value={formData.expectedSalary}
                onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                className="col-span-3"
                placeholder="e.g., 5-8 LPA"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentLocation" className="text-right">Current Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                className="col-span-3"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the platform. Fill in the required information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Basic Information */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="col-span-3"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dateOfBirth" className="text-right">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="col-span-3"
                  />
                </div>

                {/* Role-specific fields */}
                {renderRoleSpecificFields()}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setCreateUserOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateUser} disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
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
                <SelectItem value="employer">Employers</SelectItem>
                <SelectItem value="college">Colleges</SelectItem>
                <SelectItem value="jobseeker">Job Seekers</SelectItem>
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
                      {user.role === 'employer' && <Briefcase className="h-5 w-5 text-blue-600" />}
                      {user.role === 'college' && <Building className="h-5 w-5 text-blue-600" />}
                      {(user.role === 'jobseeker' || user.role === 'admin') && <Users className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
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
                      {user.role === 'student' && user.collegeName && (
                        <p className="text-xs text-gray-500 mt-1">{user.collegeName} - {user.course}</p>
                      )}
                      {user.role === 'employer' && user.companyName && (
                        <p className="text-xs text-gray-500 mt-1">{user.companyName} - {user.designation}</p>
                      )}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as create, but populated with existing data */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-firstName" className="text-right">First Name *</Label>
              <Input
                id="edit-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-lastName" className="text-right">Last Name *</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="jobseeker">Job Seeker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="col-span-3"
                placeholder="+91-XXXXXXXXXX"
              />
            </div>

            {/* Role-specific fields for editing */}
            {renderRoleSpecificFields()}
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
