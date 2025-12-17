import React, { useState, useMemo } from 'react';
import { CalendarEvent, Task, Document } from '../types';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMonths, subMonths, addWeeks, subWeeks, isToday, getHours, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, Clock, Plus, GripVertical } from 'lucide-react';
import { FEATURES } from '../config/features';

type View = 'month' | 'week' | 'day' | 'agenda';

interface CalendarProps {
    events: CalendarEvent[];
    tasks: Task[];
    documents: Document[];
    editDocument: (doc: Document) => void;
    addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => void;
    updateEvent: (event: CalendarEvent) => void;
    deleteEvent: (eventId: string) => void;
    addTask: (task: Omit<Task, 'id' | 'completed' | 'created_at' | 'user_id'>) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, tasks, documents, editDocument, addEvent, updateEvent, deleteEvent, addTask, updateTask, deleteTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>('month');

    // Drag and Drop State
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    // Task Drag Handlers
    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, date: Date, hour?: number) => {
        e.preventDefault();
        if (draggedTask) {
            const newDate = new Date(date);
            if (hour !== undefined) {
                newDate.setHours(hour, 0, 0, 0);
            } else {
                // Preserve time if dropping on month view, or default to 9am
                const currentHours = draggedTask.due_date ? new Date(draggedTask.due_date).getHours() : 9;
                const currentMinutes = draggedTask.due_date ? new Date(draggedTask.due_date).getMinutes() : 0;
                newDate.setHours(currentHours, currentMinutes, 0, 0);
            }

            updateTask({
                ...draggedTask,
                due_date: newDate.toISOString(),
                status: 'scheduled' // Assuming we have a status or we imply it by having a date
            });
            setDraggedTask(null);
        }
    };

    const unscheduledTasks = useMemo(() => tasks.filter(t => !t.due_date), [tasks]);

    // ... inside Calendar component ...

    return (
        <div className="flex h-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-200 overflow-hidden">
            {/* Sidebar for Unscheduled Tasks */}
            {FEATURES.ENABLE_CALENDAR_SIDEBAR && (
                <div className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-slate-700 dark:text-zinc-200">Unscheduled</h3>
                        <button
                            onClick={() => addTask({ text: 'New Task', status: 'todo' })}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {unscheduledTasks.map(task => (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                            >
                                <div className="flex items-start gap-2">
                                    <GripVertical size={14} className="text-slate-400 mt-1 opacity-0 group-hover:opacity-100" />
                                    <div className="text-sm font-medium text-slate-800 dark:text-zinc-100">{task.text}</div>
                                </div>
                            </div>
                        ))}
                        {unscheduledTasks.length === 0 && (
                            <div className="text-center text-xs text-slate-400 mt-10">No unscheduled tasks</div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0 z-10 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-50 w-48">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button onClick={handlePrev} className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-all"><ChevronLeft size={18} /></button>
                            <button onClick={handleNext} className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-all"><ChevronRight size={18} /></button>
                        </div>
                        <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">Today</button>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                        {(['month', 'week'] as View[]).map(v => (
                            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${view === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'}`}>{v}</button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900">
                    {view === 'month' && (
                        <MonthView
                            currentDate={currentDate}
                            events={events}
                            tasks={tasks}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        />
                    )}
                    {view === 'week' && (
                        <WeekView
                            currentDate={currentDate}
                            events={events}
                            tasks={tasks}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components

const MonthView: React.FC<any> = ({ currentDate, events, tasks, onDrop, onDragOver }) => {
    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-zinc-800">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400">
                        {day}
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {days.map((day, idx) => {
                    const dayEvents = events.filter((e: any) => isSameDay(new Date(e.start_time), day));
                    const dayTasks = tasks.filter((t: any) => t.due_date && isSameDay(new Date(t.due_date), day));
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={day.toISOString()}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, day)}
                            className={`
                min-h-[100px] border-b border-r border-slate-200 dark:border-zinc-800 p-2 transition-colors relative
                ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-zinc-900/50 text-slate-400' : 'bg-white dark:bg-zinc-900'}
                hover:bg-slate-50 dark:hover:bg-zinc-800/80
              `}
                        >
                            <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                {format(day, 'd')}
                            </div>
                            <div className="space-y-1">
                                {dayEvents.map((e: any) => (
                                    <div key={e.id} className="text-xs p-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate">
                                        {e.title}
                                    </div>
                                ))}
                                {dayTasks.map((t: any) => (
                                    <div key={t.id} className="text-xs p-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 truncate flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        <span className={t.completed ? 'line-through opacity-50' : ''}>{t.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const WeekView: React.FC<any> = ({ currentDate, events, tasks, onDrop, onDragOver }) => {
    const days = useMemo(() => {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
                <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900"></div>
                {days.map(day => (
                    <div key={day.toISOString()} className={`flex-1 py-2 text-center border-r border-slate-200 dark:border-zinc-800 ${isToday(day) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <div className="text-xs uppercase text-slate-500 dark:text-zinc-400 font-semibold">{format(day, 'EEE')}</div>
                        <div className={`text-sm font-bold ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-200'}`}>{format(day, 'd')}</div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
                {hours.map(hour => (
                    <div key={hour} className="flex min-h-[60px] border-b border-slate-100 dark:border-zinc-800">
                        <div className="w-16 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-400 dark:text-zinc-500 text-right pr-2 pt-2 relative">
                            <span className="-top-2 relative">{format(setHours(new Date(), hour), 'ha')}</span>
                        </div>
                        {days.map(day => {
                            const cellDate = setHours(day, hour);
                            const cellEvents = events.filter((e: any) => isSameDay(new Date(e.start_time), day) && new Date(e.start_time).getHours() === hour);
                            const cellTasks = tasks.filter((t: any) => t.due_date && isSameDay(new Date(t.due_date), day) && new Date(t.due_date).getHours() === hour);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, day, hour)}
                                    className="flex-1 border-r border-slate-100 dark:border-zinc-800/50 relative hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors p-1"
                                >
                                    {cellEvents.map((e: any) => (
                                        <div key={e.id} className="text-[10px] p-1 rounded bg-blue-100/80 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 mb-1 leading-tight border border-blue-200 dark:border-blue-800">
                                            {e.title}
                                        </div>
                                    ))}
                                    {cellTasks.map((t: any) => (
                                        <div key={t.id} className="text-[10px] p-1 rounded bg-amber-100/80 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 mb-1 leading-tight border border-amber-200 dark:border-amber-800">
                                            {t.text}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;