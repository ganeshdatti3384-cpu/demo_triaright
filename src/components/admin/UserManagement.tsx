
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, FileSpreadsheet, Eye, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'employer' | 'college';
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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<CollegeRequest[]>([]);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CollegeRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Excel Upload",
        description: `File ${file.name} uploaded successfully. Processing users...`
      });
      setIsExcelUploadOpen(false);
    }
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

  const filterUsersByRole = (role: 'student' | 'employer' | 'college') => {
    return users.filter(user => user.role === role);
  };

  const UserTable = ({ users, title }: { users: User[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                />
              </div>
              <p className="text-sm text-gray-600">
                Upload an Excel file with columns: Name, Email, Role, Phone, Address
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students ({filterUsersByRole('student').length})</TabsTrigger>
          <TabsTrigger value="employers">Employers ({filterUsersByRole('employer').length})</TabsTrigger>
          <TabsTrigger value="colleges">Colleges ({filterUsersByRole('college').length})</TabsTrigger>
          <TabsTrigger value="requests">College Requests ({collegeRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <UserTable users={filterUsersByRole('student')} title="All Students" />
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
                    selectedRequest.status === 'rejected' ? 'destructive' : 'secondary'
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
