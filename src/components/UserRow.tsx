import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Trash2, Edit } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Make sure to import your Tooltip component

// --- TypeScript Interfaces ---
interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  status?: 'Active' | 'Inactive'; // Added for the status indicator
}

interface UserRowProps {
  user: User;
  onEdit: (userId: string) => void; // Added for the new edit functionality
  onDelete: (userId: string) => void;
}

// --- Helper Functions for Dynamic UI ---

// Helper to get a consistent color for the avatar based on the user's ID
const getAvatarColor = (userId: string) => {
  const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-red-100 text-red-600', 'bg-yellow-100 text-yellow-600'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getRoleBadgeVariant = (role: string): BadgeProps['variant'] => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case 'superadmin':
      return 'destructive';
    case 'student':
      return 'default';
    case 'employer':
      return 'secondary';
    default:
      return 'outline';
  }
};

// --- The Redesigned UserRow Component ---
export const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onDelete }) => {
  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  const userStatus = user.status || 'Active'; // Default to 'Active' if not provided

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
      
      {/* User Info Cell */}
      <td className="p-4">
        <div className="flex items-center space-x-4">
          {/* IMPROVED: Dynamic, colored avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(user._id)}`}>
            {userInitials}
          </div>
          <div>
            {/* IMPROVED: Visual hierarchy with status indicator */}
            <div className="flex items-center">
              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <span className={`ml-2 h-2 w-2 rounded-full ${userStatus === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} title={userStatus}></span>
            </div>
            <span className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1.5 opacity-70" />
              {user.email}
            </span>
          </div>
        </div>
      </td>
      
      {/* Contact Cell */}
      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
        <span className="flex items-center">
          <Phone className="h-3 w-3 mr-1.5 opacity-70" />
          {user.phoneNumber}
        </span>
      </td>

      {/* Role Cell */}
      <td className="p-4">
        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs font-medium">
          {user.role}
        </Badge>
      </td>
      
      {/* Actions Cell */}
      <td className="p-4 text-right">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-end space-x-1">
            {/* ADDED: Edit button with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onEdit(user._id)} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit User</p>
              </TooltipContent>
            </Tooltip>
            
            {/* IMPROVED: Delete button with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onDelete(user._id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete User</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </td>
    </tr>
  );
};
