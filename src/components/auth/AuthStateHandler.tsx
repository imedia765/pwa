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
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }
        
        if (session?.access_token && session?.refresh_token) {
          console.log("Active session found");
          setIsLoggedIn(true);
          if (window.location.pathname === "/login") {
            navigate("/admin");
          }
        } else {
          console.log("No active session");
          setIsLoggedIn(false);
          if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoggedIn(false);
        navigate("/login");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", { event, session });
      
      switch (event) {
        case "SIGNED_IN":
          if (session?.access_token && session?.refresh_token) {
            console.log("Sign in event detected");
            setIsLoggedIn(true);
            toast({
              title: "Signed in successfully",
              description: "Welcome back!",
            });
            navigate("/admin");
          }
          break;
          
        case "SIGNED_OUT":
          console.log("User signed out");
          setIsLoggedIn(false);
          navigate("/login");
          break;
          
        case "TOKEN_REFRESHED":
          console.log("Token refreshed successfully");
          if (session?.access_token && session?.refresh_token) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate("/login");
          }
          break;
          
        case "USER_UPDATED":
          console.log("User data updated");
          if (session?.access_token && session?.refresh_token) {
            setIsLoggedIn(true);
          }
          break;
          
        case "INITIAL_SESSION":
          console.log("Initial session check");
          if (session?.access_token && session?.refresh_token) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
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