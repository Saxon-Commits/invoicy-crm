import React from 'react';
import { Document, DocumentStatus, DocumentType, Customer } from '../../types';

interface MetricsCardsProps {
    documents: Document[];
    customers: Customer[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ documents, customers }) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const revenueThisMonth = documents
        .filter(d => {
            const date = new Date(d.issue_date);
            return (
                d.type === DocumentType.Invoice &&
                d.status === DocumentStatus.Paid &&
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );
        })
        .reduce((sum, d) => sum + d.total, 0);

    const outstandingAmount = documents
        .filter(d => d.type === DocumentType.Invoice && (d.status === DocumentStatus.Sent || d.status === DocumentStatus.Overdue))
        .reduce((sum, d) => sum + d.total, 0);

    const activeCustomersCount = new Set(
        documents
            .filter(d => {
                const date = new Date(d.issue_date);
                return date.getFullYear() === currentYear;
            })
            .map(d => d.customer_id)
    ).size;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Revenue (This Month)</h3>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(revenueThisMonth)}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="font-medium">Paid Invoices</span>
                </p>
            </div>

            {/* Outstanding Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Outstanding</h3>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(outstandingAmount)}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center">
                    <span className="font-medium">Unpaid & Overdue</span>
                </p>
            </div>

            {/* Active Customers Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">Active Customers</h3>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{activeCustomersCount}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <span className="font-medium">This Year</span>
                </p>
            </div>
        </div>
    );
};

export default MetricsCards;
