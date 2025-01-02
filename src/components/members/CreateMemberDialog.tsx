import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CreateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateMemberDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateMemberDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("members").insert([
        {
          member_number: data.member_number,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          status: "active",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member created successfully",
      });
      reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member_number">Member Number</Label>
            <Input
              id="member_number"
              {...register("member_number")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberDialog;