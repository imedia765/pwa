import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateTotalBalance, calculateMonthlyIncome, calculateMonthlyExpenses, calculatePercentageChange } from "@/utils/financeCalculations";
import { useToast } from "@/hooks/use-toast";

export function FinanceStats() {
  const { toast } = useToast();

  const { data: currentMonthPayments, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['payments', 'currentMonth'],
    queryFn: async () => {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .gte('payment_date', firstDayOfMonth.toISOString().split('T')[0]);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching current month payments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch current month payments"
        });
        return [];
      }
    },
  });

  const { data: previousMonthPayments, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ['payments', 'previousMonth'],
    queryFn: async () => {
      const currentDate = new Date();
      const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .gte('payment_date', firstDayOfPreviousMonth.toISOString().split('T')[0])
          .lte('payment_date', lastDayOfPreviousMonth.toISOString().split('T')[0]);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching previous month payments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch previous month payments"
        });
        return [];
      }
    },
  });

  const { data: allPayments, isLoading: isLoadingAll } = useQuery({
    queryKey: ['payments', 'all'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching all payments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment history"
        });
        return [];
      }
    },
  });

  if (isLoadingCurrent || isLoadingPrevious || isLoadingAll) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£---</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalBalance = calculateTotalBalance(allPayments || []);
  const currentMonthIncome = calculateMonthlyIncome(currentMonthPayments || []);
  const previousMonthIncome = calculateMonthlyIncome(previousMonthPayments || []);
  const currentMonthExpenses = calculateMonthlyExpenses(currentMonthPayments || []);
  const previousMonthExpenses = calculateMonthlyExpenses(previousMonthPayments || []);

  const incomeChange = calculatePercentageChange(currentMonthIncome, previousMonthIncome);
  const expensesChange = calculatePercentageChange(currentMonthExpenses, previousMonthExpenses);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£{totalBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Updated as of {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className={`h-4 w-4 ${incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£{currentMonthIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <TrendingDown className={`h-4 w-4 ${expensesChange <= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£{currentMonthExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {expensesChange <= 0 ? '-' : '+'}{Math.abs(expensesChange).toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}