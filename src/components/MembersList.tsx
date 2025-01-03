import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MemberDetailsSection from './members/MemberDetailsSection';
import { useToast } from "@/components/ui/use-toast";

type Member = Database['public']['Tables']['members']['Row'];

interface MembersListProps {
  searchTerm: string;
  userRole: string | null;
}

const MembersList = ({ searchTerm, userRole }: MembersListProps) => {
  const { toast } = useToast();

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members', searchTerm, userRole],
    queryFn: async () => {
      console.log('Fetching members with role:', userRole);
      let query = supabase
        .from('members')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,collector.ilike.%${searchTerm}%`);
      }

      // If user is a collector, get their collector name first
      if (userRole === 'collector') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Getting collector name for user:', user.id);
          const { data: collectorData, error: collectorError } = await supabase
            .from('members_collectors')
            .select('name')
            .eq('member_profile_id', user.id)
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

          // Only filter by collector name if we found one
          if (collectorData?.name) {
            console.log('Filtering members for collector:', collectorData.name);
            query = query.eq('collector', collectorData.name);
          } else {
            console.log('No collector data found for user');
          }
        }
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to fetch members",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Fetched members count:', data?.length);
      return data as Member[];
    },
  });

  if (isLoading) return <div className="text-center py-4">Loading members...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error loading members: {error.message}</div>;
  if (!members?.length) return <div className="text-center py-4">No members found</div>;

  return (
    <ScrollArea className="h-[600px] w-full rounded-md">
      <Accordion type="single" collapsible className="space-y-4">
        {members.map((member) => (
          <AccordionItem 
            key={member.id} 
            value={member.id}
            className="bg-dashboard-card border-white/10 shadow-lg hover:border-dashboard-accent1/50 transition-all duration-300 p-6 rounded-lg border"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-6 w-full">
                <Avatar className="h-16 w-16 border-2 border-dashboard-accent1/20">
                  <AvatarFallback className="bg-dashboard-accent1/20 text-lg text-dashboard-accent1">
                    {member.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className="text-xl font-medium text-dashboard-accent2 mb-1">{member.full_name}</h3>
                    <p className="bg-dashboard-accent1/10 px-3 py-1 rounded-full inline-flex items-center">
                      <span className="text-dashboard-accent1">Member #</span>
                      <span className="text-dashboard-accent2 font-medium ml-1">{member.member_number}</span>
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    member.status === 'active' 
                      ? 'bg-dashboard-accent3/20 text-dashboard-accent3' 
                      : 'bg-dashboard-muted/20 text-dashboard-muted'
                  }`}>
                    {member.status || 'Pending'}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-dashboard-muted mb-1">Contact Information</p>
                  <p className="text-dashboard-text">{member.email || 'No email provided'}</p>
                  <p className="text-dashboard-text">{member.phone || 'No phone provided'}</p>
                </div>
                <div>
                  <p className="text-dashboard-muted mb-1">Address</p>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-dashboard-text">
                      {member.address || 'No address provided'}
                      {member.town && `, ${member.town}`}
                      {member.postcode && ` ${member.postcode}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <MemberDetailsSection member={member} userRole={userRole} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
};

export default MembersList;