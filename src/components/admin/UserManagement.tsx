import React, { useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone,  MapPin, Lock } from 'lucide-react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: string;
  address: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUsers(storedToken);
    }
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const response = await authApi.getUser(token);
      setUsers(response);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: '',
      address: ''
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Token not available. Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (validateForm()) {
      try {
        await authApi.createUser(token, formData);
        fetchUsers(token);
        closeModal();
        toast({
          title: "Success",
          description: "User created successfully!",
        });
      } catch (error: any) {
        toast({
          title: "Error creating user",
          description: error?.response?.data?.error || "Something went wrong",
          variant: "destructive",
        });
      }
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    if (!formData.password?.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={openModal} className="mb-4">Create New User</Button>

        {/* User List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New User</h3>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">First Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="Enter first name"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.firstName && <p className="text-red-500 text-xs italic">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Last Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="Enter last name"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.lastName && <p className="text-red-500 text-xs italic">{formErrors.lastName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter email"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.email && <p className="text-red-500 text-xs italic">{formErrors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="Enter phone number"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.phoneNumber && <p className="text-red-500 text-xs italic">{formErrors.phoneNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          id="password"
                          name="password"
                          placeholder="Enter password"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.password && <p className="text-red-500 text-xs italic">{formErrors.password}</p>}
                    </div>
                    <div>
                      <Label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Enter address"
                          className="pl-10 h-11 border-gray-300 focus:border-blue-500 transition-colors"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.address && <p className="text-red-500 text-xs italic">{formErrors.address}</p>}
                    </div>
                    <div>
                      <Label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 transition-colors">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="jobseeker">Job Seeker</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.role && <p className="text-red-500 text-xs italic">{formErrors.role}</p>}
                    </div>
                    <div className="items-center px-4 py-3">
                      <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Create User
                      </Button>
                      <Button type="button" className="ml-4 text-gray-700 hover:text-gray-900 focus:outline-none" onClick={closeModal}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
