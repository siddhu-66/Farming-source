-- PHASE 10: MISSING COLUMNS FOR INDUSTRY MODULE

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS industry_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS history jsonb DEFAULT '[]'::jsonb;

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS signatures jsonb DEFAULT '{}'::jsonb;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quality_grade text,
  ADD COLUMN IF NOT EXISTS quality_notes text,
  ADD COLUMN IF NOT EXISTS quality_inspected_at timestamptz;
