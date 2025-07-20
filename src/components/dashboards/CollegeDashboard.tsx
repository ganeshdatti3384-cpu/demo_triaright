import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collegeApi } from '@/services/api';
import { College } from '@/types/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ServiceRequest {
  id: string;
  institutionName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  expectedStudents: number;
  preferredDate: string;
  serviceCategory: string[];
  serviceDescription: string;
  additionalRequirements?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const CollegeDashboard = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalStudents: number;
    placedStudents: number;
    averagePackage: number;
    totalRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
  }>({
    totalStudents: 0,
    placedStudents: 0,
    averagePackage: 0,
    totalRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    pendingRequests: 0,
  });
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [statsResponse, requestsResponse] = await Promise.all([
          collegeApi.getCollegeStats(token),
          collegeApi.getMyServiceRequests(token)
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (requestsResponse.success) {
          setServiceRequests(requestsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, toast]);

  const statsData = [
    { name: 'Total Students', value: stats.totalStudents },
    { name: 'Placed Students', value: stats.placedStudents },
    { name: 'Average Package', value: stats.averagePackage },
  ];

  const requestStatsData = [
    { name: 'Total Requests', value: stats.totalRequests },
    { name: 'Accepted', value: stats.acceptedRequests },
    { name: 'Rejected', value: stats.rejectedRequests },
    { name: 'Pending', value: stats.pendingRequests },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="outline"
        onClick={() => navigate('/college')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      <h1 className="text-3xl font-semibold mb-6">College Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Student Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Request Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold">{stats.placedStudents} / {stats.totalStudents}</h2>
            <Progress value={(stats.placedStudents / stats.totalStudents) * 100} className="w-full mt-4" />
            <p className="text-sm text-gray-500 mt-2">
              {((stats.placedStudents / stats.totalStudents) * 100).toFixed(2)}% Placement Rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Service Requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Expected Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.institutionName}</TableCell>
                  <TableCell>{request.contactPerson}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.phoneNumber}</TableCell>
                  <TableCell>{request.expectedStudents}</TableCell>
                  <TableCell className="font-medium">{request.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeDashboard;
