import { Member } from "@/types/member";
import RoleBadge from "./RoleBadge";

interface MembershipDetailsProps {
  memberProfile: Member;
  userRole: string | null;
}

const MembershipDetails = ({ memberProfile, userRole }: MembershipDetailsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-dashboard-muted text-sm">Membership Details</p>
      <div className="space-y-2">
        <p className="text-dashboard-text flex items-center gap-2">
          Status:{' '}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            memberProfile?.status === 'active' 
              ? 'bg-dashboard-accent3/20 text-dashboard-accent3' 
              : 'bg-dashboard-muted/20 text-dashboard-muted'
          }`}>
            {memberProfile?.status || 'Pending'}
          </span>
        </p>
        <p className="text-dashboard-text flex items-center gap-2">
          <span className="text-dashboard-accent2">Type:</span>
          <span className="flex items-center gap-2">
            {memberProfile?.membership_type || 'Standard'}
            <RoleBadge role={userRole} />
          </span>
        </p>
      </div>
    </div>
  );
};

export default MembershipDetails;