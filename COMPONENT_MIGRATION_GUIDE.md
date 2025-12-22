# Component Migration Guide - Supabase Integration

## Progress

**Status: 5/17 components migrated (29% complete)**

### ✅ Completed Migrations
1. `income-breakdown.tsx` - Persons and income sources
2. `savings-goals.tsx` - Savings goals with pocket relationships
3. `upcoming-bills.tsx` - Upcoming unpaid bills
4. `pockets-overview.tsx` - All household pockets
5. `budget-tracker.tsx` - Current month's budget categories

### 🚧 Remaining Components (12)
6. `account-summary.tsx` - Main account balance and totals
7. `contribution-tracker.tsx` - Monthly household contributions
8. `personal-allowance.tsx` - Personal spending allowances
9. `sinking-funds-calendar.tsx` - Sinking funds timeline
10. `child-expenses.tsx` - Child expense categories
11. `gift-budget.tsx` - Gift recipients and occasions
12. `travel-budget.tsx` - Travel plans and budgets
13. `couple-scorecard.tsx` - Financial health scorecard
14. `money-flow-diagram.tsx` - Income/expense flow visualization
15. `monthly-targets.tsx` - Monthly financial targets
16. `pocket-card.tsx` - Individual pocket display
17. `pocket-transfers.tsx` - Pocket-to-pocket transfers

### 📋 Additional Tasks
18. Update main `page.tsx` to pass householdId to components
19. Add Suspense boundaries for loading states
20. Test all migrated components

---

## Migration Pattern

All component migrations follow this consistent pattern:

### 1. Add 'use client' Directive
```typescript
'use client';
```

### 2. Update Imports
```typescript
// Remove mock data imports
- import { data, helpers } from '@/lib/mock-data';

// Add Supabase imports
+ import { useEffect, useState } from 'react';
+ import { createClient } from '@/lib/supabase/client';
+ import type { Database } from '@/lib/supabase/database.types';
```

### 3. Define Types
```typescript
type EntityName = Database['public']['Tables']['table_name']['Row'] & {
  // Add relationships if needed
  related?: Database['public']['Tables']['related_table']['Row'] | null;
};
```

### 4. Add householdId Prop
```typescript
export function ComponentName({ householdId }: { householdId: string }) {
  const [data, setData] = useState<EntityName[]>([]);
  const [loading, setLoading] = useState(true);
```

### 5. Fetch Data with useEffect
```typescript
useEffect(() => {
  async function fetchData() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('table_name')
      .select('*, related:related_table(*)')
      .eq('household_id', householdId)
      .order('created_at');

    if (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      return;
    }

    setData(data || []);
    setLoading(false);
  }

  fetchData();
}, [householdId]);
```

### 6. Add Loading State
```typescript
if (loading) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7. Update Field Names
Convert from camelCase to snake_case:
- `personId` → `person_id`
- `householdId` → `household_id`
- `currentAmount` → `current_amount`
- `targetAmount` → `target_amount`
- `dueDate` → `due_date`
- `isActive` → `is_active`
- etc.

### 8. Update Data References
```typescript
// Before
{mockData.map((item) => ...)}

// After
{data.map((item) => ...)}
```

---

## Specific Component Instructions

### 6. account-summary.tsx

**Mock Data Used:**
- `accountBalance` object
- `getTotalIncome()`, `getTotalExpenses()`

**Supabase Implementation:**
```typescript
// Fetch total income
const { data: incomeSources } = await supabase
  .from('income_sources')
  .select('amount, frequency, person:persons!inner(household_id)')
  .eq('persons.household_id', householdId)
  .eq('is_active', true);

// Calculate total income
const totalIncome = incomeSources.reduce((sum, source) => {
  if (source.frequency === 'monthly') return sum + source.amount;
  if (source.frequency === 'weekly') return sum + (source.amount * 52 / 12);
  return sum;
}, 0);

// Fetch total expenses (from current month's budget)
const now = new Date();
const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

const { data: budget } = await supabase
  .from('budget_categories')
  .select('spent')
  .eq('household_id', householdId)
  .eq('month', monthStr);

const totalExpenses = budget.reduce((sum, cat) => sum + cat.spent, 0);

// Calculate account balance (you may want a separate table for this)
const currentBalance = totalIncome - totalExpenses;
```

### 7. contribution-tracker.tsx

**Mock Data Used:**
- `people`, `contributionConfig`, `monthlyContributions`
- Helper functions for contribution calculations

**Supabase Implementation:**
```typescript
// Fetch persons
const { data: persons } = await supabase
  .from('persons')
  .select('*')
  .eq('household_id', householdId);

// Fetch current month contributions
const now = new Date();
const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

const { data: contributions } = await supabase
  .from('contributions')
  .select('*, person:persons(*)')
  .eq('household_id', householdId)
  .eq('month', monthStr);

// Calculate totals and percentages
const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
```

### 8. personal-allowance.tsx

**Mock Data Used:**
- `personalAllowances`, `people`
- Helper functions

**Supabase Implementation:**
```typescript
const now = new Date();
const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

