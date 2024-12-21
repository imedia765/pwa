import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

type ProfileData = {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
};

export const ProfileCompletionGuard = ({ children }: ProfileCompletionGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, refetch } = useQuery({
    queryKey: ['profile-completion-check'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.email) throw new Error("No authenticated user");

        console.log("Checking profile completion for user:", user.email);

        // Get member data to check profile completion
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (memberError) {
          console.error("Error fetching member data:", memberError);
          throw memberError;
        }

        if (!memberData) {
          console.log("No member data found, creating new profile");
          const { data: newMember, error: createError } = await supabase
            .from('members')
            .insert({
              email: user.email,
              member_number: 'PENDING',
              full_name: user.user_metadata.full_name || 'New Member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_completed: false
            })
            .select()
            .single();

          if (createError) throw createError;
          return {
            id: newMember.id,
            email: newMember.email,
            created_at: newMember.created_at,
            updated_at: newMember.updated_at,
            profile_completed: false
          } as ProfileData;
        }

        // Check if all required fields are filled
        const requiredFields = [
          'full_name',
          'email',
          'phone',
          'address',
          'town',
          'postcode',
          'date_of_birth',
          'gender',
          'marital_status'
        ];

        const isProfileComplete = requiredFields.every(field => 
          memberData[field] !== null && 
          memberData[field] !== undefined && 
          memberData[field] !== ''
        );

        console.log("Profile completion check:", {
          isProfileComplete,
          memberData
        });

        // If profile is complete but not marked as complete, update the flag
        if (isProfileComplete && !memberData.profile_completed) {
          const { error: updateError } = await supabase
            .from('members')
            .update({ profile_completed: true })
            .eq('id', memberData.id);

          if (updateError) {
            console.error("Error updating profile completion status:", updateError);
          }
          
          // Refetch to get the updated status
          return refetch();
        }
        
        return {
          id: memberData.id,
          email: memberData.email,
          created_at: memberData.created_at,
          updated_at: memberData.updated_at,
          profile_completed: isProfileComplete || memberData.profile_completed
        } as ProfileData;
      } catch (error) {
        console.error("Profile check error:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000, // Consider data stale after 1 second
  });

  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Allow access to profile page always
    if (currentPath === '/admin/profile') {
      return;
    }

    // Check if profile is incomplete
    if (profile && !profile.profile_completed) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before accessing other pages",
        variant: "destructive",
      });
      navigate('/admin/profile');
    }
  }, [profile, navigate, toast]);

  // If on profile page and profile is incomplete, show alert
  if (window.location.pathname === '/admin/profile' && profile && !profile.profile_completed) {
    return (
      <>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700">
            Please complete all profile fields before accessing other pages. This is required for your membership.
          </AlertDescription>
        </Alert>
        {children}
      </>
    );
  }

  return <>{children}</>;
};