import React from 'react';
import { Link } from 'react-router-dom';
import { Expense } from '../../types';

interface RecentExpensesProps {
    expenses: Expense[];
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Recent Expenses</h3>
                <Link to="/bills-and-expenses" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    View All
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {recentExpenses.length > 0 ? (
                    recentExpenses.map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{expense.description}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">-{formatCurrency(expense.amount)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-4">No recent expenses.</p>
                )}
            </div>
        </div>
    );
};

export default RecentExpenses;
