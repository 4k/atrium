import { AccountSummary } from '@/components/dashboard/account-summary';
import { IncomeBreakdown } from '@/components/dashboard/income-breakdown';
import { BudgetTracker } from '@/components/dashboard/budget-tracker';
import { SavingsGoals } from '@/components/dashboard/savings-goals';
import { MonthlyTargets } from '@/components/dashboard/monthly-targets';
import { UpcomingBills } from '@/components/dashboard/upcoming-bills';
import { ChildExpenses } from '@/components/dashboard/child-expenses';
import { GiftBudget } from '@/components/dashboard/gift-budget';
import { TravelBudget } from '@/components/dashboard/travel-budget';
import { PocketsOverview } from '@/components/dashboard/pockets-overview';
import { ContributionTracker } from '@/components/dashboard/contribution-tracker';
import { PersonalAllowance } from '@/components/dashboard/personal-allowance';
import { SinkingFundsCalendar } from '@/components/dashboard/sinking-funds-calendar';
import { MoneyFlowDiagram } from '@/components/dashboard/money-flow-diagram';
import { CoupleScorecard } from '@/components/dashboard/couple-scorecard';
import { PocketTransfers } from '@/components/dashboard/pocket-transfers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              Family Budget Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Tony & Tatsiana's Financial Overview
          </p>
        </div>

        <div className="space-y-6">
          {/* Couple Scorecard - Always visible at the top */}
          <CoupleScorecard />
          
          <AccountSummary />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 lg:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pockets">Pockets</TabsTrigger>
              <TabsTrigger value="couple">Couple</TabsTrigger>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
              <TabsTrigger value="gifts">Gifts</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
              <TabsTrigger value="targets">Targets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <IncomeBreakdown />
              <MoneyFlowDiagram />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingBills />
                <ChildExpenses />
              </div>
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="pockets" className="space-y-6">
              <PocketsOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PocketTransfers />
                <SinkingFundsCalendar />
              </div>
            </TabsContent>

            <TabsContent value="couple" className="space-y-6">
              <ContributionTracker />
              <PersonalAllowance />
            </TabsContent>

            <TabsContent value="bills" className="space-y-6">
              <UpcomingBills />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="family" className="space-y-6">
              <ChildExpenses />
            </TabsContent>

            <TabsContent value="savings" className="space-y-6">
              <SavingsGoals />
              <SinkingFundsCalendar />
            </TabsContent>

            <TabsContent value="gifts" className="space-y-6">
              <GiftBudget />
            </TabsContent>

            <TabsContent value="travel" className="space-y-6">
              <TravelBudget />
            </TabsContent>

            <TabsContent value="targets" className="space-y-6">
              <MonthlyTargets />
            </TabsContent>
          </Tabs>
        </div>

        <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
          <p>Mock data only • Supabase integration coming soon</p>
        </footer>
      </div>
    </main>
  );
}
