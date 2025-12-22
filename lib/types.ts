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
