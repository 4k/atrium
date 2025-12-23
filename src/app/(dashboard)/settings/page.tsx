'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type {
  HouseholdSettingsFormData,
  UserPreferencesFormData,
  ComponentVisibility,
  BudgetCycle,
  Theme
} from '@/lib/types'
import {
  Settings,
  Home,
  User,
  Bell,
  Eye,
  DollarSign,
  Palette,
  Save,
  Loader2,
  UserPlus,
  Trash2,
  Shield,
  Link as LinkIcon
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/lib/supabase/database.types'

type HouseholdAccess = Database['public']['Tables']['household_access']['Row']
type Person = Database['public']['Tables']['persons']['Row']

// Default settings values
const defaultHouseholdSettings = {
  currency: 'EUR',
  locale: 'de-DE',
  timezone: 'Europe/Berlin',
  financial_year_start_month: 1,
  budget_cycle: 'monthly' as const,
  budget_threshold_under: 80,
  budget_threshold_near: 95,
  bill_alert_days_before: 3,
  bill_overdue_alert_enabled: true,
  default_savings_target_percentage: 20,
  emergency_fund_months: 6,
}

const defaultUserPreferences = {
  theme: 'dark' as const,
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
}

const defaultComponentVisibility = {
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
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [householdId, setHouseholdId] = useState<string | null>(null)

  // Settings state
  const [householdSettings, setHouseholdSettings] = useState<HouseholdSettingsFormData>({
    household_name: '',
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
  })

  const [userPreferences, setUserPreferences] = useState<UserPreferencesFormData>({
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
  })

  const [componentVisibility, setComponentVisibility] = useState({
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
  })

  // Access management state
  const [accessList, setAccessList] = useState<(HouseholdAccess & { linked_person?: Person })[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [newAccessEmail, setNewAccessEmail] = useState('')
  const [newAccessRole, setNewAccessRole] = useState<'admin' | 'editor' | 'viewer'>('viewer')
  const [newAccessLinkedPerson, setNewAccessLinkedPerson] = useState<string | null>(null)
  const [savingAccess, setSavingAccess] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient()
        
        // Refresh session to ensure JWT has latest user_metadata
        await supabase.auth.refreshSession()
        
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)
        const houseId = user.user_metadata?.household_id

        // If user doesn't have a household, redirect to setup
        if (!houseId) {
          console.log('No household_id found, redirecting to setup')
          router.push('/setup')
          return
        }

        setHouseholdId(houseId)

        // Load household name from households table and settings from settings tables
        const [householdNameResult, householdSettingsResult, preferencesResult, visibilityResult] = await Promise.all([
          supabase.from('households').select('name').eq('id', houseId).maybeSingle(),
          supabase.from('household_settings').select('*').eq('household_id', houseId).maybeSingle(),
          supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('component_visibility').select('*').eq('user_id', user.id).maybeSingle(),
        ])

        const householdName = householdNameResult.data?.name || ''
        const householdSettingsData = householdSettingsResult.data
        const preferences = preferencesResult.data
        const visibility = visibilityResult.data

        // Set household settings - use data from DB or defaults with household name
        if (householdSettingsData) {
          setHouseholdSettings({
            household_name: householdSettingsData.household_name || householdName,
            currency: householdSettingsData.currency,
            locale: householdSettingsData.locale,
            timezone: householdSettingsData.timezone,
            financial_year_start_month: householdSettingsData.financial_year_start_month,
            budget_cycle: householdSettingsData.budget_cycle as BudgetCycle,
            budget_threshold_under: householdSettingsData.budget_threshold_under,
            budget_threshold_near: householdSettingsData.budget_threshold_near,
            bill_alert_days_before: householdSettingsData.bill_alert_days_before,
            bill_overdue_alert_enabled: householdSettingsData.bill_overdue_alert_enabled,
            default_savings_target_percentage: householdSettingsData.default_savings_target_percentage,
            emergency_fund_months: householdSettingsData.emergency_fund_months,
          })
        } else {
          // No settings record yet - use defaults with household name from households table
          setHouseholdSettings(prev => ({
            ...prev,
            household_name: householdName,
          }))
        }

        if (preferences) {
          setUserPreferences({
            theme: preferences.theme as Theme,
            compact_view: preferences.compact_view,
            show_budget_percentages: preferences.show_budget_percentages,
            show_income_breakdown: preferences.show_income_breakdown,
            default_dashboard_tab: preferences.default_dashboard_tab,
            email_notifications_enabled: preferences.email_notifications_enabled,
            bill_reminders_enabled: preferences.bill_reminders_enabled,
            budget_alerts_enabled: preferences.budget_alerts_enabled,
            savings_goal_alerts_enabled: preferences.savings_goal_alerts_enabled,
            decimal_places: preferences.decimal_places,
            use_compact_numbers: preferences.use_compact_numbers,
          })
        }

        if (visibility) {
          setComponentVisibility({
            show_account_summary: visibility.show_account_summary,
            show_income_breakdown: visibility.show_income_breakdown,
            show_budget_tracker: visibility.show_budget_tracker,
            show_savings_goals: visibility.show_savings_goals,
            show_monthly_targets: visibility.show_monthly_targets,
            show_upcoming_bills: visibility.show_upcoming_bills,
            show_child_expenses: visibility.show_child_expenses,
            show_gift_budget: visibility.show_gift_budget,
            show_travel_budget: visibility.show_travel_budget,
            show_pockets_overview: visibility.show_pockets_overview,
            show_contribution_tracker: visibility.show_contribution_tracker,
            show_personal_allowance: visibility.show_personal_allowance,
            show_sinking_funds: visibility.show_sinking_funds,
            show_couple_scorecard: visibility.show_couple_scorecard,
            show_money_flow: visibility.show_money_flow,
          })
        }

        // Load access list and persons for access management
        const [accessResult, personsResult] = await Promise.all([
          supabase.from('household_access').select('*, linked_person:linked_person_id(*)').eq('household_id', houseId),
          supabase.from('persons').select('*').eq('household_id', houseId).order('created_at'),
        ])

        if (accessResult.data) {
          setAccessList(accessResult.data as any)
        }
        if (personsResult.data) {
          setPersons(personsResult.data)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [router])

  const saveHouseholdSettings = async () => {
    if (!householdId) {
      alert('No household found. Please complete setup first.')
      router.push('/setup')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      
      // Refresh session to ensure JWT has latest user_metadata for RLS
      await supabase.auth.refreshSession()
      
      const { error } = await supabase
        .from('household_settings')
        .upsert(
          { household_id: householdId, ...householdSettings },
          { onConflict: 'household_id' }
        )
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message || 'Database error')
      }
      alert('Household settings saved successfully!')
    } catch (error: any) {
      console.error('Failed to save household settings:', error)
      alert(`Failed to save household settings: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const saveUserPreferences = async () => {
    if (!userId || !householdId) {
      alert('No household found. Please complete setup first.')
      router.push('/setup')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      
      // Refresh session to ensure JWT has latest user_metadata for RLS
      await supabase.auth.refreshSession()
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { user_id: userId, household_id: householdId, ...userPreferences },
          { onConflict: 'user_id,household_id' }
        )
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message || 'Database error')
      }
      alert('User preferences saved successfully!')
    } catch (error: any) {
      console.error('Failed to save user preferences:', error)
      alert(`Failed to save user preferences: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const saveComponentVisibility = async () => {
    if (!userId || !householdId) {
      alert('No household found. Please complete setup first.')
      router.push('/setup')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      
      // Refresh session to ensure JWT has latest user_metadata for RLS
      await supabase.auth.refreshSession()
      
      const { error } = await supabase
        .from('component_visibility')
        .upsert(
          { user_id: userId, household_id: householdId, ...componentVisibility },
          { onConflict: 'user_id,household_id' }
        )
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message || 'Database error')
      }
      alert('Component visibility saved successfully!')
    } catch (error: any) {
      console.error('Failed to save component visibility:', error)
      alert(`Failed to save component visibility: ${error.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const addAccess = async () => {
    if (!householdId || !newAccessEmail) return
    setSavingAccess(true)
    try {
      const supabase = createClient()
      await supabase.auth.refreshSession()
      
      const { error } = await supabase
        .from('household_access')
        .insert({
          household_id: householdId,
          user_email: newAccessEmail.toLowerCase().trim(),
          role: newAccessRole,
          linked_person_id: newAccessLinkedPerson || null,
        })

      if (error) {
        console.error('Error adding access:', error)
        alert(`Failed to add access: ${error.message}`)
      } else {
        alert('User access added successfully!')
        setNewAccessEmail('')
        setNewAccessRole('viewer')
        setNewAccessLinkedPerson(null)
        // Reload access list
        const { data } = await supabase
          .from('household_access')
          .select('*, linked_person:linked_person_id(*)')
          .eq('household_id', householdId)
        if (data) setAccessList(data as any)
      }
    } catch (error: any) {
      console.error('Failed to add access:', error)
      alert(`Failed to add access: ${error.message || 'Unknown error'}`)
    } finally {
      setSavingAccess(false)
    }
  }

  const updateAccessRole = async (accessId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const supabase = createClient()
    await supabase.auth.refreshSession()
    
    const { error } = await supabase
      .from('household_access')
      .update({ role: newRole })
      .eq('id', accessId)

    if (error) {
      console.error('Error updating role:', error)
      alert(`Failed to update role: ${error.message}`)
    } else {
      setAccessList(prev => prev.map(a => a.id === accessId ? { ...a, role: newRole } : a))
    }
  }

  const removeAccess = async (accessId: string) => {
    if (!confirm('Are you sure you want to remove this user\'s access?')) return
    
    const supabase = createClient()
    await supabase.auth.refreshSession()
    
    const { error } = await supabase
      .from('household_access')
      .delete()
      .eq('id', accessId)

    if (error) {
      console.error('Error removing access:', error)
      alert(`Failed to remove access: ${error.message}`)
    } else {
      setAccessList(prev => prev.filter(a => a.id !== accessId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your household and personal preferences
        </p>
      </div>

      <Tabs defaultValue="household" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="household">
            <Home className="h-4 w-4 mr-2" />
            Household
          </TabsTrigger>
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <Eye className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="access">
            <Shield className="h-4 w-4 mr-2" />
            Access
          </TabsTrigger>
        </TabsList>

        {/* Household Settings */}
        <TabsContent value="household" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure general household settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="household-name">Household Name</Label>
                <Input
                  id="household-name"
                  value={householdSettings.household_name}
                  onChange={(e) =>
                    setHouseholdSettings({ ...householdSettings, household_name: e.target.value })
                  }
                  placeholder="My Household"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={householdSettings.currency}
                    onValueChange={(value) =>
                      setHouseholdSettings({ ...householdSettings, currency: value })
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CHF">CHF (Fr)</SelectItem>
                      <SelectItem value="PLN">PLN (zł)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Select
                    value={householdSettings.locale}
                    onValueChange={(value) =>
                      setHouseholdSettings({ ...householdSettings, locale: value })
                    }
                  >
                    <SelectTrigger id="locale">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de-DE">German (de-DE)</SelectItem>
                      <SelectItem value="en-US">English US (en-US)</SelectItem>
                      <SelectItem value="en-GB">English UK (en-GB)</SelectItem>
                      <SelectItem value="fr-FR">French (fr-FR)</SelectItem>
                      <SelectItem value="pl-PL">Polish (pl-PL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={householdSettings.timezone}
                  onValueChange={(value) =>
                    setHouseholdSettings({ ...householdSettings, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                    <SelectItem value="America/New_York">America/New York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Settings
              </CardTitle>
              <CardDescription>
                Configure financial year and budget settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="financial-year">Financial Year Start Month</Label>
                  <Select
                    value={householdSettings.financial_year_start_month.toString()}
                    onValueChange={(value) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        financial_year_start_month: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="financial-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-cycle">Budget Cycle</Label>
                  <Select
                    value={householdSettings.budget_cycle}
                    onValueChange={(value: BudgetCycle) =>
                      setHouseholdSettings({ ...householdSettings, budget_cycle: value })
                    }
                  >
                    <SelectTrigger id="budget-cycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold-under">Budget Threshold - Under (%)</Label>
                  <Input
                    id="threshold-under"
                    type="number"
                    min="0"
                    max="100"
                    value={householdSettings.budget_threshold_under}
                    onChange={(e) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        budget_threshold_under: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold-near">Budget Threshold - Near (%)</Label>
                  <Input
                    id="threshold-near"
                    type="number"
                    min="0"
                    max="100"
                    value={householdSettings.budget_threshold_near}
                    onChange={(e) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        budget_threshold_near: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="savings-target">Default Savings Target (%)</Label>
                  <Input
                    id="savings-target"
                    type="number"
                    min="0"
                    max="100"
                    value={householdSettings.default_savings_target_percentage}
                    onChange={(e) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        default_savings_target_percentage: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-fund">Emergency Fund (Months)</Label>
                  <Input
                    id="emergency-fund"
                    type="number"
                    min="0"
                    value={householdSettings.emergency_fund_months}
                    onChange={(e) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        emergency_fund_months: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-alert">Bill Alert (Days Before)</Label>
                  <Input
                    id="bill-alert"
                    type="number"
                    min="0"
                    value={householdSettings.bill_alert_days_before}
                    onChange={(e) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        bill_alert_days_before: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="bill-overdue-alert"
                    checked={householdSettings.bill_overdue_alert_enabled}
                    onCheckedChange={(checked) =>
                      setHouseholdSettings({
                        ...householdSettings,
                        bill_overdue_alert_enabled: checked,
                      })
                    }
                  />
                  <Label htmlFor="bill-overdue-alert">Enable Overdue Alerts</Label>
                </div>
              </div>

              <Button onClick={saveHouseholdSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Household Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Preferences */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize your personal display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={userPreferences.theme}
                  onValueChange={(value: Theme) =>
                    setUserPreferences({ ...userPreferences, theme: value })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tab">Default Dashboard Tab</Label>
                <Select
                  value={userPreferences.default_dashboard_tab}
                  onValueChange={(value) =>
                    setUserPreferences({ ...userPreferences, default_dashboard_tab: value })
                  }
                >
                  <SelectTrigger id="default-tab">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="pockets">Pockets</SelectItem>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="bills">Bills</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="gifts">Gifts</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="targets">Targets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decimal-places">Decimal Places</Label>
                  <Select
                    value={userPreferences.decimal_places.toString()}
                    onValueChange={(value) =>
                      setUserPreferences({
                        ...userPreferences,
                        decimal_places: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="decimal-places">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for a more condensed layout
                    </p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={userPreferences.compact_view}
                    onCheckedChange={(checked) =>
                      setUserPreferences({ ...userPreferences, compact_view: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-percentages">Show Budget Percentages</Label>
                    <p className="text-sm text-muted-foreground">
                      Display budget usage as percentages
                    </p>
                  </div>
                  <Switch
                    id="budget-percentages"
                    checked={userPreferences.show_budget_percentages}
                    onCheckedChange={(checked) =>
                      setUserPreferences({ ...userPreferences, show_budget_percentages: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="income-breakdown">Show Income Breakdown</Label>
                    <p className="text-sm text-muted-foreground">
                      Display detailed income breakdown
                    </p>
                  </div>
                  <Switch
                    id="income-breakdown"
                    checked={userPreferences.show_income_breakdown}
                    onCheckedChange={(checked) =>
                      setUserPreferences({ ...userPreferences, show_income_breakdown: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-numbers">Use Compact Numbers</Label>
                    <p className="text-sm text-muted-foreground">
                      Show large numbers as 1.5K, 2.3M, etc.
                    </p>
                  </div>
                  <Switch
                    id="compact-numbers"
                    checked={userPreferences.use_compact_numbers}
                    onCheckedChange={(checked) =>
                      setUserPreferences({ ...userPreferences, use_compact_numbers: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveUserPreferences} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Personal Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={userPreferences.email_notifications_enabled}
                  onCheckedChange={(checked) =>
                    setUserPreferences({ ...userPreferences, email_notifications_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bill-reminders">Bill Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming bills
                  </p>
                </div>
                <Switch
                  id="bill-reminders"
                  checked={userPreferences.bill_reminders_enabled}
                  onCheckedChange={(checked) =>
                    setUserPreferences({ ...userPreferences, bill_reminders_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts when approaching budget limits
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={userPreferences.budget_alerts_enabled}
                  onCheckedChange={(checked) =>
                    setUserPreferences({ ...userPreferences, budget_alerts_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="savings-goal-alerts">Savings Goal Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for savings milestones
                  </p>
                </div>
                <Switch
                  id="savings-goal-alerts"
                  checked={userPreferences.savings_goal_alerts_enabled}
                  onCheckedChange={(checked) =>
                    setUserPreferences({
                      ...userPreferences,
                      savings_goal_alerts_enabled: checked,
                    })
                  }
                />
              </div>

              <Button onClick={saveUserPreferences} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Visibility */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dashboard Components
              </CardTitle>
              <CardDescription>
                Choose which components to display on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-account-summary">Account Summary</Label>
                  <Switch
                    id="show-account-summary"
                    checked={componentVisibility.show_account_summary}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_account_summary: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-income-breakdown">Income Breakdown</Label>
                  <Switch
                    id="show-income-breakdown"
                    checked={componentVisibility.show_income_breakdown}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_income_breakdown: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-budget-tracker">Budget Tracker</Label>
                  <Switch
                    id="show-budget-tracker"
                    checked={componentVisibility.show_budget_tracker}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_budget_tracker: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-savings-goals">Savings Goals</Label>
                  <Switch
                    id="show-savings-goals"
                    checked={componentVisibility.show_savings_goals}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_savings_goals: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-monthly-targets">Monthly Targets</Label>
                  <Switch
                    id="show-monthly-targets"
                    checked={componentVisibility.show_monthly_targets}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_monthly_targets: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-upcoming-bills">Upcoming Bills</Label>
                  <Switch
                    id="show-upcoming-bills"
                    checked={componentVisibility.show_upcoming_bills}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_upcoming_bills: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-child-expenses">Child Expenses</Label>
                  <Switch
                    id="show-child-expenses"
                    checked={componentVisibility.show_child_expenses}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_child_expenses: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-gift-budget">Gift Budget</Label>
                  <Switch
                    id="show-gift-budget"
                    checked={componentVisibility.show_gift_budget}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_gift_budget: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-travel-budget">Travel Budget</Label>
                  <Switch
                    id="show-travel-budget"
                    checked={componentVisibility.show_travel_budget}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_travel_budget: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-pockets-overview">Pockets Overview</Label>
                  <Switch
                    id="show-pockets-overview"
                    checked={componentVisibility.show_pockets_overview}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_pockets_overview: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contribution-tracker">Contribution Tracker</Label>
                  <Switch
                    id="show-contribution-tracker"
                    checked={componentVisibility.show_contribution_tracker}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({
                        ...componentVisibility,
                        show_contribution_tracker: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-personal-allowance">Personal Allowance</Label>
                  <Switch
                    id="show-personal-allowance"
                    checked={componentVisibility.show_personal_allowance}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_personal_allowance: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-sinking-funds">Sinking Funds</Label>
                  <Switch
                    id="show-sinking-funds"
                    checked={componentVisibility.show_sinking_funds}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_sinking_funds: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-couple-scorecard">Couple Scorecard</Label>
                  <Switch
                    id="show-couple-scorecard"
                    checked={componentVisibility.show_couple_scorecard}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_couple_scorecard: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-money-flow">Money Flow Diagram</Label>
                  <Switch
                    id="show-money-flow"
                    checked={componentVisibility.show_money_flow}
                    onCheckedChange={(checked) =>
                      setComponentVisibility({ ...componentVisibility, show_money_flow: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveComponentVisibility} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Dashboard Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Management */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add User Access
              </CardTitle>
              <CardDescription>
                Grant other users access to your household dashboard by their email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="new-email">Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newAccessEmail}
                    onChange={(e) => setNewAccessEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <Select
                    value={newAccessRole}
                    onValueChange={(value: 'admin' | 'editor' | 'viewer') => setNewAccessRole(value)}
                  >
                    <SelectTrigger id="new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (full access)</SelectItem>
                      <SelectItem value="editor">Editor (can edit)</SelectItem>
                      <SelectItem value="viewer">Viewer (read only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-person">Link to Person</Label>
                  <Select
                    value={newAccessLinkedPerson || 'none'}
                    onValueChange={(value) => setNewAccessLinkedPerson(value === 'none' ? null : value)}
                  >
                    <SelectTrigger id="new-person">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not linked</SelectItem>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: person.color }}
                            />
                            {person.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={addAccess}
                disabled={savingAccess || !newAccessEmail}
              >
                {savingAccess ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Access
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                When the user signs up with this email, they will automatically get access to your household.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Access
              </CardTitle>
              <CardDescription>
                Users who have access to this household
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No additional users have been granted access yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Linked Person</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessList.map((access) => (
                      <TableRow key={access.id}>
                        <TableCell className="font-medium">{access.user_email}</TableCell>
                        <TableCell>
                          <Select
                            value={access.role}
                            onValueChange={(value: 'admin' | 'editor' | 'viewer') =>
                              updateAccessRole(access.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {access.linked_person_id ? (
                            <span className="flex items-center gap-2">
                              <LinkIcon className="h-3 w-3" />
                              {(access as any).linked_person?.name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {access.user_id ? (
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAccess(access.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Access Roles Explained</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Badge variant="default" className="mt-0.5">Admin</Badge>
                  <span className="text-muted-foreground">Full access to all features, settings, and can manage other users' access.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5">Editor</Badge>
                  <span className="text-muted-foreground">Can view and edit all financial data, but cannot manage settings or access.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">Viewer</Badge>
                  <span className="text-muted-foreground">Read-only access. Can view all dashboards and reports but cannot make changes.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
