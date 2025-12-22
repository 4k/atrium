import { AccountSummary } from '@/components/dashboard/account-summary';
import { IncomeBreakdown } from '@/components/dashboard/income-breakdown';
import { BudgetTracker } from '@/components/dashboard/budget-tracker';
import { SavingsGoals } from '@/components/dashboard/savings-goals';
import { MonthlyTargets } from '@/components/dashboard/monthly-targets';
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
          <AccountSummary />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
              <TabsTrigger value="targets">Targets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <IncomeBreakdown />
              <div className="grid grid-cols-1 gap-6">
                <BudgetTracker />
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="savings" className="space-y-6">
              <SavingsGoals />
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
