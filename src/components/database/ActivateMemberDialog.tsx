import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollectorSelect } from "@/components/collectors/CollectorSelect";

interface ActivateMemberDialogProps {
  member: {
    id: string;
    full_name: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ActivateMemberDialog({
  member,
  isOpen,
  onClose,
  onUpdate
}: ActivateMemberDialogProps) {
  const [selectedCollectorId, setSelectedCollectorId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch active collectors
  const { data: collectors } = useQuery({
    queryKey: ['collectors'],
    queryFn: async () => {
      console.log('Fetching active collectors...');
      const { data, error } = await supabase
        .from('collectors')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching collectors:', error);
        throw error;
      }
      console.log('Fetched collectors:', data);
      return data;
    }
  });

  // Get selected collector details for preview
  const selectedCollector = collectors?.find(c => c.id === selectedCollectorId);
  const previewMemberNumber = selectedCollector 
    ? `${selectedCollector.prefix}${selectedCollector.number}XXX` 
    : 'Select a collector to preview';

  const handleActivate = async () => {
    if (!selectedCollectorId) {
      toast({
        title: "Collector Required",
        description: "Please select a collector before activating the member",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting member activation process:', member.id, 'with collector:', selectedCollectorId);

    try {
      // Get collector details
      const { data: collector, error: collectorError } = await supabase
        .from('collectors')
        .select('*')
        .eq('id', selectedCollectorId)
        .single();

      if (collectorError || !collector) {
        throw new Error('Selected collector not found');
      }

      // Update member with collector details to trigger member number generation
      const { error: updateError } = await supabase
        .from('members')
        .update({ 
          collector_id: selectedCollectorId,
          collector: collector.name,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (updateError) {
        console.error('Error updating member:', updateError);
        throw updateError;
      }

      // Fetch the updated member to confirm member number generation
      const { data: updatedMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', member.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated member:', fetchError);
        throw fetchError;
      }

      if (!updatedMember.member_number) {
        throw new Error('Member number was not generated');
      }

      toast({
        title: "Member Activated",
        description: `Member has been successfully activated with number: ${updatedMember.member_number}`
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error activating member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to activate member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Member: {member.full_name}</DialogTitle>
          <DialogDescription>
            Current Member ID: {member.id}
            <br />
            Preview Member Number: {previewMemberNumber}
            <br />
            Select a collector to activate this member. The member number will be automatically generated using the collector's prefix and a sequential number.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Collector</label>
            <CollectorSelect
              collectors={collectors || []}
              currentCollectorId=""
              selectedCollectorId={selectedCollectorId}
              onCollectorChange={setSelectedCollectorId}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={isLoading}>
              {isLoading ? "Activating..." : "Activate Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}