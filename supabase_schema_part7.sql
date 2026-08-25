-- PHASE 10: CHAT, NOTIFICATIONS, SCHEMES

CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants uuid[] NOT NULL,
  type text DEFAULT 'direct',
  related_order uuid REFERENCES orders(id) ON DELETE SET NULL,
  last_message uuid,
  last_message_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text',
  file_url text,
  is_deleted boolean DEFAULT false,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_last_message_fkey FOREIGN KEY (last_message) REFERENCES chat_messages(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS government_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheme_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL,
  status text DEFAULT 'Submitted',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheme_eligibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
  score integer,
  status text,
  checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheme_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  status text DEFAULT 'Uploaded',
  created_at timestamptz DEFAULT now()
);
