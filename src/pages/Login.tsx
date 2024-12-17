import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Login component mounted - checking session");
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check result:", { session, error });
      if (session) {
        console.log("Active session found, redirecting to admin");
        navigate("/admin");
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", { event, session });
      if (event === "SIGNED_IN" && session) {
        console.log("Sign in event detected, redirecting to admin");
        navigate("/admin");
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Email login attempt started");
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log("Attempting email login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Email login response:", { data, error });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Email login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberIdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Member ID login attempt started");
    
    try {
      const formData = new FormData(e.currentTarget);
      const memberId = formData.get("memberId") as string;
      const password = formData.get("memberPassword") as string;

      console.log("Looking up member with ID:", memberId);
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('email, default_password_hash')
        .eq('member_number', memberId.toUpperCase())
        .single();

      console.log("Member lookup result:", { memberData, memberError });

      if (memberError || !memberData?.email) {
        throw new Error("Member ID not found");
      }

      if (!memberData.default_password_hash) {
        throw new Error("Please contact support to reset your password");
      }

      // Verify the password matches the default password hash
      const hashedPassword = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
      );
      const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hashedPasswordHex !== memberData.default_password_hash) {
        throw new Error("Invalid password");
      }

      console.log("Attempting login with member's email");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: memberData.email,
        password,
      });

      console.log("Member ID login response:", { data, error });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid Member ID or password");
        }
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Member ID login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid member ID or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log("Google login attempt started");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + "/admin",
        },
      });

      console.log("Google login response:", { data, error });

      if (error) throw error;
      
      toast({
        title: "Redirecting to Google",
        description: "Please wait while we redirect you to Google sign-in...",
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during Google login",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm
            isLoading={isLoading}
            onEmailSubmit={handleEmailSubmit}
            onMemberIdSubmit={handleMemberIdSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </CardContent>
      </Card>
    </div>
  );
}