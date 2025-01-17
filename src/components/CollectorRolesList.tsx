import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CollectorRoleAssignment } from './roles/CollectorRoleAssignment';
import { CollectorRoleStatus } from './roles/CollectorRoleStatus';

interface CollectorInfo {
  full_name: string;
  member_number: string;
  roles: string[];
  auth_user_id: string;
  id: string;
}

const CollectorRolesList = () => {
  const { data: collectors, isLoading, refetch } = useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      console.log('Fetching collectors and roles data...');
      
      try {
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('id, full_name, member_number, auth_user_id')
          .order('created_at', { ascending: false });

        if (membersError) throw membersError;

        // Get roles for each member
        const membersWithRoles = await Promise.all(
          (members || []).map(async (member) => {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', member.auth_user_id);

            return {
              ...member,
              roles: roles?.map(r => r.role) || []
            };
          })
        );

        return membersWithRoles;
      } catch (err) {
        console.error('Error in collector roles query:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-dashboard-softBlue" />
      </div>
    );
  }

  if (!collectors || collectors.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No collectors found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {collectors.map((collector) => (
        <Card key={collector.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">{collector.full_name}</h3>
              <p className="text-sm text-gray-500">{collector.member_number}</p>
            </div>
            <div className="flex items-center gap-4">
              <CollectorRoleStatus roles={collector.roles} />
              {!collector.roles.includes('collector') && (
                <CollectorRoleAssignment
                  userId={collector.id}
                  memberNumber={collector.member_number}
                  onSuccess={refetch}
                />
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CollectorRolesList;