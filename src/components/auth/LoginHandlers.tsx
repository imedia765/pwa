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

    // First try to sign in with existing credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: cleanMemberId // Use member ID as password
    });

    if (signInError) {
      console.error('Initial sign in attempt failed:', signInError);
      
      // If no auth account exists, create one
      if (!member.auth_user_id) {
        console.log("No auth account found, creating new one");
        
        // First, sign up the user
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

        if (!signUpData.user) {
          throw new Error("Failed to create auth account");
        }

        // Link the auth account to the member record
        const { error: updateError } = await supabase
          .from('members')
          .update({ 
            auth_user_id: signUpData.user.id,
            email_verified: true
          })
          .eq('member_number', cleanMemberId);

        if (updateError) {
          console.error('Error linking auth account:', updateError);
          throw new Error("Account created but failed to update member record");
        }

        // Now try to sign in with the new account
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: cleanMemberId
        });

        if (newSignInError) {
          console.error('Error signing in with new account:', newSignInError);
          throw new Error("Account created but unable to sign in. Please try again.");
        }

        console.log("Successfully created account and signed in");
        navigate("/admin");
        return;
      }

      // If we have an auth_user_id but sign-in failed, credentials are wrong
      throw new Error("Invalid credentials. Please contact support if you need help accessing your account.");
    }

    // Successful sign in with existing account
    if (signInData?.user) {
      console.log("Login successful with existing account");
      navigate("/admin");
      return;
    }

    throw new Error("Login failed. Please contact support.");

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}