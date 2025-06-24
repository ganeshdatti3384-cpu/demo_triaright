import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, DollarSign, Building } from 'lucide-react';

const OfflineInternships = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const internships = [
    {
      id: 1,
      role: "Software Development Intern",
      company: "Tech Innovators",
      duration: "6 months",
      technologies: ["Java", "Spring Boot", "MySQL"],
      category: "IT",
      feeType: "Stipend",
      stipend: "₹15,000/month",
      location: "Hyderabad",
      description: "Work on enterprise applications and learn full-stack development.",
      requirements: "Computer Science background, Java knowledge",
    },
    {
      id: 2,
      role: "Marketing Assistant",
      company: "Brand Builders",
      duration: "3 months",
      technologies: ["Market Research", "Content Creation", "Analytics"],
      category: "Marketing",
      feeType: "Paid",
      stipend: "₹8,000/month",
      location: "Mumbai",
      description: "Support marketing campaigns and learn brand management.",
      requirements: "MBA/BBA preferred, creative mindset",
    },
    {
      id: 3,
      role: "Business Operations Intern",
      company: "StartupHub",
      duration: "4 months",
      technologies: ["Process Optimization", "Data Analysis", "CRM"],
      category: "Business",
      feeType: "Stipend",
      stipend: "₹12,000/month",
      location: "Bangalore",
      description: "Learn business operations in a fast-paced startup environment.",
      requirements: "Business background, analytical skills",
    },
    {
      id: 4,
      role: "Finance Intern",
      company: "Capital Solutions",
      duration: "5 months",
      technologies: ["Financial Analysis", "Bloomberg", "Excel"],
      category: "Finance",
      feeType: "Paid",
      stipend: "₹18,000/month",
      location: "Delhi",
      description: "Work with investment portfolios and financial modeling.",
      requirements: "Finance/Economics degree, Excel proficiency",
    },
    {
      id: 5,
      role: "HR Trainee",
      company: "People Connect",
      duration: "3 months",
      technologies: ["Recruitment", "Employee Engagement", "HRMS"],
      category: "HR",
      feeType: "Unpaid",
      stipend: null,
      location: "Pune",
      description: "Learn HR processes and talent acquisition strategies.",
      requirements: "HR background, good communication skills",
    },
    {
      id: 6,
      role: "Quality Assurance Intern",
      company: "TestPro Solutions",
      duration: "4 months",
      technologies: ["Manual Testing", "Selenium", "API Testing"],
      category: "IT",
      feeType: "Stipend",
      stipend: "₹10,000/month",
      location: "Chennai",
      description: "Learn software testing methodologies and automation tools.",
      requirements: "Basic programming knowledge, attention to detail",
    },
    {
      id: 7,
      role: "Content Writing Intern",
      company: "ContentCraft",
      duration: "2 months",
      technologies: ["SEO Writing", "WordPress", "Content Strategy"],
      category: "Marketing",
      feeType: "Paid",
      stipend: "₹7,000/month",
      location: "Hyderabad",
      description: "Create engaging content for digital platforms.",
      requirements: "Excellent writing skills, creativity",
    },
    {
      id: 8,
      role: "Data Entry Intern",
      company: "DataManage Corp",
      duration: "2 months",
      technologies: ["Excel", "Data Processing", "CRM"],
      category: "Non-IT",
      feeType: "Unpaid",
      stipend: null,
      location: "Kochi",
      description: "Handle data processing and database management tasks.",
      requirements: "Computer literacy, attention to detail",
    }
  ];

  const categories = ["All", "IT", "Non-IT", "Business", "HR", "Marketing", "Finance"];
  const feeTypes = ["All", "Paid", "Unpaid", "Stipend"];
  const locations = ["All", "Hyderabad", "Mumbai", "Bangalore", "Delhi", "Pune", "Chennai", "Kochi"];

  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = internship.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || internship.category === categoryFilter;
      const matchesFeeType = feeTypeFilter === 'All' || internship.feeType === feeTypeFilter;
      const matchesLocation = locationFilter === 'All' || internship.location === locationFilter;
      
      return matchesSearch && matchesCategory && matchesFeeType && matchesLocation;
    });
  }, [searchTerm, categoryFilter, feeTypeFilter, locationFilter]);

  const handleEnroll = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
        throw new Error('Function not implemented.');
      }} />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Offline Internships</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get hands-on experience with on-site internship opportunities across India.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              {filteredInternships.length} opportunities found
            </div>
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => (
            <Card key={internship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{internship.role}</CardTitle>
                    <p className="text-blue-600 font-medium">{internship.company}</p>
                  </div>
                  <Badge variant={internship.feeType === 'Unpaid' ? 'secondary' : 'default'}>
                    {internship.feeType}
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
                    {internship.location}
                  </div>
                </div>

                {internship.stipend && (
                  <div className="flex items-center text-green-600 font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {internship.stipend}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Technologies:</p>
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
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

      <Footer />
    </div>
  );
};

export default OfflineInternships;
