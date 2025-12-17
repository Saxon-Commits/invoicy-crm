-- Add missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Optional: Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers(industry);
