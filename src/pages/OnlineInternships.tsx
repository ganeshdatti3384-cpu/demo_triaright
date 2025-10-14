import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, Laptop, IndianRupee, Loader2, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  duration: string;
  location: string;
  internshipType: string;
  mode: string;
  stipendAmount?: number;
  currency?: string;
  description: string;
  qualification: string;
  skills: string[];
  category?: string;
  applicationDeadline: string;
  status: string;
  openings: number;
  stream?: string;
  term?: string;
}

const OnlineInternships = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch online internships from backend
  useEffect(() => {
    const fetchOnlineInternships = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/internships/ap-internships/filter/online', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // If response is not OK, check if it's HTML (backend down)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            throw new Error('Backend server is not available. Please make sure the backend is running.');
          } else {
            throw new Error(`Failed to fetch online internships: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        if (data.success) {
          setInternships(data.internships || []);
          toast.success('Online internships loaded successfully');
        } else {
          throw new Error(data.message || 'Failed to fetch internships');
        }
      } catch (err) {
        console.error('Error fetching online internships:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load internships. Please check if the backend server is running.';
        setError(errorMessage);
        toast.error('Failed to load online internships');
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineInternships();
  }, []);

  // Extract unique categories and fee types from data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(internships.map(internship => internship.category || 'Other'))];
    return ['All', ...uniqueCategories];
  }, [internships]);

  const feeTypes = ["All", "Paid", "Free"];

  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || (internship.category || 'Other') === categoryFilter;
      const matchesFeeType = feeTypeFilter === 'All' || 
                           (feeTypeFilter === 'Paid' && internship.mode === 'Paid') ||
                           (feeTypeFilter === 'Free' && internship.mode === 'Free');
      
      return matchesSearch && matchesCategory && matchesFeeType;
    });
  }, [internships, searchTerm, categoryFilter, feeTypeFilter]);

  const handleEnroll = (internshipId: string) => {
    navigate(`/internship/${internshipId}/apply`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const formatStipend = (internship: Internship) => {
    if (internship.mode === 'Free') {
      return 'Free';
    }
    if (internship.stipendAmount) {
      const currencySymbol = internship.currency === 'INR' ? '₹' : '$';
      return `${currencySymbol}${internship.stipendAmount.toLocaleString()}/month`;
    }
    return 'Stipend not specified';
  };

  const getFeeTypeBadge = (internship: Internship) => {
    return internship.mode === 'Paid' ? 'Paid' : 'Free';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading online internships...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Server Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Please make sure your backend server is running on the correct port.
              </p>
              <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Online Internships</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Gain practical experience with remote internship opportunities from top companies.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fee Type" />
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map(feeType => (
                  <SelectItem key={feeType} value={feeType}>{feeType}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              <Laptop className="h-4 w-4 mr-2" />
              {filteredInternships.length} opportunities found
            </div>
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <Card key={internship._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{internship.title}</CardTitle>
                    <p className="text-blue-600 font-medium">{internship.companyName}</p>
                  </div>
                  <Badge variant={internship.mode === 'Free' ? 'secondary' : 'default'}>
                    {getFeeTypeBadge(internship)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{internship.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {internship.duration}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Remote
                  </div>
                </div>

                <div className="flex items-center text-green-600 font-medium">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {formatStipend(internship)}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Required:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Qualifications:</p>
                  <p className="text-sm text-gray-600">{internship.qualification}</p>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Openings: {internship.openings}</span>
                  <span>Apply by: {new Date(internship.applicationDeadline).toLocaleDateString()}</span>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  onClick={() => handleEnroll(internship._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={internship.status !== 'Open'}
                >
                  {internship.status === 'Open' ? 'Apply Now' : 'Closed'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredInternships.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No online internships found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OnlineInternships;
