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
    console.error("Member lookup error:", memberError);
    throw new Error("Error looking up member details");
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
    // Using a more standard email domain that Supabase will accept
    const tempEmail = `${memberId.toLowerCase()}@temporary.pwaburton.com`;
    console.log("Setting up auth for:", tempEmail);

    // Always try to create the user first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tempEmail,
      password: password.toUpperCase(),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          member_id: member.id
        }
      }
    });

    if (signUpError) {
      // If user already exists, try signing in directly
      if (signUpError.message.includes("User already registered")) {
        console.log("User exists, attempting sign in");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: password.toUpperCase()
        });

        if (signInError) {
          console.error("Error signing in:", signInError);
          throw signInError;
        }

        console.log("Sign in successful for existing user");
      } else {
        console.error("Error creating auth user:", signUpError);
        throw signUpError;
      }
    } else {
      console.log("New user created successfully");
    }

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