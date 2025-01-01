import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface UserRoleButtonProps {
  onClick: () => void;
  disabled: boolean;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
}

export function UserRoleButton({ onClick, disabled, isActive, icon: Icon, label }: UserRoleButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`${isActive ? 'bg-blue-100 dark:bg-blue-900/20' : ''} flex items-center gap-2`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}