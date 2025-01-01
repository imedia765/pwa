import { ScrollArea } from "@/components/ui/scroll-area";
import { CollectorCard } from "./CollectorCard";

interface CollectorListProps {
  collectors: any[];
  expandedCollector: string | null;
  onToggleCollector: (id: string) => void;
  onEditCollector: (collector: { id: string; name: string }) => void;
  onUpdate: () => void;
  isLoading: boolean;
  searchTerm: string;
}

export function CollectorList({
  collectors,
  expandedCollector,
  onToggleCollector,
  onEditCollector,
  onUpdate,
  isLoading,
  searchTerm,
}: CollectorListProps) {
  // Filter collectors based on search term
  const filteredCollectors = collectors?.filter(collector => {
    const matchesName = collector.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNumber = collector.number.includes(searchTerm);
    const matchesPrefix = collector.prefix.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Count all members regardless of status
    const totalMembers = collector.members?.length || 0;
    
    // Special logging for MT05 and SH09
    if (collector.prefix === 'MT' && collector.number === '05') {
      console.log(`MT05 - ${collector.name} has ${totalMembers} total members`);
      if (totalMembers !== 168) {
        console.warn(`MT05 member count mismatch. Expected: 168, Got: ${totalMembers}`);
      }
    }
    
    if (collector.prefix === 'SH' && collector.number === '09') {
      console.log(`SH09 - ${collector.name} has ${totalMembers} total members`);
      if (totalMembers !== 90) {
        console.warn(`SH09 member count mismatch. Expected: 90, Got: ${totalMembers}`);
      }
    }
    
    return matchesName || matchesNumber || matchesPrefix;
  }) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading collectors...</div>
      </div>
    );
  }

  // Log total members for verification
  const totalMembers = collectors?.reduce((total, collector) => {
    return total + (collector.members?.length || 0);
  }, 0) || 0;
  
  console.log(`Total members across all collectors: ${totalMembers}`);

  if (filteredCollectors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">
          {searchTerm ? "No collectors found matching your search" : "No collectors found"}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-4">
        {filteredCollectors.map((collector) => (
          <CollectorCard
            key={collector.id}
            collector={collector}
            collectors={collectors}
            expandedCollector={expandedCollector}
            onToggle={onToggleCollector}
            onEdit={onEditCollector}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </ScrollArea>
  );
}