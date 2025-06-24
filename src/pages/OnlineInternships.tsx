
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
import { Search, Clock, MapPin, DollarSign, Laptop } from 'lucide-react';

const OnlineInternships = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });

  const internships = [
    {
      id: 1,
      role: "Frontend Developer Intern",
      company: "TechStart Solutions",
      duration: "3 months",
      technologies: ["React", "JavaScript", "CSS"],
      category: "IT",
      feeType: "Stipend",
      stipend: "₹8,000/month",
      description: "Work on modern web applications using React and contribute to real projects.",
      requirements: "Basic knowledge of HTML, CSS, JavaScript",
    },
    {
      id: 2,
      role: "Digital Marketing Intern",
      company: "Creative Agency",
      duration: "2 months",
      technologies: ["Google Ads", "SEO", "Social Media"],
      category: "Marketing",
      feeType: "Unpaid",
      stipend: null,
      description: "Learn digital marketing strategies and campaign management.",
      requirements: "Interest in digital marketing, basic computer skills",
    },
    {
      id: 3,
      role: "Data Science Intern",
      company: "Analytics Pro",
      duration: "4 months",
      technologies: ["Python", "Machine Learning", "SQL"],
      category: "IT",
      feeType: "Stipend",
      stipend: "₹12,000/month",
      description: "Work with real datasets and build predictive models.",
      requirements: "Python programming, statistics knowledge",
    },
    {
      id: 4,
      role: "HR Operations Intern",
      company: "PeopleFirst Corp",
      duration: "3 months",
      technologies: ["HRIS", "Recruitment", "Employee Relations"],
      category: "HR",
      feeType: "Paid",
      stipend: "₹6,000/month",
      description: "Support HR operations and learn recruitment processes.",
      requirements: "Good communication skills, MS Office proficiency",
    },
    {
      id: 5,
      role: "Business Analyst Intern",
      company: "ConsultCorp",
      duration: "3 months",
      technologies: ["Excel", "PowerBI", "Business Intelligence"],
      category: "Business",
      feeType: "Stipend",
      stipend: "₹10,000/month",
      description: "Analyze business processes and create reports for decision making.",
      requirements: "Analytical thinking, Excel skills, business acumen",
    },
    {
      id: 6,
      role: "Financial Analyst Intern",
      company: "FinanceHub",
      duration: "4 months",
      technologies: ["Financial Modeling", "Excel", "SAP"],
      category: "Finance",
      feeType: "Paid",
      stipend: "₹9,000/month",
      description: "Learn financial analysis and reporting in a corporate environment.",
      requirements: "Finance background, Excel proficiency, attention to detail",
    }
  ];

  const categories = ["All", "IT", "Non-IT", "Business", "HR", "Marketing", "Finance"];
  const feeTypes = ["All", "Paid", "Unpaid", "Stipend"];

  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = internship.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          internship.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'All' || internship.category === categoryFilter;
      const matchesFeeType = feeTypeFilter === 'All' || internship.feeType === feeTypeFilter;
      
      return matchesSearch && matchesCategory && matchesFeeType;
    });
  }, [searchTerm, categoryFilter, feeTypeFilter]);

  const handleEnroll = () => {
    navigate('/register');
  };

  const handleOpenAuth = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const handleCloseAuth = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  const handleAuthSuccess = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
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
            <Card key={internship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{internship.role}</CardTitle>
                    <p className="text-brand-primary font-medium">{internship.company}</p>
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
                    Remote
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
                  className="w-full bg-brand-primary hover:bg-blue-700"
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

export default OnlineInternships;
