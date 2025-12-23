/**
 * Revolut Sync Cron Job (Optional)
 * Automatically syncs all active Revolut connections
 * Runs on a schedule via Vercel Cron or similar
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAll } from '@/lib/revolut/sync'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all active Revolut connections
    const { data: connections, error } = await supabase
      .from('revolut_connections')
      .select('household_id, last_synced_at')
      .eq('is_active', true)

    if (error || !connections) {
      console.error('Failed to fetch connections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch connections' },
        { status: 500 }
      )
    }

    const results = []

    // Sync each household
    for (const connection of connections) {
      try {
        console.log(`Syncing household: ${connection.household_id}`)

        const result = await syncAll(connection.household_id)

        results.push({
          household_id: connection.household_id,
          success: result.success,
          records_synced: result.recordsSynced,
          errors: result.errors,
        })
      } catch (error) {
        console.error(`Failed to sync household ${connection.household_id}:`, error)
        results.push({
          household_id: connection.household_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Calculate summary
    const totalHouseholds = results.length
    const successfulSyncs = results.filter((r) => r.success).length
    const totalRecordsSynced = results.reduce((sum, r) => sum + (r.records_synced || 0), 0)

    console.log(
      `Cron sync completed: ${successfulSyncs}/${totalHouseholds} households, ${totalRecordsSynced} records`
    )

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_households: totalHouseholds,
        successful_syncs: successfulSyncs,
        failed_syncs: totalHouseholds - successfulSyncs,
        total_records_synced: totalRecordsSynced,
      },
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
