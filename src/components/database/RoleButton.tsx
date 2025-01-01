import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RoleButtonProps {
  onClick: () => void;
  disabled: boolean;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
}

export function RoleButton({ onClick, disabled, isActive, icon: Icon, label }: RoleButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={isActive ? 'bg-blue-100' : ''}
    >
      <Icon className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
}