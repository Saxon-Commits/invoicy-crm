import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Customer, Document, DocumentType, DocumentStatus, CompanyInfo, NewDocumentData, Expense } from '../types';
import DocumentPreview from './DocumentPreview';
import { useAutoSave } from '../hooks/useAutoSave';
import { downloadElementAsPdf } from '../pdfUtils';
import ScaledPreviewWrapper from './ScaledPreviewWrapper';
import { useProfile } from '../hooks/useProfile';

interface ProposalEditorProps {
    customers: Customer[];
    addDocument: (doc: NewDocumentData) => Promise<Document | null>;
    updateDocument: (doc: Document) => Promise<Document | null>;
    deleteDocument: (docId: string) => void;
    documentToEdit: Document | null;
    companyInfo: CompanyInfo;
    expenses: Expense[];
    isEmbedded?: boolean;
    onExternalSave?: (doc: NewDocumentData | Document) => void;
    onAddCustomer?: () => void;
}

const AUTO_SAVE_KEY = 'autosave-proposal-draft';

interface ProposalDetails {
    executiveSummary: string;
    scopeOfWork: string;
    timeline: string;
    nextSteps: string;
}

const generateTemplate = (details: ProposalDetails): string => {
    return `
        <h2>Executive Summary</h2>
        <p>${details.executiveSummary || 'Briefly explain the project goals and the value proposition for the client.'}</p>
        
        <h2>Scope of Work</h2>
        <p>${details.scopeOfWork || 'List the specific deliverables, tasks, and milestones included in this project.'}</p>
        
        <h2>Timeline</h2>
        <p>${details.timeline || 'Outline the estimated start date, duration, and key completion dates.'}</p>
        
        <h2>Next Steps</h2>
        <p>${details.nextSteps || 'Please sign below to proceed with the project. We look forward to working with you.'}</p>
    `;
};

const getInitialState = (customers: Customer[], type: DocumentType = DocumentType.Proposal): NewDocumentData => {
    const today = new Date().toISOString().split('T')[0];
    const defaultDetails: ProposalDetails = {
        executiveSummary: '',
        scopeOfWork: '',
        timeline: '',
        nextSteps: '',
    };

    return {
        customer: customers[0] || null,
        items: [],
        issue_date: today,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: type,
        status: DocumentStatus.Draft,
        template_id: 'modern',
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: '',
        content: generateTemplate(defaultDetails),
    };
};

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive('bold') ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Bold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive('italic') ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Italic"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive('underline') ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Underline"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Align Left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Align Center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-100 dark:bg-zinc-800 text-primary-600' : 'text-slate-600 dark:text-zinc-400'}`}
                title="Align Right"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
            <button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                title="Insert Page Break"
            >
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="12" y2="12" strokeDasharray="2 2" /></svg>
                    <span className="text-xs font-medium">Page Break</span>
                </div>
            </button>
        </div>
    );
};

