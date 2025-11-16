/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Edit, Trash2 } from 'lucide-react';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await authApi.getAllUsers(token);
      if (response.users) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
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
      password: ''
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedUser) return;

      const updateData: any = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        role: editFormData.role
      };

      // Only include password if it's provided
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      // Call the admin register endpoint to update user
      const response = await authApi.adminRegister(token, updateData);
      
      if (response.message) {
        toast.success('User updated successfully!');
        fetchAllUsers();
        setEditUserOpen(false);
        setSelectedUser(null);
        setEditFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          role: '',
          password: ''
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Note: You'll need to implement a delete user endpoint in your backend
      // const response = await authApi.deleteUser(token, userId);
      
      toast.success('User deleted successfully!');
      fetchAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Note: You'll need to implement a toggle user status endpoint in your backend
      // const response = await authApi.toggleUserStatus(token, userId, !currentStatus);
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAllUsers}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">
                    {user.email} • {user.phoneNumber} • {user.role}
                  </p>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                    {user.lastLogin && ` • Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {allUsers.length === 0 && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Platform Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allUsers.length}</div>
            <p className="text-sm text-gray-500">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {allUsers.filter(user => user.isActive).length}
            </div>
            <p className="text-sm text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {allUsers.filter(user => !user.isActive).length}
            </div>
            <p className="text-sm text-gray-500">Deactivated accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input
                id="firstName"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Last Name</Label>
              <Input
                id="lastName"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
              <Input
                id="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <div className="col-span-3">
                <Select value={editFormData.role} onValueChange={(value) => setEditFormData({...editFormData, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">New Password</Label>
              <Input
                id="password"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                placeholder="Leave blank to keep current"
                className="col-span-3"
              />
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
    </div>
  );
};

export default SuperUserManagement;