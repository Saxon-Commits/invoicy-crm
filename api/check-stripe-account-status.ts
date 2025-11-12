import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2022-11-15',
});

// Helper to set CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // *** FIX: Allow POST ***
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }
  
  // *** FIX: Explicitly handle POST or GET, reject others ***
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    if (!req.headers.authorization) {
      console.error('No authorization header received.');
      return res.status(401).json({ error: 'No authorization header received.' });
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Supabase auth error:', authError.message);
      return res.status(401).json({ error: `Supabase auth error: ${authError.message}` });
    }
    if (!user) {
      console.error('Supabase user not found. Token might be invalid or expired.');
      return res.status(401).json({ error: 'User not found. Invalid token.' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_setup_complete')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile || !profile.stripe_account_id) {
      return res.status(200).json({ setupComplete: false, message: 'No Stripe account ID found.' });
    }

    if (profile.stripe_account_setup_complete) {
      return res.status(200).json({ setupComplete: true });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.charges_enabled) {
      await supabase.from('profiles').update({ stripe_account_setup_complete: true }).eq('id', user.id);
      return res.status(200).json({ setupComplete: true });
    }

    return res.status(200).json({ setupComplete: false });
  } catch (error: any) {
    console.error('Full error in check-stripe-account-status:', error.message);
    return res.status(500).json({ error: error.message });
  }
}