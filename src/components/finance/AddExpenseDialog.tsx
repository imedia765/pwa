import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ExpenseFormData {
  category: string;
  amount: string;
  description: string;
}

export function AddExpenseDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const form = useForm<ExpenseFormData>({
    defaultValues: {
      category: "",
      amount: "",
      description: ""
    }
  });

  const handleAddExpense = async (data: ExpenseFormData) => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('payments')
        .insert({
          amount: -Number(data.amount), // Negative amount for expenses
          payment_type: data.category,
          notes: data.description,
          payment_date: new Date().toISOString(),
          created_by: userId // Adding the user reference
        });

      if (error) throw error;

      toast.success("Expense added successfully");
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      form.reset();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Expense</DialogTitle>
      </DialogHeader>

      <Card className="bg-muted/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                This form is for recording general organizational expenses. 
                Member-specific payments should be recorded using the "Add Payment" form.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funeral_service">Funeral Service</SelectItem>
                    <SelectItem value="cemetery_fees">Cemetery Fees</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="memorial_supplies">Memorial Supplies</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="bereavement_support">Bereavement Support</SelectItem>
                    <SelectItem value="maintenance">Facility Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (£)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    {...field}
                    min="0"
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter description" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}