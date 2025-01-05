import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import DashboardView from '@/components/DashboardView';
import MembersList from '@/components/MembersList';
import CollectorsList from '@/components/CollectorsList';
import AuditLogsView from '@/components/AuditLogsView';
import SidePanel from '@/components/SidePanel';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, roleLoading, canAccessTab } = useRoleAccess();
  const queryClient = useQueryClient();

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        throw error;
      }

      if (!session) {
        console.log('No active session found, redirecting to login...');
        navigate('/login');
        return;
      }

      console.log('Active session found for user:', session.user.id);
    } catch (error: any) {
      console.error('Authentication check failed:', error);
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await queryClient.invalidateQueries();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!roleLoading && !canAccessTab(activeTab)) {
      setActiveTab('dashboard');
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access this section.",
        variant: "destructive",
      });
    }
  }, [activeTab, roleLoading, userRole]);

  const renderContent = () => {
    if (!canAccessTab(activeTab)) {
      return <DashboardView />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'users':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2 text-white">Members</h1>
              <p className="text-dashboard-muted">View and manage member information</p>
            </header>
            <MembersList searchTerm={searchTerm} userRole={userRole} />
          </>
        );
      case 'collectors':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2 text-white">Collectors</h1>
              <p className="text-dashboard-muted">View and manage collector information</p>
            </header>
            <CollectorsList />
          </>
        );
      case 'audit':
        return <AuditLogsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-dark flex flex-col">
      <div className="w-full bg-dashboard-card/50 py-4 flex justify-between items-center px-6 border-b border-white/10">
        {/* Mobile Menu Button - Moved inside header */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-dashboard-card/50 border-white/10"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center flex-1">
          <p className="text-xl text-white font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="text-sm text-dashboard-accent1 mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-dashboard-accent1 hover:text-white hover:bg-dashboard-card flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      
      <div className="flex flex-1 relative">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40 h-[calc(100vh-4rem)]
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
        `}>
          <SidePanel 
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }} 
            userRole={userRole} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;