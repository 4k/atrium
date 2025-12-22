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
