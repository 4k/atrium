import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { travelPlans } from '@/lib/mock-data';
import { formatCurrency, calculateProgress, cn } from '@/lib/utils';
import { Plane, Hotel, Utensils, MapPin, Car, Calendar, CheckCircle2, Clock } from 'lucide-react';

const categoryIcons = {
  flights: Plane,
  accommodation: Hotel,
  food: Utensils,
  activities: MapPin,
  transport: Car,
  other: MapPin,
};

export function TravelBudget() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950"><Clock className="h-3 w-3 mr-1" />Planning</Badge>;
      case 'booked':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Booked</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    const tripDate = new Date(date);
    const diffTime = tripDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Travel Budget Planner
        </CardTitle>
        <CardDescription>Save and plan for your dream vacations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {travelPlans.map((trip) => {
            const savingsProgress = calculateProgress(trip.saved, trip.totalBudget);
            const totalSpent = trip.expenses.reduce((sum, e) => sum + e.spent, 0);
            const daysUntil = getDaysUntil(trip.startDate);
            const tripDuration = Math.ceil(
              (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={trip.id} className="p-6 rounded-lg border bg-gradient-to-br from-card to-muted/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{trip.destination}</h3>
                      {getStatusBadge(trip.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          -{' '}
                          {new Date(trip.endDate).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <Badge variant="outline">{tripDuration} days</Badge>
                      {daysUntil > 0 && (
                        <Badge className="bg-purple-500">{daysUntil} days away</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(trip.totalBudget)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Savings Progress</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(trip.saved)} / {formatCurrency(trip.totalBudget)}
                    </span>
                  </div>
                  <Progress value={savingsProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(trip.totalBudget - trip.saved)} remaining to save
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {trip.expenses.map((expense) => {
                    const Icon = categoryIcons[expense.category];
                    const expenseProgress = calculateProgress(expense.spent, expense.budgeted);
                    const isBooked = expense.spent > 0;

                    return (
                      <div
                        key={expense.category}
                        className={cn(
                          'p-3 rounded-lg border',
                          isBooked ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-card'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={cn('h-4 w-4', isBooked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')} />
                          <span className="text-xs font-medium capitalize">{expense.category}</span>
                        </div>
                        <p className="text-sm font-bold">{formatCurrency(expense.budgeted)}</p>
                        {isBooked && (
                          <>
                            <Progress value={expenseProgress} className="h-1 mt-2" />
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {formatCurrency(expense.spent)} paid
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalSpent > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total Paid</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Total Travel Budget</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">All planned trips</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(travelPlans.reduce((sum, t) => sum + t.totalBudget, 0))}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatCurrency(travelPlans.reduce((sum, t) => sum + t.saved, 0))} saved
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
