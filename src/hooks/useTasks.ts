import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Task } from '../types';
import { useAuth } from '../AuthContext';

export const useTasks = () => {
    const { session } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'user_id' | 'completed'>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert({ ...task, user_id: session.user.id, completed: false })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setTasks((prev) => [data, ...prev]);
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateTask = async (updatedTask: Task) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updatedTask)
                .eq('id', updatedTask.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) throw error;
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        setTasks,
    };
};
