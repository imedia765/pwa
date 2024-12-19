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

  // Only proceed with sign-in if we haven't set up auth yet
  if (!member.email?.includes('@temp.pwaburton.org')) {
    // Create temporary email only at this point
    const tempEmail = `${memberId.toLowerCase()}@temp.pwaburton.org`;
    console.log("Using temporary email for auth:", tempEmail);

    try {
      // First try to sign in (in case user exists)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: password,
      });

      if (signInError) {
        console.log("Sign in failed (expected for new users), proceeding with signup");
        
        // If sign in fails, create new auth user
        const { error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: password,
        });

        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw signUpError;
        }

        // Update member with temporary email
        const { error: updateError } = await supabase
          .from('members')
          .update({ email: tempEmail })
          .eq('id', member.id);

        if (updateError) {
          console.error("Error updating member with temp email:", updateError);
          throw updateError;
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  } else {
    // If temp email exists, just sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: member.email,
      password: password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }
  }
};