import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/hooks/use-toast";

export const handleMemberIdLogin = async (
  memberId: string,
  password: string,
  { toast }: ToastType
) => {
  try {
    console.log("Attempting member ID login for:", memberId);

    // First get the member's data using member number
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('member_number', memberId)
      .maybeSingle();

    if (memberError) {
      console.error("Member lookup error:", memberError);
      throw new Error("Error looking up member");
    }

    if (!memberData) {
      console.error("No member found with ID:", memberId);
      throw new Error("Member not found. Please check your Member ID.");
    }

    // For first-time login, the password should match the member ID
    if (memberData.first_time_login && password !== memberId) {
      throw new Error("For first-time login, use your Member ID as the password.");
    }

    // If no email is set, use the temporary email
    const loginEmail = memberData.email || `${memberId.toLowerCase()}@temp.pwaburton.org`;

    console.log("Attempting login with email:", loginEmail);

    // For first-time login, create the auth user first
    if (memberData.first_time_login) {
      console.log("First time login, creating auth user");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: password,
        options: {
          data: {
            member_id: memberData.id,
            member_number: memberId,
          }
        }
      });

      if (signUpError) {
        console.error("Error creating auth user:", signUpError);
        throw signUpError;
      }

      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Clear any existing session first
    await supabase.auth.signOut();

    // Sign in with email and password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      if (signInError.message.includes("Invalid login credentials")) {
        throw new Error("Invalid password. For first-time login, use your Member ID as the password.");
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
          email: loginEmail,
          user_id: signInData.user.id,
          full_name: memberData.full_name,
          member_number: memberData.member_number,
          date_of_birth: memberData.date_of_birth,
          gender: memberData.gender,
          marital_status: memberData.marital_status,
          phone: memberData.phone,
          address: memberData.address,
          postcode: memberData.postcode,
          town: memberData.town,
          profile_completed: memberData.profile_completed
        });

      if (createError) {
        console.error("Error creating profile:", createError);
        throw createError;
      }
    }

    // If this was a first-time login, update the member record
    if (memberData.first_time_login) {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          first_time_login: false,
          password_changed: false
        })
        .eq('id', memberData.id);

      if (updateError) {
        console.error("Error updating member first_time_login:", updateError);
        // Don't throw here, as login was successful
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