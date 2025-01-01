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

    // Check if member already has an auth account
    if (member.auth_user_id) {
      // If they do, try to sign in with their email
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: member.email || `${cleanMemberId}@temp.pwaburton.org`,
        password: cleanMemberId
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
      }

      if (!signInData?.user) {
        throw new Error("Login failed. Please try again.");
      }

      console.log("Login successful");
      navigate("/admin");
      return;
    }

    // If no auth account exists, create one
    const email = member.email || `${cleanMemberId}@temp.pwaburton.org`;
    console.log("Creating auth account for member:", { email });

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: cleanMemberId,
      options: {
        data: {
          member_number: cleanMemberId
        }
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw new Error("Failed to create account. Please contact support.");
    }

    if (!signUpData?.user) {
      throw new Error("Failed to create account");
    }

    // Update member record with new auth user id
    const { error: updateError } = await supabase
      .from('members')
      .update({ 
        auth_user_id: signUpData.user.id,
        email_verified: true
      })
      .eq('member_number', cleanMemberId)
      .single();

    if (updateError) {
      console.error('Error updating member:', updateError);
      throw new Error("Account created but failed to update member record");
    }

    console.log("Auth account created and linked successfully");
    navigate("/admin");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}