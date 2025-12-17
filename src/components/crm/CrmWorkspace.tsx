import React, { useState } from 'react';
import { Maximize2, Minimize2, Mail, Phone, FileText, CheckSquare, Truck, CheckCircle } from 'lucide-react';
import { FEATURES } from '../../config/features';


interface Document {
    id: string;
    number: string;
    date: string;
    total: string;
    status: 'Paid' | 'Sent' | 'Draft';
}

interface CrmWorkspaceProps {
    customerName: string;
    documents: Document[];
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
}

const steps = ['Inquiry', 'Proposal', 'Deposit Paid', 'Tasks', 'Delivery', 'Done'];

export const CrmWorkspace: React.FC<CrmWorkspaceProps> = ({ customerName, documents, isFullScreen, onToggleFullScreen }) => {
    const [mainTab, setMainTab] = useState<'workspace' | 'documents'>('documents');
    const [currentStep, setCurrentStep] = useState('Inquiry');

    const renderContent = () => {
        switch (currentStep) {
            case 'Inquiry':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6 m-0">Inquiry Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ActionButton
                                icon={<Mail size={24} />}
                                title="Send Inquiry Email"
                                description="Send a template email to the client"
                            />
                            <ActionButton
                                icon={<Phone size={24} />}
                                title="Call Client"
                                description="Log a call with the client"
                            />
                            <ActionButton
                                icon={<FileText size={24} />}
                                title="Draft Inquiry Email"
                                description="Draft an email for later"
                            />
                        </div>
                    </div>
                );
            case 'Proposal':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6 m-0">Proposal Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ActionButton
                                icon={<FileText size={24} />}
                                title="Create Proposal"
                                description="Start a new proposal for this client"
                            />
                            <ActionButton
                                icon={<FileText size={24} />}
                                title="Create Quote"
                                description="Generate a price quote"
                            />
                            <ActionButton
                                icon={<FileText size={24} />}
                                title="Create Contract"
                                description="Draft a legal contract"
                            />
                        </div>
                    </div>
                );
            // Add other cases as needed
            default:
                return (
                    <div className="p-6 flex items-center justify-center h-full text-slate-400">
                        Select an action from the stepper above
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-800">
            {/* Header Tabs */}
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-zinc-700 px-6 pt-4 bg-white dark:bg-zinc-800 h-[60px] box-border">
                <div className="flex gap-8">
                    {FEATURES.ENABLE_CRM_WORKSPACE && (
                        <button
                            onClick={() => setMainTab('workspace')}
                            className={`
                  pb-1 bg-transparent border-none font-semibold text-sm cursor-pointer mb-1.5 transition-colors
                  ${mainTab === 'workspace'
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-slate-500 dark:text-zinc-400 border-b-2 border-transparent hover:text-slate-700 dark:hover:text-zinc-300'
                                }
                `}
                        >
                            Workspace
                        </button>
                    )}
                    <button
                        onClick={() => setMainTab('documents')}
                        className={`
              pb-1 bg-transparent border-none font-semibold text-sm cursor-pointer mb-1.5 transition-colors
              ${mainTab === 'documents'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-slate-500 dark:text-zinc-400 border-b-2 border-transparent hover:text-slate-700 dark:hover:text-zinc-300'
                            }
            `}
                    >
                        Documents
                    </button>
                </div>
                {onToggleFullScreen && (
                    <button
                        onClick={onToggleFullScreen}
                        className="bg-transparent border-none cursor-pointer text-slate-500 dark:text-zinc-400 p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                )}
            </div>

            {mainTab === 'workspace' ? (
                <>
                    {/* Stepper Status Bar - Visual Only */}
                    <div className="flex bg-slate-50 dark:bg-zinc-900/50 px-1 overflow-x-auto opacity-50 pointer-events-none grayscale">
                        {steps.map((step, index) => {
                            const isActive = step === currentStep;
                            const isCompleted = steps.indexOf(currentStep) > index;

                            return (
                                <div
                                    key={step}
                                    className={`
                    flex-1 py-2 pl-6 pr-4 text-center text-xs font-semibold cursor-default whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center transition-all
                    ${index === 0 ? 'ml-0' : '-ml-4'}
                    first:pl-4
                  `}
                                    style={{
                                        clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                                        zIndex: steps.length - index,
                                        backgroundColor: isActive ? '#2563EB' : isCompleted ? '#D1FAE5' : '#F1F5F9',
                                        color: isActive ? 'white' : isCompleted ? '#059669' : '#64748B',
                                    }}
                                >
                                    {step}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-zinc-900/10">
                        <div className="text-4xl font-bold text-slate-200 dark:text-zinc-700 uppercase tracking-widest rotate-[-12deg] select-none">
                            Coming Soon
                        </div>
                        <p className="text-slate-400 dark:text-zinc-500 mt-4 text-sm font-medium">Workspace features are under construction</p>
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-zinc-800 z-10">
                            <tr className="border-b border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 text-xs text-left">
                                <th className="p-4 font-semibold">NUMBER</th>
                                <th className="p-4 font-semibold">DATE</th>
                                <th className="p-4 font-semibold">TOTAL</th>
                                <th className="p-4 font-semibold">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id} className="border-b border-slate-100 dark:border-zinc-700/50 hover:bg-slate-50 dark:hover:bg-zinc-700/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-zinc-100">{doc.number}</td>
                                    <td className="p-4 text-slate-500 dark:text-zinc-400">{doc.date}</td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-zinc-100">{doc.total}</td>
                                    <td className="p-4">
                                        <span
                                            className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${doc.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    doc.status === 'Sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}
                      `}
                                        >
                                            {doc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
            }
        </div >
    );
};

const ActionButton = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <button
        className="flex flex-col items-start p-4 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg cursor-pointer text-left transition-all shadow-sm hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md group"
    >
        <div className="text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mb-1">{title}</div>
        <div className="text-xs text-slate-500 dark:text-zinc-400">{description}</div>
    </button>
);
