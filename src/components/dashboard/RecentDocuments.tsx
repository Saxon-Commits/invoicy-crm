import React from 'react';
import { Link } from 'react-router-dom';
import { Document, DocumentStatus, DocumentType } from '../../types';

// Redefining a simple version for the dashboard
interface DashboardFile {
    id: string;
    type: 'Invoice' | 'Quote' | 'Document';
    title: string;
    date: string;
    amount?: number;
    status?: DocumentStatus;
}

interface RecentDocumentsProps {
    documents: Document[];
    textDocuments: any[]; // Using any for now to avoid circular dependency or complex type import
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents, textDocuments }) => {

    const allFiles: DashboardFile[] = [
        ...documents.map(d => ({
            id: d.id,
            type: d.type as 'Invoice' | 'Quote',
            title: d.doc_number,
            date: d.issue_date,
            amount: d.total,
            status: d.status
        })),
        ...textDocuments.map(d => ({
            id: d.id,
            type: 'Document' as const,
            title: d.title,
            date: d.updated_at || d.created_at,
            amount: undefined,
            status: undefined
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Recent Files</h3>
                <Link to="/files" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    View All
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {allFiles.length > 0 ? (
                    allFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${file.type === 'Invoice' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    file.type === 'Quote' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}>
                                    {file.type === 'Invoice' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    )}
                                    {file.type === 'Quote' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                    )}
                                    {file.type === 'Document' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{file.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">{new Date(file.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {file.amount !== undefined && (
                                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{formatCurrency(file.amount)}</p>
                                )}
                                {file.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${file.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        file.status === 'Overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                        {file.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-4">No recent files.</p>
                )}
            </div>
        </div>
    );
};

export default RecentDocuments;
