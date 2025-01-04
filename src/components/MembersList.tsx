import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import TotalCount from './TotalCount';
import { Users } from 'lucide-react';
import { useCollectorMembers } from '@/hooks/useCollectorMembers';
import MemberListItem from './members/MemberListItem';
import { Member } from '@/types/member';

interface MembersListProps {
  searchTerm: string;
  userRole: string | null;
}

const MembersList = ({ searchTerm, userRole }: MembersListProps) => {
  const { toast } = useToast();
  const collectorMembers = useCollectorMembers(searchTerm);

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members', searchTerm, userRole],
    queryFn: async () => {
      console.log('Fetching members with role:', userRole);
      
      if (userRole === 'collector') {
        return collectorMembers.data || [];
      }

      // For admin users, fetch all members
      let query = supabase.from('members').select('*');
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,collector.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to fetch members",
          variant: "destructive",
        });
        throw error;
      }

      return data as Member[];
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading members...</div>;
  if (error) return (
    <div className="text-center py-4 text-red-500">
      Error loading members: {error instanceof Error ? error.message : 'Unknown error'}
    </div>
  );
  if (!members?.length) return (
    <div className="text-center py-4 text-yellow-500">
      No members found. Please check your collector permissions or try refreshing the page.
    </div>
  );

  return (
    <div className="space-y-4">
      <TotalCount 
        items={[
          {
            count: members.length,
            label: "Total Members",
            icon: <Users className="w-6 h-6 text-blue-400" />
          }
        ]}
      />
      <ScrollArea className="h-[800px] w-full rounded-md">
        <Accordion type="single" collapsible className="space-y-4">
          {members.map((member) => (
            <MemberListItem 
              key={member.id}
              member={member}
              userRole={userRole}
            />
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default MembersList;