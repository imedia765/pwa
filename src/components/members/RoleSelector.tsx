import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const RoleSelector = ({ currentRole, onRoleChange }: RoleSelectorProps) => {
  return (
    <Select onValueChange={onRoleChange} defaultValue={currentRole}>
      <SelectTrigger className="w-[180px] bg-dashboard-card border-white/10">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Admin
          </div>
        </SelectItem>
        <SelectItem value="collector">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Collector
          </div>
        </SelectItem>
        <SelectItem value="member">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Member
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleSelector;