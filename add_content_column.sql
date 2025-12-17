-- Add content column to documents table for storing HTML content of Proposals/Contracts
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Optional: Add index if needed, though usually not for large text fields
-- CREATE INDEX IF NOT EXISTS idx_documents_content ON documents(content);
