/**
 * Revolut Webhook Endpoint (Optional)
 * Handles real-time notifications from Revolut
 * Note: Only works if Revolut provides webhook support
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncRevolutTransactions, syncRevolutBalances } from '@/lib/revolut/sync'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.REVOLUT_WEBHOOK_SECRET

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret is configured
    if (!WEBHOOK_SECRET) {
      console.error('REVOLUT_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Get signature from headers
    const signature = request.headers.get('x-revolut-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get request body as text for signature verification
    const body = await request.text()

    // Verify signature
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload
    const event = JSON.parse(body)

    // Respond quickly to Revolut (process async)
    const response = NextResponse.json({ received: true }, { status: 200 })

    // Process webhook event in background
    processWebhookEvent(event).catch((error) => {
      console.error('Webhook processing error:', error)
    })

    return response
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Process webhook event asynchronously
 */
async function processWebhookEvent(event: any) {
  const { type, data } = event

  switch (type) {
    case 'transaction.created':
      await handleTransactionCreated(data)
      break

    case 'balance.updated':
      await handleBalanceUpdated(data)
      break

    case 'account.updated':
      await handleAccountUpdated(data)
      break

    default:
      console.log('Unknown webhook event type:', type)
  }
}

/**
 * Handle transaction.created event
 */
async function handleTransactionCreated(data: any) {
  try {
    const supabase = await createClient()
    const { accountId, transactionId } = data

    // Find household with this account
    const { data: pocket } = await supabase
      .from('pockets')
      .select('household_id')
      .eq('revolut_account_id', accountId)
      .single()

    if (!pocket) {
      console.log('No pocket found for account:', accountId)
      return
    }

    // Sync transactions for this household
    await syncRevolutTransactions(pocket.household_id)

    console.log('Transaction synced via webhook:', transactionId)
  } catch (error) {
    console.error('Error handling transaction.created:', error)
  }
}

/**
 * Handle balance.updated event
 */
async function handleBalanceUpdated(data: any) {
  try {
    const supabase = await createClient()
    const { accountId, balance } = data

    // Find and update pocket
    const { error } = await supabase
      .from('pockets')
      .update({
        current_balance: parseFloat(balance.amount),
        last_synced_at: new Date().toISOString(),
      })
      .eq('revolut_account_id', accountId)

    if (error) {
      console.error('Failed to update balance:', error)
      return
    }

    console.log('Balance updated via webhook:', accountId)
  } catch (error) {
    console.error('Error handling balance.updated:', error)
  }
}

/**
 * Handle account.updated event
 */
async function handleAccountUpdated(data: any) {
  try {
    const supabase = await createClient()
    const { accountId } = data

    // Find household with this account
    const { data: pocket } = await supabase
      .from('pockets')
      .select('household_id')
      .eq('revolut_account_id', accountId)
      .single()

    if (!pocket) {
      console.log('No pocket found for account:', accountId)
      return
    }

    // Sync balances for this household
    await syncRevolutBalances(pocket.household_id)

    console.log('Account synced via webhook:', accountId)
  } catch (error) {
    console.error('Error handling account.updated:', error)
  }
}
