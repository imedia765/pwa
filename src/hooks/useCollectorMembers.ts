import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";
import { useToast } from "@/hooks/use-toast";

export const useCollectorMembers = (searchTerm: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['collector_members', searchTerm],
    queryFn: async () => {
      console.log('Fetching members for collector');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Getting collector info for user:', user.id);
      
      // First get the member profile for the authenticated user
      const { data: memberProfile, error: memberError } = await supabase
        .from('members')
        .select('id, member_number')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching member profile:', memberError);
        throw memberError;
      }

      if (!memberProfile) {
        console.log('No member profile found for user');
        return [];
      }

      console.log('Found member profile:', memberProfile);
      
      // Then get the collector info using the member's ID
      const { data: collectorData, error: collectorError } = await supabase
        .from('members_collectors')
        .select('name')
        .eq('member_profile_id', memberProfile.id)
        .eq('active', true)
        .maybeSingle();

      if (collectorError) {
        console.error('Error fetching collector data:', collectorError);
        toast({
          title: "Error",
          description: "Failed to fetch collector information",
          variant: "destructive",
        });
        throw collectorError;
      }

      if (!collectorData?.name) {
        console.log('No collector data found for member');
        return [];
      }

      console.log('Found collector:', collectorData);
      
      // Query members table with collector filter using parameterized query
      let query = supabase
        .from('members')
        .select('*')
        .eq('collector', collectorData.name);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%`);
      }

      const { data: membersData, error: membersError } = await query.order('created_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching members:', membersError);
        toast({
          title: "Error",
          description: "Failed to fetch members",
          variant: "destructive",
        });
        throw membersError;
      }

      console.log('Found members for collector:', membersData?.length);
      return membersData as Member[];
    },
  });
};