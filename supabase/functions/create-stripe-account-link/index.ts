import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";
import { corsHeaders } from "../_shared/cors.ts";

const STRIPE_API_KEY = Deno.env.get("STRIPE_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_API_KEY!, {
    apiVersion: "2023-10-16", // Latest stable at time of writing, or match existing
    httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!STRIPE_API_KEY || !SITE_URL) {
            throw new Error("Missing server configuration (Stripe Key or Site URL)");
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 1. Authenticate User
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
        });
        const token = authHeader.replace("Bearer ", "");
        const {
            data: { user },
            error: authError,
        } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            console.error("Auth Error:", authError);
            return new Response(JSON.stringify({
                error: "Unauthorized",
                details: authError?.message || "No user found",
                debug_header_len: authHeader ? authHeader.length : 0
            }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!user.email) {
            return new Response(JSON.stringify({ error: "User email not found" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Init Admin Client
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 3. Get or Create Profile/Stripe Account
        const { data: profileData, error: profileSelectError } = await supabaseAdmin
            .from("profiles")
            .select("stripe_account_id")
            .eq("id", user.id)
            .maybeSingle();

        if (profileSelectError) throw profileSelectError;

        let accountId = profileData?.stripe_account_id;

        // Create profile if not exists (edge case)
        if (!profileData) {
            const { error: insertError } = await supabaseAdmin
                .from("profiles")
                .insert({
                    id: user.id,
                    company_name: user.email,
                    subscription_tier: "free",
                });
            if (insertError) throw insertError;
        }

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            await supabaseAdmin
                .from("profiles")
                .update({ stripe_account_id: accountId })
                .eq("id", user.id);
        }

        // 4. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${SITE_URL}/#/settings`,
            return_url: `${SITE_URL}/#/settings`,
            type: "account_onboarding",
        });

        return new Response(JSON.stringify({ url: accountLink.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Error in create-stripe-account-link:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
