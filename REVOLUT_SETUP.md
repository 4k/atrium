# Revolut Open Banking Integration Setup Guide

This guide will help you set up Revolut Open Banking API integration for your family budget dashboard.

## Prerequisites

1. A Revolut Business account with Open Banking API access
2. Registered application in Revolut Developer Portal

## Setup Steps

### 1. Register Your Application with Revolut

1. Go to [Revolut Developer Portal](https://developer.revolut.com/)
2. Create a new application
3. Select "Account Information" API
4. Configure OAuth redirect URI:
   - Development: `http://localhost:3000/api/revolut/callback`
   - Production: `https://yourdomain.com/api/revolut/callback`
5. Note your Client ID and Client Secret

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Revolut Configuration
REVOLUT_CLIENT_ID=your-client-id-from-revolut
REVOLUT_CLIENT_SECRET=your-client-secret-from-revolut
REVOLUT_REDIRECT_URI=http://localhost:3000/api/revolut/callback
REVOLUT_API_BASE_URL=https://sandbox-oba.revolut.com  # Use https://oba.revolut.com for production
```

### 3. Run Database Migrations

Apply the Revolut integration database schema:

```bash
# If using Supabase CLI
supabase db push

# Or manually apply the migration file
# supabase/migrations/20250101000005_add_revolut_integration.sql
```

This creates:
- `revolut_connections` table for storing OAuth tokens
- `sync_logs` table for tracking sync operations
- Additional columns in `pockets` and `transactions` tables

### 4. Deploy the Application

Build and deploy your Next.js application:

```bash
npm run build
npm run start
```

Or deploy to Vercel:

```bash
vercel deploy
```

### 5. Connect Your Revolut Account

1. Navigate to Settings page
2. Find the "Revolut Connection" card
3. Click "Connect Revolut"
4. Authorize the application in Revolut's OAuth flow
5. You'll be redirected back to your dashboard

### 6. Link Accounts to Pockets

1. After connecting, go to the Revolut Account Linker component
2. Map your Revolut accounts to existing pockets or create new ones
3. Linked accounts will sync automatically

## Features

### Automatic Syncing

- **Balances**: Real-time account balances
- **Transactions**: Automatic import of new transactions
- **Pockets**: Revolut Savings Pockets/Vaults support

### Manual Sync

Use the "Sync Now" button in the Revolut Connection Status card to trigger immediate sync.

### API Endpoints

- `GET /api/revolut/connect` - Initiate OAuth connection
- `GET /api/revolut/callback` - OAuth callback handler
- `POST /api/revolut/sync` - Manual sync trigger
- `GET /api/revolut/status` - Connection status
- `POST /api/revolut/disconnect` - Disconnect Revolut
- `POST /api/revolut/refresh` - Refresh access token

## Optional Features

### Scheduled Sync (Vercel Cron)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync-revolut",
    "schedule": "0 */4 * * *"
  }]
}
```

Set the cron secret in environment variables:

```bash
CRON_SECRET=your-random-secret
```

### Webhooks (if supported by Revolut)

Configure webhook URL in Revolut Developer Portal:

```
https://yourdomain.com/api/revolut/webhook
```

Set the webhook secret:

```bash
REVOLUT_WEBHOOK_SECRET=your-webhook-secret-from-revolut
```

## Security Considerations

✅ **Implemented:**
- Tokens stored server-side only
- Row Level Security (RLS) policies
- CSRF protection with state parameter
- Secure cookie handling
- Token refresh before expiry

⚠️ **Recommendations:**
- Use HTTPS in production
- Rotate secrets regularly
- Monitor sync logs for anomalies
- Enable Supabase Vault for token encryption (advanced)

## Troubleshooting

### Connection Failed

1. Verify environment variables are set correctly
2. Check Client ID and Client Secret match Revolut Developer Portal
3. Ensure redirect URI matches exactly (including protocol)

### Sync Errors

1. Check `sync_logs` table for error messages
2. Verify token hasn't expired (check `revolut_connections.expires_at`)
3. Ensure user still has valid consent in Revolut

### Token Expired

The system automatically refreshes tokens. If manual refresh needed:

```bash
curl -X POST http://localhost:3000/api/revolut/refresh
```

## Development vs Production

### Sandbox (Development)

```bash
REVOLUT_API_BASE_URL=https://sandbox-oba.revolut.com
```

- Use test accounts
- No real financial data
- API rate limits may differ

### Production

```bash
REVOLUT_API_BASE_URL=https://oba.revolut.com
```

- Real financial data
- Requires production credentials
- Higher security requirements

## Components

### Dashboard Components

Add to your dashboard layout:

```tsx
import { RevolutConnectionStatus } from '@/components/dashboard/revolut-connection-status'
import { RevolutSyncIndicator } from '@/components/dashboard/revolut-sync-indicator'
import { RevolutAccountLinker } from '@/components/dashboard/revolut-account-linker'

// In your dashboard
<RevolutConnectionStatus householdId={householdId} />
<RevolutAccountLinker householdId={householdId} />
<RevolutSyncIndicator householdId={householdId} variant="badge" />
```

## Support

For issues related to:
- **Revolut API**: Contact Revolut Developer Support
- **Integration code**: Check GitHub issues or documentation
- **Database**: Refer to Supabase documentation

## Next Steps

1. Test the connection in sandbox mode
2. Verify syncing works correctly
3. Switch to production credentials
4. Set up monitoring and alerts
5. Configure automatic sync schedule

---

**Note**: This integration uses PSD2-compliant Open Banking APIs. User consent is required and can be revoked at any time.
