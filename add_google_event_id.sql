ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Index for performance if needed, though volume is low
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_id ON calendar_events(google_event_id);
