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

    console.log("Found member:", member);

    // Use member's email or generate a temporary one
    const email = member.email || `${cleanMemberId}@temp.pwaburton.org`;

    // Attempt to sign in with member number as password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: cleanMemberId
    });

    if (signInError) {
      console.error('Sign in failed:', signInError);
      throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
    }

    if (signInData?.user) {
      // If sign in worked but we need to link the account
      if (!member.auth_user_id) {
        const { error: updateError } = await supabase
          .from('members')
          .update({ 
            auth_user_id: signInData.user.id,
            email_verified: true
          })
          .eq('member_number', cleanMemberId)
          .single();

        if (updateError) {
          console.error('Error linking auth account:', updateError);
          throw new Error("Error updating member record");
        }
      }

      console.log("Login successful");
      navigate("/admin");
      return;
    }

    throw new Error("Login failed. Please contact support.");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}