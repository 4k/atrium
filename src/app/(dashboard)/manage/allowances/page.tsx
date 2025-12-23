'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Coins, Save, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Person = Database['public']['Tables']['persons']['Row']
type PersonalAllowanceConfig = Database['public']['Tables']['personal_allowance_config']['Row']

interface PersonAllowance {
  person: Person
  config?: PersonalAllowanceConfig
}

export default function AllowancesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [personAllowances, setPersonAllowances] = useState<PersonAllowance[]>([])

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

    // Fetch allowance configs
    const allowanceData: PersonAllowance[] = await Promise.all(
      (persons || []).map(async (person) => {
        const { data: config } = await supabase
          .from('personal_allowance_config')
          .select('*')
          .eq('person_id', person.id)
          .maybeSingle()

        return {
          person,
          config: config || undefined,
        }
      })
    )

    setPersonAllowances(allowanceData)
    setLoading(false)
  }

  function updateConfig(personId: string, updates: Partial<{
    default_monthly_amount: number
    allow_rollover: boolean
    allow_borrowing: boolean
    max_borrow_amount: number | null
  }>) {
    setPersonAllowances(prev => prev.map(pa => {
      if (pa.person.id !== personId) return pa
      return {
        ...pa,
        config: {
          ...(pa.config || {
            id: '',
            person_id: personId,
            default_monthly_amount: 200,
            allow_rollover: true,
            allow_borrowing: true,
            max_borrow_amount: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
          ...updates,
        } as PersonalAllowanceConfig,
      }
    }))
  }

  async function handleSave() {
    if (!householdId) return
    setSaving(true)
    const supabase = createClient()

    const errors: string[] = []

    for (const pa of personAllowances) {
      const configData = {
        person_id: pa.person.id,
        default_monthly_amount: pa.config?.default_monthly_amount ?? 200,
        allow_rollover: pa.config?.allow_rollover ?? true,
        allow_borrowing: pa.config?.allow_borrowing ?? true,
        max_borrow_amount: pa.config?.max_borrow_amount ?? 100,
      }

      const { error } = await supabase
        .from('personal_allowance_config')
        .upsert(configData, { onConflict: 'person_id' })

      if (error) {
        console.error('Error saving config for', pa.person.name, error)
        errors.push(pa.person.name)
      }
    }

    if (errors.length > 0) {
      alert(`Failed to save configuration for: ${errors.join(', ')}`)
    } else {
      alert('Allowance configuration saved successfully!')
      fetchData()
    }

    setSaving(false)
  }

  const totalAllowances = personAllowances.reduce(
    (sum, pa) => sum + (pa.config?.default_monthly_amount ?? 200),
    0
  )

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
          <Coins className="h-6 w-6" />
          Personal Allowances
        </h1>
        <p className="text-muted-foreground">
          Configure monthly "fun money" for each household member
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Monthly Allowances</CardTitle>
          <CardDescription>
            Combined personal spending budget for the household
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(totalAllowances)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {personAllowances.length} member{personAllowances.length !== 1 ? 's' : ''} × allowance per person
          </p>
        </CardContent>
      </Card>

      {/* Person Configurations */}
      <div className="grid gap-6">
        {personAllowances.map((pa) => {
          const config = pa.config || {
            default_monthly_amount: 200,
            allow_rollover: true,
            allow_borrowing: true,
            max_borrow_amount: 100,
          }

          return (
            <Card key={pa.person.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ backgroundColor: pa.person.color }}
                  >
                    {pa.person.avatar || pa.person.initials}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pa.person.name}</CardTitle>
                    <CardDescription>Personal allowance settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly Amount */}
                <div className="space-y-2">
                  <Label htmlFor={`amount-${pa.person.id}`}>Monthly Allowance Amount</Label>
                  <Input
                    id={`amount-${pa.person.id}`}
                    type="number"
                    min={0}
                    step={10}
                    value={config.default_monthly_amount}
                    onChange={(e) =>
                      updateConfig(pa.person.id, {
                        default_monthly_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    This amount is allocated each month for personal spending
                  </p>
                </div>

                {/* Rollover Setting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Rollover</Label>
                    <p className="text-xs text-muted-foreground">
                      Unspent allowance carries over to the next month
                    </p>
                  </div>
                  <Switch
                    checked={config.allow_rollover}
                    onCheckedChange={(checked) =>
                      updateConfig(pa.person.id, { allow_rollover: checked })
                    }
                  />
                </div>

                {/* Borrowing Setting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Borrowing</Label>
                    <p className="text-xs text-muted-foreground">
                      Can borrow from next month's allowance if overspending
                    </p>
                  </div>
                  <Switch
                    checked={config.allow_borrowing}
                    onCheckedChange={(checked) =>
                      updateConfig(pa.person.id, { allow_borrowing: checked })
                    }
                  />
                </div>

                {/* Max Borrow Amount */}
                {config.allow_borrowing && (
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor={`max-borrow-${pa.person.id}`}>
                      Maximum Borrow Amount
                    </Label>
                    <Input
                      id={`max-borrow-${pa.person.id}`}
                      type="number"
                      min={0}
                      step={10}
                      value={config.max_borrow_amount || 0}
                      onChange={(e) =>
                        updateConfig(pa.person.id, {
                          max_borrow_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum amount that can be borrowed from next month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Personal Allowances Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Each person gets their allowance at the start of each month
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Personal spending is tracked separately from household budgets
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              If rollover is enabled, unspent money carries to next month
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              If borrowing is enabled, overspending reduces next month's allowance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              No category tracking for privacy - it's personal "fun money"
            </li>
          </ul>
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
              Save Allowance Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
