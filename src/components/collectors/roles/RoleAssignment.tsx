import { useState } from 'react';
import { Shield, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleAssignmentProps {
  currentRoles: UserRole[];
  onRoleChange: (role: UserRole, action: 'add' | 'remove') => Promise<void>;
  isLoading?: boolean;
}

export const RoleAssignment = ({ currentRoles, onRoleChange, isLoading = false }: RoleAssignmentProps) => {
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRoleChange = async (role: UserRole, action: 'add' | 'remove') => {
    setUpdatingRole(role);
    try {
      await onRoleChange(role, action);
      toast({
        title: `Role ${action === 'add' ? 'added' : 'removed'}`,
        description: `Successfully ${action === 'add' ? 'added' : 'removed'} ${role} role`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const availableRoles: UserRole[] = ['admin', 'collector', 'member'];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentRoles.map((role) => (
          <Badge 
            key={role}
            variant="outline"
            className="flex items-center gap-1 group hover:bg-destructive/10"
          >
            <Shield className="h-3 w-3" />
            {role}
            <button
              onClick={() => handleRoleChange(role, 'remove')}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isLoading || updatingRole === role}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableRoles.map((role) => (
            !currentRoles.includes(role) && (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleChange(role, 'add')}
                disabled={isLoading || updatingRole === role}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                {role}
              </DropdownMenuItem>
            )
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};