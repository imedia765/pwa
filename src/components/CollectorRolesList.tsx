import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, User, Shield, Clock, Activity, Database, RefreshCw, HardDrive } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useEnhancedRoleAccess } from "@/hooks/useEnhancedRoleAccess";
import { useRoleSync } from "@/hooks/useRoleSync";
import { useRoleStore } from "@/store/roleStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CollectorInfo {
  full_name: string;
  member_number: string;
  roles: string[];
  auth_user_id: string;
  role_details: {
    role: string;
    created_at: string;
  }[];
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
        // First get active collectors
        const { data: activeCollectors, error: collectorsError } = await supabase
          .from('members_collectors')
          .select('member_number, name')
          .eq('active', true);

        if (collectorsError) {
          console.error('Error fetching collectors:', collectorsError);
          throw collectorsError;
        }

        console.log('Active collectors:', activeCollectors);

        // Then get member details and roles for each collector
        const collectorsWithRoles = await Promise.all(
          activeCollectors.map(async (collector) => {
            try {
              // Get member data
              const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('full_name, member_number, auth_user_id')
                .eq('member_number', collector.member_number)
                .single();

              if (memberError) {
                console.error('Error fetching member data:', memberError);
                throw memberError;
              }

              console.log('Member data:', memberData);

              // Get user roles with creation timestamp
              const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('role, created_at')
                .eq('user_id', memberData.auth_user_id)
                .order('created_at', { ascending: true });

              if (rolesError) {
                console.error('Error fetching roles:', rolesError);
                throw rolesError;
              }

              console.log('User roles:', roles);

              return {
                full_name: memberData.full_name,
                member_number: memberData.member_number,
                auth_user_id: memberData.auth_user_id,
                roles: roles?.map(r => r.role) || [],
                role_details: roles?.map(r => ({
                  role: r.role,
                  created_at: r.created_at
                })) || []
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

        // Filter out any null results from errors
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
        <h2 className="text-2xl font-semibold text-white">Active Collectors and Roles</h2>
        <Badge variant="outline" className="text-dashboard-accent1">
          {collectors?.length || 0} Collectors
        </Badge>
      </div>

      <div className="grid gap-6">
        {collectors?.map((collector) => (
          <Card key={collector.member_number} className="overflow-hidden">
            <div className="p-6 bg-dashboard-card border-dashboard-cardBorder">
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-dashboard-accent1" />
                      <h3 className="text-lg font-medium text-white">{collector.full_name}</h3>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-dashboard-softBlue">Member #: {collector.member_number}</span>
                      <span className="font-mono text-xs text-dashboard-softBlue">ID: {collector.auth_user_id}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-dashboard-cardBorder" />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-dashboard-softBlue">Role</TableHead>
                      <TableHead className="text-dashboard-softBlue">Assigned Date</TableHead>
                      <TableHead className="text-dashboard-softBlue">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collector.role_details.map((roleDetail, index) => (
                      <TableRow key={`${roleDetail.role}-${index}`}>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className="bg-dashboard-accent1/10 text-dashboard-softBlue border-dashboard-accent1/20"
                          >
                            {roleDetail.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-dashboard-softBlue">
                          {format(new Date(roleDetail.created_at), 'PPp')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="bg-dashboard-accent3/10 text-dashboard-softGreen border-dashboard-accent3/20"
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Accordion type="single" collapsible className="w-full">
                  {/* Role Access Status */}
                  <AccordionItem value="roleAccess">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-dashboard-accent3" />
                        <span className="text-dashboard-softBlue">Role Access Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-dashboard-softBlue">Current Role:</span>
                          <Badge variant="outline" className="text-dashboard-softBlue">{userRole}</Badge>
                          <span className="text-dashboard-softBlue">Loading:</span>
                          <Badge variant={roleLoading ? "destructive" : "secondary"} className="text-dashboard-softBlue">
                            {roleLoading ? "Loading" : "Ready"}
                          </Badge>
                          <span className="text-dashboard-softBlue">Permissions:</span>
                          <div className="space-y-1">
                            {Object.entries(permissions).map(([key, value]) => (
                              <Badge 
                                key={key}
                                variant={value ? "secondary" : "outline"}
                                className="mr-1 text-dashboard-softBlue"
                              >
                                {key}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Enhanced Role Status */}
                  <AccordionItem value="enhancedAccess">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-dashboard-accent4" />
                        <span className="text-dashboard-softBlue">Enhanced Role Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-dashboard-softBlue">Query Status:</span>
                          <Badge variant={enhancedLoading ? "destructive" : "secondary"}>
                            {enhancedLoading ? "Loading" : "Ready"}
                          </Badge>
                          <span className="text-dashboard-softBlue">Enhanced Roles:</span>
                          <div className="space-y-1">
                            {enhancedRoles?.map((role) => (
                              <Badge 
                                key={role}
                                variant="outline"
                                className="mr-1"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Role Sync Status */}
                  <AccordionItem value="roleSync">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-dashboard-accent5" />
                        <span className="text-dashboard-softBlue">Role Sync Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-dashboard-softBlue">Sync Status:</span>
                          <Badge variant={syncStatus ? "secondary" : "outline"}>
                            {syncStatus ? "Synced" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Role Store Status */}
                  <AccordionItem value="roleStore">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-dashboard-accent6" />
                        <span className="text-dashboard-softBlue">Role Store Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-dashboard-softBlue">Store Status:</span>
                          <Badge variant={roleStore.isLoading ? "destructive" : "secondary"}>
                            {roleStore.isLoading ? "Loading" : "Ready"}
                          </Badge>
                          <span className="text-dashboard-softBlue">Store Error:</span>
                          <Badge variant={roleStore.error ? "destructive" : "secondary"}>
                            {roleStore.error ? "Error" : "None"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollectorRolesList;
