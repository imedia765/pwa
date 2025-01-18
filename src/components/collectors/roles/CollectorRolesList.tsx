import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import CollectorRoleCard from './CollectorRoleCard';
import RoleManagementDropdown from './RoleManagementDropdown';
import EnhancedRoleSection from './EnhancedRoleSection';
import SyncStatusIndicator from './SyncStatusIndicator';

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorInfo {
  auth_user_id: string;
  roles: UserRole[];
  enhanced_roles: Array<{
    role_name: string;
    is_active: boolean;
  }>;
  sync_status?: {
    status?: string;
    lastSync?: string;
  };
}

const CollectorRolesList = () => {
  const { toast } = useToast();

  const { data: collectors, isLoading, error } = useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      console.log('Fetching collectors and roles data...');
      
      try {
        const { data: activeCollectors, error: collectorsError } = await supabase
          .from('members_collectors')
          .select('*')
          .eq('active', true);

        if (collectorsError) throw collectorsError;

        const collectorsWithRoles = await Promise.all(
          activeCollectors.map(async (collector) => {
            const { data: memberData } = await supabase
              .from('members')
              .select('auth_user_id')
              .eq('member_number', collector.member_number)
              .maybeSingle();

            if (!memberData?.auth_user_id) return null;

            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', memberData.auth_user_id);

            const { data: enhancedRoles } = await supabase
              .from('enhanced_roles')
              .select('*')
              .eq('user_id', memberData.auth_user_id);

            return {
              ...collector,
              auth_user_id: memberData.auth_user_id,
              roles: roles?.map(r => r.role as UserRole) || [],
              enhanced_roles: enhancedRoles || [],
            };
          })
        );

        return collectorsWithRoles.filter((c): c is CollectorInfo & typeof c => c !== null);
      } catch (err) {
        console.error('Error in collector roles query:', err);
        throw err;
      }
    }
  });

  const handleRoleUpdate = (collector: CollectorInfo, role: UserRole, action: 'add' | 'remove') => {
    console.log(`Updating role for collector: ${collector.auth_user_id}, role: ${role}, action: ${action}`);
  };

  const handleEnhancedRoleUpdate = (collector: CollectorInfo, roleName: string, isActive: boolean) => {
    console.log(`Updating enhanced role: ${roleName}, active: ${isActive}`);
  };

  const handleSync = async (collector: CollectorInfo) => {
    if (!collector.roles) {
      toast({
        title: "Error syncing roles",
        description: "No roles found for collector",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.rpc('perform_user_roles_sync');
      if (error) throw error;
      
      toast({
        title: "Roles synchronized",
        description: "The collector's roles have been synchronized successfully.",
      });
    } catch (error) {
      toast({
        title: "Error syncing roles",
        description: error instanceof Error ? error.message : "An error occurred during synchronization",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span>Error loading collectors</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Collector</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Enhanced Roles</TableHead>
            <TableHead>Sync Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collectors?.map((collector) => (
            <TableRow key={collector.auth_user_id}>
              <TableCell>
                <CollectorRoleCard collector={collector} />
              </TableCell>
              <TableCell>
                <RoleManagementDropdown
                  collector={collector}
                  onRoleUpdate={(role, action) => handleRoleUpdate(collector, role, action)}
                />
              </TableCell>
              <TableCell>
                <EnhancedRoleSection
                  collector={collector}
                  onEnhancedRoleUpdate={(roleName, isActive) => 
                    handleEnhancedRoleUpdate(collector, roleName, isActive)
                  }
                />
              </TableCell>
              <TableCell>
                <SyncStatusIndicator
                  collector={collector}
                  onSync={() => handleSync(collector)}
                  syncStatus={collector.sync_status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CollectorRolesList;