import React from 'react';
import { Document, DocumentStatus, DocumentType, Customer } from '../../types';

interface TopCustomersProps {
    documents: Document[];
    customers: Customer[];
}

const TopCustomers: React.FC<TopCustomersProps> = ({ documents, customers }) => {
    const customerRevenue = customers
        .map(customer => {
            const revenue = documents
                .filter(d => d.customer_id === customer.id && d.type === DocumentType.Invoice && d.status === DocumentStatus.Paid)
                .reduce((sum, d) => sum + d.total, 0);
            return { ...customer, revenue };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4">Top Customers</h3>
            <div className="space-y-4">
                {customerRevenue.map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">{customer.name}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">{customer.company_name || 'Individual'}</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{formatCurrency(customer.revenue)}</p>
                    </div>
                ))}
                {customerRevenue.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-4">No customer data available yet.</p>
                )}
            </div>
        </div>
    );
};

export default TopCustomers;
