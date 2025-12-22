-- Family Budget Dashboard - Initial Schema
-- This migration creates all tables for the family budget tracking system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HOUSEHOLDS
-- ============================================================================
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PERSONS
-- ============================================================================
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL CHECK (length(initials) <= 2),
  color TEXT NOT NULL, -- hex color
  avatar TEXT, -- optional emoji or image URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_persons_household ON persons(household_id);

-- ============================================================================
-- INCOME SOURCES
-- ============================================================================
CREATE TABLE income_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'one-time', 'variable')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_income_sources_person ON income_sources(person_id);
CREATE INDEX idx_income_sources_active ON income_sources(is_active) WHERE is_active = true;

-- ============================================================================
-- POCKETS (Revolut-style savings organization)
-- ============================================================================
CREATE TABLE pockets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT, -- emoji
  type TEXT NOT NULL CHECK (type IN ('bills', 'spending', 'savings', 'sinking', 'personal', 'groceries', 'emergency', 'vacation', 'investment', 'home')),
  owner_id UUID REFERENCES persons(id) ON DELETE SET NULL, -- NULL = shared pocket
  current_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  monthly_allocation NUMERIC(10, 2),
  target_amount NUMERIC(10, 2),
  target_date DATE,
  color TEXT, -- hex color for UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pockets_household ON pockets(household_id);
CREATE INDEX idx_pockets_owner ON pockets(owner_id);
CREATE INDEX idx_pockets_type ON pockets(type);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pocket_id UUID NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL, -- positive = inflow, negative = outflow
  description TEXT NOT NULL,
  category TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_pocket ON transactions(pocket_id);
CREATE INDEX idx_transactions_person ON transactions(person_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);

-- ============================================================================
-- CONTRIBUTIONS (Monthly household contributions per person)
-- ============================================================================
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  month DATE NOT NULL, -- first day of month
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(person_id, month)
);

CREATE INDEX idx_contributions_household ON contributions(household_id);
CREATE INDEX idx_contributions_person ON contributions(person_id);
CREATE INDEX idx_contributions_month ON contributions(month DESC);

-- ============================================================================
-- PERSONAL ALLOWANCES (Monthly personal spending budgets)
-- ============================================================================
CREATE TABLE personal_allowances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  monthly_amount NUMERIC(10, 2) NOT NULL CHECK (monthly_amount >= 0),
  current_month_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  rollover_balance NUMERIC(10, 2) NOT NULL DEFAULT 0, -- negative if borrowed
  month DATE NOT NULL, -- first day of month
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(person_id, month)
);

CREATE INDEX idx_personal_allowances_person ON personal_allowances(person_id);
CREATE INDEX idx_personal_allowances_month ON personal_allowances(month DESC);

-- ============================================================================
-- SAVINGS GOALS
-- ============================================================================
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  pocket_id UUID REFERENCES pockets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_savings_goals_household ON savings_goals(household_id);
CREATE INDEX idx_savings_goals_pocket ON savings_goals(pocket_id);

-- ============================================================================
-- BUDGET CATEGORIES
-- ============================================================================
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (budgeted >= 0),
  spent NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (spent >= 0),
  icon TEXT, -- emoji
  color TEXT, -- hex color
  person_id UUID REFERENCES persons(id) ON DELETE SET NULL, -- NULL = shared category
  month DATE NOT NULL, -- first day of month
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budget_categories_household ON budget_categories(household_id);
CREATE INDEX idx_budget_categories_person ON budget_categories(person_id);
CREATE INDEX idx_budget_categories_month ON budget_categories(month DESC);

-- ============================================================================
-- BILLS
-- ============================================================================
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
  is_autopay BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bills_household ON bills(household_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_frequency ON bills(frequency);

-- ============================================================================
-- CHILDREN
-- ============================================================================
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
  avatar TEXT, -- emoji or image URL
  color TEXT, -- hex color
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_children_household ON children(household_id);

-- ============================================================================
-- CHILD EXPENSES
-- ============================================================================
CREATE TABLE child_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('education', 'activities', 'clothing', 'healthcare', 'toys', 'food', 'other')),
  budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (budgeted >= 0),
  spent NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (spent >= 0),
  month DATE NOT NULL, -- first day of month
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_child_expenses_child ON child_expenses(child_id);
CREATE INDEX idx_child_expenses_month ON child_expenses(month DESC);

-- ============================================================================
-- SINKING FUNDS (Irregular annual expenses)
-- ============================================================================
CREATE TABLE sinking_funds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('insurance', 'medical', 'car', 'home', 'holiday', 'education', 'other')),
  target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  due_date DATE NOT NULL,
  monthly_contribution NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sinking_funds_household ON sinking_funds(household_id);
CREATE INDEX idx_sinking_funds_due_date ON sinking_funds(due_date);

-- ============================================================================
-- GIFT RECIPIENTS
-- ============================================================================
CREATE TABLE gift_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('family', 'friend', 'coworker', 'other')),
  occasion TEXT NOT NULL,
  occasion_date DATE NOT NULL,
  budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (budgeted >= 0),
  spent NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (spent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gift_recipients_household ON gift_recipients(household_id);
CREATE INDEX idx_gift_recipients_occasion_date ON gift_recipients(occasion_date);

-- ============================================================================
-- TRAVEL PLANS
-- ============================================================================
CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  flights_budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  flights_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  accommodation_budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  accommodation_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  food_budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  food_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  activities_budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  activities_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transport_budgeted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transport_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_travel_plans_household ON travel_plans(household_id);
CREATE INDEX idx_travel_plans_dates ON travel_plans(start_date, end_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sinking_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- For prototype: Permissive policy for authenticated users
-- TODO: Tighten these policies based on household membership

CREATE POLICY "Allow all for authenticated users" ON households
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON persons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON income_sources
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON pockets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON contributions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON personal_allowances
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON savings_goals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON budget_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON bills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON children
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON child_expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON sinking_funds
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON gift_recipients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON travel_plans
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update pocket balance after transaction
CREATE OR REPLACE FUNCTION update_pocket_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pockets
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.pocket_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE pockets
    SET current_balance = current_balance - OLD.amount + NEW.amount
    WHERE id = NEW.pocket_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pockets
    SET current_balance = current_balance - OLD.amount
    WHERE id = OLD.pocket_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update pocket balances
CREATE TRIGGER trigger_update_pocket_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_pocket_balance();

-- Function to update savings goal current amount from pocket balance
CREATE OR REPLACE FUNCTION sync_savings_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- NEW.id refers to the pocket's id since this trigger fires on the pockets table
  UPDATE savings_goals
  SET current_amount = NEW.current_balance
  WHERE pocket_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync savings goals with pocket balances
CREATE TRIGGER trigger_sync_savings_goal
AFTER UPDATE ON pockets
FOR EACH ROW
WHEN (OLD.current_balance IS DISTINCT FROM NEW.current_balance)
EXECUTE FUNCTION sync_savings_goal_amount();
