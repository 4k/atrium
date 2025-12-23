/**
 * Revolut Open Banking Integration
 * Main entry point for importing Revolut functionality
 */

// Client exports
export {
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessTokenDirect,
  getValidAccessToken,
  refreshAccessToken,
  getAccounts,
  getAccountBalance,
  getTransactions,
  withRetry,
} from './client'

// Sync exports
export {
  syncRevolutAccounts,
  syncRevolutTransactions,
  syncRevolutBalances,
  syncAll,
} from './sync'

// Type exports
export type {
  RevolutAccount,
  RevolutTransaction,
  RevolutBalance,
  OAuthTokenResponse,
  RevolutConnection,
  SyncLog,
  SyncResult,
  RevolutApiError,
  AccountsResponse,
  TransactionsResponse,
  BalancesResponse,
} from './types'

// Error exports
export {
  RevolutError,
  RevolutAuthError,
  RevolutTokenExpiredError,
  RevolutConsentExpiredError,
  RevolutRateLimitError,
  RevolutNetworkError,
  RevolutValidationError,
  isRevolutError,
  shouldRefreshToken,
  shouldPromptReconnect,
  getErrorMessage,
} from './errors'
