import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailLoginForm } from "./EmailLoginForm";
import { MemberIdLoginForm } from "./MemberIdLoginForm";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Link } from "react-router-dom";

interface LoginFormProps {
  isLoading: boolean;
  onEmailSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onMemberIdSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

export const LoginForm = ({ 
  isLoading,
  onEmailSubmit, 
  onMemberIdSubmit, 
  onGoogleLogin 
}: LoginFormProps) => {
  return (
    <>
      <Button 
        variant="outline" 
        className="w-full mb-6 h-12 text-lg bg-white hover:bg-gray-50 border-2 shadow-sm text-gray-700 font-medium" 
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        <Icons.google className="mr-2 h-5 w-5 [&>path]:fill-[#4285F4]" />
        Continue with Google
      </Button>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="memberId">Member ID</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <EmailLoginForm onSubmit={onEmailSubmit} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="memberId">
          <MemberIdLoginForm onSubmit={onMemberIdSubmit} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary hover:underline">
          Register here
        </Link>
      </div>
    </>
  );
};