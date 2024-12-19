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
    const tempEmail = `${memberId.toLowerCase()}@pwaburton.temporary.org`;
    console.log("Setting up auth for:", tempEmail);
    const upperPassword = password.toUpperCase();

    // Try to sign in first in case the user already exists
    try {
      console.log("Attempting sign in with:", { email: tempEmail, password: upperPassword });
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: upperPassword,
      });

      if (!signInError && signInData.user) {
        console.log("Sign in successful for existing user:", signInData);
        await updateMemberStatus(member.id, tempEmail);
        return { success: true };
      }

      console.log("Sign in failed, will try creating user:", signInError);
    } catch (signInError) {
      console.log("Initial sign in attempt failed:", signInError);
    }

    // If sign in failed, try to create the user
    console.log("Creating new user with:", { email: tempEmail, password: upperPassword });
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tempEmail,
      password: upperPassword,
      options: {
        data: {
          member_id: member.id,
          member_number: memberId.toUpperCase(),
        }
      }
    });

    if (signUpError) {
      console.error("Error creating auth user:", signUpError);
      throw signUpError;
    }

    console.log("User created successfully:", signUpData);

    // Wait a moment before attempting to sign in
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try signing in after creating the user
    console.log("Attempting final sign in");
    const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: upperPassword,
    });

    if (finalSignInError || !finalSignInData.user) {
      console.error("Error signing in after user creation:", finalSignInError);
      throw finalSignInError || new Error("Failed to sign in after user creation");
    }

    console.log("Final sign in successful:", finalSignInData);

    // Update member status
    await updateMemberStatus(member.id, tempEmail);

    return { success: true };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

const updateMemberStatus = async (memberId: string, email: string) => {
  const { error: updateError } = await supabase
    .from('members')
    .update({
      first_time_login: true,
      password_changed: false,
      email_verified: false,
      profile_completed: false,
      registration_completed: false,
      email: email
    })
    .eq('id', memberId);

  if (updateError) {
    console.error("Error updating member status:", updateError);
    throw new Error("Failed to update member status");
  }
};