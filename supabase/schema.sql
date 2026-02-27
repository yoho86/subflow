-- SubFlow Database Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  name                text NOT NULL,
  icon_url            text,
  category            text,
  type                text CHECK (type IN ('recurring', 'lifetime')) NOT NULL,

  -- Recurring fields
  amount              decimal(10,2),
  currency            text DEFAULT 'CNY',
  billing_cycle       text CHECK (billing_cycle IN (
                        'weekly', 'monthly', 'quarterly',
                        'semi_annually', 'yearly', 'biennially', 'custom'
                      )),
  custom_cycle_days   int,
  next_billing        date,
  started_at          date,

  -- Lifetime fields
  purchase_price      decimal(10,2),
  purchase_date       date,
  expected_lifespan_months int,

  -- Common fields
  status              text CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for common queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
