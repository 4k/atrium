'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PocketCard } from './pocket-card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Pocket = Database['public']['Tables']['pockets']['Row'];

export function PocketsOverview({ householdId }: { householdId: string }) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPockets() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at');

      if (error) {
        console.error('Error fetching pockets:', error);
        setLoading(false);
        return;
      }

      setPockets(data || []);
      setLoading(false);
    }

    fetchPockets();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Revolut Pockets
              </CardTitle>
              <CardDescription>Virtual sub-accounts for organized budgeting</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading pockets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = pockets.reduce((sum, p) => sum + p.current_balance, 0);
  const totalAllocations = pockets.reduce((sum, p) => sum + (p.monthly_allocation || 0), 0);
  const totalSpentThisMonth = 0; // We'll calculate this from transactions later

  // Separate pockets into spending and savings
  const spendingPockets = pockets.filter(p => p.type === 'bills' || p.type === 'groceries' || p.type === 'spending');
  const savingsPockets = pockets.filter(p => p.type === 'emergency' || p.type === 'vacation' || p.type === 'investment' || p.type === 'sinking' || p.type === 'savings');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Revolut Pockets
            </CardTitle>
            <CardDescription>Virtual sub-accounts for organized budgeting</CardDescription>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total in Pockets</p>
              <p className="font-bold text-lg">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Allocations</p>
              <p className="font-bold text-lg">{formatCurrency(totalAllocations)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/50">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spent This Month</p>
              <p className="font-bold text-lg">{formatCurrency(totalSpentThisMonth)}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Spending Pockets */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Spending Pockets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendingPockets.map((pocket) => (
              <PocketCard key={pocket.id} pocket={pocket} />
            ))}
          </div>
        </div>

        {/* Savings Pockets */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Savings & Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {savingsPockets.map((pocket) => (
              <PocketCard key={pocket.id} pocket={pocket} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
