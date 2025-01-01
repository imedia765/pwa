import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getMemberByMemberId } from "@/utils/memberAuth";

export async function handleMemberIdLogin(memberId: string, password: string, navigate: ReturnType<typeof useNavigate>) {
  try {
    const cleanMemberId = memberId.toUpperCase().trim();
    console.log("Attempting login with member_number:", cleanMemberId);
    
    // First, look up the member
    const member = await getMemberByMemberId(cleanMemberId);
    
    if (!member) {
      console.error("Member lookup failed:", { member_number: cleanMemberId });
      throw new Error("Member ID not found");
    }
    
    // Use the email stored in the database
    const email = member.email;
    
    if (!email) {
      throw new Error("No email associated with this member ID");
    }
    
    console.log("Found member:", { member_number: member.member_number, email });

    // Try to sign in with email
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: member.member_number // Use member_number as password
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
    }

    if (!signInData?.user) {
      throw new Error("Login failed. Please try again.");
    }

    // If not already linked, update member record with auth user id
    if (!member.auth_user_id) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ 
          auth_user_id: signInData.user.id,
          email_verified: true
        })
        .eq('member_number', member.member_number)
        .single();

      if (updateError) {
        console.error('Error updating member:', updateError);
        // Continue anyway since sign in worked
      }
    }
    
    console.log("Login successful");
    navigate("/admin");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}