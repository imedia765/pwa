import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function MembersHeader() {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Members Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button className="w-full flex items-center justify-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>
    </div>
  );
}