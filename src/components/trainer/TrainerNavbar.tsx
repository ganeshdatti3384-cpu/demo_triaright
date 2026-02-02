// components/trainer/TrainerNavbar.tsx
import React from "react";
import { Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const TrainerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged Out Successfully!', {
      description: 'See you soon!',
    });
    navigate("/");
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + Dashboard Text */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/lovable-uploads/LOGO.png"
            alt="TriaRight Logo"
            className="h-10 w-auto"
          />
         
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="h-5 w-5 text-gray-700 hover:text-blue-600 transition" />
          </button>

          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <User className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              {user?.firstName || user?.name || "Trainer"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-600 font-medium hover:opacity-75"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
};

export default TrainerNavbar;
