/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, FileSpreadsheet, Eye, CheckCircle, XCircle, Plus, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi, pack365Api } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'employer' | 'college' | 'jobseeker';
  status: 'active' | 'inactive';
  joinDate: string;
}

interface CollegeRequest {
  id: string;
  collegeName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface AddUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  password: string;
  address: string;
  role: 'student' | 'employer' | 'college' | 'jobseeker';
  
  // Student specific fields
  dateOfBirth?: string;
  gender?: string;
  course?: string;
  year?: string;
  
  // Employer specific fields
  companyName?: string;
  industry?: string;
  website?: string;
  companySize?: string;
  
  // College specific fields
  collegeName?: string;
  university?: string;
  establishedYear?: string;
  
  // Job seeker specific fields
  experience?: string;
  skills?: string;
  expectedSalary?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<CollegeRequest[]>([]);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CollegeRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [newUser, setNewUser] = useState<AddUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    password: '',
    address: '',
    role: 'student'
  });
  const { toast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    // Load sample data
    const sampleUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', joinDate: '2024-01-15' },
      { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'employer', status: 'active', joinDate: '2024-01-10' },
      { id: '3', name: 'ABC College', email: 'admin@abc.edu', role: 'college', status: 'active', joinDate: '2024-01-05' },
    ];
    setUsers(sampleUsers);

    const sampleRequests: CollegeRequest[] = [
      {
        id: '1',
        collegeName: 'XYZ Engineering College',
        contactPerson: 'Dr. Smith',
        email: 'contact@xyz.edu',
        phone: '+1234567890',
        address: '123 College St, City',
        website: 'www.xyz.edu',
        status: 'pending',
        requestDate: '2024-01-20'
      }
    ];
    setCollegeRequests(sampleRequests);
  }, []);

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!token) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to upload user data.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Uploading Excel...',
      description: `File "${file.name}" is being processed.`,
    });

    try {
      const response = await authApi.bulkRegisterFromExcel(file, token);
      toast({
        title: 'Upload Successful',
        description: `${response.results.length} users processed: ${response.message}`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error?.response?.data?.message || 'Something went wrong while uploading.',
        variant: 'destructive',
      });
    } finally {
      setIsExcelUploadOpen(false);
    }
  };

  const handleDownloadExcel = () => {
    // Sample data for Excel download
    const sampleData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        whatsappNumber: '9876543211',
        password: 'pass1234',
        address: '123 Main Street',
        role: 'student'
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        phoneNumber: '9123456789',
        whatsappNumber: '9123456790',
        password: 'hello123',
        address: '56 Elm Avenue',
        role: 'employer'
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        phoneNumber: '9988776655',
        whatsappNumber: '9988776656',
        password: 'qwerty12',
        address: '789 Oak Lane',
        role: 'jobseeker'
      },
      {
        firstName: 'Mary',
        lastName: 'Brown',
        email: 'mary@example.com',
        phoneNumber: '8765432109',
        whatsappNumber: '8765432110',
        password: 'admin321',
        address: '22 Park Blvd',
        role: 'admin'
      }
    ];

    // Convert data to CSV format
    const headers = ['firstName', 'lastName', 'email', 'phoneNumber', 'whatsappNumber', 'password', 'address', 'role'];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_users_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Excel Downloaded",
      description: "Sample users data has been downloaded successfully"
    });
  };

  const handleApproveRequest = (requestId: string) => {
    setCollegeRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    ));
    toast({
      title: "Request Approved",
      description: "College request has been approved successfully"
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setCollegeRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
    toast({
      title: "Request Rejected",
      description: "College request has been rejected"
    });
  };

  const viewRequestDetails = (request: CollegeRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const filterUsersByRole = (role: 'student' | 'employer' | 'college' | 'jobseeker') => {
    return users.filter(user => user.role === role);
  };

  const handleAddUser = () => {
    // Set role based on active tab
    let userRole: 'student' | 'employer' | 'college' | 'jobseeker' = 'student';
    if (activeTab === 'employers') userRole = 'employer';
    else if (activeTab === 'colleges') userRole = 'college';
    else if (activeTab === 'jobseekers') userRole = 'jobseeker';
    
    setNewUser({ 
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      whatsappNumber: '',
      password: '',
      address: '',
      role: userRole
    });
    setIsAddUserOpen(true);
  };

  const handleSubmitUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phoneNumber || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newUserData: User = {
      id: (users.length + 1).toString(),
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUserData]);
    setIsAddUserOpen(false);
    toast({
      title: "Success",
      description: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} added successfully`
    });
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'students': return 'Add Student';
      case 'employers': return 'Add Employer';
      case 'colleges': return 'Add College';
      case 'jobseekers': return 'Add Job Seeker';
      default: return 'Add User';
    }
  };

  const UserTable = ({ users, title }: { users: User[], title: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button onClick={handleAddUser} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {getAddButtonText()}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex space-x-2">
          <Button onClick={handleDownloadExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Sample Excel
          </Button>
          <Dialog open={isExcelUploadOpen} onOpenChange={setIsExcelUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Upload Users via Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Users via Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-excel-file">Select Excel File</Label>
                  <Input
                    id="user-excel-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Upload an Excel file with columns: firstName, lastName, email, phoneNumber, whatsappNumber, password, address, role
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students ({filterUsersByRole('student').length})</TabsTrigger>
          <TabsTrigger value="jobseekers">Job Seekers ({filterUsersByRole('jobseeker').length})</TabsTrigger>
          <TabsTrigger value="employers">Employers ({filterUsersByRole('employer').length})</TabsTrigger>
          <TabsTrigger value="colleges">Colleges ({filterUsersByRole('college').length})</TabsTrigger>
          <TabsTrigger value="requests">College Requests ({collegeRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <UserTable users={filterUsersByRole('student')} title="All Students" />
        </TabsContent>

        <TabsContent value="jobseekers">
          <UserTable users={filterUsersByRole('jobseeker')} title="All Job Seekers" />
        </TabsContent>

        <TabsContent value="employers">
          <UserTable users={filterUsersByRole('employer')} title="All Employers" />
        </TabsContent>

        <TabsContent value="colleges">
          <UserTable users={filterUsersByRole('college')} title="All Colleges" />
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>College Registration Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collegeRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.collegeName}</TableCell>
                      <TableCell>{request.contactPerson}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewRequestDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getAddButtonText()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={newUser.whatsappNumber}
                  onChange={(e) => setNewUser({...newUser, whatsappNumber: e.target.value})}
                  placeholder="Enter WhatsApp number"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {newUser.role === 'student' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newUser.dateOfBirth || ''}
                      onChange={(e) => setNewUser({...newUser, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newUser.gender || ''} onValueChange={(value) => setNewUser({...newUser, gender: value})}>
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
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={newUser.course || ''}
                      onChange={(e) => setNewUser({...newUser, course: e.target.value})}
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={newUser.year || ''} onValueChange={(value) => setNewUser({...newUser, year: value})}>
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
              </div>
            )}

            {newUser.role === 'employer' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={newUser.companyName || ''}
                      onChange={(e) => setNewUser({...newUser, companyName: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={newUser.industry || ''}
                      onChange={(e) => setNewUser({...newUser, industry: e.target.value})}
                      placeholder="Enter industry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newUser.website || ''}
                      onChange={(e) => setNewUser({...newUser, website: e.target.value})}
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={newUser.companySize || ''} onValueChange={(value) => setNewUser({...newUser, companySize: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
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
                </div>
              </div>
            )}

            {newUser.role === 'college' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">College Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      value={newUser.collegeName || ''}
                      onChange={(e) => setNewUser({...newUser, collegeName: e.target.value})}
                      placeholder="Enter college name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={newUser.university || ''}
                      onChange={(e) => setNewUser({...newUser, university: e.target.value})}
                      placeholder="Enter university name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={newUser.establishedYear || ''}
                      onChange={(e) => setNewUser({...newUser, establishedYear: e.target.value})}
                      placeholder="Enter established year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newUser.website || ''}
                      onChange={(e) => setNewUser({...newUser, website: e.target.value})}
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
              </div>
            )}

            {newUser.role === 'jobseeker' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Seeker Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={newUser.experience || ''}
                      onChange={(e) => setNewUser({...newUser, experience: e.target.value})}
                      placeholder="Enter years of experience"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedSalary">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      value={newUser.expectedSalary || ''}
                      onChange={(e) => setNewUser({...newUser, expectedSalary: e.target.value})}
                      placeholder="Enter expected salary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea
                      id="skills"
                      value={newUser.skills || ''}
                      onChange={(e) => setNewUser({...newUser, skills: e.target.value})}
                      placeholder="Enter skills (comma separated)"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitUser}>
                Add {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* College Request Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>College Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>College Name</Label>
                  <p className="text-sm font-medium">{selectedRequest.collegeName}</p>
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <p className="text-sm font-medium">{selectedRequest.contactPerson}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm font-medium">{selectedRequest.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="text-sm font-medium">{selectedRequest.address}</p>
                </div>
                <div>
                  <Label>Website</Label>
                  <p className="text-sm font-medium">{selectedRequest.website}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={
                    selectedRequest.status === 'approved' ? 'default' :
                    selectedRequest.status === 'rejected' ? 'descriptive' : 'secondary'
                  }>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => {
                    handleApproveRequest(selectedRequest.id);
                    setIsViewDialogOpen(false);
                  }}>
                    Approve Request
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    handleRejectRequest(selectedRequest.id);
                    setIsViewDialogOpen(false);
                  }}>
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
