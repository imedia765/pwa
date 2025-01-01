import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Spouse {
  id?: string;
  name: string;
  dateOfBirth: string;
}

interface SpousesSectionProps {
  memberId?: string;
  defaultOpen?: boolean;
}

export interface SpousesSectionRef {
  saveSpouses: () => Promise<void>;
}

export const SpousesSection = forwardRef<SpousesSectionRef, SpousesSectionProps>(
  ({ memberId, defaultOpen = true }, ref) => {
    const [spouses, setSpouses] = useState<Spouse[]>([]);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Fetch existing spouses on component mount
    useEffect(() => {
      const fetchSpouses = async () => {
        if (!memberId) return;

        const { data, error } = await supabase
          .from('family_members')
          .select('id, name, date_of_birth')
          .eq('member_id', memberId)
          .eq('relationship', 'spouse');

        if (error) {
          console.error('Error fetching spouses:', error);
          return;
        }

        if (data) {
          setSpouses(data.map(spouse => ({
            id: spouse.id,
            name: spouse.name,
            dateOfBirth: spouse.date_of_birth || ''
          })));
        }
      };

      fetchSpouses();
    }, [memberId]);

    const addSpouse = () => {
      setSpouses([...spouses, { name: "", dateOfBirth: "" }]);
      setIsOpen(true);
    };

    const removeSpouse = async (index: number) => {
      const spouse = spouses[index];
      if (spouse.id && memberId) {
        const { error } = await supabase
          .from('family_members')
          .delete()
          .eq('id', spouse.id);

        if (error) {
          console.error('Error deleting spouse:', error);
          return;
        }
      }

      setSpouses(spouses.filter((_, i) => i !== index));
    };

    const updateSpouse = (index: number, field: keyof Spouse, value: string) => {
      const newSpouses = [...spouses];
      newSpouses[index] = { ...newSpouses[index], [field]: value };
      setSpouses(newSpouses);
    };

    const saveSpouses = async () => {
      if (!memberId) return;

      for (const spouse of spouses) {
        if (spouse.id) {
          // Update existing spouse
          const { error } = await supabase
            .from('family_members')
            .update({
              name: spouse.name,
              date_of_birth: spouse.dateOfBirth || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', spouse.id);

          if (error) {
            console.error('Error updating spouse:', error);
          }
        } else {
          // Insert new spouse
          const { error } = await supabase
            .from('family_members')
            .insert({
              member_id: memberId,
              name: spouse.name,
              date_of_birth: spouse.dateOfBirth || null,
              relationship: 'spouse',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error inserting spouse:', error);
          }
        }
      }
    };

    useImperativeHandle(ref, () => ({
      saveSpouses
    }));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between bg-primary/5 hover:bg-primary/10 text-primary"
        >
          <h3 className="text-lg font-semibold">Spouses</h3>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {spouses.map((spouse, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg mb-4">
            <h4 className="font-medium">Spouse {index + 1}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label>Name</label>
                <Input
                  value={spouse.name}
                  onChange={(e) => updateSpouse(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label>Date of Birth</label>
                <Input
                  type="date"
                  value={spouse.dateOfBirth}
                  onChange={(e) => updateSpouse(index, 'dateOfBirth', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={addSpouse}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                Add Spouse
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => removeSpouse(index)}
              >
                Remove Spouse
              </Button>
            </div>
          </div>
        ))}
        {spouses.length === 0 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={addSpouse} 
            className="w-full bg-green-500 hover:bg-green-600 text-white border-0"
          >
            Add Spouse
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
  }
);

SpousesSection.displayName = "SpousesSection";
