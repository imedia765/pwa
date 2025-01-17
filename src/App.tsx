import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useAuthSession } from "@/hooks/useAuthSession";
import ProtectedRoutes from "@/components/routing/ProtectedRoutes";
import { useEnhancedRoleAccess } from "@/hooks/useEnhancedRoleAccess";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { session, loading: sessionLoading } = useAuthSession();
  const { isLoading: rolesLoading, error: rolesError } = useEnhancedRoleAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('App render state:', { 
    sessionLoading, 
    rolesLoading, 
    hasSession: !!session,
    currentPath: location.pathname,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (!sessionLoading) {
      console.log('Session check complete:', {
        hasSession: !!session,
        currentPath: location.pathname,
        timestamp: new Date().toISOString()
      });

      if (!session && location.pathname !== '/login') {
        console.log('No session detected, redirecting to login');
        navigate('/login', { replace: true });
      } else if (session && location.pathname === '/login') {
        console.log('Session detected on login page, redirecting to dashboard');
        navigate('/', { replace: true });
      }
    }
  }, [session, sessionLoading, navigate, location.pathname]);

  useEffect(() => {
    // Force role refresh when session changes
    if (session) {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    }
  }, [session]);

  if (rolesError) {
    console.error('Role loading error:', rolesError);
    toast({
      title: "Error loading roles",
      description: "There was a problem loading user roles. Please try again.",
      variant: "destructive",
    });
  }

  // Show loading state only during initial session check or when loading roles for authenticated users
  const showLoading = (sessionLoading || (session && rolesLoading)) && location.pathname !== '/login';
  
  if (showLoading) {
    console.log('Showing loading state:', {
      sessionLoading,
      rolesLoading,
      pathname: location.pathname
    });
    return (
      <div className="flex items-center justify-center min-h-screen bg-dashboard-dark">
        <Loader2 className="w-8 h-8 animate-spin text-dashboard-accent1" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoutes session={session} />} />
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;