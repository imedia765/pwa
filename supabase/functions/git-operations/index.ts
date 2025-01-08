import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting git operation...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid token');
    }

    const githubToken = Deno.env.get('GITHUB_PAT');
    if (!githubToken) {
      console.error('GitHub PAT not configured');
      throw new Error('GitHub token not configured');
    }

    const { branch = 'main' } = await req.json();
    const repoOwner = 'imedia765';
    const repoName = 's-935078';

    console.log(`Fetching latest commit SHA for ${repoOwner}/${repoName}:${branch}`);

    // Log operation start
    await supabase.from('git_operations_logs').insert({
      operation_type: 'push',
      status: 'started',
      created_by: user.id,
      message: `Starting push operation to ${repoOwner}/${repoName}:${branch}`
    });

    // First verify the repository exists and is accessible
    const repoCheckResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Supabase-Edge-Function'
        }
      }
    );

    if (!repoCheckResponse.ok) {
      const errorData = await repoCheckResponse.text();
      console.error('Repository check failed:', errorData);
      throw new Error(`Repository check failed: ${errorData}`);
    }

    // Get the latest commit SHA
    const shaResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Supabase-Edge-Function'
        }
      }
    );

    if (!shaResponse.ok) {
      const errorData = await shaResponse.text();
      console.error('SHA fetch failed:', errorData);
      throw new Error(`Branch not found: ${errorData}`);
    }

    const shaData = await shaResponse.json();
    console.log('Successfully retrieved SHA:', shaData);

    // Log success
    await supabase.from('git_operations_logs').insert({
      operation_type: 'push',
      status: 'completed',
      created_by: user.id,
      message: `Successfully retrieved latest commit SHA from ${repoOwner}/${repoName}:${branch}`
    });

    return new Response(
      JSON.stringify({ success: true, data: shaData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in git-operations:', error);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('git_operations_logs').insert({
      operation_type: 'push',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});