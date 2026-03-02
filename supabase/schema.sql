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

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON subscriptions;
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

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- City subscriptions table
CREATE TABLE IF NOT EXISTS city_subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  name                text NOT NULL,
  country             text,
  region              text,
  status              text CHECK (status IN ('active', 'paused', 'archived')) DEFAULT 'active',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE city_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own city subscriptions" ON city_subscriptions;
CREATE POLICY "Users can view their own city subscriptions"
  ON city_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own city subscriptions" ON city_subscriptions;
CREATE POLICY "Users can insert their own city subscriptions"
  ON city_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own city subscriptions" ON city_subscriptions;
CREATE POLICY "Users can update their own city subscriptions"
  ON city_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own city subscriptions" ON city_subscriptions;
CREATE POLICY "Users can delete their own city subscriptions"
  ON city_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS city_subscriptions_updated_at ON city_subscriptions;
CREATE TRIGGER city_subscriptions_updated_at
  BEFORE UPDATE ON city_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_city_subscriptions_user_id
  ON city_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_city_subscriptions_user_status
  ON city_subscriptions(user_id, status);

-- City cost items table
CREATE TABLE IF NOT EXISTS city_cost_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id             uuid REFERENCES city_subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id             uuid REFERENCES auth.users NOT NULL,
  name                text NOT NULL,
  category            text CHECK (category IN (
                        'housing', 'water', 'electricity', 'gas', 'internet',
                        'property', 'transport', 'food', 'other'
                      )) NOT NULL,
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
  sort_order          int DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE city_cost_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own city cost items" ON city_cost_items;
CREATE POLICY "Users can view their own city cost items"
  ON city_cost_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own city cost items" ON city_cost_items;
CREATE POLICY "Users can insert their own city cost items"
  ON city_cost_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own city cost items" ON city_cost_items;
CREATE POLICY "Users can update their own city cost items"
  ON city_cost_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own city cost items" ON city_cost_items;
CREATE POLICY "Users can delete their own city cost items"
  ON city_cost_items FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS city_cost_items_updated_at ON city_cost_items;
CREATE TRIGGER city_cost_items_updated_at
  BEFORE UPDATE ON city_cost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_city_cost_items_user_id
  ON city_cost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_city_cost_items_city_id
  ON city_cost_items(city_id);
CREATE INDEX IF NOT EXISTS idx_city_cost_items_user_city_status
  ON city_cost_items(user_id, city_id, status);
CREATE INDEX IF NOT EXISTS idx_city_cost_items_next_billing
  ON city_cost_items(next_billing);

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  name                text NOT NULL,
  country_code        text,  -- ISO 3166-1 alpha-2 (CN, US, JP)
  currency            text DEFAULT 'CNY',
  status              text CHECK (status IN ('active', 'paused', 'archived')) DEFAULT 'active',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),

  CONSTRAINT unique_user_country UNIQUE(user_id, name)
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own countries" ON countries;
CREATE POLICY "Users can view their own countries"
  ON countries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own countries" ON countries;
CREATE POLICY "Users can insert their own countries"
  ON countries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own countries" ON countries;
CREATE POLICY "Users can update their own countries"
  ON countries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own countries" ON countries;
CREATE POLICY "Users can delete their own countries"
  ON countries FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS countries_updated_at ON countries;
CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_countries_user_id
  ON countries(user_id);
CREATE INDEX IF NOT EXISTS idx_countries_user_status
  ON countries(user_id, status);

-- Country cost items table
CREATE TABLE IF NOT EXISTS country_cost_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id          uuid REFERENCES countries(id) ON DELETE CASCADE NOT NULL,
  user_id             uuid REFERENCES auth.users NOT NULL,
  name                text NOT NULL,
  category            text CHECK (category IN (
                        'social_security',    -- 社保
                        'housing_fund',       -- 公积金
                        'income_tax',         -- 个税
                        'pension',            -- 养老保险
                        'medical_insurance',  -- 医疗保险
                        'unemployment',       -- 失业保险
                        'work_injury',        -- 工伤保险
                        'maternity',          -- 生育保险
                        'visa',               -- 签证费用
                        'other'
                      )) NOT NULL,
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
  sort_order          int DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE country_cost_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own country cost items" ON country_cost_items;
CREATE POLICY "Users can view their own country cost items"
  ON country_cost_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own country cost items" ON country_cost_items;
CREATE POLICY "Users can insert their own country cost items"
  ON country_cost_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own country cost items" ON country_cost_items;
CREATE POLICY "Users can update their own country cost items"
  ON country_cost_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own country cost items" ON country_cost_items;
CREATE POLICY "Users can delete their own country cost items"
  ON country_cost_items FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS country_cost_items_updated_at ON country_cost_items;
CREATE TRIGGER country_cost_items_updated_at
  BEFORE UPDATE ON country_cost_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_country_cost_items_user_id
  ON country_cost_items(user_id);
CREATE INDEX IF NOT EXISTS idx_country_cost_items_country_id
  ON country_cost_items(country_id);
CREATE INDEX IF NOT EXISTS idx_country_cost_items_user_country_status
  ON country_cost_items(user_id, country_id, status);
CREATE INDEX IF NOT EXISTS idx_country_cost_items_next_billing
  ON country_cost_items(next_billing);

-- Add country_id to city_subscriptions to establish hierarchy
ALTER TABLE city_subscriptions
  ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES countries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_city_subscriptions_country_id
  ON city_subscriptions(country_id);
