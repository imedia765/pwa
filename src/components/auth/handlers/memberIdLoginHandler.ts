import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/hooks/use-toast";

export const handleMemberIdLogin = async (
  memberId: string,
  password: string,
  { toast }: ToastType
) => {
  try {
    console.log("Attempting member ID login for:", memberId);

    // First check if the member exists
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        member_number,
        email,
        full_name,
        first_time_login,
        profile_completed,
        email_verified,
        default_password_hash,
        password_changed
      `)
      .eq('member_number', memberId.toUpperCase())
      .maybeSingle();

    if (memberError) {
      console.error("Error checking member:", memberError);
      throw new Error("Error verifying member status");
    }

    if (!memberData) {
      console.error("No member found with ID:", memberId);
      throw new Error("Invalid Member ID");
    }

    // Verify password hash matches
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== memberData.default_password_hash) {
      console.error("Password mismatch for member:", memberId);
      throw new Error("Invalid password");
    }

    // Use member's email if available, otherwise use member number
    const loginEmail = memberData.email || `${memberId.toLowerCase()}@member.pwaburton.org`;
    console.log("Attempting login with email:", loginEmail);

    // For first-time login, create the auth user
    if (memberData.first_time_login) {
      console.log("Creating new auth user for first-time login");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: password,
        options: {
          data: {
            member_id: memberData.id,
            member_number: memberData.member_number,
            email_verified: false,
            phone_verified: false
          }
        }
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("No user data returned after signup");
      }

      // Update member record to mark first time login complete and store auth user id
      const { error: updateError } = await supabase
        .from('members')
        .update({
          first_time_login: false,
          auth_user_id: signUpData.user.id, // Store the auth user ID
          updated_at: new Date().toISOString()
        })
        .eq('id', memberData.id);

      if (updateError) {
        console.error("Error updating member:", updateError);
        throw updateError;
      }

      console.log("First-time login successful for member:", memberId);
      return true;
    }

    // For subsequent logins, sign in with email and password
    console.log("Attempting regular sign in for member:", memberId);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      throw signInError;
    }

    if (!signInData.user) {
      throw new Error("No user data returned after login");
    }

    // Update the auth_user_id if it's not set
    if (!memberData.auth_user_id) {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          auth_user_id: signInData.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberData.id);

      if (updateError) {
        console.error("Error updating member auth_user_id:", updateError);
        // Don't throw here, as login was successful
      }
    }

    console.log("Regular login successful for member:", memberId);
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

// Helper function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};