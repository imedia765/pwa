import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailLoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const EmailLoginForm = ({ onSubmit }: EmailLoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Login with Email
      </Button>
    </form>
  );
};