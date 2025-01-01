import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberSearchInput } from "./MemberSearchInput";
import { MemberSearchResults } from "./MemberSearchResults";
import { PaymentForm } from "./PaymentForm";
import type { MemberSearchResult } from "./types";

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
}

export function AddPaymentDialog({ isOpen, onClose, onPaymentAdded }: AddPaymentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberSearchResult | null>(null);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      amount: "",
      paymentType: "",
      notes: "",
    },
  });

  // Get current user's session and member data
  const { data: currentMember } = useQuery({
    queryKey: ['currentMember'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: member, error } = await supabase
        .from('members')
        .select('id, email, role, collector_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return member;
    },
  });

  // Get collector ID if user is a collector
  const { data: collectorData } = useQuery({
    queryKey: ['collectorId', currentMember?.email],
    queryFn: async () => {
      if (!currentMember?.email || currentMember.role !== 'collector') return null;

      if (!currentMember.collector_id) {
        console.log('No collector_id found for member');
        return null;
      }

      return { collector_id: currentMember.collector_id };
    },
    enabled: !!currentMember?.email && currentMember.role === 'collector',
  });

  // Query to search for members
  const { data: searchResults } = useQuery({
    queryKey: ['memberSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return members || [];
    },
    enabled: searchTerm.length > 0,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedMember ? (
            <>
              <MemberSearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
              <MemberSearchResults
                members={searchResults || []}
                onSelect={(member) => {
                  setSelectedMember(member);
                  setSearchTerm("");
                }}
                collectorId={collectorData?.collector_id}
              />
            </>
          ) : (
            <PaymentForm
              member={selectedMember}
              form={form}
              onSubmit={async (data) => {
                try {
                  const { error } = await supabase
                    .from('payments')
                    .insert({
                      member_id: selectedMember.id,
                      collector_id: collectorData?.collector_id || selectedMember.collector_id,
                      amount: parseFloat(data.amount),
                      payment_type: data.paymentType,
                      notes: data.notes,
                    });

                  if (error) throw error;

                  toast({
                    title: "Payment added successfully",
                    description: `Payment of £${data.amount} has been recorded for ${selectedMember.full_name}`,
                  });

                  onPaymentAdded();
                  onClose();
                } catch (error) {
                  console.error('Error adding payment:', error);
                  toast({
                    title: "Error adding payment",
                    description: "There was an error adding the payment. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setSelectedMember(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}