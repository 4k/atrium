export interface Person {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export type Frequency = 'monthly' | 'weekly' | 'one-time';

export interface IncomeSource {
  id: string;
  personId: string;
  name: string;
  amount: number;
  frequency: Frequency;
  monthlyEquivalent: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  personId: string | 'shared';
  icon?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  personId: string | 'shared';
  deadline?: string;
  monthlyTarget?: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  categoryId: string;
  personId: string;
  description: string;
  type: 'income' | 'expense';
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  tonyIncome: number;
  tatsianaIncome: number;
}

export interface AccountBalance {
  current: number;
  previous: number;
  lastSynced: string;
}

export interface MonthlyTargets {
  incomeTarget: number;
  savingsRateTarget: number;
  budgetAdherenceScore: number;
  nextMilestone: {
    name: string;
    distance: number;
  };
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  autopay?: boolean;
  icon?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  color: string;
}

export interface ChildExpense {
  id: string;
  childId: string;
  category: 'education' | 'activities' | 'clothing' | 'healthcare' | 'toys' | 'food' | 'other';
  name: string;
  amount: number;
  budgeted: number;
  icon?: string;
}

export interface GiftRecipient {
  id: string;
  name: string;
  relationship: 'family' | 'friend';
  occasion: string;
  occasionDate: string;
  budgeted: number;
  spent: number;
  ideas?: string[];
}

export interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  saved: number;
  expenses: {
    category: 'flights' | 'accommodation' | 'food' | 'activities' | 'transport' | 'other';
    budgeted: number;
    spent: number;
  }[];
  status: 'planning' | 'booked' | 'completed';
}

// Revolut Pockets
export type PocketType = 'bills' | 'groceries' | 'emergency' | 'vacation' | 'investment' | 'sinking';

export interface Pocket {
  id: string;
  name: string;
  type: PocketType;
  icon: string;
  currentBalance: number;
  monthlyAllocation: number;
  spentThisMonth: number;
  targetAmount?: number; // For savings pockets
  targetDate?: string; // For goal-based pockets
  color: string;
}

// Proportional Contribution Tracking
export interface ContributionConfig {
  personId: string;
  expectedPercentage: number; // Based on income ratio
  fixedContribution?: number; // Optional fixed amount override
}

export interface MonthlyContribution {
  month: string;
  personId: string;
  expectedAmount: number;
  actualAmount: number;
  paidDate?: string;
}

// Personal Allowance System
export interface PersonalAllowance {
  personId: string;
  monthlyAmount: number;
  currentMonthSpent: number;
  carryoverFromLastMonth: number; // Negative means borrowed
  lastUpdated: string;
}

// Sinking Funds
export interface SinkingFund {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  frequency: 'annual' | 'quarterly' | 'one-time';
  category: 'insurance' | 'medical' | 'car' | 'home' | 'holiday' | 'education' | 'other';
  monthlyContribution: number;
  isUnderfunded: boolean;
}

// Money Flow for Sankey/Waterfall
export interface MoneyFlowNode {
  id: string;
  name: string;
  type: 'income' | 'split' | 'expense' | 'savings';
  personId?: string;
}

export interface MoneyFlowLink {
  source: string;
  target: string;
  value: number;
}

// Couple Scorecard
export interface CoupleScorecard {
  isOnTrack: boolean;
  onTrackExplanation: string;
  savingsRate: number;
  savingsRateTarget: number;
  daysUntilNextPaycheck: number;
  remainingBudget: number;
  jointAccountRunway: number; // Days of expenses covered
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

// Household Settings
export type BudgetCycle = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface HouseholdSettings {
  id: string;
  household_id: string;

  // General Settings
  household_name?: string;
  currency: string;
  locale: string;
  timezone: string;

  // Financial Settings
  financial_year_start_month: number; // 1-12
  budget_cycle: BudgetCycle;

  // Budget Thresholds
  budget_threshold_under: number; // Default: 80
  budget_threshold_near: number; // Default: 95

  // Bill Settings
  bill_alert_days_before: number; // Default: 3
  bill_overdue_alert_enabled: boolean;

  // Savings Settings
  default_savings_target_percentage: number; // Default: 20
  emergency_fund_months: number; // Default: 6

  created_at: string;
  updated_at: string;
}

// User Preferences
export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  id: string;
  user_id: string;
  household_id: string;

  // Display Preferences
  theme: Theme;
  compact_view: boolean;
  show_budget_percentages: boolean;
  show_income_breakdown: boolean;

  // Dashboard Layout
  default_dashboard_tab: string;

  // Notification Preferences
  email_notifications_enabled: boolean;
  bill_reminders_enabled: boolean;
  budget_alerts_enabled: boolean;
  savings_goal_alerts_enabled: boolean;

  // Number Formatting
  decimal_places: number; // 0-4
  use_compact_numbers: boolean;

  created_at: string;
  updated_at: string;
}

// Component Visibility
export interface ComponentVisibility {
  id: string;
  user_id: string;
  household_id: string;

  show_account_summary: boolean;
  show_income_breakdown: boolean;
  show_budget_tracker: boolean;
  show_savings_goals: boolean;
  show_monthly_targets: boolean;
  show_upcoming_bills: boolean;
  show_child_expenses: boolean;
  show_gift_budget: boolean;
  show_travel_budget: boolean;
  show_pockets_overview: boolean;
  show_contribution_tracker: boolean;
  show_personal_allowance: boolean;
  show_sinking_funds: boolean;
  show_couple_scorecard: boolean;
  show_money_flow: boolean;

  created_at: string;
  updated_at: string;
}

// Custom Categories
export type CategoryType =
  | 'pocket'
  | 'budget'
  | 'child_expense'
  | 'bill'
  | 'gift_occasion'
  | 'travel_expense'
  | 'sinking_fund';

export interface CustomCategory {
  id: string;
  household_id: string;
  category_type: CategoryType;
  name: string;
  icon?: string;
  color?: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

// Alert Configurations
export type AlertType =
  | 'budget_warning'
  | 'budget_exceeded'
  | 'bill_due'
  | 'bill_overdue'
  | 'low_balance'
  | 'savings_milestone'
  | 'contribution_missed';

export interface AlertConfiguration {
  id: string;
  household_id: string;
  alert_type: AlertType;
  enabled: boolean;
  threshold_config: Record<string, any>; // JSON configuration
  notify_email: boolean;
  notify_in_app: boolean;
  created_at: string;
  updated_at: string;
}

// Settings form data types (for UI)
export interface HouseholdSettingsFormData {
  household_name: string;
  currency: string;
  locale: string;
  timezone: string;
  financial_year_start_month: number;
  budget_cycle: BudgetCycle;
  budget_threshold_under: number;
  budget_threshold_near: number;
  bill_alert_days_before: number;
  bill_overdue_alert_enabled: boolean;
  default_savings_target_percentage: number;
  emergency_fund_months: number;
}

export interface UserPreferencesFormData {
  theme: Theme;
  compact_view: boolean;
  show_budget_percentages: boolean;
  show_income_breakdown: boolean;
  default_dashboard_tab: string;
  email_notifications_enabled: boolean;
  bill_reminders_enabled: boolean;
  budget_alerts_enabled: boolean;
  savings_goal_alerts_enabled: boolean;
  decimal_places: number;
  use_compact_numbers: boolean;
}
