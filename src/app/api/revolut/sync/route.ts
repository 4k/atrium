/**
 * Revolut Sync Endpoint
 * Triggers manual synchronization of Revolut data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  syncAll,
  syncRevolutAccounts,
  syncRevolutTransactions,
  syncRevolutBalances,
} from '@/lib/revolut/sync'
import { getErrorMessage } from '@/lib/revolut/errors'

type SyncType = 'all' | 'accounts' | 'transactions' | 'balances'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's household
    const { data: person, error: personError } = await supabase
      .from('persons')
      .select('household_id')
      .eq('email', user.email)
      .single()

    if (personError || !person) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    // Verify Revolut connection exists
    const { data: connection, error: connectionError } = await supabase
      .from('revolut_connections')
      .select('id')
      .eq('household_id', person.household_id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No active Revolut connection found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const syncType: SyncType = body.type || 'all'

    // Validate sync type
    if (!['all', 'accounts', 'transactions', 'balances'].includes(syncType)) {
      return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })
    }

    // Perform sync based on type
    let result

    switch (syncType) {
      case 'all':
        result = await syncAll(person.household_id)
        break
      case 'accounts':
        result = await syncRevolutAccounts(person.household_id)
        break
      case 'transactions':
        const recordsSynced = await syncRevolutTransactions(person.household_id)
        result = {
          success: true,
          recordsSynced,
        }
        break
      case 'balances':
        result = await syncRevolutBalances(person.household_id)
        break
    }

    return NextResponse.json({
      success: result.success,
      type: syncType,
      recordsSynced: result.recordsSynced,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
