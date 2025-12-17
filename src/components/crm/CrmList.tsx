import React, { useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';

// Stub for LeadWizard until ported
const LeadWizard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Lead Wizard</h2>
                <p>Coming soon...</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Close</button>
            </div>
        </div>
    );
};

interface Customer {
    id: string;
    name: string;
    company: string;
}

interface CrmListProps {
    customers: Customer[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAddClick: () => void;
}

export const CrmList: React.FC<CrmListProps> = ({ customers, selectedId, onSelect, onAddClick }) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    return (
        <div className="flex flex-col h-full border-r border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100 m-0">Contacts</h2>
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <Wand2 size={14} />
                        Lead Wizard
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onAddClick}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 border-none rounded-md px-3 py-2 flex items-center justify-center cursor-pointer text-sm font-medium gap-1.5 whitespace-nowrap w-full transition-colors"
                    >
                        <Plus size={16} />
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {customers.map((customer) => (
                    <div
                        key={customer.id}
                        onClick={() => onSelect(customer.id)}
                        className={`
              px-5 py-4 cursor-pointer transition-all border-l-[3px]
              ${selectedId === customer.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500'
                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-zinc-700/50'
                            }
            `}
                    >
                        <div className="font-medium text-slate-800 dark:text-zinc-100 mb-1">{customer.name}</div>
                        <div className="text-sm text-slate-500 dark:text-zinc-400">{customer.company}</div>
                    </div>
                ))}
            </div>

            <LeadWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
        </div>
    );
};
