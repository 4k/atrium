-- Management System Migration
-- Adds tables and columns needed for full finance dashboard management

-- ============================================================================
-- MODIFY PERSONS TABLE - Add payday configuration
-- ============================================================================
ALTER TABLE persons ADD COLUMN IF NOT EXISTS payday INTEGER DEFAULT 1 CHECK (payday >= 1 AND payday <= 31);
ALTER TABLE persons ADD COLUMN IF NOT EXISTS email TEXT; -- Optional linked email for the person

-- ============================================================================
-- MODIFY CONTRIBUTIONS TABLE - Add expected vs actual tracking
-- ============================================================================
-- Rename amount to actual_amount and add expected_amount
ALTER TABLE contributions RENAME COLUMN amount TO actual_amount;
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS expected_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (expected_amount >= 0);

-- ============================================================================
-- CONTRIBUTION CONFIGURATION
-- ============================================================================
-- Stores how contributions should be calculated per person
CREATE TABLE IF NOT EXISTS contribution_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  
  -- Contribution method
  is_percentage_based BOOLEAN NOT NULL DEFAULT true,
  expected_percentage DECIMAL(5,2) CHECK (expected_percentage >= 0 AND expected_percentage <= 100),
  fixed_amount NUMERIC(10, 2) CHECK (fixed_amount >= 0),
  
  -- Target total joint contribution (household level, but stored per person for simplicity)
  joint_contribution_target NUMERIC(10, 2) DEFAULT 5000,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(household_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_contribution_config_household ON contribution_config(household_id);
CREATE INDEX IF NOT EXISTS idx_contribution_config_person ON contribution_config(person_id);

-- ============================================================================
-- PERSONAL ALLOWANCE CONFIGURATION  
-- ============================================================================
-- Stores the default monthly allowance settings per person
CREATE TABLE IF NOT EXISTS personal_allowance_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  
  default_monthly_amount NUMERIC(10, 2) NOT NULL DEFAULT 200 CHECK (default_monthly_amount >= 0),
  allow_rollover BOOLEAN NOT NULL DEFAULT true,
  allow_borrowing BOOLEAN NOT NULL DEFAULT true,
  max_borrow_amount NUMERIC(10, 2) DEFAULT 100,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX IF NOT EXISTS idx_personal_allowance_config_person ON personal_allowance_config(person_id);

-- ============================================================================
-- MONTHLY TARGETS CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS monthly_targets_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  
  -- Income targets
  income_target NUMERIC(10, 2) NOT NULL DEFAULT 10000 CHECK (income_target >= 0),
  
  -- Savings targets
  savings_rate_target DECIMAL(5,2) NOT NULL DEFAULT 25 CHECK (savings_rate_target >= 0 AND savings_rate_target <= 100),
  
  -- Budget adherence target (percentage)
  budget_adherence_target DECIMAL(5,2) NOT NULL DEFAULT 100 CHECK (budget_adherence_target >= 0 AND budget_adherence_target <= 100),
  
  -- Next milestone
  next_milestone_name TEXT DEFAULT 'Emergency Fund Goal',
  next_milestone_target NUMERIC(10, 2) DEFAULT 15000,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(household_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_targets_config_household ON monthly_targets_config(household_id);

-- ============================================================================
-- HOUSEHOLD ACCESS CONTROL
-- ============================================================================
-- Manages who has access to the household and with what role
CREATE TABLE IF NOT EXISTS household_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  
  -- User identification (email-based)
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Set when user signs up
  
  -- Access level
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Linked to a person in the household (optional)
  linked_person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(household_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_household_access_household ON household_access(household_id);
CREATE INDEX IF NOT EXISTS idx_household_access_email ON household_access(user_email);
CREATE INDEX IF NOT EXISTS idx_household_access_user ON household_access(user_id);

-- ============================================================================
-- ADD ICON COLUMN TO BILLS (for emoji icons)
-- ============================================================================
ALTER TABLE bills ADD COLUMN IF NOT EXISTS icon TEXT;

-- ============================================================================
-- ADD NAME COLUMN TO CHILD EXPENSES (for custom expense names)
-- ============================================================================
ALTER TABLE child_expenses ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE child_expenses ADD COLUMN IF NOT EXISTS icon TEXT;

-- ============================================================================
-- ADD ICON COLUMN TO SINKING FUNDS
-- ============================================================================
ALTER TABLE sinking_funds ADD COLUMN IF NOT EXISTS icon TEXT;

-- ============================================================================
-- ADD STATUS TO TRAVEL PLANS
-- ============================================================================
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'booked', 'completed', 'cancelled'));
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS total_saved NUMERIC(10, 2) DEFAULT 0;

-- ============================================================================
-- ADD IDEAS TO GIFT RECIPIENTS
-- ============================================================================
ALTER TABLE gift_recipients ADD COLUMN IF NOT EXISTS ideas TEXT[]; -- Array of gift ideas

-- ============================================================================
-- ACCOUNT BALANCE TRACKING
-- ============================================================================
-- Track main account balance (not in pockets)
CREATE TABLE IF NOT EXISTS account_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  previous_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  last_synced TIMESTAMPTZ DEFAULT now(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(household_id)
);

CREATE INDEX IF NOT EXISTS idx_account_balance_household ON account_balance(household_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE contribution_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_allowance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balance ENABLE ROW LEVEL SECURITY;

-- Contribution Config Policies
CREATE POLICY "Users can view their household contribution config"
  ON contribution_config FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert their household contribution config"
  ON contribution_config FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their household contribution config"
  ON contribution_config FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can delete their household contribution config"
  ON contribution_config FOR DELETE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- Personal Allowance Config Policies (via person -> household)
CREATE POLICY "Users can view personal allowance config"
  ON personal_allowance_config FOR SELECT
  TO authenticated
  USING (
    person_id IN (
      SELECT id FROM persons 
      WHERE household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid
    )
  );

CREATE POLICY "Users can insert personal allowance config"
  ON personal_allowance_config FOR INSERT
  TO authenticated
  WITH CHECK (
    person_id IN (
      SELECT id FROM persons 
      WHERE household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid
    )
  );

CREATE POLICY "Users can update personal allowance config"
  ON personal_allowance_config FOR UPDATE
  TO authenticated
  USING (
    person_id IN (
      SELECT id FROM persons 
      WHERE household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid
    )
  );

CREATE POLICY "Users can delete personal allowance config"
  ON personal_allowance_config FOR DELETE
  TO authenticated
  USING (
    person_id IN (
      SELECT id FROM persons 
      WHERE household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid
    )
  );

-- Monthly Targets Config Policies
CREATE POLICY "Users can view their household monthly targets"
  ON monthly_targets_config FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert their household monthly targets"
  ON monthly_targets_config FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their household monthly targets"
  ON monthly_targets_config FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- Household Access Policies
CREATE POLICY "Users can view their household access"
  ON household_access FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Admins can insert household access"
  ON household_access FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Admins can update household access"
  ON household_access FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Admins can delete household access"
  ON household_access FOR DELETE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- Account Balance Policies
CREATE POLICY "Users can view their household account balance"
  ON account_balance FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert their household account balance"
  ON account_balance FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their household account balance"
  ON account_balance FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_contribution_config_updated_at
  BEFORE UPDATE ON contribution_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_allowance_config_updated_at
  BEFORE UPDATE ON personal_allowance_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_targets_config_updated_at
  BEFORE UPDATE ON monthly_targets_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_access_updated_at
  BEFORE UPDATE ON household_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_balance_updated_at
  BEFORE UPDATE ON account_balance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION TO LINK USER TO HOUSEHOLD BY EMAIL
-- ============================================================================
-- This function can be called when a user signs up to link them to a household
-- if their email was pre-registered in household_access
CREATE OR REPLACE FUNCTION link_user_to_household()
RETURNS TRIGGER AS $$
BEGIN
  -- Update household_access with the new user's id
  UPDATE household_access
  SET user_id = NEW.id,
      updated_at = now()
  WHERE user_email = NEW.email
    AND user_id IS NULL;
  
  -- If the user was found in household_access, update their metadata
  -- This allows the user to access their household immediately
  IF FOUND THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
      'household_id', (
        SELECT household_id::text 
        FROM household_access 
        WHERE user_email = NEW.email 
        LIMIT 1
      )
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be created on auth.users but requires superuser privileges
-- The application will handle this logic instead
