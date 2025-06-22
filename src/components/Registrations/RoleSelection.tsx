import React from 'react';
import { User, Briefcase, Building, Users, Shield, Crown } from 'lucide-react';

const RoleSelection = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'student',
      title: 'Student / User',
      description: 'Looking for internships, courses, and career guidance',
      icon: User,
      color: 'blue',
      features: ['Access to courses', 'Internship opportunities', 'Skill development', 'Career guidance']
    },
    {
      id: 'jobseeker',
      title: 'Job Seeker',
      description: 'Actively seeking employment opportunities',
      icon: Briefcase,
      color: 'green',
      features: ['Job applications', 'Resume building', 'Interview preparation', 'Career matching']
    },
    {
      id: 'employer',
      title: 'Employer',
      description: 'Hiring talent and posting job opportunities',
      icon: Building,
      color: 'purple',
      features: ['Post job openings', 'Access talent pool', 'Manage applications', 'Conduct interviews']
    },
    {
      id: 'employee',
      title: 'Employee',
      description: 'Managing recruitment and employee data',
      icon: Users,
      color: 'orange',
      features: ['Recruitment management', 'Employee database', 'Application tracking', 'Interview scheduling']
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-600',
      green: 'bg-green-50 border-green-200 hover:border-green-400 text-green-600',
      purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 hover:border-orange-400 text-orange-600',
      red: 'bg-red-50 border-red-200 hover:border-red-400 text-red-600',
      indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 text-indigo-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Triaright</h1>
        <p className="text-xl text-gray-600">Choose your role to get started with the perfect experience</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => {
          const Icon = role.icon;
          const colorClasses = getColorClasses(role.color);
          
          return (
            <div
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${colorClasses}`}
            >
              <div className="text-center mb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Key Features:</h4>
                <ul className="space-y-1">
                  {role.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 text-xs flex items-center">
                      <span className="w-1.5 h-1.5 bg-current rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full mt-6 bg-white text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border">
                Select {role.title}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelection;
