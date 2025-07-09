
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  role: string;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    password: '',
    address: '',
    role: 'student'
  });

  // Role-specific additional fields
  const [additionalFields, setAdditionalFields] = useState<any>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual API call
      // const response = await userApi.getAllUsers(token);
      // setUsers(response.data);
      
      // For now, using mock data
      setUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setNewUser({ ...newUser, role });
    setAdditionalFields({});
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      
      const userData = {
        ...newUser,
        ...additionalFields
      };

      await authApi.register(userData);
      
      toast({
        title: 'Success',
        description: 'User added successfully',
      });
      
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        password: '',
        address: '',
        role: 'student'
      });
      setAdditionalFields({});
      setShowAddForm(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      await authApi.bulkRegisterFromExcel(file, token);
      
      toast({
        title: 'Success',
        description: 'Users uploaded successfully',
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error uploading users:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to upload users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleExcel = () => {
    const csvContent = `firstName,lastName,email,phoneNumber,whatsappNumber,password,address,role
John,Doe,john@example.com,9876543210,9876543211,pass1234,123 Main Street,student
Alice,Smith,alice@example.com,9123456789,9123456790,hello123,56 Elm Avenue,employer
Bob,Johnson,bob@example.com,9988776655,9988776656,qwerty12,789 Oak Lane,jobseeker
Mary,Brown,mary@example.com,8765432109,8765432110,admin321,22 Park Blvd,admin`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const renderRoleSpecificFields = () => {
    switch (newUser.role) {
      case 'student':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  value={additionalFields.collegeName || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, collegeName: e.target.value})}
                  placeholder="Enter college name"
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={additionalFields.course || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, course: e.target.value})}
                  placeholder="Enter course"
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Select onValueChange={(value) => setAdditionalFields({...additionalFields, year: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      
      case 'employer':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={additionalFields.companyName || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, companyName: e.target.value})}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={additionalFields.industry || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, industry: e.target.value})}
                  placeholder="Enter industry"
                />
              </div>
              <div>
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  value={additionalFields.companyWebsite || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, companyWebsite: e.target.value})}
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={additionalFields.contactPerson || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                />
              </div>
            </div>
          </>
        );
      
      case 'college':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  value={additionalFields.collegeName || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, collegeName: e.target.value})}
                  placeholder="Enter college name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={additionalFields.university || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, university: e.target.value})}
                  placeholder="Enter university name"
                />
              </div>
              <div>
                <Label htmlFor="collegeCode">College Code</Label>
                <Input
                  id="collegeCode"
                  value={additionalFields.collegeCode || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, collegeCode: e.target.value})}
                  placeholder="Enter college code"
                />
              </div>
              <div>
                <Label htmlFor="principalName">Principal Name</Label>
                <Input
                  id="principalName"
                  value={additionalFields.principalName || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, principalName: e.target.value})}
                  placeholder="Enter principal name"
                />
              </div>
            </div>
          </>
        );
      
      case 'jobseeker':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={additionalFields.experience || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, experience: e.target.value})}
                  placeholder="Enter years of experience"
                />
              </div>
              <div>
                <Label htmlFor="jobCategory">Preferred Job Category</Label>
                <Select onValueChange={(value) => setAdditionalFields({...additionalFields, jobCategory: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={additionalFields.skills || ''}
                  onChange={(e) => setAdditionalFields({...additionalFields, skills: e.target.value})}
                  placeholder="Enter relevant skills"
                />
              </div>
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
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadSampleExcel}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Download Sample Excel
          </Button>
          <label htmlFor="bulk-upload">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Bulk Upload
              </span>
            </Button>
          </label>
          <input
            id="bulk-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    value={newUser.whatsappNumber}
                    onChange={(e) => setNewUser({...newUser, whatsappNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={handleRoleChange} value={newUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  required
                />
              </div>

              {renderRoleSpecificFields()}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </div>
            <Badge variant="outline">
              {filteredUsers.length} Users
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
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
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="jobseeker">Job Seekers</SelectItem>
                <SelectItem value="employer">Employers</SelectItem>
                <SelectItem value="college">Colleges</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phoneNumber}</td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
