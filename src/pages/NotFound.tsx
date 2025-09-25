import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GradientFrame } from "@/components/ui/gradient-frame";
import { BrandBadge } from "@/components/ui/brand-badge";
import { Globe, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <a href="https://upangea.com" target="_blank" rel="noopener noreferrer">
              <img src="/upangea-logo.png" alt="UPangea Logo" className="h-6 w-6" />
            </a>
            <span className="text-lg font-semibold text-gray-800">UPangea</span>
          </div>
        </div>

        <div className="max-w-md mx-auto text-center">
          <GradientFrame variant="surface" padding="lg">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
              <p className="text-foreground-secondary mb-6">
                Looks like this cosmic path doesn't exist. Let's get you back on track.
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-gradient-primary hover:opacity-90 text-white px-6 py-2 rounded-2xl shadow-glow transition-all duration-200 hover:scale-105 mb-6"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            
            <div className="mt-6">
              <BrandBadge size="sm" variant="minimal" />
            </div>
          </GradientFrame>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
