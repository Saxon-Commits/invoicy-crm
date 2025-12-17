import React, { useState, useMemo } from 'react';
import { Customer, Document } from '../types';
import TagsModal from './TagsModal';
import PreferencesModal from './PreferencesModal';
import CustomerModal from './CustomerModal';
import { CrmList } from './crm/CrmList';
import { CrmProfile } from './crm/CrmProfile';
import { CrmWorkspace } from './crm/CrmWorkspace';
import { KanbanBoard } from './crm/KanbanBoard';
import { LayoutGrid, Kanban as KanbanIcon } from 'lucide-react';

interface CrmViewProps {
  customers: Customer[];
  documents: Document[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  commonTags: string[];
  setCommonTags: (tags: string[]) => void;
  searchTerm: string;
}

const CrmView: React.FC<CrmViewProps> = ({
  customers,
  documents,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  commonTags,
  setCommonTags,
  searchTerm,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToEditTags, setCustomerToEditTags] = useState<Customer | null>(null);
  const [customerToEditPrefs, setCustomerToEditPrefs] = useState<Customer | null>(null);

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => (a.name > b.name ? 1 : -1)),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const customersToFilter = sortedCustomers;
    if (!searchTerm.trim()) return customersToFilter;
    const lowercasedFilter = searchTerm.toLowerCase();
    return customersToFilter.filter(
      (c) =>
        c.name.toLowerCase().includes(lowercasedFilter) ||
        (c.company_name && c.company_name.toLowerCase().includes(lowercasedFilter)) ||
        c.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [sortedCustomers, searchTerm]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const customerDocuments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return documents.filter((doc) => doc.customer_id === selectedCustomerId);
  }, [documents, selectedCustomerId]);

  const customerStats = useMemo(() => {
    if (!selectedCustomerId) return { totalBilled: 0, totalPaid: 0 };
    const docs = documents.filter((doc) => doc.customer_id === selectedCustomerId);
    const totalBilled = docs.reduce((sum, doc) => sum + doc.total, 0);
    const totalPaid = docs
      .filter((doc) => doc.status === 'Paid')
      .reduce((sum, doc) => sum + doc.total, 0);
    return { totalBilled, totalPaid };
  }, [documents, selectedCustomerId]);

  // Adapter for CrmList
  const crmListCustomers = filteredCustomers.map(c => ({
    id: c.id,
    name: c.name,
    company: c.company_name || ''
  }));

  // Adapter for CrmProfile
  const crmProfileCustomer = selectedCustomer ? {
    name: selectedCustomer.name,
    company: selectedCustomer.company_name || '',
    email: selectedCustomer.email,
    phone: selectedCustomer.phone,
    address: selectedCustomer.address,
    website: '', // Add to type if needed
    totalBilled: `$${customerStats.totalBilled.toFixed(2)}`,
    totalPaid: `$${customerStats.totalPaid.toFixed(2)}`,
    facebook: '',
    instagram: ''
  } : null;

  // Adapter for CrmWorkspace
  const crmWorkspaceDocuments = customerDocuments.map(doc => ({
    id: doc.id,
    number: doc.doc_number,
    date: new Date(doc.issue_date).toLocaleDateString(),
    total: `$${doc.total.toFixed(2)}`,
    status: (doc.status === 'Paid' ? 'Paid' : doc.status === 'Draft' ? 'Draft' : 'Sent') as 'Paid' | 'Sent' | 'Draft'
  }));

  const handleAddClick = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleSaveTags = (tags: string[]) => {
    if (customerToEditTags) {
      updateCustomer({ ...customerToEditTags, tags });
    }
    setCustomerToEditTags(null);
  };

  const handleSavePrefs = (preferences: string[]) => {
    if (customerToEditPrefs) {
      updateCustomer({ ...customerToEditPrefs, preferences });
    }
    setCustomerToEditPrefs(null);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 gap-6 overflow-hidden bg-slate-50 dark:bg-zinc-900/50">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700">
        <div className="flex bg-slate-100 dark:bg-zinc-700 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-white dark:bg-zinc-600 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
              }`}
          >
            <LayoutGrid size={16} />
            List
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'board'
                ? 'bg-white dark:bg-zinc-600 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700'
              }`}
          >
            <KanbanIcon size={16} />
            Board
          </button>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      </div>

      {viewMode === 'board' ? (
        <div className="flex-1 min-h-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden">
          <KanbanBoard />
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          {/* Left Column: List (3 cols) */}
          <div className={`${isFullScreen ? 'hidden' : 'col-span-12 md:col-span-3'} h-full overflow-hidden`}>
            <CrmList
              customers={crmListCustomers}
              selectedId={selectedCustomerId}
              onSelect={setSelectedCustomerId}
              onAddClick={handleAddClick}
            />
          </div>

          {/* Middle Column: Profile (3 cols) */}
          <div className={`${isFullScreen ? 'hidden' : 'col-span-12 md:col-span-3'} h-full overflow-hidden`}>
            {selectedCustomer && crmProfileCustomer ? (
              <CrmProfile
                customer={crmProfileCustomer}
                onEdit={() => handleEditClick(selectedCustomer)}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-slate-400 border-r border-slate-200 dark:border-zinc-700">
                Select a customer
              </div>
            )}
          </div>

          {/* Right Column: Workspace (6 cols) */}
          <div className={`${isFullScreen ? 'col-span-12' : 'col-span-12 md:col-span-6'} h-full overflow-hidden transition-all duration-300`}>
            {selectedCustomer ? (
              <CrmWorkspace
                customerName={selectedCustomer.name}
                documents={crmWorkspaceDocuments}
                isFullScreen={isFullScreen}
                onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-zinc-900/50 text-slate-400">
                Workspace inactive
              </div>
            )}
          </div>
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addCustomer}
        onUpdate={updateCustomer}
        customerToEdit={customerToEdit}
      />
      <TagsModal
        customer={customerToEditTags}
        onClose={() => setCustomerToEditTags(null)}
        onSave={handleSaveTags}
        commonTags={commonTags}
        setCommonTags={setCommonTags}
      />
      <PreferencesModal
        customer={customerToEditPrefs}
        onClose={() => setCustomerToEditPrefs(null)}
        onSave={handleSavePrefs}
      />
    </div>
  );
};

export default CrmView;