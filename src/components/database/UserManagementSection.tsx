import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserSearch } from "./UserSearch";
import { UserList } from "./UserList";
import { Member } from "@/types/member";

export function UserManagementSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: users, refetch } = useQuery({
    queryKey: ['members', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        // Only search email with ilike, and only match role if it exactly matches one of the valid roles
        if (['member', 'collector', 'admin'].includes(searchTerm.toLowerCase())) {
          query = query.or(`email.ilike.%${searchTerm}%,role.eq.${searchTerm.toLowerCase()}`);
        } else {
          // If search term isn't a valid role, only search in email
          query = query.ilike('email', `%${searchTerm}%`);
        }
      }

      const { data: members, error } = await query;

      if (error) {
        console.error('Error fetching members:', error);
        throw error;
      }

      return members as Member[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <UserSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          {users?.length ? (
            <UserList 
              users={users}
              onUpdate={refetch}
              updating={updating}
              setUpdating={setUpdating}
            />
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}