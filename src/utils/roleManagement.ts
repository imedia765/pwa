import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/roles";

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  console.log('Attempting to update user role:', { userId, newRole });
  
  const { data, error } = await supabase
    .from('members')
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('auth_user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }

  console.log('Successfully updated user role:', data);
  return data;
};

export const createCollectorProfile = async (userId: string, email: string) => {
  console.log('Creating collector profile for:', { userId, email });
  
  const { data, error } = await supabase
    .from('collectors')
    .insert({
      name: email.split('@')[0], // Use email username as initial name
      email: email,
      prefix: email.charAt(0).toUpperCase(), // Use first letter as initial prefix
      number: '01', // Start with 01
      active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collector profile:', error);
    throw error;
  }

  console.log('Successfully created collector profile:', data);
  return data;
};