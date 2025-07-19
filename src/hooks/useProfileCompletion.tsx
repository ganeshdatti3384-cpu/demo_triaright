
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
      let profile;
      switch (user.role) {
        case 'college':
          profile = await profileApi.getCollegeProfile(token);
          // Check if essential college fields are filled
          const isComplete = !!(
            profile?.collegeName &&
            profile?.university &&
            profile?.principalName &&
            profile?.coordinatorName &&
            profile?.address
          );
          setIsProfileComplete(isComplete);
          break;
        case 'student':
          profile = await profileApi.getStudentProfile(token);
          setIsProfileComplete(!!(profile?.fullName && profile?.email));
          break;
        case 'jobseeker':
          profile = await profileApi.getJobSeekerProfile(token);
          setIsProfileComplete(!!(profile?.fullName && profile?.email));
          break;
        default:
          setIsProfileComplete(true);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  return { isProfileComplete, loading, refetchProfile: checkProfileCompletion };
};
