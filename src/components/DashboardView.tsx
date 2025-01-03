import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MemberProfileCard from './MemberProfileCard';
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  onLogout: () => void;
}

const DashboardView = ({ onLogout }: DashboardViewProps) => {
  const { toast } = useToast();

  const { data: memberProfile, isError } = useQuery({
    queryKey: ['memberProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('Fetching profile for user:', user.id);
      
      // Get user's member number from metadata
      const memberNumber = user.user_metadata?.member_number;
      console.log('Member number from metadata:', memberNumber);

      if (!memberNumber) {
        console.log('No member number found in metadata');
        return null;
      }

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('member_number', memberNumber)
        .maybeSingle();

      if (error) {
        console.error('Error fetching member profile:', error);
        toast({
          title: "Error",
          description: "Failed to load member profile",
          variant: "destructive",
        });
        throw error;
      }

      if (!data) {
        console.log('No profile found for member number:', memberNumber);
        return null;
      }

      console.log('Profile found:', data);
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {isError && <p>Error loading member profile.</p>}
      {memberProfile && <MemberProfileCard memberProfile={memberProfile} />}
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default DashboardView;