// components/internships/StudentApplicationsPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Download, Calendar, Building2, MapPin } from 'lucide-react';

interface Application {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    internshipType: string;
    duration: string;
  };
  status: 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn';
  applicantDetails: {
    name: string;
    email: string;
    phone: string;
    college: string;
    qualification: string;
  };
  resumeLink: string;
  appliedAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'not_required';
}

const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setWithdrawing(applicationId);
      const response = await fetch(`/api/internships/applications/withdraw/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Application withdrawn successfully'
        });
        fetchApplications(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to withdraw application');
      }
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw application',
        variant: 'destructive'
      });
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-800',
      Shortlisted: 'bg-yellow-100 text-yellow-800',
      Selected: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Withdrawn: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const canWithdraw = (application: Application) => {
    // Can only withdraw if status is Applied and deadline hasn't passed
    // Note: You might want to add deadline check from internship data
    return application.status === 'Applied';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Please Login
              </h2>
              <p className="text-gray-600">
                You need to be logged in to view your applications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track the status of your internship applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Applications Found
              </h2>
              <p className="text-gray-600 mb-4">
                You haven't applied to any internships yet.
              </p>
              <Button asChild>
                <a href="/internships">Browse Internships</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>
                You have applied to {applications.length} internship{applications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Internship</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{application.internshipId.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{application.internshipId.companyName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{application.internshipId.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {canWithdraw(application) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => withdrawApplication(application._id)}
                              disabled={withdrawing === application._id}
                            >
                              {withdrawing === application._id ? 'Withdrawing...' : 'Withdraw'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(application.resumeLink, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Application Status Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Application Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">Applied</Badge>
                <span className="text-gray-600">Your application has been submitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Shortlisted</Badge>
                <span className="text-gray-600">Your application is under review</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">Selected</Badge>
                <span className="text-gray-600">Congratulations! You've been selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
                <span className="text-gray-600">Application was not successful</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentApplicationsPage;