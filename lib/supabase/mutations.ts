/**
 * Supabase Mutation Functions
 *
 * This file contains all write operations (create, update, delete) for the family budget dashboard.
 * Use these functions to modify data in Supabase with full type safety.
 */

import { createClient } from './server'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

// ============================================================================
// HOUSEHOLDS
// ============================================================================

export async function createHousehold(name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('households')
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// PERSONS
// ============================================================================

export async function createPerson(
  householdId: string,
  name: string,
  initials: string,
  color: string,
  avatar?: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('persons')
    .insert({
      household_id: householdId,
      name,
      initials,
      color,
      avatar,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// INCOME SOURCES
// ============================================================================

export async function createIncomeSource(
  personId: string,
  name: string,
  amount: number,
  frequency: 'monthly' | 'weekly' | 'one-time' | 'variable'
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_sources')
    .insert({
      person_id: personId,
      name,
      amount,
      frequency,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateIncomeSource(
  id: string,
  updates: Partial<Tables['income_sources']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// POCKETS
// ============================================================================

export async function createPocket(
  householdId: string,
  name: string,
  type: Tables['pockets']['Row']['type'],
  options?: {
    icon?: string
    ownerId?: string
    monthlyAllocation?: number
    targetAmount?: number
    targetDate?: string
    color?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .insert({
      household_id: householdId,
      name,
      type,
      icon: options?.icon,
      owner_id: options?.ownerId,
      monthly_allocation: options?.monthlyAllocation,
      target_amount: options?.targetAmount,
      target_date: options?.targetDate,
      color: options?.color,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePocketBalance(pocketId: string, newBalance: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .update({ current_balance: newBalance })
    .eq('id', pocketId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePocket(
  id: string,
  updates: Partial<Tables['pockets']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pockets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function createTransaction(
  pocketId: string,
  personId: string,
  amount: number,
  description: string,
  options?: {
    category?: string
    transactionDate?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      pocket_id: pocketId,
      person_id: personId,
      amount,
      description,
      category: options?.category,
      transaction_date: options?.transactionDate,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function transferBetweenPockets(
  fromPocketId: string,
  toPocketId: string,
  amount: number,
  personId: string,
  description?: string
) {
  const supabase = await createClient()

  // Create outflow transaction from source pocket
  const { error: outflowError } = await supabase
    .from('transactions')
    .insert({
      pocket_id: fromPocketId,
      person_id: personId,
      amount: -amount,
      description: description || `Transfer to another pocket`,
    })

  if (outflowError) throw outflowError

  // Create inflow transaction to destination pocket
  const { error: inflowError } = await supabase
    .from('transactions')
    .insert({
      pocket_id: toPocketId,
      person_id: personId,
      amount: amount,
      description: description || `Transfer from another pocket`,
    })

  if (inflowError) throw inflowError

  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// CONTRIBUTIONS
// ============================================================================

export async function recordContribution(
  householdId: string,
  personId: string,
  amount: number,
  month: Date
) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('contributions')
    .upsert({
      household_id: householdId,
      person_id: personId,
      amount,
      month: monthStr,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// PERSONAL ALLOWANCES
// ============================================================================

export async function updatePersonalAllowanceSpent(
  personId: string,
  amount: number,
  month: Date
) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  // First, try to get existing allowance
  const { data: existing } = await supabase
    .from('personal_allowances')
    .select('*')
    .eq('person_id', personId)
    .eq('month', monthStr)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('personal_allowances')
      .update({
        current_month_spent: existing.current_month_spent + amount,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new allowance record (should have a default monthly_amount set)
    throw new Error('Personal allowance not initialized for this month')
  }
}

export async function initializePersonalAllowance(
  personId: string,
  monthlyAmount: number,
  month: Date
) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('personal_allowances')
    .upsert({
      person_id: personId,
      monthly_amount: monthlyAmount,
      month: monthStr,
      current_month_spent: 0,
      rollover_balance: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// SAVINGS GOALS
// ============================================================================

export async function createSavingsGoal(
  householdId: string,
  name: string,
  targetAmount: number,
  options?: {
    pocketId?: string
    targetDate?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      household_id: householdId,
      name,
      target_amount: targetAmount,
      pocket_id: options?.pocketId,
      target_date: options?.targetDate,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSavingsGoal(
  id: string,
  updates: Partial<Tables['savings_goals']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// BUDGET CATEGORIES
// ============================================================================

export async function createBudgetCategory(
  householdId: string,
  name: string,
  budgeted: number,
  month: Date,
  options?: {
    personId?: string
    icon?: string
    color?: string
  }
) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('budget_categories')
    .insert({
      household_id: householdId,
      name,
      budgeted,
      month: monthStr,
      person_id: options?.personId,
      icon: options?.icon,
      color: options?.color,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBudgetCategorySpent(
  id: string,
  spent: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('budget_categories')
    .update({ spent })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// BILLS
// ============================================================================

export async function createBill(
  householdId: string,
  name: string,
  amount: number,
  dueDate: string,
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time',
  options?: {
    isAutopay?: boolean
    category?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bills')
    .insert({
      household_id: householdId,
      name,
      amount,
      due_date: dueDate,
      frequency,
      is_autopay: options?.isAutopay ?? false,
      category: options?.category,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markBillPaid(id: string, isPaid: boolean = true) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bills')
    .update({ is_paid: isPaid })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// CHILDREN & CHILD EXPENSES
// ============================================================================

export async function createChild(
  householdId: string,
  name: string,
  age: number,
  options?: {
    avatar?: string
    color?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('children')
    .insert({
      household_id: householdId,
      name,
      age,
      avatar: options?.avatar,
      color: options?.color,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateChildExpense(
  childId: string,
  category: Tables['child_expenses']['Row']['category'],
  month: Date,
  updates: {
    budgeted?: number
    spent?: number
  }
) {
  const supabase = await createClient()
  const monthStr = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]

  // Try to update existing, or insert if not exists
  const { data, error } = await supabase
    .from('child_expenses')
    .upsert({
      child_id: childId,
      category,
      month: monthStr,
      budgeted: updates.budgeted ?? 0,
      spent: updates.spent ?? 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// SINKING FUNDS
// ============================================================================

export async function createSinkingFund(
  householdId: string,
  name: string,
  category: Tables['sinking_funds']['Row']['category'],
  targetAmount: number,
  dueDate: string,
  monthlyContribution: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sinking_funds')
    .insert({
      household_id: householdId,
      name,
      category,
      target_amount: targetAmount,
      due_date: dueDate,
      monthly_contribution: monthlyContribution,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSinkingFundAmount(id: string, currentAmount: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sinking_funds')
    .update({ current_amount: currentAmount })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// GIFT RECIPIENTS
// ============================================================================

export async function createGiftRecipient(
  householdId: string,
  name: string,
  relationship: 'family' | 'friend' | 'coworker' | 'other',
  occasion: string,
  occasionDate: string,
  budgeted: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gift_recipients')
    .insert({
      household_id: householdId,
      name,
      relationship,
      occasion,
      occasion_date: occasionDate,
      budgeted,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGiftSpent(id: string, spent: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gift_recipients')
    .update({ spent })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// TRAVEL PLANS
// ============================================================================

export async function createTravelPlan(
  householdId: string,
  destination: string,
  startDate: string,
  endDate: string,
  budgets?: {
    flights?: number
    accommodation?: number
    food?: number
    activities?: number
    transport?: number
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('travel_plans')
    .insert({
      household_id: householdId,
      destination,
      start_date: startDate,
      end_date: endDate,
      flights_budgeted: budgets?.flights ?? 0,
      accommodation_budgeted: budgets?.accommodation ?? 0,
      food_budgeted: budgets?.food ?? 0,
      activities_budgeted: budgets?.activities ?? 0,
      transport_budgeted: budgets?.transport ?? 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTravelExpense(
  id: string,
  category: 'flights' | 'accommodation' | 'food' | 'activities' | 'transport',
  spent: number
) {
  const supabase = await createClient()
  const updateField = `${category}_spent` as keyof Tables['travel_plans']['Update']

  const { data, error } = await supabase
    .from('travel_plans')
    .update({ [updateField]: spent })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Create or update household settings
 */
export async function upsertHouseholdSettings(
  householdId: string,
  settings: Partial<Tables['household_settings']['Insert']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('household_settings')
    .upsert(
      {
        household_id: householdId,
        ...settings,
      },
      {
        onConflict: 'household_id',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update household settings
 */
export async function updateHouseholdSettings(
  householdId: string,
  settings: Partial<Tables['household_settings']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('household_settings')
    .update(settings)
    .eq('household_id', householdId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(
  userId: string,
  householdId: string,
  preferences: Partial<Tables['user_preferences']['Insert']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        household_id: householdId,
        ...preferences,
      },
      {
        onConflict: 'user_id,household_id',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Tables['user_preferences']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create or update component visibility
 */
export async function upsertComponentVisibility(
  userId: string,
  householdId: string,
  visibility: Partial<Tables['component_visibility']['Insert']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('component_visibility')
    .upsert(
      {
        user_id: userId,
        household_id: householdId,
        ...visibility,
      },
      {
        onConflict: 'user_id,household_id',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update component visibility
 */
export async function updateComponentVisibility(
  userId: string,
  visibility: Partial<Tables['component_visibility']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('component_visibility')
    .update(visibility)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create a custom category
 */
export async function createCustomCategory(
  householdId: string,
  categoryType: string,
  name: string,
  icon?: string,
  color?: string,
  sortOrder?: number
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_categories')
    .insert({
      household_id: householdId,
      category_type: categoryType,
      name,
      icon,
      color,
      is_default: false,
      sort_order: sortOrder ?? 999,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a custom category
 */
export async function updateCustomCategory(
  id: string,
  updates: Partial<Tables['custom_categories']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a custom category
 */
export async function deleteCustomCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('custom_categories').delete().eq('id', id)

  if (error) throw error
}

/**
 * Create or update an alert configuration
 */
export async function upsertAlertConfiguration(
  householdId: string,
  alertType: string,
  config: Partial<Tables['alert_configurations']['Insert']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alert_configurations')
    .upsert(
      {
        household_id: householdId,
        alert_type: alertType,
        ...config,
      },
      {
        onConflict: 'household_id,alert_type',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an alert configuration
 */
export async function updateAlertConfiguration(
  householdId: string,
  alertType: string,
  updates: Partial<Tables['alert_configurations']['Update']>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alert_configurations')
    .update(updates)
    .eq('household_id', householdId)
    .eq('alert_type', alertType)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete an alert configuration
 */
export async function deleteAlertConfiguration(householdId: string, alertType: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alert_configurations')
    .delete()
    .eq('household_id', householdId)
    .eq('alert_type', alertType)

  if (error) throw error
}
