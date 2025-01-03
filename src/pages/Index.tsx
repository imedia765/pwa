import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SidePanel from "@/components/SidePanel";
import DashboardView from "@/components/DashboardView";
import CollectorsList from "@/components/CollectorsList";
import SettingsView from "@/components/settings/SettingsView";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useToast } from "@/hooks/use-toast";
import MembersList from "@/components/MembersList";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const { userRole, roleLoading } = useRoleAccess();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (roleLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab, 'User role:', userRole);
    
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onLogout={handleLogout} />;
      case "users":
        return (
          <div className="p-6">
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <MembersList searchTerm={searchTerm} userRole={userRole} />
          </div>
        );
      case "collectors":
        return <CollectorsList />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView onLogout={handleLogout} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <SidePanel onTabChange={setActiveTab} userRole={userRole} />
      <main className="flex-1 ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;