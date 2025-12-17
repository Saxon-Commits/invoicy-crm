import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarEvent } from '../../types';

interface UpcomingEventsProps {
    events: CalendarEvent[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
    const upcomingEvents = events
        .filter(e => new Date(e.start_time) >= new Date())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Upcoming Events</h3>
                <Link to="/calendar" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    View All
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-600 dark:text-zinc-400">
                                <span className="text-xs font-bold uppercase">{new Date(event.start_time).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-lg font-bold">{new Date(event.start_time).getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">{event.title}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full mt-2`} style={{ backgroundColor: event.color }}></div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-4">No upcoming events.</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingEvents;
