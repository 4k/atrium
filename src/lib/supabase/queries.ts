/**
 * Supabase Query Functions
 *
 * This file contains all read operations for the family budget dashboard.
 * Use these functions to fetch data from Supabase with full type safety.
 */

import { createClient } from './server'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

// ============================================================================
// HOUSEHOLDS
// ============================================================================

export async function getHousehold(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getFirstHousehold() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// ============================================================================
// PERSONS
// ============================================================================

export async function getPersons(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getPerson(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// INCOME SOURCES
// ============================================================================

export async function getIncomeSources(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_sources')
    .select(`
      *,
      person:persons(*)
    `)
    .eq('persons.household_id', householdId)
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getIncomeSourcesByPerson(personId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('person_id', personId)
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getTotalIncomeByPerson(householdId: string) {
  const supabase = await createClient()

  // Get all persons in household
  const persons = await getPersons(householdId)

  // Get income for each person
  const incomeByPerson = await Promise.all(
    persons.map(async (person) => {
      const { data, error } = await supabase
        .from('income_sources')
        .select('amount, frequency')
        .eq('person_id', person.id)
        .eq('is_active', true)

      if (error) throw error

      // Calculate total monthly income
      const monthlyIncome = data.reduce((sum, source) => {
        if (source.frequency === 'monthly') return sum + source.amount
        if (source.frequency === 'weekly') return sum + (source.amount * 52 / 12)
        return sum
      }, 0)

      return { personId: person.id, name: person.name, income: monthlyIncome }
    })
  )

  return incomeByPerson
}

// ============================================================================
// POCKETS
// ============================================================================

export async function getPockets(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .select(`
      *,
      owner:owner_id(*)
    `)
    .eq('household_id', householdId)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getPocketById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .select(`
      *,
      owner:owner_id(*),
      transactions(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getTotalPocketBalance(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .select('current_balance')
    .eq('household_id', householdId)

  if (error) throw error

  return data.reduce((sum, pocket) => sum + pocket.current_balance, 0)
}

export async function getTotalPocketAllocations(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .select('monthly_allocation')
    .eq('household_id', householdId)

  if (error) throw error

  return data.reduce((sum, pocket) => sum + (pocket.monthly_allocation || 0), 0)
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function getTransactions(pocketId: string, month?: Date) {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      pocket:pockets(*),
      person:persons(*)
    `)
    .eq('pocket_id', pocketId)
    .order('transaction_date', { ascending: false })

  if (month) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    query = query
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getRecentTransactions(householdId: string, limit: number = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      pocket:pockets!inner(*),
      person:persons(*)
    `)
    .eq('pockets.household_id', householdId)
    .order('transaction_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============================================================================
// CONTRIBUTIONS
// ============================================================================

export async function getContributions(householdId: string, month: Date) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('contributions')
    .select(`
      *,
      person:persons(*)
    `)
    .eq('household_id', householdId)
    .eq('month', monthStr)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getCurrentMonthContributions(householdId: string) {
  const now = new Date()
  return getContributions(householdId, now)
}

export async function getContributionHistory(householdId: string, months: number = 3) {
  const supabase = await createClient()
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

  const { data, error } = await supabase
    .from('contributions')
    .select(`
      *,
      person:persons(*)
    `)
    .eq('household_id', householdId)
    .gte('month', startMonth.toISOString().split('T')[0])
    .order('month', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// PERSONAL ALLOWANCES
// ============================================================================

export async function getPersonalAllowance(personId: string, month: Date) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('personal_allowances')
    .select('*')
    .eq('person_id', personId)
    .eq('month', monthStr)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

export async function getCurrentMonthAllowances(householdId: string) {
  const supabase = await createClient()
  const now = new Date()
  const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('personal_allowances')
    .select(`
      *,
      person:persons!inner(*)
    `)
    .eq('persons.household_id', householdId)
    .eq('month', monthStr)
    .order('created_at')

  if (error) throw error
  return data
}

// ============================================================================
// SAVINGS GOALS
// ============================================================================

export async function getSavingsGoals(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .select(`
      *,
      pocket:pockets(*)
    `)
    .eq('household_id', householdId)
    .order('created_at')

  if (error) throw error
  return data
}

// ============================================================================
// BUDGET CATEGORIES
// ============================================================================

export async function getBudgetCategories(householdId: string, month: Date) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('budget_categories')
    .select(`
      *,
      person:persons(*)
    `)
    .eq('household_id', householdId)
    .eq('month', monthStr)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getCurrentMonthBudget(householdId: string) {
  const now = new Date()
  return getBudgetCategories(householdId, now)
}

// ============================================================================
// BILLS
// ============================================================================

export async function getBills(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('household_id', householdId)
    .order('due_date')

  if (error) throw error
  return data
}

export async function getUpcomingBills(householdId: string, days: number = 30) {
  const supabase = await createClient()
  const today = new Date()
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_paid', false)
    .gte('due_date', today.toISOString().split('T')[0])
    .lte('due_date', futureDate.toISOString().split('T')[0])
    .order('due_date')

  if (error) throw error
  return data
}

// ============================================================================
// CHILDREN & CHILD EXPENSES
// ============================================================================

export async function getChildren(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at')

  if (error) throw error
  return data
}

export async function getChildExpenses(childId: string, month: Date) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('child_expenses')
    .select('*')
    .eq('child_id', childId)
    .eq('month', monthStr)
    .order('category')

  if (error) throw error
  return data
}

export async function getCurrentMonthChildExpenses(householdId: string) {
  const supabase = await createClient()
  const now = new Date()
  const monthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('child_expenses')
    .select(`
      *,
      child:children!inner(*)
    `)
    .eq('children.household_id', householdId)
    .eq('month', monthStr)
    .order('category')

  if (error) throw error
  return data
}

// ============================================================================
// SINKING FUNDS
// ============================================================================

export async function getSinkingFunds(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sinking_funds')
    .select('*')
    .eq('household_id', householdId)
    .order('due_date')

  if (error) throw error
  return data
}

export async function getUpcomingSinkingFunds(householdId: string, months: number = 6) {
  const supabase = await createClient()
  const today = new Date()
  const futureDate = new Date(today.getFullYear(), today.getMonth() + months, today.getDate())

  const { data, error } = await supabase
    .from('sinking_funds')
    .select('*')
    .eq('household_id', householdId)
    .gte('due_date', today.toISOString().split('T')[0])
    .lte('due_date', futureDate.toISOString().split('T')[0])
    .order('due_date')

  if (error) throw error
  return data
}

export async function getUnderfundedSinkingFunds(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sinking_funds')
    .select('*')
    .eq('household_id', householdId)
    .order('due_date')

  if (error) throw error

  // Filter for underfunded (where current < target)
  return data.filter(fund => fund.current_amount < fund.target_amount)
}

// ============================================================================
// GIFT RECIPIENTS
// ============================================================================

export async function getGiftRecipients(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gift_recipients')
    .select('*')
    .eq('household_id', householdId)
    .order('occasion_date')

  if (error) throw error
  return data
}

export async function getNextGiftOccasions(householdId: string, count: number = 5) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('gift_recipients')
    .select('*')
    .eq('household_id', householdId)
    .gte('occasion_date', today)
    .order('occasion_date')
    .limit(count)

  if (error) throw error
  return data
}

// ============================================================================
// TRAVEL PLANS
// ============================================================================

export async function getTravelPlans(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('household_id', householdId)
    .order('start_date')

  if (error) throw error
  return data
}

export async function getUpcomingTravelPlans(householdId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('household_id', householdId)
    .gte('start_date', today)
    .order('start_date')

  if (error) throw error
  return data
}

// ============================================================================
// AGGREGATIONS & COMPUTED VALUES
// ============================================================================

export async function getHouseholdBalance(householdId: string) {
  // Get total from all pockets
  const pocketBalance = await getTotalPocketBalance(householdId)

  // Could also include main account balance if you have a separate table for it
  return pocketBalance
}

export async function getMonthlySpendingByPocket(householdId: string, month: Date) {
  const supabase = await createClient()
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      pocket:pockets!inner(id, name, household_id)
    `)
    .eq('pockets.household_id', householdId)
    .gte('transaction_date', startDate.toISOString().split('T')[0])
    .lte('transaction_date', endDate.toISOString().split('T')[0])
    .lt('amount', 0) // Only outflows

  if (error) throw error

  // Group by pocket
  const spendingByPocket = data.reduce((acc: Record<string, number>, transaction: any) => {
    const pocketId = transaction.pocket.id
    acc[pocketId] = (acc[pocketId] || 0) + Math.abs(transaction.amount)
    return acc
  }, {})

  return spendingByPocket
}

export async function getTotalIncome(householdId: string) {
  const incomeByPerson = await getTotalIncomeByPerson(householdId)
  return incomeByPerson.reduce((sum, person) => sum + person.income, 0)
}

export async function getTotalExpenses(householdId: string, month: Date) {
  const budget = await getBudgetCategories(householdId, month)
  return budget.reduce((sum, category) => sum + category.spent, 0)
}

export async function getTotalBudgeted(householdId: string, month: Date) {
  const budget = await getBudgetCategories(householdId, month)
  return budget.reduce((sum, category) => sum + category.budgeted, 0)
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Get household settings
 * Creates default settings if none exist
 */
export async function getHouseholdSettings(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('household_settings')
    .select('*')
    .eq('household_id', householdId)
    .maybeSingle()

  if (error) throw error

  // Return default settings if none exist
  if (!data) {
    return {
      household_id: householdId,
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
  }

  return data
}

/**
 * Get user preferences for a specific user
 * Creates default preferences if none exist
 */
export async function getUserPreferences(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  // Return default preferences if none exist
  if (!data) {
    return {
      user_id: userId,
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
  }

  return data
}

/**
 * Get component visibility settings for a user
 * Creates default visibility if none exist (all visible)
 */
export async function getComponentVisibility(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('component_visibility')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  // Return default visibility (all visible) if none exist
  if (!data) {
    return {
      user_id: userId,
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
  }

  return data
}

/**
 * Get custom categories for a household by type
 */
export async function getCustomCategories(householdId: string, categoryType?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('custom_categories')
    .select('*')
    .eq('household_id', householdId)
    .order('sort_order')

  if (categoryType) {
    query = query.eq('category_type', categoryType)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get default categories (system-wide) by type
 */
export async function getDefaultCategories(categoryType: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .eq('household_id', '00000000-0000-0000-0000-000000000000')
    .eq('category_type', categoryType)
    .eq('is_default', true)
    .order('sort_order')

  if (error) throw error
  return data || []
}

/**
 * Get all categories (default + custom) for a household by type
 */
export async function getAllCategories(householdId: string, categoryType: string) {
  const [defaultCategories, customCategories] = await Promise.all([
    getDefaultCategories(categoryType),
    getCustomCategories(householdId, categoryType),
  ])

  // Merge default and custom categories
  return [...defaultCategories, ...customCategories]
}

/**
 * Get alert configurations for a household
 */
export async function getAlertConfigurations(householdId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alert_configurations')
    .select('*')
    .eq('household_id', householdId)
    .order('alert_type')

  if (error) throw error
  return data || []
}

/**
 * Get a specific alert configuration
 */
export async function getAlertConfiguration(householdId: string, alertType: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alert_configurations')
    .select('*')
    .eq('household_id', householdId)
    .eq('alert_type', alertType)
    .maybeSingle()

  if (error) throw error
  return data
}
