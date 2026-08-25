-- Volume 4.4.9 Security & Authentication (Part 1)

CREATE TABLE IF NOT EXISTS auth_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    refresh_token text NOT NULL,
    device_info text,
    browser text,
    ip_address text,
    location text,
    is_active boolean DEFAULT true,
    last_activity timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trusted_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    device_id text NOT NULL,
    device_name text,
    os text,
    browser text,
    security_score integer DEFAULT 100,
    is_trusted boolean DEFAULT true,
    last_login timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    ip_address text,
    is_successful boolean NOT NULL,
    failure_reason text,
    attempted_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE auth_sessions, trusted_devices;
