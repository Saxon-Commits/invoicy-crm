import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, DocumentStatus, DocumentType, CompanyInfo, Customer } from '../types';

import { supabase } from '../supabaseClient';
import ProposalWizard, { ProposalBundle } from './ProposalWizard';
import EmailProposalModal, { EmailData } from './EmailProposalModal';

interface FilesProps {
    documents: Document[];
    companyInfo: CompanyInfo;
    editDocument: (doc: Document) => void;
    updateDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    bulkDeleteDocuments: (docIds: string[]) => Promise<void>;
    searchTerm: string;
    onCreateNew: () => void;
    onAddCustomer: () => void;
}

type FileType = 'Invoice' | 'Quote' | 'Proposal' | 'Contract' | 'SLA';

interface UnifiedFile {
    id: string;
    type: FileType;
    title: string;
    date: string;
    status?: DocumentStatus;
    amount?: number;
    customerName?: string;
    originalObject: Document | any;
}

const Files: React.FC<FilesProps> = ({ documents, companyInfo, editDocument, updateDocument, deleteDocument, bulkDeleteDocuments, searchTerm, onCreateNew, onAddCustomer }) => {
    const navigate = useNavigate();
    // Unified Data Transformation
    const allFiles: UnifiedFile[] = useMemo(() => {
        const docs: UnifiedFile[] = (documents || []).map(d => ({
            id: d.id,
            type: d.type as FileType,
            title: d.doc_number,
            date: d.issue_date,
            status: d.status,
            amount: d.total,
            customerName: d.customer?.name,
            originalObject: d,
        }));

        return docs.sort((a, b) => {
            if (sortOption === 'Date') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOption === 'Name') return a.title.localeCompare(b.title);
            if (sortOption === 'Amount') return (b.amount || 0) - (a.amount || 0);
            return 0;
        });
    }, [documents, sortOption]);

    const filteredFiles = useMemo(() => {
        return allFiles.filter(item => {
            const matchesSearch = searchTerm.trim() === '' ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = activeFilter === 'All' || item.type === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [allFiles, searchTerm, activeFilter]);

    const handleItemClick = (file: UnifiedFile) => {
        if (['Invoice', 'Quote', 'Proposal', 'Contract', 'SLA'].includes(file.type)) {
            editDocument(file.originalObject);
        }
    };

    const handleWizardComplete = (bundle: ProposalBundle) => {
        setCurrentBundle(bundle);
        setIsWizardOpen(false);
        setIsEmailModalOpen(true);
    };

    const handleSendEmail = async (data: EmailData) => {
        if (!currentBundle) return;

        try {
            // Show loading state (optional, but good UX)
            // For now we'll just use the alert at the end

            const { data: responseData, error } = await supabase.functions.invoke('send-proposal', {
                body: {
                    emailData: data,
                    bundle: currentBundle,
                    companyInfo: companyInfo,
                },
            });

            if (error) throw error;

            alert(`Email sent successfully to ${data.to}!`);
            setIsEmailModalOpen(false);
            setCurrentBundle(null);
        } catch (err: any) {
            console.error('Error sending email:', err);
            alert(`Failed to send email: ${err.message}`);
        }
    };

    const handleDelete = async (file: UnifiedFile, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${file.title}"?`)) {
            deleteDocument(file.id);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
            {isWizardOpen && (
                <ProposalWizard
                    customers={customers}
                    companyInfo={companyInfo}
                    onComplete={handleWizardComplete}
                    onCancel={() => setIsWizardOpen(false)}
                    onAddCustomer={onAddCustomer}
                />
            )}

            {isEmailModalOpen && currentBundle && (
                <EmailProposalModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    onSend={handleSendEmail}
                    bundle={currentBundle}
                    customers={customers}
                />
            )}

            {/* Top Panel: Create New */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4">Create New</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Invoice / Quote */}
                    <button
                        onClick={() => {
                            onCreateNew();
                            navigate('/editor');
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">Invoice / Quote</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Create professional documents</span>
                    </button>

                    {/* Smart Proposal (Replaces Document) */}
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-full text-fuchsia-600 dark:text-fuchsia-400 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">Smart Proposal</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Bundle Quote, Contract & SLA</span>
                    </button>

                    {/* Proposal */}
                    <button
                        onClick={() => {
                            onCreateNew();
                            navigate('/proposal-editor?type=Proposal');
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">Proposal</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Standalone Proposal Document</span>
                    </button>

                    {/* Contract */}
                    <button
                        onClick={() => {
                            onCreateNew();
                            navigate('/proposal-editor?type=Contract');
                        }}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-zinc-100">Contract</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Standalone Contract Document</span>
                    </button>



                </div>
            </section>

            {/* Main Panel: All Documents */}
            <section className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col h-[600px]">
                {/* Header / Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                        {(['All', 'Invoice', 'Quote', 'Proposal', 'Contract', 'SLA'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                {filter}s
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-slate-500 dark:text-zinc-400">Sort by:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="text-sm border-none bg-transparent font-medium text-slate-700 dark:text-zinc-200 focus:ring-0 cursor-pointer"
                        >
                            <option value="Date">Date</option>
                            <option value="Name">Name</option>
                            <option value="Amount">Amount</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p>No files found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-xs uppercase text-slate-500 dark:text-zinc-400 sticky top-0">
                                <tr>
                                    <th className="py-3 px-4 font-medium">Name</th>
                                    <th className="py-3 px-4 font-medium w-32">Type</th>
                                    <th className="py-3 px-4 font-medium w-32">Date</th>
                                    <th className="py-3 px-4 font-medium w-32 text-right">Amount</th>
                                    <th className="py-3 px-4 font-medium w-24 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {filteredFiles.map(file => (
                                    <tr
                                        key={file.id}
                                        onClick={() => handleItemClick(file)}
                                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-zinc-100">{file.title}</span>
                                                {file.customerName && (
                                                    <span className="text-xs text-slate-500 dark:text-zinc-400">{file.customerName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                ${file.type === 'Invoice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                                                ${file.type === 'Quote' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                                            `}>
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-zinc-400">{file.date}</td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-slate-900 dark:text-zinc-100">
                                            {file.amount ? `$${file.amount.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={(e) => handleDelete(file, e)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Files;