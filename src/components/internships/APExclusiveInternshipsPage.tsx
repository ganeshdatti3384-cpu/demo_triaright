// components/internships/APExclusiveInternshipsPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Building2, Calendar, IndianRupee, Clock, Users, BookOpen, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ApplyInternshipDialog from './ApplyInternshipDialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface APInternship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Online' | 'Offline';
  term: 'Shortterm' | 'Longterm';
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Free' | 'Paid';
  stream: string;
  Amount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
}

const APExclusiveInternshipsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [filteredAPInternships, setFilteredAPInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    mode: 'all',
    stream: 'all'
  });
  const [selectedInternship, setSelectedInternship] = useState<APInternship | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchAPInternships();
  }, []);

  useEffect(() => {
    filterInternships();
  }, [apInternships, searchTerm, filters, activeTab]);

  const fetchAPInternships = async () => {
    try {
      const response = await fetch('/api/internships/ap-internships');
      const data = await response.json();
      if (data.success) {
        setApInternships(data.internships.filter((internship: APInternship) => internship.status === 'Open'));
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInternships = () => {
    let filtered = apInternships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || internship.internshipType.toLowerCase() === filters.type;
      const matchesMode = filters.mode === 'all' || internship.mode.toLowerCase() === filters.mode;
      const matchesStream = filters.stream === 'all' || internship.stream.toLowerCase().includes(filters.stream);

      return matchesSearch && matchesType && matchesMode && matchesStream;
    });

    // Apply tab-specific filtering
    if (activeTab === 'free') {
      filtered = filtered.filter(internship => internship.mode === 'Free');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(internship => internship.mode === 'Paid');
    } else if (activeTab === 'online') {
      filtered = filtered.filter(internship => internship.internshipType === 'Online');
    }

    setFilteredAPInternships(filtered);
  };

  const handleApply = (internship: APInternship) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to apply for internships',
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

    setSelectedInternship(internship);
    setShowApplyDialog(true);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      Paid: 'default',
      Free: 'secondary'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      Online: 'secondary',
      Offline: 'default'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const InternshipCard = ({ internship }: { internship: APInternship }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    
    return (
      <Card className="h-full flex flex-col border-2 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
              <CardTitle className="text-lg mb-1">{internship.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{internship.companyName}</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Star className="h-3 w-3 mr-1" />
              AP Exclusive
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {getModeBadge(internship.mode)}
            {getTypeBadge(internship.internshipType)}
            <Badge variant="outline" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {internship.location}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {internship.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {internship.duration}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">
                {new Date(internship.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Apply Before:</span>
              <span className={`font-medium flex items-center ${deadlinePassed ? 'text-red-600' : ''}`}>
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Openings:</span>
              <span className="font-medium flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {internship.openings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Stream:</span>
              <span className="font-medium">{internship.stream}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Term:</span>
              <span className="font-medium">{internship.term}</span>
            </div>
            {internship.Amount && internship.Amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stipend:</span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.Amount.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => handleApply(internship)}
            disabled={deadlinePassed}
          >
            {deadlinePassed ? 'Application Closed' : 'Apply Now'}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading AP Exclusive internships...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Star className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-900">
                AP Exclusive Internships
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Special internship opportunities exclusively for Andhra Pradesh students. Get access to unique programs and government initiatives.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search AP internships by title, company, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Internship Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.mode} onValueChange={(value) => setFilters({...filters, mode: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.stream} onValueChange={(value) => setFilters({...filters, stream: value})}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="computer science">Computer Science</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Internships</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
            </TabsList>

            {/* All Internships */}
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAPInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
              {filteredAPInternships.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No AP internships found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
                </div>
              )}
            </TabsContent>

            {/* Other Tabs */}
            {['free', 'paid', 'online'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAPInternships.map((internship) => (
                    <InternshipCard key={internship._id} internship={internship} />
                  ))}
                </div>
                {filteredAPInternships.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No {tab} AP internships found</h3>
                    <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{apInternships.length}</div>
                <p className="text-sm text-gray-600">AP Exclusive Internships</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {apInternships.filter(i => i.mode === 'Paid').length}
                </div>
                <p className="text-sm text-gray-600">Paid Opportunities</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {apInternships.filter(i => i.internshipType === 'Online').length}
                </div>
                <p className="text-sm text-gray-600">Online Programs</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {[...new Set(apInternships.map(i => i.stream))].length}
                </div>
                <p className="text-sm text-gray-600">Different Streams</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apply Dialog */}
        <ApplyInternshipDialog
          internship={selectedInternship}
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          onSuccess={() => {
            setShowApplyDialog(false);
            setSelectedInternship(null);
          }}
        />
      </div>
      <Footer />
    </>
  );
};

export default APExclusiveInternshipsPage;