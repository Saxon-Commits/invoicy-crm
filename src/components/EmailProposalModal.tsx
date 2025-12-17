import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { ProposalBundle } from './ProposalWizard';

interface EmailProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: EmailData) => void;
    bundle: ProposalBundle;
    customers: Customer[];
}

export interface EmailData {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
    attachments: { name: string; type: string }[]; // Metadata for now, actual blobs generated in onSend
}

const EmailProposalModal: React.FC<EmailProposalModalProps> = ({ isOpen, onClose, onSend, bundle, customers }) => {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        if (isOpen && bundle.customer) {
            setTo(bundle.customer.email);
            setSubject(`Proposal for ${bundle.customer.name}`);

            const includedTypes = bundle.items.filter(i => i.included).map(i => i.type).join(', ');
            setBody(`Hi ${bundle.customer.name},\n\nPlease find attached the following documents for your review:\n\n${includedTypes}\n\nLet us know if you have any questions.\n\nBest regards,\n[Your Company Name]`);
        }
    }, [isOpen, bundle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const attachments = bundle.items.filter(i => i.included).map(i => ({
            name: `${i.type}_${bundle.customer?.name || 'client'}.pdf`,
            type: i.type
        }));

        onSend({ to, cc, bcc, subject, body, attachments });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 dark:border-zinc-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-50">Send Proposal Bundle</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            Sending {bundle.items.filter(i => i.included).length} documents to {bundle.customer?.name}
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">To</label>
                                <input
                                    type="email"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">CC</label>
                                <input
                                    type="text"
                                    value={cc}
                                    onChange={e => setCc(e.target.value)}
                                    placeholder="comma, separated, emails"
                                    className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">BCC</label>
                            <input
                                type="text"
                                value={bcc}
                                onChange={e => setBcc(e.target.value)}
                                placeholder="comma, separated, emails"
                                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Message</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={6}
                                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                            />
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Attachments</p>
                            <div className="flex flex-wrap gap-2">
                                {bundle.items.filter(i => i.included).map(item => (
                                    <span key={item.type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                        {item.type}.pdf
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl border-t border-slate-200 dark:border-zinc-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                            Send Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailProposalModal;
