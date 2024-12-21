import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, User, UserCheck, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function NavigationMenu() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const { data: userRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      if (!isLoggedIn) return null;
      
      // First get the current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return null;

      console.log("Looking up profile for email:", user.email);

      // Then fetch their profile using their email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return profile?.role;
    },
    enabled: isLoggedIn,
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const RoleBadge = () => {
    if (!userRole) return null;

    const roleConfig = {
      admin: { icon: Crown, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      collector: { icon: UserCheck, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      member: { icon: User, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
    };

    const config = roleConfig[userRole as keyof typeof roleConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`ml-2 ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {userRole}
      </Badge>
    );
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PWA Burton
          </span>
          {isLoggedIn && <RoleBadge />}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Admin Panel
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
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
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[385px]">
              <div className="flex flex-col gap-4 p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                  Navigation Menu
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Access your account and manage your preferences
                </p>
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      onClick={() => handleNavigation("/admin")}
                    >
                      Admin Panel
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                    >
                      Logout
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
}