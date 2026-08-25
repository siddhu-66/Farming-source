-- Volume 4.4.7 IoT & Smart Farming (Part 2)

CREATE TABLE IF NOT EXISTS drone_missions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE SET NULL,
    drone_name text NOT NULL,
    mission_type text NOT NULL, -- 'field_mapping', 'crop_health', 'thermal_imaging'
    status text DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'failed'
    start_time timestamptz,
    end_time timestamptz,
    battery_usage numeric,
    images_captured integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS satellite_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    image_type text NOT NULL, -- 'ndvi', 'evi', 'soil_moisture'
    capture_date timestamptz NOT NULL,
    average_index_score numeric, -- e.g. average NDVI score 0.0 to 1.0
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    zone_id uuid REFERENCES farm_zones(id) ON DELETE CASCADE,
    prediction_type text NOT NULL, -- 'disease_risk', 'yield_forecast', 'water_requirement'
    confidence_score numeric NOT NULL,
    risk_level text, -- 'low', 'medium', 'high'
    details jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precision_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    report_title text NOT NULL,
    report_type text NOT NULL, -- 'weekly_health', 'water_usage', 'fertilizer'
    summary text NOT NULL,
    data_points jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE drone_missions, satellite_images, ai_predictions, precision_reports;
