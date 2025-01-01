import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Dependant {
  id?: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  category: string;
}

interface DependantsSectionProps {
  memberId?: string;
  defaultOpen?: boolean;
}

export interface DependantsSectionRef {
  saveDependants: () => Promise<void>;
}

export const DependantsSection = forwardRef<DependantsSectionRef, DependantsSectionProps>(
  ({ memberId, defaultOpen = true }, ref) => {
    const [dependants, setDependants] = useState<Dependant[]>([]);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Fetch existing dependants on component mount
    useEffect(() => {
      const fetchDependants = async () => {
        if (!memberId) return;

        const { data, error } = await supabase
          .from('family_members')
          .select('id, name, date_of_birth, gender, relationship')
          .eq('member_id', memberId)
          .neq('relationship', 'spouse');

        if (error) {
          console.error('Error fetching dependants:', error);
          return;
        }

        if (data) {
          setDependants(data.map(dep => ({
            id: dep.id,
            name: dep.name,
            dateOfBirth: dep.date_of_birth || '',
            gender: dep.gender || '',
            category: dep.relationship
          })));
        }
      };

      fetchDependants();
    }, [memberId]);

    const addDependant = () => {
      setDependants([...dependants, { name: "", dateOfBirth: "", gender: "", category: "" }]);
      setIsOpen(true);
    };

    const removeDependant = async (index: number) => {
      const dependant = dependants[index];
      if (dependant.id && memberId) {
        const { error } = await supabase
          .from('family_members')
          .delete()
          .eq('id', dependant.id);

        if (error) {
          console.error('Error deleting dependant:', error);
          return;
        }
      }

      setDependants(dependants.filter((_, i) => i !== index));
    };

    const updateDependant = (index: number, field: keyof Dependant, value: string) => {
      const newDependants = [...dependants];
      newDependants[index] = { ...newDependants[index], [field]: value };
      setDependants(newDependants);
    };

    const saveDependants = async () => {
      if (!memberId) return;

      for (const dependant of dependants) {
        if (dependant.id) {
          // Update existing dependant
          const { error } = await supabase
            .from('family_members')
            .update({
              name: dependant.name,
              date_of_birth: dependant.dateOfBirth || null,
              gender: dependant.gender || null,
              relationship: dependant.category,
              updated_at: new Date().toISOString()
            })
            .eq('id', dependant.id);

          if (error) {
            console.error('Error updating dependant:', error);
          }
        } else {
          // Insert new dependant
          const { error } = await supabase
            .from('family_members')
            .insert({
              member_id: memberId,
              name: dependant.name,
              date_of_birth: dependant.dateOfBirth || null,
              gender: dependant.gender || null,
              relationship: dependant.category,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error inserting dependant:', error);
          }
        }
      }
    };

    useImperativeHandle(ref, () => ({
      saveDependants
    }));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between bg-primary/5 hover:bg-primary/10 text-primary"
        >
          <h3 className="text-lg font-semibold">Dependants</h3>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {dependants.map((dependant, index) => (
          <Card key={index} className="p-4 space-y-4">
            <h4 className="font-medium text-primary">Dependant {index + 1}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={dependant.name}
                  onChange={(e) => updateDependant(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={dependant.dateOfBirth}
                  onChange={(e) => updateDependant(index, 'dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Input
                  value={dependant.gender}
                  onChange={(e) => updateDependant(index, 'gender', e.target.value)}
                  placeholder="Enter gender"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={dependant.category}
                  onChange={(e) => updateDependant(index, 'category', e.target.value)}
                  placeholder="Enter relationship (e.g. child, parent)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={addDependant}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                Add Dependant
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => removeDependant(index)}
              >
                Remove Dependant
              </Button>
            </div>
          </Card>
        ))}
        {dependants.length === 0 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={addDependant} 
            className="w-full bg-green-500 hover:bg-green-600 text-white border-0"
          >
            Add Dependant
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
  }
);

DependantsSection.displayName = "DependantsSection";
