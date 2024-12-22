import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TransactionsTableProps {
  type?: 'expense' | 'payment' | 'all';
}

export function TransactionsTable({ type = 'all' }: TransactionsTableProps) {
  const { toast } = useToast();
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', type],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          member:members (
            full_name
          )
        `)
        .order('payment_date', { ascending: false });
      
      // Filter based on type
      if (type === 'expense') {
        query = query.lt('amount', 0);
      } else if (type === 'payment') {
        query = query.gt('amount', 0);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleApprove = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'approved' })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Payment approved",
        description: "The payment has been successfully approved.",
      });

      refetch();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: "Failed to approve payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member/Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.member?.full_name || transaction.notes || 'Unknown Member'}</TableCell>
            <TableCell>{transaction.payment_type}</TableCell>
            <TableCell>{new Date(transaction.payment_date).toLocaleDateString()}</TableCell>
            <TableCell className={Number(transaction.amount) < 0 ? "text-red-500" : "text-green-500"}>
              £{Math.abs(Number(transaction.amount)).toFixed(2)}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                transaction.status === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {transaction.status || 'pending'}
              </span>
            </TableCell>
            <TableCell>
              {transaction.status !== 'approved' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(transaction.id)}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}