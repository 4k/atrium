'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCoupleScorecard, accountBalance, getTotalExpenses } from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  Wallet, 
  Target,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export function CoupleScorecard() {
  const scorecard = getCoupleScorecard();
  const avgDailyExpense = getTotalExpenses() / 30;

  return (
    <Card className={cn(
      'border-2 transition-colors',
      scorecard.isOnTrack 
        ? 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30'
        : 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {scorecard.isOnTrack ? (
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
              Couple Scorecard
            </CardTitle>
            <CardDescription>
              Monthly financial health check
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-lg px-4 py-2 font-bold',
              scorecard.isOnTrack 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            )}
          >
            {scorecard.isOnTrack ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                On Track
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Needs Attention
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Explanation */}
        <div className={cn(
          'p-4 rounded-lg',
          scorecard.isOnTrack 
            ? 'bg-green-100/50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            : 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
        )}>
          <p className="text-sm font-medium">{scorecard.onTrackExplanation}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Savings Rate */}
          <div className="p-4 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Savings Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-2xl font-bold',
                scorecard.savingsRate >= scorecard.savingsRateTarget 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-amber-600 dark:text-amber-400'
              )}>
                {scorecard.savingsRate}%
              </span>
              <span className="text-sm text-muted-foreground">
                / {scorecard.savingsRateTarget}%
              </span>
            </div>
            <Progress 
              value={(scorecard.savingsRate / scorecard.savingsRateTarget) * 100} 
              className={cn(
                'h-2 mt-2',
                scorecard.savingsRate >= scorecard.savingsRateTarget && '[&>div]:bg-green-500'
              )}
            />
          </div>

          {/* Days Until Paycheck */}
          <div className="p-4 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Next Paycheck</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{scorecard.daysUntilNextPaycheck}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ~{formatCurrency(avgDailyExpense * scorecard.daysUntilNextPaycheck)} expected spend
            </p>
          </div>

          {/* Remaining Budget */}
          <div className="p-4 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Budget Remaining</span>
            </div>
            <span className={cn(
              'text-2xl font-bold',
              scorecard.remainingBudget >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(scorecard.remainingBudget)}
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              {scorecard.remainingBudget >= 0 ? 'Under budget ✓' : 'Over budget!'}
            </p>
          </div>

          {/* Account Runway */}
          <div className="p-4 rounded-lg bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Account Runway</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-2xl font-bold',
                scorecard.jointAccountRunway > 60 
                  ? 'text-green-600 dark:text-green-400' 
                  : scorecard.jointAccountRunway > 30 
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
              )}>
                {scorecard.jointAccountRunway}
              </span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              @ {formatCurrency(avgDailyExpense)}/day
            </p>
          </div>
        </div>

        {/* Quick Actions / Recommendations */}
        {!scorecard.isOnTrack && (
          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Recommendations
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              {scorecard.savingsRate < scorecard.savingsRateTarget && (
                <li>• Review discretionary spending to increase savings rate</li>
              )}
              {scorecard.remainingBudget < 0 && (
                <li>• Identify which categories exceeded budget</li>
              )}
              {scorecard.jointAccountRunway < 30 && (
                <li>• Consider building up joint account buffer</li>
              )}
            </ul>
          </div>
        )}

        {/* Balance Info */}
        <div className="pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Joint Account Balance</span>
          <span className="font-bold text-lg">{formatCurrency(accountBalance.current)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
