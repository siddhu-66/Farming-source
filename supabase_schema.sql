-- Drop existing tables to start fresh (WARNING: This destroys data)
drop table if exists audit_logs cascade;
drop table if exists reviews cascade;
drop table if exists ai_reports cascade;
drop table if exists analytics cascade;
drop table if exists government_schemes cascade;
drop table if exists weather_logs cascade;
drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists notifications cascade;
drop table if exists payments cascade;
drop table if exists orders cascade;
drop table if exists contracts cascade;
drop table if exists offers cascade;
drop table if exists listings cascade;
drop table if exists crop_waste cascade;
drop table if exists crops cascade;
drop table if exists farms cascade;
drop table if exists vehicles cascade;
drop table if exists transporters cascade;
drop table if exists industries cascade;
drop table if exists buyers cascade;
drop table if exists farmers cascade;
drop table if exists users cascade;

-- 1. users
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  phone text unique,
  password_hash text,
  role text,
  status text,
  verified boolean default false,
  avatar_url text,
    is_deleted boolean default false,
  language text,
  theme text,
  email_verification_token text,
  refresh_token text,
  password_reset_token text,
  password_reset_expires timestamptz,
  last_login timestamptz,
  is_phone_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1.5 otps
create table otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  phone text,
  otp text,
  type text,
  is_used boolean default false,
  attempts integer default 0,
  expires_at timestamptz default now() + interval '10 minutes',
  created_at timestamptz default now()
);

-- 2. farmers
create table farmers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  experience integer,
  land_area numeric,
  land_type text,
  irrigation_type text,
  sustainability_score numeric,
  created_at timestamptz default now()
);

-- 3. buyers
create table buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  company_name text,
  gst_number text,
  address text,
  created_at timestamptz default now()
);

-- 4. industries
create table industries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  industry_type text,
  factory_name text,
  gst_number text,
  sustainability_rating numeric,
  created_at timestamptz default now()
);

-- 5. transporters
create table transporters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  license_number text,
  fleet_size integer,
  total_earnings numeric,
  created_at timestamptz default now()
);

-- 6. vehicles
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  transporter_id uuid references transporters(id) on delete cascade,
  vehicle_type text,
  registration_number text,
  capacity numeric,
  status text,
  created_at timestamptz default now()
);

-- 7. farms
create table farms (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references farmers(id) on delete cascade,
  farm_name text,
  state text,
  district text,
  village text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

-- 8. crops
create table crops (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references farmers(id) on delete cascade,
  farm_id uuid references farms(id) on delete cascade,
  crop_name text,
  variety text,
  quantity numeric,
  price numeric,
  quality text,
  harvest_date date,
  status text,
  created_at timestamptz default now()
);

-- 9. crop_waste
create table crop_waste (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references farmers(id) on delete cascade,
  waste_type text,
  quantity numeric,
  price numeric,
  location text,
  image_url text,
  created_at timestamptz default now()
);

-- 10. listings
create table listings (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid references crops(id) on delete cascade,
  seller_id uuid references users(id) on delete cascade,
  listing_type text,
  quantity numeric,
  price numeric,
  status text,
  created_at timestamptz default now()
);

-- 11. offers
create table offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  buyer_id uuid references users(id) on delete cascade,
  offer_price numeric,
  quantity numeric,
  status text,
  created_at timestamptz default now()
);

-- 12. contracts
create table contracts (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade,
  farmer_id uuid references users(id) on delete cascade,
  buyer_id uuid references users(id) on delete cascade,
  transporter_id uuid references users(id) on delete set null,
  status text,
  contract_file text,
  created_at timestamptz default now()
);

-- 13. orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete cascade,
  payment_status text,
  delivery_status text,
  total_amount numeric,
  created_at timestamptz default now()
);

-- 14. payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  amount numeric,
  payment_method text,
  payment_status text,
  receipt_url text,
  created_at timestamptz default now()
);

-- 15. notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 16. conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid references users(id) on delete cascade,
  participant_two uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 17. messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  message text,
  attachment text,
  created_at timestamptz default now()
);

-- 18. weather_logs
create table weather_logs (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid references farms(id) on delete cascade,
  temperature numeric,
  humidity numeric,
  rainfall numeric,
  wind_speed numeric,
  pressure numeric,
  created_at timestamptz default now()
);

-- 19. government_schemes
create table government_schemes (
  id uuid primary key default gen_random_uuid(),
  title text,
  state text,
  category text,
  eligibility text,
  application_url text,
  deadline date
);

-- 20. analytics
create table analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  metric text,
  value numeric,
  recorded_at timestamptz default now()
);

-- 21. ai_reports
create table ai_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  report_type text,
  result jsonb,
  created_at timestamptz default now()
);

-- 22. reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references users(id) on delete cascade,
  reviewee_id uuid references users(id) on delete cascade,
  rating integer,
  comment text,
  created_at timestamptz default now()
);

-- 23. audit_logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  action text,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values 
('profile-images', 'profile-images', true),
('crop-images', 'crop-images', true),
('crop-waste-images', 'crop-waste-images', true),
('farm-images', 'farm-images', true),
('documents', 'documents', false),
('contracts', 'contracts', false),
('vehicle-documents', 'vehicle-documents', false),
('industry-documents', 'industry-documents', false),
('chat-files', 'chat-files', false),
('government-files', 'government-files', true),
('invoices', 'invoices', false)
on conflict (id) do nothing;

-- ENABLE REALTIME
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table users, notifications, messages, orders, payments, contracts, offers, listings, crop_waste;
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
-- volume 4.4.5 Government Schemes & Subsidies Additions

-- 1. Extend existing government_schemes
ALTER TABLE government_schemes 
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS benefits jsonb,
  ADD COLUMN IF NOT EXISTS required_documents jsonb,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. scheme_categories
CREATE TABLE IF NOT EXISTS scheme_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 3. farmer_applications
CREATE TABLE IF NOT EXISTS farmer_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
    status text DEFAULT 'draft', -- draft, submitted, under_review, documents_requested, approved, rejected, closed
    submitted_documents jsonb,
    ai_validation_status text DEFAULT 'pending', -- pending, passed, failed
    application_date timestamptz DEFAULT now(),
    last_updated timestamptz DEFAULT now()
);

-- 4. eligibility_reports
CREATE TABLE IF NOT EXISTS eligibility_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
    score integer NOT NULL, -- 0-100
    recommendation_tier text, -- Highly Recommended, Recommended, Possible Match, Not Recommended
    reasons jsonb, -- Reasons for the score
    missing_documents jsonb,
    generated_at timestamptz DEFAULT now()
);

-- 5. subsidy_records
CREATE TABLE IF NOT EXISTS subsidy_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    application_id uuid REFERENCES farmer_applications(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending', -- pending, disbursed, failed
    expected_payout_date date,
    actual_payout_date date,
    transaction_reference text,
    created_at timestamptz DEFAULT now()
);

-- 6. ai_scheme_recommendations
CREATE TABLE IF NOT EXISTS ai_scheme_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    scheme_id uuid REFERENCES government_schemes(id) ON DELETE CASCADE,
    match_score integer NOT NULL,
    reasoning text,
    created_at timestamptz DEFAULT now()
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE farmer_applications, subsidy_records;
-- volume 4.4.5 Financial Services Additions (Part 2)

-- 1. insurance_policies
CREATE TABLE IF NOT EXISTS insurance_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    policy_number text UNIQUE NOT NULL,
    provider text NOT NULL,
    policy_type text NOT NULL,
    covered_crops jsonb,
    coverage_amount numeric NOT NULL,
    premium_amount numeric NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'active', -- active, expired, cancelled
    created_at timestamptz DEFAULT now()
);

-- 2. insurance_claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    policy_id uuid REFERENCES insurance_policies(id) ON DELETE CASCADE,
    incident_date date NOT NULL,
    damage_description text,
    evidence_documents jsonb,
    requested_amount numeric NOT NULL,
    approved_amount numeric,
    ai_risk_score integer, -- 0-100
    status text DEFAULT 'submitted', -- draft, submitted, under_verification, approved, rejected, paid
    created_at timestamptz DEFAULT now(),
    last_updated timestamptz DEFAULT now()
);

