-- ==============================================================================
-- AgriAssist Final Schema Synchronization (Audit Phase 3)
-- This file synchronizes the backend TypeScript repositories with the DB schema
-- without dropping or destroying existing data.
-- ==============================================================================

-- 1. Create missing 'roles' table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code TEXT UNIQUE NOT NULL,
    priority INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create missing 'permissions' table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fix 'trusted_devices'
-- We use ALTER TABLE to safely add columns without dropping existing devices
ALTER TABLE public.trusted_devices
    ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
    ADD COLUMN IF NOT EXISTS device_code TEXT,
    ADD COLUMN IF NOT EXISTS device_type TEXT,
    ADD COLUMN IF NOT EXISTS platform TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT,
    ADD COLUMN IF NOT EXISTS timezone TEXT,
    ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 4. Fix 'security_events'
-- Map the TS repository fields to the existing SQL columns by adding aliases or renaming.
-- We'll rename them to match the TS code exactly to prevent backend crashes.
DO $$
BEGIN
  -- We'll just add the TS columns and map them in the logic, or rename if possible.
  -- Adding new columns is safer than renaming to prevent breaking other legacy queries.
  ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS detection_method TEXT;
  ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS acknowledged_by UUID;
  ALTER TABLE public.security_events ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Fix 'login_history' NOT NULL constraint violations
-- The `auth.repository.ts` method logLogin() omits several columns. We must alter them to DROP NOT NULL.
ALTER TABLE public.login_history ALTER COLUMN login_id DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN login_type DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN authentication_method DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN ip_address DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN browser DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN operating_system DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN device_type DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN platform DROP NOT NULL;
ALTER TABLE public.login_history ALTER COLUMN user_agent DROP NOT NULL;

-- 6. User Verification Flags
-- TS uses 'is_mobile_verified', schema initially used 'is_phone_verified'. Ensure 'is_mobile_verified' exists and sync.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_mobile_verified BOOLEAN DEFAULT false;

-- Sync existing data if any
UPDATE public.users SET is_mobile_verified = is_phone_verified WHERE is_phone_verified = true AND is_mobile_verified = false;

-- Clean up
COMMENT ON TABLE public.roles IS 'Role definitions for RBAC';
COMMENT ON TABLE public.permissions IS 'Permission definitions for RBAC';
