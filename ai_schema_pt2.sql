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
