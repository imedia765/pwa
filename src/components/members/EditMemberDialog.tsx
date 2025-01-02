import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  onSuccess: () => void;
}

const EditMemberDialog = ({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditMemberDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (member) {
      reset(member);
    }
  }, [member, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({
          member_number: data.member_number,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member updated successfully",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member",
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
          <DialogTitle>Edit Member</DialogTitle>
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
            {isLoading ? "Updating..." : "Update Member"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberDialog;