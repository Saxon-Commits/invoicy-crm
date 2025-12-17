import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customerData: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => Promise<void> | void;
    onUpdate: (customer: Customer) => Promise<void> | void;
    customerToEdit?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    customerToEdit,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        tags: '',
    });

    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                name: customerToEdit.name,
                company_name: customerToEdit.company_name || '',
                industry: customerToEdit.industry || '',
                email: customerToEdit.email,
                phone: customerToEdit.phone,
                address: customerToEdit.address,
                tags: customerToEdit.tags?.join(', ') || '',
            });
        } else {
            setFormData({
                name: '',
                company_name: '',
                industry: '',
                email: '',
                phone: '',
                address: '',
                tags: '',
            });
        }
    }, [customerToEdit, isOpen]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

        setIsSaving(true);
        try {
            if (customerToEdit && onUpdate) {
                await onUpdate({
                    ...customerToEdit,
                    name: formData.name,
                    company_name: formData.company_name,
                    industry: formData.industry,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    tags: tagsArray,
                });
            } else {
                await onSave({
                    name: formData.name,
                    company_name: formData.company_name,
                    industry: formData.industry,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    tags: tagsArray,
                    preferences: [],
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
            // Optionally set an error state here to display in the modal
            alert('Failed to save customer. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-zinc-50">
                            {customerToEdit ? 'Edit Customer' : 'Add Customer'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        required
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {customerToEdit ? 'Save Changes' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
