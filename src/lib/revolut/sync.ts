/**
 * Revolut data synchronization logic
 * Handles syncing accounts, transactions, and balances with Supabase
 */

import { createClient } from '@/lib/supabase/server'
import {
  getValidAccessToken,
  getAccounts,
  getTransactions,
  getAccountBalance,
} from './client'
import { RevolutError, getErrorMessage } from './errors'
import type { SyncResult } from './types'

/**
 * Create a sync log entry
 */
async function createSyncLog(
  householdId: string,
  syncType: 'accounts' | 'transactions' | 'balances' | 'all'
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sync_logs')
    .insert({
      household_id: householdId,
      sync_type: syncType,
      status: 'success',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create sync log:', error)
    return null
  }

  return data.id
}

/**
 * Update a sync log entry
 */
async function updateSyncLog(
  logId: string,
  status: 'success' | 'failed' | 'partial',
  recordsSynced: number,
  errorMessage?: string
) {
  const supabase = await createClient()

  await supabase
    .from('sync_logs')
    .update({
      status,
      records_synced: recordsSynced,
      error_message: errorMessage || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', logId)
}

/**
 * Sync Revolut accounts to Supabase pockets
 */
export async function syncRevolutAccounts(householdId: string): Promise<SyncResult> {
  const logId = await createSyncLog(householdId, 'accounts')
  let recordsSynced = 0
  const errors: string[] = []

  try {
    const supabase = await createClient()

    // Get valid access token
    const accessToken = await getValidAccessToken(householdId)

    // Fetch accounts from Revolut
    const accounts = await getAccounts(accessToken)

    if (!accounts || accounts.length === 0) {
      if (logId) await updateSyncLog(logId, 'success', 0)
      return { success: true, recordsSynced: 0 }
    }

    // Process each account
    for (const account of accounts) {
      try {
        // Check if pocket already exists for this Revolut account
        const { data: existingPocket } = await supabase
          .from('pockets')
          .select('*')
          .eq('household_id', householdId)
          .eq('revolut_account_id', account.accountId)
          .single()

        if (existingPocket) {
          // Update existing pocket
          const { error: updateError } = await supabase
            .from('pockets')
            .update({
              current_balance: account.balance,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', existingPocket.id)

          if (updateError) {
            errors.push(`Failed to update pocket for account ${account.accountId}: ${updateError.message}`)
          } else {
            recordsSynced++
          }
        } else {
          // Create new pocket for this account
          const { error: insertError } = await supabase
            .from('pockets')
            .insert({
              household_id: householdId,
              name: account.name,
              target_amount: 0,
              current_balance: account.balance,
              revolut_account_id: account.accountId,
              last_synced_at: new Date().toISOString(),
            })

          if (insertError) {
            errors.push(`Failed to create pocket for account ${account.accountId}: ${insertError.message}`)
          } else {
            recordsSynced++
          }
        }
      } catch (error) {
        errors.push(`Error processing account ${account.accountId}: ${getErrorMessage(error)}`)
      }
    }

    // Update last synced timestamp on connection
    await supabase
      .from('revolut_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('household_id', householdId)
      .eq('is_active', true)

    const status = errors.length > 0 ? 'partial' : 'success'
    if (logId) await updateSyncLog(logId, status, recordsSynced, errors.join('; '))

    return {
      success: errors.length === 0,
      recordsSynced,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    if (logId) await updateSyncLog(logId, 'failed', recordsSynced, errorMessage)

    return {
      success: false,
      recordsSynced,
      errors: [errorMessage],
    }
  }
}

/**
 * Sync Revolut transactions to Supabase
 */
export async function syncRevolutTransactions(
  householdId: string,
  fromDate?: Date
): Promise<number> {
  const logId = await createSyncLog(householdId, 'transactions')
  let recordsSynced = 0
  const errors: string[] = []

  try {
    const supabase = await createClient()

    // Get valid access token
    const accessToken = await getValidAccessToken(householdId)

    // Get all pockets with Revolut account IDs
    const { data: pockets, error: pocketsError } = await supabase
      .from('pockets')
      .select('*')
      .eq('household_id', householdId)
      .not('revolut_account_id', 'is', null)

    if (pocketsError || !pockets || pockets.length === 0) {
      if (logId) await updateSyncLog(logId, 'success', 0)
      return 0
    }

    // If no fromDate provided, use last sync or 90 days ago
    if (!fromDate) {
      const { data: connection } = await supabase
        .from('revolut_connections')
        .select('last_synced_at')
        .eq('household_id', householdId)
        .eq('is_active', true)
        .single()

      if (connection?.last_synced_at) {
        fromDate = new Date(connection.last_synced_at)
      } else {
        fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      }
    }

    // Sync transactions for each pocket
    for (const pocket of pockets) {
      try {
        const transactions = await getTransactions(
          accessToken,
          pocket.revolut_account_id!,
          fromDate
        )

        for (const tx of transactions) {
          // Check if transaction already exists
          const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('revolut_transaction_id', tx.transactionId)
            .single()

          if (existingTx) {
            continue // Skip duplicate
          }

          // Map transaction type to category
          const category = mapTransactionCategory(tx.type)

          // Determine amount based on debit/credit
          const amount = tx.creditDebitIndicator === 'DEBIT' ? -tx.amount : tx.amount

          // Insert transaction
          const { error: insertError } = await supabase
            .from('transactions')
            .insert({
              household_id: householdId,
              pocket_id: pocket.id,
              amount,
              category,
              description: tx.description,
              merchant_name: tx.merchantName,
              date: tx.bookingDateTime,
              revolut_transaction_id: tx.transactionId,
              is_imported: true,
            })

          if (insertError) {
            errors.push(`Failed to insert transaction ${tx.transactionId}: ${insertError.message}`)
          } else {
            recordsSynced++
          }
        }

        // Update pocket's last synced timestamp
        await supabase
          .from('pockets')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', pocket.id)
      } catch (error) {
        errors.push(`Error syncing transactions for pocket ${pocket.id}: ${getErrorMessage(error)}`)
      }
    }

    // Update connection's last synced timestamp
    await supabase
      .from('revolut_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('household_id', householdId)
      .eq('is_active', true)

    const status = errors.length > 0 ? 'partial' : 'success'
    if (logId) await updateSyncLog(logId, status, recordsSynced, errors.join('; '))

    return recordsSynced
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    if (logId) await updateSyncLog(logId, 'failed', recordsSynced, errorMessage)
    throw new RevolutError(errorMessage)
  }
}

/**
 * Sync Revolut account balances to Supabase
 */
export async function syncRevolutBalances(householdId: string): Promise<SyncResult> {
  const logId = await createSyncLog(householdId, 'balances')
  let recordsSynced = 0
  const errors: string[] = []

  try {
    const supabase = await createClient()

    // Get valid access token
    const accessToken = await getValidAccessToken(householdId)

    // Get all pockets with Revolut account IDs
    const { data: pockets, error: pocketsError } = await supabase
      .from('pockets')
      .select('*')
      .eq('household_id', householdId)
      .not('revolut_account_id', 'is', null)

    if (pocketsError || !pockets || pockets.length === 0) {
      if (logId) await updateSyncLog(logId, 'success', 0)
      return { success: true, recordsSynced: 0 }
    }

    // Sync balance for each pocket
    for (const pocket of pockets) {
      try {
        const balance = await getAccountBalance(accessToken, pocket.revolut_account_id!)

        // Update pocket balance
        const { error: updateError } = await supabase
          .from('pockets')
          .update({
            current_balance: balance.amount,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', pocket.id)

        if (updateError) {
          errors.push(`Failed to update balance for pocket ${pocket.id}: ${updateError.message}`)
        } else {
          recordsSynced++
        }
      } catch (error) {
        errors.push(`Error syncing balance for pocket ${pocket.id}: ${getErrorMessage(error)}`)
      }
    }

    // Update connection's last synced timestamp
    await supabase
      .from('revolut_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('household_id', householdId)
      .eq('is_active', true)

    const status = errors.length > 0 ? 'partial' : 'success'
    if (logId) await updateSyncLog(logId, status, recordsSynced, errors.join('; '))

    return {
      success: errors.length === 0,
      recordsSynced,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    if (logId) await updateSyncLog(logId, 'failed', recordsSynced, errorMessage)

    return {
      success: false,
      recordsSynced,
      errors: [errorMessage],
    }
  }
}

/**
 * Sync all Revolut data (accounts, balances, and transactions)
 */
export async function syncAll(householdId: string): Promise<SyncResult> {
  const logId = await createSyncLog(householdId, 'all')
  let totalRecordsSynced = 0
  const allErrors: string[] = []

  try {
    // 1. Sync accounts first (creates/updates pockets)
    const accountsResult = await syncRevolutAccounts(householdId)
    totalRecordsSynced += accountsResult.recordsSynced
    if (accountsResult.errors) {
      allErrors.push(...accountsResult.errors)
    }

    // 2. Sync balances
    const balancesResult = await syncRevolutBalances(householdId)
    totalRecordsSynced += balancesResult.recordsSynced
    if (balancesResult.errors) {
      allErrors.push(...balancesResult.errors)
    }

    // 3. Sync transactions
    const transactionsCount = await syncRevolutTransactions(householdId)
    totalRecordsSynced += transactionsCount

    const status = allErrors.length > 0 ? 'partial' : 'success'
    if (logId) await updateSyncLog(logId, status, totalRecordsSynced, allErrors.join('; '))

    return {
      success: allErrors.length === 0,
      recordsSynced: totalRecordsSynced,
      errors: allErrors.length > 0 ? allErrors : undefined,
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    if (logId) await updateSyncLog(logId, 'failed', totalRecordsSynced, errorMessage)

    return {
      success: false,
      recordsSynced: totalRecordsSynced,
      errors: [errorMessage],
    }
  }
}

/**
 * Map Revolut transaction type to budget category
 */
function mapTransactionCategory(type: string): string {
  const categoryMap: Record<string, string> = {
    CARD_PAYMENT: 'Shopping',
    CARD_REFUND: 'Refund',
    TRANSFER: 'Transfer',
    ATM: 'Cash Withdrawal',
    FEE: 'Fees',
    EXCHANGE: 'Currency Exchange',
    OTHER: 'Other',
  }

  return categoryMap[type] || 'Other'
}
