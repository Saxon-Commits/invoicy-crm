// supabase/functions/check-stripe-account-status/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
import Stripe from 'https://esm.sh/stripe@12.5.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    // --- ROBUST PROFILE HANDLING ---
    // Use .maybeSingle() to prevent an error if the profile doesn't exist yet
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_setup_complete')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    
    // If no profile or no account ID, it's definitely not set up.
    if (!profile || !profile.stripe_account_id) {
      return new Response(JSON.stringify({ setupComplete: false, message: 'No Stripe account ID found.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // If setup is already marked as complete, no need to check again.
    if (profile.stripe_account_setup_complete) {
      return new Response(JSON.stringify({ setupComplete: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.charges_enabled) {
      await supabase.from('profiles').update({ stripe_account_setup_complete: true }).eq('id', user.id);
      return new Response(JSON.stringify({ setupComplete: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ setupComplete: false }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});