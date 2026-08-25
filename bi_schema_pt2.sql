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
