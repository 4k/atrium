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
import { getUserHousehold } from '@/lib/supabase/auth';
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

export default async function DashboardPage() {
  // Fetch household for authenticated user
  const household = await getUserHousehold();

  // If user doesn't have a household, redirect to setup
  if (!household) {
    redirect('/setup');
  }

  const householdId = household.id;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
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
  );
}
