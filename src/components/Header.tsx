import React from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, searchTerm, setSearchTerm }) => {
  const location = useLocation();

  const pageInfo: { [key: string]: { title: string; subtitle: string } } = {
    '/dashboard': {
      title: 'Dashboard',
      subtitle: "Welcome back! Here's a summary of your business.",
    },
    '/new': { title: 'New Document', subtitle: 'Choose a template to get started.' },
    '/files': { title: 'All Files', subtitle: 'Browse and manage all your documents.' },
    '/crm': { title: 'Customer Management', subtitle: 'View and manage your customer list.' },
    '/projects': { title: 'Projects', subtitle: 'Manage your ongoing projects.' },
    '/bills-and-expenses': {
      title: 'Bills & Expenses',
      subtitle: 'Track your bills and company expenses.',
    },
    '/calendar': { title: 'Calendar', subtitle: 'View your schedule and events.' },
    '/settings': { title: 'Settings', subtitle: 'Configure your application and company details.' },
    '/editor': { title: 'Document Editor', subtitle: 'Create or edit an invoice or quote.' },
    '/letter-editor': { title: 'Letter Editor', subtitle: 'Create or edit a business letter.' },
  };

  const getPageInfo = (pathname: string) => {
    if (pathname.startsWith('/crm/'))
      return { title: 'Customer Details', subtitle: 'View customer history and activity.' };
    const key = Object.keys(pageInfo).find((key) => pathname.startsWith(key));
    return key ? pageInfo[key] : { title: 'InvoicyCRM', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo(location.pathname);

  return (
    <header className="flex-shrink-0 bg-slate-900 dark:bg-black border-b border-slate-700 dark:border-zinc-800 grid grid-cols-3 items-center p-3 gap-4 z-10 text-white">
      {/* Left side: Title and mobile toggle */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center: Search bar - REMOVED */}
      <div className="flex justify-center px-4">
      </div>

      {/* Right side: Actions and User */}
      <div className="flex items-center justify-end gap-2 sm:gap-4">
      </div>
    </header>
  );
};

export default Header;
