-- volume 4.4.4 Transport & Logistics Schema Additions

-- 1. transport_bookings
CREATE TABLE IF NOT EXISTS transport_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    transporter_id uuid REFERENCES transporters(id) ON DELETE SET NULL,
    vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
    crop_name text NOT NULL,
    quantity numeric NOT NULL,
    weight numeric NOT NULL,
    pickup_address jsonb NOT NULL,
    delivery_address jsonb NOT NULL,
    pickup_time timestamptz NOT NULL,
    vehicle_type text NOT NULL,
    estimated_freight numeric,
    actual_freight numeric,
    status text DEFAULT 'draft', -- draft, searching, assigned, scheduled, arrived, loading, in_transit, delivered, completed, cancelled
    temperature_requirement text,
    loading_assistance boolean DEFAULT false,
    insurance boolean DEFAULT false,
    fragile_goods boolean DEFAULT false,
    delivery_notes text,
    contact_person jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. shipment_tracking
CREATE TABLE IF NOT EXISTS shipment_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES transport_bookings(id) ON DELETE CASCADE,
    location jsonb NOT NULL, -- { lat, lng, address }
    speed numeric,
    heading numeric,
    status text,
    timestamp timestamptz DEFAULT now(),
    recorded_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- 3. transport_drivers (Extends users table or specific driver table)
-- The prompt mentions driver profiles.
CREATE TABLE IF NOT EXISTS transport_drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    transporter_id uuid REFERENCES transporters(id) ON DELETE CASCADE,
    license_number text,
    experience_years numeric,
    rating numeric DEFAULT 0,
    languages_spoken text[],
    status text DEFAULT 'available',
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Note: 'vehicles' table already exists, but we can extend it if needed.
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS max_capacity numeric,
ADD COLUMN IF NOT EXISTS gps_status text,
ADD COLUMN IF NOT EXISTS insurance_status text,
ADD COLUMN IF NOT EXISTS permit_validity date,
ADD COLUMN IF NOT EXISTS current_location jsonb,
ADD COLUMN IF NOT EXISTS availability text DEFAULT 'available';

-- 4. loading_records
CREATE TABLE IF NOT EXISTS loading_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES transport_bookings(id) ON DELETE CASCADE,
    loading_start_time timestamptz,
    loading_end_time timestamptz,
    total_weight numeric,
    number_of_bags numeric,
    packaging_type text,
    supervisor_id uuid REFERENCES users(id),
    photos_before jsonb,
    created_at timestamptz DEFAULT now()
);

-- 5. delivery_confirmations
CREATE TABLE IF NOT EXISTS delivery_confirmations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES transport_bookings(id) ON DELETE CASCADE,
    otp_verified boolean DEFAULT false,
    driver_confirmed boolean DEFAULT false,
    delivery_photos jsonb,
    digital_signature text,
    final_weight numeric,
    confirmed_at timestamptz DEFAULT now()
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transport_bookings, shipment_tracking, vehicles;
