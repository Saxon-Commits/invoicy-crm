import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Document, CompanyInfo, DocumentStatus, DocumentType } from '../types';
import DocumentPreview from '../components/DocumentPreview';
import { generatePdf } from '../pdfGenerator';
import { downloadElementAsPdf } from '../pdfUtils';

interface PublicDocumentData {
    document: Document;
    company_info: CompanyInfo;
}

const ClientPortal: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<PublicDocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Contact Form State
    const [message, setMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    useEffect(() => {
        const fetchPublicDocument = async () => {
            try {
                if (!id) throw new Error("No document ID provided");

                const { data, error } = await supabase.rpc('get_public_document', {
                    doc_id: id
                });

                if (error) throw error;
                if (!data || !data[0]) throw new Error("Document not found or access denied.");

                // RPC returns an array, we take the first item
                setData(data[0] as PublicDocumentData);
            } catch (err: any) {
                console.error("Error fetching public document:", err);
                setError(err.message || "Failed to load document");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicDocument();
    }, [id]);

    const handleDownloadPdf = async () => {
        if (!data) return;
        const { document, company_info } = data;

        if ([DocumentType.Contract, DocumentType.SLA, DocumentType.Proposal].includes(document.type)) {
            const docNumber = document.doc_number || 'draft';
            await downloadElementAsPdf('document-preview-content', `${document.type}-${docNumber}.pdf`);
        } else {
            generatePdf(document, company_info);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        setSendingMessage(true);
        try {
            // Get email address using FormData
            const formData = new FormData(e.target as HTMLFormElement);
            const senderEmail = formData.get('email') as string;

            if (!senderEmail) throw new Error("Email is required");

            const { error: fnError } = await supabase.functions.invoke('send-client-message', {
                body: {
                    doc_id: id,
                    sender_email: senderEmail,
                    message: message
                }
            });

            if (fnError) throw fnError;

            setMessageSent(true);
            setMessage('');
            setTimeout(() => setMessageSent(false), 5000); // Reset success message after 5s

        } catch (err: any) {
            console.error("Error sending message:", err);
            alert("Failed to send message: " + (err.message || "Unknown error"));
        } finally {
            setSendingMessage(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Access Denied</h3>
                    <p className="text-slate-500">{error || "This document does not exist or has been removed."}</p>
                </div>
            </div>
        );
    }

    const { document, company_info } = data;
    const isPayable = document.type === DocumentType.Invoice && document.status !== DocumentStatus.Paid && document.stripe_payment_link;

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {/* Top Branding Bar */}
            <div className="bg-white border-b border-slate-200 py-3 px-6 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* User Branding */}
                        {company_info.logo ? (
                            <img src={company_info.logo} alt={company_info.name} className="h-8 object-contain" />
                        ) : (
                            <span className="font-bold text-lg text-slate-800">{company_info.name}</span>
                        )}
                    </div>
                    {/* Platform Branding (Subtle) */}
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <span>Powered by</span>
                        {/* Invoicy Logo / Text */}
                        <span className="font-bold text-slate-600 flex items-center gap-1">
                            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Invoicy
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
                {/* Main Content: Document Preview */}
                <div className="flex-grow lg:w-2/3">
                    <div id="document-preview-content" className="bg-white shadow-xl rounded-xl overflow-hidden min-h-[800px] flex justify-center p-8">
                        {/* Wrapper to constrain scale if needed, though DocumentPreview handles it */}
                        <div className="w-full">
                            <DocumentPreview
                                document={document}
                                companyInfo={company_info}
                                profile={null} // Profile is for editor prefs, null is fine for guest
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar: Actions */}
                <div className="lg:w-1/3 space-y-6">

                    {/* Action Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Actions</h2>
                        <div className="space-y-4">
                            {/* Pay Now Button */}
                            {isPayable && (
                                <a
                                    href={document.stripe_payment_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-center font-bold text-lg rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                >
                                    Pay Invoice ${document.total.toFixed(2)}
                                </a>
                            )}

                            {/* Status Badge if Paid */}
                            {document.status === DocumentStatus.Paid && (
                                <div className="w-full py-4 bg-green-100 text-green-700 text-center font-bold text-lg rounded-lg border border-green-200">
                                    Paid in Full
                                </div>
                            )}

                            {/* Download Button */}
                            <button
                                onClick={handleDownloadPdf}
                                className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        </div>

                        <hr className="my-6 border-slate-200" />

                        {/* Contact Form */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3">Questions? Contact Us</h3>
                            {messageSent ? (
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center">
                                    Message sent successfully! We'll get back to you soon.
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Message</label>
                                        <textarea
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sendingMessage}
                                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {sendingMessage ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPortal;
