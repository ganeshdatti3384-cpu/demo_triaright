import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Briefcase,
  Users,
  Award,
  Code,
  Database,
  Smartphone,
  Brain,
  TrendingUp,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  GraduationCap,
  Building,
  Heart,
  Zap,
  Globe,
  Shield,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Services = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const courseServices = [
    {
      icon: Code,
      title: "Programming & Development",
      description: "Master modern programming languages and frameworks",
      features: ["Full Stack Development", "Mobile App Development", "Web Development", "API Development"],
      duration: "3-6 months",
      level: "Beginner to Advanced",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: Database,
      title: "Data Science & Analytics",
      description: "Become a data-driven professional with hands-on experience",
      features: ["Python/R Programming", "Machine Learning", "Data Visualization", "Statistical Analysis"],
      duration: "4-8 months",
      level: "Intermediate to Advanced",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: Brain,
      title: "Artificial Intelligence",
      description: "Dive into the future with AI and machine learning",
      features: ["Deep Learning", "Neural Networks", "Computer Vision", "NLP"],
      duration: "6-12 months",
      level: "Advanced",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: Shield,
      title: "Cybersecurity",
      description: "Protect digital assets with comprehensive security training",
      features: ["Ethical Hacking", "Network Security", "Incident Response", "Risk Assessment"],
      duration: "4-6 months",
      level: "Intermediate to Advanced",
      color: "bg-red-50 text-red-600 border-red-200"
    }
  ];

  const jobServices = [
    {
      icon: Target,
      title: "Job Placement Assistance",
      description: "100% placement assistance with our industry partners",
      features: ["Resume Building", "Interview Preparation", "Company Connections", "Salary Negotiation"],
      success: "95% placement rate",
      highlight: "Guaranteed Placements"
    },
    {
      icon: Building,
      title: "Campus Recruitment",
      description: "Direct recruitment drives at your institution",
      features: ["On-campus Drives", "Bulk Hiring", "Skill Assessment", "Pre-placement Training"],
      success: "500+ companies",
      highlight: "Top MNCs"
    },
    {
      icon: TrendingUp,
      title: "Career Advancement",
      description: "Accelerate your career growth with targeted programs",
      features: ["Leadership Training", "Skill Upgradation", "Career Counseling", "Industry Mentorship"],
      success: "300% avg salary hike",
      highlight: "Career Growth"
    }
  ];

  const hrServices = [
    {
      icon: Users,
      title: "Talent Acquisition",
      description: "Find the right talent for your organization",
      features: ["Candidate Sourcing", "Skill Assessment", "Background Verification", "Onboarding Support"],
      benefit: "Reduce hiring time by 60%"
    },
    {
      icon: GraduationCap,
      title: "Corporate Training",
      description: "Upskill your workforce with customized training programs",
      features: ["Custom Curriculum", "On-site Training", "Virtual Classrooms", "Progress Tracking"],
      benefit: "Improve productivity by 40%"
    },
    {
      icon: Award,
      title: "Skill Development",
      description: "Bridge skill gaps with targeted learning programs",
      features: ["Technical Training", "Soft Skills", "Leadership Development", "Certification Programs"],
      benefit: "95% skill improvement rate"
    }
  ];

  const packServices = [
    {
      title: "IT Pack 365",
      icon: Code,
      description: "Comprehensive IT training with guaranteed placement",
      price: "₹99,999",
      originalPrice: "₹1,50,000",
      features: ["12 months training", "Live projects", "Industry mentorship", "Job guarantee", "Certification"],
      popular: true
    },
    {
      title: "Finance Pack 365",
      icon: TrendingUp,
      description: "Complete finance domain training program",
      price: "₹89,999",
      originalPrice: "₹1,30,000",
      features: ["Financial modeling", "Investment analysis", "Risk management", "Certification", "Placement support"],
      popular: false
    },
    {
      title: "HR Pack 365",
      icon: Users,
      description: "Human resources management complete program",
      price: "₹79,999",
      originalPrice: "₹1,20,000",
      features: ["HR analytics", "Talent management", "Employment law", "Payroll management", "Job assistance"],
      popular: false
    },
    {
      title: "Marketing Pack 365",
      icon: Globe,
      description: "Digital marketing and brand management program",
      price: "₹69,999",
      originalPrice: "₹1,10,000",
      features: ["Digital marketing", "SEO/SEM", "Social media", "Content strategy", "Campaign management"],
      popular: false
    }
  ];

  return (
    <><Navbar />
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Our Services
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto animate-fade-in">
            Comprehensive solutions for career development, skill enhancement, and organizational growth
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-12 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Portal
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              HR Solutions
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Pack365
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-0">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">Professional Courses</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Industry-aligned courses designed to make you job-ready with hands-on experience and expert guidance
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {courseServices.map((course, index) => (
                <Card key={index} className={`p-6 hover:shadow-lg transition-all duration-300 animate-fade-in border-2 ${course.color}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${course.color}`}>
                        <course.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{course.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{course.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium">Level:</span>
                          <p className="text-muted-foreground">{course.level}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium mb-2 block">What you'll learn:</span>
                        <div className="space-y-1">
                          {course.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-0">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">Job Portal Services</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                End-to-end job placement solutions connecting talent with opportunities
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {jobServices.map((service, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{service.highlight}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{service.success}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium mb-2 block">Key Features:</span>
                        <div className="space-y-1">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HR Tab */}
          <TabsContent value="hr" className="mt-0">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">HR Solutions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive human resource solutions to build and grow your workforce
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {hrServices.map((service, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">{service.benefit}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium mb-2 block">Services Include:</span>
                        <div className="space-y-1">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pack365 Tab */}
          <TabsContent value="packs" className="mt-0">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">Pack365 Programs</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive 365-day programs with guaranteed placements and industry certification
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packServices.map((pack, index) => (
                <Card key={index} className={`p-6 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-card/50 backdrop-blur-sm relative ${pack.popular ? 'ring-2 ring-primary' : ''}`}>
                  {pack.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <pack.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{pack.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{pack.price}</div>
                        <div className="text-sm text-muted-foreground line-through">{pack.originalPrice}</div>
                      </div>
                      <div>
                        <span className="font-medium mb-2 block text-sm">Includes:</span>
                        <div className="space-y-1">
                          {pack.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className={`w-full mt-4 ${pack.popular ? 'bg-primary' : ''}`} size="sm">
                        Choose Plan <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-20 animate-fade-in">
          <Card className="p-12 border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose the service that best fits your needs and start your journey towards success today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                <Heart className="mr-2 h-5 w-5" />
                Explore All Services
              </Button>
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Contact Our Team
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Services;