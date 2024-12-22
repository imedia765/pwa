import { Input } from "@/components/ui/input";

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function UserSearch({ searchTerm, onSearchChange }: UserSearchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Search by name, member number or email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}