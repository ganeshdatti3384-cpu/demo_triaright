
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Construction } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleHomeClick = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <Construction className="w-24 h-24 mx-auto text-brand-primary mb-4" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Development in Progress
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          We're working hard to bring you this feature. Please check back soon or return to our homepage to explore what's currently available.
        </p>
        
        <Button 
          onClick={handleHomeClick}
          className="bg-brand-primary hover:bg-blue-700 text-white px-8 py-3 text-lg flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Route: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
