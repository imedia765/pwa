import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MembersSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function MembersSearch({ searchTerm, setSearchTerm }: MembersSearchProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search members..." 
          className="pl-8" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}