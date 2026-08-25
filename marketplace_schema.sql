-- volume 4.4.3 Marketplace Schema Additions

-- 1. Modify listings table to add missing fields
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS variety text,
ADD COLUMN IF NOT EXISTS harvest_date date,
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS quality_grade text,
ADD COLUMN IF NOT EXISTS expected_price numeric,
ADD COLUMN IF NOT EXISTS location jsonb, -- { address, coordinates }
ADD COLUMN IF NOT EXISTS available_until date,
ADD COLUMN IF NOT EXISTS moisture_percentage numeric,
ADD COLUMN IF NOT EXISTS organic_certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS delivery_options jsonb,
ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS crop_name text;

-- 2. marketplace_inventory
CREATE TABLE IF NOT EXISTS marketplace_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    total_stock numeric NOT NULL,
    reserved_stock numeric DEFAULT 0,
    available_stock numeric NOT NULL,
    sold_quantity numeric DEFAULT 0,
    damaged_quantity numeric DEFAULT 0,
    expiry_date date,
    warehouse_location text,
    updated_at timestamptz DEFAULT now()
);

-- 3. marketplace_media
CREATE TABLE IF NOT EXISTS marketplace_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    media_type text DEFAULT 'image', -- image, video, certificate
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 4. buyer_profiles (extends users table for buyers)
-- Note: 'buyers' table already exists, but we can extend it or create a specific profile table.
-- The existing 'buyers' table has: id, user_id, organization_name, contact_person, phone, address, location
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS total_purchases numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferred_crops text[];

-- 5. marketplace_notifications
CREATE TABLE IF NOT EXISTS marketplace_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text, -- alert, offer, etc.
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 6. Add Supabase Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_inventory, marketplace_media, marketplace_notifications;
