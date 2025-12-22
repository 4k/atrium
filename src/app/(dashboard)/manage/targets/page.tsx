'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Save, Loader2, TrendingUp, PiggyBank, Award, Flag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type MonthlyTargetsConfig = Database['public']['Tables']['monthly_targets_config']['Row']

export default function TargetsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [config, setConfig] = useState<MonthlyTargetsConfig | null>(null)

  const [formData, setFormData] = useState({
    income_target: 10000,
    savings_rate_target: 25,
    budget_adherence_target: 100,
    next_milestone_name: 'Emergency Fund Goal',
    next_milestone_target: 15000,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const hId = user.user_metadata?.household_id
    if (!hId) return
    
    setHouseholdId(hId)

    const { data, error } = await supabase
      .from('monthly_targets_config')
      .select('*')
      .eq('household_id', hId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching targets config:', error)
    }

    if (data) {
      setConfig(data)
      setFormData({
        income_target: data.income_target,
        savings_rate_target: data.savings_rate_target,
        budget_adherence_target: data.budget_adherence_target,
        next_milestone_name: data.next_milestone_name || '',
        next_milestone_target: data.next_milestone_target || 0,
      })
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const configData = {
      household_id: householdId,
      income_target: formData.income_target,
      savings_rate_target: formData.savings_rate_target,
      budget_adherence_target: formData.budget_adherence_target,
      next_milestone_name: formData.next_milestone_name || null,
      next_milestone_target: formData.next_milestone_target || null,
    }

    const { error } = await supabase
      .from('monthly_targets_config')
      .upsert(configData, { onConflict: 'household_id' })

    if (error) {
      console.error('Error saving targets config:', error)
      alert('Failed to save targets configuration')
    } else {
      alert('Targets configuration saved successfully!')
      fetchData()
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Monthly Targets
        </h1>
        <p className="text-muted-foreground">
          Configure your financial goals and targets
        </p>
      </div>

      <div className="grid gap-6">
        {/* Income Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Income Target
            </CardTitle>
            <CardDescription>
              Set your monthly household income goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="income_target">Target Monthly Income</Label>
              <Input
                id="income_target"
                type="number"
                min={0}
                step={100}
                value={formData.income_target}
                onChange={(e) => setFormData({ ...formData, income_target: parseFloat(e.target.value) || 0 })}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Your combined household income goal for each month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Savings Rate Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PiggyBank className="h-5 w-5 text-blue-500" />
              Savings Rate Target
            </CardTitle>
            <CardDescription>
              What percentage of income should be saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="savings_rate_target">Target Savings Rate (%)</Label>
              <Input
                id="savings_rate_target"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.savings_rate_target}
                onChange={(e) => setFormData({ ...formData, savings_rate_target: parseFloat(e.target.value) || 0 })}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Common targets: 20% (standard), 50% (aggressive), 70% (FIRE)
              </p>
            </div>
            {formData.income_target > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  At {formData.savings_rate_target}% savings rate with {formatCurrency(formData.income_target)} income:
                </p>
                <p className="text-lg font-semibold text-blue-500">
                  {formatCurrency((formData.income_target * formData.savings_rate_target) / 100)} / month saved
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Adherence Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-purple-500" />
              Budget Adherence Target
            </CardTitle>
            <CardDescription>
              Target score for staying within budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="budget_adherence_target">Target Adherence (%)</Label>
              <Input
                id="budget_adherence_target"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.budget_adherence_target}
                onChange={(e) => setFormData({ ...formData, budget_adherence_target: parseFloat(e.target.value) || 0 })}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                100% means staying exactly on budget, 95% allows some flexibility
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flag className="h-5 w-5 text-amber-500" />
              Next Milestone
            </CardTitle>
            <CardDescription>
              Set a specific savings milestone you're working towards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="next_milestone_name">Milestone Name</Label>
              <Input
                id="next_milestone_name"
                value={formData.next_milestone_name}
                onChange={(e) => setFormData({ ...formData, next_milestone_name: e.target.value })}
                placeholder="e.g., Emergency Fund Goal, Down Payment"
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_milestone_target">Target Amount</Label>
              <Input
                id="next_milestone_target"
                type="number"
                min={0}
                step={100}
                value={formData.next_milestone_target}
                onChange={(e) => setFormData({ ...formData, next_milestone_target: parseFloat(e.target.value) || 0 })}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on your dashboard as your current goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Targets Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
