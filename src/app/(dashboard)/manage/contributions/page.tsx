'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Scale, Save, Loader2, Info } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']
type ContributionConfig = Database['public']['Tables']['contribution_config']['Row']
type IncomeSource = Database['public']['Tables']['income_sources']['Row']

interface PersonConfig {
  person: Person
  config?: ContributionConfig
  totalIncome: number
  incomePercentage: number
}

export default function ContributionsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [personConfigs, setPersonConfigs] = useState<PersonConfig[]>([])
  const [jointTarget, setJointTarget] = useState(5000)

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

    // Fetch persons
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('*')
      .eq('household_id', hId)
      .order('created_at')

    if (personsError) {
      console.error('Error fetching persons:', personsError)
      setLoading(false)
      return
    }

    // Fetch contribution configs
    const { data: configs } = await supabase
      .from('contribution_config')
      .select('*')
      .eq('household_id', hId)

    // Fetch income sources to calculate percentages
    const personConfigsData: PersonConfig[] = await Promise.all(
      (persons || []).map(async (person) => {
        const { data: incomeSources } = await supabase
          .from('income_sources')
          .select('*')
          .eq('person_id', person.id)
          .eq('is_active', true)

        const totalIncome = (incomeSources || []).reduce((sum, source) => {
          if (source.frequency === 'monthly') return sum + source.amount
          if (source.frequency === 'weekly') return sum + (source.amount * 52 / 12)
          return sum
        }, 0)

        const config = configs?.find(c => c.person_id === person.id)
        
        return {
          person,
          config,
          totalIncome,
          incomePercentage: 0, // Will be calculated after we have all incomes
        }
      })
    )

    // Calculate income percentages
    const totalHouseholdIncome = personConfigsData.reduce((sum, p) => sum + p.totalIncome, 0)
    personConfigsData.forEach(pc => {
      pc.incomePercentage = totalHouseholdIncome > 0
        ? Math.round((pc.totalIncome / totalHouseholdIncome) * 100)
        : 0
    })

    // Set joint target from first config if available
    if (configs && configs.length > 0 && configs[0].joint_contribution_target) {
      setJointTarget(configs[0].joint_contribution_target)
    }

    setPersonConfigs(personConfigsData)
    setLoading(false)
  }

  function updatePersonConfig(personId: string, updates: Partial<{
    is_percentage_based: boolean
    expected_percentage: number | null
    fixed_amount: number | null
  }>) {
    setPersonConfigs(prev => prev.map(pc => {
      if (pc.person.id !== personId) return pc
      return {
        ...pc,
        config: {
          ...(pc.config || {
            id: '',
            household_id: householdId!,
            person_id: personId,
            is_percentage_based: true,
            expected_percentage: pc.incomePercentage,
            fixed_amount: null,
            joint_contribution_target: jointTarget,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
          ...updates,
        } as ContributionConfig,
      }
    }))
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const errors: string[] = []

    for (const pc of personConfigs) {
      const configData = {
        household_id: householdId,
        person_id: pc.person.id,
        is_percentage_based: pc.config?.is_percentage_based ?? true,
        expected_percentage: pc.config?.expected_percentage ?? pc.incomePercentage,
        fixed_amount: pc.config?.fixed_amount ?? null,
        joint_contribution_target: jointTarget,
      }

      const { error } = await supabase
        .from('contribution_config')
        .upsert(configData, { onConflict: 'household_id,person_id' })

      if (error) {
        console.error('Error saving config for', pc.person.name, error)
        errors.push(pc.person.name)
      }
    }

    if (errors.length > 0) {
      alert(`Failed to save configuration for: ${errors.join(', ')}`)
    } else {
      alert('Contribution configuration saved successfully!')
      fetchData()
    }

    setSaving(false)
  }

  function calculateExpectedContribution(pc: PersonConfig): number {
    const isPercentage = pc.config?.is_percentage_based ?? true
    
    if (isPercentage) {
      const percentage = pc.config?.expected_percentage ?? pc.incomePercentage
      return (jointTarget * percentage) / 100
    } else {
      return pc.config?.fixed_amount ?? 0
    }
  }

  const totalExpected = personConfigs.reduce((sum, pc) => sum + calculateExpectedContribution(pc), 0)

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
          <Scale className="h-6 w-6" />
          Contribution Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure how each household member contributes to joint expenses
        </p>
      </div>

      {/* Joint Target */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Joint Contribution Target</CardTitle>
          <CardDescription>
            The total monthly amount the household needs to contribute to joint expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="joint_target">Monthly Joint Target</Label>
            <Input
              id="joint_target"
              type="number"
              min={0}
              step={100}
              value={jointTarget}
              onChange={(e) => setJointTarget(parseFloat(e.target.value) || 0)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              This amount will be split between household members based on their configuration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">How contributions work:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li><strong>Percentage-based:</strong> Each person contributes a % of the joint target based on their income ratio</li>
              <li><strong>Fixed amount:</strong> Each person contributes a specific amount regardless of income</li>
              <li>The income percentages shown are calculated from active income sources</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Person Configurations */}
      <div className="grid gap-4">
        {personConfigs.map((pc) => {
          const isPercentage = pc.config?.is_percentage_based ?? true
          const expectedAmount = calculateExpectedContribution(pc)

          return (
            <Card key={pc.person.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: pc.person.color }}
                    >
                      {pc.person.avatar || pc.person.initials}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pc.person.name}</CardTitle>
                      <CardDescription>
                        Income: {formatCurrency(pc.totalIncome)}/month ({pc.incomePercentage}% of household)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Expected contribution</p>
                    <p className="text-xl font-bold">{formatCurrency(expectedAmount)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Contribution Method</Label>
                    <p className="text-xs text-muted-foreground">
                      {isPercentage
                        ? 'Based on income percentage'
                        : 'Fixed monthly amount'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm', !isPercentage && 'text-muted-foreground')}>
                      Percentage
                    </span>
                    <Switch
                      checked={!isPercentage}
                      onCheckedChange={(checked) =>
                        updatePersonConfig(pc.person.id, { is_percentage_based: !checked })
                      }
                    />
                    <span className={cn('text-sm', isPercentage && 'text-muted-foreground')}>
                      Fixed
                    </span>
                  </div>
                </div>

                {isPercentage ? (
                  <div className="space-y-2">
                    <Label htmlFor={`percentage-${pc.person.id}`}>
                      Contribution Percentage
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`percentage-${pc.person.id}`}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={pc.config?.expected_percentage ?? pc.incomePercentage}
                        onChange={(e) =>
                          updatePersonConfig(pc.person.id, {
                            expected_percentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updatePersonConfig(pc.person.id, {
                            expected_percentage: pc.incomePercentage,
                          })
                        }
                      >
                        Use income ratio ({pc.incomePercentage}%)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`fixed-${pc.person.id}`}>
                      Fixed Monthly Amount
                    </Label>
                    <Input
                      id={`fixed-${pc.person.id}`}
                      type="number"
                      min={0}
                      step={10}
                      value={pc.config?.fixed_amount ?? 0}
                      onChange={(e) =>
                        updatePersonConfig(pc.person.id, {
                          fixed_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary */}
      <Card className={cn(
        totalExpected !== jointTarget && 'border-amber-200 dark:border-amber-800'
      )}>
        <CardHeader>
          <CardTitle className="text-lg">Contribution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total expected contributions</p>
              <p className={cn(
                'text-2xl font-bold',
                totalExpected !== jointTarget && 'text-amber-500'
              )}>
                {formatCurrency(totalExpected)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Joint target</p>
              <p className="text-2xl font-bold">{formatCurrency(jointTarget)}</p>
            </div>
          </div>
          {totalExpected !== jointTarget && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              ⚠️ Total contributions ({formatCurrency(totalExpected)}) don't match the joint target ({formatCurrency(jointTarget)})
            </p>
          )}
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
              Save Contribution Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
