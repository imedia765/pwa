import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAuthStateHandler = (setIsLoggedIn: (value: boolean) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state handler");
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Initial session check:", { session, error });
        
        if (error) {
          console.error("Session check error:", error);
          await handleAuthError(error);
          return;
        }
        
        if (session) {
          console.log("Active session found");
          setIsLoggedIn(true);
          // Only navigate if we're not already on a valid route
          if (window.location.pathname === '/') {
            navigate("/admin/profile");
          }
        } else {
          console.log("No active session");
          setIsLoggedIn(false);
          // Only navigate to login if we're not already there or on a public route
          if (!['/login', '/register', '/'].includes(window.location.pathname)) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        await handleAuthError(error);
      }
    };

    const handleAuthError = async (error: any) => {
      console.error("Auth error occurred:", error);
      
      // Clear any stale auth data
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      
      // Clear local storage auth data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Only show toast if it's not a refresh token error
      if (!error.message?.includes('refresh_token_not_found')) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive",
        });
      }
      
      // Only navigate if we're not already on the login page
      if (window.location.pathname !== '/login') {
        navigate("/login");
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { event, session });
      
      switch (event) {
        case "SIGNED_IN":
          if (session) {
            console.log("Sign in event detected");
            setIsLoggedIn(true);
            toast({
              title: "Signed in successfully",
              description: "Welcome back!",
            });
            navigate("/admin/profile");
          }
          break;
          
        case "SIGNED_OUT":
          console.log("User signed out");
          setIsLoggedIn(false);
          navigate("/login");
          break;
          
        case "TOKEN_REFRESHED":
          console.log("Token refreshed successfully");
          if (session) {
            setIsLoggedIn(true);
          }
          break;
          
        case "USER_UPDATED":
          console.log("User data updated");
          break;
          
        case "INITIAL_SESSION":
          if (!session) {
            console.log("No initial session");
            setIsLoggedIn(false);
            // Only navigate if we're not already on a valid public route
            if (!['/login', '/register', '/'].includes(window.location.pathname)) {
              navigate("/login");
            }
          }
          break;
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, setIsLoggedIn, toast]);
};