-- 3. loan_accounts
CREATE TABLE IF NOT EXISTS loan_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    loan_number text UNIQUE NOT NULL,
    bank_name text NOT NULL,
    loan_type text NOT NULL,
    principal_amount numeric NOT NULL,
    interest_rate numeric NOT NULL, -- percentage
    duration_months integer NOT NULL,
    remaining_balance numeric NOT NULL,
    disbursement_date date NOT NULL,
    status text DEFAULT 'active', -- pending, active, closed, defaulted
    created_at timestamptz DEFAULT now()
);

-- 4. emi_payments
CREATE TABLE IF NOT EXISTS emi_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id uuid REFERENCES loan_accounts(id) ON DELETE CASCADE,
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    due_date date NOT NULL,
    amount numeric NOT NULL,
    principal_component numeric,
    interest_component numeric,
    status text DEFAULT 'pending', -- pending, paid, overdue
    paid_date date,
    transaction_reference text,
    created_at timestamptz DEFAULT now()
);

-- 5. financial_transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    transaction_type text NOT NULL, -- premium_payment, emi_payment, subsidy_credit, loan_disbursement, insurance_settlement
    amount numeric NOT NULL,
    reference_id uuid, -- Can link to emi_payments, insurance_claims, etc.
    status text DEFAULT 'completed',
    transaction_date timestamptz DEFAULT now(),
    notes text
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE insurance_claims, loan_accounts, emi_payments, financial_transactions;
-- volume 4.4.6 AI Assistant Additions (Part 1)

-- 1. ai_conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title text,
    language text DEFAULT 'en',
    topic text,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. ai_messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES ai_conversations(id) ON DELETE CASCADE,
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role text NOT NULL, -- 'user' or 'assistant'
    content text NOT NULL,
    audio_url text, -- For voice messages
    image_url text, -- For image uploads
    detected_intent text,
    created_at timestamptz DEFAULT now()
);

-- 3. ai_image_reports
CREATE TABLE IF NOT EXISTS ai_image_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    detected_crop text,
    health_status text,
    diseases jsonb, -- Array of identified diseases with confidence
    treatment_suggestions jsonb,
    confidence_score numeric,
    created_at timestamptz DEFAULT now()
);

-- 4. ai_knowledge_articles
CREATE TABLE IF NOT EXISTS ai_knowledge_articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    tags jsonb,
    language text DEFAULT 'en',
    -- In a real RAG setup, we would add pgvector embedding column here
    -- embedding vector(1536),
    created_at timestamptz DEFAULT now()
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_conversations, ai_messages, ai_image_reports;
-- volume 4.4.6 AI Assistant Additions (Part 2)

-- 5. ai_ocr_documents
CREATE TABLE IF NOT EXISTS ai_ocr_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
    document_url text NOT NULL,
    document_type text NOT NULL, -- e.g., 'aadhaar', 'land_record', 'invoice'
    extracted_data jsonb,
    confidence_score numeric,
    status text DEFAULT 'completed',
    created_at timestamptz DEFAULT now()
);

-- 6. ai_memory_profiles
CREATE TABLE IF NOT EXISTS ai_memory_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_language text DEFAULT 'en',
    favorite_crops jsonb DEFAULT '[]'::jsonb,
    farm_size_acres numeric,
    soil_type text,
    irrigation_type text,
    special_notes text,
    updated_at timestamptz DEFAULT now()
);

-- 7. ai_analytics
CREATE TABLE IF NOT EXISTS ai_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date UNIQUE NOT NULL,
    total_conversations integer DEFAULT 0,
    active_users integer DEFAULT 0,
    voice_requests integer DEFAULT 0,
    image_diagnoses integer DEFAULT 0,
    ocr_requests integer DEFAULT 0,
    average_response_time_ms integer,
    avg_accuracy_score numeric,
    created_at timestamptz DEFAULT now()
);

-- Add Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_ocr_documents, ai_memory_profiles, ai_analytics;
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
-- Volume 4.4.8 BI & Analytics

