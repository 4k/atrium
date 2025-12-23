-- Revolut Open Banking Integration Schema
-- Creates tables and columns for Revolut API integration

-- Table: revolut_connections
-- Stores OAuth tokens and connection metadata for each household
create table revolut_connections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  consent_id text,
  connected_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone,
  is_active boolean default true,

  -- Ensure one active connection per household
  unique(household_id, is_active)
);

-- Add columns to existing pockets table for Revolut account mapping
alter table pockets add column if not exists revolut_account_id text;
alter table pockets add column if not exists last_synced_at timestamp with time zone;

-- Add columns to existing transactions table for Revolut transaction tracking
alter table transactions add column if not exists revolut_transaction_id text unique;
alter table transactions add column if not exists merchant_name text;
alter table transactions add column if not exists is_imported boolean default false;

-- Table: sync_logs
-- Audit trail for all sync operations
create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  sync_type text not null check (sync_type in ('accounts', 'transactions', 'balances', 'all')),
  status text not null check (status in ('success', 'failed', 'partial')),
  records_synced integer default 0,
  error_message text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Enable Row Level Security
alter table revolut_connections enable row level security;
alter table sync_logs enable row level security;

-- RLS Policies for revolut_connections
-- Users can only access connections for their household
create policy "Users can view their household's Revolut connections"
  on revolut_connections for select
  using (
    household_id in (
      select household_id from persons where email = auth.email()
    )
  );

create policy "Users can insert Revolut connections for their household"
  on revolut_connections for insert
  with check (
    household_id in (
      select household_id from persons where email = auth.email()
    )
  );

create policy "Users can update their household's Revolut connections"
  on revolut_connections for update
  using (
    household_id in (
      select household_id from persons where email = auth.email()
    )
  );

create policy "Users can delete their household's Revolut connections"
  on revolut_connections for delete
  using (
    household_id in (
      select household_id from persons where email = auth.email()
    )
  );

-- RLS Policies for sync_logs
-- Users can only view sync logs for their household
create policy "Users can view their household's sync logs"
  on sync_logs for select
  using (
    household_id in (
      select household_id from persons where email = auth.email()
    )
  );

create policy "System can insert sync logs"
  on sync_logs for insert
  with check (true);

-- Indexes for performance
create index revolut_connections_household_id_idx on revolut_connections(household_id);
create index revolut_connections_expires_at_idx on revolut_connections(expires_at);
create index sync_logs_household_id_idx on sync_logs(household_id);
create index sync_logs_started_at_idx on sync_logs(started_at desc);
create index pockets_revolut_account_id_idx on pockets(revolut_account_id) where revolut_account_id is not null;
create index transactions_revolut_transaction_id_idx on transactions(revolut_transaction_id) where revolut_transaction_id is not null;

-- Comments for documentation
comment on table revolut_connections is 'Stores OAuth tokens and connection metadata for Revolut Open Banking integration';
comment on table sync_logs is 'Audit trail for Revolut data synchronization operations';
comment on column pockets.revolut_account_id is 'Revolut account ID for automatic balance syncing';
comment on column pockets.last_synced_at is 'Timestamp of last successful sync with Revolut';
comment on column transactions.revolut_transaction_id is 'Unique Revolut transaction ID for deduplication';
comment on column transactions.merchant_name is 'Merchant name from Revolut transaction data';
comment on column transactions.is_imported is 'True if transaction was automatically imported from Revolut';
