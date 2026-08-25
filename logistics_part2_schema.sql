-- volume 4.4.4 Transport & Logistics Schema Additions (Part 2)

-- 1. fleet_maintenance
CREATE TABLE IF NOT EXISTS fleet_maintenance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
    transporter_id uuid REFERENCES transporters(id) ON DELETE CASCADE,
    maintenance_type text NOT NULL, -- e.g., 'Routine Service', 'Repair', 'Tire Replacement'
    description text,
    cost numeric,
    service_date date NOT NULL,
    next_service_date date,
    status text DEFAULT 'completed',
    created_at timestamptz DEFAULT now()
);

-- 2. warehouse_inventory
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_name text NOT NULL,
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    crop_name text NOT NULL,
    batch_id text,
    quantity numeric NOT NULL,
    weight numeric NOT NULL,
    quality_grade text,
    temperature_logged numeric,
    humidity_logged numeric,
    storage_type text DEFAULT 'dry', -- 'dry', 'cold'
    status text DEFAULT 'stored', -- 'stored', 'dispatched'
    stored_at timestamptz DEFAULT now(),
    dispatched_at timestamptz
);

-- 3. warehouse_bookings
CREATE TABLE IF NOT EXISTS warehouse_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    warehouse_name text NOT NULL,
    crop_name text NOT NULL,
    expected_weight numeric NOT NULL,
    storage_type text NOT NULL, -- 'dry', 'cold'
    expected_arrival date NOT NULL,
    duration_days integer NOT NULL,
    status text DEFAULT 'confirmed',
    estimated_cost numeric,
    created_at timestamptz DEFAULT now()
);

-- 4. logistics_payments
CREATE TABLE IF NOT EXISTS logistics_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES transport_bookings(id) ON DELETE CASCADE,
    payer_id uuid REFERENCES users(id) ON DELETE SET NULL, -- usually buyer or farmer
    payee_id uuid REFERENCES users(id) ON DELETE SET NULL, -- transporter
    amount numeric NOT NULL,
    platform_fee numeric DEFAULT 0,
    status text DEFAULT 'pending', -- 'pending', 'processing', 'settled', 'failed'
    payment_method text,
    transaction_reference text,
    created_at timestamptz DEFAULT now(),
    settled_at timestamptz
);

-- 5. logistics_invoices
CREATE TABLE IF NOT EXISTS logistics_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES transport_bookings(id) ON DELETE CASCADE,
    invoice_number text UNIQUE NOT NULL,
    invoice_date date NOT NULL,
    total_amount numeric NOT NULL,
    tax_amount numeric DEFAULT 0,
    document_url text,
    status text DEFAULT 'generated',
    created_at timestamptz DEFAULT now()
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE warehouse_inventory, warehouse_bookings, logistics_payments;
