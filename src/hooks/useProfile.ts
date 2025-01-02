import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/integrations/supabase/types";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get session");
      }

      if (!session?.user) {
        console.log("No authenticated session found");
        throw new Error("No user found");
      }

      console.log("Fetching profile for user:", session.user.id);

      // Fetch profile by auth_user_id
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("auth_user_id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }

      console.log("Found profile:", data);
      return data as Profile;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
};