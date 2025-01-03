import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { UserCheck, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TotalCount from "@/components/TotalCount";
import CollectorMembers from "@/components/CollectorMembers";
import PrintButtons from "@/components/PrintButtons";
import { PostgrestError } from '@supabase/supabase-js';
import CollectorStatusBadge from './collectors/CollectorStatusBadge';
import CollectorMemberInfo from './collectors/CollectorMemberInfo';

type MemberCollector = Database['public']['Tables']['members_collectors']['Row'];
type Member = Database['public']['Tables']['members']['Row'];

const CollectorsList = () => {
  const { data: allMembers } = useQuery({
    queryKey: ['all_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('member_number', { ascending: true });
      
      if (error) throw error;
      return data as Member[];
    },
  });

  const { data: collectors, isLoading: collectorsLoading, error: collectorsError } = useQuery({
    queryKey: ['members_collectors'],
    queryFn: async () => {
      console.log('Fetching collectors from members_collectors...');
      const { data: collectorsData, error: collectorsError } = await supabase
        .from('members_collectors')
        .select(`
          id,
          name,
          prefix,
          number,
          email,
          phone,
          active,
          created_at,
          updated_at,
          member_profile_id
        `)
        .order('number', { ascending: true });
      
      if (collectorsError) {
        console.error('Error fetching collectors:', collectorsError);
        throw collectorsError;
      }

      console.log('Collectors data received:', collectorsData);

      if (!collectorsData || collectorsData.length === 0) {
        console.log('No collectors found in the database');
        return [];
      }

      const collectorsWithDetails = await Promise.all(collectorsData.map(async (collector) => {
        console.log('Processing collector:', collector.name);
        
        // Get member count
        const { count } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('collector', collector.name);

        // Get member number if profile exists
        let memberNumber = null;
        if (collector.member_profile_id) {
          console.log('Fetching member details for collector:', collector.name);
          const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('member_number')
            .eq('id', collector.member_profile_id)
            .maybeSingle();
          
          if (memberError) {
            console.error('Error fetching member details:', memberError);
          } else if (memberData) {
            console.log('Found member number for collector:', memberData.member_number);
            memberNumber = memberData.member_number;
          } else {
            console.log('No member data found for collector:', collector.name);
          }
        } else {
          console.log('Collector has no member profile:', collector.name);
        }
        
        return {
          ...collector,
          memberCount: count || 0,
          memberNumber
        };
      }));

      console.log('Final collectors with details:', collectorsWithDetails);
      return collectorsWithDetails;
    },
  });

  const totalMembers = collectors?.reduce((total, collector) => total + (collector.memberCount || 0), 0) || 0;

  if (collectorsLoading) return <div className="text-center py-4">Loading collectors...</div>;
  if (collectorsError) {
    console.error('Collectors error:', collectorsError);
    const postgrestError = collectorsError as PostgrestError;
    return (
      <div className="text-center py-4 text-red-500">
        Error loading collectors: {postgrestError.message}
      </div>
    );
  }
  if (!collectors?.length) return <div className="text-center py-4">No collectors found.</div>;

  return (
    <div className="space-y-4">
      <TotalCount 
        items={[
          {
            count: totalMembers,
            label: "Total Members",
            icon: <Users className="w-6 h-6 text-blue-400" />
          },
          {
            count: collectors.length,
            label: "Total Collectors",
            icon: <UserCheck className="w-6 h-6 text-purple-400" />
          }
        ]}
      />
      <div className="flex justify-end mb-4">
        <PrintButtons allMembers={allMembers} />
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {collectors.map((collector) => (          
          <AccordionItem
            key={collector.id}
            value={collector.id}
            className="bg-dashboard-card border border-white/10 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dashboard-accent1 flex items-center justify-center text-white font-medium">
                    {collector.prefix}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{collector.name}</p>
                      <span className="text-sm text-gray-400">#{collector.number}</span>
                      <CollectorMemberInfo memberNumber={collector.memberNumber} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-dashboard-text">
                      <UserCheck className="w-4 h-4" />
                      <span>Collector</span>
                      <span className="text-purple-400">({collector.memberCount} members)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PrintButtons collectorName={collector.name || ''} />
                  <CollectorStatusBadge active={collector.active} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 mt-2">
                {collector.memberCount > 0 ? (
                  <CollectorMembers collectorName={collector.name || ''} />
                ) : (
                  <p className="text-sm text-gray-400">No members assigned to this collector</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CollectorsList;