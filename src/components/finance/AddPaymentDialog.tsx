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

  // Get current user's session and profile
  const { data: userProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return profile;
    },
  });

  // Get collector ID if user is a collector
  const { data: collectorData } = useQuery({
    queryKey: ['collectorId', userProfile?.email],
    queryFn: async () => {
      if (!userProfile?.email || userProfile.role !== 'collector') return null;

      // First get the member record for this user
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('collector_id')
        .eq('auth_user_id', userProfile.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching member:', memberError);
        return null;
      }

      if (!memberData?.collector_id) {
        console.log('No collector_id found for member');
        return null;
      }

      return memberData;
    },
    enabled: !!userProfile?.email && userProfile.role === 'collector',
  });

  // Query for searching members
  const { data: members } = useQuery({
    queryKey: ['members', searchTerm],
    queryFn: async () => {
      const query = supabase
        .from('members')
        .select(`
          id, 
          full_name, 
          member_number, 
          email,
          collector_id
        `)
        .or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      // If user is a collector, only show their members
      if (collectorData?.collector_id) {
        query.eq('collector_id', collectorData.collector_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MemberSearchResult[];
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
                members={members || []}
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