CREATE TABLE IF NOT EXISTS registration_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS registration_drafts_expires_at_idx ON registration_drafts(expires_at);
ALTER TABLE registration_drafts ENABLE ROW LEVEL SECURITY;

-- Drafts are created through the backend using the service-role client.
-- No anonymous/browser access is granted because drafts can contain personal data.
REVOKE ALL ON TABLE registration_drafts FROM PUBLIC;
GRANT ALL ON TABLE registration_drafts TO service_role;
