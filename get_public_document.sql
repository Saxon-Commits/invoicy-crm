-- Drop if exists
DROP FUNCTION IF EXISTS get_public_document(uuid);

-- Create the function
CREATE OR REPLACE FUNCTION get_public_document(doc_id uuid)
RETURNS TABLE (
  document jsonb,
  company_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with the privileges of the creator (postgres), bypassing RLS
AS $$
DECLARE
  v_user_id uuid;
  v_doc record;
  v_customer record;
  v_profile record;
BEGIN
  -- 1. Fetch the document
  SELECT * INTO v_doc FROM documents WHERE id = doc_id;
  
  -- If not found, return nothing
  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_user_id := v_doc.user_id;

  -- 2. Fetch the associated customer
  SELECT * INTO v_customer FROM customers WHERE id = v_doc.customer_id;

  -- 3. Fetch the profile (company info) of the document owner
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;

  -- 4. Construct and return the result
  RETURN QUERY
  SELECT 
    -- Merge document with customer object to match frontend expectations
    to_jsonb(v_doc) || jsonb_build_object('customer', to_jsonb(v_customer)) as document,
    -- Construct company info object
    jsonb_build_object(
      'name', v_profile.company_name,
      'address', v_profile.company_address,
      'email', v_profile.company_email,
      'abn', v_profile.company_abn,
      'logo', v_profile.company_logo
    ) as company_info;
END;
$$;
