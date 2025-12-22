-- Add ALL missing columns for modern documents
ALTER TABLE documents
-- Financials
ADD COLUMN IF NOT EXISTS deposit_amount numeric,
ADD COLUMN IF NOT EXISTS deposit_type text CHECK (deposit_type IN ('percentage', 'fixed')),
-- Display Options
ADD COLUMN IF NOT EXISTS show_line_items_table boolean DEFAULT true,
-- Signatures & Content
ADD COLUMN IF NOT EXISTS signature text,
ADD COLUMN IF NOT EXISTS content text,

-- Contract Fields
ADD COLUMN IF NOT EXISTS contract_scope text,
ADD COLUMN IF NOT EXISTS contract_financials text,
ADD COLUMN IF NOT EXISTS contract_payment_schedule text,
ADD COLUMN IF NOT EXISTS contract_obligations text,
ADD COLUMN IF NOT EXISTS contract_revisions text,
ADD COLUMN IF NOT EXISTS contract_cancellation text,

-- Proposal Fields
ADD COLUMN IF NOT EXISTS proposal_summary text,
ADD COLUMN IF NOT EXISTS proposal_scope text,
ADD COLUMN IF NOT EXISTS proposal_timeline text,
ADD COLUMN IF NOT EXISTS proposal_investment text,
ADD COLUMN IF NOT EXISTS proposal_next_steps text;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
