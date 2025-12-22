'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonBadge, SharedBadge } from './person-badge';
import { formatCurrency, calculateProgress, getBudgetStatus, cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'] & {
  person?: Database['public']['Tables']['persons']['Row'] | null;
};

export function BudgetTracker({ householdId }: { householdId: string }) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudget() {
      const supabase = createClient();
      const now = new Date();
      const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('budget_categories')
        .select('*, person:persons(*)')
        .eq('household_id', householdId)
        .eq('month', monthStr)
        .order('created_at');

      if (error) {
        console.error('Error fetching budget categories:', error);
        setLoading(false);
        return;
      }

      setCategories(data || []);
      setLoading(false);
    }

    fetchBudget();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>Track spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading budget...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sharedCategories = categories.filter((cat) => cat.person_id === null);
  const personalCategories = categories.filter((cat) => cat.person_id !== null);

  const StatusIcon = ({ status }: { status: 'under' | 'near' | 'over' }) => {
    switch (status) {
      case 'under':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'near':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'over':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getProgressColor = (status: 'under' | 'near' | 'over') => {
    switch (status) {
      case 'under':
        return 'bg-green-500';
      case 'near':
        return 'bg-yellow-500';
      case 'over':
        return 'bg-red-500';
    }
  };

  const CategoryRow = ({ category }: { category: BudgetCategory }) => {
    const progress = calculateProgress(category.spent, category.budgeted);
    const status = getBudgetStatus(category.spent, category.budgeted);

    return (
      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon || '💰'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{category.name}</h4>
                <StatusIcon status={status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                {category.person ? <PersonBadge person={category.person} showName={false} size="sm" /> : <SharedBadge />}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
            </p>
            <p className={cn('text-sm font-medium', status === 'over' ? 'text-red-500' : 'text-muted-foreground')}>
              {category.budgeted - category.spent >= 0
                ? `${formatCurrency(category.budgeted - category.spent)} left`
                : `${formatCurrency(Math.abs(category.budgeted - category.spent))} over`}
            </p>
          </div>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-2" />
          <div
            className={cn('absolute top-0 left-0 h-2 rounded-full transition-all', getProgressColor(status))}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>Track spending by category and person</CardDescription>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/manage/budget">
              <Settings2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sharedCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SharedBadge />
              Shared Expenses
            </h3>
            <div className="space-y-3">
              {sharedCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}

        {personalCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Expenses</h3>
            <div className="space-y-3">
              {personalCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budget categories for this month</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
