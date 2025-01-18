import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, User, Shield, RefreshCw } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useEnhancedRoleAccess } from '@/hooks/useEnhancedRoleAccess';
import { useRoleSync } from '@/hooks/useRoleSync';
import { RoleAssignment } from './collectors/roles/RoleAssignment';
import { PermissionsDisplay } from './collectors/roles/PermissionsDisplay';
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

const isValidRole = (role: string): role is UserRole => {
  return ['admin', 'collector', 'member'].includes(role);
};

interface SyncStatus {
  id: string;
  user_id: string;
  sync_started_at: string;
  last_attempted_sync_at: string;
  status: string;
  error_message: string;
  store_status: string;
  store_error: string;
}

interface CollectorInfo {
  full_name: string;
  member_number: string;
  roles: UserRole[];
  auth_user_id: string;
  role_details: {
    role: UserRole;
    created_at: string;
  }[];
  email: string | null;
  phone: string | null;
  prefix: string | null;
  number: string | null;
  enhanced_roles: {
    role_name: string;
    is_active: boolean;
  }[];
  sync_status?: SyncStatus;
}

export const CollectorRolesList = () => {
  const { toast } = useToast();
  const { userRole, userRoles, roleLoading, error: roleError, permissions } = useRoleAccess();
  const { userRoles: enhancedRoles, isLoading: enhancedLoading } = useEnhancedRoleAccess();
  const { syncStatus, syncRoles } = useRoleSync();

  const { data: collectors = [], isLoading, error } = useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      console.log('Fetching collectors and roles data...');
      
      try {
        const { data: activeCollectors, error: collectorsError } = await supabase
          .from('members_collectors')
          .select('member_number, name, email, phone, prefix, number')
          .eq('active', true);

        if (collectorsError) throw collectorsError;

        const collectorsWithRoles = await Promise.all(
          (activeCollectors || []).map(async (collector) => {
            const { data: memberData, error: memberError } = await supabase
              .from('members')
              .select('full_name, member_number, auth_user_id')
              .eq('member_number', collector.member_number)
              .maybeSingle();

            if (memberError) throw memberError;
            if (!memberData) return null;

            const { data: roles, error: rolesError } = await supabase
              .from('user_roles')
              .select('role, created_at')
              .eq('user_id', memberData.auth_user_id)
              .order('created_at', { ascending: true });

            if (rolesError) throw rolesError;

            // Validate and type-cast roles
            const typedRoles = (roles || [])
              .map(r => r.role)
              .filter(isValidRole);

            const typedRoleDetails = (roles || [])
              .filter(r => isValidRole(r.role))
              .map(r => ({
                role: r.role as UserRole,
                created_at: r.created_at
              }));

            const { data: enhancedRoles, error: enhancedError } = await supabase
              .from('enhanced_roles')
              .select('role_name, is_active')
              .eq('user_id', memberData.auth_user_id);

            if (enhancedError) throw enhancedError;

            const { data: syncStatus, error: syncError } = await supabase
              .from('sync_status')
              .select('*')
              .eq('user_id', memberData.auth_user_id)
              .maybeSingle();

            if (syncError) throw syncError;

            const collectorInfo: CollectorInfo = {
              ...memberData,
              roles: typedRoles,
              role_details: typedRoleDetails,
              email: collector.email,
              phone: collector.phone,
              prefix: collector.prefix,
              number: collector.number,
              enhanced_roles: enhancedRoles || [],
              sync_status: syncStatus || undefined
            };

            return collectorInfo;
          })
        );

        return collectorsWithRoles.filter((c): c is CollectorInfo => c !== null);
      } catch (err) {
        console.error('Error in collector roles query:', err);
        toast({
          title: "Error loading collectors",
          description: "There was a problem loading the collectors list",
          variant: "destructive",
        });
        throw err;
      }
    }
  });

  const handleRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    if (!isValidRole(role)) {
      toast({
        title: "Invalid role",
        description: "The specified role is not valid",
        variant: "destructive",
      });
      return;
    }

    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }
      
      toast({
        title: "Role updated",
        description: `Successfully ${action}ed ${role} role`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (userId: string) => {
    try {
      await syncRoles([userId]);
      toast({
        title: "Sync initiated",
        description: "Role synchronization process has started",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "An error occurred during sync",
        variant: "destructive",
      });
    }
  };

  if (error || roleError) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span>Error loading collectors</span>
      </div>
    );
  }

  if (isLoading || roleLoading || enhancedLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#F2FCE2]">Active Collectors and Roles</h2>
        <Badge variant="outline" className="text-[#D3E4FD]">
          {collectors?.length || 0} Collectors
        </Badge>
      </div>

      <Card className="p-6 bg-dashboard-card border-dashboard-cardBorder">
        <Table>
          <TableHeader>
            <TableRow className="border-dashboard-cardBorder hover:bg-dashboard-card/50">
              <TableHead className="text-[#F2FCE2]">Collector</TableHead>
              <TableHead className="text-[#F2FCE2]">Member #</TableHead>
              <TableHead className="text-[#F2FCE2]">Contact Info</TableHead>
              <TableHead className="text-[#F2FCE2]">Roles & Access</TableHead>
              <TableHead className="text-[#F2FCE2]">Role History</TableHead>
              <TableHead className="text-[#F2FCE2]">Enhanced Role Status</TableHead>
              <TableHead className="text-[#F2FCE2]">Role Store Status</TableHead>
              <TableHead className="text-[#F2FCE2]">Sync Status</TableHead>
              <TableHead className="text-[#F2FCE2]">Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectors.map((collector) => (
              <TableRow 
                key={collector.member_number}
                className="border-dashboard-cardBorder hover:bg-dashboard-card/50"
              >
                <TableCell className="font-medium text-[#F3F3F3]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-dashboard-accent1" />
                    {collector.full_name}
                  </div>
                </TableCell>
                <TableCell className="text-[#D6BCFA]">
                  <div className="flex flex-col">
                    <span>{collector.member_number}</span>
                    <span className="text-sm text-[#9B87F5]">{collector.prefix}-{collector.number}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#F3F3F3]">
                  <div className="flex flex-col">
                    <span>{collector.email}</span>
                    <span>{collector.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleAssignment
                    currentRoles={collector.roles}
                    onRoleChange={(role, action) => handleRoleChange(collector.auth_user_id, role, action)}
                    isLoading={roleLoading}
                  />
                </TableCell>
                <TableCell className="text-[#F1F0FB]">
                  <div className="flex flex-col gap-1">
                    {collector.role_details.map((detail, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        {detail.role}: {format(new Date(detail.created_at), 'PPp')}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {collector.enhanced_roles.map((role, idx) => (
                      <Badge 
                        key={idx}
                        variant={role.is_active ? "default" : "secondary"}
                        className="mr-1"
                      >
                        {role.role_name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={collector.sync_status?.store_status === 'ready' ? 'default' : 'secondary'}>
                    {collector.sync_status?.store_status || 'N/A'}
                  </Badge>
                  {collector.sync_status?.store_error && (
                    <div className="text-sm text-red-500 mt-1">
                      {collector.sync_status.store_error}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={collector.sync_status?.status === 'completed' ? 'default' : 'secondary'}>
                      {collector.sync_status?.status || 'pending'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(collector.auth_user_id)}
                      className="ml-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <PermissionsDisplay permissions={permissions} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CollectorRolesList;