const { data: allowances } = await supabase
  .from('personal_allowances')
  .select('*, person:persons!inner(*)')
  .eq('persons.household_id', householdId)
  .eq('month', monthStr);
```

### 9. sinking-funds-calendar.tsx

**Mock Data Used:**
- `sinkingFunds`, helper functions

**Supabase Implementation:**
```typescript
const { data: funds } = await supabase
  .from('sinking_funds')
  .select('*')
  .eq('household_id', householdId)
  .order('due_date');

// Calculate progress
const fundsWithProgress = funds.map(fund => ({
  ...fund,
  progress: (fund.current_amount / fund.target_amount) * 100,
  monthsRemaining: calculateMonthsUntil(fund.due_date)
}));
```

### 10. child-expenses.tsx

**Mock Data Used:**
- `children`, `childExpenses`
- Helper functions

**Supabase Implementation:**
```typescript
// Fetch children
const { data: children } = await supabase
  .from('children')
  .select('*')
  .eq('household_id', householdId);

// Fetch current month expenses
const now = new Date();
const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

const { data: expenses } = await supabase
  .from('child_expenses')
  .select('*, child:children!inner(*)')
  .eq('children.household_id', householdId)
  .eq('month', monthStr);
```

### 11. gift-budget.tsx

**Mock Data Used:**
- `giftRecipients`, helper functions

**Supabase Implementation:**
```typescript
const { data: recipients } = await supabase
  .from('gift_recipients')
  .select('*')
  .eq('household_id', householdId)
  .order('occasion_date');

// Calculate upcoming (within next 90 days)
const today = new Date();
const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

const upcoming = recipients.filter(r => {
  const occDate = new Date(r.occasion_date);
  return occDate >= today && occDate <= futureDate;
});
```

### 12. travel-budget.tsx

**Mock Data Used:**
- `travelPlans`

**Supabase Implementation:**
```typescript
const { data: plans } = await supabase
  .from('travel_plans')
  .select('*')
  .eq('household_id', householdId)
  .order('start_date');

// Calculate totals
const plansWithTotals = plans.map(plan => ({
  ...plan,
  totalBudgeted: plan.flights_budgeted + plan.accommodation_budgeted +
                 plan.food_budgeted + plan.activities_budgeted + plan.transport_budgeted,
  totalSpent: plan.flights_spent + plan.accommodation_spent +
              plan.food_spent + plan.activities_spent + plan.transport_spent
}));
```

### 13. couple-scorecard.tsx (Complex)

**Mock Data Used:**
- `getCoupleScorecard()` - complex calculations
- `accountBalance`, `getTotalExpenses()`

**Supabase Implementation:**
This requires multiple queries and calculations:
```typescript
// 1. Get total income
const totalIncome = await getTotalIncome(householdId);

// 2. Get current month expenses
const totalExpenses = await getTotalExpenses(householdId, new Date());

// 3. Get savings rate
const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

// 4. Calculate runway (days until money runs out)
const totalPocketBalance = await getTotalPocketBalance(householdId);
const dailyExpenses = totalExpenses / 30;
const runway = totalPocketBalance / dailyExpenses;

// 5. Days to paycheck (calculate based on current date and month)
const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const daysToPaycheck = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

// 6. Calculate on-track status
const onTrack = savingsRate >= 20 && runway >= 30;
```

### 14. money-flow-diagram.tsx (Complex)

**Mock Data Used:**
- Computed money flow from various sources

**Supabase Implementation:**
```typescript
// Aggregate income by person
const incomeByPerson = await getTotalIncomeByPerson(householdId);

// Aggregate expenses by category
const expensesByCategory = await getCurrentMonthBudget(householdId);

// Build flow nodes and links
const nodes = [
  ...incomeByPerson.map(p => ({ id: p.personId, name: p.name, type: 'income' })),
  { id: 'split', name: 'Household Pool', type: 'split' },
  ...expensesByCategory.map(c => ({ id: c.id, name: c.name, type: 'expense' })),
  { id: 'savings', name: 'Savings', type: 'savings' }
];

const links = [
  ...incomeByPerson.map(p => ({ source: p.personId, target: 'split', value: p.income })),
  ...expensesByCategory.map(c => ({ source: 'split', target: c.id, value: c.spent })),
  { source: 'split', target: 'savings', value: totalIncome - totalExpenses }
];
```

### 15. monthly-targets.tsx

**Mock Data Used:**
- `monthlyTargets` object

**Note:** This may require a new `monthly_targets` table or can be hardcoded targets with actual data from other tables.

**Supabase Implementation:**
```typescript
// Fetch actual values
const totalIncome = await getTotalIncome(householdId);
const totalExpenses = await getTotalExpenses(householdId, new Date());
const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

// Compare against targets (either from DB or hardcoded)
const targets = {
  income: 10000,
  savingsRate: 20,
  budgetAdherence: 95
};

