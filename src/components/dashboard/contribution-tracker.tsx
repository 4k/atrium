'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PersonBadge } from './person-badge';
import { formatCurrency, cn } from '@/lib/utils';
import { Scale, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Person = Database['public']['Tables']['persons']['Row'];
type Contribution = Database['public']['Tables']['contributions']['Row'];
type IncomeSource = Database['public']['Tables']['income_sources']['Row'];

interface PersonWithData extends Person {
  contributions: Contribution[];
  incomeSources: IncomeSource[];
  monthlyIncome: number;
}

export function ContributionTracker({ householdId }: { householdId: string }) {
  const [personsData, setPersonsData] = useState<PersonWithData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Fetch persons
      const { data: persons, error: personsError } = await supabase
        .from('persons')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at');

      if (personsError || !persons) {
        console.error('Error fetching persons:', personsError);
        setLoading(false);
        return;
      }

      // Fetch data for each person
      const personsWithData = await Promise.all(
        persons.map(async (person) => {
          // Fetch income sources
          const { data: incomeSources, error: incomeError } = await supabase
            .from('income_sources')
            .select('*')
            .eq('person_id', person.id)
            .eq('is_active', true);

          if (incomeError) {
            console.error('Error fetching income sources:', incomeError);
          }

          // Calculate monthly income
          const monthlyIncome = (incomeSources || []).reduce((sum, source) => {
            if (source.frequency === 'monthly') return sum + source.amount;
            if (source.frequency === 'weekly') return sum + (source.amount * 52 / 12);
            return sum;
          }, 0);

          // Fetch contributions for current month
          const { data: contributions, error: contribError } = await supabase
            .from('contributions')
            .select('*')
            .eq('person_id', person.id)
            .eq('month', currentMonth);

          if (contribError) {
            console.error('Error fetching contributions:', contribError);
          }

          return {
            ...person,
            contributions: contributions || [],
            incomeSources: incomeSources || [],
            monthlyIncome,
          };
        })
      );

      setPersonsData(personsWithData);
      setLoading(false);
    }

    fetchData();
  }, [householdId]);

  if (loading) {
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
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading contribution data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = personsData.reduce((sum, p) => sum + p.monthlyIncome, 0);

  // Calculate contribution data for each person
  const contributionData = personsData.map((person) => {
    const incomePercentage = totalIncome > 0 ? Math.round((person.monthlyIncome / totalIncome) * 100) : 0;

    // Get current month's contribution
    const contribution = person.contributions[0];
    const expectedAmount = contribution?.expected_amount || 0;
    const actualAmount = contribution?.actual_amount || 0;

    const difference = actualAmount - expectedAmount;

    // Calculate running balance from all contributions
    const contributionBalance = person.contributions.reduce((sum, c) =>
      sum + (c.actual_amount - c.expected_amount), 0
    );

    const progressPercentage = expectedAmount > 0
      ? Math.round((actualAmount / expectedAmount) * 100)
      : 0;

    return {
      person,
      monthlyIncome: person.monthlyIncome,
      incomePercentage,
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
                  <p className="font-semibold">{formatCurrency(data.monthlyIncome)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Fair Share ({data.incomePercentage}%)</p>
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
              {data.person.name.toLowerCase().includes('tony') && (
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
