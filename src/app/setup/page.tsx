'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, UserPlus, Wallet } from 'lucide-react';

export default function SetupPage() {
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({ name: householdName || 'My Household' })
        .select()
        .single();

      if (householdError) throw householdError;

      // Update user metadata with household_id
      const { error: updateError } = await supabase.auth.updateUser({
        data: { household_id: household.id }
      });

      if (updateError) throw updateError;

      // Refresh the session to get updated JWT with new household_id
      await supabase.auth.refreshSession();

      // Create default household settings using browser client
      await supabase.from('household_settings').upsert({
        household_id: household.id,
        household_name: householdName || 'My Household',
        currency: 'EUR',
        locale: 'de-DE',
        timezone: 'Europe/Berlin',
        financial_year_start_month: 1,
        budget_cycle: 'monthly',
        budget_threshold_under: 80,
        budget_threshold_near: 95,
        bill_alert_days_before: 3,
        bill_overdue_alert_enabled: true,
        default_savings_target_percentage: 20,
        emergency_fund_months: 6,
      }, { onConflict: 'household_id' });

      // Create default user preferences using browser client
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        household_id: household.id,
        theme: 'dark',
        compact_view: false,
        show_budget_percentages: true,
        show_income_breakdown: true,
        default_dashboard_tab: 'overview',
        email_notifications_enabled: true,
        bill_reminders_enabled: true,
        budget_alerts_enabled: true,
        savings_goal_alerts_enabled: true,
        decimal_places: 2,
        use_compact_numbers: false,
      }, { onConflict: 'user_id,household_id' });

      // Create default component visibility (all visible) using browser client
      await supabase.from('component_visibility').upsert({
        user_id: user.id,
        household_id: household.id,
        show_account_summary: true,
        show_income_breakdown: true,
        show_budget_tracker: true,
        show_savings_goals: true,
        show_monthly_targets: true,
        show_upcoming_bills: true,
        show_child_expenses: true,
        show_gift_budget: true,
        show_travel_budget: true,
        show_pockets_overview: true,
        show_contribution_tracker: true,
        show_personal_allowance: true,
        show_sinking_funds: true,
        show_couple_scorecard: true,
        show_money_flow: true,
      }, { onConflict: 'user_id,household_id' });

      // Create the user as the first household member (person)
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Me';
      const userInitials = userName.substring(0, 2).toUpperCase();
      
      const { data: person } = await supabase.from('persons').insert({
        household_id: household.id,
        name: userName,
        initials: userInitials,
        color: '#3b82f6', // Default blue
        email: user.email,
        payday: 1, // Default to 1st of month
      }).select().single();

      // Add user to household_access as admin
      await supabase.from('household_access').insert({
        household_id: household.id,
        user_email: user.email!,
        user_id: user.id,
        role: 'admin',
        is_active: true,
        linked_person_id: person?.id || null,
      });

      // Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to create household');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // TODO: Implement invite code validation and household joining
      // For now, just show a message
      setError('Invite code feature coming soon! Please create a new household for now.');
    } catch (error: any) {
      setError(error.message || 'Failed to join household');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <div className="w-full max-w-2xl p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent/80 mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Family Budget</h1>
          <p className="text-muted-foreground text-sm mt-2">Let's set up your household</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Household Setup</CardTitle>
            <CardDescription>
              Create a new household or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">
                  <Home className="h-4 w-4 mr-2" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="join">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Existing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="householdName">Household Name</Label>
                    <Input
                      id="householdName"
                      type="text"
                      placeholder="The Smith Family"
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how your household will be identified
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Household'}
                  </Button>
                </form>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ul className="space-y-1">
                    <li>• You'll be the owner of this household</li>
                    <li>• You can invite other members later</li>
                    <li>• All household members will share the same budget data</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleJoinHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter invite code from household owner"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask the household owner for an invite code
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Joining...' : 'Join Household'}
                  </Button>
                </form>

                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs">
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Invite codes feature coming soon! For now, please create a new household.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
