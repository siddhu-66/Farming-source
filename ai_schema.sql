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
