-- SECURITY NOTE: 
-- This function is defined as 'SECURITY DEFINER', which means it runs with the privileges 
-- of the creator (superuser/admin). 
-- However, we strictly limit the scope of the specific command to 'auth.uid()'.
-- 'auth.uid()' is a Supabase system function that returns the ID of the user making the API request.
-- It is impossible for a user to spoof this ID to equal another user's ID within the context of a request.
-- Therefore, this function can ONLY delete the currently authenticated user.

create or replace function delete_user()
returns void
language sql
security definer
as $$
  -- Strict checking: Delete only the row where the ID matches the session's User ID.
  delete from auth.users where id = auth.uid();
$$;
