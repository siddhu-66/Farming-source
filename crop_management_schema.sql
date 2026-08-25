-- ==========================================
-- Crop Management Schema (Volume 4.4.2)
-- ==========================================

-- 1. Alter existing crops table
ALTER TABLE crops
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS parcel_id uuid REFERENCES land_parcels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area numeric,
  ADD COLUMN IF NOT EXISTS seed_source text,
  ADD COLUMN IF NOT EXISTS seed_quantity numeric,
  ADD COLUMN IF NOT EXISTS sowing_date date,
  ADD COLUMN IF NOT EXISTS expected_harvest_date date,
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS soil_type text,
  ADD COLUMN IF NOT EXISTS irrigation_method text,
  ADD COLUMN IF NOT EXISTS current_stage text DEFAULT 'Planned',
  ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 100;

-- 2. Crop Activities
CREATE TABLE IF NOT EXISTS crop_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_date date NOT NULL,
  description text,
  cost numeric DEFAULT 0,
  performed_by text,
  created_at timestamptz DEFAULT now()
);

-- 3. Crop Images
CREATE TABLE IF NOT EXISTS crop_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text, -- e.g., Seed, Plant, Leaf, Flower, Fruit, Harvest
  analysis_result jsonb,
  captured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Crop Notes
CREATE TABLE IF NOT EXISTS crop_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Crop Calendar
CREATE TABLE IF NOT EXISTS crop_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- e.g., Sowing, Irrigation, Fertilizer, Spray, Harvest
  event_date date NOT NULL,
  status text DEFAULT 'Scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. Crop Health
CREATE TABLE IF NOT EXISTS crop_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  health_score integer NOT NULL,
  status text NOT NULL,
  issues jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- 7. Crop Tags
CREATE TABLE IF NOT EXISTS crop_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Crop Growth
CREATE TABLE IF NOT EXISTS crop_growth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  stage text NOT NULL,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 9. Crop Reports
CREATE TABLE IF NOT EXISTS crop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  report_data jsonb,
  generated_at timestamptz DEFAULT now()
);
