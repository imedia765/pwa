import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import Index from './pages/Index';
import Login from './pages/Login';
import { Toaster } from "@/components/ui/toaster";

function AuthWrapper() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // First check for existing session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error);
        navigate('/login');
      } else if (session) {
        console.log('Existing session found:', session.user.id);
        queryClient.invalidateQueries();
      } else {
        console.log('No session found, redirecting to login');
        navigate('/login');
      }
    };

    checkSession();

    // Then set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.id);
        queryClient.invalidateQueries();
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        queryClient.invalidateQueries();
        navigate('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed for user:', session?.user?.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthWrapper />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;