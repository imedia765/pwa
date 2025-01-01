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

    // If member doesn't have an auth account yet, create one
    if (!member.auth_user_id) {
      console.log("Creating new auth account for member");
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
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

      if (signUpData?.user) {
        // Link the new auth account to the member record
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
    }

    // For existing accounts, attempt to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: cleanMemberId
    });

    if (signInError) {
      console.error('Sign in failed:', signInError);
      throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
    }

    if (signInData?.user) {
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