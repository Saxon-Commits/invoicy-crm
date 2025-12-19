import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Customer,
  Document,
  DocumentType,
  Expense,
} from './types';
import { THEMES } from './constants';
import { FEATURES } from './config/features';
import Sidebar from './components/Sidebar';
import HeaderNavigation from './components/HeaderNavigation';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CrmView from './components/CrmView';
import DocumentEditor from './components/DocumentEditor';
import TextDocumentEditor from './components/TextDocumentEditor';

import BillsAndExpenses, { ExpenseModal } from './components/BillsAndExpenses';
import Calendar from './components/Calendar';
import Settings from './components/Settings';

import CustomerDetail from './components/CustomerDetail';
import Files from './components/Files';
// import { DocumentsPage } from './pages/DocumentsPage';
import CustomerPortal from './pages/CustomerPortal';
import AuthPage from './components/Auth';
import { useAuth } from './AuthContext';

import QuickActions from './components/QuickActions';

// Modals
import CustomerModal from './components/CustomerModal';

import EmailModal from './components/EmailModal';
import SetGoalModal from './components/SetGoalModal';

// Hooks
import { useCustomers } from './hooks/useCustomers';
import { useDocuments } from './hooks/useDocuments';
import { useExpenses } from './hooks/useExpenses';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useTasks } from './hooks/useTasks';
import { useEmailTemplates } from './hooks/useEmailTemplates';
import { useActivityLogs } from './hooks/useActivityLogs';


import { useProfile } from './hooks/useProfile';

