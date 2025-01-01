import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function MemberNumberFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const fixMemberNumbers = async () => {
    setIsFixing(true);
    setResults([]);
    try {
      // First, get all collectors
      const { data: collectors, error: collectorsError } = await supabase
        .from('collectors')
        .select('*');

      if (collectorsError) throw collectorsError;

      // For each collector
      for (const collector of collectors) {
        // Get all members for this collector
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('collector_id', collector.id)
          .order('created_at');

        if (membersError) throw membersError;

        // Update each member's number
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const sequence = String(i + 1).padStart(3, '0');
          const newMemberNumber = `${collector.prefix}${collector.number}${sequence}`;

          if (member.member_number !== newMemberNumber) {
            const { error: updateError } = await supabase
              .from('members')
              .update({ member_number: newMemberNumber })
              .eq('id', member.id);

            if (updateError) {
              setResults(prev => [...prev, `Error updating ${member.full_name}: ${updateError.message}`]);
              continue;
            }

            setResults(prev => [...prev, `Updated ${member.full_name}: ${member.member_number} → ${newMemberNumber}`]);
          }
        }
      }

      toast({
        title: "Member numbers fixed",
        description: "All member numbers have been updated according to the required format.",
      });
    } catch (error) {
      console.error('Error fixing member numbers:', error);
      toast({
        title: "Error",
        description: "Failed to fix member numbers. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fix Member Numbers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={fixMemberNumbers} 
            disabled={isFixing}
          >
            {isFixing ? "Fixing..." : "Fix Member Numbers"}
          </Button>
          <p className="text-sm text-muted-foreground">
            This will update all member numbers to match the format: CollectorPrefix + CollectorNumber + Sequence
          </p>
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Results:</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {results.map((result, index) => (
                <p key={index} className="text-sm">{result}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}