-- Volume 4.4.7 IoT & Smart Farming

CREATE TABLE IF NOT EXISTS farm_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    crop text NOT NULL,
    area_acres numeric,
    soil_type text,
    irrigation_type text,
    water_requirement_liters numeric,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS iot_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE SET NULL,
    device_name text NOT NULL,
    device_type text NOT NULL, -- 'sensor', 'controller', 'gateway', 'weather_station'
    manufacturer text,
    battery_status numeric,
    connectivity_status text DEFAULT 'offline',
    gps_coordinates jsonb,
    last_sync_time timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id uuid REFERENCES iot_devices(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE CASCADE,
    soil_moisture numeric,
    soil_temperature numeric,
    air_temperature numeric,
    humidity numeric,
    nitrogen numeric,
    phosphorus numeric,
    potassium numeric,
    ph_level numeric,
    timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS irrigation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE CASCADE,
    device_id uuid REFERENCES iot_devices(id),
    started_at timestamptz DEFAULT now(),
    stopped_at timestamptz,
    duration_minutes numeric,
    water_used_liters numeric,
    trigger_source text -- 'manual', 'scheduled', 'ai_auto'
);

CREATE TABLE IF NOT EXISTS iot_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    device_id uuid REFERENCES iot_devices(id) ON DELETE CASCADE,
    alert_type text NOT NULL, -- 'low_moisture', 'device_offline', 'pump_failure'
    priority text DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    message text NOT NULL,
    is_resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE iot_devices, sensor_readings, irrigation_logs, iot_alerts;
