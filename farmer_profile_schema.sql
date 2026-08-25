-- Farmer Profile & Farm Management Migration (Vol 4.4.1 Part 1)

-- 1. Add new columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number text;

-- 2. Add new columns to farmers
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS occupation text DEFAULT 'Farmer';
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS emergency_contact_number text;

-- 3. Add new columns to farms
ALTER TABLE farms ADD COLUMN IF NOT EXISTS farm_code text;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS farm_type text;
-- total_area is already in farms (from previous sync)
ALTER TABLE farms ADD COLUMN IF NOT EXISTS area_unit text;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS ownership_type text;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS primary_crop text;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_method text;

-- 4. Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  house_number text,
  village text,
  mandal text,
  district text,
  state text,
  country text DEFAULT 'India',
  pincode text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

-- 5. Create land_parcels table
CREATE TABLE IF NOT EXISTS land_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  parcel_name text,
  parcel_id text,
  area numeric,
  gps_coordinates jsonb,
  soil_type text,
  elevation numeric,
  water_source text,
  current_crop text,
  status text,
  created_at timestamptz DEFAULT now()
);

-- 6. Create soil_reports table
CREATE TABLE IF NOT EXISTS soil_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  soil_type text,
  ph numeric,
  organic_carbon numeric,
  nitrogen numeric,
  phosphorus numeric,
  potassium numeric,
  micronutrients jsonb,
  last_test_date date,
  created_at timestamptz DEFAULT now()
);

-- 7. Create irrigation_sources table
CREATE TABLE IF NOT EXISTS irrigation_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  source_type text,
  water_availability text,
  irrigation_frequency text,
  pump_capacity numeric,
  created_at timestamptz DEFAULT now()
);

-- 8. Create farmer_documents table
CREATE TABLE IF NOT EXISTS farmer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  document_type text,
  file_url text,
  verification_status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- 9. Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'Draft',
  submitted_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);
