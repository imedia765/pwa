import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/hooks/use-toast";

export const handleEmailLogin = async (
  email: string,
  password: string,
  { toast }: ToastType
) => {
  try {
    console.log("Attempting email login for:", email.toLowerCase());

    // First check if the user exists in the members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('email, email_verified, first_time_login, profile_completed')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (memberError) {
      console.error("Error checking member:", memberError);
      throw new Error("Error verifying member status");
    }

    if (!memberData) {
      console.error("No member found with email:", email);
      throw new Error("No account found with this email address");
    }

    if (memberData.first_time_login) {
      console.error("Member needs to use first-time login:", email);
      throw new Error("Please use the Member ID tab for your first login");
    }

    // Clear any existing session first
    await supabase.auth.signOut();

    // Attempt to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      
      if (signInError.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password");
      }
      
      throw signInError;
    }

    if (!signInData.user) {
      throw new Error("No user data returned after login");
    }

    console.log("User signed in successfully:", signInData.user.id);

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking profile:", profileError);
      throw profileError;
    }

    // If no profile exists, create one with member data
    if (!existingProfile) {
      console.log("Creating new profile for user:", signInData.user.id);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: signInData.user.id,
          email: email.toLowerCase(),
          user_id: signInData.user.id,
          full_name: memberData.full_name,
          member_number: memberData.member_number,
          profile_completed: memberData.profile_completed
        });

      if (createError) {
        console.error("Error creating profile:", createError);
        throw createError;
      }
    }

    return true;
  } catch (error) {
    console.error("Login process error:", error);
    toast({
      title: "Login failed",
      description: error instanceof Error ? error.message : "An error occurred during login",
      variant: "destructive",
    });
    return false;
  }
};