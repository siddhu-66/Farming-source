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
