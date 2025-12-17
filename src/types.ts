import React from 'react';

// Note: These types are manually defined to match the Supabase schema.
// In a larger project, you could generate these from your database schema.

export interface Profile {
  id: string; // UUID from auth.users
  subscription_tier: 'free' | 'pro';
  stripe_customer_id?: string;
  company_name?: string;
  company_address?: string;
  company_email?: string;
  company_abn?: string;
  company_logo?: string;
  dark_mode?: boolean;
  color_theme?: string;
  common_tags?: string[];
  stripe_account_id?: string;
  stripe_account_setup_complete?: boolean;
  navigation_layout?: 'sidebar' | 'header';
}

export interface ActivityLog {
  id: string;
  user_id: string;
  customer_id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';
  content: string;
  date: string; // ISO string
  subject?: string;
  link?: string;
  attendees?: string;
  created_at: string;
}

export interface Customer {
  id: string; // UUID from Supabase
  user_id: string;
  name: string;
  company_name?: string;
  industry?: string;
  email: string;
  phone: string;
  address: string;
  tags?: string[];
  preferences?: string[];
  activityLog?: ActivityLog[];
  created_at: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  sourceExpenseId?: string;
}

export enum DocumentType {
  Invoice = 'Invoice',
  Quote = 'Quote',
  Proposal = 'Proposal',
  Contract = 'Contract',
  SLA = 'SLA',
}

export enum DocumentStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Signed = 'Signed', // Added Signed status
  Accepted = 'Accepted', // Added Accepted status
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: string;
}

export interface Document {
  id: string; // UUID from Supabase
  user_id: string;
  doc_number: string;
  customer_id: string;
  customer: Customer | null; // This will be populated after fetching via a join
  items: DocumentItem[];
  issue_date: string;
  due_date: string;
  type: DocumentType;
  status: DocumentStatus;
  notes?: string;
  terms?: string;
  template_id: string;
  subtotal: number;
  tax: number;
  total: number;
  deposit_amount?: number;
  deposit_type?: 'percentage' | 'fixed';
  recurrence?: Recurrence;
  stripe_payment_link?: string;
  archived?: boolean;
  content?: string; // HTML content for Proposals/Contracts
  signature?: string; // Base64 signature data
  // Contract specific fields
  contract_scope?: string;
  contract_financials?: string;
  contract_payment_schedule?: string;
  contract_obligations?: string;
  contract_revisions?: string;
  contract_cancellation?: string;
  // Proposal specific fields
  proposal_summary?: string;
  proposal_scope?: string;
  proposal_timeline?: string;
  proposal_investment?: string;
  proposal_next_steps?: string;
  created_at: string;
}

// Overwrite the customer property to be nullable for new docs before they're saved
export type NewDocumentData = Omit<
  Document,
  'id' | 'doc_number' | 'customer_id' | 'created_at' | 'user_id' | 'customer'
> & { customer: Customer | null };

export interface PreviewProps {
  document: Document;
  companyInfo: CompanyInfo;
  profile: Profile | null;
}

export interface TemplateInfo {
  id: string;
  name: string;
  previewComponent: React.FC<PreviewProps>;
}

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  abn?: string;
  logo?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  color: string;
  meeting_link?: string;
  created_at: string;
}

// FIX: Added missing Task interface export.
export interface Task {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  due_date?: string; // ISO string
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  receipt_image?: string; // base64
  customer_id?: string;
  status: 'unbilled' | 'billed' | 'paid' | 'unpaid';
  created_at: string;
}



export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ColorTheme {
  name: string;
  colors: { [key: string]: string };
  swatchColor: string;
}



export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string; // HTML content
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string; // HTML content with placeholders
  category: 'Sales' | 'Project' | 'General';
}
