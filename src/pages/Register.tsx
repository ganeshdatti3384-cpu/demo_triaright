import React, { useState } from 'react';
import Footer from '../components/Footer';
import RoleSelection from '../components/Registrations/RoleSelection';
import StudentRegistration from '../components/Registrations/StudentRegistration';
import JobSeekerRegistration from '../components/Registrations/JobSeekerRegistration';
import Navbar from '@/components/Navbar';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const renderRegistrationForm = () => {
    switch (selectedRole) {
      case 'student':
        return <StudentRegistration />;
      case 'jobseeker':
        return <JobSeekerRegistration />;
      default:
        return <RoleSelection onRoleSelect={setSelectedRole} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
        throw new Error('Function not implemented.');
      } } />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {renderRegistrationForm()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;