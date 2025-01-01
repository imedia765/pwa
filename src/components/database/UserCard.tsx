import { UserCheck, Shield } from "lucide-react";
import { UserRoleButton } from "./UserRoleButton";
import { updateUserRole, createCollectorProfile } from "@/utils/roleManagement";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/roles";

interface UserCardProps {
  user: any;
  updating: string | null;
  setUpdating: (id: string | null) => void;
  onUpdate: () => void;
  onMakeCollector: (userId: string) => void;
}

export function UserCard({ user, updating, setUpdating, onUpdate, onMakeCollector }: UserCardProps) {
  const { toast } = useToast();
  const isAdmin = user.role === 'admin';
  const isCollector = user.role === 'collector';

  const handleMakeAdmin = async () => {
    try {
      setUpdating(user.id);
      await updateUserRole(user.id, 'admin');
      
      toast({
        title: "Role updated",
        description: "User has been made an admin",
        duration: 3000,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <p className="font-medium">{user.member_number || 'No Member Number'}</p>
        <p className="text-sm text-muted-foreground">
          Email: {user.email}
        </p>
        <p className="text-sm text-muted-foreground">
          Role: {user.role || 'None'}
        </p>
        <p className="text-sm text-muted-foreground">
          Created: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <UserRoleButton
          onClick={() => onMakeCollector(user.id)}
          disabled={updating === user.id}
          isActive={isCollector}
          icon={UserCheck}
          label="Collector"
        />
        <UserRoleButton
          onClick={handleMakeAdmin}
          disabled={updating === user.id}
          isActive={isAdmin}
          icon={Shield}
          label="Admin"
        />
      </div>
    </div>
  );
}