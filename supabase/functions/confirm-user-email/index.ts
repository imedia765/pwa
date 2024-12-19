import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json()
    console.log('Confirming email for:', email)

    if (!email) {
      throw new Error('Email is required')
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user by email with retries
    let users = null;
    let getUserError = null;
    const maxRetries = 3;
    
    for (let i = 0; i < maxRetries; i++) {
      console.log(`Attempt ${i + 1}/${maxRetries} to get user`);
      
      const response = await supabaseAdmin.auth.admin.listUsers({
        filter: { email: email }
      });
      
      if (!response.error && response.data.users.length > 0) {
        users = response.data.users;
        break;
      }
      
      getUserError = response.error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }

    if (getUserError || !users || users.length === 0) {
      console.error('Error getting user:', getUserError || 'No user found');
      throw new Error(getUserError?.message || 'User not found');
    }

    console.log('Found user:', users[0].id);

    // Update the user's email confirmation status
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      users[0].id,
      { email_confirmed: true }
    )

    if (updateError) {
      console.error('Error updating user:', updateError);
      throw updateError;
    }

    console.log('Successfully confirmed email for user:', users[0].id);

    return new Response(
      JSON.stringify({ message: 'Email confirmed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in confirm-user-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})