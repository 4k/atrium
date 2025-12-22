-- Settings Management System Migration
-- This migration adds comprehensive settings management for households and users

-- ============================================================================
-- HOUSEHOLD SETTINGS
-- ============================================================================
-- General household-level configuration
CREATE TABLE household_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- General Settings
  household_name TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  locale TEXT NOT NULL DEFAULT 'de-DE',
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',

  -- Financial Settings
  financial_year_start_month INTEGER NOT NULL DEFAULT 1 CHECK (financial_year_start_month BETWEEN 1 AND 12),
  budget_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (budget_cycle IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),

  -- Budget Thresholds (as percentages)
  budget_threshold_under DECIMAL(5,2) NOT NULL DEFAULT 80.00 CHECK (budget_threshold_under >= 0 AND budget_threshold_under <= 100),
  budget_threshold_near DECIMAL(5,2) NOT NULL DEFAULT 95.00 CHECK (budget_threshold_near >= 0 AND budget_threshold_near <= 100),

  -- Bill Settings
  bill_alert_days_before INTEGER NOT NULL DEFAULT 3 CHECK (bill_alert_days_before >= 0),
  bill_overdue_alert_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Savings Settings
  default_savings_target_percentage DECIMAL(5,2) NOT NULL DEFAULT 20.00 CHECK (default_savings_target_percentage >= 0 AND default_savings_target_percentage <= 100),
  emergency_fund_months INTEGER NOT NULL DEFAULT 6 CHECK (emergency_fund_months >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(household_id)
);

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================
-- Individual user preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- Display Preferences
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  compact_view BOOLEAN NOT NULL DEFAULT false,
  show_budget_percentages BOOLEAN NOT NULL DEFAULT true,
  show_income_breakdown BOOLEAN NOT NULL DEFAULT true,

  -- Dashboard Layout
  default_dashboard_tab TEXT NOT NULL DEFAULT 'overview',

  -- Notification Preferences
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  bill_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  budget_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  savings_goal_alerts_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Number Formatting
  decimal_places INTEGER NOT NULL DEFAULT 2 CHECK (decimal_places >= 0 AND decimal_places <= 4),
  use_compact_numbers BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, household_id)
);

-- ============================================================================
-- COMPONENT VISIBILITY SETTINGS
-- ============================================================================
-- Control which dashboard components are visible
CREATE TABLE component_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  -- Component visibility flags
  show_account_summary BOOLEAN NOT NULL DEFAULT true,
  show_income_breakdown BOOLEAN NOT NULL DEFAULT true,
  show_budget_tracker BOOLEAN NOT NULL DEFAULT true,
  show_savings_goals BOOLEAN NOT NULL DEFAULT true,
  show_monthly_targets BOOLEAN NOT NULL DEFAULT true,
  show_upcoming_bills BOOLEAN NOT NULL DEFAULT true,
  show_child_expenses BOOLEAN NOT NULL DEFAULT true,
  show_gift_budget BOOLEAN NOT NULL DEFAULT true,
  show_travel_budget BOOLEAN NOT NULL DEFAULT true,
  show_pockets_overview BOOLEAN NOT NULL DEFAULT true,
  show_contribution_tracker BOOLEAN NOT NULL DEFAULT true,
  show_personal_allowance BOOLEAN NOT NULL DEFAULT true,
  show_sinking_funds BOOLEAN NOT NULL DEFAULT true,
  show_couple_scorecard BOOLEAN NOT NULL DEFAULT true,
  show_money_flow BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, household_id)
);

-- ============================================================================
-- CUSTOM CATEGORIES
-- ============================================================================
-- Allow households to define custom categories for various entities
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  category_type TEXT NOT NULL CHECK (category_type IN ('pocket', 'budget', 'child_expense', 'bill', 'gift_occasion', 'travel_expense', 'sinking_fund')),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(household_id, category_type, name)
);

