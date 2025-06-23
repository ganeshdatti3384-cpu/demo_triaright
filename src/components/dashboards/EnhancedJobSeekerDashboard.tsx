
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Star,
  Filter,
  Search,
  MapPin,
  Building,
  Calendar,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

interface EnhancedJobSeekerDashboardProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

const EnhancedJobSeekerDashboard = ({ user, onLogout }: EnhancedJobSeekerDashboardProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const jobAssistancePackages = [
    {
      id: 1,
      title: 'Interview Preparation',
      description: 'Comprehensive interview training and mock sessions',
      price: '₹500',
      duration: 'Lifetime Access',
      features: ['Mock Interviews', 'Real-time Feedback', 'Industry Questions', 'Confidence Building']
    }
  ];

  const jobAssurancePackages = [
    {
      id: 1,
      title: 'IT Track - 1 Year Program',
      price: '₹30,000',
      duration: '1 Year',
      description: 'Intensive training with guaranteed placement support',
      features: [
        'Personalized Skill Assessment',
        'Resume Building & LinkedIn Optimization',
        'Soft Skills & Communication Training',
        'Technical Training (Full Stack Development)',
        'Weekly Progress Reviews',
        'Direct Interview Opportunities',
        'Mock Interviews with Real-Time Feedback',
        'Placement Guarantee'
      ]
    },
    {
      id: 2,
      title: 'Non-IT Track - 100-Day Program',
      price: '₹10,000',
      duration: '100 Days',
      description: 'Targeted training with job assistance',
      features: [
        'Personalized Skill Assessment',
        'Resume Building & LinkedIn Optimization',
        'Soft Skills & Communication Training',
        'Domain-Specific Training',
        'Weekly Progress Reviews',
        'Direct Interview Opportunities',
        'Mock Interviews with Real-Time Feedback',
        'Job Assistance Support'
      ]
    }
  ];

  const jobListings = [
    {
      id: 1,
      title: 'Software Developer',
      company: 'TechCorp Solutions',
      location: 'Hyderabad',
      salary: '₹4-6 LPA',
      experience: '0-2 years',
      type: 'IT',
      postedDate: '2 days ago',
      skills: ['React', 'Node.js', 'JavaScript']
    },
    {
      id: 2,
      title: 'Marketing Executive',
      company: 'Digital Marketing Co.',
      location: 'Bangalore',
      salary: '₹3-5 LPA',
      experience: '1-3 years',
      type: 'Non-IT',
      postedDate: '1 day ago',
      skills: ['Digital Marketing', 'SEO', 'Social Media']
    },
    {
      id: 3,
      title: 'Data Analyst',
      company: 'Analytics Hub',
      location: 'Mumbai',
      salary: '₹5-8 LPA',
      experience: '2-4 years',
      type: 'IT',
      postedDate: '3 days ago',
      skills: ['Python', 'SQL', 'Tableau']
    },
    {
      id: 4,
      title: 'Pharmacy Assistant',
      company: 'MedCare Pharmacy',
      location: 'Chennai',
      salary: '₹2-3 LPA',
      experience: '0-1 years',
      type: 'Pharmacy',
      postedDate: '4 days ago',
      skills: ['Pharmacy Knowledge', 'Customer Service', 'Inventory Management']
    }
  ];

  const filteredJobs = jobListings.filter(job => {
    const matchesFilter = selectedFilter === 'all' || job.type.toLowerCase() === selectedFilter;
    const matchesLocation = selectedLocation === 'all' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesFilter && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
              <p className="text-blue-100">Find your dream job with TriaRight</p>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Job Search</TabsTrigger>
            <TabsTrigger value="assistance">Job Assistance</TabsTrigger>
            <TabsTrigger value="assurance">Job Assurance</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Job Type</label>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        <SelectItem value="it">IT Jobs</SelectItem>
                        <SelectItem value="non-it">Non-IT Jobs</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy Jobs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Listings */}
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.experience} experience • Posted {job.postedDate}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
                          Apply Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Save Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Assistance Packages</h2>
                <p className="text-gray-600 mb-6">Enhance your job search with our specialized assistance programs</p>
              </div>
              
              {jobAssistancePackages.map((pkg) => (
                <Card key={pkg.id} className="border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-orange-600">{pkg.title}</CardTitle>
                        <CardDescription className="mt-2">{pkg.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{pkg.price}</div>
                        <div className="text-sm text-gray-500">{pkg.duration}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Get Started - {pkg.price}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assurance" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Assurance Programs</h2>
                <p className="text-gray-600 mb-6">Comprehensive training programs with guaranteed placement support</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {jobAssurancePackages.map((pkg) => (
                  <Card key={pkg.id} className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="text-center">
                        <CardTitle className="text-xl text-blue-600">{pkg.title}</CardTitle>
                        <div className="text-3xl font-bold text-blue-600 my-2">{pkg.price}</div>
                        <div className="text-sm text-gray-500">{pkg.duration}</div>
                        <CardDescription className="mt-2">{pkg.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Enroll Now - {pkg.price}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your personal and professional details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <p className="text-lg">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-lg capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedJobSeekerDashboard;
