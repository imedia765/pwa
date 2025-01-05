import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', session?.user?.id);
      if (error) {
        console.error('Session check error:', error);
        handleAuthError(error);
      }
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }

      if (_event === 'SIGNED_OUT') {
        console.log('User signed out, clearing session and queries');
        await handleSignOut();
        window.location.href = '/login'; // Force a full page reload and redirect
        return; // Exit early to prevent further state updates
      }

      setSession(session);
      
      if (!session) {
        // Clear all queries when the user logs out
        await queryClient.resetQueries();
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const handleAuthError = async (error: any) => {
    console.error('Auth error:', error);
    
    if (error.message?.includes('refresh_token_not_found') || 
        error.message?.includes('Invalid Refresh Token')) {
      console.log('Invalid refresh token, signing out...');
      await handleSignOut();
      
      toast({
        title: "Session expired",
        description: "Please sign in again",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      setSession(null); // Clear session state immediately
      await queryClient.resetQueries(); // Reset all queries
      await supabase.auth.signOut(); // Sign out from Supabase
      console.log('Sign out complete, queries reset');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : session ? (
                <Index />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : session ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  );
}

export default App;