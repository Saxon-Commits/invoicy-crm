import React, { useState, useMemo } from 'react';
import { CalendarEvent, Task, Document } from '../types';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMonths, subMonths, addWeeks, subWeeks, isToday, getHours, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, Clock, Plus, GripVertical, ChevronDown, Calendar as CalendarIcon, Video, X, Edit2, Trash2, ExternalLink } from 'lucide-react';
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
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all">Today</button>
                            <div className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1"></div>
                            {(['month', 'week'] as View[]).map(v => (
                                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${view === v ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'}`}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                setSelectedEvent(null);
                                setSelectedDate(new Date());
                                setIsEventModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            <Plus size={16} />
                            Add Event
                        </button>
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
                            onDayClick={(date: Date) => {
                                setSelectedEvent(null);
                                setSelectedDate(date);
                                setIsEventModalOpen(true);
                            }}
                            onEventClick={(event: CalendarEvent) => setSelectedEvent(event)}
                        />
                    )}
                    {view === 'week' && (
                        <WeekView
                            currentDate={currentDate}
                            events={events}
                            tasks={tasks}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDayClick={(date: Date) => {
                                setSelectedEvent(null);
                                setSelectedDate(date);
                                setIsEventModalOpen(true);
                            }}
                            onEventClick={(event: CalendarEvent) => setSelectedEvent(event)}
                        />
                    )}
                </div>
            </div>

            <AddEventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                }}
                onSave={addEvent}
                onUpdate={updateEvent}
                initialDate={selectedDate}
                eventToEdit={selectedEvent}
            />

            <EventSidePanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={() => setIsEventModalOpen(true)}
                onDelete={(id) => {
                    if (confirm('Delete this event?')) {
                        deleteEvent(id);
                        setSelectedEvent(null);
                    }
                }}
            />
        </div >
    );
};

// Sub-components

const CustomSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
    placeholder?: string;
}> = ({ value, onChange, options, className = '', placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find(o => o.value === value)?.label || value;

    // Close on click outside (simplified)
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('.custom-select-container') === null) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative custom-select-container ${className}`}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-full flex items-center justify-between p-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500 transition-all"
            >
                <span className="truncate">{selectedLabel || placeholder}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md shadow-lg z-50">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`p-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700/50 text-slate-700 dark:text-slate-200 ${value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : ''}`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DateSelector: React.FC<{
    value: Date;
    onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
    return (
        <div className="relative group">
            <input
                type="date"
                required
                value={format(value, 'yyyy-MM-dd')}
                onChange={(e) => e.target.valueAsDate && onChange(e.target.valueAsDate)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full flex items-center justify-between p-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm group-hover:border-blue-400 group-focus-within:ring-2 group-focus-within:ring-blue-500 transition-all">
                <span className="font-medium">{format(value, 'dd - MM - yy')}</span>
                <CalendarIcon size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
        </div>
    );
};

const EventSidePanel: React.FC<{
    event: CalendarEvent | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (id: string) => void;
}> = ({ event, onClose, onEdit, onDelete }) => {
    if (!event) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-xl z-20 flex flex-col transform transition-transform duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-start">
                <div>
                    <span className={`inline-block w-3 h-3 rounded-full mb-2 bg-${event.color}-500`}></span>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{event.title}</h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Time</label>
                    <div className="text-sm text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <div>
                            <p>{format(new Date(event.start_time), 'EEEE, d MMMM')}</p>
                            <p className="text-slate-500">
                                {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                            </p>
                        </div>
                    </div>
                </div>

                {event.meeting_link && (
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Google Meet</label>
                        <a
                            href={event.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            <Video size={16} />
                            Join Meeting
                            <ExternalLink size={14} className="ml-1 opacity-70" />
                        </a>
                    </div>
                )}

                {event.description ? (
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">{event.description}</p>
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 italic">No description provided</div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                >
                    <Edit2 size={16} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(event.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    );
};

const MonthView: React.FC<any> = ({ currentDate, events, tasks, onDrop, onDragOver, onDayClick, onEventClick }) => {
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
                            onClick={() => onDayClick && onDayClick(day)}
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
                                    <div
                                        key={e.id}
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            onEventClick && onEventClick(e);
                                        }}
                                        className="text-xs p-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate cursor-pointer hover:opacity-80 transition-opacity"
                                    >
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

const WeekView: React.FC<any> = ({ currentDate, events, tasks, onDrop, onDragOver, onDayClick, onEventClick }) => {
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
                                    onClick={() => onDayClick && onDayClick(setHours(day, hour))}
                                    className="flex-1 border-r border-slate-100 dark:border-zinc-800/50 relative hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors p-1"
                                >
                                    {cellEvents.map((e: any) => (
                                        <div
                                            key={e.id}
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                onEventClick && onEventClick(e);
                                            }}
                                            className="text-[10px] p-1 rounded bg-blue-100/80 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 mb-1 leading-tight border border-blue-200 dark:border-blue-800 cursor-pointer hover:opacity-80 transition-opacity"
                                        >
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

const AddEventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => void;
    onUpdate?: (event: CalendarEvent) => void;
    initialDate: Date;
    eventToEdit?: CalendarEvent | null;
}> = ({ isOpen, onClose, onSave, onUpdate, initialDate, eventToEdit }) => {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('blue');
    const [addMeetLink, setAddMeetLink] = useState(false);

    // Google Calendar Integration
    const { createMeeting, isConnected } = useGoogleCalendar();
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

    // Date Selection
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // Time Selection Separate States
    const [startHour, setStartHour] = useState('09');
    const [startMinute, setStartMinute] = useState('00');
    const [startAmPm, setStartAmPm] = useState('AM');

    const [endHour, setEndHour] = useState('10');
    const [endMinute, setEndMinute] = useState('00');
    const [endAmPm, setEndAmPm] = useState('AM');

    // Generate Hour/Minute Options

    // Generate Hour/Minute Options
    const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    useMemo(() => {
        if (isOpen) {
            if (eventToEdit) {
                setTitle(eventToEdit.title);
                setColor(eventToEdit.color || 'blue');
                setAddMeetLink(!!eventToEdit.meeting_link);

                const s = new Date(eventToEdit.start_time);
                const e = new Date(eventToEdit.end_time);

                setStartDate(s);
                setEndDate(e);

                const formatTimeParts = (date: Date) => {
                    let h = date.getHours();
                    const amPm = h >= 12 ? 'PM' : 'AM';
                    let h12 = h % 12;
                    if (h12 === 0) h12 = 12;
                    return {
                        hour: h12.toString().padStart(2, '0'),
                        minute: date.getMinutes().toString().padStart(2, '0'),
                        amPm
                    };
                };

                const start = formatTimeParts(s);
                const end = formatTimeParts(e);

                setStartHour(start.hour);
                setStartMinute(start.minute);
                setStartAmPm(start.amPm);

                setEndHour(end.hour);
                setEndMinute(end.minute);
                setEndAmPm(end.amPm);

            } else {
                setStartDate(initialDate);
                setEndDate(initialDate);
                setTitle('');
                setColor('blue');
                setAddMeetLink(false);

                // Default time logic: Next full hour
                const now = new Date();
                let nextHour = now.getHours() + 1;

                const formatTimeParts = (h: number) => {
                    const amPm = h >= 12 ? 'PM' : 'AM';
                    let h12 = h % 12;
                    if (h12 === 0) h12 = 12;
                    return {
                        hour: h12.toString().padStart(2, '0'),
                        minute: '00',
                        amPm
                    };
                };

                const start = formatTimeParts(nextHour);
                const end = formatTimeParts(nextHour + 1);

                setStartHour(start.hour);
                setStartMinute(start.minute);
                setStartAmPm(start.amPm);

                setEndHour(end.hour);
                setEndMinute(end.minute);
                setEndAmPm(end.amPm);
            }
        }
    }, [isOpen, initialDate, eventToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submit if already creating
        if (isCreatingMeeting) return;

        const get24HourTime = (hStr: string, mStr: string, amPm: string) => {
            let h = parseInt(hStr);
            const m = parseInt(mStr);

            if (amPm === 'PM' && h !== 12) h += 12;
            if (amPm === 'AM' && h === 12) h = 0;
            return { h, m };
        };

        const start = get24HourTime(startHour, startMinute, startAmPm);
        const end = get24HourTime(endHour, endMinute, endAmPm);

        const s = new Date(startDate);
        s.setHours(start.h, start.m, 0, 0);

        const eDate = new Date(endDate);
        eDate.setHours(end.h, end.m, 0, 0);

        let meetingLink = '';

        if (addMeetLink && isConnected) {
            try {
                setIsCreatingMeeting(true);
                meetingLink = await createMeeting(title, s.toISOString(), eDate.toISOString());
            } catch (err) {
                console.error("Failed to create meeting:", err);
                alert("Failed to create Google Meet link. Event will be saved without it.");
            } finally {
                setIsCreatingMeeting(false);
            }
        }

        if (eventToEdit && onUpdate) {
            onUpdate({
                ...eventToEdit,
                title,
                start_time: s.toISOString(),
                end_time: eDate.toISOString(),
                color,
                meeting_link: meetingLink || eventToEdit.meeting_link, // Keep existing if not new
            });
        } else {
            onSave({
                title,
                start_time: s.toISOString(),
                end_time: eDate.toISOString(),
                color,
                description: '',
                meeting_link: meetingLink || undefined,
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4">
                    {eventToEdit ? 'Edit Event' : 'Add New Event'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Event Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                            placeholder="Client Meeting"
                            autoFocus
                        />
                    </div>

                    {/* Start Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Start Date</label>
                            <DateSelector
                                value={startDate}
                                onChange={setStartDate}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Start Time</label>
                            <div className="flex gap-2">
                                <CustomSelect
                                    value={startHour}
                                    onChange={setStartHour}
                                    options={hours.map(h => ({ value: h, label: h }))}
                                    className="flex-1"
                                />
                                <span className="text-slate-400 self-center font-bold">:</span>
                                <CustomSelect
                                    value={startMinute}
                                    onChange={setStartMinute}
                                    options={minutes.map(m => ({ value: m, label: m }))}
                                    className="flex-1"
                                />
                                <CustomSelect
                                    value={startAmPm}
                                    onChange={setStartAmPm}
                                    options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">End Date</label>
                            <DateSelector
                                value={endDate}
                                onChange={setEndDate}
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">End Time</label>
                            <div className="flex gap-2">
                                <CustomSelect
                                    value={endHour}
                                    onChange={setEndHour}
                                    options={hours.map(h => ({ value: h, label: h }))}
                                    className="flex-1"
                                />
                                <span className="text-slate-400 self-center font-bold">:</span>
                                <CustomSelect
                                    value={endMinute}
                                    onChange={setEndMinute}
                                    options={minutes.map(m => ({ value: m, label: m }))}
                                    className="flex-1"
                                />
                                <CustomSelect
                                    value={endAmPm}
                                    onChange={setEndAmPm}
                                    options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Options</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="google-meet"
                                checked={addMeetLink}
                                onChange={e => setAddMeetLink(e.target.checked)}
                                disabled={!isConnected}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <label htmlFor="google-meet" className={`flex items-center gap-2 text-sm ${!isConnected ? 'text-slate-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                                <Video size={16} />
                                Add Google Meet Conferencing
                            </label>
                            {!isConnected && (
                                <span className="text-xs text-amber-500 ml-2">(Go to Settings to connect Google Calendar)</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Color</label>
                        <div className="flex gap-2">
                            {['blue', 'green', 'red', 'purple', 'amber'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-slate-600 dark:border-zinc-300 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: `var(--color-${c}-500, ${c})` }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={isCreatingMeeting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isCreatingMeeting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {isCreatingMeeting ? 'Creating...' : (eventToEdit ? 'Update Event' : 'Save Event')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Calendar;