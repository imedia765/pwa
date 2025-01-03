import { Shield } from "lucide-react";
import { Member } from "@/types/member";

interface MembershipInfoProps {
  member: Member;
  currentRole: string | null;
}

const MembershipInfo = ({ member, currentRole }: MembershipInfoProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-dashboard-muted mb-1">Membership Type</p>
        <p className="text-dashboard-text">{member.membership_type || 'Standard'}</p>
      </div>
      <div>
        <p className="text-dashboard-muted mb-1">Collector</p>
        <p className="text-dashboard-text">{member.collector || 'Not assigned'}</p>
      </div>
      <div>
        <p className="text-dashboard-muted mb-1">Role</p>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-dashboard-text">{currentRole || 'Member'}</span>
        </div>
      </div>
    </div>
  );
};

export default MembershipInfo;