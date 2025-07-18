import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Heart,
  Star,
  CheckCircle,
  Zap,
  Globe,
} from 'lucide-react';

const AboutUs = () => {
  const stats = [
    { icon: Users, label: "Students Trained", value: "10,000+", color: "text-blue-600" },
    { icon: Briefcase, label: "Job Placements", value: "5,000+", color: "text-green-600" },
    { icon: BookOpen, label: "Courses Offered", value: "200+", color: "text-purple-600" },
    { icon: Award, label: "Years of Excellence", value: "15+", color: "text-orange-600" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-Centric Approach",
      description: "Every decision we make is focused on providing the best learning experience for our students.",
      color: "bg-red-50 text-red-600"
    },
    {
      icon: Star,
      title: "Excellence in Education",
      description: "We maintain the highest standards in curriculum design, faculty selection, and course delivery.",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      icon: Zap,
      title: "Innovation & Technology",
      description: "Leveraging cutting-edge technology to create engaging and effective learning experiences.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Preparing students for careers that span across borders and industries worldwide.",
      color: "bg-green-50 text-green-600"
    }
  ];

  const milestones = [
    { year: "2010", event: "TriaRight Founded", description: "Started with a vision to bridge the gap between education and employment" },
    { year: "2015", event: "First 1000 Placements", description: "Achieved our first major milestone in job placements" },
    { year: "2018", event: "Pack365 Launch", description: "Introduced comprehensive learning packages for various domains" },
    { year: "2020", event: "Digital Transformation", description: "Successfully transitioned to online learning during the pandemic" },
    { year: "2023", event: "10,000+ Alumni", description: "Celebrated reaching 10,000 successful graduates" },
    { year: "2025", event: "Industry Leadership", description: "Recognized as a leading education and placement provider" }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      description: "15+ years in education technology and career development",
      expertise: "Strategic Leadership, Ed-Tech Innovation"
    },
    {
      name: "Priya Sharma",
      role: "Head of Academics",
      description: "PhD in Computer Science, former industry expert",
      expertise: "Curriculum Design, Faculty Development"
    },
    {
      name: "Amit Verma",
      role: "Placement Director",
      description: "10+ years in corporate recruitment and talent acquisition",
      expertise: "Industry Relations, Career Guidance"
    },
    {
      name: "Sneha Patel",
      role: "Student Success Manager",
      description: "Dedicated to ensuring every student achieves their goals",
      expertise: "Student Mentoring, Success Tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            About TriaRight
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto animate-fade-in">
            Empowering careers through innovative education, comprehensive skill development, 
            and guaranteed placement services since 2010.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Card className="p-8 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To bridge the gap between traditional education and industry requirements by providing 
              comprehensive, practical, and job-oriented training programs that guarantee career success 
              for every student.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <GraduationCap className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold">Our Vision</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To become the leading global platform for career transformation, where every individual 
              can access world-class education and achieve their professional dreams regardless of 
              their background.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-scale-in border-0 bg-card/50 backdrop-blur-sm">
              <div className={`inline-flex p-3 rounded-lg bg-muted/20 mb-4`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-20 animate-fade-in">
          <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-0 bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                Founded in 2010 with a simple yet powerful vision, TriaRight began as a small training center 
                in Hyderabad with just 20 students. Our founders recognized a critical gap between what 
                educational institutions were teaching and what the industry actually needed.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                What started as weekend programming classes quickly evolved into comprehensive career 
                transformation programs. We introduced innovative teaching methodologies, industry-relevant 
                curricula, and most importantly, guaranteed placement assistance.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Today, TriaRight stands as a testament to the power of quality education combined with 
                practical industry exposure. Our Pack365 programs have revolutionized how professionals 
                approach skill development, making world-class training accessible to everyone.
              </p>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in border-0 bg-card/30 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${value.color}`}>
                    <value.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-6 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="px-4 py-2 text-lg font-bold bg-primary/10 border-primary/30">
                    {milestone.year}
                  </Badge>
                </div>
                <Card className="flex-1 p-6 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {milestone.event}
                  </h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="animate-fade-in">
          <h2 className="text-4xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/70">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                <p className="text-sm text-muted-foreground mb-3">{member.description}</p>
                <p className="text-xs font-medium text-primary">{member.expertise}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 animate-fade-in">
          <Card className="p-12 border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful professionals who have transformed their careers with TriaRight. 
              Your journey to success starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/pack365" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Pack365
              </a>
              <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold">
                <Users className="mr-2 h-5 w-5" />
                Contact Us
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;