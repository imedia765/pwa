import { Button } from "@/components/ui/button";
import type { MemberSearchResult } from "./types";

interface MemberSearchResultsProps {
  members: MemberSearchResult[];
  onSelect: (member: MemberSearchResult) => void;
  collectorId?: string | null;
}

export function MemberSearchResults({ members, onSelect, collectorId }: MemberSearchResultsProps) {
  // Filter members to only show those assigned to the collector
  const filteredMembers = collectorId 
    ? members.filter(member => member.collector_id === collectorId)
    : members;

  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No members found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredMembers.map((member) => (
        <Button
          key={member.id}
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => onSelect(member)}
        >
          <div>
            <div className="font-medium">{member.full_name}</div>
            <div className="text-sm text-muted-foreground">
              {member.member_number}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}