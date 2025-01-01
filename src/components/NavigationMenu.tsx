import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./ui/use-toast";

export function NavigationMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setIsLoggedIn(false);
          return;
        }
        
        // Only set logged in if we have a valid session
        if (session?.access_token && session?.refresh_token) {
          setIsLoggedIn(true);
          console.log("Valid session found");
        } else {
          setIsLoggedIn(false);
          console.log("No valid session found");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      switch (event) {
        case "SIGNED_IN":
          if (session?.access_token && session?.refresh_token) {
            setIsLoggedIn(true);
            toast({
              title: "Signed in successfully",
              description: "Welcome back!",
            });
          }
          break;
          
        case "SIGNED_OUT":
          setIsLoggedIn(false);
          navigate("/login");
          break;
          
        case "TOKEN_REFRESHED":
          if (session?.access_token && session?.refresh_token) {
            console.log("Token refreshed successfully");
            setIsLoggedIn(true);
          } else {
            console.log("Token refresh failed - no valid tokens");
            setIsLoggedIn(false);
            navigate("/login");
          }
          break;
          
        case "USER_UPDATED":
          if (session?.access_token && session?.refresh_token) {
            console.log("User data updated");
            setIsLoggedIn(true);
          }
          break;
          
        case "INITIAL_SESSION":
          // Handle initial session check
          if (session?.access_token && session?.refresh_token) {
            console.log("Initial session valid");
            setIsLoggedIn(true);
          } else {
            console.log("No initial session");
            setIsLoggedIn(false);
          }
          break;
          
        default:
          console.log("Unhandled auth event:", event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      setIsLoggedIn(false);
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, we'll still clear the local state
      setIsLoggedIn(false);
      navigate("/login");
      toast({
        title: "Session ended",
        description: "You have been logged out.",
      });
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PWA Burton
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[385px] p-0">
              <div className="flex flex-col gap-4 p-6">
                <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                  Menu
                </div>
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      onClick={() => handleNavigation("/admin")}
                    >
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      onClick={() => handleNavigation("/login")}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      onClick={() => handleNavigation("/register")}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};