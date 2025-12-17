import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, DocumentType, NewDocumentData, Customer, CompanyInfo, DocumentStatus } from '../types';
import DocumentEditor from './DocumentEditor';
import ProposalEditor from './ProposalEditor';
// For now, we'll simulate the editor steps or reuse the editor component if possible.
// Reusing DocumentEditor directly might be tricky if it expects to own the route/navigation.
// We might need to refactor DocumentEditor to be more controlled, or create a "DocumentForm" component.
// For this MVP, let's create a simple form for each step or try to wrap DocumentEditor.

interface ProposalWizardProps {
    customers: Customer[];
    companyInfo: CompanyInfo;
    onComplete: (bundle: ProposalBundle) => void;
    onCancel: () => void;
    onAddCustomer?: () => void;
}

export interface ProposalBundle {
    customer: Customer | null;
    items: {
        type: 'proposal' | 'quote' | 'contract' | 'sla';
        data: NewDocumentData;
        included: boolean;
    }[];
}

const ProposalWizard: React.FC<ProposalWizardProps> = ({ customers, companyInfo, onComplete, onCancel, onAddCustomer }) => {
    const [step, setStep] = useState<'selection' | 'customer' | 'editing' | 'review'>('customer');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [bundle, setBundle] = useState<ProposalBundle>({
        customer: null,
        items: [
            { type: 'proposal', included: true, data: {} as any },
            { type: 'quote', included: true, data: {} as any },
            { type: 'contract', included: false, data: {} as any },
            { type: 'sla', included: false, data: {} as any },
        ]
    });
    const [currentEditIndex, setCurrentEditIndex] = useState(0);

    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId) || null;
        setSelectedCustomer(customer);
        setBundle(prev => ({ ...prev, customer }));
    };

    const handleToggleInclude = (index: number) => {
        setBundle(prev => {
            const newItems = prev.items.map((item, i) =>
                i === index ? { ...item, included: !item.included } : item
            );
            return { ...prev, items: newItems };
        });
    };

    const startEditing = () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }
        // Initialize data for included items
        const newItems = bundle.items.map(item => {
            if (item.included) {
                return {
                    ...item,
                    data: {
                        ...item.data, // Keep existing data if any
                        customer: selectedCustomer,
                        items: item.data.items || [],
                        issue_date: item.data.issue_date || new Date().toISOString().split('T')[0],
                        due_date: item.data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        type: item.type === 'quote' ? DocumentType.Quote : DocumentType.Invoice, // Map to existing types for now
                        status: DocumentStatus.Draft,
                        subtotal: item.data.subtotal || 0,
                        tax: item.data.tax || 10,
                        total: item.data.total || 0,
                        notes: item.data.notes || '',
                        template_id: item.data.template_id || 'modern',
                    } as NewDocumentData
                };
            }
            return item;
        });
        setBundle({ ...bundle, items: newItems });

        // Find first included item
        const firstIndex = newItems.findIndex(i => i.included);
        if (firstIndex !== -1) {
            setCurrentEditIndex(firstIndex);
            setStep('editing');
        } else {
            setStep('review');
        }
    };

    const handleNextStep = (data: NewDocumentData | Document) => {
        // Save current step data
        setBundle(prev => {
            const newItems = [...prev.items];
            newItems[currentEditIndex].data = data as NewDocumentData;
            return { ...prev, items: newItems };
        });

        // Find next included item
        let nextIndex = currentEditIndex + 1;
        while (nextIndex < bundle.items.length && !bundle.items[nextIndex].included) {
            nextIndex++;
        }

        if (nextIndex < bundle.items.length) {
            setCurrentEditIndex(nextIndex);
        } else {
            setStep('review');
        }
    };

    // Render helpers
    const renderSelectionStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">What would you like to include?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bundle.items.map((item, index) => (
                    <label key={item.type} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${item.included ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-zinc-700'}`}>
                        <input
                            type="checkbox"
                            checked={item.included}
                            onChange={() => handleToggleInclude(index)}
                            className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="ml-3 font-medium capitalize">{item.type}</span>
                    </label>
                ))}
            </div>
            <div className="flex justify-end">
                <button onClick={startEditing} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
                    Next: Edit Documents
                </button>
            </div>
        </div>
    );

    const renderCustomerStep = () => (
        <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center">Select a Customer</h2>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Customer</label>
                <select
                    className="w-full p-3 border rounded-lg bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    value={selectedCustomer?.id || ''}
                >
                    <option value="" disabled>Select a customer...</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={() => setStep('selection')}
                    disabled={!selectedCustomer}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Proposal
                </button>
            </div>
        </div>
    );

    const renderEditingStep = () => {
        const currentItem = bundle.items[currentEditIndex];

        return (
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold capitalize">Editing: {currentItem.type}</h2>
                        <span className="text-sm text-slate-500">Step {currentEditIndex + 1} of {bundle.items.filter(i => i.included).length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setStep('selection')} className="px-4 py-2 text-slate-600 hover:text-slate-900">Back</button>
                        {/* The 'Next' action is triggered by the Save button in DocumentEditor via onExternalSave */}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800">
                    {currentItem.type === 'quote' ? (
                        <DocumentEditor
                            customers={customers}
                            companyInfo={companyInfo}
                            expenses={[]} // Pass expenses if available, or empty array
                            addDocument={() => { }} // No-op
                            updateDocument={() => { }} // No-op
                            deleteDocument={() => { }} // No-op
                            documentToEdit={currentItem.data as any} // Cast to any to satisfy type if needed, or fix types
                            isEmbedded={true}
                            onExternalSave={handleNextStep}
                        />
                    ) : (
                        <ProposalEditor
                            customers={customers}
                            companyInfo={companyInfo}
                            expenses={[]}
                            addDocument={async () => null}
                            updateDocument={async () => null}
                            deleteDocument={() => { }}
                            documentToEdit={currentItem.data as any}
                            isEmbedded={true}
                            onExternalSave={handleNextStep}
                            onAddCustomer={onAddCustomer}
                        />
                    )}
                </div>

                {/* Custom Footer for Embedded Editor */}
                <div className="mt-4 flex justify-end p-2 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
                    <p className="text-sm text-slate-500 mr-4 self-center">Click "Save" in the editor to proceed to the next step.</p>
                    {/* We can also add a manual "Next" button that forces save if we had a ref to the editor, but for now relying on the editor's save button is cleaner */}
                </div>
            </div>
        );
    };

    const renderReviewStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review & Send</h2>
            <div className="space-y-4">
                {bundle.items.filter(i => i.included).map(item => (
                    <div key={item.type} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <span className="font-medium capitalize">{item.type}</span>
                        </div>
                        <button className="text-sm text-primary-600 hover:underline">Edit</button>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:text-slate-900">Cancel</button>
                <button onClick={() => onComplete(bundle)} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/30">
                    Send Proposal Bundle
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-zinc-950 z-50 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col justify-center">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-zinc-800">
                    <div className="mb-8 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-400 uppercase tracking-wider">Smart Proposal Wizard</h1>
                        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {step === 'customer' && renderCustomerStep()}
                    {step === 'selection' && renderSelectionStep()}
                    {step === 'editing' && renderEditingStep()}
                    {step === 'review' && renderReviewStep()}
                </div>
            </div>
        </div>
    );
};

export default ProposalWizard;
