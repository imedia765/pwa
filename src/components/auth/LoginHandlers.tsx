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

    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: cleanMemberId // Use member_number as password
    });

    // If sign in fails, create the auth user
    if (signInError) {
      console.log("Sign in failed, creating auth user");
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: cleanMemberId,
        options: {
          data: {
            member_number: cleanMemberId,
            full_name: member.full_name
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

      console.log("Auth user created successfully");
      navigate("/admin");
      return;
    }

    // If sign in succeeded
    if (signInData?.user) {
      // If not already linked, update member record with auth user id
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
          console.error('Error updating member:', updateError);
          // Continue anyway since sign in worked
        }
      }
      
      console.log("Login successful");
      navigate("/admin");
      return;
    }

    throw new Error("Login failed. Please try again.");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}