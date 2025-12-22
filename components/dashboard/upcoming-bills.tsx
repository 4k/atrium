import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUpcomingBills } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Calendar, CheckCircle2, Clock, Repeat, Zap } from 'lucide-react';

export function UpcomingBills() {
  const upcomingBills = getUpcomingBills();
  const totalDue = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);

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
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Due</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalDue)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingBills.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.dueDate);
            const dueDate = new Date(bill.dueDate);

            return (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{bill.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{bill.name}</h4>
                      <div className="flex items-center gap-1">
                        {bill.autopay && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                        {bill.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            {bill.recurringFrequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-muted-foreground">{bill.category}</p>
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

          {upcomingBills.length === 0 && (
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
