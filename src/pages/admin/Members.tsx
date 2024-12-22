import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MemberCard } from "@/components/members/MemberCard";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MembersSearch } from "@/components/members/MembersSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoveredMembersOverview } from "@/components/members/CoveredMembersOverview";
import { MembersPagination } from "@/components/members/MembersPagination";
import { useMembers } from "@/hooks/use-members";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ActivateMemberDialog } from "@/components/database/ActivateMemberDialog";
import { MemberTableRow } from "@/components/members/MemberTableRow";
import { MemberTableHeader } from "@/components/members/MemberTableHeader";

const ITEMS_PER_PAGE = 20;

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [activatingMember, setActivatingMember] = useState<any | null>(null);
  const [showPending, setShowPending] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useMembers(page, searchTerm);

  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['members'] });
  }, [queryClient]);

  const toggleMember = useCallback((id: string) => {
    setExpandedMember(prev => prev === id ? null : id);
  }, []);

  const totalPages = Math.ceil((data?.totalCount || 0) / ITEMS_PER_PAGE);

  if (error) {
    console.error('Members component error:', error);
    return (
      <div className="space-y-6">
        <MembersHeader />
        <div className="text-center text-red-500 py-4">
          Failed to load members. Please try again later.
        </div>
      </div>
    );
  }

  const filteredMembers = data?.members?.filter(member => {
    if (showPending) {
      return !member.member_number || member.member_number === '' || member.status === 'pending';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <MembersHeader />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <MembersSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            isLoading={isLoading}
          />
          <Button
            variant={showPending ? "secondary" : "outline"}
            onClick={() => setShowPending(!showPending)}
            className="ml-2"
          >
            {showPending ? "Show All" : "Show Pending Members"}
          </Button>
        </div>
          
        {data?.members && (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              Total Members: {data.totalCount}
            </div>
            <CoveredMembersOverview members={data.members} />
          </>
        )}

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="rounded-md border">
            <Table>
              <MemberTableHeader />
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading members...</TableCell>
                  </TableRow>
                ) : !filteredMembers?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No members found</TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <MemberTableRow
                      key={member.id}
                      member={member}
                      expandedMember={expandedMember}
                      toggleMember={toggleMember}
                      setActivatingMember={setActivatingMember}
                      editingNotes={editingNotes}
                      setEditingNotes={setEditingNotes}
                      onUpdate={handleUpdate}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <MembersPagination 
            page={page}
            totalPages={totalPages}
            isLoading={isLoading}
            setPage={setPage}
          />
        </ScrollArea>
      </div>

      {activatingMember && (
        <ActivateMemberDialog
          member={activatingMember}
          isOpen={true}
          onClose={() => setActivatingMember(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}