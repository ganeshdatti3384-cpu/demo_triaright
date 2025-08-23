
import { useState, useEffect } from 'react';
import { profileApi } from '@/services/api';

export const useProfileCompletion = () => {
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfileCompletion = async () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!token || !currentUser) {
      setIsProfileComplete(false);
      setLoading(false);
      return;
    }

    const user = JSON.parse(currentUser);
    
    try {
      // Only check profile completion for college users
      if (user.role === 'college') {
        const response = await profileApi.getCollegeProfile(token);
        const profile = response.profile;
        
        // Check if essential college fields are filled
        const isComplete = !!(
          profile?.collegeName &&
          profile?.university &&
          profile?.principalName &&
          profile?.coordinatorName &&
          profile?.address
        );
        setIsProfileComplete(isComplete);
      } else {
        // For non-college users, assume profile is complete
        setIsProfileComplete(true);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // If profile doesn't exist and user is college, show profile form
      if (user.role === 'college') {
        setIsProfileComplete(false);
      } else {
        setIsProfileComplete(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  return { isProfileComplete, loading, refetchProfile: checkProfileCompletion };
};
