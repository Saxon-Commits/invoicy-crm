import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { EmailTemplate } from '../types';
import { useAuth } from '../AuthContext';

export const useEmailTemplates = () => {
    const { session } = useAuth();
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmailTemplates = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setEmailTemplates(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .insert({ ...template, user_id: session.user.id })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setEmailTemplates((prev) => [...prev, data]);
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateEmailTemplate = async (updatedTemplate: EmailTemplate) => {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .update(updatedTemplate)
                .eq('id', updatedTemplate.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setEmailTemplates((prev) => prev.map((t) => (t.id === data.id ? data : t)));
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteEmailTemplate = async (templateId: string) => {
        try {
            const { error } = await supabase.from('email_templates').delete().eq('id', templateId);
            if (error) throw error;
            setEmailTemplates((prev) => prev.filter((t) => t.id !== templateId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchEmailTemplates();
    }, [fetchEmailTemplates]);

    return {
        emailTemplates,
        loading,
        error,
        fetchEmailTemplates,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        setEmailTemplates,
    };
};
