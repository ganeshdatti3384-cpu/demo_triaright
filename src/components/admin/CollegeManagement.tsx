
import React, { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Users, MapPin, Globe, Phone, Mail, User, Calendar, GraduationCap, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface College {
  _id: string;
  userId: string;
  collegeName: string;
  university: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  establishedYear: string;
  collegeCode: string;
  accreditation: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  collegeLogo?: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  [x: string]: ReactNode;
  _id: string;
  name: string;
  email: string;
  phone: string;
  department?: string;
  year?: string;
  rollNumber?: string;
  registrationDate: string;
}

const CollegeManagement = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = 'https://triaright.com/api';

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/colleges/collegedata`);
      if (response.data.colleges) {
        setColleges(response.data.colleges);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load colleges data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

 const fetchCollegeStudents = async (collegeName: string) => {
  try {
    setStudentsLoading(true);

    const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) throw new Error('No auth token found');

    const response = await axios.get(
      `${API_BASE_URL}/colleges/admin/students/count/${encodeURIComponent(collegeName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStudents(response.data.students || []);
  } catch (error) {
    console.error('Error fetching college students:', error);
    toast({
      title: 'Error',
      description: 'Failed to load college students',
      variant: 'destructive',
    });
    setStudents([]);
  } finally {
    setStudentsLoading(false);
  }
};


  const handleViewStudents = async (college: College) => {
    setSelectedCollege(college);
    setIsStudentsDialogOpen(true);
    await fetchCollegeStudents(college.collegeName);
  };

  const filteredColleges = colleges.filter(college =>
    college.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">College Management</h2>
          <p className="text-muted-foreground">View and manage registered colleges and their students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            {colleges.length} Total Colleges
          </Badge>
          <Button onClick={fetchColleges} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search colleges by name, university, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredColleges.map((college) => (
          <Card key={college._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  {/* College Header */}
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{college.collegeName}</h3>
                      <p className="text-lg text-blue-600 font-medium">{college.university}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary" className="px-2 py-1">
                          {college.collegeCode}
                        </Badge>
                        <Badge variant="outline" className="px-2 py-1">
                          {college.accreditation}
                        </Badge>
                        <span className="text-sm text-gray-500">Est. {college.establishedYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* College Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                        Contact Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {college.email}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Phone className="h-3 w-3 mr-2" />
                          {college.phone}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Globe className="h-3 w-3 mr-2" />
                          <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {college.website}
                          </a>
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-green-500" />
                        Location
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{college.address}</p>
                        <p>{college.city}, {college.state}</p>
                        <p>PIN: {college.pincode}</p>
                      </div>
                    </div>

                    {/* Administration */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-500" />
                        Administration
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Principal</p>
                          <p className="text-gray-600">{college.principalName}</p>
                          <p className="text-gray-500">{college.principalEmail}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Coordinator</p>
                          <p className="text-gray-600">{college.coordinatorName}</p>
                          <p className="text-gray-500">{college.coordinatorEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Registered: {new Date(college.createdAt).toLocaleDateString()}
                      </span>
                      <span>User ID: {college.userId}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    onClick={() => handleViewStudents(college)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Students</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredColleges.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-500">No colleges found</p>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Students Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span>Students - {selectedCollege?.collegeName}</span>
            </DialogTitle>
            <DialogDescription>
              View all students registered under this college
            </DialogDescription>
          </DialogHeader>
          <Card className="bg-blue-50 border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="text-blue-700 font-semibold text-lg">
                  Total Students: {students.length}
                </div>
                <div className="text-sm text-blue-600">
                  College: {selectedCollege?.collegeName}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading students...</span>
              </div>
            ) : students.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="px-1 py-1">
                    {students.length} Students Found
                  </Badge>
                </div>

                {/* Compact Student Summary Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.NO</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-500">No students found</p>
                <p className="text-gray-400">This college has no registered students yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollegeManagement;