const App: React.FC = () => {
  const { session } = useAuth();

  // Custom Hooks
  const { profile, companyInfo, updateProfile, setCompanyInfo } = useProfile();
  const { customers, addCustomer, updateCustomer, deleteCustomer, setCustomers } = useCustomers();
  const { documents, addDocument, updateDocument, deleteDocument, bulkDeleteDocuments, setDocuments } = useDocuments(profile);
  const { expenses, addExpense, updateExpense, deleteExpense, setExpenses } = useExpenses();
  const { events, addEvent, updateEvent, deleteEvent, setEvents } = useCalendarEvents();
  const { tasks, addTask, updateTask, deleteTask, setTasks } = useTasks();
  const { emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate, setEmailTemplates } = useEmailTemplates();

  const { activityLogs, addActivityLog, setActivityLogs } = useActivityLogs();



  // Local UI State
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState('Blue');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState<Partial<Expense> | undefined>(undefined);

  // Quick Action Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync Profile Settings
  useEffect(() => {
    if (profile) {
      setIsDarkMode(profile.dark_mode ?? false);
      setTheme(profile.color_theme || 'Blue');
      setCommonTags(profile.common_tags || []);
    }
  }, [profile]);

  // Theme and Dark Mode Effect
  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    const selectedTheme = THEMES.find((t) => t.name === theme) || THEMES[0];
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
  }, [isDarkMode, theme]);

  // Reset search on navigation
  useEffect(() => {
    setGlobalSearchTerm('');
  }, [location.pathname]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clear data on logout
  useEffect(() => {
    if (!session) {
      setCustomers([]);
      setDocuments([]);
      setEvents([]);
      setExpenses([]);
      setEmailTemplates([]);
      setActivityLogs([]);

      setTasks([]);

      setCommonTags([]);
    }
  }, [session, setCustomers, setDocuments, setEvents, setExpenses, setEmailTemplates, setActivityLogs, setTasks]);

  const customersWithLogs = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      activityLog: activityLogs.filter((log) => log.customer_id === customer.id),
    }));
  }, [customers, activityLogs]);

  const handleSetTheme = (themeName: string) => {
    setTheme(themeName);
    updateProfile({ color_theme: themeName });
  };

  const handleSetIsDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    updateProfile({ dark_mode: isDark });
  };

  const handleSetCommonTags = (tags: string[]) => {
    setCommonTags(tags);
    updateProfile({ common_tags: tags });
  };

  const handleEditDocument = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsSidebarVisible(true);
    navigate('/editor');
  };



  const clearActiveDocuments = () => {
    setDocumentToEdit(null);
    setIsSidebarVisible(true);
  };

  const openExpenseModal = (initialData?: Partial<Omit<Expense, 'id'>>, expense?: Expense | null) => {
    setEditingExpense(expense || null);
    setInitialExpenseData(initialData);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
    if ('id' in expenseData) {
      updateExpense(expenseData);
    } else {
      addExpense(expenseData as Omit<Expense, 'id' | 'created_at' | 'user_id'>);
    }
  };

  // Wrappers for addDocument/addBusinessLetter to handle toasts
  const handleAddDocument = async (doc: any) => {
    try {
      const newDoc = await addDocument(doc);
      setToast({ message: 'Document saved successfully.', type: 'success' });
      return newDoc;
    } catch (e: any) {
      setToast({ message: `Error saving document: ${e.message}`, type: 'error' });
      return null;
    }
  };

  const handleUpdateDocument = async (doc: Document, silent?: boolean) => {
    try {
      const updatedDoc = await updateDocument(doc);
      if (!silent) {
        setToast({ message: 'Document updated successfully.', type: 'success' });
      }
      return updatedDoc;
    } catch (e: any) {
      if (!silent) {
        setToast({ message: `Error updating document: ${e.message}`, type: 'error' });
      } else {
        console.error('Auto-save error:', e);
      }
      return null;
    }
  };



  // Quick Action Handlers
  const handleQuickAddCustomer = async (customerData: any) => {
    try {
      await addCustomer(customerData);
      setToast({ message: 'Customer added successfully!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error adding customer: ${e.message}`, type: 'error' });
    }
  };



  const handleQuickSendEmail = (to: string, subject: string, body: string) => {
    // Mock send
    console.log('Sending email:', { to, subject, body });
    setToast({ message: 'Email sent successfully!', type: 'success' });
  };

  const handleQuickSetGoal = async (description: string, dueDate: string) => {
    try {
      await addTask({ text: description, due_date: dueDate });
      setToast({ message: 'Goal set successfully!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error setting goal: ${e.message}`, type: 'error' });
    }
  };

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/p/:id" element={<CustomerPortal />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  const isEditorPage =
    location.pathname.includes('/editor');

  const useHeaderNav = profile?.navigation_layout === 'header';

  return (
    <div className="h-screen bg-slate-100 dark:bg-zinc-950 relative flex flex-col">
      {/* Conditional Navigation */}
      {useHeaderNav ? (
        <HeaderNavigation />
      ) : (
        null // Sidebar is rendered inside the flex container below if not header nav
      )}

      <div className={`flex h-full ${useHeaderNav ? 'overflow-hidden' : ''}`}>
        {!useHeaderNav && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            clearActiveDocuments={clearActiveDocuments}
            isDarkMode={isDarkMode}
            setIsDarkMode={handleSetIsDarkMode}
          />
        )}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {!useHeaderNav && (
            <Header
              setIsSidebarOpen={setIsSidebarOpen}
              searchTerm={globalSearchTerm}
              setSearchTerm={setGlobalSearchTerm}
            />
          )}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/auth" element={<Navigate to="/dashboard" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    documents={documents}
                    editDocument={handleEditDocument}

                    activityLogs={activityLogs}
                    customers={customers}
                    addActivityLog={addActivityLog}
                    expenses={expenses}
                    tasks={tasks}
                    events={events}
                    onCreateInvoice={() => navigate('/editor')}
                    onSendEmail={() => setIsEmailModalOpen(true)}
                    onCreateMeeting={() => navigate('/calendar')}
                    onInviteUser={() => setToast({ message: 'Invite feature coming soon!', type: 'success' })}
                    onAddCustomer={() => setIsCustomerModalOpen(true)}
                    onLogExpense={() => openExpenseModal()}
                    onAddTask={() => setIsGoalModalOpen(true)}
                  />
                }
              />

              <Route
                path="/crm"
                element={
                  <CrmView
                    customers={customersWithLogs}
                    documents={documents}
                    addCustomer={handleQuickAddCustomer}
                    updateCustomer={updateCustomer}
                    deleteCustomer={deleteCustomer}
                    commonTags={commonTags}
                    setCommonTags={handleSetCommonTags}
                    searchTerm={globalSearchTerm}
                  />
                }
              />
              <Route
                path="/crm/:customerId"
                element={
                  <CustomerDetail
                    customers={customersWithLogs}
                    documents={documents}
                    editDocument={handleEditDocument}
                    updateCustomer={updateCustomer}
                    emailTemplates={emailTemplates}
                    companyInfo={companyInfo}
                    commonTags={commonTags}
                    setCommonTags={setCommonTags}
                    addActivityLog={addActivityLog}
                  />
                }
              />
              <Route path="/new" element={<Navigate to="/editor" />} />
              {FEATURES.ENABLE_FILES && (
                <Route
                  path="/files"
                  element={
                    <Files
                      documents={documents}
                      companyInfo={companyInfo}
                      editDocument={handleEditDocument}
                      updateDocument={handleUpdateDocument}
                      deleteDocument={deleteDocument}
                      bulkDeleteDocuments={bulkDeleteDocuments}
                      searchTerm={globalSearchTerm}
                      onCreateNew={clearActiveDocuments}
                      onAddCustomer={() => setIsCustomerModalOpen(true)}
                    />
                  }
                />
              )}
              {/* <Route path="/documents" element={<DocumentsPage />} /> */}
              <Route
                path="/editor"
                element={
                  <DocumentEditor
                    documentToEdit={documentToEdit}
                    addDocument={handleAddDocument}
                    updateDocument={handleUpdateDocument}
                    deleteDocument={deleteDocument}
                    companyInfo={companyInfo}
                    customers={customers}
                    expenses={expenses}
                  />
                }
              />

              <Route path="/text-editor" element={<TextDocumentEditor />} />
              <Route path="/text-editor/:id" element={<TextDocumentEditor />} />

              <Route
                path="/expenses"
                element={<Navigate to="/bills-and-expenses" replace />}
              />
              {FEATURES.ENABLE_BILLS && (
                <Route
                  path="/bills-and-expenses"
                  element={
                    <BillsAndExpenses
                      expenses={expenses}
                      customers={customers}
                      openExpenseModal={openExpenseModal}
                    />
                  }
                />
              )}
              <Route
                path="/calendar"
                element={
                  <Calendar
                    events={events}
                    tasks={tasks}
                    documents={documents}
                    editDocument={handleEditDocument}
                    addEvent={addEvent}
                    updateEvent={updateEvent}
                    deleteEvent={deleteEvent}
                    addTask={addTask}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                  />
                }
              />


              <Route
                path="/settings"
                element={
                  <Settings
                    companyInfo={companyInfo}
                    setCompanyInfo={setCompanyInfo}
                    updateProfile={updateProfile}
                    theme={theme}
                    setTheme={handleSetTheme}
                    emailTemplates={emailTemplates}
                    addEmailTemplate={addEmailTemplate}
                    updateEmailTemplate={updateEmailTemplate}
                    deleteEmailTemplate={deleteEmailTemplate}
                    profile={profile}
                  />
                }
              />
              <Route path="/p/:id" element={<CustomerPortal />} />
            </Routes>
          </main>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                } ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
              <div className="flex justify-between items-center">
                <p className="pr-4">{toast.message}</p>
                <button onClick={() => setToast(null)} className="text-xl font-bold opacity-70 hover:opacity-100">
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Global Expense Modal */}
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSave={handleSaveExpense}
            onDelete={deleteExpense}
            expense={editingExpense}
            customers={customers}
            initialData={initialExpenseData}
          />

          {/* Quick Action Modals */}
          <CustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSave={handleQuickAddCustomer}
            onUpdate={() => { }} // Not needed for quick add
            customerToEdit={null}
          />



          <EmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            onSend={handleQuickSendEmail}
            customers={customers}
          />

          <SetGoalModal
            isOpen={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onSave={handleQuickSetGoal}
          />

          {/* Quick Actions Floating Button */}
          <QuickActions
            onAddCustomer={() => setIsCustomerModalOpen(true)}

            onSendEmail={() => setIsEmailModalOpen(true)}
            onSetGoal={() => setIsGoalModalOpen(true)}
          />
        </div>
      </div>


    </div>
  );
};

export default App;