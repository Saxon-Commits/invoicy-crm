import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  try {
    // ***
    // *** STEP 1: Authenticate the user with the ANON key and their token ***
    // ***
    const authClient = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '', // Use the ANON public key
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError) {
      console.error('Supabase auth error:', authError.message);
      return res.status(401).json({ error: `Supabase auth error: ${authError.message}` });
    }
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // User is authenticated, now we can send the email
    const { to, subject, body, attachment } = req.body;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key is not set.');
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'InvoicyCRM <onboarding@resend.dev>',
        to: to,
        subject: subject,
        html: body,
        attachments: attachment ? [attachment] : undefined,
      }),
    });

    const data = await resendRes.json();
    if (!resendRes.ok || data.error) {
      throw new Error(data.error?.message || `Failed to send email (${resendRes.status})`);
    }

    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Error in send-email function:', error.message);
    return res.status(500).json({ error: error.message });
  }
}