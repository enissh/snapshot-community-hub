
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.history.back()}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="w-full h-12 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
