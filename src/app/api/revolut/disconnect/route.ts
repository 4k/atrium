/**
 * Revolut Disconnect Endpoint
 * Revokes the Revolut connection while preserving historical data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Deactivate all Revolut connections for this household
    const { error: updateError } = await supabase
      .from('revolut_connections')
      .update({ is_active: false })
      .eq('household_id', person.household_id)
      .eq('is_active', true)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to disconnect Revolut' },
        { status: 500 }
      )
    }

    // Note: We keep the revolut_account_id and revolut_transaction_id
    // in pockets and transactions tables to preserve historical data
    // Users can still see which transactions were imported

    return NextResponse.json({
      success: true,
      message: 'Revolut disconnected successfully',
    })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Revolut' },
      { status: 500 }
    )
  }
}
