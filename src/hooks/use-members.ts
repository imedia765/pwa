import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/components/members/types";

interface MembersData {
  members: Member[];
  totalCount: number;
}

export const useMembers = (page: number, searchTerm: string) => {
  return useQuery({
    queryKey: ['members', page, searchTerm],
    queryFn: async (): Promise<MembersData> => {
      console.log('Starting members fetch...', { page, searchTerm });
      
      try {
        // First get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          throw userError;
        }

        if (!user) {
          throw new Error('No authenticated user found');
        }

        console.log('Current user:', user.id);

        // Get the user's member record to check their role
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('role')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching member:', memberError);
          throw memberError;
        }

        if (!member) {
          throw new Error('No member found for user');
        }

        console.log('User member:', member);

        // Initialize query
        let query = supabase
          .from('members')
          .select(`
            *,
            collectors (
              id,
              name,
              prefix,
              number
            )
          `, { count: 'exact' });

        // If user is a collector, filter by their collector id
        if (member.role === 'collector') {
          console.log('User is a collector, checking collector assignment...');
          
          // Get the collector ID directly from the members table where this user is assigned
          const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('collector_id')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          if (memberError) {
            console.error('Error fetching member data:', memberError);
            throw memberError;
          }

          if (!memberData?.collector_id) {
            console.log('No collector_id found for user');
            return {
              members: [],
              totalCount: 0
            };
          }

          console.log('Found collector_id:', memberData.collector_id);
          query = query.eq('collector_id', memberData.collector_id);
        }

        // Apply search filter if searchTerm exists
        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%`);
        }

        // Get total count first
        const { count } = await query;
        const totalCount = count || 0;

        // Then get paginated data
        const from = page * 20;
        const to = Math.min(from + 19, totalCount - 1);
        
        // Only fetch if we have data in this range
        if (from <= totalCount) {
          const { data: members, error: membersError } = await query
            .range(from, to)
            .order('created_at', { ascending: false });

          if (membersError) {
            console.error('Error fetching members:', membersError);
            throw membersError;
          }

          console.log(`Found ${totalCount} total members, returning ${members?.length} for current page`);

          return {
            members: members || [],
            totalCount
          };
        }

        // Return empty result if page is out of range
        return {
          members: [],
          totalCount
        };
      } catch (error) {
        console.error('Error in useMembers hook:', error);
        throw error;
      }
    },
    meta: {
      errorMessage: "Failed to load members"
    }
  });
};