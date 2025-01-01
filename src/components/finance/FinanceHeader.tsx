import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function FinanceHeader() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Get current user's role from members
  const { data: userMember } = useQuery({
    queryKey: ['currentUserMember'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: member, error } = await supabase
        .from('members')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) throw error;
      return member;
    },
  });

  const isCollector = userMember?.role === 'collector';
  const isAdmin = userMember?.role === 'admin';

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Financial Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(isAdmin || isCollector) && (
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <AddPaymentDialog 
              isOpen={isPaymentDialogOpen} 
              onClose={() => setIsPaymentDialogOpen(false)}
              onPaymentAdded={() => {
                setIsPaymentDialogOpen(false);
              }}
            />
          </Dialog>
        )}

        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <AddExpenseDialog />
          </Dialog>
        )}
      </div>
    </div>
  );
}