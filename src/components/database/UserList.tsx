import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CollectorDialog } from "./CollectorDialog";
import { UserCard } from "./UserCard";
import { updateUserRole, createCollectorProfile } from "@/utils/roleManagement";

interface UserListProps {
  users: any[];
  onUpdate: () => void;
  updating: string | null;
  setUpdating: (id: string | null) => void;
}

export function UserList({ users, onUpdate, updating, setUpdating }: UserListProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCollectorDialog, setShowCollectorDialog] = useState(false);

  const handleCollectorCreation = async (isNew: boolean, collectorName: string, collectorId: string) => {
    if (!selectedUserId) return;

    try {
      setUpdating(selectedUserId);
      
      // First update the user's role to collector
      await updateUserRole(selectedUserId, 'collector');

      // If creating a new collector profile
      if (isNew && collectorName) {
        const userEmail = users.find(u => u.id === selectedUserId)?.email;
        if (!userEmail) throw new Error('User email not found');
        
        await createCollectorProfile(selectedUserId, userEmail);
      }

      toast({
        title: "Success",
        description: isNew 
          ? "New collector created and role updated" 
          : "User role updated to collector",
        duration: 3000,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error creating collector:', error);
      toast({
        title: "Error",
        description: "Failed to create collector",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdating(null);
      setSelectedUserId(null);
      setShowCollectorDialog(false);
    }
  };

  const handleMakeCollector = (userId: string) => {
    setSelectedUserId(userId);
    setShowCollectorDialog(true);
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          updating={updating}
          setUpdating={setUpdating}
          onUpdate={onUpdate}
          onMakeCollector={handleMakeCollector}
        />
      ))}

      <CollectorDialog
        isOpen={showCollectorDialog}
        onClose={() => setShowCollectorDialog(false)}
        onConfirm={handleCollectorCreation}
        isLoading={!!updating}
      />
    </div>
  );
}