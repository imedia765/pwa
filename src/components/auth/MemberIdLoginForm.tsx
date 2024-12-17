import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface MemberIdLoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
}

export const MemberIdLoginForm = ({ onSubmit, isLoading }: MemberIdLoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="memberId"
          name="memberId"
          type="text"
          placeholder="Member ID"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Input
          id="memberPassword"
          name="memberPassword"
          type="password"
          placeholder="Password"
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Login with Member ID"
        )}
      </Button>
    </form>
  );
};