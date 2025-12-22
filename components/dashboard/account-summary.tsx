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
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(netSavings),
      icon: PiggyBank,
      color: 'text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden border-primary/20">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardDescription className="text-primary font-medium text-sm">
                Revolut Shared Account
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-2 tracking-tight">
                {formatCurrency(accountBalance.current)}
              </CardTitle>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              {balanceChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )}
              <span className={`text-sm font-semibold ${balanceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(Math.abs(balanceChange))} ({changePercentage}%)
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>

          <div className="mt-3">
            <Badge variant="outline" className="bg-secondary/50 border-border/50 text-muted-foreground text-xs">
              Last synced: {formatRelativeTime(accountBalance.lastSynced)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
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
