'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PersonBadge } from './person-badge';
import { 
  people, 
  contributionConfig, 
  monthlyContributions, 
  getPersonIncome, 
  getTotalIncome,
  getContributionBalance 
} from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';
import { Scale, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

export function ContributionTracker() {
  const totalIncome = getTotalIncome();
  const currentMonth = '2024-12'; // In production, use actual current month
  
  // Get current month contributions
  const currentContributions = monthlyContributions.filter((c) => c.month === currentMonth);

  // Calculate income ratios and contribution data for each person
  const contributionData = people.map((person) => {
    const personIncome = getPersonIncome(person.id);
    const incomePercentage = Math.round((personIncome / totalIncome) * 100);
    
    const config = contributionConfig.find((c) => c.personId === person.id);
    const expectedPercentage = config?.expectedPercentage || incomePercentage;
    
    const contribution = currentContributions.find((c) => c.personId === person.id);
    const expectedAmount = contribution?.expectedAmount || 0;
    const actualAmount = contribution?.actualAmount || 0;
    
    const difference = actualAmount - expectedAmount;
    const contributionBalance = getContributionBalance(person.id);
    
    const progressPercentage = expectedAmount > 0 
      ? Math.round((actualAmount / expectedAmount) * 100)
      : 0;

    return {
      person,
      personIncome,
      incomePercentage,
      expectedPercentage,
      expectedAmount,
      actualAmount,
      difference,
      contributionBalance,
      progressPercentage,
      isAhead: difference > 0,
      isBehind: difference < 0,
      isOnTrack: difference === 0,
    };
  });

  // Total joint contribution
  const totalExpected = contributionData.reduce((sum, d) => sum + d.expectedAmount, 0);
  const totalActual = contributionData.reduce((sum, d) => sum + d.actualAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Proportional Contributions
        </CardTitle>
        <CardDescription>
          Fair share contributions based on income ratio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Household Income</p>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Expected Joint Contribution</p>
            <p className="text-2xl font-bold">{formatCurrency(totalExpected)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Actual This Month</p>
            <p className={cn(
              'text-2xl font-bold',
              totalActual >= totalExpected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {formatCurrency(totalActual)}
            </p>
          </div>
        </div>

        {/* Individual Contributions */}
        <div className="space-y-6">
          {contributionData.map((data) => (
            <div key={data.person.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <PersonBadge person={data.person} showName />
                  <Badge variant="outline" className="ml-2">
                    {data.incomePercentage}% of income
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {data.isOnTrack && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  )}
                  {data.isAhead && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{formatCurrency(data.difference)}
                    </Badge>
                  )}
                  {data.isBehind && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {formatCurrency(data.difference)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly Income</p>
                  <p className="font-semibold">{formatCurrency(data.personIncome)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Fair Share ({data.expectedPercentage}%)</p>
                  <p className="font-semibold">{formatCurrency(data.expectedAmount)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Contribution Progress</span>
                  <span className="font-medium">
                    {formatCurrency(data.actualAmount)} / {formatCurrency(data.expectedAmount)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(data.progressPercentage, 100)} 
                  className={cn(
                    'h-3',
                    data.progressPercentage > 100 && '[&>div]:bg-blue-500',
                    data.progressPercentage < 100 && '[&>div]:bg-amber-500'
                  )}
                />
              </div>

              {/* Running Balance */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Running Balance (all time)</span>
                <span className={cn(
                  'font-semibold',
                  data.contributionBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                )}>
                  {data.contributionBalance >= 0 ? '+' : ''}{formatCurrency(data.contributionBalance)}
                </span>
              </div>

              {/* Variable Income Note for Tony */}
              {data.person.id === 'tony' && (
                <div className="mt-3 flex items-start gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-xs">
                  <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-300">
                    Variable income from 4kStudio and Imperator. Contribution amount may adjust monthly.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
