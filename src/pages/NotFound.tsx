import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
      <Card className="bg-card border-border shadow-card p-6 sm:p-8 md:p-12 text-center max-w-md w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
          </div>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            Attempted URL: <code className="font-mono">{location.pathname}</code>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 min-h-[44px] text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link to="/" className="flex-1">
              <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 min-h-[44px] text-base">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
