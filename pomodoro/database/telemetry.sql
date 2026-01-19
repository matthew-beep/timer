-- Telemetry Events Table
-- Stores all telemetry events for analytics and debugging

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  properties JSONB,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON telemetry_events(event);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at);

-- Enable Row Level Security
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own telemetry events
CREATE POLICY "Users can insert their own telemetry"
  ON telemetry_events
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can view their own telemetry events
CREATE POLICY "Users can view their own telemetry"
  ON telemetry_events
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Only service role can view all telemetry (for admin dashboard)
CREATE POLICY "Service role can view all telemetry"
  ON telemetry_events
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Optional: Create a view for common analytics queries
CREATE OR REPLACE VIEW telemetry_summary AS
SELECT 
  event,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as day
FROM telemetry_events
GROUP BY event, DATE_TRUNC('day', created_at)
ORDER BY day DESC, event_count DESC;

-- Grant access to authenticated users
GRANT SELECT, INSERT ON telemetry_events TO authenticated;
GRANT SELECT ON telemetry_summary TO authenticated;

COMMENT ON TABLE telemetry_events IS 'Stores telemetry events for analytics and debugging';
COMMENT ON COLUMN telemetry_events.event IS 'Event name (e.g., notes.sync.success, auth.sign_in.started)';
COMMENT ON COLUMN telemetry_events.properties IS 'Additional event properties as JSON';
COMMENT ON COLUMN telemetry_events.timestamp IS 'Client-side timestamp in milliseconds since epoch';
