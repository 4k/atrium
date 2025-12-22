'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import type { Database } from '@/lib/supabase/database.types';

type Pocket = Database['public']['Tables']['pockets']['Row'];

interface PocketCardProps {
  pocket: Pocket;
  compact?: boolean;
}

export function PocketCard({ pocket, compact = false }: PocketCardProps) {
  const spentPercentage = (pocket.monthly_allocation || 0) > 0
    ? calculateProgress(pocket.spent_this_month, pocket.monthly_allocation || 0)
    : 0;

  const savingsProgress = pocket.target_amount
    ? calculateProgress(pocket.current_balance, pocket.target_amount)
    : null;

  const remaining = (pocket.monthly_allocation || 0) - pocket.spent_this_month;
  const isSavingsPocket = pocket.type === 'emergency' || pocket.type === 'vacation' || pocket.type === 'investment' || pocket.type === 'sinking';

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl', pocket.color)}>
            {pocket.icon}
          </div>
          <div>
            <p className="font-medium text-sm">{pocket.name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(pocket.current_balance)}</p>
          </div>
        </div>
        {savingsProgress !== null && (
          <div className="w-16">
            <Progress value={savingsProgress} className="h-2" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={cn('h-1', pocket.color)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm',
              pocket.color.replace('bg-', 'bg-opacity-20 bg-'),
              'dark:bg-opacity-30'
            )}>
              <span className="drop-shadow-sm">{pocket.icon}</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg">{pocket.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{pocket.type.replace('-', ' ')}</p>
            </div>
          </div>
          {pocket.target_date && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(pocket.target_date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="text-center py-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold">{formatCurrency(pocket.current_balance)}</p>
            <p className="text-xs text-muted-foreground mt-1">Current Balance</p>
          </div>

          {/* Monthly Allocation & Spending */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly Allocation</p>
              <p className="font-semibold">{formatCurrency(pocket.monthly_allocation || 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Spent This Month</p>
              <p className="font-semibold">{formatCurrency(pocket.spent_this_month)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {isSavingsPocket && pocket.target_amount ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  Goal Progress
                </span>
                <span className="font-medium">{savingsProgress}%</span>
              </div>
              <Progress value={savingsProgress ?? 0} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {formatCurrency(pocket.target_amount - pocket.current_balance)} remaining to goal
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Monthly Usage
                </span>
                <span className={cn(
                  'font-medium',
                  spentPercentage > 100 ? 'text-red-500' : spentPercentage > 80 ? 'text-yellow-500' : 'text-green-500'
                )}>
                  {spentPercentage}%
                </span>
              </div>
              <Progress 
                value={Math.min(spentPercentage, 100)} 
                className={cn(
                  'h-2',
                  spentPercentage > 100 && '[&>div]:bg-red-500',
                  spentPercentage > 80 && spentPercentage <= 100 && '[&>div]:bg-yellow-500'
                )} 
              />
              <p className={cn(
                'text-xs text-center',
                remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {remaining >= 0 
                  ? `${formatCurrency(remaining)} remaining this month`
                  : `${formatCurrency(Math.abs(remaining))} over budget`
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
