import { Suspense } from 'react';
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
import { getUserHousehold } from '@/lib/supabase/auth';
import { UserMenu } from '@/components/user-menu';
import { redirect } from 'next/navigation';

function LoadingCard() {
  return (
    <div className="p-8 rounded-lg border bg-card">
      <div className="flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}

export default async function Home() {
  // Fetch household for authenticated user
  const household = await getUserHousehold();

  // If user doesn't have a household, redirect to setup
  if (!household) {
    redirect('/setup');
  }

  const householdId = household.id;

  return (
    <main className="min-h-screen bg-background">
      {/* Subtle gradient overlay for visual interest */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent/80">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Family Budget Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  {household.name}
                </p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>

        <div className="space-y-6">
          {/* Couple Scorecard - Always visible at the top */}
          <CoupleScorecard />

          <Suspense fallback={<LoadingCard />}>
            <AccountSummary householdId={householdId} />
          </Suspense>

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
              <Suspense fallback={<LoadingCard />}>
                <IncomeBreakdown householdId={householdId} />
              </Suspense>
              <MoneyFlowDiagram />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<LoadingCard />}>
                  <UpcomingBills householdId={householdId} />
                </Suspense>
                <Suspense fallback={<LoadingCard />}>
                  <ChildExpenses householdId={householdId} />
                </Suspense>
              </div>
              <Suspense fallback={<LoadingCard />}>
                <BudgetTracker householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="pockets" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <PocketsOverview householdId={householdId} />
              </Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PocketTransfers />
                <Suspense fallback={<LoadingCard />}>
                  <SinkingFundsCalendar householdId={householdId} />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="couple" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <ContributionTracker householdId={householdId} />
              </Suspense>
              <Suspense fallback={<LoadingCard />}>
                <PersonalAllowance householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="bills" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <UpcomingBills householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <BudgetTracker householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="family" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <ChildExpenses householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="savings" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <SavingsGoals householdId={householdId} />
              </Suspense>
              <Suspense fallback={<LoadingCard />}>
                <SinkingFundsCalendar householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="gifts" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <GiftBudget householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="travel" className="space-y-6">
              <Suspense fallback={<LoadingCard />}>
                <TravelBudget householdId={householdId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="targets" className="space-y-6">
              <MonthlyTargets />
            </TabsContent>
          </Tabs>
        </div>

        <footer className="mt-12 pb-8 text-center text-sm text-muted-foreground">
          <p>Powered by Supabase • 11/17 components fully migrated • Remaining: couple-scorecard, money-flow-diagram, monthly-targets, pocket-transfers (UI only)</p>
        </footer>
      </div>
    </main>
  );
}
