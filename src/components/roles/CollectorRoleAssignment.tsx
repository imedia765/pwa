import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CollectorRoleAssignmentProps {
  userId: string;
  memberNumber: string;
  onSuccess?: () => void;
}

export const CollectorRoleAssignment = ({ 
  userId, 
  memberNumber,
  onSuccess 
}: CollectorRoleAssignmentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAssignRole = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('assign_collector_role', {
        member_id: userId,
        collector_name: memberNumber,
        collector_prefix: memberNumber.substring(0, 2),
        collector_number: memberNumber.substring(2)
      });

      if (error) throw error;

      toast({
        title: "Role assigned successfully",
        description: "Collector role has been assigned to the user",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning collector role:', error);
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAssignRole}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Assigning...
        </>
      ) : (
        'Assign Collector Role'
      )}
    </Button>
  );
};