import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Document, NewDocumentData, DocumentType, Profile } from '../types';
import { useAuth } from '../AuthContext';

export const useDocuments = (profile: Profile | null) => {
    const { session } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*, customer:customers(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data as Document[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const ensurePaymentLink = async (doc: Document): Promise<Document> => {
        if (
            doc.type === DocumentType.Invoice &&
            !doc.stripe_payment_link && // Only if missing
            profile?.stripe_account_id &&
            profile.stripe_account_setup_complete
        ) {
            try {
                console.log('Attempting to generate Stripe Payment Link...');
                const { data: functionData, error: functionError } = await supabase.functions.invoke(
                    'create-payment-link',
                    {
                        body: { invoice: doc, stripe_account_id: profile.stripe_account_id },
                    }
                );

                if (functionError) throw functionError;
                if (functionData.error) throw new Error(functionData.error);

                if (functionData.paymentLinkUrl) {
                    console.log('Payment Link Generated:', functionData.paymentLinkUrl);
                    // Update document in DB with new link
                    const { data: updatedDoc, error: updateError } = await supabase
                        .from('documents')
                        .update({ stripe_payment_link: functionData.paymentLinkUrl })
                        .eq('id', doc.id)
                        .select('*, customer:customers(*)')
                        .single();

                    if (updateError) throw updateError;
                    return updatedDoc as Document;
                }
            } catch (linkError: any) {
                console.error('Error creating payment link:', linkError);
            }
        }
        return doc;
    };

    const addDocument = async (doc: NewDocumentData) => {
        if (!session || !doc.customer) return;

        try {
            const { customer, ...docData } = doc;
            let nextDocNumber = '';

            if (doc.type === DocumentType.Invoice) {
                const userInvoices = documents.filter(
                    (d) => d.user_id === session.user.id && d.type === DocumentType.Invoice
                );
                let maxNumber = 10000;
                userInvoices.forEach((inv) => {
                    const num = parseInt(String(inv.doc_number).replace(/\D/g, ''), 10);
                    if (!isNaN(num) && num > maxNumber) maxNumber = num;
                });
                nextDocNumber = String(maxNumber + 1);
            } else {
                nextDocNumber = `${doc.type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
            }

            const newDocForDb = {
                ...docData,
                customer_id: doc.customer.id,
                user_id: session.user.id,
                doc_number: nextDocNumber,
                recurrence: doc.recurrence || null,
            };

            const { data, error } = await supabase
                .from('documents')
                .insert(newDocForDb)
                .select('*, customer:customers(*)')
                .single();

            if (error) throw error;

            let createdDoc = data as Document;

            // Try to generate link immediately
            createdDoc = await ensurePaymentLink(createdDoc);

            setDocuments((prev) => [createdDoc, ...prev]);
            return createdDoc;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateDocument = async (updatedDoc: Document) => {
        try {
            const { customer, ...docData } = updatedDoc;
            let { data, error } = await supabase
                .from('documents')
                .update(docData)
                .eq('id', updatedDoc.id)
                .select('*, customer:customers(*)')
                .single();

            if (error) throw error;
            if (data) {
                let newDoc = data as Document;

                // Try to generate link if missing and eligible
                newDoc = await ensurePaymentLink(newDoc);

                setDocuments((prev) => prev.map((d) => (d.id === newDoc.id ? newDoc : d)));
                return newDoc;
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteDocument = async (docId: string) => {
        try {
            const { error } = await supabase.from('documents').delete().eq('id', docId);
            if (error) throw error;
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const bulkDeleteDocuments = async (docIds: string[]) => {
        try {
            const { error } = await supabase.from('documents').delete().in('id', docIds);
            if (error) throw error;
            setDocuments((prev) => prev.filter((d) => !docIds.includes(d.id)));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return {
        documents,
        loading,
        error,
        fetchDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
        bulkDeleteDocuments,
        setDocuments,
    };
};
