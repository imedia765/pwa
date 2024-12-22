import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MemberTableRowProps {
  member: any;
  expandedMember: string | null;
  toggleMember: (id: string) => void;
  setActivatingMember: (member: any) => void;
  editingNotes: string | null;
  setEditingNotes: (id: string | null) => void;
  onUpdate: () => void;
}

export function MemberTableRow({
  member,
  expandedMember,
  toggleMember,
  setActivatingMember,
  editingNotes,
  setEditingNotes,
  onUpdate
}: MemberTableRowProps) {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    try {
      setIsResetting(true);
      console.log('Starting member reset for:', member.id);

      const { error } = await supabase
        .from('members')
        .update({
          password_changed: false,
          email_verified: false,
          profile_updated: false,
          first_time_login: true,
          profile_completed: false,
          registration_completed: false,
          default_password_hash: null,
          auth_user_id: null
        })
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "Member Reset Successfully",
        description: "Member has been reset to factory settings",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error resetting member:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>{member.member_number || 'Pending'}</TableCell>
        <TableCell>{member.full_name}</TableCell>
        <TableCell>{member.email || 'Not set'}</TableCell>
        <TableCell>
          <Badge variant={member.password_changed ? "success" : "destructive"}>
            {member.password_changed ? 'Updated' : 'Not Updated'}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge 
            variant={
              member.status === 'active' ? "success" : 
              member.status === 'suspended' ? "warning" : 
              member.status === 'deceased' ? "secondary" : 
              "destructive"
            }
          >
            {member.status || 'Unknown'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleMember(member.id)}
            >
              {expandedMember === member.id ? "Less Info" : "More Info"}
            </Button>

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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isResetting}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset the member to factory settings. They will need to:
                    <ul className="list-disc pl-6 mt-2">
                      <li>Change their password again</li>
                      <li>Verify their email</li>
                      <li>Update their profile</li>
                      <li>Complete registration</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Reset Member
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>

      {expandedMember === member.id && (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="p-4 space-y-2 bg-muted/50 rounded-lg">
              <p><strong>Phone:</strong> {member.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {member.address || 'N/A'}</p>
              <p><strong>Town:</strong> {member.town || 'N/A'}</p>
              <p><strong>Postcode:</strong> {member.postcode || 'N/A'}</p>
              <p><strong>Collector:</strong> {member.collector || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {member.date_of_birth || 'N/A'}</p>
              <p><strong>Gender:</strong> {member.gender || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {member.marital_status || 'N/A'}</p>
              <p><strong>Membership Type:</strong> {member.membership_type || 'Standard'}</p>
              <p><strong>Registration Status:</strong></p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={member.email_verified ? "success" : "destructive"}>
                    {member.email_verified ? "Email Verified" : "Email Not Verified"}
                  </Badge>
                  <Badge variant={member.profile_updated ? "success" : "destructive"}>
                    {member.profile_updated ? "Profile Updated" : "Profile Not Updated"}
                  </Badge>
                  <Badge variant={member.registration_completed ? "success" : "destructive"}>
                    {member.registration_completed ? "Registration Complete" : "Registration Incomplete"}
                  </Badge>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}