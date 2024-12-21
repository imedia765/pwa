import { Input } from "@/components/ui/input";

interface PasswordFieldsProps {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isLoading: boolean;
  error?: string;
}

export const PasswordFields = ({ 
  newPassword, 
  confirmPassword, 
  setNewPassword, 
  setConfirmPassword,
  isLoading,
  error
}: PasswordFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            required={!!confirmPassword}
            minLength={6}
            className={error ? "border-red-500" : ""}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required={!!newPassword}
            minLength={6}
            className={error ? "border-red-500" : ""}
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};