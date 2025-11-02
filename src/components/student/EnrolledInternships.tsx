// components/student/EnrolledInternships.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, Calendar, MapPin, Building2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnrolledInternship {
  _id: string;
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    duration: string;
    internshipType: string;
    mode: string;
    amount?: number;
    stream: string;
  };
  applicationId: string;
  status: 'active' | 'completed' | 'terminated';
  enrolledAt: string;
  progress?: number;
  certificateIssued?: boolean;
  certificateUrl?: string;
}

const EnrolledInternships = () => {
  const [enrolledInternships, setEnrolledInternships] = useState<EnrolledInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrolledInternships();
  }, []);

  const fetchEnrolledInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/apinternshipenrolled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEnrolledInternships(data.enrolledInternships);
      } else {
        throw new Error(data.message || 'Failed to fetch enrolled internships');
      }
    } catch (error: any) {
      console.error('Error fetching enrolled internships:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load enrolled internships',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificateUrl: string) => {
    window.open(certificateUrl, '_blank');
  };

  const handleViewDetails = (internshipId: string) => {
    // Navigate to internship details page
    window.open(`/internships/${internshipId}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      terminated: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading enrolled internships...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Enrolled Internships</CardTitle>
          <CardDescription>
            Track your progress and access certificates for enrolled internships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledInternships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No Enrolled Internships</p>
              <p className="text-sm">You haven't enrolled in any internships yet.</p>
              <Button className="mt-4" onClick={() => window.location.href = '/internships'}>
                Browse Internships
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {enrolledInternships.map((enrollment) => (
                <Card key={enrollment._id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{enrollment.internshipId.title}</CardTitle>
                        <CardDescription className="flex items-center mt-2 space-x-4">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {enrollment.internshipId.companyName}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {enrollment.internshipId.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {enrollment.internshipId.duration}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(enrollment.status)}
                        <div className="text-sm text-gray-500 mt-1">
                          Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Stream</label>
                        <p className="text-sm">{enrollment.internshipId.stream}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Type</label>
                        <p className="text-sm">{enrollment.internshipId.internshipType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mode</label>
                        <p className="text-sm">{enrollment.internshipId.mode}</p>
                      </div>
                    </div>

                    {enrollment.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        {enrollment.certificateIssued && enrollment.certificateUrl ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Certificate Available
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Certificate Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(enrollment.internshipId._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {enrollment.certificateIssued && enrollment.certificateUrl && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewCertificate(enrollment.certificateUrl!)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrolledInternships;