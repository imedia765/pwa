import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

interface MemberIdLoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
}

export const MemberIdLoginForm = ({ onSubmit, isLoading }: MemberIdLoginFormProps) => {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clean and set the member ID
    const cleanMemberId = memberId.toUpperCase().trim();
    const formData = new FormData(e.currentTarget);
    formData.set('memberId', cleanMemberId);
    formData.set('password', password);
    
    console.log("Login attempt with:", {
      memberId: cleanMemberId,
    });
    
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="memberId"
          name="memberId"
          type="text"
          placeholder="Member ID (e.g. TM20001)"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value.toUpperCase().trim())}
          required
          disabled={isLoading}
          className="uppercase"
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
      <p className="text-sm text-muted-foreground text-center">
        Use your Member ID (e.g. TM20001) and password
      </p>
    </form>
  );
};