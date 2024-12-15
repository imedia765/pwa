import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const NextOfKinSection = () => {
  return (
    <Collapsible className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between bg-primary/5 hover:bg-primary/10 text-primary"
        >
          <h3 className="text-lg font-semibold">Next of Kin Information</h3>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="kinName">Name</label>
            <Input id="kinName" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="kinAddress">Address</label>
            <Textarea id="kinAddress" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="kinPhone">Phone</label>
            <Input type="tel" id="kinPhone" required />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};