// components/internships/InternshipDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Calendar, Clock, Users, IndianRupee, BookOpen, Award, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Fixed import path
import ApplyInternshipDialog from './ApplyInternshipDialog';

const InternshipDetailsPage = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchInternshipDetails();
  }, [id]);

  const fetchInternshipDetails = async () => {
    try {
      // Try regular internships first
      let response = await fetch(`/api/internships/${id}`);
      let data = await response.json();

      if (!response.ok || data.error) {
        // Try AP internships
        response = await fetch(`/api/internships/ap-internships/${id}`);
        const apData = await response.json();
        
        if (apData.success) {
          setInternship(apData.internship);
        } else {
          throw new Error('Internship not found');
        }
      } else {
        setInternship(data);
      }
    } catch (error) {
      console.error('Error fetching internship details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load internship details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to apply for this internship',
        variant: 'destructive'
      });
      return;
    }

    if (user?.role !== 'student' && user?.role !== 'jobseeker') {
      toast({
        title: 'Access Denied',
        description: 'Only students and job seekers can apply for internships',
        variant: 'destructive'
      });
      return;
    }

    setShowApplyDialog(true);
  };

  const isDeadlinePassed = internship && new Date(internship.applicationDeadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading internship details...</div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Internship Not Found</h1>
          <Link to="/internships">
            <Button>Back to Internships</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/internships" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Internships
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{internship.title}</CardTitle>
                    <div className="flex items-center text-lg text-gray-600 mb-4">
                      <Building2 className="h-5 w-5 mr-2" />
                      <span>{internship.companyName}</span>
                    </div>
                  </div>
                  {'internshipId' in internship && internship.internshipId?.startsWith('APINT') && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      AP Only
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={internship.mode === 'Paid' || internship.mode === 'FeeBased' ? 'default' : 'outline'}>
                    {internship.mode}
                  </Badge>
                  <Badge variant="secondary">{internship.internshipType}</Badge>
                  {'location' in internship && internship.location && (
                    <Badge variant="outline" className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {internship.location}
                    </Badge>
                  )}
                  {internship.status !== 'Open' && (
                    <Badge variant="destructive">Closed</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{internship.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qualification:</span>
                      <span className="font-medium">{internship.qualification || 'Not specified'}</span>
                    </div>
                    {'experienceRequired' in internship && internship.experienceRequired && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{internship.experienceRequired}</span>
                      </div>
                    )}
                    {'skills' in internship && internship.skills && internship.skills.length > 0 && (
                      <div>
                        <span className="text-gray-600">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {internship.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {'stream' in internship && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stream:</span>
                        <span className="font-medium">{internship.stream}</span>
                      </div>
                    )}
                  </div>
                </div>

                {'perks' in internship && internship.perks && internship.perks.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Perks & Benefits</h3>
                      <div className="flex flex-wrap gap-2">
                        {internship.perks.map((perk: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {perk}
                          </Badge>
                        ))}
                        {internship.certificateProvided && (
                          <Badge variant="secondary" className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                        {internship.letterOfRecommendation && (
                          <Badge variant="secondary" className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            LOR
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration:
                  </span>
                  <span className="font-medium">{internship.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Start Date:
                  </span>
                  <span className="font-medium">
                    {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'Flexible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Apply Before:
                  </span>
                  <span className={`font-medium ${isDeadlinePassed ? 'text-red-600' : ''}`}>
                    {new Date(internship.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Openings:
                  </span>
                  <span className="font-medium">{internship.openings}</span>
                </div>
                {('stipendAmount' in internship && internship.stipendAmount > 0) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Stipend:
                    </span>
                    <span className="font-medium text-green-600">
                      ₹{internship.stipendAmount.toLocaleString()}/month
                    </span>
                  </div>
                )}
                {('Amount' in internship && internship.Amount > 0) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Stipend:
                    </span>
                    <span className="font-medium text-green-600">
                      ₹{internship.Amount.toLocaleString()}/month
                    </span>
                  </div>
                )}
                {'term' in internship && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Term:
                    </span>
                    <span className="font-medium">{internship.term}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleApply}
                  disabled={isDeadlinePassed || internship.status !== 'Open'}
                >
                  {isDeadlinePassed ? 'Application Closed' : 
                   internship.status !== 'Open' ? 'Not Accepting Applications' : 'Apply Now'}
                </Button>
                {isDeadlinePassed && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    The application deadline has passed
                  </p>
                )}
                {internship.status !== 'Open' && !isDeadlinePassed && (
                  <p className="text-sm text-orange-600 text-center mt-2">
                    This internship is not currently accepting applications
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <ApplyInternshipDialog
        internship={internship}
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        onSuccess={() => {
          setShowApplyDialog(false);
          toast({
            title: 'Application Submitted',
            description: 'Your application has been submitted successfully!'
          });
        }}
      />
    </div>
  );
};

export default InternshipDetailsPage;
