import {
  Person,
  IncomeSource,
  BudgetCategory,
  SavingsGoal,
  Transaction,
  MonthlyData,
  AccountBalance,
  MonthlyTargets,
  Bill,
  Child,
  ChildExpense,
  GiftRecipient,
  TravelPlan,
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

// Bills
export const bills: Bill[] = [
  {
    id: 'bill-rent',
    name: 'Rent',
    amount: 1200,
    dueDate: '2025-01-01',
    category: 'Housing',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: false,
    icon: '🏠',
  },
  {
    id: 'bill-electricity',
    name: 'Electricity',
    amount: 85,
    dueDate: '2025-01-05',
    category: 'Utilities',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: true,
    icon: '⚡',
  },
  {
    id: 'bill-internet',
    name: 'Internet & Phone',
    amount: 65,
    dueDate: '2025-01-10',
    category: 'Utilities',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: true,
    icon: '📡',
  },
  {
    id: 'bill-insurance',
    name: 'Family Insurance',
    amount: 320,
    dueDate: '2025-01-15',
    category: 'Insurance',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: true,
    icon: '🛡️',
  },
  {
    id: 'bill-water',
    name: 'Water',
    amount: 30,
    dueDate: '2025-01-20',
    category: 'Utilities',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: false,
    icon: '💧',
  },
  {
    id: 'bill-nursery',
    name: 'Nursery/Daycare',
    amount: 450,
    dueDate: '2024-12-28',
    category: 'Childcare',
    isPaid: true,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: false,
    icon: '👶',
  },
  {
    id: 'bill-spotify',
    name: 'Spotify Family',
    amount: 16,
    dueDate: '2025-01-12',
    category: 'Subscriptions',
    isPaid: false,
    isRecurring: true,
    recurringFrequency: 'monthly',
    autopay: true,
    icon: '🎵',
  },
];

// Children
export const children: Child[] = [
  {
    id: 'child-1',
    name: 'Sofia',
    age: 4,
    avatar: 'S',
    color: 'bg-pink-500',
  },
];

// Child Expenses
export const childExpenses: ChildExpense[] = [
  {
    id: 'ce-1',
    childId: 'child-1',
    category: 'education',
    name: 'Nursery/Daycare',
    amount: 450,
    budgeted: 450,
    icon: '🏫',
  },
  {
    id: 'ce-2',
    childId: 'child-1',
    category: 'activities',
    name: 'Swimming Lessons',
    amount: 60,
    budgeted: 80,
    icon: '🏊',
  },
  {
    id: 'ce-3',
    childId: 'child-1',
    category: 'activities',
    name: 'Music Class',
    amount: 45,
    budgeted: 50,
    icon: '🎹',
  },
  {
    id: 'ce-4',
    childId: 'child-1',
    category: 'clothing',
    name: 'Clothes & Shoes',
    amount: 85,
    budgeted: 100,
    icon: '👗',
  },
  {
    id: 'ce-5',
    childId: 'child-1',
    category: 'healthcare',
    name: 'Healthcare & Medications',
    amount: 30,
    budgeted: 50,
    icon: '🏥',
  },
  {
    id: 'ce-6',
    childId: 'child-1',
    category: 'toys',
    name: 'Toys & Books',
    amount: 40,
    budgeted: 50,
    icon: '🧸',
  },
  {
    id: 'ce-7',
    childId: 'child-1',
    category: 'food',
    name: 'Special Food & Snacks',
    amount: 65,
    budgeted: 80,
    icon: '🍎',
  },
];

// Gift Recipients
export const giftRecipients: GiftRecipient[] = [
  {
    id: 'gift-1',
    name: 'Mom (Tony)',
    relationship: 'family',
    occasion: 'Birthday',
    occasionDate: '2025-02-14',
    budgeted: 150,
    spent: 0,
    ideas: ['Spa voucher', 'Jewelry', 'Cooking class'],
  },
  {
    id: 'gift-2',
    name: 'Dad (Tony)',
    relationship: 'family',
    occasion: 'Birthday',
    occasionDate: '2025-04-20',
    budgeted: 120,
    spent: 0,
    ideas: ['Golf accessories', 'Watch', 'Book collection'],
  },
  {
    id: 'gift-3',
    name: 'Mom (Tatsiana)',
    relationship: 'family',
    occasion: 'Birthday',
    occasionDate: '2025-03-08',
    budgeted: 150,
    spent: 0,
    ideas: ['Flowers & chocolates', 'Perfume', 'Handbag'],
  },
  {
    id: 'gift-4',
    name: 'Dad (Tatsiana)',
    relationship: 'family',
    occasion: 'Birthday',
    occasionDate: '2025-06-12',
    budgeted: 120,
    spent: 0,
    ideas: ['Fishing gear', 'Power tools', 'Garden equipment'],
  },
  {
    id: 'gift-5',
    name: 'Sofia',
    relationship: 'family',
    occasion: 'Birthday',
    occasionDate: '2025-05-15',
    budgeted: 200,
    spent: 0,
    ideas: ['Bicycle', 'Dollhouse', 'Art supplies set'],
  },
  {
    id: 'gift-6',
    name: 'Best Friends',
    relationship: 'friend',
    occasion: 'Christmas 2025',
    occasionDate: '2025-12-25',
    budgeted: 300,
    spent: 0,
    ideas: ['Wine & cheese baskets', 'Experience vouchers', 'Photo books'],
  },
  {
    id: 'gift-7',
    name: 'Wedding - Anna & Mark',
    relationship: 'friend',
    occasion: 'Wedding',
    occasionDate: '2025-07-19',
    budgeted: 250,
    spent: 0,
    ideas: ['Kitchen appliances', 'Cash gift', 'Home decor'],
  },
];

// Travel Plans
export const travelPlans: TravelPlan[] = [
  {
    id: 'travel-1',
    destination: 'Greece (Santorini)',
    startDate: '2025-08-10',
    endDate: '2025-08-24',
    totalBudget: 4500,
    saved: 1450,
    expenses: [
      { category: 'flights', budgeted: 1200, spent: 0 },
      { category: 'accommodation', budgeted: 1800, spent: 0 },
      { category: 'food', budgeted: 800, spent: 0 },
      { category: 'activities', budgeted: 500, spent: 0 },
      { category: 'transport', budgeted: 200, spent: 0 },
    ],
    status: 'planning',
  },
  {
    id: 'travel-2',
    destination: 'Ski Trip - Austrian Alps',
    startDate: '2025-02-08',
    endDate: '2025-02-15',
    totalBudget: 2800,
    saved: 2800,
    expenses: [
      { category: 'flights', budgeted: 600, spent: 580 },
      { category: 'accommodation', budgeted: 1200, spent: 1200 },
      { category: 'food', budgeted: 400, spent: 0 },
      { category: 'activities', budgeted: 450, spent: 0 },
      { category: 'transport', budgeted: 150, spent: 120 },
    ],
    status: 'booked',
  },
];

// Helper functions for new data
export const getUpcomingBills = (): Bill[] => {
  return bills
    .filter((bill) => !bill.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

export const getTotalChildExpenses = (childId?: string): number => {
  const expenses = childId
    ? childExpenses.filter((e) => e.childId === childId)
    : childExpenses;
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const getTotalChildBudget = (childId?: string): number => {
  const expenses = childId
    ? childExpenses.filter((e) => e.childId === childId)
    : childExpenses;
  return expenses.reduce((sum, expense) => sum + expense.budgeted, 0);
};

export const getTotalGiftBudget = (): number => {
  return giftRecipients.reduce((sum, recipient) => sum + recipient.budgeted, 0);
};

export const getTotalGiftSpent = (): number => {
  return giftRecipients.reduce((sum, recipient) => sum + recipient.spent, 0);
};

export const getNextGiftOccasions = (limit: number = 3): GiftRecipient[] => {
  return giftRecipients
    .filter((r) => r.spent < r.budgeted)
    .sort((a, b) => new Date(a.occasionDate).getTime() - new Date(b.occasionDate).getTime())
    .slice(0, limit);
};
