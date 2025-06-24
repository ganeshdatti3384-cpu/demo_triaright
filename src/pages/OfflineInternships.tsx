
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, DollarSign, Building, Code, TrendingUp, Users, Briefcase } from 'lucide-react';

const OfflineInternships = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });

  const handleOpenAuth = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const handleAuthSuccess = (userRole: string, userName: string) => {
    console.log(`User ${userName} logged in as ${userRole}`);
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const internships = [
    {
      id: 1,
      role: "Software Developer Intern",
      company: "Tech Innovations Pvt Ltd",
      location: "Bangalore",
      duration: "6 months",
      technologies: ["Java", "Spring Boot", "MySQL"],
      category: "IT",
      stipend: "₹15,000/month",
      description: "Work on enterprise applications and learn backend development.",
      requirements: "Java programming, database knowledge",
      color: "bg-blue-500",
      icon: Code
    },
    {
      id: 2,
      role: "Marketing Intern",
      company: "Brand Solutions",
      location: "Mumbai",
      duration: "3 months",
      technologies: ["Market Research", "Campaign Management", "Analytics"],
      category: "Marketing",
      stipend: "₹8,000/month",
      description: "Assist in marketing campaigns and brand development.",
      requirements: "Marketing knowledge, creative thinking",
      color: "bg-purple-500",
      icon: TrendingUp
    },
    {
      id: 3,
      role: "Data Analyst Intern",
      company: "Analytics Corp",
      location: "Hyderabad",
      duration: "4 months",
      technologies: ["Python", "SQL", "Tableau"],
      category: "IT",
      stipend: "₹12,000/month",
      description: "Analyze business data and create insightful reports.",
      requirements: "Python, SQL knowledge, analytical skills",
      color: "bg-green-500",
      icon: TrendingUp
    },
    {
      id: 4,
      role: "HR Intern",
      company: "People & Culture Co",
      location: "Delhi",
      duration: "3 months",
      technologies: ["Recruitment", "Employee Engagement", "HR Analytics"],
      category: "HR",
      stipend: "₹7,000/month",
      description: "Support HR operations and talent acquisition.",
      requirements: "Communication skills, HR interest",
      color: "bg-pink-500",
      icon: Users
    },
    {
      id: 5,
      role: "Finance Intern",
      company: "Capital Advisors",
      location: "Chennai",
      duration: "5 months",
      technologies: ["Financial Analysis", "Excel", "SAP"],
      category: "Finance",
      stipend: "₹10,000/month",
      description: "Assist in financial planning and analysis activities.",
      requirements: "Finance background, Excel skills",
      color: "bg-indigo-500",
      icon: Briefcase
    },
    {
      id: 6,
      role: "Operations Intern",
      company: "Logistics Solutions",
      location: "Pune",
      duration: "4 months",
      technologies: ["Process Optimization", "Supply Chain", "Analytics"],
      category: "Operations",
      stipend: "₹9,000/month",
      description: "Optimize business operations and improve efficiency.",
      requirements: "Process thinking, analytical mindset",
      color: "bg-orange-500",
      icon: Briefcase
    }
  ];

  const locations = ["All", "Bangalore", "Mumbai", "Hyderabad", "Delhi", "Chennai", "Pune"];
  const categories = ["All", "IT", "Marketing", "HR", "Finance", "Operations"];

  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = internship.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = locationFilter === 'All' || internship.location === locationFilter;
      const matchesCategory = categoryFilter === 'All' || internship.category === categoryFilter;
      
      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [searchTerm, locationFilter, categoryFilter]);

  const handleEnroll = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Offline Internships</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Get hands-on experience with on-site internship opportunities in top companies across India.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            >
              <Building className="h-5 w-5 mr-2" />
              Find Internships
            </Button>
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
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              {filteredInternships.length} opportunities found
            </div>
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <Card key={internship.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <div className={`h-24 ${internship.color} flex items-center justify-center`}>
                  <internship.icon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-800">
                    On-site
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{internship.role}</CardTitle>
                    <p className="text-blue-600 font-medium">{internship.company}</p>
                  </div>
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
                    {internship.location}
                  </div>
                </div>

                <div className="flex items-center text-green-600 font-medium">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {internship.stipend}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {internship.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                  <p className="text-sm text-gray-600">{internship.requirements}</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No internships found matching your criteria.</p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        type={authModal.type}
        userType={authModal.userType}
        onAuthSuccess={handleAuthSuccess}
      />
      <Footer />
    </div>
  );
};

export default OfflineInternships;
