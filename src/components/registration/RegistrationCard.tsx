import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RegistrationDetails } from "./RegistrationDetails";
import { Registration } from "@/types/registration";

interface RegistrationCardProps {
  registration: Registration;
  isOpen: boolean;
  onToggle: () => void;
}

export const RegistrationCard = ({ registration, isOpen, onToggle }: RegistrationCardProps) => {
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                {registration.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Status: {registration.status} | Submitted: {registration.date}
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <RegistrationDetails registration={registration} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};