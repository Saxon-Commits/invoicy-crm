-- ENSURE DATA DELETION
-- When a user is deleted from auth.users, we want all their data to vanish too.
-- If these keys are not set to CASCADE, the delete_user() function will FAIL with a constraint violation.

-- 1. Profiles
alter table public.profiles
drop constraint if exists profiles_id_fkey,
add constraint profiles_id_fkey
  foreign key (id)
  references auth.users(id)
  on delete cascade;

-- 2. Documents (Invoices, Quotes, etc)
-- Assuming 'user_id' is the column name. Adjust if it's 'owner_id' etc.
-- We must first find the name of the existing constraint if we don't know it, 
-- but assuming standard naming 'documents_user_id_fkey'.
alter table public.documents
drop constraint if exists documents_user_id_fkey,
add constraint documents_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- 3. Customers
alter table public.customers
drop constraint if exists customers_user_id_fkey,
add constraint customers_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- 4. Email Templates
alter table public.email_templates
drop constraint if exists email_templates_user_id_fkey,
add constraint email_templates_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- 5. Calendar Events (if stored locally)
-- Only if you have a local table for this.
