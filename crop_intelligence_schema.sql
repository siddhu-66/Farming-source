-- ==========================================
-- Crop Intelligence Schema (Volume 4.4.2 Part 2)
-- ==========================================

-- 1. Disease Reports
CREATE TABLE IF NOT EXISTS disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  image_url text,
  disease_name text NOT NULL,
  severity text NOT NULL, -- Healthy, Mild, Moderate, Severe, Critical
  confidence_score numeric NOT NULL,
  affected_area text,
  recommended_treatment text,
  organic_treatment text,
  chemical_treatment text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- 2. Irrigation Plans
CREATE TABLE IF NOT EXISTS irrigation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  water_quantity numeric, -- Liters
  duration_minutes integer,
  recommended_method text,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- 3. Fertilizer Plans
CREATE TABLE IF NOT EXISTS fertilizer_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  stage text NOT NULL,
  fertilizer_type text NOT NULL,
  quantity numeric, -- Kg
  scheduled_date date,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- 4. Yield Predictions
CREATE TABLE IF NOT EXISTS yield_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  expected_yield numeric NOT NULL, -- Tons/Kg
  confidence_score numeric NOT NULL,
  estimated_harvest_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Harvest Plans
CREATE TABLE IF NOT EXISTS harvest_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  target_date date NOT NULL,
  labor_required integer,
  equipment_needed text[],
  storage_recommendation text,
  status text DEFAULT 'Planned',
  created_at timestamptz DEFAULT now()
);

-- 6. Pest Reports
CREATE TABLE IF NOT EXISTS pest_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  pest_name text NOT NULL,
  severity text NOT NULL,
  treatment text,
  reported_at timestamptz DEFAULT now()
);

-- 7. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  category text NOT NULL, -- Weather, Market, General
  title text NOT NULL,
  description text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
