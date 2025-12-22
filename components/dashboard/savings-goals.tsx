'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonBadge, SharedBadge } from './person-badge';
import { savingsGoals, people } from '@/lib/mock-data';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { Target, Calendar } from 'lucide-react';

export function SavingsGoals() {
  const GoalCard = ({ goal }: { goal: typeof savingsGoals[0] }) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    const person = people.find((p) => p.id === goal.personId);
    const remaining = goal.targetAmount - goal.currentAmount;

    return (
      <div className="p-6 rounded-lg border bg-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{goal.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              {person ? <PersonBadge person={person} showName={false} size="sm" /> : <SharedBadge />}
            </div>
          </div>
          {goal.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(goal.deadline).toLocaleDateString('de-DE')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="text-xs text-muted-foreground">complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-bold text-primary">{formatCurrency(remaining)}</span>
          </div>
          {goal.monthlyTarget && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <Target className="h-3 w-3" />
              <span>Monthly target: {formatCurrency(goal.monthlyTarget)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
        <CardDescription>Track progress towards your financial targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
