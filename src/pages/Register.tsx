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
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { RegistrationStateHandler } from "@/components/registration/RegistrationStateHandler";

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

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      if (state?.memberId) {
        // Update existing member
        const { error: memberError } = await supabase
          .from('members')
          .update({
            collector_id: selectedCollectorId,
            full_name: data.fullName,
            email: data.email,
            phone: data.mobile,
            address: data.address,
            town: data.town,
            postcode: data.postCode,
            date_of_birth: data.dob,
            gender: data.gender,
            marital_status: data.maritalStatus,
            profile_updated: true,
            email_verified: false
          })
          .eq('member_number', state.memberId)
          .select();

        if (memberError) {
          console.error("Member update error:", memberError);
          throw memberError;
        }

        // Update or create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: data.email,
            role: 'member',
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Profile update error:", profileError);
          throw profileError;
        }

        // Update registration status
        const { error: registrationError } = await supabase
          .from('registrations')
          .upsert({
            member_id: state.memberId,
            status: 'completed',
            updated_at: new Date().toISOString()
          });

        if (registrationError) {
          console.error("Registration update error:", registrationError);
          throw registrationError;
        }

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        
        // Redirect to admin page after successful update
        navigate("/admin");
      } else {
        // Create new member
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert({
            collector_id: selectedCollectorId,
            full_name: data.fullName,
            email: data.email,
            phone: data.mobile,
            address: data.address,
            town: data.town,
            postcode: data.postCode,
            date_of_birth: data.dob,
            gender: data.gender,
            marital_status: data.maritalStatus,
            status: 'pending',
            profile_updated: true,
            member_number: '', // This will be auto-generated by the trigger
          })
          .select()
          .single();

        if (memberError) {
          console.error("Member creation error:", memberError);
          throw memberError;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: data.email,
            role: 'member',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }

        // Create registration record
        const { error: registrationError } = await supabase
          .from('registrations')
          .insert({
            member_id: newMember.id,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (registrationError) {
          console.error("Registration creation error:", registrationError);
          throw registrationError;
        }

        toast({
          title: "Registration successful",
          description: "Your registration has been submitted and is pending approval.",
        });
        
        // Redirect to admin page after successful registration
        navigate("/admin");
      }
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