'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonBadge } from './person-badge';
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Person = Database['public']['Tables']['persons']['Row'];
type IncomeSource = Database['public']['Tables']['income_sources']['Row'];

interface PersonWithIncome extends Person {
  income: number;
  sources: IncomeSource[];
}

export function IncomeBreakdown({ householdId }: { householdId: string }) {
  const [persons, setPersons] = useState<PersonWithIncome[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch persons
      const { data: personsData, error: personsError } = await supabase
        .from('persons')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at');

      if (personsError) {
        console.error('Error fetching persons:', personsError);
        setLoading(false);
        return;
      }

      // Fetch income sources for all persons
      const personsWithIncome: PersonWithIncome[] = await Promise.all(
        (personsData || []).map(async (person) => {
          const { data: sources, error: sourcesError } = await supabase
            .from('income_sources')
            .select('*')
            .eq('person_id', person.id)
            .eq('is_active', true);

          if (sourcesError) {
            console.error('Error fetching income sources:', sourcesError);
            return { ...person, income: 0, sources: [] };
          }

          // Calculate monthly income
          const income = (sources || []).reduce((sum, source) => {
            if (source.frequency === 'monthly') return sum + source.amount;
            if (source.frequency === 'weekly') return sum + (source.amount * 52 / 12);
            return sum;
          }, 0);

          return { ...person, income, sources: sources || [] };
        })
      );

      const total = personsWithIncome.reduce((sum, p) => sum + p.income, 0);

      setPersons(personsWithIncome);
      setTotalIncome(total);
      setLoading(false);
    }

    fetchData();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Breakdown</CardTitle>
          <CardDescription>Monthly income by person and source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading income data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = persons.map((person) => ({
    name: person.name,
    value: person.income,
    color: person.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>Monthly income by person and source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {persons.map((person) => (
              <div key={person.id} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <PersonBadge person={person} />
                  <span className="text-lg font-bold">{formatCurrency(person.income)}</span>
                </div>
                <div className="space-y-2 pl-10">
                  {person.sources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{source.name}</span>
                      <span className="font-medium">{formatCurrency(source.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

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
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value) || 0)}
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
