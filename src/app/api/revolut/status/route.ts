/**
 * Revolut Connection Status Endpoint
 * Returns the current connection status and sync information
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // Get active Revolut connection
    const { data: connection, error: connectionError } = await supabase
      .from('revolut_connections')
      .select('*')
      .eq('household_id', person.household_id)
      .eq('is_active', true)
      .single()

    // If no connection found
    if (connectionError || !connection) {
      return NextResponse.json({
        connected: false,
        lastSyncedAt: null,
        tokenExpired: false,
      })
    }

    // Check if token is expired
    const expiresAt = new Date(connection.expires_at)
    const now = new Date()
    const tokenExpired = expiresAt <= now

    // Get latest sync log
    const { data: latestSync } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('household_id', person.household_id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    // Count linked accounts
    const { count: linkedAccounts } = await supabase
      .from('pockets')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', person.household_id)
      .not('revolut_account_id', 'is', null)

    return NextResponse.json({
      connected: true,
      connectedAt: connection.connected_at,
      lastSyncedAt: connection.last_synced_at,
      tokenExpired,
      expiresAt: connection.expires_at,
      linkedAccounts: linkedAccounts || 0,
      latestSync: latestSync
        ? {
            type: latestSync.sync_type,
            status: latestSync.status,
            recordsSynced: latestSync.records_synced,
            startedAt: latestSync.started_at,
            completedAt: latestSync.completed_at,
          }
        : null,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve connection status' },
      { status: 500 }
    )
  }
}
