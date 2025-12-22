# Supabase Backend Integration Guide

This guide walks you through setting up Supabase as the backend for your Family Budget Dashboard.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Local Development Setup](#local-development-setup)
4. [Database Migration](#database-migration)
5. [Type Generation](#type-generation)
6. [Testing the Integration](#testing-the-integration)
7. [Next Steps](#next-steps)

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Supabase CLI installed (optional, for type generation)

### Install Supabase CLI (Optional)

```bash
npm install -g supabase
```

Or use npx for one-time commands:
```bash
npx supabase [command]
```

---

## Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Family Budget Dashboard (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be ready

### Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click the **Settings** icon (gear)
2. Go to **Project Settings > API**
3. You'll need two values:
   - **Project URL** (looks like `https://abcdefghij.supabase.co`)
   - **anon/public key** (under "Project API keys")
4. Keep these handy for the next step

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR helpers for Next.js

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_PROJECT_ID=your-project-ref
   ```

3. Save the file

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Database Migration

### Step 3: Run the Schema Migration

You have two options to set up your database schema:

#### Option A: Using Supabase Dashboard (Recommended for first-time users)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/20250101000000_initial_schema.sql` in your code editor
5. Copy the entire contents
6. Paste into the Supabase SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for the success message

#### Option B: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd /path/to/atrium

# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push the migration
npx supabase db push
```

### Step 4: Verify the Schema

1. In Supabase dashboard, go to **Table Editor**
2. You should see 15 tables:
   - `households`
   - `persons`
   - `income_sources`
   - `pockets`
   - `transactions`
   - `contributions`
   - `personal_allowances`
   - `savings_goals`
   - `budget_categories`
   - `bills`
   - `children`
   - `child_expenses`
   - `sinking_funds`
   - `gift_recipients`
   - `travel_plans`

### Step 5: Seed Sample Data

1. In **SQL Editor**, create a new query
2. Open `supabase/seed.sql` in your code editor
3. Copy and paste the contents
4. Click **Run**
5. You should see a success message

**Verify the data**:
- Go to **Table Editor** > `households` - should have 1 row
- Check `persons` - should have 2 rows (Tony & Tatsiana)
- Check `pockets` - should have 6 rows
- Check `transactions` - should have multiple rows

---

## Type Generation

Generate TypeScript types from your Supabase schema:

### Option 1: Using npm script (Recommended)

```bash
# Make sure SUPABASE_PROJECT_ID is set in .env.local
npm run types:generate
```

### Option 2: Manual command

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > lib/supabase/database.types.ts
```

**Note**: The types file `lib/supabase/database.types.ts` already exists with manually created types. Regenerating will overwrite it with auto-generated types from your actual schema.

---

## Testing the Integration

### Step 1: Test the Supabase Client

Create a test file to verify the connection:

```typescript
// test-supabase.ts
import { createClient } from './lib/supabase/server'
import { getFirstHousehold, getPersons } from './lib/supabase/queries'

async function testConnection() {
  try {
    const household = await getFirstHousehold()
    console.log('Household:', household)

    const persons = await getPersons(household.id)
    console.log('Persons:', persons)

    console.log('✅ Supabase connection successful!')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
  }
}

testConnection()
```

Run with:
```bash
npx tsx test-supabase.ts
```

### Step 2: Update Components to Use Supabase

The existing components currently use mock data from `lib/mock-data.ts`. To use Supabase:

#### Example: Update a component

**Before (using mock data):**
```typescript
import { people, getTotalIncome } from '@/lib/mock-data'

export default function IncomeBreakdown() {
  const totalIncome = getTotalIncome()
  // ...
}
```

**After (using Supabase):**
```typescript
import { getFirstHousehold, getTotalIncome } from '@/lib/supabase/queries'

export default async function IncomeBreakdown() {
  const household = await getFirstHousehold()
  const totalIncome = await getTotalIncome(household.id)
  // ...
}
```

**Key Changes:**
1. Components become async Server Components
2. Import from `@/lib/supabase/queries` instead of `@/lib/mock-data`
3. Most query functions now require `householdId` parameter
4. Handle loading states with React Suspense

#### Example: Add Suspense Boundaries

```typescript
// app/page.tsx
import { Suspense } from 'react'
import IncomeBreakdown from '@/components/dashboard/income-breakdown'

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading income...</div>}>
        <IncomeBreakdown />
      </Suspense>
    </div>
  )
}
```

---

## Architecture Overview

### File Structure

```
lib/
  supabase/
    ├── client.ts              # Browser client (for client components)
    ├── server.ts              # Server client (for server components)
    ├── database.types.ts      # Generated TypeScript types
    ├── queries.ts             # Read operations
    └── mutations.ts           # Write operations

supabase/
  ├── migrations/
  │   └── 20250101000000_initial_schema.sql
  └── seed.sql
```

### Client Usage Patterns

#### Server Components (Recommended)
```typescript
import { createClient } from '@/lib/supabase/server'
import { getPersons } from '@/lib/supabase/queries'

export default async function MyComponent() {
  const household = await getFirstHousehold()
  const persons = await getPersons(household.id)

  return <div>{/* render persons */}</div>
}
```

#### Client Components
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyClientComponent() {
  const [persons, setPersons] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchPersons() {
      const { data } = await supabase
        .from('persons')
        .select('*')
      setPersons(data)
    }
    fetchPersons()
  }, [])

  return <div>{/* render persons */}</div>
}
```

### Query Functions Available

See `lib/supabase/queries.ts` for all available query functions:

- **Households**: `getHousehold()`, `getFirstHousehold()`
- **Persons**: `getPersons()`, `getPerson()`
- **Income**: `getIncomeSources()`, `getTotalIncomeByPerson()`
- **Pockets**: `getPockets()`, `getPocketById()`, `getTotalPocketBalance()`
- **Transactions**: `getTransactions()`, `getRecentTransactions()`
- **Contributions**: `getContributions()`, `getCurrentMonthContributions()`
- **Allowances**: `getPersonalAllowance()`, `getCurrentMonthAllowances()`
- **Savings**: `getSavingsGoals()`
- **Budget**: `getBudgetCategories()`, `getCurrentMonthBudget()`
- **Bills**: `getBills()`, `getUpcomingBills()`
- **Children**: `getChildren()`, `getChildExpenses()`
- **Sinking Funds**: `getSinkingFunds()`, `getUpcomingSinkingFunds()`
- **Gifts**: `getGiftRecipients()`, `getNextGiftOccasions()`
- **Travel**: `getTravelPlans()`, `getUpcomingTravelPlans()`

### Mutation Functions Available

See `lib/supabase/mutations.ts` for all available mutation functions:

- **Create**: `createTransaction()`, `createPocket()`, `createSavingsGoal()`, etc.
- **Update**: `updatePocketBalance()`, `updateBudgetCategorySpent()`, etc.
- **Transfers**: `transferBetweenPockets()`
- **Records**: `recordContribution()`, `initializePersonalAllowance()`

---

## Row Level Security (RLS)

The current RLS policies are **permissive** (allow all authenticated users). This is for prototype purposes.

### Current Policy
```sql
CREATE POLICY "Allow all for authenticated users" ON [table_name]
  FOR ALL USING (auth.role() = 'authenticated');
```

### Future: Household-Based Security

For production, implement household-based RLS:

```sql
-- Example: Restrict access to household members only
CREATE POLICY "Users can only access their household data" ON persons
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM user_households
      WHERE user_id = auth.uid()
    )
  );
```

You'll need to:
1. Create a `user_households` junction table
2. Link Supabase Auth users to households
3. Update all policies to check household membership

---

## Next Steps

### 1. Migrate Remaining Components

Components still using mock data:
- [ ] `components/dashboard/account-summary.tsx`
- [ ] `components/dashboard/budget-tracker.tsx`
- [ ] `components/dashboard/contribution-tracker.tsx`
- [ ] `components/dashboard/couple-scorecard.tsx`
- [ ] `components/dashboard/child-expenses.tsx`
- [ ] `components/dashboard/gift-budget.tsx`
- [ ] `components/dashboard/income-breakdown.tsx`
- [ ] `components/dashboard/money-flow-diagram.tsx`
- [ ] `components/dashboard/monthly-targets.tsx`
- [ ] `components/dashboard/personal-allowance.tsx`
- [ ] `components/dashboard/pocket-card.tsx`
- [ ] `components/dashboard/pocket-transfers.tsx`
- [ ] `components/dashboard/pockets-overview.tsx`
- [ ] `components/dashboard/savings-goals.tsx`
- [ ] `components/dashboard/sinking-funds-calendar.tsx`
- [ ] `components/dashboard/travel-budget.tsx`
- [ ] `components/dashboard/upcoming-bills.tsx`

### 2. Add Real-Time Subscriptions

Enable real-time updates for live data:

```typescript
const supabase = createClient()

supabase
  .channel('transactions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    console.log('Transaction changed:', payload)
    // Update UI
  })
  .subscribe()
