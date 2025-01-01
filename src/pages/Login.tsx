import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginTabs } from "../components/auth/LoginTabs";
import { useToast } from "../hooks/use-toast";
import { handleMemberIdLogin } from "../components/auth/LoginHandlers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleMemberIdSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const memberId = formData.get('memberId') as string;
    const password = formData.get('password') as string;
    
    try {
      console.log("Attempting member ID login with:", { memberId });
      await handleMemberIdLogin(memberId, password, navigate);
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

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginTabs 
            onMemberIdSubmit={handleMemberIdSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}