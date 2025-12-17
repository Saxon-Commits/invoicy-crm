import React from 'react';
import { DEFAULT_TEMPLATES } from '../constants/templates';

interface TemplateLibraryProps {
    onSelect: (content: string) => void;
    onClose: () => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Choose a Template</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-zinc-950">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DEFAULT_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg hover:border-primary-500 transition-all cursor-pointer group"
                                onClick={() => onSelect(template.content)}
                            >
                                <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">{template.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4 line-clamp-3">{template.description}</p>
                                <button className="w-full py-2 px-4 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-sm font-medium group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    Use Template
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateLibrary;
