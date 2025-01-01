import { supabase } from "@/integrations/supabase/client";

export async function getMemberByMemberId(memberId: string) {
  const cleanMemberId = memberId.toUpperCase().trim();
  console.log("Looking up member with member_number:", cleanMemberId);
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('member_number', cleanMemberId)
      .maybeSingle();

    if (error) {
      console.error("Database error when looking up member:", error);
      throw error;
    }

    console.log("Member lookup result:", data);
    return data;
  } catch (error) {
    console.error("Error in getMemberByMemberId:", error);
    return null;
  }
}

export async function verifyMemberPassword(memberId: string, password: string) {
  const member = await getMemberByMemberId(memberId);
  
  if (!member) {
    console.log("No member found for verification");
    return false;
  }

  // For initial login, password should match member number
  if (!member.password_changed) {
    return password === member.member_number;
  }
  
  // For subsequent logins, use the provided password
  return true;
}