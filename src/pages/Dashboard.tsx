import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

const Dashboard = () => {
  const { data: profile, isLoading, error } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error("Dashboard error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data. Please try again later.",
      });
    }
  }, [error, toast]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <p className="text-center text-red-500">
                {error instanceof Error ? error.message : "Error loading profile data. Please try again later."}
              </p>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a9eed] to-[#63b3ff] text-transparent bg-clip-text">
              My Profile
            </h1>
          </div>

          <ProfileCard profile={profile} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;