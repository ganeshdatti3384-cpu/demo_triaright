
import React from 'react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import CollegeProfileForm from '@/components/profile/CollegeProfileForm';
import { Loader2 } from 'lucide-react';

interface ProfileCompletionProps {
  children: React.ReactNode;
  userRole: string;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ children, userRole }) => {
  const { isProfileComplete, loading, refetchProfile } = useProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-white text-lg">Checking profile completion...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show profile completion form for college users who haven't completed their profile
  if (isProfileComplete === false && userRole === 'college') {
    return <CollegeProfileForm onProfileComplete={refetchProfile} />;
  }

  // For all other cases (non-college users or completed profiles), render children (dashboard)
  return <>{children}</>;
};

export default ProfileCompletion;
