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

    // First try to sign in, regardless of whether they have an auth_user_id
    // This handles cases where the auth account exists but wasn't properly linked
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: member.email || `${cleanMemberId}@temp.pwaburton.org`,
      password: cleanMemberId
    });

    // If sign in worked and we just need to link the account
    if (signInData?.user && !member.auth_user_id) {
      const { error: updateError } = await supabase
        .from('members')
        .update({ 
          auth_user_id: signInData.user.id,
          email_verified: true
        })
        .eq('member_number', cleanMemberId)
        .single();

      if (updateError) {
        console.error('Error linking existing auth account:', updateError);
      }

      console.log("Successfully linked existing auth account");
      navigate("/admin");
      return;
    }

    // If sign in failed and they don't have a linked auth account, create one
    if (signInError && !member.auth_user_id) {
      console.log("Creating new auth account");
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: member.email || `${cleanMemberId}@temp.pwaburton.org`,
        password: cleanMemberId,
        options: {
          data: {
            member_number: cleanMemberId
          }
        }
      });

      if (signUpError) {
        console.error('Error creating auth account:', signUpError);
        throw new Error("Failed to create account. Please try again or contact support.");
      }

      if (!signUpData?.user) {
        throw new Error("Failed to create account");
      }

      // Link the new auth account
      const { error: updateError } = await supabase
        .from('members')
        .update({ 
          auth_user_id: signUpData.user.id,
          email_verified: true
        })
        .eq('member_number', cleanMemberId)
        .single();

      if (updateError) {
        console.error('Error linking new auth account:', updateError);
        throw new Error("Account created but failed to update member record");
      }

      console.log("Successfully created and linked new auth account");
      navigate("/admin");
      return;
    }

    // If we get here and sign in failed, but they have an auth_user_id
    // then something is wrong with their credentials
    if (signInError && member.auth_user_id) {
      console.error('Sign in failed for existing account:', signInError);
      throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
    }

    // If we get here and sign in worked, just navigate
    if (signInData?.user) {
      console.log("Login successful");
      navigate("/admin");
      return;
    }

    // If we somehow get here, something unexpected happened
    throw new Error("Login failed. Please try again.");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}