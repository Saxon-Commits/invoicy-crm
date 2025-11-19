import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { ProductivityPage } from '../types';
import { useAuth } from '../AuthContext';

export const useProductivityPages = () => {
    const { session } = useAuth();
    const [productivityPages, setProductivityPages] = useState<ProductivityPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductivityPages = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('productivity_pages')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setProductivityPages(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addPage = async (pageData: Partial<ProductivityPage>) => {
        if (!session) return null;
        try {
            const newPage = {
                user_id: session.user.id,
                title: 'Untitled Page',
                content: { type: 'doc', content: [{ type: 'paragraph' }] },
                blocks: [],
                ...pageData,
            };
            const { data, error } = await supabase.from('productivity_pages').insert(newPage).select().single();

            if (error) throw error;
            if (data) {
                setProductivityPages((prev) => [data, ...prev]);
                return data;
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
        return null;
    };

    const updatePage = async (page: ProductivityPage) => {
        try {
            const { data, error } = await supabase
                .from('productivity_pages')
                .update(page)
                .eq('id', page.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setProductivityPages((prev) => prev.map((p) => (p.id === data.id ? data : p)));
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deletePage = async (pageId: string) => {
        try {
            const { error } = await supabase.from('productivity_pages').delete().eq('id', pageId);
            if (error) throw error;
            setProductivityPages((prev) => prev.filter((p) => p.id !== pageId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchProductivityPages();
    }, [fetchProductivityPages]);

    return {
        productivityPages,
        loading,
        error,
        fetchProductivityPages,
        addPage,
        updatePage,
        deletePage,
        setProductivityPages,
    };
};
