'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonBadge } from './person-badge';
import { people, incomeSources, getPersonIncome, getTotalIncome } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function IncomeBreakdown() {
  const totalIncome = getTotalIncome();
  const tonyIncome = getPersonIncome('tony');
  const tatsianaIncome = getPersonIncome('tatsiana');

  const pieData = [
    { name: 'Tony', value: tonyIncome, color: '#3b82f6' },
    { name: 'Tatsiana', value: tatsianaIncome, color: '#a855f7' },
  ];

  const tony = people.find((p) => p.id === 'tony')!;
  const tatsiana = people.find((p) => p.id === 'tatsiana')!;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>Monthly income by person and source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <PersonBadge person={tony} />
                <span className="text-lg font-bold">{formatCurrency(tonyIncome)}</span>
              </div>
              <div className="space-y-2 pl-10">
                {incomeSources
                  .filter((source) => source.personId === 'tony')
                  .map((source) => (
                    <div key={source.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{source.name}</span>
                      <span className="font-medium">{formatCurrency(source.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <PersonBadge person={tatsiana} />
                <span className="text-lg font-bold">{formatCurrency(tatsianaIncome)}</span>
              </div>
              <div className="space-y-2 pl-10">
                {incomeSources
                  .filter((source) => source.personId === 'tatsiana')
                  .map((source) => (
                    <div key={source.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{source.name}</span>
                      <span className="font-medium">{formatCurrency(source.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-primary">
              <span className="text-lg font-bold">Total Household Income</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
