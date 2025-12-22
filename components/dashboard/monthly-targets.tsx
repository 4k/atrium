'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { monthlyTargets, getTotalIncome, getTotalExpenses, monthlyHistory } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, calculateProgress } from '@/lib/utils';
import { TrendingUp, PiggyBank, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function MonthlyTargets() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const actualSavings = totalIncome - totalExpenses;
  const actualSavingsRate = (actualSavings / totalIncome) * 100;

  const incomeProgress = calculateProgress(totalIncome, monthlyTargets.incomeTarget);
  const savingsProgress = calculateProgress(actualSavingsRate, monthlyTargets.savingsRateTarget);

  const chartData = monthlyHistory.map((month) => ({
    month: month.month.split(' ')[0],
    Income: month.income,
    Expenses: month.expenses,
    Savings: month.savings,
  }));

  const targets = [
    {
      label: 'Income Target',
      icon: TrendingUp,
      current: formatCurrency(totalIncome),
      target: formatCurrency(monthlyTargets.incomeTarget),
      progress: incomeProgress,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Savings Rate',
      icon: PiggyBank,
      current: formatPercentage(actualSavingsRate, 1),
      target: formatPercentage(monthlyTargets.savingsRateTarget),
      progress: savingsProgress,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Budget Adherence',
      icon: Award,
      current: formatPercentage(monthlyTargets.budgetAdherenceScore),
      target: '100%',
      progress: monthlyTargets.budgetAdherenceScore,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Targets Dashboard</CardTitle>
          <CardDescription>Track your progress towards monthly financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {targets.map((target) => (
              <div key={target.label} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${target.bgColor}`}>
                      <target.icon className={`h-5 w-5 ${target.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{target.label}</p>
                      <p className="text-2xl font-bold">{target.current}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target: {target.target}</span>
                    <span className="font-semibold">{target.progress}%</span>
                  </div>
                  <Progress value={target.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">Next Milestone</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {formatCurrency(monthlyTargets.nextMilestone.distance)} away from{' '}
                  <span className="font-semibold">{monthlyTargets.nextMilestone.name}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3-Month Trend</CardTitle>
          <CardDescription>Income, expenses, and savings over the past 3 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Savings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
