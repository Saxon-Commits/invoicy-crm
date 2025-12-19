-- Enable Row Level Security (RLS)
alter table public.calendar_events enable row level security;

-- Drop existing policies to ensure clean slate (avoids errors if they exist)
drop policy if exists "Users can view their own events" on public.calendar_events;
drop policy if exists "Users can insert their own events" on public.calendar_events;
drop policy if exists "Users can update their own events" on public.calendar_events;
drop policy if exists "Users can delete their own events" on public.calendar_events;

-- Create strict policies
-- 1. View: Users see ONLY rows where user_id matches their auth UID
create policy "Users can view their own events"
  on public.calendar_events for select
  using (auth.uid() = user_id);

-- 2. Insert: Users can ONLY insert rows where user_id matches their auth UID
create policy "Users can insert their own events"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

-- 3. Update: Users can ONLY update rows where user_id matches their auth UID
create policy "Users can update their own events"
  on public.calendar_events for update
  using (auth.uid() = user_id);

-- 4. Delete: Users can ONLY delete rows where user_id matches their auth UID
create policy "Users can delete their own events"
  on public.calendar_events for delete
  using (auth.uid() = user_id);
