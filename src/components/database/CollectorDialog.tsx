import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CollectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isNew: boolean, name: string, id: string) => void;
  isLoading: boolean;
}

export function CollectorDialog({ isOpen, onClose, onConfirm, isLoading }: CollectorDialogProps) {
  const [isNewCollector, setIsNewCollector] = useState(true);
  const [collectorName, setCollectorName] = useState("");
  const [selectedCollectorId, setSelectedCollectorId] = useState("");
  const [existingCollectors, setExistingCollectors] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCollectors();
    }
  }, [isOpen]);

  const fetchCollectors = async () => {
    const { data, error } = await supabase
      .from('collectors')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching collectors:', error);
      return;
    }
    
    setExistingCollectors(data || []);
  };

  const handleConfirm = () => {
    if (isNewCollector) {
      onConfirm(true, collectorName, "");
    } else {
      onConfirm(false, "", selectedCollectorId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make User a Collector</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={isNewCollector ? "default" : "outline"}
              onClick={() => setIsNewCollector(true)}
            >
              Create New
            </Button>
            <Button
              variant={!isNewCollector ? "default" : "outline"}
              onClick={() => setIsNewCollector(false)}
            >
              Select Existing
            </Button>
          </div>

          {isNewCollector ? (
            <Input
              placeholder="Enter collector name"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
            />
          ) : (
            <Select
              value={selectedCollectorId}
              onValueChange={setSelectedCollectorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collector" />
              </SelectTrigger>
              <SelectContent>
                {existingCollectors.map((collector) => (
                  <SelectItem key={collector.id} value={collector.id}>
                    {collector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button 
            onClick={handleConfirm}
            disabled={isLoading || (isNewCollector ? !collectorName : !selectedCollectorId)}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}