import React from 'react';
import { Document, DocumentStatus, DocumentType, Task } from '../../types';

interface ActionCenterProps {
    documents: Document[];
    tasks: Task[];
    onEditDocument: (doc: Document) => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ documents, tasks, onEditDocument }) => {
    const overdueInvoices = documents.filter(
        d => d.type === DocumentType.Invoice && d.status === DocumentStatus.Overdue
    );

    const draftInvoices = documents.filter(
        d => d.type === DocumentType.Invoice && d.status === DocumentStatus.Draft
    );

    const tasksDueToday = tasks.filter(t => {
        if (!t.due_date || t.completed) return false;
        const today = new Date().toISOString().split('T')[0];
        return t.due_date === today;
    });

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Action Center
            </h3>

            <div className="space-y-4">
                {/* Overdue Invoices */}
                {overdueInvoices.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Overdue Invoices</h4>
                        <div className="space-y-2">
                            {overdueInvoices.slice(0, 3).map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">{doc.doc_number}</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Due: {new Date(doc.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => onEditDocument(doc)}
                                        className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tasks Due Today */}
                {tasksDueToday.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Tasks Due Today</h4>
                        <div className="space-y-2">
                            {tasksDueToday.slice(0, 3).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">{task.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Draft Invoices */}
                {draftInvoices.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Drafts</h4>
                        <div className="space-y-2">
                            {draftInvoices.slice(0, 3).map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-700">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">{doc.doc_number || 'Untitled'}</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Created: {new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => onEditDocument(doc)}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                    >
                                        Resume
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {overdueInvoices.length === 0 && tasksDueToday.length === 0 && draftInvoices.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                        <p>🎉 All caught up!</p>
                        <p className="text-sm mt-1">No pending actions right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionCenter;