const ProposalEditor: React.FC<ProposalEditorProps> = ({ customers, addDocument, updateDocument, deleteDocument, documentToEdit, companyInfo, expenses, isEmbedded, onExternalSave, onAddCustomer }) => {
    const [searchParams] = useSearchParams();
    const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
    const { profile } = useProfile();

    const initialType = useMemo(() => {
        if (documentToEdit) return documentToEdit.type;
        const typeParam = searchParams.get('type');
        if (typeParam === 'Contract') return DocumentType.Contract;
        if (typeParam === 'SLA') return DocumentType.SLA;
        return DocumentType.Proposal;
    }, [documentToEdit, searchParams]);

    const [doc, setDoc] = useState<NewDocumentData | Document>(() => {
        if (documentToEdit) return documentToEdit;
        return getInitialState(customers, initialType);
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start typing your proposal...',
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
        ],
        content: documentToEdit?.content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setDoc(prev => ({ ...prev, content: html }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px]',
            },
        },
    });

    // Update editor content when doc changes (e.g. from template)
    useEffect(() => {
        if (editor && doc.content && editor.getHTML() !== doc.content) {
            // Avoid loop if content is same
            // editor.commands.setContent(doc.content);
        }
    }, [doc.content, editor]);

    useAutoSave(AUTO_SAVE_KEY, doc);

    const [scale, setScale] = useState(1);

    const handleSave = async () => {
        if (!doc.customer) {
            alert("Please select a customer.");
            return;
        }

        if (isEmbedded && onExternalSave) {
            onExternalSave(doc);
            return;
        }

        try {
            if (documentToEdit && 'id' in doc) {
                await updateDocument(doc as Document);
            } else {
                const newDoc = await addDocument(doc as NewDocumentData);
                if (newDoc) {
                    setDoc(newDoc);
                    // Optionally update URL without reload if needed, but for now state update is enough
                }
            }
        } catch (error) {
            console.error("Failed to save:", error);
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = customers.find(c => c.id === e.target.value);
        if (selectedCustomer) {
            setDoc(prev => ({ ...prev, customer: selectedCustomer }));
        }
    };

    const handleDownloadPdf = async () => {
        const docNumber = 'doc_number' in doc ? doc.doc_number : 'draft';
        await downloadElementAsPdf('document-preview-content', `${doc.type}-${docNumber}.pdf`);
    };

    const currentDocument = useMemo(() => {
        const baseDoc = JSON.parse(JSON.stringify(doc));
        if (!('id' in baseDoc) || baseDoc.id === 'preview-id') {
            (baseDoc as Document).id = 'preview-id';
            (baseDoc as Document).doc_number = '...';
        }
        return baseDoc as Document;
    }, [doc]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
            {!isEmbedded && (
                <header className="flex-shrink-0 bg-white dark:bg-zinc-900 p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between z-20 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Proposal Editor</h1>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadPdf} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Download</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">Save</button>
                    </div>
                </header>
            )}

            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                {/* Mobile View Toggle */}
                <div className="lg:hidden flex border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <button
                        onClick={() => setMobileView('editor')}
                        className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'editor' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'}`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'preview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'}`}
                    >
                        Preview
                    </button>
                </div>

                {/* Editor Column */}
                <div className={`lg:w-1/2 h-full overflow-y-auto ${mobileView === 'editor' ? 'block' : 'hidden'} lg:block`}>
                    <div className="max-w-3xl mx-auto p-6 space-y-8">

                        {/* Metadata Card */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Document Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Customer</label>
                                    <div className="flex gap-2">
                                        <select onChange={handleCustomerChange} value={doc.customer?.id || ''} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                            <option value="" disabled>Select a customer</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        {onAddCustomer && (
                                            <button
                                                onClick={onAddCustomer}
                                                className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                                title="Add New Customer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Status</label>
                                    <select value={doc.status} onChange={(e) => setDoc(p => ({ ...p, status: e.target.value as DocumentStatus }))} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value={DocumentStatus.Draft}>Draft</option>
                                        <option value={DocumentStatus.Sent}>Sent</option>
                                        <option value={DocumentStatus.Accepted}>Accepted</option>
                                        <option value={DocumentStatus.Signed}>Signed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Issue Date</label>
                                    <input type="date" value={doc.issue_date} onChange={e => setDoc(p => ({ ...p, issue_date: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Valid Until</label>
                                    <input type="date" value={doc.due_date} onChange={e => setDoc(p => ({ ...p, due_date: e.target.value }))} className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Editor Card */}
                        <div className="relative group">
                            {/* Toolbar */}
                            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-2 flex gap-2 rounded-t-xl shadow-sm">
                                <Toolbar editor={editor} />
                            </div>

                            {/* Main Editor Area */}
                            <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-b-xl overflow-hidden min-h-[800px] border border-slate-200 dark:border-zinc-800">
                                {editor && (
                                    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                                        <div className="bg-white dark:bg-zinc-800 shadow-xl border border-slate-200 dark:border-zinc-700 rounded-lg flex overflow-hidden">
                                            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-700 ${editor.isActive('bold') ? 'text-primary-600' : ''}`}>Bold</button>
                                            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-700 ${editor.isActive('italic') ? 'text-primary-600' : ''}`}>Italic</button>
                                            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-700 ${editor.isActive('strike') ? 'text-primary-600' : ''}`}>Strike</button>
                                        </div>
                                    </BubbleMenu>
                                )}
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Preview Column */}
                <div className={`lg:w-1/2 h-full bg-slate-200 dark:bg-zinc-950 p-4 lg:p-8 ${mobileView === 'preview' ? 'block' : 'hidden'} lg:block border-l border-slate-200 dark:border-zinc-800`}>
                    <div className="h-full w-full bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden p-4 bg-slate-200 dark:bg-zinc-950 relative">
                            <ScaledPreviewWrapper>
                                <DocumentPreview document={currentDocument} companyInfo={companyInfo} profile={profile} />
                            </ScaledPreviewWrapper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalEditor;
