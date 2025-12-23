'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SyncIndicatorProps = {
  householdId: string
  variant?: 'badge' | 'button'
}

export function RevolutSyncIndicator({ householdId, variant = 'badge' }: SyncIndicatorProps) {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSyncStatus()
  }, [householdId])

  async function fetchSyncStatus() {
    try {
      const response = await fetch('/api/revolut/status')
      if (response.ok) {
        const data = await response.json()
        setLastSynced(data.lastSyncedAt)
        setError(data.latestSync?.status === 'failed')
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setError(false)

    try {
      const response = await fetch('/api/revolut/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      })

      if (response.ok) {
        await fetchSyncStatus()
        router.refresh()
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Failed to sync:', error)
      setError(true)
    } finally {
      setSyncing(false)
    }
  }

  if (variant === 'badge') {
    return (
      <Badge
        variant={error ? 'destructive' : 'secondary'}
        className="cursor-pointer"
        onClick={handleSync}
      >
        {syncing ? (
          <>
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Syncing...
          </>
        ) : error ? (
          <>
            <AlertCircle className="mr-1 h-3 w-3" />
            Sync failed
          </>
        ) : lastSynced ? (
          <>
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {formatRelativeTime(new Date(lastSynced))}
          </>
        ) : (
          <>
            <RefreshCw className="mr-1 h-3 w-3" />
            Never synced
          </>
        )}
      </Badge>
    )
  }

  return (
    <Button onClick={handleSync} disabled={syncing} size="sm" variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync Revolut'}
    </Button>
  )
}
