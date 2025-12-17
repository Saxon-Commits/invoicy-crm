import React from 'react';

interface QuickLinksProps {
    onCreateInvoice: () => void;
    onAddCustomer: () => void;
    onLogExpense: () => void;
    onAddTask: () => void;
    onAddTask: () => void;
}

const QuickLinks: React.FC<QuickLinksProps> = ({
    onCreateInvoice,
    onAddCustomer,
    onLogExpense,
    onAddTask,
}) => {
    const links = [
        {
            label: 'New Invoice',
            action: onCreateInvoice,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'bg-indigo-500',
        },

        {
            label: 'Add Customer',
            action: onAddCustomer,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            color: 'bg-emerald-500',
        },
        {
            label: 'Log Expense',
            action: onLogExpense,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'bg-rose-500',
        },
        {
            label: 'Add Task',
            action: onAddTask,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            color: 'bg-amber-500',
        },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {links.map((link, index) => (
                    <button
                        key={index}
                        onClick={link.action}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-100 dark:border-zinc-700 group"
                    >
                        <div className={`p-3 rounded-full ${link.color} shadow-sm mb-3 group-hover:scale-110 transition-transform`}>
                            {link.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{link.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickLinks;
