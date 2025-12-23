/**
 * Revolut OAuth Connect Endpoint
 * Initiates the OAuth 2.0 authorization flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthorizationUrl } from '@/lib/revolut/client'
import crypto from 'crypto'

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

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in session/cookies for verification in callback
    const response = NextResponse.json({ success: true })

    // Set state cookie with security flags
    response.cookies.set('revolut_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Store household_id for callback
    response.cookies.set('revolut_oauth_household', person.household_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    // Get redirect URI from environment or default
    const redirectUri =
      process.env.REVOLUT_REDIRECT_URI || `${request.nextUrl.origin}/api/revolut/callback`

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(state, redirectUri)

    // Return authorization URL for client-side redirect
    return NextResponse.json({
      authUrl,
    })
  } catch (error) {
    console.error('Revolut connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Revolut connection' },
      { status: 500 }
    )
  }
}
