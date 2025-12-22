# Supabase Integration - Quick Start

Get your Family Budget Dashboard connected to Supabase in 5 minutes.

## TL;DR

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run the schema migration in Supabase SQL Editor
# Copy content from: supabase/migrations/20250101000000_initial_schema.sql

# 4. Run the seed data in Supabase SQL Editor
# Copy content from: supabase/seed.sql

# 5. Start development server
npm run dev
```

## Step-by-Step

### 1. Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in name and password
4. Wait for project to be ready

### 2. Get Credentials (1 min)

1. Settings → Project Settings → API
2. Copy **Project URL**
3. Copy **anon public key**

### 3. Configure Environment (30 sec)

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_PROJECT_ID=<your-project-ref>
```

### 4. Run Migrations (1 min)

In Supabase Dashboard:
1. SQL Editor → New Query
2. Copy content from `supabase/migrations/20250101000000_initial_schema.sql`
3. Paste and Run

### 5. Seed Data (30 sec)

In Supabase Dashboard:
1. SQL Editor → New Query
2. Copy content from `supabase/seed.sql`
3. Paste and Run

### 6. Install & Run (30 sec)

```bash
npm install
npm run dev
```

## Verify It Works

1. Go to Supabase Dashboard → Table Editor
2. Check that 15 tables exist
3. Open `persons` table → should see Tony & Tatsiana
4. Open `pockets` table → should see 6 pockets

## What You Got

### Database Tables (15)
- ✅ Households, Persons, Income Sources
- ✅ Pockets, Transactions, Contributions
- ✅ Personal Allowances, Savings Goals
- ✅ Budget Categories, Bills, Children
- ✅ Child Expenses, Sinking Funds
- ✅ Gift Recipients, Travel Plans

### Sample Data
- 1 Household (Tony & Tatsiana's Family)
- 2 Persons (Tony, Tatsiana)
- 4 Income Sources
- 6 Pockets (Bills, Groceries, Emergency, etc.)
- 16 Transactions (last 3 months)
- 6 Contributions records
- 10 Budget Categories
- 7 Bills
- 1 Child (Sofia) with 7 expense categories
- 6 Sinking Funds
- 7 Gift Recipients
- 2 Travel Plans

### Ready-to-Use Functions

**Query Functions** (`lib/supabase/queries.ts`):
```typescript
import { getFirstHousehold, getPersons, getPockets } from '@/lib/supabase/queries'

const household = await getFirstHousehold()
const persons = await getPersons(household.id)
const pockets = await getPockets(household.id)
```

**Mutation Functions** (`lib/supabase/mutations.ts`):
```typescript
import { createTransaction, updatePocketBalance } from '@/lib/supabase/mutations'

await createTransaction(pocketId, personId, -50, 'Groceries')
await updatePocketBalance(pocketId, newBalance)
```

## Next Steps

### Option 1: Test the Connection
```typescript
// Create test-supabase.ts
import { getFirstHousehold, getPersons } from './lib/supabase/queries'

async function test() {
  const household = await getFirstHousehold()
  console.log('Household:', household)

  const persons = await getPersons(household.id)
  console.log('Persons:', persons)
}

test()
```

Run: `npx tsx test-supabase.ts`

### Option 2: Update a Component

**Before:**
```typescript
import { people } from '@/lib/mock-data'

export default function MyComponent() {
  return <div>{people.map(...)}</div>
}
```

**After:**
```typescript
import { getFirstHousehold, getPersons } from '@/lib/supabase/queries'

export default async function MyComponent() {
  const household = await getFirstHousehold()
  const persons = await getPersons(household.id)

  return <div>{persons.map(...)}</div>
}
```

### Option 3: Enable Real-time Updates

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function RealtimeComponent() {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        console.log('Change:', payload)
        // Refresh data
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>Real-time updates enabled</div>
}
```

## Need Help?

- 📖 Full Guide: See `SUPABASE_SETUP.md`
- 🐛 Troubleshooting: Check Supabase Dashboard → Logs
- 📚 Docs: [supabase.com/docs](https://supabase.com/docs)

## Common Issues

### "Failed to fetch"
→ Check `.env.local` credentials

### "relation does not exist"
→ Run the schema migration again

### Type errors
→ Run `npm run types:generate`

### No data showing
→ Run the seed script again

---

**You're all set!** 🎉

The database is ready. Now you can start replacing mock data with real Supabase queries.
