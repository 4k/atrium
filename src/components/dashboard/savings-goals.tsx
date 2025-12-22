'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonBadge, SharedBadge } from './person-badge';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { Target, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'] & {
  pocket?: Database['public']['Tables']['pockets']['Row'] | null;
};

export function SavingsGoals({ householdId }: { householdId: string }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*, pocket:pockets(*)')
        .eq('household_id', householdId)
        .order('created_at');

      if (error) {
        console.error('Error fetching savings goals:', error);
        setLoading(false);
        return;
      }

      setGoals(data || []);
      setLoading(false);
    }

    fetchGoals();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Track progress towards your financial targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading savings goals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const GoalCard = ({ goal }: { goal: SavingsGoal }) => {
    const progress = calculateProgress(goal.current_amount, goal.target_amount);
    const remaining = goal.target_amount - goal.current_amount;

    return (
      <div className="p-6 rounded-lg border bg-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{goal.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <SharedBadge />
            </div>
          </div>
          {goal.target_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(goal.target_date).toLocaleDateString('de-DE')}</span>
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
            <span className="font-semibold">{formatCurrency(goal.current_amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-bold text-primary">{formatCurrency(remaining)}</span>
          </div>
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
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No savings goals yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
