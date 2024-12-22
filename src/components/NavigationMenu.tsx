import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { ThemeToggle } from "./ThemeToggle";
import { NavLogo } from "./navigation/NavLogo";
import { NavLinks } from "./navigation/NavLinks";
import { AuthButtons } from "./navigation/AuthButtons";
import { MobileNav } from "./navigation/MobileNav";

export function NavigationMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(!!session);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      setIsLoggedIn(!!session);
      
      if (event === "SIGNED_IN") {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
          duration: 3000,
        });
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Logged out successfully",
          description: "Come back soon!",
          duration: 3000,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <NavLogo />
          <ThemeToggle />
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <NavLogo />
          <NavLinks />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <AuthButtons isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <MobileNav isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}