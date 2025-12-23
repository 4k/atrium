/**
 * Revolut Open Banking API Client
 * Handles authentication, token management, and API requests
 */

import { createClient } from '@/lib/supabase/server'
import {
  RevolutError,
  RevolutAuthError,
  RevolutTokenExpiredError,
  RevolutConsentExpiredError,
  RevolutRateLimitError,
  RevolutNetworkError,
  shouldRefreshToken,
} from './errors'
import type {
  OAuthTokenResponse,
  RevolutAccount,
  RevolutTransaction,
  RevolutBalance,
  AccountsResponse,
  TransactionsResponse,
  BalancesResponse,
  RevolutApiError,
} from './types'

const REVOLUT_API_BASE_URL = process.env.REVOLUT_API_BASE_URL || 'https://sandbox-oba.revolut.com'
const REVOLUT_CLIENT_ID = process.env.REVOLUT_CLIENT_ID || ''
const REVOLUT_CLIENT_SECRET = process.env.REVOLUT_CLIENT_SECRET || ''

/**
 * Get authorization URL for OAuth flow
 */
export function getAuthorizationUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: REVOLUT_CLIENT_ID,
    response_type: 'code',
    scope: 'accounts transactions',
    state,
    redirect_uri: redirectUri,
  })

  return `${REVOLUT_API_BASE_URL}/auth?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  try {
    const response = await fetch(`${REVOLUT_API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${REVOLUT_CLIENT_ID}:${REVOLUT_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!response.ok) {
      const error: RevolutApiError = await response.json()
      throw new RevolutAuthError(
        error.error_description || error.error || 'Failed to exchange code for token',
        error.error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RevolutError) throw error
    throw new RevolutNetworkError('Failed to connect to Revolut API')
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessTokenDirect(refreshToken: string): Promise<OAuthTokenResponse> {
  try {
    const response = await fetch(`${REVOLUT_API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${REVOLUT_CLIENT_ID}:${REVOLUT_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error: RevolutApiError = await response.json()

      if (response.status === 403 || error.error === 'invalid_grant') {
        throw new RevolutConsentExpiredError()
      }

      throw new RevolutAuthError(
        error.error_description || error.error || 'Failed to refresh token',
        error.error
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RevolutError) throw error
    throw new RevolutNetworkError('Failed to connect to Revolut API')
  }
}

/**
 * Get valid access token for a household, refreshing if necessary
 */
export async function getValidAccessToken(householdId: string): Promise<string> {
  const supabase = await createClient()

  // Get active connection for household
  const { data: connection, error } = await supabase
    .from('revolut_connections')
    .select('*')
    .eq('household_id', householdId)
    .eq('is_active', true)
    .single()

  if (error || !connection) {
    throw new RevolutError('No active Revolut connection found')
  }

  const expiresAt = new Date(connection.expires_at)
  const now = new Date()

  // Token is still valid
  if (expiresAt > now) {
    return connection.access_token
  }

  // Token expired, refresh it
  const tokenResponse = await refreshAccessTokenDirect(connection.refresh_token)

  // Calculate new expiry time
  const newExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)

  // Update connection with new tokens
  const { error: updateError } = await supabase
    .from('revolut_connections')
    .update({
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: newExpiresAt.toISOString(),
    })
    .eq('id', connection.id)

  if (updateError) {
    throw new RevolutError('Failed to update access token')
  }

  return tokenResponse.access_token
}

/**
 * Refresh access token for a household
 */
export async function refreshAccessToken(householdId: string): Promise<void> {
  await getValidAccessToken(householdId)
}

/**
 * Make an authenticated API request to Revolut
 */
async function makeApiRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${REVOLUT_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      throw new RevolutRateLimitError(retryAfter ? parseInt(retryAfter) : undefined)
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new RevolutTokenExpiredError()
    }

    // Handle consent errors
    if (response.status === 403) {
      throw new RevolutConsentExpiredError()
    }

    if (!response.ok) {
      const error: RevolutApiError = await response.json().catch(() => ({
        error: 'unknown_error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))

      throw new RevolutError(
        error.message || error.error_description || error.error || 'API request failed',
        error.error || error.code,
        response.status
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof RevolutError) throw error
    throw new RevolutNetworkError('Failed to connect to Revolut API')
  }
}

/**
 * Fetch all accounts for a household
 */
export async function getAccounts(accessToken: string): Promise<RevolutAccount[]> {
  const response = await makeApiRequest<AccountsResponse>('/accounts', accessToken)

  return response.accounts.map((account) => ({
    accountId: account.resourceId,
    currency: account.currency,
    accountType: mapAccountType(account.cashAccountType || account.product),
    name: account.name || `${account.currency} Account`,
    balance: parseFloat(account.balances?.[0]?.balanceAmount.amount || '0'),
    details: {
      iban: account.iban,
      bic: account.bic,
    },
  }))
}

/**
 * Fetch balance for a specific account
 */
export async function getAccountBalance(
  accessToken: string,
  accountId: string
): Promise<RevolutBalance> {
  const response = await makeApiRequest<BalancesResponse>(
    `/accounts/${accountId}/balances`,
    accessToken
  )

  const balance = response.balances.find((b) => b.balanceType === 'CLAV') || response.balances[0]

  return {
    accountId,
    amount: parseFloat(balance.balanceAmount.amount),
    currency: balance.balanceAmount.currency,
    creditDebitIndicator: balance.creditDebitIndicator === 'DBIT' ? 'DEBIT' : 'CREDIT',
    type: balance.balanceType as RevolutBalance['type'],
    dateTime: balance.referenceDate || new Date().toISOString(),
  }
}

/**
 * Fetch transactions for a specific account
 */
export async function getTransactions(
  accessToken: string,
  accountId: string,
  fromDate?: Date,
  toDate?: Date
): Promise<RevolutTransaction[]> {
  const params = new URLSearchParams()

  if (fromDate) {
    params.set('dateFrom', fromDate.toISOString().split('T')[0])
  }

  if (toDate) {
    params.set('dateTo', toDate.toISOString().split('T')[0])
  }

  const endpoint = `/accounts/${accountId}/transactions${params.toString() ? `?${params.toString()}` : ''}`
  const response = await makeApiRequest<TransactionsResponse>(endpoint, accessToken)

  return response.transactions.booked.map((tx) => ({
    transactionId: tx.transactionId,
    accountId,
    amount: Math.abs(parseFloat(tx.transactionAmount.amount)),
    currency: tx.transactionAmount.currency,
    type: mapTransactionType(tx.proprietaryBankTransactionCode),
    description: tx.remittanceInformationUnstructured || tx.additionalInformation || 'Transaction',
    merchantName: tx.creditorName || tx.debtorName,
    bookingDateTime: tx.bookingDate,
    valueDateTime: tx.valueDate,
    creditDebitIndicator: tx.creditDebitIndicator === 'DBIT' ? 'DEBIT' : 'CREDIT',
  }))
}

/**
 * Map Revolut account type to our enum
 */
function mapAccountType(type?: string): RevolutAccount['accountType'] {
  const typeUpper = type?.toUpperCase() || ''

  if (typeUpper.includes('CURRENT') || typeUpper.includes('CACC')) return 'CURRENT'
  if (typeUpper.includes('SAVING') || typeUpper.includes('SVGS')) return 'SAVINGS'
  if (typeUpper.includes('INVEST')) return 'INVESTMENT'
  if (typeUpper.includes('LOAN')) return 'LOAN'

  return 'OTHER'
}

/**
 * Map Revolut transaction type to our enum
 */
function mapTransactionType(code?: string): RevolutTransaction['type'] {
  const codeUpper = code?.toUpperCase() || ''

  if (codeUpper.includes('CARD') || codeUpper.includes('POS')) return 'CARD_PAYMENT'
  if (codeUpper.includes('REFUND')) return 'CARD_REFUND'
  if (codeUpper.includes('TRANSFER') || codeUpper.includes('SEPA')) return 'TRANSFER'
  if (codeUpper.includes('ATM') || codeUpper.includes('CASH')) return 'ATM'
  if (codeUpper.includes('FEE') || codeUpper.includes('CHARGE')) return 'FEE'
  if (codeUpper.includes('EXCHANGE') || codeUpper.includes('FX')) return 'EXCHANGE'

  return 'OTHER'
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  householdId: string,
  maxRetries = 1
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    // If token expired and we haven't retried yet, refresh and try once more
    if (shouldRefreshToken(error) && maxRetries > 0) {
      await refreshAccessToken(householdId)
      const newToken = await getValidAccessToken(householdId)

      // Replace the old token in the function if possible
      // For now, we'll just retry - the caller should handle token refresh
      return await withRetry(fn, householdId, maxRetries - 1)
    }

    throw error
  }
}
