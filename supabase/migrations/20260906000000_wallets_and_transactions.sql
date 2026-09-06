CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  available_balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance numeric(14,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  lifetime_earnings numeric(14,2) NOT NULL DEFAULT 0 CHECK (lifetime_earnings >= 0),
  total_spent numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  cashback numeric(14,2) NOT NULL DEFAULT 0 CHECK (cashback >= 0),
  reward_points integer NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  escrow_locked numeric(14,2) NOT NULL DEFAULT 0 CHECK (escrow_locked >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  direction text NOT NULL CHECK (direction IN ('CREDIT','DEBIT')),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','REVERSED')),
  method text,
  reference text UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  bank_id text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS wallet_transactions_wallet_created_idx ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS withdrawal_requests_wallet_created_idx ON withdrawal_requests(wallet_id, created_at DESC);
