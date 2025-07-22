
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Construction, ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleHomeClick = () => {
    navigate("/student");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleExploreClick = () => {
    navigate(`/${user.role}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <Construction className="w-32 h-32 mx-auto text-brand-primary mb-6 animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Development in Progress
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're working hard to bring you this feature. This page is currently under development 
            and will be available soon with exciting new functionality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleHomeClick}
              className="bg-brand-primary hover:bg-blue-700 text-white px-8 py-3 text-lg flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Button>
            
            <Button 
              onClick={handleBackClick}
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-blue-50 px-8 py-3 text-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Button>
            
            <Button 
              onClick={handleExploreClick}
              variant="secondary"
              className="px-8 py-3 text-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Explore Courses
            </Button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact our support team or check out our available features while we work on this page.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
