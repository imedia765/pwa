import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserSearch } from "./UserSearch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ActivateMemberDialog } from "./ActivateMemberDialog";

interface Member {
  id: string;
  full_name: string;
  member_number: string;
  password_changed: boolean;
  email: string | null;
  status: string;
}

export function UserManagementSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPending, setShowPending] = useState(false);
  const [activatingMember, setActivatingMember] = useState<Member | null>(null);

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['members', searchTerm, showPending],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (showPending) {
        query = query.or('member_number.is.null,member_number.eq.');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching members:', error);
        throw error;
      }

      return data as Member[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <UserSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <Button
              variant={showPending ? "secondary" : "outline"}
              onClick={() => setShowPending(!showPending)}
              className="ml-2"
            >
              {showPending ? "Show All" : "Show Pending"}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : members?.length ? (
            <ScrollArea className="h-[600px] rounded-md border">
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Password Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.member_number || 'Pending'}</TableCell>
                        <TableCell>{member.full_name}</TableCell>
                        <TableCell>{member.email || 'Not set'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={member.password_changed ? "success" : "destructive"}
                          >
                            {member.password_changed ? 'Updated' : 'Not Updated'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(!member.member_number || member.status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => setActivatingMember(member)}
                              className="flex items-center gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Activate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No members found
            </div>
          )}
        </div>
      </CardContent>

      {activatingMember && (
        <ActivateMemberDialog
          member={activatingMember}
          isOpen={true}
          onClose={() => setActivatingMember(null)}
          onUpdate={refetch}
        />
      )}
    </Card>
  );
}