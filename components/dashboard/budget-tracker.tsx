import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PersonBadge, SharedBadge } from './person-badge';
import { budgetCategories, people } from '@/lib/mock-data';
import { formatCurrency, calculateProgress, getBudgetStatus, cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export function BudgetTracker() {
  const sharedCategories = budgetCategories.filter((cat) => cat.personId === 'shared');
  const tonyCategories = budgetCategories.filter((cat) => cat.personId === 'tony');
  const tatsianaCategories = budgetCategories.filter((cat) => cat.personId === 'tatsiana');

  const StatusIcon = ({ status }: { status: 'under' | 'near' | 'over' }) => {
    switch (status) {
      case 'under':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'near':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'over':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getProgressColor = (status: 'under' | 'near' | 'over') => {
    switch (status) {
      case 'under':
        return 'bg-green-500';
      case 'near':
        return 'bg-yellow-500';
      case 'over':
        return 'bg-red-500';
    }
  };

  const CategoryRow = ({ category }: { category: typeof budgetCategories[0] }) => {
    const progress = calculateProgress(category.spent, category.budgeted);
    const status = getBudgetStatus(category.spent, category.budgeted);
    const person = people.find((p) => p.id === category.personId);

    return (
      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{category.name}</h4>
                <StatusIcon status={status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                {person ? <PersonBadge person={person} showName={false} size="sm" /> : <SharedBadge />}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
            </p>
            <p className={cn('text-sm font-medium', status === 'over' ? 'text-red-500' : 'text-muted-foreground')}>
              {category.budgeted - category.spent >= 0
                ? `${formatCurrency(category.budgeted - category.spent)} left`
                : `${formatCurrency(Math.abs(category.budgeted - category.spent))} over`}
            </p>
          </div>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-2" />
          <div
            className={cn('absolute top-0 left-0 h-2 rounded-full transition-all', getProgressColor(status))}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Categories</CardTitle>
        <CardDescription>Track spending by category and person</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SharedBadge />
            Shared Expenses
          </h3>
          <div className="space-y-3">
            {sharedCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PersonBadge person={people.find((p) => p.id === 'tony')!} showName={false} size="sm" />
              Tony's Personal
            </h3>
            <div className="space-y-3">
              {tonyCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PersonBadge person={people.find((p) => p.id === 'tatsiana')!} showName={false} size="sm" />
              Tatsiana's Personal
            </h3>
            <div className="space-y-3">
              {tatsianaCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
