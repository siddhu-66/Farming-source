-- PHASE 10: MISSING COLUMNS FOR TRANSPORT MODULE

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS capacity_unit text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS make text,
  ADD COLUMN IF NOT EXISTS year integer,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_location jsonb;

ALTER TABLE transport_bookings
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fare numeric,
  ADD COLUMN IF NOT EXISTS checkpoints jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_location jsonb,
  ADD COLUMN IF NOT EXISTS actual_delivery timestamptz;