CREATE TABLE IF NOT EXISTS analytics_dashboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role text NOT NULL,
    layout_preferences jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    kpi_name text NOT NULL, -- 'revenue', 'yield', 'orders'
    kpi_value numeric NOT NULL,
    kpi_date date NOT NULL DEFAULT current_date,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, kpi_name, kpi_date)
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    report_type text NOT NULL, -- 'farm_report', 'financial_report'
    frequency text NOT NULL, -- 'daily', 'weekly', 'monthly'
    delivery_channels text[], -- ['email', 'in_app']
    last_sent timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    report_type text NOT NULL,
    file_url text NOT NULL,
    format text NOT NULL, -- 'pdf', 'excel', 'csv'
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forecast_models (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    forecast_type text NOT NULL, -- 'yield', 'revenue', 'market_price'
    target_date date NOT NULL,
    predicted_value numeric NOT NULL,
    confidence_score numeric,
    created_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE analytics_dashboards, analytics_kpis, scheduled_reports, analytics_reports, forecast_models;
-- Volume 4.4.8 BI & Analytics (Part 2)

CREATE TABLE IF NOT EXISTS etl_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name text NOT NULL, -- e.g., 'daily_revenue_aggregation'
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    records_processed integer DEFAULT 0,
    started_at timestamptz,
    completed_at timestamptz,
    error_message text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_business_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    insight_type text NOT NULL, -- 'opportunity', 'risk', 'anomaly'
    title text NOT NULL,
    description text NOT NULL,
    priority text DEFAULT 'medium', -- 'low', 'medium', 'high'
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmark_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    metric_name text NOT NULL, -- e.g., 'yield_per_acre'
    user_value numeric NOT NULL,
    regional_average numeric NOT NULL,
    top_percentile numeric NOT NULL,
    comparison_period text NOT NULL, -- e.g., 'Q3 2026'
    created_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE etl_jobs, ai_business_insights, benchmark_results;
-- Volume 4.4.9 Security & Authentication (Part 1)

CREATE TABLE IF NOT EXISTS auth_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    refresh_token text NOT NULL,
    device_info text,
    browser text,
    ip_address text,
    location text,
    is_active boolean DEFAULT true,
    last_activity timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trusted_devices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    device_id text NOT NULL,
    device_name text,
    os text,
    browser text,
    security_score integer DEFAULT 100,
    is_trusted boolean DEFAULT true,
    last_login timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    ip_address text,
    is_successful boolean NOT NULL,
    failure_reason text,
    attempted_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE auth_sessions, trusted_devices;

-- ==========================================
-- V4.4.9 Part 2: Security & Admin Schema
-- ==========================================

CREATE TABLE IF NOT EXISTS security_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL,
    level text NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW, INFO
    title text NOT NULL,
    description text NOT NULL,
    source text,
    status text DEFAULT 'OPEN', -- OPEN, ACKNOWLEDGED, RESOLVED
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    resolved_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS security_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    severity text NOT NULL,
    status text DEFAULT 'INVESTIGATING', -- INVESTIGATING, CONTAINED, RECOVERED, CLOSED
    related_alerts uuid[],
    mitigation_steps text,
    created_at timestamptz DEFAULT now(),
    closed_at timestamptz,
    reported_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS backup_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name text NOT NULL,
    schedule text,
    type text NOT NULL, -- FULL, INCREMENTAL
    is_active boolean DEFAULT true,
    last_run_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS backup_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid REFERENCES backup_jobs(id) ON DELETE CASCADE,
    status text NOT NULL, -- SUCCESS, FAILED, IN_PROGRESS
    file_size_bytes bigint,
    storage_path text,
    checksum text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    error_message text
);

CREATE TABLE IF NOT EXISTS disaster_recovery_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name text NOT NULL,
    backup_id uuid REFERENCES backup_history(id),
    status text NOT NULL, -- PASSED, FAILED
    rto_minutes integer,
    rpo_minutes integer,
    notes text,
    tested_at timestamptz DEFAULT now(),
    tested_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS system_configuration (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    is_enabled boolean DEFAULT false,
    description text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    prefix text NOT NULL,
    hash text NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    permissions text[],
    expires_at timestamptz,
    last_used_at timestamptz,
    is_revoked boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS secret_rotation_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_name text NOT NULL,
    rotated_at timestamptz DEFAULT now(),
    rotated_by uuid REFERENCES users(id),
    status text NOT NULL -- SUCCESS, FAILED
);

