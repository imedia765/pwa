import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchTransactionsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function SearchTransactions({ searchTerm, setSearchTerm }: SearchTransactionsProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search transactions..." 
        className="pl-8 w-full" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}