import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, User, Shield, Clock, Check, XCircle } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
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
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useEnhancedRoleAccess } from "@/hooks/useEnhancedRoleAccess";
import { useRoleSync } from "@/hooks/useRoleSync";
import { useRoleStore } from "@/store/roleStore";

interface CollectorInfo {
  full_name: string;
  member_number: string;
  roles: string[];
  auth_user_id: string;
  role_details: {
    role: string;
    created_at: string;
  }[];
  email: string | null;
  phone: string | null;
  prefix: string | null;
  number: string | null;
}

const CollectorRolesList = () => {
  const { toast } = useToast();
  const { userRole, userRoles, roleLoading, error: roleError, permissions } = useRoleAccess();
  const { userRoles: enhancedRoles, isLoading: enhancedLoading } = useEnhancedRoleAccess();
  const { syncStatus, syncRoles } = useRoleSync();
  const roleStore = useRoleStore();

  const { data: collectors, isLoading, error } = useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      console.log('Fetching collectors and roles data...');
      
      try {
        const { data: activeCollectors, error: collectorsError } = await supabase
          .from('members_collectors')
          .select('member_number, name, email, phone, prefix, number')
          .eq('active', true);

        if (collectorsError) {
          console.error('Error fetching collectors:', collectorsError);
          throw collectorsError;
        }

        console.log('Active collectors:', activeCollectors);

        const collectorsWithRoles = await Promise.all(
          activeCollectors.map(async (collector) => {
            try {
              const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('full_name, member_number, auth_user_id')
                .eq('member_number', collector.member_number)
                .maybeSingle();

              if (memberError) {
                console.error('Error fetching member data:', memberError);
                throw memberError;
              }

              if (!memberData) {
                console.log(`No member found for collector ${collector.name}`);
                return null;
              }

              // Fetch enhanced roles
              const { data: enhancedRoles, error: enhancedError } = await supabase
                .from('enhanced_roles')
                .select('role_name, is_active, created_at')
                .eq('user_id', memberData.auth_user_id);

              if (enhancedError) {
                console.error('Error fetching enhanced roles:', enhancedError);
                throw enhancedError;
              }

              // Fetch sync status with maybeSingle() and default values
              const { data: syncData, error: syncError } = await supabase
                .from('sync_status')
                .select('*')
                .eq('user_id', memberData.auth_user_id)
                .maybeSingle();

              if (syncError && syncError.code !== 'PGRST116') {
                console.error('Error fetching sync status:', syncError);
                throw syncError;
              }

              // Create default sync status if none exists
              const defaultSyncStatus = {
                status: 'pending',
                store_status: 'ready',
                last_attempted_sync_at: new Date().toISOString(),
                store_error: null // Add the missing property
              };

              const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('role, created_at')
                .eq('user_id', memberData.auth_user_id)
                .order('created_at', { ascending: true });

              if (rolesError) {
                console.error('Error fetching roles:', rolesError);
                throw rolesError;
              }

              return {
                ...memberData,
                roles: roles?.map(r => r.role) || [],
                role_details: roles?.map(r => ({
                  role: r.role,
                  created_at: r.created_at
                })) || [],
                enhanced_roles: enhancedRoles || [],
                sync_status: syncData || defaultSyncStatus,
                email: collector.email,
                phone: collector.phone,
                prefix: collector.prefix,
                number: collector.number
              };
            } catch (err) {
              console.error('Error processing collector:', collector.member_number, err);
              toast({
                title: "Error loading collector data",
                description: `Could not load data for collector ${collector.member_number}`,
                variant: "destructive",
              });
              return null;
            }
          })
        );

        const validCollectors = collectorsWithRoles.filter(c => c !== null);
        console.log('Final collectors data:', validCollectors);
        return validCollectors;
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
            {collectors?.map((collector) => (
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
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {collector.roles.map((role, idx) => (
                        <Badge 
                          key={`${role}-${idx}`}
                          variant="outline"
                          className="bg-[#9B87F5] text-white border-0"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-[#9B87F5]">
                      Current Role: {userRole || 'Loading...'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[#F1F0FB]">
                  <div className="flex flex-col gap-1">
                    {collector.role_details.map((detail, idx) => (
                      <div key={idx} className="text-sm">
                        {detail.role}: {format(new Date(detail.created_at), 'PPp')}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    {collector.enhanced_roles?.map((role, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline"
                        className={`${
                          role.is_active 
                            ? 'bg-[#7EBF8E] text-white' 
                            : 'bg-[#8E9196] text-white'
                        } border-0`}
                      >
                        {role.role_name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm">
                      <span className="text-[#9B87F5]">Store Status: </span>
                      <Badge variant="outline" className={`
                        ${collector.sync_status?.store_status === 'ready' 
                          ? 'bg-[#7EBF8E]' 
                          : 'bg-[#8E9196]'
                        } text-white border-0`}
                      >
                        {collector.sync_status?.store_status || 'N/A'}
                      </Badge>
                    </div>
                    {collector.sync_status?.store_error && (
                      <div className="text-sm text-red-400">
                        Error: {collector.sync_status.store_error}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {collector.sync_status?.status === 'completed' ? (
                      <Check className="h-4 w-4 text-[#7EBF8E]" />
                    ) : collector.sync_status?.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-[#FFD700]" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm">
                      {collector.sync_status?.status || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    {permissions && Object.entries(permissions).map(([key, value]) => (
                      <Badge 
                        key={key}
                        variant="outline" 
                        className={value ? 'bg-[#7EBF8E] text-white border-0' : 'bg-[#8E9196] text-white border-0'}
                      >
                        {key}
                      </Badge>
                    ))}
                  </div>
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