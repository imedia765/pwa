import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/hooks/use-toast";

export const handleEmailLogin = async (
  email: string,
  password: string,
  { toast }: ToastType
) => {
  try {
    console.log("Attempting email login for:", email);

    // First check if the user exists in the members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('email, email_verified, first_time_login')
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
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error checking profile:", profileError);
      throw profileError;
    }

    // If no profile exists, create one
    if (!existingProfile) {
      console.log("Creating new profile for user:", signInData.user.id);
      
      const { error: createError } = await supabase.rpc(
        'create_profile',
        {
          p_id: signInData.user.id,
          p_email: email.toLowerCase(),
          p_user_id: signInData.user.id
        }
      );

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