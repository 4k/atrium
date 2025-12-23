/**
 * Custom error classes for Revolut API integration
 */

export class RevolutError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'RevolutError'
  }
}

export class RevolutAuthError extends RevolutError {
  constructor(message: string, code?: string) {
    super(message, code, 401)
    this.name = 'RevolutAuthError'
  }
}

export class RevolutTokenExpiredError extends RevolutAuthError {
  constructor() {
    super('Access token has expired', 'TOKEN_EXPIRED')
    this.name = 'RevolutTokenExpiredError'
  }
}

export class RevolutConsentExpiredError extends RevolutError {
  constructor() {
    super('User consent has expired or been revoked', 'CONSENT_EXPIRED', 403)
    this.name = 'RevolutConsentExpiredError'
  }
}

export class RevolutRateLimitError extends RevolutError {
  constructor(
    public retryAfter?: number
  ) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429)
    this.name = 'RevolutRateLimitError'
  }
}

export class RevolutNetworkError extends RevolutError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR')
    this.name = 'RevolutNetworkError'
  }
}

export class RevolutValidationError extends RevolutError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'RevolutValidationError'
  }
}

/**
 * Type guard to check if error is a Revolut error
 */
export function isRevolutError(error: unknown): error is RevolutError {
  return error instanceof RevolutError
}

/**
 * Helper to determine if an error should trigger a token refresh
 */
export function shouldRefreshToken(error: unknown): boolean {
  if (error instanceof RevolutTokenExpiredError) {
    return true
  }
  if (error instanceof RevolutAuthError && error.code === 'invalid_token') {
    return true
  }
  return false
}

/**
 * Helper to determine if an error should trigger a reconnection prompt
 */
export function shouldPromptReconnect(error: unknown): boolean {
  return error instanceof RevolutConsentExpiredError
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isRevolutError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}
