import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';

const HeaderNavigation: React.FC = () => {
    const navigate = useNavigate();

    // ...
    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/crm', label: 'CRM' },
        ...(FEATURES.ENABLE_FILES ? [{ path: '/files', label: 'Files' }] : []),
        ...(FEATURES.ENABLE_BILLS ? [{ path: '/bills-and-expenses', label: 'Bills & Expenses' }] : []),
        { path: '/calendar', label: 'Calendar' },
        { path: '/settings', label: 'Settings' },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-0 mb-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center gap-2 mr-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">InvoicyCRM</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 flex-1 overflow-x-auto no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>


        </div>
    );
};

export default HeaderNavigation;