CREATE TABLE IF NOT EXISTS security_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name text NOT NULL,
    version text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    published_at timestamptz DEFAULT now(),
    published_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL, -- DPDP, OWASP
    status text NOT NULL,
    findings jsonb,
    generated_at timestamptz DEFAULT now(),
    generated_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS health_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name text NOT NULL,
    status text NOT NULL, -- HEALTHY, DEGRADED, DOWN
    latency_ms integer,
    error_message text,
    checked_at timestamptz DEFAULT now()
);

-- ==========================================
-- V4.5.0 Part 1: Infrastructure & Production Operations Schema
-- ==========================================

CREATE TABLE IF NOT EXISTS deployment_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name text NOT NULL,
    version text NOT NULL,
    environment text NOT NULL, -- STAGING, PRODUCTION
    status text NOT NULL, -- PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK
    deployed_by text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    logs text
);

CREATE TABLE IF NOT EXISTS infrastructure_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL, -- SCALED_UP, SCALED_DOWN, NODE_ADDED, NODE_REMOVED, NETWORK_CHANGE
    source text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cluster_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_name text NOT NULL,
    cpu_utilization numeric,
    memory_utilization numeric,
    active_pods integer,
    pending_pods integer,
    failed_pods integer,
    recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cache_statistics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_name text NOT NULL,
    hits bigint,
    misses bigint,
    evictions bigint,
    memory_used_bytes bigint,
    recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_health (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name text NOT NULL,
    status text NOT NULL, -- HEALTHY, DEGRADED, DOWN
    latency_ms integer,
    last_checked_at timestamptz DEFAULT now(),
    error_details text
);

CREATE TABLE IF NOT EXISTS node_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id text NOT NULL,
    role text, -- WORKER, MASTER, DATABASE
    status text NOT NULL, -- READY, NOT_READY
    cpu_capacity text,
    memory_capacity text,
    last_heartbeat_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS release_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    release_version text NOT NULL,
    release_notes text,
    released_at timestamptz DEFAULT now(),
    released_by text,
    is_rollback boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS build_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id text NOT NULL,
    repository text NOT NULL,
    branch text NOT NULL,
    commit_hash text NOT NULL,
    status text NOT NULL, -- SUCCESS, FAILED
    duration_seconds integer,
    built_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_registry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name text UNIQUE NOT NULL,
    version text NOT NULL,
    endpoints text[],
    health_check_url text,
    dependencies text[],
    status text NOT NULL,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS infrastructure_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_name text NOT NULL,
    severity text NOT NULL, -- CRITICAL, HIGH, WARNING, INFO
    message text NOT NULL,
    component text NOT NULL,
    status text DEFAULT 'OPEN', -- OPEN, ACKNOWLEDGED, RESOLVED
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    resolved_by text
);

-- ==========================================
-- V4.5.0 Part 2: CI/CD & Operations Schema
-- ==========================================

CREATE TABLE IF NOT EXISTS application_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name text NOT NULL,
    level text NOT NULL, -- INFO, ERROR, WARNING, DEBUG
    message text NOT NULL,
    context jsonb,
    timestamp timestamptz DEFAULT now(),
    trace_id text
);

CREATE TABLE IF NOT EXISTS deployment_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version text NOT NULL,
    environment text NOT NULL,
    status text NOT NULL, -- QUEUED, BUILDING, DEPLOYING, SUCCESS, FAILED
    triggered_by text,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    build_logs text
);

CREATE TABLE IF NOT EXISTS rollback_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id uuid REFERENCES deployment_jobs(id),
    rolled_back_from_version text NOT NULL,
    rolled_back_to_version text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL,
    initiated_by text,
    initiated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_schedule (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    status text NOT NULL, -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_active boolean DEFAULT false,
    created_by text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS infrastructure_costs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL, -- AWS, GCP, Azure, Supabase
    service_type text NOT NULL, -- Compute, Storage, Network
    amount numeric NOT NULL,
    currency text DEFAULT 'USD',
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type text NOT NULL, -- CPU, Memory, Disk, Bandwidth
    usage_value numeric NOT NULL,
    unit text NOT NULL,
    measured_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operational_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    severity text NOT NULL, -- SEV1, SEV2, SEV3
    status text NOT NULL, -- INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED
    impact text,
    root_cause text,
    started_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    managed_by text
);
