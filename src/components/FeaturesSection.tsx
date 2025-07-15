
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Briefcase, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp,
  Monitor,
  MapPin,
  Clock,
  Target
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      category: 'Courses',
      icon: BookOpen,
      items: [
        { name: 'Live Courses', description: 'Interactive real-time learning with industry experts', badge: 'Popular' },
        { name: 'Recorded Courses', description: 'Self-paced learning with lifetime access', badge: 'Flexible' },
        { name: 'Technical Training', description: 'Hands-on skill development programs', badge: 'Practical' },
        { name: 'Certification', description: 'Industry-recognized certificates upon completion', badge: 'Verified' }
      ]
    },
    {
      category: 'Career Opportunities',
      icon: Briefcase,
      items: [
        { name: 'Job Assurance', description: 'Guaranteed placement with our partner companies', badge: 'Guaranteed' },
        { name: 'Job Assistance', description: 'Personalized career guidance and support', badge: 'Support' },
        { name: 'Online Internships', description: 'Remote internship opportunities', badge: 'Remote' },
        { name: 'Offline Internships', description: 'On-site professional experience', badge: 'On-site' }
      ]
    },
    {
      category: 'Training Programs',
      icon: Target,
      items: [
        { name: 'CRT Training', description: 'Campus Recruitment Training for placements', badge: 'Campus' },
        { name: 'Skill Development', description: 'Industry-specific skill enhancement', badge: 'Skills' },
        { name: 'Interview Prep', description: 'Mock interviews and feedback sessions', badge: 'Practice' },
        { name: 'Resume Building', description: 'Professional resume creation assistance', badge: 'Professional' }
      ]
    }
  ];

  const userModules = [
    {
      title: 'Student Portal',
      description: 'Comprehensive learning dashboard with course tracking, certifications, and career guidance',
      icon: BookOpen,
      features: ['Course Registration', 'Progress Tracking', 'Certificates', 'Resume Builder', 'Career Guidance'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Job Seeker Hub',
      description: 'Dedicated platform for job applications, resume management, and career opportunities',
      icon: Users,
      features: ['Job Applications', 'Resume Download', 'Feedback System', 'Interview Scheduling'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Employer Dashboard',
      description: 'Complete recruitment solution for posting jobs, managing applications, and hiring',
      icon: Briefcase,
      features: ['Job Posting', 'Application Management', 'Interview Scheduling', 'Candidate Analytics'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'College Partnership',
      description: 'Institutional collaboration platform for custom training and placement programs',
      icon: Award,
      features: ['Custom Services', 'Bulk Training', 'Placement Programs', 'Analytics'],
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From learning to earning - our comprehensive platform provides all the tools and opportunities 
            you need for career success
          </p>
        </div>

        {/* Feature Categories */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Modules */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Tailored Experiences for Every User
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userModules.map((module, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${module.color}`}></div>
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{module.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '8,000+', label: 'Active Learners' },
              { icon: BookOpen, value: '40+', label: 'Courses Available' },
              { icon: Briefcase, value: '10,000+', label: 'Job Vacancies' },
              { icon: Award, value: '95%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
