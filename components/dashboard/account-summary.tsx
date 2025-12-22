import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { accountBalance, getTotalIncome, getTotalExpenses } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export function AccountSummary() {
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netSavings = totalIncome - totalExpenses;
  const balanceChange = accountBalance.current - accountBalance.previous;
  const changePercentage = ((balanceChange / accountBalance.previous) * 100).toFixed(1);

  const stats = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(netSavings),
      icon: PiggyBank,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardDescription className="text-blue-700 dark:text-blue-300 font-medium">
                Revolut Shared Account
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-2 text-blue-900 dark:text-blue-100">
                {formatCurrency(accountBalance.current)}
              </CardTitle>
            </div>
            <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              {balanceChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(balanceChange))} ({changePercentage}%)
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>

          <div className="mt-3">
            <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
              Last synced: {formatRelativeTime(accountBalance.lastSynced)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
