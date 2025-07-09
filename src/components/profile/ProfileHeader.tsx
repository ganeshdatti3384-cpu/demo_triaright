/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, User, Star } from 'lucide-react';

interface ProfileHeaderProps {
  user: any;
  profilePic: string;
  onProfilePicUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, profilePic, onProfilePicUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative mb-8">
      <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl transform perspective-1000 rotate-x-5">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <Avatar className="w-full h-full">
                <AvatarImage src={profilePic} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                  {user?.firstName ? getInitials(user.firstName + ' ' + (user.lastName || '')) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            >
              <Camera className="h-5 w-5" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onProfilePicUpload}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">
              {user?.firstName || 'Your Name'} {user?.lastName || ''}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <User className="h-4 w-4 mr-1" />
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Student'}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Star className="h-4 w-4 mr-1" />
                Active Member
              </Badge>
            </div>
            <p className="text-white/90 text-lg">
              Welcome to your enhanced profile dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
