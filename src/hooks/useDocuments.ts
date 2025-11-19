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

            // Payment Link Logic
            if (
                createdDoc &&
                doc.type === DocumentType.Invoice &&
                profile?.stripe_account_id &&
                profile.stripe_account_setup_complete
            ) {
                try {
                    const { data: functionData, error: functionError } = await supabase.functions.invoke(
                        'create-payment-link',
                        {
                            body: { invoice: createdDoc, stripe_account_id: profile.stripe_account_id },
                        }
                    );

                    if (functionError) throw functionError;
                    if (functionData.error) throw new Error(functionData.error);

                    if (functionData.paymentLinkUrl) {
                        createdDoc = { ...createdDoc, stripe_payment_link: functionData.paymentLinkUrl };
                    }
                } catch (linkError: any) {
                    console.error('Error creating payment link:', linkError);
                    // We don't throw here, just return the doc without the link but maybe with a warning?
                    // For now, we just log it. The UI can handle the missing link.
                }
            }

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
            const { data, error } = await supabase
                .from('documents')
                .update(docData)
                .eq('id', updatedDoc.id)
                .select('*, customer:customers(*)')
                .single();

            if (error) throw error;
            if (data) {
                const newDoc = data as Document;
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
