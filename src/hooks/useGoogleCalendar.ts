import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useGoogleCalendar = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Check if user is connected to Google
    // Check if user is connected to Google AND has calendar access
    const checkConnection = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) {
            setIsConnected(false);
            return;
        }

        // We can't just check identity because they might have signed in with only 'email' scope.
        // We must verify we actually have access to the calendar API.
        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                },
            });

            if (response.ok) {
                setIsConnected(true);
                setError(null);
            } else {
                // If 403/401, it means we have the identity but not the scope (or token expired)
                setIsConnected(false);
                const errData = await response.json();
                console.error("Google Calendar API Error:", errData);

                if (response.status === 403) {
                    setError("Access denied. Ensure your email is in the 'Test Users' list in Google Cloud Console.");
                } else if (response.status === 401) {
                    setError("Session expired. Please try connecting again.");
                } else {
                    setError(`Connection failed: ${errData.error?.message || 'Unknown error'}`);
                }
            }
        } catch (error: any) {
            console.error("Error verifying calendar scope:", error);
            setIsConnected(false);
            setError(error.message);
        }
    }, []);

    // Check on mount
    useState(() => {
        checkConnection();
    });

    const connectGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/calendar.events',
                    redirectTo: window.location.origin, // Redirect to root (HashRouter handles the rest)
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const listEvents = useCallback(async (timeMin: string, timeMax: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.provider_token) return [];

            const params = new URLSearchParams({
                timeMin,
                timeMax,
                singleEvents: 'true',
                orderBy: 'startTime',
            });

            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    return [];
                }
                throw new Error('Failed to fetch Google Calendar events');
            }

            const data = await response.json();
            return data.items || [];
        } catch (err: any) {
            console.error("Error fetching Google events:", err);
            // Don't set global error for background fetch
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createEvent = useCallback(async (eventData: { title: string, description?: string, startTime: string, endTime: string, withMeet?: boolean }) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.provider_token) {
                throw new Error('No Google provider token found. Please reconnect your Google account.');
            }

            const event: any = {
                summary: eventData.title,
                description: eventData.description,
                start: { dateTime: eventData.startTime },
                end: { dateTime: eventData.endTime },
            };

            if (eventData.withMeet) {
                event.conferenceData = {
                    createRequest: {
                        requestId: Math.random().toString(36).substring(7),
                        conferenceSolutionKey: { type: 'hangoutsMeet' },
                    },
                };
            }

            const url = eventData.withMeet
                ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1'
                : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create Google event');
            }

            const data = await response.json();
            return {
                id: data.id,
                hangoutLink: data.hangoutLink
            };
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateEvent = useCallback(async (eventId: string, eventData: { title: string, description?: string, startTime: string, endTime: string }) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.provider_token) {
                throw new Error('No Google provider token found.');
            }

            const event = {
                summary: eventData.title,
                description: eventData.description,
                start: { dateTime: eventData.startTime },
                end: { dateTime: eventData.endTime },
            };

            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error('Failed to update Google event');
            }

            return await response.json();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteEvent = useCallback(async (eventId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.provider_token) {
                throw new Error('No Google provider token found.');
            }

            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete Google event');
            }

            return true;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const disconnectGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user found.");

            // Find the Google identity
            const googleIdentity = user.identities?.find((id) => id.provider === 'google');
            if (!googleIdentity) {
                // Already disconnected logic or error
                setIsConnected(false);
                return;
            }

            // SAFETY CHECK: Prevent lockout
            // Check if there are other identities (like 'email')
            const hasOtherIdentities = user.identities?.some((id) => id.provider !== 'google');
            if (!hasOtherIdentities) {
                throw new Error("Cannot disconnect Google Account because it is your only sign-in method. Please set an email/password first to ensure you can still access your account.");
            }

            const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
            if (error) throw error;

            setIsConnected(false);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        connectGoogle,
        createEvent,
        listEvents,
        updateEvent,
        deleteEvent,
        disconnectGoogle,
        isConnected,
        loading,
        error,
    };
};
