import { Member } from "@/types/member";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MemberDetailsSection from './MemberDetailsSection';

interface MemberListItemProps {
  member: Member;
  userRole: string | null;
}

const MemberListItem = ({ member, userRole }: MemberListItemProps) => {
  return (
    <AccordionItem 
      key={member.id} 
      value={member.id}
      className="bg-dashboard-card border-white/10 shadow-lg hover:border-dashboard-accent1/50 transition-all duration-300 p-6 rounded-lg border"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-6 w-full">
          <Avatar className="h-16 w-16 border-2 border-dashboard-accent1/20">
            <AvatarFallback className="bg-dashboard-accent1/20 text-lg text-dashboard-accent1">
              {member.full_name?.charAt(0) || 'M'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex justify-between items-center w-full">
            <div>
              <h3 className="text-xl font-medium text-dashboard-accent2 mb-1">{member.full_name}</h3>
              <p className="bg-dashboard-accent1/10 px-3 py-1 rounded-full inline-flex items-center">
                <span className="text-dashboard-accent1">Member #</span>
                <span className="text-dashboard-accent2 font-medium ml-1">{member.member_number}</span>
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              member.status === 'active' 
                ? 'bg-dashboard-accent3/20 text-dashboard-accent3' 
                : 'bg-dashboard-muted/20 text-dashboard-muted'
            }`}>
              {member.status || 'Pending'}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-dashboard-muted mb-1">Contact Information</p>
            <p className="text-dashboard-text">{member.email || 'No email provided'}</p>
            <p className="text-dashboard-text">{member.phone || 'No phone provided'}</p>
          </div>
          <div>
            <p className="text-dashboard-muted mb-1">Address</p>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-dashboard-text">
                {member.address || 'No address provided'}
                {member.town && `, ${member.town}`}
                {member.postcode && ` ${member.postcode}`}
              </p>
            </div>
          </div>
        </div>
        
        <MemberDetailsSection member={member} userRole={userRole} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default MemberListItem;