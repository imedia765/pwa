import { supabase } from "@/integrations/supabase/client";

export const handleFirstTimeAuth = async (memberId: string, password: string) => {
  console.log("Handling first time auth for member:", memberId);

  // First verify the member exists and credentials are correct
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, email, default_password_hash')
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

  // Verify password matches member ID for first login
  if (password.toUpperCase() !== memberId.toUpperCase()) {
    throw new Error("For first-time login, your password should be the same as your Member ID");
  }

  try {
    // Create auth user with temporary email if doesn't exist
    const tempEmail = `${memberId.toLowerCase()}@temp.pwaburton.org`;
    console.log("Setting up auth for:", tempEmail);
    
    // First try to create the auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tempEmail,
      password: password.toUpperCase(),
    });

    if (signUpError && !signUpError.message.includes("User already registered")) {
      console.error("Error creating auth user:", signUpError);
      throw signUpError;
    }

    // Now attempt to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: password.toUpperCase()
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }

    console.log("Sign in successful:", signInData);

    // Update member to mark as pending profile update
    const { error: updateError } = await supabase
      .from('members')
      .update({ 
        first_time_login: true,
        profile_updated: false,
        password_changed: false,
        email_verified: false,
        profile_completed: false,
        registration_completed: false,
        email: tempEmail
      })
      .eq('id', member.id);

    if (updateError) {
      console.error("Error updating member status:", updateError);
      throw updateError;
    }

    return signInData;

  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};