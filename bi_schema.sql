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
