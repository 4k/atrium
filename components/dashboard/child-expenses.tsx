'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { children, childExpenses, getTotalChildExpenses, getTotalChildBudget } from '@/lib/mock-data';
import { formatCurrency, calculateProgress, cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function ChildExpenses() {
  const child = children[0];
  const expenses = childExpenses.filter((e) => e.childId === child.id);
  const totalSpent = getTotalChildExpenses(child.id);
  const totalBudget = getTotalChildBudget(child.id);
  const overallProgress = calculateProgress(totalSpent, totalBudget);

  const categoryColors: Record<string, string> = {
    education: '#3b82f6',
    activities: '#8b5cf6',
    clothing: '#ec4899',
    healthcare: '#10b981',
    toys: '#f59e0b',
    food: '#ef4444',
    other: '#6b7280',
  };

  const pieData = expenses.map((expense) => ({
    name: expense.name,
    value: expense.amount,
    color: categoryColors[expense.category] || categoryColors.other,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={cn('text-white font-semibold text-lg', child.color)}>
                {child.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{child.name}'s Expenses</CardTitle>
              <CardDescription>Age {child.age} • Monthly budget tracking</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total This Month</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-muted-foreground">of {formatCurrency(totalBudget)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Budget</span>
                <span className="text-sm font-semibold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            <div className="space-y-3">
              {expenses.map((expense) => {
                const progress = calculateProgress(expense.amount, expense.budgeted);
                const isOverBudget = expense.amount > expense.budgeted;

                return (
                  <div key={expense.id} className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{expense.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{expense.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('font-semibold', isOverBudget && 'text-red-500')}>
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">/ {formatCurrency(expense.budgeted)}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(progress, 100)} className="h-1.5" />
                      {isOverBudget && (
                        <div className="absolute top-0 left-0 h-1.5 rounded-full bg-red-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold mb-4">Expense Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              {Object.entries(categoryColors).map(([category, color]) => {
                const categoryExpense = expenses.find((e) => e.category === category);
                if (!categoryExpense) return null;
                return (
                  <div key={category} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs capitalize">{category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
