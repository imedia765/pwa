import { supabase } from "@/integrations/supabase/client";

export const handleFirstTimeAuth = async (memberId: string, password: string) => {
  console.log("Handling first time auth for member:", memberId);

  // Step 1: Verify the member exists and get their details
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('member_number', memberId.toUpperCase())
    .maybeSingle();

  if (memberError) {
    console.error("Error checking member:", memberError);
    throw new Error("Error verifying member details");
  }

  if (!member) {
    console.error("No member found with ID:", memberId);
    throw new Error("Invalid Member ID. Please check your credentials and try again.");
  }

  // Step 2: Verify the password matches their member ID (case-insensitive)
  if (password.toUpperCase() !== memberId.toUpperCase()) {
    throw new Error("For first-time login, your password must match your Member ID");
  }

  try {
    // Step 3: Create or sign in with temporary email
    const tempEmail = `${memberId.toLowerCase()}@temp.pwaburton.org`;
    console.log("Setting up auth for:", tempEmail);

    // First try to sign in with the temporary credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: password.toUpperCase()
    });

    // If sign in fails, create the auth user first
    if (signInError) {
      console.log("Sign in failed, attempting to create user:", signInError);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: password.toUpperCase(),
      });

      if (signUpError) {
        console.error("Error creating auth user:", signUpError);
        throw signUpError;
      }

      // Try signing in again after creating the user
      const { error: retrySignInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: password.toUpperCase()
      });

      if (retrySignInError) {
        console.error("Error signing in after user creation:", retrySignInError);
        throw retrySignInError;
      }
    }

    console.log("Sign in successful");

    // Step 4: Update member record to reflect first-time login status
    const { error: updateError } = await supabase
      .from('members')
      .update({
        first_time_login: true,
        password_changed: false,
        email_verified: false,
        profile_completed: false,
        registration_completed: false,
        email: tempEmail
      })
      .eq('id', member.id);

    if (updateError) {
      console.error("Error updating member status:", updateError);
      throw new Error("Failed to update member status");
    }

    return { success: true };

  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};