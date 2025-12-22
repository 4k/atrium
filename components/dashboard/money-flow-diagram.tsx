'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  people, 
  getPersonIncome, 
  getTotalIncome, 
  pockets, 
  personalAllowances,
  getTotalPocketAllocations
} from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowRight, TrendingUp, Users, Wallet, PiggyBank, Coins } from 'lucide-react';

export function MoneyFlowDiagram() {
  const totalIncome = getTotalIncome();
  
  // Calculate flow amounts
  const tonyIncome = getPersonIncome('tony');
  const tatsianaIncome = getPersonIncome('tatsiana');
  
  const tonyAllowance = personalAllowances.find(a => a.personId === 'tony')?.monthlyAmount || 200;
  const tatsianaAllowance = personalAllowances.find(a => a.personId === 'tatsiana')?.monthlyAmount || 200;
  const totalAllowances = tonyAllowance + tatsianaAllowance;
  
  const pocketAllocations = getTotalPocketAllocations();
  
  // Calculate what goes to joint contribution
  const tonyJointContribution = tonyIncome - tonyAllowance;
  const tatsianaJointContribution = tatsianaIncome - tatsianaAllowance;
  const totalJointContribution = tonyJointContribution + tatsianaJointContribution;
  
  // What's left after pockets (discretionary / savings)
  const remainingAfterPockets = totalJointContribution - pocketAllocations;

  // Flow node component
  const FlowNode = ({ 
    icon: Icon, 
    label, 
    amount, 
    color, 
    subLabel 
  }: { 
    icon: React.ElementType; 
    label: string; 
    amount: number; 
    color: string;
    subLabel?: string;
  }) => (
    <div className={cn('flex flex-col items-center p-4 rounded-xl border-2 min-w-[140px]', color)}>
      <Icon className="h-6 w-6 mb-2" />
      <p className="text-sm font-medium text-center">{label}</p>
      <p className="text-lg font-bold">{formatCurrency(amount)}</p>
      {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
    </div>
  );

  // Flow arrow component
  const FlowArrow = ({ label, amount }: { label?: string; amount?: number }) => (
    <div className="flex flex-col items-center justify-center px-2">
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
      {label && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      )}
      {amount && (
        <span className="text-xs font-medium">{formatCurrency(amount)}</span>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Money Flow
        </CardTitle>
        <CardDescription>
          Visual breakdown of how income flows through your budget
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Waterfall Visualization */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Income Sources Row */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Income Sources</p>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center p-4 rounded-xl border-2 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mb-2">
                      T
                    </div>
                    <p className="text-sm font-medium">Tony</p>
                    <p className="text-lg font-bold">{formatCurrency(tonyIncome)}</p>
                    <p className="text-xs text-muted-foreground">64%</p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">+</div>
                  <div className="flex flex-col items-center p-4 rounded-xl border-2 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mb-2">
                      Ta
                    </div>
                    <p className="text-sm font-medium">Tatsiana</p>
                    <p className="text-lg font-bold">{formatCurrency(tatsianaIncome)}</p>
                    <p className="text-xs text-muted-foreground">36%</p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">=</div>
                  <FlowNode 
                    icon={TrendingUp} 
                    label="Total Income" 
                    amount={totalIncome} 
                    color="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                  />
                </div>
              </div>
            </div>

            {/* Split Row */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex-1 h-px bg-border" />
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Income Split</p>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Distribution Row */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Personal Allowances */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <FlowNode 
                    icon={Coins} 
                    label="Personal Allowances" 
                    amount={totalAllowances} 
                    color="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    subLabel={`${formatCurrency(tonyAllowance)} + ${formatCurrency(tatsianaAllowance)}`}
                  />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Private spending
                  </div>
                </div>
              </div>

              {/* Joint Contribution */}
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <FlowNode 
                    icon={Users} 
                    label="Joint Contribution" 
                    amount={totalJointContribution} 
                    color="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                    subLabel={`${((totalJointContribution / totalIncome) * 100).toFixed(0)}% of income`}
                  />
                </div>
              </div>

              {/* Placeholder for alignment */}
              <div />
            </div>

            {/* Joint Contribution Breakdown */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex-1 h-px bg-border" />
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Joint Account Allocation</p>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Pockets Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {pockets.slice(0, 4).map((pocket) => (
                <div 
                  key={pocket.id}
                  className={cn(
                    'p-4 rounded-xl border-2 bg-card',
                    'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{pocket.icon}</span>
                    <span className="font-medium text-sm">{pocket.name}</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(pocket.monthlyAllocation)}</p>
                  <p className="text-xs text-muted-foreground">monthly</p>
                </div>
              ))}
            </div>

            {/* Summary Row */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5" />
                  <span className="font-medium">To Pockets</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(pocketAllocations)}</p>
                <p className="text-sm text-muted-foreground">
                  {((pocketAllocations / totalIncome) * 100).toFixed(0)}% of income
                </p>
              </div>
              <div className="p-4 rounded-xl border-2 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-5 w-5" />
                  <span className="font-medium">Remaining / Flex</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(remainingAfterPockets)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((remainingAfterPockets / totalIncome) * 100).toFixed(0)}% of income
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-medium mb-3">Flow Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Income: {formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>Allowances: {formatCurrency(totalAllowances)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Pockets: {formatCurrency(pocketAllocations)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span>Flex: {formatCurrency(remainingAfterPockets)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
