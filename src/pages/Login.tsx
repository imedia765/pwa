import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Login attempt with:", { identifier });

    try {
      // Check if input is an email or member ID
      const isEmail = identifier.includes('@') && !identifier.includes('@temp.pwaburton.org');
      
      if (isEmail) {
        // Check if member exists and has updated their password
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('password_changed, email_verified')
          .eq('email', identifier)
          .maybeSingle();

        if (memberError) {
          console.error("Error checking member status:", memberError);
          throw new Error("An error occurred while checking member status");
        }

        if (!member) {
          console.log("No member found with email:", identifier);
          throw new Error("No member found with this email address. Please check your credentials or use Member ID login if you haven't updated your profile yet.");
        }

        if (!member.password_changed) {
          toast({
            title: "Password not updated",
            description: "Please use the 'First Time Login' button below if you haven't changed your password yet.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // For member ID login, check if the member exists first
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('email, default_password_hash')
          .eq('member_number', identifier.toUpperCase())
          .maybeSingle();

        if (memberError) {
          console.error("Error checking member:", memberError);
          throw new Error("An error occurred while checking member status");
        }

        if (!member) {
          console.log("No member found with ID:", identifier);
          throw new Error("Invalid Member ID. Please check your credentials and try again.");
        }

        if (!member.email) {
          console.error("No email found for member:", identifier);
          throw new Error("No email associated with this Member ID. Please contact support.");
        }

        // For first-time login, password should match member ID
        if (password !== identifier.toUpperCase()) {
          throw new Error("For first-time login, your password should be the same as your Member ID");
        }
      }

      // Attempt login with proper email format
      const loginEmail = isEmail ? identifier : `${identifier.toUpperCase()}@temp.pwaburton.org`;
      console.log("Attempting login with email:", loginEmail);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        console.error("Sign in error:", error);
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid credentials. Please check your email/member ID and password.");
        }
        throw error;
      }

      console.log("Login successful");
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to dashboard after successful login
      navigate('/admin');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please check your email/member ID and password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstTimeLogin = () => {
    navigate('/first-time-login');
  };

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              Enter your email if you've already updated your profile, or your Member ID if this is your first time logging in.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Email or Member ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                First time here?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleFirstTimeLogin}
          >
            First Time Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}