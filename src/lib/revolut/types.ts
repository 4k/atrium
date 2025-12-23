/**
 * Type definitions for Revolut Open Banking API
 * Based on PSD2 Account Information Services specification
 */

export type RevolutAccount = {
  accountId: string
  currency: string
  accountType: 'CURRENT' | 'SAVINGS' | 'INVESTMENT' | 'LOAN' | 'OTHER'
  name: string
  balance: number
  details?: {
    iban?: string
    bic?: string
    sortCode?: string
    accountNumber?: string
  }
}

export type RevolutTransaction = {
  transactionId: string
  accountId: string
  amount: number
  currency: string
  type: 'CARD_PAYMENT' | 'CARD_REFUND' | 'TRANSFER' | 'ATM' | 'FEE' | 'EXCHANGE' | 'OTHER'
  description: string
  merchantName?: string
  category?: string
  bookingDateTime: string
  valueDateTime: string
  transactionInformation?: string
  counterparty?: {
    name?: string
    account?: string
  }
  creditDebitIndicator: 'CREDIT' | 'DEBIT'
}

export type RevolutBalance = {
  accountId: string
  amount: number
  currency: string
  creditDebitIndicator: 'CREDIT' | 'DEBIT'
  type: 'CLOSING_AVAILABLE' | 'CLOSING_BOOKED' | 'EXPECTED' | 'FORWARD_AVAILABLE' | 'INFORMATION' | 'INTERIM_AVAILABLE' | 'INTERIM_BOOKED' | 'OPENING_AVAILABLE' | 'OPENING_BOOKED' | 'PREVIOUSLY_CLOSED_BOOKED'
  dateTime: string
}

export type OAuthTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: 'Bearer'
  scope: string
}

export type RevolutConnection = {
  id: string
  household_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  consent_id: string | null
  connected_at: string
  last_synced_at: string | null
  is_active: boolean
}

export type SyncLog = {
  id: string
  household_id: string
  sync_type: 'accounts' | 'transactions' | 'balances' | 'all'
  status: 'success' | 'failed' | 'partial'
  records_synced: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}

export type SyncResult = {
  success: boolean
  recordsSynced: number
  errors?: string[]
}

/**
 * Revolut API Error Response
 */
export type RevolutApiError = {
  error: string
  error_description?: string
  code?: string
  message?: string
}

/**
 * API Endpoints Response Types
 */
export type AccountsResponse = {
  accounts: Array<{
    resourceId: string
    iban?: string
    currency: string
    name?: string
    product?: string
    cashAccountType?: string
    bic?: string
    balances?: Array<{
      balanceAmount: {
        amount: string
        currency: string
      }
      balanceType: string
      creditDebitIndicator?: 'CRDT' | 'DBIT'
      referenceDate?: string
    }>
  }>
}

export type TransactionsResponse = {
  transactions: {
    booked: Array<{
      transactionId: string
      bookingDate: string
      valueDate: string
      transactionAmount: {
        amount: string
        currency: string
      }
      creditDebitIndicator: 'CRDT' | 'DBIT'
      remittanceInformationUnstructured?: string
      additionalInformation?: string
      merchantCategoryCode?: string
      proprietaryBankTransactionCode?: string
      creditorName?: string
      debtorName?: string
      creditorAccount?: {
        iban?: string
      }
      debtorAccount?: {
        iban?: string
      }
    }>
    pending?: Array<{
      transactionId: string
      transactionAmount: {
        amount: string
        currency: string
      }
      creditDebitIndicator: 'CRDT' | 'DBIT'
      remittanceInformationUnstructured?: string
    }>
  }
}

export type BalancesResponse = {
  balances: Array<{
    balanceAmount: {
      amount: string
      currency: string
    }
    balanceType: string
    creditDebitIndicator?: 'CRDT' | 'DBIT'
    referenceDate?: string
  }>
}
