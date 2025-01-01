import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberIdLoginForm } from "./MemberIdLoginForm";

interface LoginTabsProps {
  onMemberIdSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading?: boolean;
}

export const LoginTabs = ({ onMemberIdSubmit, isLoading }: LoginTabsProps) => {
  return (
    <div className="w-full">
      <MemberIdLoginForm onSubmit={onMemberIdSubmit} isLoading={isLoading} />
    </div>
  );
};