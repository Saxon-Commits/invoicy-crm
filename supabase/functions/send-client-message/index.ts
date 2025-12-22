import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_API_KEY = Deno.env.get("STRIPE_API_KEY"); // Not used here but good practice to know envs

const resend = new Resend(RESEND_API_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ClientMessageRequest {
    doc_id: string;
    sender_email: string;
    message: string;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { doc_id, sender_email, message } = (await req.json()) as ClientMessageRequest;

        if (!doc_id || !sender_email || !message) {
            throw new Error("Missing required fields: doc_id, sender_email, message");
        }

        // 1. Fetch document to find the owner (user_id)
        const { data: document, error: docError } = await supabaseAdmin
            .from("documents")
            .select("user_id, doc_number, type")
            .eq("id", doc_id)
            .single();

        if (docError || !document) {
            throw new Error("Document not found");
        }

        // 2. Fetch the owner's profile (email)
        // Note: 'profiles' table usually stores company info, but we need the actual user email.
        // However, in this app, it seems 'profiles' table might not have the user's login email if it was created via trigger on auth.users without syncing email.
        // Let's check how we can get the user's email.
        // Option A: Use admin auth API to get user by ID.
        // Option B: Check if 'profiles' has 'company_email' and use that.

        // Let's try getting it from profiles.company_email first as that's the "business email".
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("company_email, company_name")
            .eq("id", document.user_id)
            .single();

        let targetEmail = profile?.company_email;

        // Fallback: fetch from auth.users if company_email is not set
        if (!targetEmail) {
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(document.user_id);
            if (userError || !userData.user) {
                throw new Error("Could not determine recipient email");
            }
            targetEmail = userData.user.email;
        }

        if (!targetEmail) {
            throw new Error("Recipient email not found");
        }

        // 3. Send Email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
            from: "Invoicy <onboarding@resend.dev>", // Or "Invoicy <contact@invoicy.io>" if verified
            to: [targetEmail],
            reply_to: sender_email,
            subject: `New Message regarding ${document.type} #${document.doc_number || 'Draft'}`,
            html: `
        <h3>New message from the Client Portal</h3>
        <p><strong>From:</strong> ${sender_email}</p>
        <p><strong>Document:</strong> ${document.type} #${document.doc_number || 'Draft'}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br>")}</p>
        <br />
        <p style="color: #666; font-size: 12px;">You can reply directly to this email to contact the client.</p>
      `,
        });

        if (emailError) {
            console.error("Resend error:", emailError);
            throw new Error("Failed to send email");
        }

        return new Response(JSON.stringify({ success: true, id: emailData?.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Error in send-client-message:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
