import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";
import MembershipInfo from "./MembershipInfo";
import RoleSelector from "./RoleSelector";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AssignCollectorForm from "../collectors/AssignCollectorForm";
import { useQueryClient } from "@tanstack/react-query";

type AppRole = 'admin' | 'collector' | 'member';

interface MemberDetailsSectionProps {
  member: Member;
  userRole: string | null;
}

const MemberDetailsSection = ({ member, userRole }: MemberDetailsSectionProps) => {
  const [showCollectorForm, setShowCollectorForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRoleChange = async (newRole: string) => {
    if (!member.auth_user_id) {
      toast({
        title: "Error",
        description: "User ID is required to update role",
        variant: "destructive",
      });
      return;
    }

    // Validate that the new role is a valid AppRole
    if (!['admin', 'collector', 'member'].includes(newRole)) {
      toast({
        title: "Error",
        description: "Invalid role selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: member.auth_user_id,
          role: newRole as AppRole
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role updated to ${newRole}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['members'] });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {userRole === 'admin' && member.auth_user_id ? (
        <>
          <MembershipInfo member={member} currentRole={member.role} />
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-dashboard-muted mb-2">Role Management</h3>
                <RoleSelector
                  currentRole={member.role || 'member'}
                  onRoleChange={handleRoleChange}
                />
              </div>
              {!member.collector && (
                <div>
                  <Button
                    onClick={() => setShowCollectorForm(true)}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign as Collector
                  </Button>
                </div>
              )}
            </div>
            
            {showCollectorForm && (
              <div className="mt-4">
                <AssignCollectorForm 
                  memberId={member.id} 
                  onSuccess={() => {
                    setShowCollectorForm(false);
                    queryClient.invalidateQueries({ queryKey: ['members'] });
                  }}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <MembershipInfo member={member} currentRole={member.role} />
      )}
    </div>
  );
};

export default MemberDetailsSection;