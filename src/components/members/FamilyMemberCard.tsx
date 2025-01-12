import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/dateFormat";

interface FamilyMemberCardProps {
  name: string | null;
  relationship: string | null;
  dob: string | null;
  gender: string | null;
  memberNumber: string | null;
}

const FamilyMemberCard = ({ name, relationship, dob, gender, memberNumber }: FamilyMemberCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!name && !relationship && !dob && !gender) {
    return null;
  }

  // Determine background color based on relationship and gender
  const getBgColor = () => {
    if (relationship === 'spouse') {
      return 'bg-[#E5DEFF] border-[#7E69AB]/20 hover:border-[#7E69AB]/40';
    }
    if (relationship === 'dependant') {
      return gender === 'male' 
        ? 'bg-[#D3E4FD] border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40'
        : 'bg-[#FFDEE2] border-[#D946EF]/20 hover:border-[#D946EF]/40';
    }
    return 'bg-[#F2FCE2] border-[#7EBF8E]/20 hover:border-[#7EBF8E]/40';
  };

  return (
    <Card className={`p-4 ${getBgColor()} transition-all duration-300`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-[#0EA5E9]/10">
              <Users className="w-5 h-5 text-[#0EA5E9]" />
            </div>
            <div>
              <h3 className="font-medium text-[#1A1F2C]">{name}</h3>
              <p className="text-sm text-[#403E43] capitalize">{relationship}</p>
            </div>
          </div>
          <CollapsibleTrigger>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-4">
          <Table>
            <TableBody>
              {memberNumber && (
                <TableRow className="border-b border-[#0EA5E9]/10">
                  <TableCell className="py-2 text-[#1A1F2C] font-medium">Member Number</TableCell>
                  <TableCell className="py-2 text-[#403E43]">{memberNumber}</TableCell>
                </TableRow>
              )}
              
              {relationship && (
                <TableRow className="border-b border-[#0EA5E9]/10">
                  <TableCell className="py-2 text-[#1A1F2C] font-medium">Relationship</TableCell>
                  <TableCell className="py-2 text-[#403E43] capitalize">{relationship}</TableCell>
                </TableRow>
              )}
              
              {dob && (
                <TableRow className="border-b border-[#0EA5E9]/10">
                  <TableCell className="py-2 text-[#1A1F2C] font-medium">Date of Birth</TableCell>
                  <TableCell className="py-2 text-[#403E43]">{formatDate(dob)}</TableCell>
                </TableRow>
              )}
              
              {gender && (
                <TableRow className="border-b border-[#0EA5E9]/10">
                  <TableCell className="py-2 text-[#1A1F2C] font-medium">Gender</TableCell>
                  <TableCell className="py-2 text-[#403E43] capitalize">{gender}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FamilyMemberCard;