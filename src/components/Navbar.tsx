
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Plus,
  Search
} from "lucide-react";
import { APP_CONFIG } from "../lib/constants";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Stats", path: "/stats", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className="font-medium text-xl tracking-tight flex items-center"
          >
            {APP_CONFIG.name}
          </Link>
          
          {!isMobile && (
            <nav className="hidden md:flex ml-8">
              <ul className="flex space-x-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        location.pathname === item.path
                          ? "text-primary bg-secondary"
                          : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 pl-9 pr-4 rounded-md border border-input bg-background w-[200px] focus:w-[300px] transition-all duration-300 focus-visible:ring-1 focus-visible:ring-offset-1"
            />
          </div>
          
          <Button 
            size="sm" 
            className="hidden md:flex items-center gap-1.5 h-9 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && isMobile && (
        <nav className="md:hidden bg-background border-b animate-fade-in">
          <div className="container mx-auto px-4 py-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-md text-sm font-medium w-full transition-colors",
                      location.pathname === item.path
                        ? "text-primary bg-secondary"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <div className="mt-2 pt-2 border-t">
                  <Button className="flex items-center w-full justify-center gap-2 mt-1">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
