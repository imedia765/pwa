import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PasswordChangeForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Please log in again to change your password");
      }

      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      // Update the password
      const { data: userData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Update the member record
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('email', session.user.email)
        .maybeSingle();

      if (memberError) throw memberError;

      if (memberData) {
        const { error: updateMemberError } = await supabase
          .from('members')
          .update({ 
            auth_user_id: session.user.id,
            password_changed: true,
            first_time_login: false,
            phone: phoneNumber,
            profile_updated: true,
            email_verified: true
          })
          .eq('id', memberData.id);

        if (updateMemberError) throw updateMemberError;
      }

      toast({
        title: "Profile updated",
        description: "Your password and contact details have been updated successfully",
      });
      
      // Redirect to admin/profile after password change
      navigate("/admin/profile");
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="tel"
          placeholder="Contact Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Updating Profile..." : "Update Profile"}
      </Button>
    </form>
  );
};