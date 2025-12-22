-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS child_expenses CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS gift_recipients CASCADE;
DROP TABLE IF EXISTS travel_plans CASCADE;
DROP TABLE IF EXISTS sinking_funds CASCADE;
DROP TABLE IF EXISTS budget_categories CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS personal_allowances CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS pockets CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS income_sources CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- Drop functions too
DROP FUNCTION IF EXISTS update_pocket_balance CASCADE;
DROP FUNCTION IF EXISTS sync_savings_goal_amount CASCADE;