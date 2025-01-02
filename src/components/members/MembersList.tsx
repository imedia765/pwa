import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateMemberDialog from "./CreateMemberDialog";
import EditMemberDialog from "./EditMemberDialog";

export const MembersList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { toast } = useToast();

  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session?.session?.user?.id;

      if (!currentUserId) {
        throw new Error("No authenticated user found");
      }

      // Get all members - RLS policies will handle access control
      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          member_number,
          full_name,
          email,
          phone,
          collector,
          status
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("members").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Member deleted successfully",
    });
    refetch();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading members...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading members. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="rounded-md border border-[#2a3040] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#2a3040]">
              <TableHead className="text-gray-300">Member Number</TableHead>
              <TableHead className="text-gray-300">Full Name</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Phone</TableHead>
              <TableHead className="text-gray-300">Collector</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id} className="hover:bg-[#252b3b]/50 border-[#2a3040]">
                <TableCell className="font-medium">{member.member_number}</TableCell>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.collector || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#2a3040] hover:bg-[#252b3b]"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#2a3040] hover:bg-[#252b3b] hover:text-red-400"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateMemberDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          refetch();
          setIsCreateOpen(false);
        }}
      />

      <EditMemberDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        member={selectedMember}
        onSuccess={() => {
          refetch();
          setIsEditOpen(false);
        }}
      />
    </div>
  );
};