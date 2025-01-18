import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SyncStatusIndicatorProps {
  collector: {
    member_number: string;
  };
  onSync: () => void;
  syncStatus: {
    status?: string;
    lastSync?: string;
  } | null;
}

const SyncStatusIndicator = ({ collector, onSync, syncStatus }: SyncStatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={syncStatus?.status === 'completed' ? 'default' : 'secondary'}
      >
        {syncStatus?.status || 'Not synced'}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSync}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SyncStatusIndicator;