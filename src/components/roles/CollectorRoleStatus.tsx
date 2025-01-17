import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorRoleStatusProps {
  roles: UserRole[];
}

export const CollectorRoleStatus = ({ roles }: CollectorRoleStatusProps) => {
  const isCollector = roles.includes('collector');

  return (
    <Badge 
      variant={isCollector ? "default" : "outline"}
      className={isCollector ? "bg-dashboard-accent1" : ""}
    >
      {isCollector ? 'Collector' : 'Member'}
    </Badge>
  );
};