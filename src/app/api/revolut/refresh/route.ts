/**
 * Revolut Token Refresh Endpoint
 * Manually refresh access token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refreshAccessToken } from '@/lib/revolut/client'
import { getErrorMessage } from '@/lib/revolut/errors'

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

    // Refresh the token
    await refreshAccessToken(person.household_id)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
