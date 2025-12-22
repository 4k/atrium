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