const actual = {
  income: totalIncome,
  savingsRate: savingsRate,
  budgetAdherence: calculateBudgetAdherence(householdId)
};
```

### 16. pocket-card.tsx

**Mock Data Used:**
- `Pocket` type from mock-data

**Supabase Implementation:**
This component already receives a pocket object as prop, so changes are minimal:
```typescript
// Update type
type Pocket = Database['public']['Tables']['pockets']['Row'];

export function PocketCard({ pocket }: { pocket: Pocket }) {
  // Update field names:
  // pocket.currentBalance → pocket.current_balance
  // pocket.monthlyAllocation → pocket.monthly_allocation
  // pocket.spentThisMonth → calculate from transactions
}
```

### 17. pocket-transfers.tsx

**Mock Data Used:**
- `pockets`, `transactions`

**Supabase Implementation:**
```typescript
const { data: pockets } = await supabase
  .from('pockets')
  .select('*')
  .eq('household_id', householdId);

// Fetch recent transfers (transactions between pockets)
const { data: transfers } = await supabase
  .from('transactions')
  .select('*, pocket:pockets(*), person:persons(*)')
  .eq('pockets.household_id', householdId)
  .order('transaction_date', { ascending: false })
  .limit(10);
```

---

## Updating main page.tsx

After migrating all components, update `app/page.tsx`:

```typescript
import { getFirstHousehold } from '@/lib/supabase/queries';

export default async function Home() {
  // Fetch household ID
  const household = await getFirstHousehold();

  return (
    <div>
      {/* Pass householdId to all migrated components */}
      <IncomeBreakdown householdId={household.id} />
      <SavingsGoals householdId={household.id} />
      <UpcomingBills householdId={household.id} />
      {/* ... etc */}
    </div>
  );
}
```

Or create a context provider:

```typescript
// contexts/household-context.tsx
'use client';

import { createContext, useContext } from 'react';

const HouseholdContext = createContext<string | null>(null);

export function HouseholdProvider({
  children,
  householdId
}: {
  children: React.ReactNode;
  householdId: string;
}) {
  return (
    <HouseholdContext.Provider value={householdId}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHouseholdId() {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHouseholdId must be used within HouseholdProvider');
  return context;
}
```

Then in `app/page.tsx`:

```typescript
export default async function Home() {
  const household = await getFirstHousehold();

  return (
    <HouseholdProvider householdId={household.id}>
      <IncomeBreakdown />
      <SavingsGoals />
      {/* Components use useHouseholdId() hook internally */}
    </HouseholdProvider>
  );
}
```

---

## Adding Suspense Boundaries

Wrap async components with Suspense:

```typescript
import { Suspense } from 'react';

export default async function Home() {
  const household = await getFirstHousehold();

  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <IncomeBreakdown householdId={household.id} />
      </Suspense>

      <Suspense fallback={<LoadingSkeleton />}>
        <BudgetTracker householdId={household.id} />
      </Suspense>
    </div>
  );
}
```

---

## Testing Checklist

For each migrated component:

- [ ] Component renders without errors
- [ ] Loading state displays correctly
- [ ] Data fetches successfully from Supabase
- [ ] Empty states display when no data
- [ ] Error handling works (check browser console)
- [ ] UI matches original mock data version
- [ ] Interactive elements work (if any)
- [ ] Responsive design maintained
- [ ] TypeScript types are correct (no `any` types)

---

## Common Issues & Solutions

### Issue: "relation does not exist"
**Solution:** Run the database migration SQL in Supabase dashboard

### Issue: "Cannot read property of undefined"
**Solution:** Check field name changes (camelCase → snake_case)

### Issue: "useEffect runs infinitely"
**Solution:** Ensure `householdId` is in dependency array: `[householdId]`

### Issue: "Data not loading"
**Solution:** Check Supabase RLS policies allow the query

### Issue: "Type errors with database types"
**Solution:** Regenerate types with `npm run types:generate`

---

## Quick Migration Checklist

For each component:

1. [ ] Add `'use client'` directive
2. [ ] Update imports (remove mock-data, add Supabase)
3. [ ] Define TypeScript types from database.types
4. [ ] Add `householdId` prop to component
5. [ ] Add `useState` for data and loading
6. [ ] Implement `useEffect` with Supabase query
7. [ ] Add loading state JSX
8. [ ] Update all field names (camelCase → snake_case)
9. [ ] Test component renders correctly
10. [ ] Commit changes

---

## Estimated Time Remaining

- Simple components (6-11): ~2-3 hours (1-2 fields, straightforward queries)
- Complex components (13-15): ~3-4 hours (multiple queries, calculations)
- Utility components (16-17): ~1-2 hours (minor changes)
- Main page integration: ~1 hour
- Testing and fixes: ~2-3 hours

**Total estimated: 9-13 hours**

---

## Next Steps

1. Continue migrating components 6-17 using the pattern above
2. Update `app/page.tsx` to pass householdId
3. Add Suspense boundaries
4. Test each component thoroughly
5. Update IMPLEMENTATION_STATUS.md with progress
6. Commit and push changes incrementally

Good luck with the remaining migrations! The pattern is established and consistent across all components.
