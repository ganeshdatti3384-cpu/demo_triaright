/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Edit, Trash2, Key, Mail, Phone, Calendar } from 'lucide-react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface SuperUserManagementProps {
  user: { role: string; name: string };
}

const SuperUserManagement = ({ user }: SuperUserManagementProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
  });
  const [passwordData, setPasswordData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }
      
      const response = await authApi.getAllUsers(token);
      if (response.users) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedUser) return;

      // Since we don't have a dedicated update endpoint, we'll use the admin register endpoint
      // This will create a new user with the same email, but we'll handle the duplicate error
      const updateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        role: editFormData.role,
        // Add required fields for registration
        address: "Updated via admin", // Default value since it's required
        whatsappNumber: editFormData.phoneNumber, // Use phone number as default
        password: "temporarypassword123" // We'll use a temporary password
      };

      // Add role-specific fields
      if (editFormData.role === 'college') {
        (updateData as any).collegeName = "Updated College";
        (updateData as any).collegeCode = "UPD001";
      } else if (editFormData.role === 'employer') {
        (updateData as any).companyName = "Updated Company";
        (updateData as any).companyType = "Private Limited";
      }

      const response = await authApi.adminRegister(token, updateData);
      
      if (response.message) {
        toast.success('User updated successfully! Note: This creates a new user with updated details.');
        fetchAllUsers();
        setEditUserOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already exists')) {
        toast.error('User with this email already exists. Please use a different email.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to update user');
      }
    }
  };

  // FIXED: call backend delete endpoint (authenticated)
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will remove the user from the system.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await authApi.deleteUser(token, userId);
      toast.success(response.message || 'User deleted successfully');
      // Remove from UI
      setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordData({
      email: user.email,
      newPassword: '',
      confirmPassword: ''
    });
    setChangePasswordOpen(true);
  };

  // FIXED: Use superadmin endpoint (authenticated) and include confirmPassword
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // If current logged-in user is a superadmin and wants to reset another user's password
      // use the superadmin update-admin-password endpoint which requires auth + role check
      const response = await authApi.superadminUpdateAdminPassword(token, {
        email: passwordData.email,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      if (response.message) {
        toast.success('Password updated successfully!');
        setChangePasswordOpen(false);
        setSelectedUser(null);
        setPasswordData({
          email: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update password');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'college': return 'bg-green-100 text-green-800';
      case 'employer': return 'bg-orange-100 text-orange-800';
      case 'student': return 'bg-indigo-100 text-indigo-800';
      case 'jobseeker': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all user accounts in the system
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAllUsers} disabled={loading}>
            <Eye className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold mt-1">{allUsers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold mt-1 text-indigo-600">
                  {allUsers.filter(user => user.role === 'student').length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colleges</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {allUsers.filter(user => user.role === 'college').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employers</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">
                  {allUsers.filter(user => user.role === 'employer').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Key className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage user accounts. Edit functionality creates new users with updated details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phoneNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleChangePassword(user)}
                      className="flex items-center space-x-1"
                    >
                      <Key className="h-3 w-3" />
                      <span>Password</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
              {allUsers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No users found</div>
                  <Button variant="outline" onClick={fetchAllUsers}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. This will create a new user with updated details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editFormData.role} onValueChange={(value) => setEditFormData({...editFormData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="jobseeker">Job Seeker</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperUserManagement;
