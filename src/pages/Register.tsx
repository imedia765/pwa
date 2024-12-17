import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoSection } from "@/components/registration/PersonalInfoSection";
import { NextOfKinSection } from "@/components/registration/NextOfKinSection";
import { SpousesSection } from "@/components/registration/SpousesSection";
import { DependantsSection } from "@/components/registration/DependantsSection";
import { MembershipSection } from "@/components/registration/MembershipSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { RegistrationStateHandler } from "@/components/registration/RegistrationStateHandler";
import { supabase } from "@/integrations/supabase/client";
import { 
  createAuthUser, 
  createOrUpdateMember,
  createOrUpdateProfile, 
  createOrUpdateRegistration 
} from "@/services/registrationService";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch } = useForm();
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as { 
    memberId?: string;
    prefilledData?: {
      fullName: string;
      address: string;
      town: string;
      postCode: string;
      mobile: string;
      dob: string;
      gender: string;
      maritalStatus: string;
      email: string;
    };
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log("Starting registration process with data:", { ...data, collectorId: selectedCollectorId });

      if (!selectedCollectorId) {
        toast({
          title: "Registration failed",
          description: "Please select a collector",
          variant: "destructive",
        });
        return;
      }

      // Create auth user if this is a new registration
      if (!state?.memberId) {
        const authData = await createAuthUser(data.email, data.password);
        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        // Create or update member record
        const member = await createOrUpdateMember(state?.memberId, data, selectedCollectorId);
        
        // Create or update profile
        await createOrUpdateProfile(authData.user.id, data.email);
        
        // Create or update registration
        await createOrUpdateRegistration(member.id, !state?.memberId);

        toast({
          title: "Registration successful",
          description: "Your registration has been submitted and is pending approval.",
        });
      } else {
        // Update existing member
        const member = await createOrUpdateMember(state.memberId, data, selectedCollectorId);
        
        // Update profile and registration for existing member
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await createOrUpdateProfile(user.id, data.email);
          await createOrUpdateRegistration(member.id, false);
        }

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
      
      // Redirect to admin page
      navigate("/admin");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <RegistrationStateHandler />
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-2xl text-center text-primary">
            {state?.memberId ? "Update Profile" : "PWA Burton On Trent Registration Form"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              Your personal information will be processed in accordance with our Privacy Policy and the GDPR.
              We collect this information to manage your membership and provide our services.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 divide-y divide-gray-200">
              <PersonalInfoSection register={register} setValue={setValue} watch={watch} />
              <NextOfKinSection />
              <SpousesSection />
              <DependantsSection />
              <MembershipSection onCollectorChange={setSelectedCollectorId} />
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (state?.memberId ? "Update Profile" : "Submit Registration")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}