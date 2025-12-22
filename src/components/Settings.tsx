import React, { useRef, useState, useEffect } from 'react';
import { CompanyInfo, EmailTemplate } from '../types';
import { supabase } from '../supabaseClient';
import { THEMES } from '../constants';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

// --- TemplateModal (unchanged from your file) ---
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate) => void;
  onDelete?: (templateId: string) => void;
  template: EmailTemplate | null;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  template,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPlaceholdersFor, setShowPlaceholdersFor] = useState<'subject' | 'body' | null>(null);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholderMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(template?.name || '');
      setSubject(template?.subject || '');
      setBody(template?.body || '');
      setShowPlaceholdersFor(null);
    }
  }, [isOpen, template]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        placeholderMenuRef.current &&
        !placeholderMenuRef.current.contains(event.target as Node)
      ) {
        setShowPlaceholdersFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && subject.trim() && body.trim()) {
      onSave({
        ...(template || {}),
        name,
        subject,
        body,
      } as Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate);
      onClose();
    } else {
      alert('Please fill in all fields.');
    }
  };

  const placeholders = {
    Customer: {
      Name: '{{customer.name}}',
      Email: '{{customer.email}}',
      Phone: '{{customer.phone}}',
      Address: '{{customer.address}}',
    },
    Company: {
      Name: '{{company.name}}',
      Email: '{{company.email}}',
      Address: '{{company.address}}',
    },
  };

  const insertPlaceholder = (field: 'subject' | 'body', placeholder: string) => {
    const inputRef = field === 'subject' ? subjectInputRef : bodyTextareaRef;
    const setValue = field === 'subject' ? setSubject : setBody;
    const currentValue = field === 'subject' ? subject : body;

    if (inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const newValue =
        currentValue.substring(0, selectionStart ?? 0) +
        placeholder +
        currentValue.substring(selectionEnd ?? 0);

      setValue(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = (selectionStart ?? 0) + placeholder.length;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    setShowPlaceholdersFor(null);
  };

  const renderPlaceholderMenu = (field: 'subject' | 'body') => (
    <div
      ref={placeholderMenuRef}
      className="absolute right-0 mt-1 w-56 bg-white dark:bg-zinc-700 rounded-md shadow-lg z-20 border border-slate-200 dark:border-zinc-600"
    >
      {Object.entries(placeholders).map(([groupName, groupPlaceholders], index) => (
        <div
          key={groupName}
          className={`p-1 ${index > 0 ? 'border-t border-slate-100 dark:border-zinc-600' : ''}`}
        >
          <p className="px-3 py-1 text-xs font-semibold text-slate-400">{groupName}</p>
          {Object.entries(groupPlaceholders).map(([name, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => insertPlaceholder(field, value)}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-600 rounded-md"
            >
              {name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{template ? 'Edit Template' : 'Add Template'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Invoice Follow-up"
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Subject
              </label>
              <div className="relative">
                <input
                  ref={subjectInputRef}
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full p-2 pr-10 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPlaceholdersFor(showPlaceholdersFor === 'subject' ? null : 'subject')
                  }
                  className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-primary-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showPlaceholdersFor === 'subject' && renderPlaceholderMenu('subject')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Body
              </label>
              <div className="relative">
                <textarea
                  ref={bodyTextareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 font-mono text-sm"
                ></textarea>
                <button
                  type="button"
                  onClick={() =>
                    setShowPlaceholdersFor(showPlaceholdersFor === 'body' ? null : 'body')
                  }
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-primary-500 bg-slate-100 dark:bg-zinc-900 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showPlaceholdersFor === 'body' && renderPlaceholderMenu('body')}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-between rounded-b-xl">
          <div>
            {template && onDelete && (
              <button
                onClick={() => onDelete(template.id)}
                className="px-4 py-2 rounded-md font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- End of TemplateModal ---

// --- DeleteConfirmationModal ---
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmationText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md border border-red-100 dark:border-red-900/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Delete Account</h2>
          </div>

          <div className="space-y-4">
            {step === 1 ? (
              <>
                <p className="text-slate-600 dark:text-zinc-300">
                  Are you absolutely sure? This action will:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-500 dark:text-zinc-400 space-y-1 ml-1">
                  <li>Permanently delete your account</li>
                  <li>Remove all your invoices, quotes, and customers</li>
                  <li>Unlink your calendar and integrations</li>
                  <li><strong className="text-red-600 dark:text-red-400">This cannot be undone.</strong></li>
                </ul>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-600 dark:text-zinc-300 text-sm">
                  To confirm deletion, please type <strong className="select-all">DELETE</strong> below:
                </p>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full p-2 border-2 border-slate-200 dark:border-zinc-700 rounded-lg focus:border-red-500 focus:outline-none dark:bg-zinc-900 font-mono text-center uppercase tracking-widest"
                  autoFocus
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={confirmationText !== 'DELETE' || isLoading}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



interface SettingsProps {
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  updateProfile: (data: any) => Promise<any>;
  theme: string;
  setTheme: (theme: string) => void;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'>) => void;
  updateEmailTemplate: (template: EmailTemplate) => void;
  deleteEmailTemplate: (templateId: string) => void;
  profile: { stripe_account_id?: string, stripe_account_setup_complete?: boolean, navigation_layout?: 'sidebar' | 'header' } | null;
}

const Settings: React.FC<SettingsProps> = ({
  companyInfo,
  setCompanyInfo,
  updateProfile,
  theme,
  setTheme,
  emailTemplates,
  addEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  profile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const { connectGoogle, disconnectGoogle, revokeGooglePermissions, loading: googleLoading, error: googleError, isConnected } = useGoogleCalendar();

  // Check Stripe account status on component load
  useEffect(() => {
    const checkStripeStatus = async () => {
      if (profile && profile.stripe_account_id && !profile.stripe_account_setup_complete) {
        setStripeLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch('/api/check-stripe-account-status', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to check Stripe status');
          }

          if (data.setupComplete) {
            await supabase
              .from('profiles')
              .update({ stripe_account_setup_complete: true })
              .eq('id', session.user.id);
          }

        } catch (error: any) {
          console.error("Error checking Stripe status:", error.message);
        } finally {
          setStripeLoading(false);
        }
      }
    };
    checkStripeStatus();
  }, [profile]);

  // Local state for immediate UI feedback on form inputs
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
  useEffect(() => {
    setLocalCompanyInfo(companyInfo);
  }, [companyInfo]);

  const handleCompanyInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLocalCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = async () => {
    // Update the "real" state on blur, which triggers the DB update via updateProfile
    try {
      await updateProfile({
        company_name: localCompanyInfo.name,
        company_address: localCompanyInfo.address,
        company_email: localCompanyInfo.email,
        company_abn: localCompanyInfo.abn,
        company_logo: localCompanyInfo.logo
      });
      setCompanyInfo(localCompanyInfo);
    } catch (error) {
      console.error("Failed to update company info", error);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newLogo = reader.result as string;
        const newInfo = { ...localCompanyInfo, logo: newLogo };
        setLocalCompanyInfo(newInfo);

        // Update immediately for logo
        try {
          await updateProfile({ company_logo: newLogo });
          setCompanyInfo(newInfo);
        } catch (error) {
          console.error("Failed to update logo", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openNewTemplateModal = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (
    templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate
  ) => {
    if ('id' in templateData) {
      updateEmailTemplate(templateData);
    } else {
      addEmailTemplate(templateData);
    }
  };

  const handleStripeConnect = async () => {
    setStripeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not logged in.");
      }

      const response = await fetch('/api/create-stripe-account-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe link');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error connecting to Stripe:', error);
      alert(`Could not connect to Stripe: ${error.message}`);
    } finally {
      setStripeLoading(false);
    }
  };

  const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_setup_complete;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Company & Branding */}
        <div className="lg:col-span-2 space-y-6">

          {/* Company Profile Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Company Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Logo Section */}
                <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                  <div
                    className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition border border-slate-200 dark:border-zinc-700 overflow-hidden group relative"
                    onClick={handleLogoClick}
                  >
                    {localCompanyInfo.logo ? (
                      <img
                        src={localCompanyInfo.logo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs text-center px-2">Upload Logo</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                  />
                </div>

                {/* Details Form */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Company Name</label>
                    <input
                      type="text"
                      name="name"
                      value={localCompanyInfo.name}
                      onChange={handleCompanyInfoChange}
                      onBlur={handleBlur}
                      className="w-full p-2 text-sm border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Address</label>
                    <textarea
                      name="address"
                      value={localCompanyInfo.address}
                      onChange={handleCompanyInfoChange}
                      onBlur={handleBlur}
                      rows={2}
                      className="w-full p-2 text-sm border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      placeholder="123 Business St, City, Country"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={localCompanyInfo.email}
                      onChange={handleCompanyInfoChange}
                      onBlur={handleBlur}
                      className="w-full p-2 text-sm border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">ABN / Tax ID</label>
                    <input
                      type="text"
                      name="abn"
                      value={localCompanyInfo.abn}
                      onChange={handleCompanyInfoChange}
                      onBlur={handleBlur}
                      className="w-full p-2 text-sm border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="XX XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Email Templates</h2>
              <button
                onClick={openNewTemplateModal}
                className="px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
              >
                + Add Template
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {emailTemplates.length > 0 ? (
                emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="px-6 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-700 dark:text-zinc-200">{template.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-xs">{template.subject}</p>
                    </div>
                    <button
                      onClick={() => openEditTemplateModal(template)}
                      className="text-xs font-medium text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
                  No templates yet. Create one to speed up your workflow.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Integrations */}
        <div className="space-y-6">

          {/* Visual Preferences */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Appearance</h2>
            </div>
            <div className="p-6">
              <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === t.name ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-zinc-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: t.swatchColor }}
                    title={t.name}
                  >
                    {theme === t.name && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white drop-shadow-md">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-zinc-800 pt-6">
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Navigation Layout</label>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg inline-flex">
                  <button
                    onClick={() => updateProfile({ navigation_layout: 'sidebar' })}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${(!profile?.navigation_layout || profile?.navigation_layout === 'sidebar')
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Sidebar
                  </button>
                  <button
                    onClick={() => updateProfile({ navigation_layout: 'header' })}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${profile?.navigation_layout === 'header'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Header Tabs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Integrations</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {/* Stripe */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#635BFF]/10 rounded-md flex items-center justify-center text-[#635BFF]">
                      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor"><path d="M13.9 16.3c0 .8.5 1.3 1.8 1.3 2.5 0 4.8-.9 4.8-3.4 0-1.7-1.3-2.6-3.7-2.6-2.5 0-4.6.6-4.6.6v-3s2.2-.8 4.9-.8c3.2 0 5.6 1.6 5.6 4.9 0 4.6-6.4 4.8-6.4 7.2 0 .6.5 1 1.8 1 1.7 0 4.9-1.1 4.9-1.1v3.3s-2.3 1-5.3 1c-3.6 0-5.8-1.8-5.8-5.1 0-4.8 6.4-5.2 6.4-7.5 0-.5-.4-.8-1.5-.8-1.8 0-4.4.8-4.4.8v-3.2s2.3-.8 5.1-.8c3.4 0 5.6 1.7 5.6 4.9 0 4.6-6.4 4.8-6.4 7.2 0 .6.5 1 1.8 1 1.7 0 4.9-1.1 4.9-1.1v3.3s-2.3 1-5.3 1c-3.6 0-5.8-1.8-5.8-5.1z" /></svg>
                    </div>
                    <span className="font-medium text-sm">Stripe Payments</span>
                  </div>
                  {isStripeConnected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Accept credit card payments directly on your invoices.</p>
                <button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  className={`w-full py-1.5 text-xs font-semibold rounded-md border transition-colors ${isStripeConnected ? 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300' : 'bg-[#635BFF] border-transparent text-white hover:bg-[#635BFF]/90'}`}
                >
                  {stripeLoading ? 'Processing...' : isStripeConnected ? 'Manage Account' : 'Connect Stripe'}
                </button>
              </div>

              {/* Google Calendar */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" /></svg>
                    </div>
                    <span className="font-medium text-sm">Google Calendar</span>
                  </div>
                  {isConnected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Sync events and create Google Meet links automatically.</p>

                {isConnected ? (
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to disconnect your Google Calendar?')) {
                        try {
                          await disconnectGoogle();
                        } catch (e: any) {
                          alert(e.message);
                        }
                      }
                    }}
                    disabled={googleLoading}
                    className="w-full py-1.5 text-xs font-semibold rounded-md border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {googleLoading ? 'Disconnecting...' : 'Disconnect Calendar'}
                  </button>
                ) : (
                  <button
                    onClick={connectGoogle}
                    disabled={googleLoading}
                    className="w-full py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {googleLoading ? 'Connecting...' : 'Connect Calendar'}
                  </button>
                )}

                <div className="mt-3 text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={async () => {
                      if (window.confirm('Reset Permissions? This forces Google to forget your app so you can re-consent (Video Recording).')) {
                        try {
                          await revokeGooglePermissions();
                          alert("Permissions revoked! Now try connecting again.");
                        } catch (e: any) {
                          alert(e.message);
                        }
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 underline"
                  >
                    Troubleshoot: Force Reset Permissions
                  </button>
                </div>

                {googleError && <p className="text-red-500 text-[10px] mt-2">{googleError}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone - Full Width */}
      <div className="bg-red-50 dark:bg-red-950/20 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30">
          <h2 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-400 mb-1">Delete Account</h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="py-2 px-4 whitespace-nowrap rounded-md border border-red-300 dark:border-red-800 bg-white dark:bg-red-950/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 font-semibold text-sm transition-colors"
            >
              Delete Personal Account & Data
            </button>
          </div>
        </div>
      </div>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        onDelete={deleteEmailTemplate}
        template={editingTemplate}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isLoading={stripeLoading}
        onConfirm={async () => {
          setStripeLoading(true);
          try {
            const { error } = await supabase.rpc('delete_user');
            if (error) throw error;
            await supabase.auth.signOut();
          } catch (err: any) {
            alert('Failed to delete account: ' + err.message);
            setStripeLoading(false);
          }
        }}
      />
    </div >

  );
};

export default Settings;