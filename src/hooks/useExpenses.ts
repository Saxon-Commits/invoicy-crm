import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Expense } from '../types';
import { useAuth } from '../AuthContext';

export const useExpenses = () => {
    const { session } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert({ ...expense, user_id: session.user.id })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setExpenses((prev) =>
                    [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                );
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateExpense = async (updatedExpense: Expense) => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .update(updatedExpense)
                .eq('id', updatedExpense.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setExpenses((prev) => prev.map((e) => (e.id === data.id ? data : e)));
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteExpense = async (expenseId: string) => {
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
            if (error) throw error;
            setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return {
        expenses,
        loading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        setExpenses,
    };
};
