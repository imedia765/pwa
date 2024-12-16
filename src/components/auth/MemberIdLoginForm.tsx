import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MemberIdLoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const MemberIdLoginForm = ({ onSubmit }: MemberIdLoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="memberId"
          name="memberId"
          type="text"
          placeholder="Member ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          id="memberPassword"
          name="memberPassword"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Login with Member ID
      </Button>
    </form>
  );
};