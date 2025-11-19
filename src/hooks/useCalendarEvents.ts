import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { CalendarEvent } from '../types';
import { useAuth } from '../AuthContext';

export const useCalendarEvents = () => {
    const { session } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!session) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .order('start_time', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => {
        if (!session) return;
        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .insert({ ...event, user_id: session.user.id })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setEvents((prev) =>
                    [...prev, data].sort(
                        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                    )
                );
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateEvent = async (updatedEvent: CalendarEvent) => {
        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .update(updatedEvent)
                .eq('id', updatedEvent.id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setEvents((prev) => prev.map((e) => (e.id === data.id ? data : e)));
            }
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteEvent = async (eventId: string) => {
        try {
            const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
            if (error) throw error;
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        loading,
        error,
        fetchEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        setEvents,
    };
};
