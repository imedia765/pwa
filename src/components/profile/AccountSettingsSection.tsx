import { useState, useRef } from "react";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextOfKinSection } from "@/components/registration/NextOfKinSection";
import { SpousesSection } from "@/components/registration/SpousesSection";
import { DependantsSection } from "@/components/registration/DependantsSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { Member } from "@/components/members/types";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInfoForm } from "./PersonalInfoForm";

interface AccountSettingsSectionProps {
  memberData?: Member;
}

export const AccountSettingsSection = ({ memberData }: AccountSettingsSectionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const spousesRef = useRef<{ saveSpouses: () => Promise<void> }>(null);
  const dependantsRef = useRef<{ saveDependants: () => Promise<void> }>(null);
  
  const [formData, setFormData] = useState({
    full_name: memberData?.full_name || "",
    address: memberData?.address || "",
    town: memberData?.town || "",
    postcode: memberData?.postcode || "",
    email: memberData?.email || "",
    phone: memberData?.phone || "",
    date_of_birth: memberData?.date_of_birth || "",
    marital_status: memberData?.marital_status || "",
    gender: memberData?.gender || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!memberData?.id) {
      toast({
        title: "Error",
        description: "Member ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Updating profile with data:", formData);

      // Update member profile
      const { error: memberError } = await supabase
        .from('members')
        .update({
          full_name: formData.full_name,
          address: formData.address,
          town: formData.town,
          postcode: formData.postcode,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          marital_status: formData.marital_status,
          gender: formData.gender,
          updated_at: new Date().toISOString(),
          profile_updated: true
        })
        .eq('id', memberData.id);

      if (memberError) throw memberError;

      // Save spouses and dependants
      if (spousesRef.current?.saveSpouses) {
        await spousesRef.current.saveSpouses();
      }
      if (dependantsRef.current?.saveDependants) {
        await dependantsRef.current.saveDependants();
      }

      // Update profiles table using auth_user_id instead of member_number
      if (memberData.auth_user_id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            address: formData.address,
            town: formData.town,
            postcode: formData.postcode,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth || null,
            marital_status: formData.marital_status,
            gender: formData.gender,
            profile_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', memberData.auth_user_id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          throw profileError;
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button 
          variant="default"
          className="flex items-center gap-2 w-full justify-between bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            <span>Profile Settings</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-6 pt-4">
        <PersonalInfoForm 
          formData={formData}
          onInputChange={handleInputChange}
        />

        <div className="space-y-6 pt-4">
          <NextOfKinSection />
          <SpousesSection 
            memberId={memberData?.id} 
            ref={spousesRef}
          />
          <DependantsSection 
            memberId={memberData?.id}
            ref={dependantsRef}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};