-- Server-side payment gateway records. Amounts are stored in paise to avoid floating point money errors.
CREATE TABLE IF NOT EXISTS razorpay_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','authorized','captured','failed','refunded')),
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  webhook_verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS razorpay_payments_order_id_idx ON razorpay_payments(order_id);
CREATE INDEX IF NOT EXISTS razorpay_payments_status_idx ON razorpay_payments(status);

ALTER TABLE razorpay_payments ENABLE ROW LEVEL SECURITY;

-- Backend uses the Supabase service role and enforces ownership/authorization in the API.
CREATE OR REPLACE FUNCTION set_razorpay_payment_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS razorpay_payments_updated_at ON razorpay_payments;
CREATE TRIGGER razorpay_payments_updated_at BEFORE UPDATE ON razorpay_payments
FOR EACH ROW EXECUTE FUNCTION set_razorpay_payment_updated_at();
