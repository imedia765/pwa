import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ProfileFormFields } from "./ProfileFormFields";
import { PasswordFields } from "./PasswordFields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfileAndEmail } from "@/utils/profileUpdateHandler";
import { validateProfileForm } from "@/utils/profileValidation";

export const PasswordChangeForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkSession } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        
        const isValid = await checkSession();
        if (!isValid) {
          console.log("No valid session, redirecting to login");
          navigate("/login");
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.email) {
          console.error("Error fetching auth user:", userError);
          throw new Error(userError?.message || "No authenticated user found");
        }

        console.log("Found authenticated user:", user.email);

        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (memberError && memberError.code !== 'PGRST116') {
          console.error("Member data fetch error:", memberError);
          throw memberError;
        }

        if (!memberData) {
          console.log("No member found for email:", user.email);
          const { data: newMember, error: createError } = await supabase
            .from('members')
            .insert({
              email: user.email,
              member_number: 'PENDING',
              full_name: user.user_metadata.full_name || 'New Member',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              first_time_login: true,
              status: 'active',
              membership_type: 'standard'
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating new member:", createError);
            throw createError;
          }

          console.log("Created new member record:", newMember);
          setUserData(newMember);
          setIsFirstTimeLogin(true);
        } else {
          console.log("Found existing member:", memberData);
          setUserData(memberData);
          setIsFirstTimeLogin(memberData.first_time_login || false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try logging in again.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast, checkSession]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const errors: Record<string, string> = {};
      
      // Check required fields
      const requiredFields = [
        'fullName', 'email', 'phone', 'address', 'town', 
        'postcode', 'dob', 'gender', 'maritalStatus'
      ];

      requiredFields.forEach(field => {
        if (!formData.get(field)) {
          errors[field] = 'This field is required';
        }
      });

      // Validate email format
      const email = formData.get('email') as string;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors['email'] = 'Please enter a valid email address';
      }

      // Validate password match if changing password
      if (newPassword && newPassword !== confirmPassword) {
        errors['password'] = "Passwords don't match";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        throw new Error("Please fill in all required fields correctly");
      }
      
      // Perform the update
      await updateProfileAndEmail(formData, newPassword, userData.email);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully. Please check your email to verify your new email address.",
      });
      
      // After successful update, navigate to admin dashboard
      navigate("/admin");
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      {isFirstTimeLogin && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700">
            Welcome! Please complete your profile information and update your email. All fields are required for first-time login.
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfileFormFields 
          userData={userData} 
          isLoading={isLoading} 
          isRequired={true}
          errors={fieldErrors}
        />
        <PasswordFields
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          isLoading={isLoading}
          error={fieldErrors['password']}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </Card>
  );
};