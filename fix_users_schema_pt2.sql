ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_photo text,
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_password_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_locked_until timestamptz;
