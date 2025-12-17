import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';
import { corsHeaders } from '../_shared/cors.ts';
import { generatePDF, InvoiceData, CompanyInfo } from '../_shared/pdfGenerator.ts';

const RESEND_API_KEY = 're_Pc9qUPxD_NusbQjVykz7cJMvJXn9vC3KY'; // Hardcoded for dev as requested

const resend = new Resend(RESEND_API_KEY);

interface ProposalBundleRequest {
    emailData: {
        to: string;
        cc?: string;
        bcc?: string;
        subject: string;
        message: string;
    };
    bundle: {
        customer: any;
        items: {
            type: string;
            data: InvoiceData;
            included: boolean;
        }[];
    };
    companyInfo: CompanyInfo;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { emailData, bundle, companyInfo } = await req.json() as ProposalBundleRequest;

        const attachments = [];

        // Generate PDFs for each included item
        for (const item of bundle.items) {
            if (item.included) {
                const pdfBuffer = generatePDF(item.data, companyInfo);

                // Convert ArrayBuffer to Buffer/Uint8Array for Resend
                const pdfArray = new Uint8Array(pdfBuffer);

                // We need to convert Uint8Array to an array of numbers for Resend if it expects that, 
                // OR Resend supports Buffer. Let's check Resend docs or try passing Buffer.
                // Resend Node SDK usually takes Buffer. Deno doesn't have Node Buffer global.
                // We can pass the content as an array of numbers or a base64 string?
                // Resend 'content' field expects Buffer | string.
                // Let's try passing the buffer directly.

                attachments.push({
                    filename: `${item.type}-${item.data.doc_number || 'draft'}.pdf`,
                    content: Buffer.from(pdfArray), // Deno shim for Buffer might be needed or use npm:buffer
                });
            }
        }

        const { data, error } = await resend.emails.send({
            from: 'Invoicy <onboarding@resend.dev>', // Use verified domain or test domain
            to: [emailData.to],
            cc: emailData.cc ? emailData.cc.split(',').map(e => e.trim()) : undefined,
            bcc: emailData.bcc ? emailData.bcc.split(',').map(e => e.trim()) : undefined,
            subject: emailData.subject,
            html: `<p>${emailData.message.replace(/\n/g, '<br>')}</p>`,
            attachments: attachments,
            reply_to: companyInfo.email,
        });

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
