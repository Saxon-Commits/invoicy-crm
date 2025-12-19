-- 1. Add missing columns (Safe to run if they exist)
alter table public.calendar_events 
add column if not exists description text,
add column if not exists meeting_link text;

-- 2. Enable Security
alter table public.calendar_events enable row level security;

-- 3. Reset Policies (This triggers the "Destructive" warning, which is fine)
drop policy if exists "Users can view their own events" on public.calendar_events;
drop policy if exists "Users can insert their own events" on public.calendar_events;
drop policy if exists "Users can update their own events" on public.calendar_events;
drop policy if exists "Users can delete their own events" on public.calendar_events;

-- 4. Create New Strict Policies
create policy "Users can view their own events"
  on public.calendar_events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own events"
  on public.calendar_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.calendar_events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.calendar_events for delete
  using (auth.uid() = user_id);
