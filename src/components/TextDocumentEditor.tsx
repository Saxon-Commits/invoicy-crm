import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useParams, useNavigate } from 'react-router-dom';
import { useTextDocuments } from '../hooks/useTextDocuments';
import SignaturePad from './SignaturePad';
import TemplateLibrary from './TemplateLibrary';
import { supabase } from '../supabaseClient';

const TextDocumentEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { textDocuments, saveTextDocument, updateTextDocument } = useTextDocuments();
    const [title, setTitle] = useState('Untitled Document');
    const [isSaving, setIsSaving] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start typing your document...',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px]',
            },
        },
    });

    // Load document if ID exists
    useEffect(() => {
        if (id && textDocuments.length > 0) {
            const doc = textDocuments.find(d => d.id === id);
            if (doc) {
                setTitle(doc.title);
                if (editor) {
                    editor.commands.setContent(doc.content);
                }
                if (doc.signature) {
                    setSignature(doc.signature);
                }
            }
        }
    }, [id, textDocuments, editor]);

    const handleSave = async () => {
        if (!editor) return;

        setIsSaving(true);
        const content = editor.getJSON();

        try {
            if (id) {
                await updateTextDocument(id, { title, content, signature });
            } else {
                const newDoc = await saveTextDocument({ title, content, signature });
                if (newDoc) {
                    navigate(`/text-editor/${newDoc.id}`, { replace: true });
                }
            }
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Failed to save document.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignatureSave = (dataUrl: string) => {
        setSignature(dataUrl);
        setIsSigning(false);
        // Auto-save after signing
        setTimeout(handleSave, 100);
    };

    const handleTemplateSelect = (content: string) => {
        if (editor) {
            editor.commands.setContent(content);
        }
        setIsTemplateLibraryOpen(false);
    };

    // Auto-save effect (optional, but good UX)
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     if (editor && (id && id !== 'new')) {
    //        handleSave();
    //     }
    //   }, 5000);
    //   return () => clearInterval(interval);
    // }, [editor, id, title]);


    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/files')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-900 dark:text-zinc-100 placeholder-slate-400"
                        placeholder="Untitled Document"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsTemplateLibraryOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Templates
                    </button>
                    <button
                        onClick={() => setIsSigning(true)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {signature ? 'Re-Sign' : 'Sign Now'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-4 sm:p-8">
                <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 min-h-[calc(100vh-8rem)]">
                    <EditorContent editor={editor} />
                </div>
            </div>

            <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default TextDocumentEditor;
