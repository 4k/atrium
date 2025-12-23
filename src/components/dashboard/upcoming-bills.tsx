'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, CheckCircle2, Zap, Repeat, Settings2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Bill = Database['public']['Tables']['bills']['Row'];

export function UpcomingBills({ householdId }: { householdId: string }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      const supabase = createClient();
      const today = new Date();
      const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('household_id', householdId)
        .eq('is_paid', false)
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date');

      if (error) {
        console.error('Error fetching bills:', error);
        setLoading(false);
        return;
      }

      setBills(data || []);
      setLoading(false);
    }

    fetchBills();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Bills to be paid this month</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading bills...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (daysUntil: number): string => {
    if (daysUntil < 0) return 'text-red-600 dark:text-red-400';
    if (daysUntil <= 3) return 'text-orange-600 dark:text-orange-400';
    if (daysUntil <= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getDueDateBadge = (daysUntil: number): React.ReactNode => {
    if (daysUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntil === 0) {
      return <Badge className="bg-orange-500">Due Today</Badge>;
    }
    if (daysUntil === 1) {
      return <Badge className="bg-yellow-500">Due Tomorrow</Badge>;
    }
    return <Badge variant="outline">{daysUntil} days</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Bills</CardTitle>
            <CardDescription>Bills to be paid this month</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalDue)}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/manage/bills">
                <Settings2 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.due_date);
            const dueDate = new Date(bill.due_date);

            return (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">📝</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{bill.name}</h4>
                      <div className="flex items-center gap-1">
                        {bill.is_autopay && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                        {bill.frequency !== 'one-time' && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            {bill.frequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {bill.category && (
                        <p className="text-sm text-muted-foreground">{bill.category}</p>
                      )}
                      <div className={`flex items-center gap-1 text-sm font-medium ${getDueDateColor(daysUntil)}`}>
                        <Calendar className="h-3 w-3" />
                        {dueDate.toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                    {getDueDateBadge(daysUntil)}
                  </div>
                </div>
              </div>
            );
          })}

          {bills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All bills are paid!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
