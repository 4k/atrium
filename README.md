# Family Budget Dashboard

A modern, responsive family budget tracking dashboard built with Next.js 16, TypeScript, Shadcn/UI, Tailwind CSS, and Supabase.

## Features

### Financial Overview
- **Account Overview**: Track your Revolut shared account balance with month-over-month changes
- **Income Breakdown**: Visualize income contributions from both partners with interactive pie charts
- **Budget Categories**: Monitor spending by category with progress bars and color-coded status indicators
- **Savings Goals**: Track progress towards financial goals with visual progress rings
- **Monthly Targets**: Compare actual performance against income, savings rate, and budget adherence targets
- **3-Month Trends**: View historical data with interactive bar charts

### Family Management
- **Upcoming Bills Calendar**: Never miss a payment with color-coded due date tracking
  - Autopay and recurring bill indicators
  - Overdue, due today, and upcoming alerts
  - Total due amount at a glance

- **Child Expenses Tracker**: Comprehensive tracking for Sofia (age 4)
  - Education, activities, clothing, healthcare, toys, and food categories
  - Budget vs actual with visual progress bars
  - Pie chart expense distribution
  - Monthly budget overview

- **Gift Budget Planner**: Plan ahead for special occasions
  - Track gifts for family and friends
  - Upcoming birthdays, holidays, and events with countdowns
  - Gift ideas for each recipient
  - Separate budgets for family vs friends
  - Budget tracking per occasion

- **Travel Budget Planner**: Save and plan for vacations
  - Multi-trip planning and tracking
  - Savings progress for each trip
  - Expense breakdown (flights, accommodation, food, activities, transport)
  - Trip status (planning, booked, completed)
  - Days until departure countdown
  - Per-category budget tracking

### Design & UX
- **Dark Mode Support**: Fully responsive design with dark mode
- **Euro Formatting**: Currency displayed in German locale (€1.234,56)
- **8 Organized Tabs**: Overview, Bills, Budget, Family, Savings, Gifts, Travel, Targets
- **Interactive Charts**: Pie charts, bar charts, and progress visualizations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/UI
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A Supabase account (free tier works)

### Quick Start

**With Supabase Backend** (Recommended):

1. Follow the [5-minute Quick Start guide](QUICKSTART.md) to set up Supabase
2. Install dependencies: `npm install`
3. Configure environment: `cp .env.local.example .env.local` (add your Supabase credentials)
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

**With Mock Data** (Demo only):

1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

> **Note**: The dashboard is ready for Supabase integration. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for comprehensive setup instructions.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page with 8 tabs
│   └── globals.css         # Global styles with dark mode
├── components/
│   ├── dashboard/          # 17 feature-rich dashboard components
│   │   ├── account-summary.tsx      # Account overview card
│   │   ├── income-breakdown.tsx     # Income by person with pie chart
│   │   ├── budget-tracker.tsx       # Budget categories with progress bars
│   │   ├── savings-goals.tsx        # Savings goals with progress rings
│   │   ├── monthly-targets.tsx      # Targets dashboard with trends
│   │   ├── upcoming-bills.tsx       # Bills calendar with due dates
│   │   ├── child-expenses.tsx       # Child expense tracking
│   │   ├── gift-budget.tsx          # Gift planning and tracking
│   │   ├── travel-budget.tsx        # Travel planning and budgeting
│   │   └── person-badge.tsx         # Reusable person avatar component
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── supabase/          # Supabase backend integration
│   │   ├── client.ts      # Browser client for client components
│   │   ├── server.ts      # Server client for Server Components
│   │   ├── database.types.ts  # Generated TypeScript types
│   │   ├── queries.ts     # Read operations (42 functions)
│   │   └── mutations.ts   # Write operations (35 functions)
│   ├── types.ts           # TypeScript interfaces
│   ├── mock-data.ts       # Sample data (for demo/development)
│   └── utils.ts           # Utility functions
├── supabase/
│   ├── migrations/        # Database schema migrations
│   │   └── 20250101000000_initial_schema.sql
│   └── seed.sql          # Sample data for development
├── QUICKSTART.md         # 5-minute Supabase setup guide
├── SUPABASE_SETUP.md     # Comprehensive setup documentation
├── IMPLEMENTATION_STATUS.md  # Implementation progress tracker
└── package.json
```

## Mock Data

The dashboard currently uses mock data for demonstration purposes. The data includes:

### Income & Expenses
- **Tony's Income**: Vollville salary (€4,200), 4kStudio revenue (€1,800), Imperator founder draw (€500)
- **Tatsiana's Income**: University salary (€3,100), Grant project fees (€600)
- **Shared Expenses**: Rent, utilities, groceries, insurance
- **Personal Expenses**: Tech/gadgets, business expenses, books/research, personal care
- **Savings Goals**: Emergency fund, vacation fund, investment account, personal savings

### Family Data
- **Bills**: 7 recurring bills including rent (€1,200), utilities, insurance, nursery (€450), subscriptions
- **Child (Sofia, 4)**: 7 expense categories totaling €775/month
  - Education: Nursery/Daycare (€450)
  - Activities: Swimming (€60), Music (€45)
  - Other: Clothing, healthcare, toys, food
- **Gifts**: 7 upcoming occasions
  - Family: Parents' birthdays, Sofia's birthday (€200)
  - Friends: Christmas gifts (€300), wedding (€250)
- **Travel**: 2 planned trips
  - Greece/Santorini (€4,500 budget, Aug 2025)
  - Austrian Alps Ski Trip (€2,800 budget, Feb 2025)

## Supabase Backend

This project includes a complete Supabase backend integration:

- **15 Database Tables**: Households, persons, income sources, pockets, transactions, contributions, personal allowances, savings goals, budget categories, bills, children, child expenses, sinking funds, gift recipients, travel plans
- **42 Query Functions**: Type-safe read operations for all data
- **35 Mutation Functions**: Create, update, and delete operations
- **Automatic Balance Updates**: Database triggers keep pocket balances in sync
- **Row Level Security**: Ready for multi-user authentication
- **Comprehensive Documentation**: See [QUICKSTART.md](QUICKSTART.md) and [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### Implementation Status

- ✅ Backend infrastructure complete (Supabase client, schema, queries, mutations)
- ✅ Database schema with 15 tables
- ✅ Seed data with 3 months of sample transactions
- ✅ TypeScript types generated from schema
- 🚧 Frontend components migration (in progress - see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md))

## Roadmap

- [ ] Complete component migration to Supabase (17 components)
- [ ] Add user authentication with Supabase Auth
- [ ] Implement real-time updates with Supabase subscriptions
- [ ] Add transaction history view
- [ ] Add Open Banking integration for Revolut sync
- [ ] Create mobile app version
- [ ] Add export functionality (PDF, CSV)

## Development

### Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```

### Building for Production

```bash
npm run build
npm start
```

## License

MIT

## Authors

Built for Tony & Tatsiana's family budget tracking needs.
