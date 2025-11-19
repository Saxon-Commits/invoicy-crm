import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { BusinessLetter, NewBusinessLetterData } from '../types';
import { useAuth } from '../AuthContext';

export const useBusinessLetters = () => {
    const { session } = useAuth();
    const [businessLetters, setBusinessLetters] = useState<BusinessLetter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBusinessLetters = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('business_letters')
                .select('*, customer:customers(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBusinessLetters(data as BusinessLetter[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addBusinessLetter = async (letter: NewBusinessLetterData) => {
        if (!session || !letter.customer) return;
        try {
            const { customer, ...letterData } = letter;
            const newLetterForDb = {
                ...letterData,
                customer_id: letter.customer.id,
                user_id: session.user.id,
                doc_number: `LTR-${Date.now().toString().slice(-6)}`,
            };

            const { data, error } = await supabase
                .from('business_letters')
                .insert(newLetterForDb)
                .select('*, customer:customers(*)')
                .single();

            if (error) throw error;
            if (data) {
                setBusinessLetters((prev) => [data as BusinessLetter, ...prev]);
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateBusinessLetter = async (updatedLetter: BusinessLetter) => {
        try {
            const { customer, ...letterData } = updatedLetter;
            const { data, error } = await supabase
                .from('business_letters')
                .update(letterData)
                .eq('id', updatedLetter.id)
                .select('*, customer:customers(*)')
                .single();

            if (error) throw error;
            if (data) {
                setBusinessLetters((prev) =>
                    prev.map((l) => (l.id === data.id ? (data as BusinessLetter) : l))
                );
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteBusinessLetter = async (letterId: string) => {
        try {
            const { error } = await supabase.from('business_letters').delete().eq('id', letterId);
            if (error) throw error;
            setBusinessLetters((prev) => prev.filter((l) => l.id !== letterId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const bulkDeleteBusinessLetters = async (letterIds: string[]) => {
        try {
            const { error } = await supabase.from('business_letters').delete().in('id', letterIds);
            if (error) throw error;
            setBusinessLetters((prev) => prev.filter((l) => !letterIds.includes(l.id)));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchBusinessLetters();
    }, [fetchBusinessLetters]);

    return {
        businessLetters,
        loading,
        error,
        fetchBusinessLetters,
        addBusinessLetter,
        updateBusinessLetter,
        deleteBusinessLetter,
        bulkDeleteBusinessLetters,
        setBusinessLetters,
    };
};
