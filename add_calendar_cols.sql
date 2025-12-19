-- Add missing columns to calendar_events table
alter table public.calendar_events 
add column if not exists description text,
add column if not exists meeting_link text;
