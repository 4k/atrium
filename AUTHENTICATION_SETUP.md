# Authentication Setup Guide

This application now includes Supabase Authentication with Row Level Security (RLS) for secure multi-tenant access.

## Features

- ✅ Email/Password Authentication
- ✅ Protected Routes (middleware-based)
- ✅ Row Level Security (RLS) policies
- ✅ User-specific household data
- ✅ Automatic session refresh
- ✅ Secure cookie-based sessions

## Quick Start

### 1. Run Database Migrations

Apply the authentication RLS policies to your Supabase database:

```bash
# Navigate to Supabase project
cd supabase

# Run the new migration
supabase db push
```

Or apply directly in Supabase SQL Editor:
- Run `/supabase/migrations/20250101000001_add_auth_rls.sql`

### 2. Enable Email Auth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Email** provider
4. Configure email templates (optional)
5. Set **Site URL** to your app URL (e.g., `http://localhost:3000`)
6. Add callback URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

### 3. Test Authentication

#### Create a Test Account

1. Start your dev server: `npm run dev`
2. Navigate to `/signup`
3. Create a new account:
   - Household Name: "Test Household"
   - Email: `test@example.com`
   - Password: `test1234`
4. Check your email for confirmation (if email confirmations are enabled)
5. Log in at `/login`

#### Demo Account

For testing, you can create a demo account with pre-populated data:

```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, user_metadata)
VALUES (
  'tony@example.com',
  crypt('demo1234', gen_salt('bf')),
  NOW(),
  '{"household_id": "YOUR_HOUSEHOLD_ID"}'::jsonb
);
```

## How It Works

### Authentication Flow

1. **Sign Up** (`/signup`)
   - Creates a new household
   - Registers user with `household_id` in metadata
   - Sends confirmation email

2. **Login** (`/login`)
   - Authenticates with email/password
   - Creates secure session cookie
   - Redirects to dashboard

3. **Session Management** (`middleware.ts`)
   - Automatically refreshes sessions
   - Protects routes requiring authentication
   - Redirects unauthenticated users to login

4. **Logout** (User Menu)
   - Clears session
   - Redirects to login page

### Row Level Security (RLS)

All database tables are protected with RLS policies that:
- Check `auth.user_household_id()` to verify user's household
- Only allow access to data belonging to user's household
- Prevent cross-household data leakage

Example policy:
```sql
CREATE POLICY "Users can view persons in their household"
  ON persons FOR SELECT
  USING (household_id = auth.user_household_id());
```

### Protected Routes

Routes automatically protected by middleware:
- `/` (home/dashboard)
- All dashboard tabs and features

Public routes:
- `/login`
- `/signup`
- `/auth/callback`

## File Structure

```
lib/supabase/
├── auth.ts              # Auth utilities and user fetching
├── middleware.ts        # Session management for Next.js middleware
├── client.ts            # Browser Supabase client
└── server.ts            # Server Supabase client

app/
├── login/page.tsx       # Login page with form
├── signup/page.tsx      # Signup page with household creation
├── auth/
│   ├── callback/route.ts   # OAuth callback handler
│   └── signout/route.ts    # Logout route handler
└── page.tsx             # Protected dashboard (requires auth)

middleware.ts            # Route protection and session refresh

supabase/migrations/
└── 20250101000001_add_auth_rls.sql  # RLS policies migration
```

## API Reference

### Auth Utilities

```typescript
// Get current user
import { getUser } from '@/lib/supabase/auth';
const { user, error } = await getUser();

// Get user's household
import { getUserHousehold } from '@/lib/supabase/auth';
const household = await getUserHousehold();
```

### Client-Side Auth

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Security Best Practices

### ✅ Implemented

- **RLS enabled** on all tables
- **Secure session cookies** with httpOnly flag
- **Automatic session refresh** via middleware
- **Protected routes** cannot be accessed without auth
- **User metadata** for household association
- **Server-side authentication** for data fetching

### 🔧 Recommended Enhancements

1. **Email Verification**
   - Enable in Supabase Auth settings
   - Customize email templates

2. **Password Requirements**
   - Enforce stronger passwords
   - Add password strength indicator

3. **Two-Factor Authentication**
   - Enable TOTP in Supabase
   - Add 2FA UI flow

4. **Rate Limiting**
   - Add rate limiting for login attempts
   - Use Supabase Edge Functions for custom logic

5. **Audit Logging**
   - Log authentication events
   - Track user actions for security

## Troubleshooting

### "User not found" on login
- Check if email confirmation is required
- Verify user exists in `auth.users` table
- Check Supabase Auth logs

### RLS policies blocking queries
- Verify user has `household_id` in metadata
- Check RLS policies in Supabase dashboard
- Test policy with Supabase SQL Editor

### Infinite redirect loop
- Clear browser cookies
- Check middleware configuration
- Verify callback URL is correct

### Session not persisting
- Check cookie settings
- Verify middleware is running
- Check browser console for errors

## Development Tips

### Bypass Auth for Development

To temporarily disable auth protection, comment out the middleware matcher:

```typescript
// middleware.ts
export const config = {
  matcher: [], // Disable middleware
}
```

**⚠️ Never deploy with auth disabled!**

### Reset User Password

```sql
-- Run in Supabase SQL Editor
UPDATE auth.users
SET encrypted_password = crypt('newpassword123', gen_salt('bf'))
WHERE email = 'user@example.com';
```

## Production Deployment

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-production-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   ```

2. **Configure Callback URLs**
   - Add production domain to Supabase Auth settings
   - Update redirect URIs

3. **Enable Email Templates**
   - Customize email templates in Supabase
   - Configure SMTP settings (optional)

4. **Set Up Custom Domain** (optional)
   - Configure custom auth domain in Supabase
   - Update environment variables

5. **Monitor Auth Events**
   - Check Supabase Auth logs
   - Set up error tracking (Sentry, etc.)

## Support

For issues or questions:
- Check Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Review Next.js SSR Guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Check project issues on GitHub
