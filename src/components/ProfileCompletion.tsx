
import React from 'react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import CollegeProfileForm from '@/components/profile/CollegeProfileForm';
import EnhancedProfile from '@/components/EnhancedProfile';
import { Loader2 } from 'lucide-react';

interface ProfileCompletionProps {
  children: React.ReactNode;
  userRole: string;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ children, userRole }) => {
  const { isProfileComplete, loading, refetchProfile } = useProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking profile completion...</p>
        </div>
      </div>
    );
  }

  // If profile is incomplete, show the appropriate profile form
  if (isProfileComplete === false) {
    if (userRole === 'college') {
      return <CollegeProfileForm onProfileComplete={refetchProfile} />;
    } else if (userRole === 'student' || userRole === 'jobseeker') {
      return <EnhancedProfile />;
    }
  }

  // If profile is complete, render children (dashboard)
  return <>{children}</>;
};

export default ProfileCompletion;
