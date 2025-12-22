'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonBadge } from './person-badge';
import { formatCurrency, cn } from '@/lib/utils';
import { Coins, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Person = Database['public']['Tables']['persons']['Row'];
type PersonalAllowance = Database['public']['Tables']['personal_allowances']['Row'];

interface PersonWithAllowance extends Person {
  allowance?: PersonalAllowance;
}

export function PersonalAllowance({ householdId }: { householdId: string }) {
  const [personsData, setPersonsData] = useState<PersonWithAllowance[]>([]);
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

      // Fetch allowances for each person
      const personsWithAllowances = await Promise.all(
        persons.map(async (person) => {
          const { data: allowances, error: allowanceError } = await supabase
            .from('personal_allowances')
            .select('*')
            .eq('person_id', person.id)
            .eq('month', currentMonth)
            .single();

          if (allowanceError && allowanceError.code !== 'PGRST116') {
            console.error('Error fetching allowance:', allowanceError);
          }

          return {
            ...person,
            allowance: allowances || undefined,
          };
        })
      );

      setPersonsData(personsWithAllowances);
      setLoading(false);
    }

    fetchData();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Personal Allowances
          </CardTitle>
          <CardDescription>
            Monthly "fun money" for each person • No category tracking for privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading allowance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allowanceData = personsData.map((person) => {
    const allowance = person.allowance;

    if (!allowance) {
      return {
        person,
        monthlyAmount: 0,
        spent: 0,
        remaining: 0,
        carryover: 0,
        totalAvailable: 0,
        percentUsed: 0,
        isBorrowingFromNextMonth: false,
        borrowedAmount: 0,
      };
    }

    const totalAvailable = allowance.monthly_amount + allowance.carryover_from_last_month;
    const remaining = totalAvailable - allowance.current_month_spent;
    const isBorrowingFromNextMonth = remaining < 0;
    const borrowedAmount = Math.abs(Math.min(remaining, 0));
    const percentUsed = totalAvailable > 0 ? Math.min(Math.round((allowance.current_month_spent / totalAvailable) * 100), 100) : 0;

    return {
      person,
      monthlyAmount: allowance.monthly_amount,
      spent: allowance.current_month_spent,
      remaining: Math.max(remaining, 0),
      carryover: allowance.carryover_from_last_month,
      totalAvailable,
      percentUsed,
      isBorrowingFromNextMonth,
      borrowedAmount,
    };
  });

  // Gauge component
  const AllowanceGauge = ({ data }: { data: typeof allowanceData[0] }) => {
    const radius = 70;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const arc = circumference * 0.75; // 270 degrees
    const filledArc = (data.percentUsed / 100) * arc;

    // Calculate the color based on usage
    const getColor = () => {
      if (data.isBorrowingFromNextMonth) return 'text-red-500';
      if (data.percentUsed >= 90) return 'text-amber-500';
      if (data.percentUsed >= 70) return 'text-yellow-500';
      return 'text-green-500';
    };

    return (
      <div className={cn(
        'relative p-6 rounded-xl border-2 transition-colors',
        data.person.color === '#3b82f6' || data.person.color.includes('blue')
          ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
          : 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <PersonBadge person={data.person} showName size="md" />
          {data.isBorrowingFromNextMonth && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Borrowed
            </Badge>
          )}
          {data.carryover > 0 && !data.isBorrowingFromNextMonth && (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
              <Sparkles className="h-3 w-3 mr-1" />
              +{formatCurrency(data.carryover)} rollover
            </Badge>
          )}
        </div>

        {/* Gauge */}
        <div className="flex justify-center my-4">
          <div className="relative">
            <svg width="180" height="140" className="transform">
              {/* Background arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="text-muted rotate-[135deg] origin-center"
                style={{ transform: 'rotate(135deg)', transformOrigin: '90px 90px' }}
              />
              {/* Filled arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${filledArc} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className={cn(getColor(), 'transition-all duration-700')}
                style={{ transform: 'rotate(135deg)', transformOrigin: '90px 90px' }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-3xl font-bold', getColor())}>
                {data.isBorrowingFromNextMonth ? '-' : ''}{formatCurrency(data.isBorrowingFromNextMonth ? data.borrowedAmount : data.remaining)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {data.isBorrowingFromNextMonth ? 'borrowed from next month' : 'remaining'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm mt-4">
          <div>
            <p className="text-muted-foreground text-xs">Monthly</p>
            <p className="font-semibold">{formatCurrency(data.monthlyAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Spent</p>
            <p className="font-semibold">{formatCurrency(data.spent)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Available</p>
            <p className="font-semibold">{formatCurrency(data.totalAvailable)}</p>
          </div>
        </div>

        {/* Borrowing warning */}
        {data.isBorrowingFromNextMonth && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Next month starts with <strong>−{formatCurrency(data.borrowedAmount)}</strong></span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Personal Allowances
        </CardTitle>
        <CardDescription>
          Monthly "fun money" for each person • No category tracking for privacy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allowanceData.map((data) => (
            <AllowanceGauge key={data.person.id} data={data} />
          ))}
        </div>

        {/* Rules */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">How it works:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              Each person gets {formatCurrency(200)} per month for personal spending
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              Unspent allowance rolls over to next month
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              Overspending subtracts from next month's allowance
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
