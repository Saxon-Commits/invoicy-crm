import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Document, CompanyInfo, Profile } from '../types';
import DocumentPreview from '../components/DocumentPreview';
import ScaledPreviewWrapper from '../components/ScaledPreviewWrapper';

const CustomerPortal: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [document, setDocument] = useState<Document | null>(null);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocumentAndProfile = async () => {
            if (!id) return;

            try {
                setLoading(true);
                // 1. Fetch Document with Items and Customer
                const { data: docData, error: docError } = await supabase
                    .from('documents')
                    .select('*, items(*), customer:customers(*)')
                    .eq('id', id)
                    .single();

                if (docError) throw docError;
                if (!docData) throw new Error('Document not found');

                setDocument(docData as Document);

                // 2. Fetch Profile (Company Info) using the document's user_id
                if (docData.user_id) {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', docData.user_id)
                        .single();

                    if (profileError) {
                        console.error('Error fetching profile:', profileError);
                        // Fallback or non-fatal error
                    } else if (profileData) {
                        setCompanyInfo({
                            name: profileData.company_name || 'Company Name',
                            address: profileData.company_address || '',
                            email: profileData.company_email || '',
                            abn: profileData.company_abn,
                            logo: profileData.company_logo,
                        });
                    }
                }
            } catch (err: any) {
                console.error('Error loading document:', err);
                setError(err.message || 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentAndProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !document || !companyInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-950">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-slate-600 dark:text-zinc-400">{error || 'Document not found or access denied.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden min-h-[800px]">
                <ScaledPreviewWrapper>
                    <DocumentPreview
                        document={document}
                        companyInfo={companyInfo}
                        profile={null} // Profile is for internal user settings, not needed for public view usually, or we could pass the fetched profile
                    />
                </ScaledPreviewWrapper>
            </div>
            <div className="max-w-4xl mx-auto mt-8 text-center text-slate-500 text-sm">
                <p>Powered by Invoicy CRM</p>
            </div>
        </div>
    );
};

export default CustomerPortal;
