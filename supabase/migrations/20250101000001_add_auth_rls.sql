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
ALTER TABLE sinking_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- Create a function to get user's household_id from auth metadata
CREATE OR REPLACE FUNCTION auth.user_household_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'household_id')::UUID,
    NULL
  )
$$ LANGUAGE SQL STABLE;

-- Households: Users can only access their own household
CREATE POLICY "Users can view their own household"
  ON households FOR SELECT
  USING (id = auth.user_household_id());

CREATE POLICY "Users can update their own household"
  ON households FOR UPDATE
  USING (id = auth.user_household_id());

CREATE POLICY "Users can insert their own household"
  ON households FOR INSERT
  WITH CHECK (true); -- Allow anyone to create a household during signup

-- Persons: Users can only access persons in their household
CREATE POLICY "Users can view persons in their household"
  ON persons FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert persons in their household"
  ON persons FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update persons in their household"
  ON persons FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete persons in their household"
  ON persons FOR DELETE
  USING (household_id = auth.user_household_id());

-- Income Sources: Access through persons
CREATE POLICY "Users can view income sources in their household"
  ON income_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = income_sources.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert income sources in their household"
  ON income_sources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = income_sources.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update income sources in their household"
  ON income_sources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = income_sources.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can delete income sources in their household"
  ON income_sources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = income_sources.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

-- Pockets: Users can only access pockets in their household
CREATE POLICY "Users can view pockets in their household"
  ON pockets FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert pockets in their household"
  ON pockets FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update pockets in their household"
  ON pockets FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete pockets in their household"
  ON pockets FOR DELETE
  USING (household_id = auth.user_household_id());

-- Transactions: Access through pockets
CREATE POLICY "Users can view transactions in their household"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = transactions.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert transactions in their household"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = transactions.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update transactions in their household"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = transactions.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can delete transactions in their household"
  ON transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = transactions.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

-- Contributions: Access through persons
CREATE POLICY "Users can view contributions in their household"
  ON contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = contributions.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert contributions in their household"
  ON contributions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = contributions.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update contributions in their household"
  ON contributions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = contributions.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

-- Personal Allowances: Access through persons
CREATE POLICY "Users can view personal allowances in their household"
  ON personal_allowances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = personal_allowances.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert personal allowances in their household"
  ON personal_allowances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = personal_allowances.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update personal allowances in their household"
  ON personal_allowances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM persons
      WHERE persons.id = personal_allowances.person_id
      AND persons.household_id = auth.user_household_id()
    )
  );

-- Savings Goals: Access through pockets
CREATE POLICY "Users can view savings goals in their household"
  ON savings_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = savings_goals.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert savings goals in their household"
  ON savings_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = savings_goals.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update savings goals in their household"
  ON savings_goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pockets
      WHERE pockets.id = savings_goals.pocket_id
      AND pockets.household_id = auth.user_household_id()
    )
  );

-- Budget Categories: Direct household access
CREATE POLICY "Users can view budget categories in their household"
  ON budget_categories FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert budget categories in their household"
  ON budget_categories FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update budget categories in their household"
  ON budget_categories FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete budget categories in their household"
  ON budget_categories FOR DELETE
  USING (household_id = auth.user_household_id());

-- Bills, Sinking Funds, Children, Child Expenses, Gift Recipients, Travel Plans: Similar pattern
CREATE POLICY "Users can view bills in their household"
  ON bills FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert bills in their household"
  ON bills FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update bills in their household"
  ON bills FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete bills in their household"
  ON bills FOR DELETE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can view sinking funds in their household"
  ON sinking_funds FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert sinking funds in their household"
  ON sinking_funds FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update sinking funds in their household"
  ON sinking_funds FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete sinking funds in their household"
  ON sinking_funds FOR DELETE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can view children in their household"
  ON children FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert children in their household"
  ON children FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update children in their household"
  ON children FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete children in their household"
  ON children FOR DELETE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can view child expenses in their household"
  ON child_expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_expenses.child_id
      AND children.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can insert child expenses in their household"
  ON child_expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_expenses.child_id
      AND children.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can update child expenses in their household"
  ON child_expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_expenses.child_id
      AND children.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can delete child expenses in their household"
  ON child_expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_expenses.child_id
      AND children.household_id = auth.user_household_id()
    )
  );

CREATE POLICY "Users can view gift recipients in their household"
  ON gift_recipients FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert gift recipients in their household"
  ON gift_recipients FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update gift recipients in their household"
  ON gift_recipients FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete gift recipients in their household"
  ON gift_recipients FOR DELETE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can view travel plans in their household"
  ON travel_plans FOR SELECT
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can insert travel plans in their household"
  ON travel_plans FOR INSERT
  WITH CHECK (household_id = auth.user_household_id());

CREATE POLICY "Users can update travel plans in their household"
  ON travel_plans FOR UPDATE
  USING (household_id = auth.user_household_id());

CREATE POLICY "Users can delete travel plans in their household"
  ON travel_plans FOR DELETE
  USING (household_id = auth.user_household_id());
