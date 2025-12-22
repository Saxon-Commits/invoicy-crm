import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, CompanyInfo, DocumentType, DocumentStatus } from '../types';
import DocumentPreview from '../components/DocumentPreview';
import { generatePdf } from '../pdfGenerator';
import { downloadElementAsPdf } from '../pdfUtils';

interface DocumentDetailProps {
    documents: Document[];
    companyInfo: CompanyInfo;
    onEdit: (doc: Document) => void;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ documents, companyInfo, onEdit }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const document = useMemo(() => {
        return documents.find(d => d.id === id);
    }, [documents, id]);

    if (!document) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-zinc-300">Document not found</h2>
                    <button
                        onClick={() => navigate('/files')}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Back to Files
                    </button>
                </div>
            </div>
        );
    }

    const handleDownloadPdf = async () => {
        if ([DocumentType.Contract, DocumentType.SLA, DocumentType.Proposal].includes(document.type)) {
            const docNumber = document.doc_number || 'draft';
            await downloadElementAsPdf('document-preview-content', `${document.type}-${docNumber}.pdf`);
        } else {
            generatePdf(document, companyInfo);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-zinc-950">
            {/* Toolbar */}
            <header className="flex-shrink-0 bg-white dark:bg-zinc-900 p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
                        title="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
                            {document.type} {document.doc_number}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {document.customer?.name} &bull; {document.issue_date}
                        </p>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${document.status === DocumentStatus.Paid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            document.status === DocumentStatus.Sent ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                document.status === DocumentStatus.Overdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                        {document.status}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={`#/p/${document.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Guest Page
                    </a>

                    <button
                        onClick={handleDownloadPdf}
                        className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Download PDF
                    </button>

                    <button
                        onClick={() => onEdit(document)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Document
                    </button>
                </div>
            </header>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center">
                <div id="document-preview-content" className="bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-[800px] min-h-[1131px]">
                    {/* Scale Wrapper handled by DocumentPreview if needed, or simple container */}
                    <DocumentPreview
                        document={document}
                        companyInfo={companyInfo}
                        profile={null} // Use default/doc settings
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentDetail;
