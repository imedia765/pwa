import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

interface AssignCollectorFormProps {
  memberId: string;
  onSuccess?: () => void;
}

const AssignCollectorForm = ({ memberId, onSuccess }: AssignCollectorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Assigning collector role to member:', memberId);
      
      const { data, error } = await supabase.rpc('assign_collector_role', {
        member_id: memberId,
        collector_name: formData.name,
        collector_prefix: formData.prefix,
        collector_number: formData.number
      });

      if (error) throw error;

      console.log('Collector role assigned successfully:', data);
      
      toast({
        title: "Success",
        description: "Collector role assigned successfully",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members_collectors'] });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error assigning collector role:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign as Collector</CardTitle>
        <CardDescription>
          Fill in the collector details to assign this member as a collector
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Collector Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Prefix (e.g., TC)"
              value={formData.prefix}
              onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
              required
              maxLength={2}
            />
            <Input
              placeholder="Number (e.g., 001)"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 animate-spin" />
                Assigning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Assign as Collector
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignCollectorForm;