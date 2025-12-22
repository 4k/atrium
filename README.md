# Family Budget Dashboard

A modern, responsive family budget tracking dashboard built with Next.js 15, TypeScript, Shadcn/UI, and Tailwind CSS.

## Features

- **Account Overview**: Track your Revolut shared account balance with month-over-month changes
- **Income Breakdown**: Visualize income contributions from both partners with interactive pie charts
- **Budget Categories**: Monitor spending by category with progress bars and color-coded status indicators
- **Savings Goals**: Track progress towards financial goals with visual progress rings
- **Monthly Targets**: Compare actual performance against income, savings rate, and budget adherence targets
- **3-Month Trends**: View historical data with interactive bar charts
- **Dark Mode Support**: Fully responsive design with dark mode
- **Euro Formatting**: Currency displayed in German locale (€1.234,56)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

1. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles with dark mode
├── components/
│   ├── dashboard/
│   │   ├── account-summary.tsx      # Account overview card
│   │   ├── income-breakdown.tsx     # Income by person with pie chart
│   │   ├── budget-tracker.tsx       # Budget categories with progress bars
│   │   ├── savings-goals.tsx        # Savings goals with progress rings
│   │   ├── monthly-targets.tsx      # Targets dashboard with trends
│   │   └── person-badge.tsx         # Reusable person avatar component
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── mock-data.ts        # Sample data (3 months)
│   └── utils.ts            # Utility functions
└── package.json
```

## Mock Data

The dashboard currently uses mock data for demonstration purposes. The data includes:

- **Tony's Income**: Vollville salary (€4,200), 4kStudio revenue (€1,800), Imperator founder draw (€500)
- **Tatsiana's Income**: University salary (€3,100), Grant project fees (€600)
- **Shared Expenses**: Rent, utilities, groceries, insurance
- **Personal Expenses**: Tech/gadgets, business expenses, books/research, personal care
- **Savings Goals**: Emergency fund, vacation fund, investment account, personal savings

## Next Steps

- [ ] Integrate Supabase for real data persistence
- [ ] Add Open Banking integration for Revolut sync
- [ ] Implement user authentication
- [ ] Add transaction history view
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
