/**
 * Revolut OAuth Callback Endpoint
 * Handles the OAuth callback and exchanges code for tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken } from '@/lib/revolut/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Revolut OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/settings?error=revolut_${error}`, request.url)
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?error=revolut_invalid_callback', request.url)
      )
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('revolut_oauth_state')?.value
    const householdId = request.cookies.get('revolut_oauth_household')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/settings?error=revolut_invalid_state', request.url)
      )
    }

    if (!householdId) {
      return NextResponse.redirect(
        new URL('/settings?error=revolut_missing_household', request.url)
      )
    }

    // Exchange authorization code for tokens
    const redirectUri =
      process.env.REVOLUT_REDIRECT_URI || `${request.nextUrl.origin}/api/revolut/callback`

    const tokenResponse = await exchangeCodeForToken(code, redirectUri)

    // Calculate token expiry time
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

    // Store tokens in Supabase
    const supabase = await createClient()

    // Deactivate any existing connections for this household
    await supabase
      .from('revolut_connections')
      .update({ is_active: false })
      .eq('household_id', householdId)
      .eq('is_active', true)

    // Create new connection
    const { error: insertError } = await supabase.from('revolut_connections').insert({
      household_id: householdId,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    })

    if (insertError) {
      console.error('Failed to store Revolut connection:', insertError)
      return NextResponse.redirect(
        new URL('/settings?error=revolut_storage_failed', request.url)
      )
    }

    // Clear state cookies
    const response = NextResponse.redirect(
      new URL('/settings?success=revolut_connected', request.url)
    )

    response.cookies.delete('revolut_oauth_state')
    response.cookies.delete('revolut_oauth_household')

    return response
  } catch (error) {
    console.error('Revolut callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=revolut_callback_failed', request.url)
    )
  }
}
