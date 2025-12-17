-- Add structured fields for Proposals and Contracts
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS contract_scope TEXT,
ADD COLUMN IF NOT EXISTS contract_financials TEXT,
ADD COLUMN IF NOT EXISTS contract_payment_schedule TEXT,
ADD COLUMN IF NOT EXISTS contract_obligations TEXT,
ADD COLUMN IF NOT EXISTS contract_revisions TEXT,
ADD COLUMN IF NOT EXISTS contract_cancellation TEXT,
ADD COLUMN IF NOT EXISTS proposal_summary TEXT,
ADD COLUMN IF NOT EXISTS proposal_scope TEXT,
ADD COLUMN IF NOT EXISTS proposal_timeline TEXT,
ADD COLUMN IF NOT EXISTS proposal_investment TEXT,
ADD COLUMN IF NOT EXISTS proposal_next_steps TEXT;
