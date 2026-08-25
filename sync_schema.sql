-- 1. users
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address jsonb;

-- Sync existing data
UPDATE users SET name = full_name WHERE name IS NULL;
UPDATE users SET avatar = avatar_url WHERE avatar IS NULL;
UPDATE users SET is_active = (status = 'active') WHERE status IS NOT NULL;
UPDATE users SET is_verified = verified WHERE verified IS NOT NULL;

-- 2. listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES users(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_per_unit numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS min_order_quantity numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS crop_name text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS crop_variety text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS organic_certified boolean;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_from timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_till timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;

-- 3. offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offered_price numeric;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES users(id);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS industry_id uuid REFERENCES users(id);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS history jsonb;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counter_price numeric;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counter_message text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS counter_by uuid;

-- 4. contracts
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES listings(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS industry_id uuid REFERENCES users(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS quantity numeric;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS price_per_unit numeric;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_amount numeric;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delivery_date date;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delivery_address jsonb;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS quality_terms text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signatures jsonb;

-- 5. orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS industry_id uuid REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transport_id uuid REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timeline jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quality_grade text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quality_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quality_inspected_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 6. payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES contracts(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS method text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_by uuid REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS received_by text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS received_by_id uuid REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at timestamptz DEFAULT now();

-- 7. farms
ALTER TABLE farms ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS total_area numeric;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS soil_type text;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS name text;

-- 8. crops
ALTER TABLE crops ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS planting_date date;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS expected_harvest_date date;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS estimated_price numeric;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS organic_certified boolean;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS pesticides text[];
ALTER TABLE crops ADD COLUMN IF NOT EXISTS fertilizers text[];
ALTER TABLE crops ADD COLUMN IF NOT EXISTS actual_harvest_date date;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS actual_price numeric;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 9. government_schemes
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS target_roles text[];
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS ministry text;
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 10. audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_id uuid;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details jsonb;

-- 11. transport_bookings (Missing Table)
CREATE TABLE IF NOT EXISTS transport_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES users(id),
  transporter_id uuid REFERENCES users(id),
  vehicle_id uuid REFERENCES vehicles(id),
  order_id uuid REFERENCES orders(id),
  pickup_address jsonb,
  delivery_address jsonb,
  pickup_date timestamptz,
  cargo text,
  weight numeric,
  weight_unit text,
  special_instructions text,
  status text DEFAULT 'requested',
  fare numeric,
  checkpoints jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 12. chat tables (Missing aliases)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid REFERENCES users(id),
  participant_two uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id),
  sender_id uuid REFERENCES users(id),
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 13. notifications aliases
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "userId" uuid REFERENCES users(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "isRead" boolean DEFAULT false;

-- Add vehicles missing columns
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS make text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS capacity_unit text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_location jsonb;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES users(id);

-- Expose get_nearby_listings function if possible (mocked to just return listings)
CREATE OR REPLACE FUNCTION get_nearby_listings(lat numeric, lng numeric, radius_km numeric)
RETURNS SETOF listings AS $$
BEGIN
  RETURN QUERY SELECT * FROM listings WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;
