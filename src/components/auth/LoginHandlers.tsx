import { useToast } from "@/hooks/use-toast";
import { handleEmailLogin } from "./handlers/emailLoginHandler";
import { handleMemberIdLogin } from "./handlers/memberIdLoginHandler";
import { supabase } from "@/integrations/supabase/client";

export const useLoginHandlers = (setIsLoggedIn: (value: boolean) => void) => {
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const success = await handleEmailLogin(email, password, { toast });
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const handleMemberIdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberId = (formData.get("memberId") as string).toUpperCase().trim();
    const password = formData.get("memberPassword") as string;

    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const success = await handleMemberIdLogin(memberId, password, { toast });
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome! Please update your profile information.",
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Member ID login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your Member ID and password",
        variant: "destructive",
      });
    }
  };

  return {
    handleEmailSubmit,
    handleMemberIdSubmit,
  };
};