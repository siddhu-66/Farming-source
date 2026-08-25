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
