-- PHASE 6: MISSING TABLES FOR CROPS MODULE

-- 1. land_parcels
CREATE TABLE IF NOT EXISTS land_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  parcel_name text NOT NULL,
  area numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. crop_activities
CREATE TABLE IF NOT EXISTS crop_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_date timestamptz NOT NULL,
  description text,
  cost numeric,
  performed_by text,
  created_at timestamptz DEFAULT now()
);

-- 3. crop_images
CREATE TABLE IF NOT EXISTS crop_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text,
  analysis_result jsonb,
  captured_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. crop_notes
CREATE TABLE IF NOT EXISTS crop_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. crop_calendar
CREATE TABLE IF NOT EXISTS crop_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_date timestamptz NOT NULL,
  status text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. ALTER TABLE crops (to support the actual fields used by the backend)
ALTER TABLE crops
  ADD COLUMN IF NOT EXISTS parcel_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS area numeric,
  ADD COLUMN IF NOT EXISTS seed_source text,
  ADD COLUMN IF NOT EXISTS seed_quantity numeric,
  ADD COLUMN IF NOT EXISTS sowing_date date,
  ADD COLUMN IF NOT EXISTS expected_harvest_date date,
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS soil_type text,
  ADD COLUMN IF NOT EXISTS irrigation_method text,
  ADD COLUMN IF NOT EXISTS current_stage text,
  ADD COLUMN IF NOT EXISTS health_score numeric;

-- Add the foreign key for parcel_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_parcel'
    ) THEN
        ALTER TABLE crops
        ADD CONSTRAINT fk_parcel FOREIGN KEY (parcel_id) REFERENCES land_parcels(id) ON DELETE SET NULL;
    END IF;
END $$;
