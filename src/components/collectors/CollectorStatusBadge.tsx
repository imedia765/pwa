import { cn } from "@/lib/utils";

interface CollectorStatusBadgeProps {
  active: boolean | null;
}

const CollectorStatusBadge = ({ active }: CollectorStatusBadgeProps) => {
  return (
    <div className={cn(
      "px-3 py-1 rounded-full",
      active 
        ? "bg-green-500/20 text-green-400" 
        : "bg-gray-500/20 text-gray-400"
    )}>
      {active ? 'Active' : 'Inactive'}
    </div>
  );
};

export default CollectorStatusBadge;