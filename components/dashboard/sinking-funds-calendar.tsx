'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { sinkingFunds, getUpcomingSinkingFunds, getUnderfundedSinkingFunds } from '@/lib/mock-data';
import { formatCurrency, calculateProgress, cn } from '@/lib/utils';
import { Calendar, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export function SinkingFundsCalendar() {
  const upcomingFunds = getUpcomingSinkingFunds();
  const underfundedFunds = getUnderfundedSinkingFunds();
  
  const totalTarget = sinkingFunds.reduce((sum, sf) => sum + sf.targetAmount, 0);
  const totalCurrent = sinkingFunds.reduce((sum, sf) => sum + sf.currentAmount, 0);
  const totalMonthlyNeeded = sinkingFunds.reduce((sum, sf) => sum + sf.monthlyContribution, 0);

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil: number, isUnderfunded: boolean) => {
    if (isUnderfunded) return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30';
    if (daysUntil <= 30) return 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30';
    if (daysUntil <= 90) return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30';
    return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sinking Funds
        </CardTitle>
        <CardDescription>
          Save monthly for irregular annual expenses
        </CardDescription>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-bold">{formatCurrency(totalCurrent)}</p>
            <p className="text-xs text-muted-foreground">of {formatCurrency(totalTarget)} target</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Monthly Contributions</p>
            <p className="text-xl font-bold">{formatCurrency(totalMonthlyNeeded)}</p>
            <p className="text-xs text-muted-foreground">across all funds</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Funds Status</p>
            <div className="flex items-center gap-2 mt-1">
              {underfundedFunds.length > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {underfundedFunds.length} underfunded
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  All on track
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Timeline View */}
        <div className="space-y-4">
          {upcomingFunds.map((fund, index) => {
            const progress = calculateProgress(fund.currentAmount, fund.targetAmount);
            const daysUntil = getDaysUntilDue(fund.dueDate);
            const monthsUntil = Math.ceil(daysUntil / 30);
            const amountNeeded = fund.targetAmount - fund.currentAmount;
            const requiredMonthly = monthsUntil > 0 ? amountNeeded / monthsUntil : amountNeeded;
            const isOnPace = requiredMonthly <= fund.monthlyContribution;

            return (
              <div
                key={fund.id}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-colors',
                  getUrgencyColor(daysUntil, fund.isUnderfunded)
                )}
              >
                {/* Timeline connector */}
                {index < upcomingFunds.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-4 bg-border" />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl shrink-0">
                    {fund.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">{fund.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Due {new Date(fund.dueDate).toLocaleDateString('de-DE', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span>{daysUntil} days</span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="font-bold">{formatCurrency(fund.currentAmount)}</p>
                        <p className="text-xs text-muted-foreground">of {formatCurrency(fund.targetAmount)}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <Progress 
                        value={progress} 
                        className={cn(
                          'h-2',
                          progress >= 100 && '[&>div]:bg-green-500',
                          progress < 100 && fund.isUnderfunded && '[&>div]:bg-red-500'
                        )}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          'font-medium',
                          progress >= 100 ? 'text-green-600 dark:text-green-400' : 
                          fund.isUnderfunded ? 'text-red-600 dark:text-red-400' : 
                          'text-muted-foreground'
                        )}>
                          {progress}% funded
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatCurrency(fund.monthlyContribution)}/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Underfunded Warning */}
                    {fund.isUnderfunded && (
                      <div className="mt-3 flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 text-xs text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Behind schedule! Need {formatCurrency(requiredMonthly)}/mo to reach goal (currently {formatCurrency(fund.monthlyContribution)}/mo)
                        </span>
                      </div>
                    )}

                    {/* Fully Funded */}
                    {progress >= 100 && (
                      <div className="mt-3 flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/50 text-xs text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Fully funded and ready!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
