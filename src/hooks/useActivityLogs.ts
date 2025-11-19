import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { ActivityLog } from '../types';
import { useAuth } from '../AuthContext';

export const useActivityLogs = () => {
    const { session } = useAuth();
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivityLogs = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setActivityLogs(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addActivityLog = async (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .insert({ ...activity, user_id: session.user.id })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setActivityLogs((prev) => [data, ...prev]);
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchActivityLogs();
    }, [fetchActivityLogs]);

    return {
        activityLogs,
        loading,
        error,
        fetchActivityLogs,
        addActivityLog,
        setActivityLogs,
    };
};
