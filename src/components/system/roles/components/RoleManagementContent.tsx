import { ScrollArea } from "@/components/ui/scroll-area";
import UserRoleCard from '../UserRoleCard';
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  member_number: string;
  role: UserRole;
  auth_user_id: string;
  user_roles: { role: UserRole }[];
}

interface RoleManagementContentProps {
  users: UserData[] | undefined;
  isLoading: boolean;
  page: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
}

export const RoleManagementContent = ({
  users,
  isLoading,
  page,
  handleScroll,
  handleRoleChange
}: RoleManagementContentProps) => {
  return (
    <ScrollArea 
      className="h-[600px]"
      onScroll={handleScroll}
    >
      {isLoading && page === 0 ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-accent1"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {users?.map((user) => (
            <UserRoleCard
              key={user.id}
              user={user}
              onRoleChange={handleRoleChange}
            />
          ))}
          {isLoading && page > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dashboard-accent1"></div>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );
};