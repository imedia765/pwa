import { Badge } from "@/components/ui/badge";

interface CollectorRoleStatusProps {
  roles: string[];
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