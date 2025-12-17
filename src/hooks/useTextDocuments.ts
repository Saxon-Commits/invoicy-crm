import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export interface TextDocument {
    id: string;
    title: string;
    content: any; // TipTap JSON
    created_at: string;
    updated_at: string;
    user_id?: string;
    signature?: string | null; // Base64 data URL
    status?: 'Draft' | 'Sent' | 'Signed';
}

export const useTextDocuments = () => {
    const [textDocuments, setTextDocuments] = useState<TextDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTextDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('editor_documents')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setTextDocuments(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveTextDocument = async (doc: Omit<TextDocument, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('editor_documents')
                .insert([doc])
                .select()
                .single();

            if (error) throw error;
            setTextDocuments((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateTextDocument = async (id: string, updates: Partial<TextDocument>) => {
        try {
            const { data, error } = await supabase
                .from('editor_documents')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setTextDocuments((prev) => prev.map((doc) => (doc.id === id ? data : doc)));
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteTextDocument = async (id: string) => {
        try {
            const { error } = await supabase
                .from('editor_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTextDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchTextDocuments();
    }, [fetchTextDocuments]);

    return {
        textDocuments,
        loading,
        error,
        saveTextDocument,
        updateTextDocument,
        deleteTextDocument,
        refreshTextDocuments: fetchTextDocuments,
    };
};
