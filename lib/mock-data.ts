import {
  Person,
  IncomeSource,
  BudgetCategory,
  SavingsGoal,
  Transaction,
  MonthlyData,
  AccountBalance,
  MonthlyTargets,
} from './types';

export const people: Person[] = [
  {
    id: 'tony',
    name: 'Tony',
    avatar: 'T',
    color: 'bg-blue-500',
  },
  {
    id: 'tatsiana',
    name: 'Tatsiana',
    avatar: 'Ta',
    color: 'bg-purple-500',
  },
];

export const incomeSources: IncomeSource[] = [
  {
    id: 'tony-vollville',
    personId: 'tony',
    name: 'Vollville Salary',
    amount: 4200,
    frequency: 'monthly',
    monthlyEquivalent: 4200,
  },
  {
    id: 'tony-4kstudio',
    personId: 'tony',
    name: '4kStudio Revenue',
    amount: 1800,
    frequency: 'monthly',
    monthlyEquivalent: 1800,
  },
  {
    id: 'tony-imperator',
    personId: 'tony',
    name: 'Imperator Founder Draw',
    amount: 500,
    frequency: 'monthly',
    monthlyEquivalent: 500,
  },
  {
    id: 'tatsiana-university',
    personId: 'tatsiana',
    name: 'University Salary',
    amount: 3100,
    frequency: 'monthly',
    monthlyEquivalent: 3100,
  },
  {
    id: 'tatsiana-grant',
    personId: 'tatsiana',
    name: 'Grant Project Fees',
    amount: 600,
    frequency: 'monthly',
    monthlyEquivalent: 600,
  },
];

export const budgetCategories: BudgetCategory[] = [
  {
    id: 'rent',
    name: 'Rent',
    budgeted: 1200,
    spent: 1200,
    personId: 'shared',
    icon: '🏠',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    budgeted: 180,
    spent: 165,
    personId: 'shared',
    icon: '⚡',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    budgeted: 450,
    spent: 428,
    personId: 'shared',
    icon: '🛒',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    budgeted: 320,
    spent: 320,
    personId: 'shared',
    icon: '🛡️',
  },
  {
    id: 'tony-tech',
    name: 'Tech & Gadgets',
    budgeted: 200,
    spent: 245,
    personId: 'tony',
    icon: '💻',
  },
  {
    id: 'tony-business',
    name: 'Business Expenses',
    budgeted: 150,
    spent: 132,
    personId: 'tony',
    icon: '💼',
  },
  {
    id: 'tatsiana-books',
    name: 'Books & Research',
    budgeted: 80,
    spent: 67,
    personId: 'tatsiana',
    icon: '📚',
  },
  {
    id: 'tatsiana-personal',
    name: 'Personal Care',
    budgeted: 100,
    spent: 89,
    personId: 'tatsiana',
    icon: '💅',
  },
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    targetAmount: 15000,
    currentAmount: 9200,
    personId: 'shared',
    deadline: '2026-12-31',
  },
  {
    id: 'vacation',
    name: 'Vacation Fund',
    targetAmount: 3000,
    currentAmount: 1450,
    personId: 'shared',
    deadline: '2025-08-01',
  },
  {
    id: 'investment',
    name: 'Investment Account',
    targetAmount: 500,
    currentAmount: 500,
    personId: 'shared',
    monthlyTarget: 500,
  },
  {
    id: 'tony-savings',
    name: "Tony's Personal Savings",
    targetAmount: 400,
    currentAmount: 400,
    personId: 'tony',
    monthlyTarget: 400,
  },
  {
    id: 'tatsiana-savings',
    name: "Tatsiana's Personal Savings",
    targetAmount: 350,
    currentAmount: 350,
    personId: 'tatsiana',
    monthlyTarget: 350,
  },
];

export const monthlyHistory: MonthlyData[] = [
  {
    month: 'October 2024',
    income: 10200,
    expenses: 2580,
    savings: 1650,
    tonyIncome: 6500,
    tatsianaIncome: 3700,
  },
  {
    month: 'November 2024',
    income: 10200,
    expenses: 2720,
    savings: 1650,
    tonyIncome: 6500,
    tatsianaIncome: 3700,
  },
  {
    month: 'December 2024',
    income: 10200,
    expenses: 2646,
    savings: 1650,
    tonyIncome: 6500,
    tatsianaIncome: 3700,
  },
];

export const accountBalance: AccountBalance = {
  current: 8450.32,
  previous: 7832.18,
  lastSynced: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
};

export const monthlyTargets: MonthlyTargets = {
  incomeTarget: 10200,
  savingsRateTarget: 25,
  budgetAdherenceScore: 92,
  nextMilestone: {
    name: 'Emergency Fund Goal',
    distance: 800,
  },
};

export const transactions: Transaction[] = [
  {
    id: 't1',
    date: '2024-12-01',
    amount: 1200,
    categoryId: 'rent',
    personId: 'shared',
    description: 'Monthly rent payment',
    type: 'expense',
  },
  {
    id: 't2',
    date: '2024-12-05',
    amount: 4200,
    categoryId: 'tony-vollville',
    personId: 'tony',
    description: 'Vollville salary',
    type: 'income',
  },
  {
    id: 't3',
    date: '2024-12-05',
    amount: 3100,
    categoryId: 'tatsiana-university',
    personId: 'tatsiana',
    description: 'University salary',
    type: 'income',
  },
  {
    id: 't4',
    date: '2024-12-08',
    amount: 85,
    categoryId: 'groceries',
    personId: 'shared',
    description: 'Weekly groceries',
    type: 'expense',
  },
  {
    id: 't5',
    date: '2024-12-10',
    amount: 1800,
    categoryId: 'tony-4kstudio',
    personId: 'tony',
    description: '4kStudio monthly revenue',
    type: 'income',
  },
];

export const getTotalIncome = (): number => {
  return incomeSources.reduce((sum, source) => sum + source.monthlyEquivalent, 0);
};

export const getTotalExpenses = (): number => {
  return budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
};

export const getTotalBudgeted = (): number => {
  return budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
};

export const getPersonIncome = (personId: string): number => {
  return incomeSources
    .filter((source) => source.personId === personId)
    .reduce((sum, source) => sum + source.monthlyEquivalent, 0);
};

export const getPersonExpenses = (personId: string): number => {
  return budgetCategories
    .filter((cat) => cat.personId === personId)
    .reduce((sum, cat) => sum + cat.spent, 0);
};

export const getSharedExpenses = (): number => {
  return budgetCategories
    .filter((cat) => cat.personId === 'shared')
    .reduce((sum, cat) => sum + cat.spent, 0);
};
