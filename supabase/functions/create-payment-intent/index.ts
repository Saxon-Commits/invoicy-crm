import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
import Stripe from 'https://esm.sh/stripe@12.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_setup_complete')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile || !profile.stripe_account_id) {
      return new Response(JSON.stringify({ setupComplete: false, message: 'No Stripe account ID found.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // If setup is already marked as complete, no need to check again.
    if (profile.stripe_account_setup_complete) {
      return new Response(JSON.stringify({ setupComplete: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.charges_enabled) {
      await supabase.from('profiles').update({ stripe_account_setup_complete: true }).eq('id', user.id);
      return new Response(JSON.stringify({ setupComplete: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ setupComplete: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});