```

### 3. Add Authentication

Implement Supabase Auth:

```bash
# In Supabase Dashboard > Authentication > Providers
# Enable Email or Social providers
```

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Logout
await supabase.auth.signOut()
```

### 4. Add Data Validation

Use Zod or similar library for runtime validation:

```typescript
import { z } from 'zod'

const TransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  pocket_id: z.string().uuid(),
})
```

### 5. Implement Error Handling

Add global error handling and user feedback:

```typescript
try {
  await createTransaction(...)
} catch (error) {
  // Show toast notification
  toast.error('Failed to create transaction')
  console.error(error)
}
```

### 6. Optimize Performance

- Add database indexes for frequently queried columns
- Use `select()` to only fetch needed columns
- Implement pagination for large lists
- Cache frequently accessed data

### 7. Deploy

Deploy to Vercel or similar platform:

```bash
# Vercel will automatically detect Next.js
vercel

# Add environment variables in Vercel dashboard
```

---

## Troubleshooting

### Issue: "Failed to fetch data from Supabase"

**Solutions:**
1. Check `.env.local` credentials are correct
2. Verify Supabase project is active (not paused)
3. Check RLS policies allow the query
4. View Supabase logs in dashboard > Logs

### Issue: Type errors after generating types

**Solution:**
```bash
# Regenerate types
npm run types:generate

# Restart TypeScript server in your editor
```

### Issue: "relation does not exist" error

**Solution:**
The migration didn't run. Go back to [Database Migration](#database-migration) step.

### Issue: Seed data not appearing

**Solution:**
1. Check if migration ran successfully
2. Verify RLS policies allow viewing data
3. Run seed.sql again in SQL Editor

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 14 + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

For issues or questions:
1. Check Supabase Dashboard > Logs for errors
2. Review this guide's troubleshooting section
3. Consult Supabase documentation
4. Open an issue in the project repository
