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
      'relative overflow-hidden border transition-all duration-300',
      scorecard.isOnTrack 
        ? 'border-emerald-500/20 dark:border-emerald-500/30'
        : 'border-amber-500/20 dark:border-amber-500/30'
    )}>
      {/* Subtle gradient glow effect */}
      <div className={cn(
        'absolute inset-0 opacity-[0.03] dark:opacity-[0.08]',
        scorecard.isOnTrack 
          ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
          : 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
      )} />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {scorecard.isOnTrack ? (
                <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              )}
              Couple Scorecard
            </CardTitle>
            <CardDescription className="mt-1">
              Monthly financial health check
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-sm px-3 py-1.5 font-semibold border-0',
              scorecard.isOnTrack 
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
            )}
          >
            {scorecard.isOnTrack ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                On Track
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                Needs Attention
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Status Explanation */}
        <div className={cn(
          'p-3 rounded-xl border',
          scorecard.isOnTrack 
            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
        )}>
          <p className="text-sm font-medium">{scorecard.onTrackExplanation}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Savings Rate */}
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Savings Rate</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                'text-2xl font-bold tracking-tight',
                scorecard.savingsRate >= scorecard.savingsRateTarget 
                  ? 'text-emerald-500' 
                  : 'text-amber-500'
              )}>
                {scorecard.savingsRate}%
              </span>
              <span className="text-xs text-muted-foreground">
                / {scorecard.savingsRateTarget}%
              </span>
            </div>
            <Progress 
              value={(scorecard.savingsRate / scorecard.savingsRateTarget) * 100} 
              className={cn(
                'h-1.5 mt-2',
                scorecard.savingsRate >= scorecard.savingsRateTarget && '[&>div]:bg-emerald-500'
              )}
            />
          </div>

          {/* Days Until Paycheck */}
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Next Paycheck</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight">{scorecard.daysUntilNextPaycheck}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ~{formatCurrency(avgDailyExpense * scorecard.daysUntilNextPaycheck)} expected spend
            </p>
          </div>

          {/* Remaining Budget */}
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Budget Remaining</span>
            </div>
            <span className={cn(
              'text-2xl font-bold tracking-tight',
              scorecard.remainingBudget >= 0 
                ? 'text-emerald-500' 
                : 'text-red-500'
            )}>
              {formatCurrency(scorecard.remainingBudget)}
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              {scorecard.remainingBudget >= 0 ? 'Under budget ✓' : 'Over budget!'}
            </p>
          </div>

          {/* Account Runway */}
          <div className="p-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Account Runway</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                'text-2xl font-bold tracking-tight',
                scorecard.jointAccountRunway > 60 
                  ? 'text-emerald-500' 
                  : scorecard.jointAccountRunway > 30 
                    ? 'text-amber-500'
                    : 'text-red-500'
              )}>
                {scorecard.jointAccountRunway}
              </span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              @ {formatCurrency(avgDailyExpense)}/day
            </p>
          </div>
        </div>

        {/* Quick Actions / Recommendations */}
        {!scorecard.isOnTrack && (
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
            <p className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Recommendations
            </p>
            <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1">
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
        <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Joint Account Balance</span>
          <span className="font-semibold text-lg tracking-tight">{formatCurrency(accountBalance.current)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
