-- =====================================================================================
-- AgriAssist Volume 4.4.1 Part 2 - Advanced Farm Management Schema
-- =====================================================================================

-- 1. Farm Assets
CREATE TABLE IF NOT EXISTS farm_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL, -- Optional: which farm it belongs to
    asset_name TEXT NOT NULL,
    asset_type TEXT, -- Tractor, Drone, Pump, etc.
    brand TEXT,
    model TEXT,
    purchase_date DATE,
    purchase_cost NUMERIC,
    current_status TEXT DEFAULT 'Active', -- Active, In Repair, Sold
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Equipment Maintenance
CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES farm_assets(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    next_service_date DATE,
    maintenance_cost NUMERIC,
    service_provider TEXT,
    spare_parts_changed TEXT,
    warranty_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farm Workers
CREATE TABLE IF NOT EXISTS farm_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    worker_name TEXT NOT NULL,
    mobile_number TEXT,
    role TEXT, -- Permanent Worker, Seasonal Worker, Supervisor, etc.
    experience_years INTEGER,
    daily_wage NUMERIC,
    monthly_salary NUMERIC,
    joining_date DATE,
    status TEXT DEFAULT 'Active', -- Active, Inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES farm_workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- Present, Absent, Half Day, Leave
    overtime_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- Seeds, Fertilizers, Labor, Fuel, etc.
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    vendor TEXT,
    payment_method TEXT,
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Incomes
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    source TEXT NOT NULL, -- Crop Sales, Subsidies, etc.
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crop History
CREATE TABLE IF NOT EXISTS crop_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    season TEXT,
    planting_date DATE,
    harvest_date DATE,
    yield_quantity NUMERIC,
    yield_unit TEXT,
    revenue NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
