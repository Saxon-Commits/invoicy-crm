-- Add company_name column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Optional: Add an index if you plan to search by company_name frequently
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