-- ============================================================================
-- ALERT CONFIGURATIONS
-- ============================================================================
-- Configurable alert thresholds and rules
CREATE TABLE alert_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,

  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_warning', 'budget_exceeded', 'bill_due', 'bill_overdue', 'low_balance', 'savings_milestone', 'contribution_missed')),
  enabled BOOLEAN NOT NULL DEFAULT true,

  -- Threshold configuration (JSON for flexibility)
  threshold_config JSONB NOT NULL DEFAULT '{}',

  -- Notification channels
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_in_app BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(household_id, alert_type)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_household_settings_household ON household_settings(household_id);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_household ON user_preferences(household_id);
CREATE INDEX idx_component_visibility_user ON component_visibility(user_id);
CREATE INDEX idx_component_visibility_household ON component_visibility(household_id);
CREATE INDEX idx_custom_categories_household ON custom_categories(household_id);
CREATE INDEX idx_custom_categories_type ON custom_categories(household_id, category_type);
CREATE INDEX idx_alert_configurations_household ON alert_configurations(household_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE household_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configurations ENABLE ROW LEVEL SECURITY;

-- Household Settings Policies
CREATE POLICY "Users can view their household settings"
  ON household_settings FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert their household settings"
  ON household_settings FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their household settings"
  ON household_settings FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Component Visibility Policies
CREATE POLICY "Users can view their own component visibility"
  ON component_visibility FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own component visibility"
  ON component_visibility FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update their own component visibility"
  ON component_visibility FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Custom Categories Policies
CREATE POLICY "Users can view their household categories"
  ON custom_categories FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert household categories"
  ON custom_categories FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update household categories"
  ON custom_categories FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can delete household categories"
  ON custom_categories FOR DELETE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- Alert Configurations Policies
CREATE POLICY "Users can view their household alerts"
  ON alert_configurations FOR SELECT
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can insert household alerts"
  ON alert_configurations FOR INSERT
  TO authenticated
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

CREATE POLICY "Users can update household alerts"
  ON alert_configurations FOR UPDATE
  TO authenticated
  USING (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid)
  WITH CHECK (household_id = (auth.jwt() -> 'user_metadata' ->> 'household_id')::uuid);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_household_settings_updated_at
  BEFORE UPDATE ON household_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_visibility_updated_at
  BEFORE UPDATE ON component_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_configurations_updated_at
  BEFORE UPDATE ON alert_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================
-- Insert default custom categories (these will be used as templates)
-- Pocket types
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'pocket',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Bills', 'receipt-text', '#ef4444', 1),
  ('Spending', 'shopping-cart', '#f59e0b', 2),
  ('Savings', 'piggy-bank', '#10b981', 3),
  ('Sinking Fund', 'calendar', '#3b82f6', 4),
  ('Personal', 'user', '#8b5cf6', 5),
  ('Groceries', 'shopping-basket', '#ec4899', 6),
  ('Emergency', 'alert-triangle', '#ef4444', 7),
  ('Vacation', 'plane', '#14b8a6', 8),
  ('Investment', 'trending-up', '#6366f1', 9),
  ('Home', 'home', '#f97316', 10)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;

-- Child expense categories
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'child_expense',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Education', 'graduation-cap', '#3b82f6', 1),
  ('Activities', 'activity', '#10b981', 2),
  ('Clothing', 'shirt', '#f59e0b', 3),
  ('Healthcare', 'heart-pulse', '#ef4444', 4),
  ('Toys', 'puzzle', '#ec4899', 5),
  ('Food', 'utensils', '#14b8a6', 6),
  ('Other', 'more-horizontal', '#6b7280', 7)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;

-- Bill categories
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'bill',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Utilities', 'zap', '#f59e0b', 1),
  ('Subscriptions', 'repeat', '#8b5cf6', 2),
  ('Insurance', 'shield', '#3b82f6', 3),
  ('Rent/Mortgage', 'home', '#ef4444', 4),
  ('Internet', 'wifi', '#14b8a6', 5),
  ('Phone', 'phone', '#10b981', 6),
  ('Other', 'file-text', '#6b7280', 7)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;

-- Sinking fund categories
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'sinking_fund',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Insurance', 'shield', '#3b82f6', 1),
  ('Medical', 'heart-pulse', '#ef4444', 2),
  ('Car', 'car', '#f59e0b', 3),
  ('Home', 'home', '#10b981', 4),
  ('Holiday', 'palm-tree', '#14b8a6', 5),
  ('Education', 'graduation-cap', '#8b5cf6', 6),
  ('Other', 'piggy-bank', '#6b7280', 7)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;

-- Travel expense categories
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'travel_expense',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Flights', 'plane', '#3b82f6', 1),
  ('Accommodation', 'bed', '#f59e0b', 2),
  ('Food', 'utensils', '#10b981', 3),
  ('Activities', 'ticket', '#ec4899', 4),
  ('Transport', 'car', '#14b8a6', 5),
  ('Other', 'shopping-bag', '#6b7280', 6)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;

-- Gift occasions
INSERT INTO custom_categories (household_id, category_type, name, icon, color, is_default, sort_order)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  'gift_occasion',
  name,
  icon,
  color,
  true,
  sort_order
FROM (VALUES
  ('Birthday', 'cake', '#ec4899', 1),
  ('Christmas', 'gift', '#ef4444', 2),
  ('Anniversary', 'heart', '#f43f5e', 3),
  ('Wedding', 'rings', '#8b5cf6', 4),
  ('Graduation', 'graduation-cap', '#3b82f6', 5),
  ('Housewarming', 'home', '#10b981', 6),
  ('Other', 'gift', '#6b7280', 7)
) AS t(name, icon, color, sort_order)
ON CONFLICT DO NOTHING;
