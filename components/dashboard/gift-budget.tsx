'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { Gift, Calendar, Heart, Users, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type GiftRecipient = Database['public']['Tables']['gift_recipients']['Row'];

export function GiftBudget({ householdId }: { householdId: string }) {
  const [recipients, setRecipients] = useState<GiftRecipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('gift_recipients')
        .select('*')
        .eq('household_id', householdId)
        .order('occasion_date');

      if (error) {
        console.error('Error fetching gift recipients:', error);
        setLoading(false);
        return;
      }

      setRecipients(data || []);
      setLoading(false);
    }

    fetchData();
  }, [householdId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gift Budget Tracker
          </CardTitle>
          <CardDescription>Plan ahead for birthdays, holidays, and special occasions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading gift budget...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBudget = recipients.reduce((sum, r) => sum + r.budgeted, 0);
  const totalSpent = recipients.reduce((sum, r) => sum + r.spent, 0);
  const remaining = totalBudget - totalSpent;

  // Get next 5 upcoming occasions
  const today = new Date();
  const nextOccasions = recipients
    .filter(r => new Date(r.occasion_date) >= today)
    .slice(0, 5);

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    const occasion = new Date(date);
    const diffTime = occasion.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil < 30) return 'bg-red-500';
    if (daysUntil < 60) return 'bg-orange-500';
    if (daysUntil < 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Gift Budget Tracker
            </CardTitle>
            <CardDescription>Plan ahead for birthdays, holidays, and special occasions</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(remaining)} remaining</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Occasions
            </h3>
            <div className="space-y-3">
              {nextOccasions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming occasions</p>
                </div>
              ) : (
                nextOccasions.map((recipient) => {
                  const daysUntil = getDaysUntil(recipient.occasion_date);
                  const progress = calculateProgress(recipient.spent, recipient.budgeted);
                  const occasionDate = new Date(recipient.occasion_date);

                  return (
                    <div key={recipient.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{recipient.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {recipient.relationship === 'family' ? (
                                <Heart className="h-3 w-3 mr-1" />
                              ) : (
                                <Users className="h-3 w-3 mr-1" />
                              )}
                              {recipient.relationship}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{recipient.occasion}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {occasionDate.toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            <Badge className={getUrgencyColor(daysUntil)}>{daysUntil} days</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(recipient.budgeted)}</p>
                          {recipient.spent > 0 && (
                            <p className="text-sm text-green-600">
                              {formatCurrency(recipient.spent)} spent
                            </p>
                          )}
                        </div>
                      </div>

                      {recipient.spent > 0 && (
                        <div className="mb-3">
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {recipient.ideas && recipient.ideas.length > 0 && (
                        <div className="mt-3 p-3 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-3 w-3 text-yellow-600" />
                            <p className="text-xs font-semibold text-muted-foreground">Gift Ideas</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {recipient.ideas.map((idea, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {idea}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border border-pink-200 dark:border-pink-800">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400 mb-2" />
              <p className="text-sm font-medium text-pink-900 dark:text-pink-100">Family Gifts</p>
              <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
                {formatCurrency(
                  recipients
                    .filter((r) => r.relationship === 'family')
                    .reduce((sum, r) => sum + r.budgeted, 0)
                )}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Friends Gifts</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(
                  recipients
                    .filter((r) => r.relationship === 'friend')
                    .reduce((sum, r) => sum + r.budgeted, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
